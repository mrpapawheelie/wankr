import { ethers } from 'ethers';
import Bankr from '@bankr/sdk';

export interface SocialHandle {
  platform: 'x' | 'farcaster' | 'ens' | 'lens' | 'unstoppable';
  handle: string;
  verified: boolean;
  avatar?: string;
}

export interface WalletProfile {
  address: string;
  handles: SocialHandle[];
  primaryHandle?: string;
  lastUpdated: number;
}

export class WalletResolutionService {
  private cache: Map<string, WalletProfile> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Initialize BankrBot SDK (requires private key for signing)
    // For now, we'll skip BankrBot SDK and focus on other APIs
    console.log('BankrBot SDK requires private key for signing - using other APIs instead');
  }

  /**
   * Resolve wallet address to social handles
   */
  async resolveWallet(address: string): Promise<WalletProfile> {
    const normalizedAddress = address.toLowerCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedAddress);
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_DURATION) {
      return cached;
    }

    // Resolve from multiple sources (BankrBot only does handle → wallet, not wallet → handle)
    const handles = await Promise.allSettled([
      this.resolveFromFarcaster(normalizedAddress),
      this.resolveFromENS(normalizedAddress),
      this.resolveFromLens(normalizedAddress)
    ]);

    const allHandles: SocialHandle[] = [];
    handles.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allHandles.push(...result.value);
      }
    });

    const profile: WalletProfile = {
      address: normalizedAddress,
      handles: allHandles,
      primaryHandle: this.getPrimaryHandle(allHandles),
      lastUpdated: Date.now()
    };

    // Cache the result
    this.cache.set(normalizedAddress, profile);
    return profile;
  }

  /**
   * Resolve from BankrBot SDK (handle → wallet only)
   * Note: BankrBot can only look up wallet from handle, not handle from wallet
   */
  private async resolveFromBankrBot(address: string): Promise<SocialHandle[]> {
    try {
      console.log(`BankrBot can only resolve handle → wallet, not wallet → handle for ${address}`);
      console.log(`For wallet → handle resolution, we'll use other APIs (Farcaster, ENS, etc.)`);
      return [];
    } catch (error) {
      console.log(`BankrBot resolution failed for ${address}:`, error);
      return [];
    }
  }

  /**
   * Look up wallet from handle using BankrBot SDK
   * This is what BankrBot actually supports
   */
  async lookupWalletFromHandle(handle: string): Promise<string | null> {
    try {
      console.log(`Looking up wallet for handle: ${handle}`);
      console.log(`BankrBot SDK requires private key for signing - using direct API instead`);
      
      // For now, return null since we need private key for SDK
      // TODO: Implement direct API call or get private key
      return null;
    } catch (error) {
      console.log(`BankrBot lookup failed for handle ${handle}:`, error);
      return null;
    }
  }

  /**
   * Resolve from Farcaster API
   */
  private async resolveFromFarcaster(address: string): Promise<SocialHandle[]> {
    try {
      // Farcaster API endpoint
      const response = await fetch(`https://api.farcaster.xyz/v2/users?fid=${address}`, {
        headers: {
          'Authorization': `Bearer ${process.env.FARCASTER_API_KEY || ''}`
        }
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      if (data.users?.[0]?.username) {
        return [{
          platform: 'farcaster',
          handle: data.users[0].username,
          verified: true,
          avatar: data.users[0].pfp?.url
        }];
      }

      return [];
    } catch (error) {
      console.log(`Farcaster resolution failed for ${address}:`, error);
      return [];
    }
  }

  /**
   * Resolve from ENS
   */
  private async resolveFromENS(address: string): Promise<SocialHandle[]> {
    try {
      // Use ethers.js to resolve ENS
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
      const name = await provider.lookupAddress(address);
      
      if (name) {
        return [{
          platform: 'ens',
          handle: name,
          verified: true
        }];
      }

      return [];
    } catch (error) {
      console.log(`ENS resolution failed for ${address}:`, error);
      return [];
    }
  }

  /**
   * Resolve from Lens Protocol
   */
  private async resolveFromLens(address: string): Promise<SocialHandle[]> {
    try {
      // Lens API endpoint
      const response = await fetch(`https://api.lens.dev/profile/${address}`);
      
      if (!response.ok) return [];

      const data = await response.json() as any;
      if (data.handle) {
        return [{
          platform: 'lens',
          handle: data.handle,
          verified: true,
          avatar: data.picture?.original?.url
        }];
      }

      return [];
    } catch (error) {
      console.log(`Lens resolution failed for ${address}:`, error);
      return [];
    }
  }

  /**
   * Get the primary handle to display
   */
  private getPrimaryHandle(handles: SocialHandle[]): string | undefined {
    // Priority order: BankrBot > X > Farcaster > ENS > Lens
    const priority = ['x', 'farcaster', 'ens', 'lens'];
    
    for (const platform of priority) {
      const handle = handles.find(h => h.platform === platform);
      if (handle) {
        return this.formatHandle(handle);
      }
    }
    
    return undefined;
  }

  /**
   * Format handle for display
   */
  private formatHandle(handle: SocialHandle): string {
    switch (handle.platform) {
      case 'x':
        return `@${handle.handle}`;
      case 'farcaster':
        return `@${handle.handle}`;
      case 'ens':
        return handle.handle;
      case 'lens':
        return `@${handle.handle}`;
      default:
        return handle.handle;
    }
  }

  /**
   * Get display name for a wallet address
   */
  async getDisplayName(address: string): Promise<string> {
    const profile = await this.resolveWallet(address);
    
    if (profile.primaryHandle) {
      return profile.primaryHandle;
    }
    
    // Fallback to shortened address
    return this.shortenAddress(address);
  }

  /**
   * Shorten wallet address for display
   */
  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

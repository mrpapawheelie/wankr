import { ethers } from 'ethers';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export interface HandleResolution {
  address: string;
  displayName: string;
  source: 'x' | 'farcaster' | 'ens' | 'shortened';
  handle?: string;
  platform?: string;
  verified?: boolean;
  avatar?: string;
  lastUpdated: number;
}

export interface XBankrBotPost {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  postId: string;
}

export class HandleResolutionService {
  private cache: Map<string, HandleResolution> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly X_API_CALLS_PER_MONTH = 500;
  private xApiCallsUsed = 0;
  private neynarClient: NeynarAPIClient | null = null;
  private neynarLastCall = 0;
  private readonly NEYNAR_RATE_LIMIT = 6000; // 6 seconds between calls (10 per minute)

  constructor() {
    // Load cached API call count
    this.loadApiCallCount();
    
    // Initialize Neynar client if API key is available
    this.initializeNeynarClient();
  }

  /**
   * Initialize Neynar client if API key is available
   */
  private initializeNeynarClient(): void {
    const apiKey = process.env.NEYNAR_API_KEY;
    console.log('Initializing Neynar client with API key:', apiKey ? 'Present' : 'Missing');
    if (apiKey && apiKey !== 'your_neynar_api_key_here') {
      try {
        const config = new Configuration({
          apiKey: apiKey,
        });
        this.neynarClient = new NeynarAPIClient(config);
        console.log('Neynar client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Neynar client:', error);
        this.neynarClient = null;
      }
    } else {
      console.log('Neynar API key not found or not set');
      this.neynarClient = null;
    }
  }

  /**
   * Main method to resolve wallet address to display name
   * Priority: X (BankrBot) > Farcaster (Neynar) > ENS > Shortened Address
   */
  async resolveHandle(address: string): Promise<HandleResolution> {
    const normalizedAddress = address.toLowerCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedAddress);
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_DURATION) {
      return cached;
    }

    // Try resolution methods in priority order
    let resolution: HandleResolution | null = null;

    // 1. Try X (BankrBot posts) - if we have API calls left
    if (this.xApiCallsUsed < this.X_API_CALLS_PER_MONTH) {
      resolution = await this.resolveFromX(normalizedAddress);
      if (resolution) {
        this.cache.set(normalizedAddress, resolution);
        return resolution;
      }
    }

    // 2. Try Farcaster (Neynar API)
    resolution = await this.resolveFromFarcaster(normalizedAddress);
    if (resolution) {
      this.cache.set(normalizedAddress, resolution);
      return resolution;
    }

    // 3. Try ENS Resolution
    resolution = await this.resolveFromENS(normalizedAddress);
    if (resolution) {
      this.cache.set(normalizedAddress, resolution);
      return resolution;
    }

    // 4. Fallback to shortened address
    resolution = {
      address: normalizedAddress,
      displayName: this.shortenAddress(normalizedAddress),
      source: 'shortened',
      lastUpdated: Date.now()
    };

    this.cache.set(normalizedAddress, resolution);
    return resolution;
  }

  /**
   * Resolve multiple addresses in batch
   */
  async resolveMultipleHandles(addresses: string[]): Promise<HandleResolution[]> {
    const results = await Promise.allSettled(
      addresses.map(addr => this.resolveHandle(addr))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        address: 'unknown',
        displayName: 'Unknown',
        source: 'shortened',
        lastUpdated: Date.now()
      }
    );
  }

  /**
   * Resolve from X (BankrBot posts)
   */
  private async resolveFromX(address: string): Promise<HandleResolution | null> {
    try {
      const apiKey = process.env.X_API_KEY;
      if (!apiKey) {
        console.log('X API key not found');
        return null;
      }

      // Check if we have API calls left
      if (this.xApiCallsUsed >= this.X_API_CALLS_PER_MONTH) {
        console.log('X API monthly limit reached');
        return null;
      }

      console.log(`Searching X for BankrBot posts involving ${address}...`);
      
      // Search for BankrBot posts mentioning WANKR and this address
      const query = `from:bankrbot WANKR ${address}`;
      const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.xApiCallsUsed++;
      this.saveApiCallCount();

      if (!response.ok) {
        console.log(`X API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      const posts = data.data || [];

      // Parse BankrBot posts for handle information
      for (const post of posts) {
        const bankrBotPost = this.parseBankrBotPost(post.text, address);
        if (bankrBotPost) {
          return {
            address,
            displayName: `@${bankrBotPost.sender}`,
            source: 'x',
            handle: bankrBotPost.sender,
            platform: 'x',
            verified: true,
            lastUpdated: Date.now()
          };
        }
      }

      return null;
    } catch (error) {
      console.log(`X resolution failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Parse BankrBot post to extract sender/recipient information
   */
  private parseBankrBotPost(postText: string, targetAddress: string): XBankrBotPost | null {
    const patterns = [
      /@(\w+) sent (\d+) \$?WANKR to @(\w+)/i,
      /@(\w+) delivered (\d+) WANKR shame to @(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = postText.match(pattern);
      if (match) {
        const [, sender, amount, recipient] = match;
        const amountNum = parseInt(amount);
        
        // Only process amounts 1-1000
        if (amountNum >= 1 && amountNum <= 1000) {
          return {
            sender,
            recipient,
            amount: amountNum,
            timestamp: Date.now(),
            postId: 'unknown'
          };
        }
      }
    }

    return null;
  }

  /**
   * Resolve from Farcaster using Neynar API
   */
  private async resolveFromFarcaster(address: string): Promise<HandleResolution | null> {
    try {
      console.log(`Attempting Farcaster resolution for ${address}`);
      if (!this.neynarClient) {
        console.log('Neynar client not initialized');
        return null;
      }

      // Rate limiting for Neynar API
      const now = Date.now();
      const timeSinceLastCall = now - this.neynarLastCall;
      if (timeSinceLastCall < this.NEYNAR_RATE_LIMIT) {
        const waitTime = this.NEYNAR_RATE_LIMIT - timeSinceLastCall;
        console.log(`Rate limiting Neynar API call. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      console.log(`Looking up Farcaster handle for ${address} via Neynar...`);
      this.neynarLastCall = Date.now();
      
      // Use the official Neynar SDK as per their documentation
      const result = await this.neynarClient.fetchBulkUsersByEthOrSolAddress({
        addresses: [address]
      });

      console.log(`Neynar API result for ${address}:`, JSON.stringify(result, null, 2));

      // The result structure is { [address]: [user] }
      if (result && result[address] && result[address].length > 0) {
        const user = result[address][0];
        console.log(`Found Farcaster user: @${user.username} for ${address}`);
        
        return {
          address,
          displayName: `@${user.username}`,
          source: 'farcaster',
          handle: user.username,
          platform: 'farcaster',
          verified: true,
          avatar: user.pfp_url,
          lastUpdated: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.log(`Farcaster resolution failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Resolve from ENS using wagmi/chain
   */
  private async resolveFromENS(address: string): Promise<HandleResolution | null> {
    try {
      console.log(`Looking up ENS name for ${address}...`);
      
      // Use Infura for ENS resolution (Ethereum mainnet, not Base)
      const infuraUrl = process.env.INFURA_RPC_URL?.replace('base-mainnet', 'mainnet') || 'https://mainnet.infura.io/v3/your_project_id';
      const provider = new ethers.JsonRpcProvider(infuraUrl);
      const name = await provider.lookupAddress(address);
      
      if (name) {
        console.log(`Found ENS name: ${name} for ${address}`);
        return {
          address,
          displayName: name,
          source: 'ens',
          handle: name,
          platform: 'ens',
          verified: true,
          lastUpdated: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.log(`ENS resolution failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Shorten wallet address for display
   */
  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Save API call count to persist across restarts
   */
  private saveApiCallCount(): void {
    try {
      const data = {
        xApiCallsUsed: this.xApiCallsUsed,
        lastReset: Date.now()
      };
      // In a real implementation, save to database or file
      console.log(`X API calls used: ${this.xApiCallsUsed}/${this.X_API_CALLS_PER_MONTH}`);
    } catch (error) {
      console.error('Failed to save API call count:', error);
    }
  }

  /**
   * Load API call count from storage
   */
  private loadApiCallCount(): void {
    try {
      // In a real implementation, load from database or file
      // For now, reset monthly
      const lastReset = 0; // Load from storage
      const now = Date.now();
      const monthInMs = 30 * 24 * 60 * 60 * 1000;
      
      if (now - lastReset > monthInMs) {
        this.xApiCallsUsed = 0;
      }
    } catch (error) {
      console.error('Failed to load API call count:', error);
      this.xApiCallsUsed = 0;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get API usage statistics
   */
  getApiUsageStats(): { xApiCallsUsed: number; xApiCallsLimit: number; xApiCallsRemaining: number } {
    return {
      xApiCallsUsed: this.xApiCallsUsed,
      xApiCallsLimit: this.X_API_CALLS_PER_MONTH,
      xApiCallsRemaining: this.X_API_CALLS_PER_MONTH - this.xApiCallsUsed
    };
  }
}

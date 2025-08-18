import { CheckRegisterService } from './checkRegister';
import { RegisterService, RegisterEntry } from './register';
import { HandleResolutionFID } from './handleResolutionFID';
import { HandleResolutionBasenames } from './handleResolutionBasenames';

export interface HandleResolution {
  address: string;
  displayName: string;
  source: 'farcaster' | 'basenames' | 'shortened';
  handle?: string;
  platform?: string;
  verified?: boolean;
  avatar?: string;
  lastUpdated: number;
  refreshDue?: number;
  priority?: number; // Lower number = higher priority
}

export class HandleResolutionService {
  private cache: Map<string, HandleResolution> = new Map();
  private checkRegisterService: CheckRegisterService;
  private registerService: RegisterService;
  private fidResolver: HandleResolutionFID;
  private basenamesResolver: HandleResolutionBasenames;
  
  // Priority order for handle sources (lower number = higher priority)
  private readonly PRIORITY_ORDER = {
    'basenames': 1,    // Highest priority (on-chain, verified)
    'farcaster': 2,    // Medium priority (social, verified)
    'shortened': 3     // Lowest priority (fallback)
  };

  constructor(checkRegisterService?: CheckRegisterService, registerService?: RegisterService) {
    this.registerService = registerService || new RegisterService();
    this.checkRegisterService = checkRegisterService || new CheckRegisterService(this.registerService);
    this.fidResolver = new HandleResolutionFID();
    this.basenamesResolver = new HandleResolutionBasenames();
    
    // Listen to FID resolution events
    this.fidResolver.on('resolution', (resolution: any) => {
      this.updateCacheAndRegisterIfBetter(resolution.address, resolution);
    });
  }

  private registerEntryToHandleResolution(entry: RegisterEntry): HandleResolution {
    return {
      address: entry.address,
      displayName: entry.displayName,
      source: entry.source as 'farcaster' | 'shortened',
      handle: entry.handle,
      platform: entry.platform,
      verified: entry.verified,
      avatar: entry.avatar,
      lastUpdated: entry.lastUpdated,
      refreshDue: entry.refreshDue,
      priority: this.PRIORITY_ORDER[entry.source as keyof typeof this.PRIORITY_ORDER] || 3
    };
  }

  async resolveHandle(address: string): Promise<HandleResolution> {
    const normalizedAddress = address.toLowerCase();
    
    const cached = this.cache.get(normalizedAddress);
    if (cached) {
      return cached;
    }

    const registerEntry = this.checkRegisterService.checkRegister(normalizedAddress);
    if (registerEntry) {
      const resolution = this.registerEntryToHandleResolution(registerEntry);
      this.cache.set(normalizedAddress, resolution);
      return resolution;
    }

    // Provide immediate fallback first
    const fallbackResolution: HandleResolution = {
      address: normalizedAddress,
      displayName: this.shortenAddress(normalizedAddress),
      source: 'shortened',
      lastUpdated: Date.now(),
      priority: this.PRIORITY_ORDER.shortened
    };
    
    // Cache the fallback immediately
    this.cache.set(normalizedAddress, fallbackResolution);

    // Queue for background processing (non-blocking)
    this.queueForBackgroundProcessing(normalizedAddress);

    return fallbackResolution;
  }

  async resolveHandlesBulk(addresses: string[]): Promise<{ [address: string]: HandleResolution }> {
    const results: { [address: string]: HandleResolution } = {};

    // First pass: Check cache and register (fast, non-blocking)
    for (const address of addresses) {
      const normalizedAddress = address.toLowerCase();
      
      const cached = this.cache.get(normalizedAddress);
      if (cached) {
        results[normalizedAddress] = cached;
        continue;
      }

      const registerEntry = this.checkRegisterService.checkRegister(normalizedAddress);
      if (registerEntry) {
        const resolution = this.registerEntryToHandleResolution(registerEntry);
        results[normalizedAddress] = resolution;
        this.cache.set(normalizedAddress, resolution);
        continue;
      }

      // Provide immediate fallback
      const fallbackResolution: HandleResolution = {
        address: normalizedAddress,
        displayName: this.shortenAddress(normalizedAddress),
        source: 'shortened',
        lastUpdated: Date.now(),
        priority: this.PRIORITY_ORDER.shortened
      };
      results[normalizedAddress] = fallbackResolution;
      this.cache.set(normalizedAddress, fallbackResolution);
      
      // Queue for background processing
      this.queueForBackgroundProcessing(normalizedAddress);
    }

    return results;
  }

  /**
   * Queue address for background processing (non-blocking)
   */
  private queueForBackgroundProcessing(address: string): void {
    // Queue for Basenames processing (non-blocking)
    this.queueBasenamesProcessing(address);
    
    // Queue for Farcaster processing (non-blocking)
    this.fidResolver.queueForProcessing(address);
  }

  /**
   * Queue for Basenames processing
   */
  private async queueBasenamesProcessing(address: string): Promise<void> {
    // Process in background without blocking
    setImmediate(async () => {
      try {
        const basenamesResult = await this.basenamesResolver.resolveBasename(address);
        if (basenamesResult) {
          const resolution: HandleResolution = {
            address: address,
            displayName: basenamesResult.displayName,
            source: 'basenames',
            handle: basenamesResult.handle,
            platform: 'basenames',
            verified: basenamesResult.verified,
            lastUpdated: Date.now(),
            priority: this.PRIORITY_ORDER.basenames
          };
          
          this.updateCacheAndRegisterIfBetter(address, resolution);
        }
      } catch (error) {
        console.error('Basenames processing error:', error);
      }
    });
  }

  /**
   * Update cache and register only if the new resolution has higher priority
   */
  private updateCacheAndRegisterIfBetter(address: string, newResolution: HandleResolution): void {
    const normalizedAddress = address.toLowerCase();
    const currentResolution = this.cache.get(normalizedAddress);
    
    // Check if new resolution has higher priority (lower number)
    const shouldUpdate = !currentResolution || 
      (newResolution.priority || 3) < (currentResolution.priority || 3);
    
    if (shouldUpdate) {
      // Update cache
      this.cache.set(normalizedAddress, newResolution);
      
      // Add to register for future use
      this.registerService.addToRegister({
        address: address,
        displayName: newResolution.displayName,
        source: newResolution.source,
        handle: newResolution.handle,
        platform: newResolution.platform,
        verified: newResolution.verified,
        avatar: newResolution.avatar,
        lastUpdated: newResolution.lastUpdated,
        refreshDue: Date.now() + this.generateRandomTTL()
      });
      
      console.log(`✅ Updated handle for ${address}: ${newResolution.source} - ${newResolution.displayName}`);
    } else {
      console.log(`⏭️  Skipped lower priority handle for ${address}: ${newResolution.source} vs ${currentResolution?.source}`);
    }
  }

  async resolveMultipleHandles(addresses: string[]): Promise<HandleResolution[]> {
    const results = await Promise.allSettled(
      addresses.map(addr => this.resolveHandle(addr))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        address: 'unknown',
        displayName: 'Unknown',
        source: 'shortened',
        lastUpdated: Date.now(),
        priority: this.PRIORITY_ORDER.shortened
      }
    );
  }

  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private generateRandomTTL(): number {
    // Random TTL between 3-6 days (in milliseconds)
    const minDays = 3;
    const maxDays = 6;
    const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    return days * 24 * 60 * 60 * 1000;
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeFromCache(addresses: string[]): void {
    addresses.forEach(address => {
      const normalizedAddress = address.toLowerCase();
      this.cache.delete(normalizedAddress);
    });
  }

  /**
   * Get batch processing stats
   */
  getBatchStats(): { queueSize: number; isProcessing: boolean } {
    return this.fidResolver.getBatchStats();
  }

  /**
   * Force process the current batch (for testing)
   */
  async forceProcessBatch(): Promise<void> {
    await this.fidResolver.forceProcessBatch();
  }
}

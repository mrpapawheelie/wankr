// Future Farcaster (FID) handle resolution service
// This will be used when we want to re-enable Farcaster API calls

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { EventEmitter } from 'events';

export interface FIDHandleResolution {
  address: string;
  displayName: string;
  handle: string;
  platform: 'farcaster';
  verified: boolean;
  avatar?: string;
  twitterHandle?: string;
  lastUpdated: number;
}

export class HandleResolutionFID extends EventEmitter {
  private neynarClient: NeynarAPIClient | null = null;
  private neynarLastCall = 0;
  private readonly NEYNAR_RATE_LIMIT = 10000; // 10 seconds between calls
  
  // Bulk processing for Farcaster
  private addressQueue: Set<string> = new Set();
  private batchProcessingInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL = 60000; // 1 minute
  private readonly MAX_BATCH_SIZE = 50; // Max addresses per batch

  constructor() {
    super();
    this.initializeNeynarClient();
    this.startBatchProcessing();
  }

  /**
   * Initialize Neynar client if API key is available
   */
  private initializeNeynarClient(): void {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (apiKey && apiKey !== 'your_neynar_api_key_here') {
      try {
        const config = new Configuration({
          apiKey: apiKey,
        });
        this.neynarClient = new NeynarAPIClient(config);
      } catch (error) {
        console.error('Failed to initialize Neynar client:', error);
        this.neynarClient = null;
      }
    } else {
      this.neynarClient = null;
    }
  }

  /**
   * Start the batch processing timer
   */
  private startBatchProcessing(): void {
    this.batchProcessingInterval = setInterval(() => {
      this.processBatch();
    }, this.BATCH_INTERVAL);
  }

  /**
   * Stop the batch processing timer
   */
  private stopBatchProcessing(): void {
    if (this.batchProcessingInterval) {
      clearInterval(this.batchProcessingInterval);
      this.batchProcessingInterval = null;
    }
  }

  /**
   * Process the current batch of addresses
   */
  private async processBatch(): Promise<void> {
    if (this.addressQueue.size === 0) return;

    const addressesToProcess = Array.from(this.addressQueue);
    this.addressQueue.clear();

    console.log(`🔄 Processing Farcaster batch of ${addressesToProcess.length} addresses`);

    try {
      // Process addresses in chunks to respect API limits
      const chunks = this.chunkArray(addressesToProcess, this.MAX_BATCH_SIZE);
      
      for (const chunk of chunks) {
        await this.processAddressChunk(chunk);
        
        // Small delay between chunks to be respectful
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error processing Farcaster batch:', error);
    }
  }

  /**
   * Process a chunk of addresses
   */
  private async processAddressChunk(addresses: string[]): Promise<void> {
    if (!this.neynarClient) return;

    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - this.neynarLastCall;
      if (timeSinceLastCall < this.NEYNAR_RATE_LIMIT) {
        const waitTime = this.NEYNAR_RATE_LIMIT - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      this.neynarLastCall = Date.now();
      
      // Make bulk API call
      const result = await this.neynarClient.fetchBulkUsersByEthOrSolAddress({
        addresses: addresses
      });

      // Process results
      addresses.forEach(address => {
        const normalizedAddress = address.toLowerCase();
        
        if (result && result[normalizedAddress] && result[normalizedAddress].length > 0) {
          const user = result[normalizedAddress][0];
          
          // Extract Twitter handle from verified_accounts
          let twitterHandle: string | undefined;
          if (user.verified_accounts && Array.isArray(user.verified_accounts)) {
            const twitterAccount = user.verified_accounts.find(account => account.platform === 'x');
            if (twitterAccount) {
              twitterHandle = twitterAccount.username;
            }
          }
          
          console.log(`✅ Found Farcaster user: ${user.username} for ${address}`);
          
          // Emit event for external handling (cache/register updates)
          this.emit('resolution', {
            address,
            displayName: `@${user.username}`,
            handle: user.username,
            platform: 'farcaster',
            verified: true,
            avatar: user.pfp_url,
            twitterHandle,
            lastUpdated: Date.now(),
            source: 'farcaster',
            priority: 2 // Farcaster priority
          });
        } else {
          console.log(`❌ No Farcaster user found for ${address}`);
        }
      });
    } catch (error) {
      console.error('Farcaster batch resolution error:', error);
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Resolve Farcaster handle for a single address
   */
  async resolveFID(address: string): Promise<FIDHandleResolution | null> {
    const results = await this.resolveFIDBulk([address]);
    return results[address] || null;
  }

  /**
   * Resolve Farcaster handles for multiple addresses (bulk)
   */
  async resolveFIDBulk(addresses: string[]): Promise<{ [address: string]: FIDHandleResolution | null }> {
    const results: { [address: string]: FIDHandleResolution | null } = {};
    
    try {
      if (!this.neynarClient) {
        // Return null for all addresses if client not available
        addresses.forEach(addr => {
          results[addr.toLowerCase()] = null;
        });
        return results;
      }

      // Rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - this.neynarLastCall;
      if (timeSinceLastCall < this.NEYNAR_RATE_LIMIT) {
        const waitTime = this.NEYNAR_RATE_LIMIT - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      this.neynarLastCall = Date.now();
      
      // Make bulk API call
      const result = await this.neynarClient.fetchBulkUsersByEthOrSolAddress({
        addresses: addresses
      });

      // Process results
      addresses.forEach(address => {
        const normalizedAddress = address.toLowerCase();
        
        if (result && result[normalizedAddress] && result[normalizedAddress].length > 0) {
          const user = result[normalizedAddress][0];
          
          // Extract Twitter handle from verified_accounts
          let twitterHandle: string | undefined;
          if (user.verified_accounts && Array.isArray(user.verified_accounts)) {
            const twitterAccount = user.verified_accounts.find(account => account.platform === 'x');
            if (twitterAccount) {
              twitterHandle = twitterAccount.username;
            }
          }
          
          results[normalizedAddress] = {
            address,
            displayName: `@${user.username}`,
            handle: user.username,
            platform: 'farcaster',
            verified: true,
            avatar: user.pfp_url,
            twitterHandle,
            lastUpdated: Date.now()
          };
        } else {
          results[normalizedAddress] = null;
        }
      });

    } catch (error) {
      console.error('Farcaster resolution error:', error);
      // Return null for all addresses on error
      addresses.forEach(addr => {
        results[addr.toLowerCase()] = null;
      });
    }

    return results;
  }

  /**
   * Queue address for background processing
   */
  queueForProcessing(address: string): void {
    this.addressQueue.add(address.toLowerCase());
  }

  /**
   * Get batch processing stats
   */
  getBatchStats(): { queueSize: number; isProcessing: boolean } {
    return {
      queueSize: this.addressQueue.size,
      isProcessing: this.batchProcessingInterval !== null
    };
  }

  /**
   * Force process the current batch (for testing)
   */
  async forceProcessBatch(): Promise<void> {
    await this.processBatch();
  }
}

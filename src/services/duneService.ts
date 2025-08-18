import { DuneClient } from '@duneanalytics/client-sdk';
import { HandleResolutionService, HandleResolution } from './handleResolutionService';

export interface DuneLeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  transactionCount: number;
  totalWankr: string;
  period: 'all' | 'week' | 'day';
  source: HandleResolution['source']; // Use the source type from HandleResolution
}

export interface DuneLeaderboardData {
  received: DuneLeaderboardEntry[];
  sent: DuneLeaderboardEntry[];
}

interface CachedLeaderboardData {
  data: DuneLeaderboardData;
  lastUpdated: number;
}

export class DuneService {
  private duneClient: DuneClient;
  private handleResolver: HandleResolutionService;
  private leaderboardCache: CachedLeaderboardData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Query IDs from mrpapawheelie's dashboard
  private readonly SHAME_SOLDIERS_QUERY_ID = 5604868; // People sending WANKR
  private readonly SHAME_RECEIVED_QUERY_ID = 5604950; // People receiving WANKR

  constructor(handleResolver?: HandleResolutionService) {
    const apiKey = process.env.DUNE_API_KEY;
    if (!apiKey) {
      throw new Error('DUNE_API_KEY environment variable is required');
    }
    
    this.duneClient = new DuneClient(apiKey);
    this.handleResolver = handleResolver || new HandleResolutionService();
  }

  /**
   * Get shame soldiers leaderboard (people sending WANKR)
   */
  async getShameSoldiersLeaderboard(): Promise<DuneLeaderboardEntry[]> {
    // Check if we have cached data first
    if (this.leaderboardCache && Date.now() - this.leaderboardCache.lastUpdated < this.CACHE_DURATION) {
      return this.leaderboardCache.data.sent;
    }

    try {
      
      const result = await this.duneClient.getLatestResult({
        queryId: this.SHAME_SOLDIERS_QUERY_ID
      });

      if (!result.result || !result.result.rows) {

        return [];
      }

      // Extract all addresses first
      const addresses = result.result.rows
        .map((row: any) => (row.sender as string)?.toLowerCase())
        .filter((address: string) => address);
      
      // Bulk resolve all addresses at once
      const resolutions = await this.handleResolver.resolveHandlesBulk(addresses);

      // Build entries using resolved data
      const entries: DuneLeaderboardEntry[] = [];
      for (let i = 0; i < result.result.rows.length; i++) {
        const row = result.result.rows[i] as any;
        const address = (row.sender as string)?.toLowerCase();
        if (!address) continue;

        const resolution = resolutions[address];
        if (!resolution) continue;

        entries.push({
          rank: i + 1,
          address,
          displayName: resolution.displayName,
          transactionCount: parseInt(row.times_received as string) || 0,
          totalWankr: parseFloat((row.total_wankr_received as string) || '0').toFixed(0),
          period: 'all' as const,
          source: resolution.source
        });
      }

      return entries.filter(entry => entry !== null) as DuneLeaderboardEntry[];

    } catch (error) {
      console.error('Error fetching shame soldiers from Dune:', error);
      return [];
    }
  }

  /**
   * Get shame received leaderboard (people receiving WANKR)
   */
  async getShameReceivedLeaderboard(): Promise<DuneLeaderboardEntry[]> {
    // Check if we have cached data first
    if (this.leaderboardCache && Date.now() - this.leaderboardCache.lastUpdated < this.CACHE_DURATION) {
      return this.leaderboardCache.data.received;
    }

    try {
      
      const result = await this.duneClient.getLatestResult({
        queryId: this.SHAME_RECEIVED_QUERY_ID
      });

      if (!result.result || !result.result.rows) {
        return [];
      }

      // Extract all addresses first
      const addresses = result.result.rows
        .map((row: any) => (row.recipient as string)?.toLowerCase())
        .filter((address: string) => address);
      
      // Bulk resolve all addresses at once
      const resolutions = await this.handleResolver.resolveHandlesBulk(addresses);

      // Build entries using resolved data
      const entries: DuneLeaderboardEntry[] = [];
      for (let i = 0; i < result.result.rows.length; i++) {
        const row = result.result.rows[i] as any;
        const address = (row.recipient as string)?.toLowerCase();
        if (!address) continue;

        const resolution = resolutions[address];
        if (!resolution) continue;

        entries.push({
          rank: i + 1,
          address,
          displayName: resolution.displayName,
          transactionCount: parseInt(row.times_received as string) || 0,
          totalWankr: parseFloat((row.total_wankr_received as string) || '0').toFixed(0),
          period: 'all' as const,
          source: resolution.source
        });
      }

      return entries.filter(entry => entry !== null) as DuneLeaderboardEntry[];

    } catch (error) {
      console.error('Error fetching shame received from Dune:', error);
      return [];
    }
  }

  /**
   * Get both leaderboards with caching
   */
  async getLeaderboards(): Promise<DuneLeaderboardData> {
    // Check cache first
    if (this.leaderboardCache && Date.now() - this.leaderboardCache.lastUpdated < this.CACHE_DURATION) {
      return this.leaderboardCache.data;
    }
    
    const [received, sent] = await Promise.all([
      this.getShameReceivedLeaderboard(),
      this.getShameSoldiersLeaderboard()
    ]);

    const data: DuneLeaderboardData = { received, sent };
    
    // Cache the result
    this.leaderboardCache = {
      data,
      lastUpdated: Date.now()
    };

    return data;
  }

  /**
   * Test Dune API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.duneClient.getLatestResult({
        queryId: this.SHAME_SOLDIERS_QUERY_ID
      });
      

      return true;
    } catch (error) {
      console.error('Dune API connection failed:', error);
      return false;
    }
  }
}

import { DuneService, DuneLeaderboardEntry, DuneLeaderboardData } from './duneService';
import { HandleResolutionService, HandleResolution } from './handleResolutionService';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  transactionCount: number;
  totalWankr: string;
  period: 'all' | 'week' | 'day';
  source: HandleResolution['source']; // Use the source type from HandleResolution
}

export interface LeaderboardData {
  received: LeaderboardEntry[];
  sent: LeaderboardEntry[];
}

export class LeaderboardService {
  private duneService: DuneService;
  
  constructor(handleResolver?: HandleResolutionService) {
    this.duneService = new DuneService(handleResolver);
  }

  /**
   * Get shame received leaderboard
   */
  async getShameReceivedLeaderboard(period: 'all' | 'week' | 'day' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      // Use Dune service instead of blockchain polling
      const duneData = await this.duneService.getShameReceivedLeaderboard();
      
      // For now, ignore period filtering since Dune queries don't support it yet
      // TODO: Add time period support to Dune queries when needed
      
      return duneData;
    } catch (error) {
      console.error('Error getting shame received leaderboard:', error);
      return [];
    }
  }

  /**
   * Get shame soldiers leaderboard (senders)
   */
  async getShameSoldiersLeaderboard(period: 'all' | 'week' | 'day' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      // Use Dune service instead of blockchain polling
      const duneData = await this.duneService.getShameSoldiersLeaderboard();
      
      // For now, ignore period filtering since Dune queries don't support it yet
      // TODO: Add time period support to Dune queries when needed
      
      return duneData;
    } catch (error) {
      console.error('Error getting shame soldiers leaderboard:', error);
      return [];
    }
  }

  /**
   * Get both leaderboards at once
   */
  async getLeaderboards(period: 'all' | 'week' | 'day' = 'all'): Promise<LeaderboardData> {
    try {
      // Use Dune service instead of blockchain polling
      const duneData = await this.duneService.getLeaderboards();
      
      // For now, ignore period filtering since Dune queries don't support it yet
      // TODO: Add time period support to Dune queries when needed
      
      return duneData;
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      return { received: [], sent: [] };
    }
  }
}

import { ethers } from 'ethers';
import { HandleResolutionService } from './handleResolutionService';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  transactionCount: number;
  totalWankr: string;
  period: 'all' | 'week' | 'day';
  source: 'x' | 'farcaster' | 'ens' | 'shortened';
}

export interface LeaderboardData {
  received: LeaderboardEntry[];
  sent: LeaderboardEntry[];
}

export class LeaderboardService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private handleResolver: HandleResolutionService;
  private readonly WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07';
  private readonly WANKR_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'function getTopShameSoldiers() external view returns (tuple(address soldier, uint256 totalShameDelivered, uint256 lastShameTime, uint256 rank)[])'
  ];

  constructor(rpcUrl: string = 'https://mainnet.base.org', handleResolver?: HandleResolutionService) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(this.WANKR_CONTRACT_ADDRESS, this.WANKR_ABI, this.provider);
    this.handleResolver = handleResolver || new HandleResolutionService();
  }

  /**
   * Get shame received leaderboard
   */
  async getShameReceivedLeaderboard(period: 'all' | 'week' | 'day' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      const transfers = await this.getTransferEvents(period);
      
      // Group by recipient and sum amounts (1-1000 WANKR only)
      const receivedMap = new Map<string, { count: number; total: number }>();
      let shameTransactions = 0;
      
      for (const transfer of transfers) {
        const amount = parseFloat(ethers.formatUnits(transfer.value, 18));
        
        // Only count shame transactions (1-1000 WANKR)
        if (amount >= 1 && amount <= 1000) {
          shameTransactions++;
          const recipient = transfer.to.toLowerCase();
          const current = receivedMap.get(recipient) || { count: 0, total: 0 };
          current.count += 1;
          current.total += amount;
          receivedMap.set(recipient, current);
        }
      }
      


      // Convert to array and sort by total WANKR
      const entries = await Promise.all(
        Array.from(receivedMap.entries())
          .map(async ([address, data], index) => {
            const resolution = await this.handleResolver.resolveHandle(address);
            return {
              rank: index + 1,
              address,
              displayName: resolution.displayName,
              transactionCount: data.count,
              totalWankr: data.total.toFixed(0),
              period,
              source: resolution.source
            };
          })
      );

      // Sort by total WANKR (descending) and limit to top 50
      return entries
        .sort((a, b) => parseFloat(b.totalWankr) - parseFloat(a.totalWankr))
        .slice(0, 50)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

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
      const transfers = await this.getTransferEvents(period);
      
      // Group by sender and sum amounts (1-1000 WANKR only)
      const sentMap = new Map<string, { count: number; total: number }>();
      
      for (const transfer of transfers) {
        const amount = parseFloat(ethers.formatUnits(transfer.value, 18));
        
        // Only count shame transactions (1-1000 WANKR)
        if (amount >= 1 && amount <= 1000) {
          const sender = transfer.from.toLowerCase();
          const current = sentMap.get(sender) || { count: 0, total: 0 };
          current.count += 1;
          current.total += amount;
          sentMap.set(sender, current);
        }
      }

      // Convert to array and sort by total WANKR
      const entries = await Promise.all(
        Array.from(sentMap.entries())
          .map(async ([address, data], index) => {
            const resolution = await this.handleResolver.resolveHandle(address);
            return {
              rank: index + 1,
              address,
              displayName: resolution.displayName,
              transactionCount: data.count,
              totalWankr: data.total.toFixed(0),
              period,
              source: resolution.source
            };
          })
      );

      // Sort by total WANKR (descending) and limit to top 50
      return entries
        .sort((a, b) => parseFloat(b.totalWankr) - parseFloat(a.totalWankr))
        .slice(0, 50)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    } catch (error) {
      console.error('Error getting shame soldiers leaderboard:', error);
      return [];
    }
  }

  /**
   * Get transfer events for the specified time period
   */
  private async getTransferEvents(period: 'all' | 'week' | 'day'): Promise<any[]> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      // Calculate block range based on period - use same logic as shame feed
      let fromBlock: number;
      
      switch (period) {
        case 'day':
          fromBlock = currentBlock - 43200; // ~1 day
          break;
        case 'week':
          fromBlock = currentBlock - (43200 * 7); // ~1 week
          break;
        case 'all':
        default:
          fromBlock = currentBlock - 5000; // Same as shame feed for consistency
          break;
      }

      const filter = {
        address: this.WANKR_CONTRACT_ADDRESS,
        topics: [
          ethers.id('Transfer(address,address,uint256)')
        ],
        fromBlock: fromBlock,
        toBlock: currentBlock
      };

      const logs = await this.provider.getLogs(filter);
      
      const transfers = logs.map(log => {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        return {
          from: decoded?.args?.[0] || 'Unknown',
          to: decoded?.args?.[1] || 'Unknown',
          value: decoded?.args?.[2] || 0,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        };
      });

      return transfers;

    } catch (error) {
      console.error('Error getting transfer events:', error);
      return [];
    }
  }

  /**
   * Get both leaderboards
   */
  async getLeaderboards(period: 'all' | 'week' | 'day' = 'all'): Promise<LeaderboardData> {
    const [received, sent] = await Promise.all([
      this.getShameReceivedLeaderboard(period),
      this.getShameSoldiersLeaderboard(period)
    ]);

    return { received, sent };
  }
}

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { HandleResolutionService } from './handleResolutionService';

// WANKR Contract Configuration
const WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07';

// Contract ABI for events we need to monitor
const WANKR_ABI = [
  'event ShameDelivered(address indexed from, address indexed to, uint256 amount, string reason)',
  'event ShameSoldierRanked(address indexed soldier, uint256 totalShameDelivered, uint256 rank)',
  'event SpectralJudgment(address indexed target, uint8 judgment, string reason)',
  'function getShameHistory() view returns (tuple(address from, address to, uint256 amount, uint256 timestamp, string reason)[])',
  'function getTopShameSoldiers() view returns (tuple(address soldier, uint256 totalShameDelivered, uint256 lastShameTime, uint256 rank)[])'
];

export interface ShameTransaction {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  reason: string;
  transactionHash?: string;
  blockNumber?: number;
  judgment?: number;
  fromDisplayName?: string;
  toDisplayName?: string;
  fromSource?: 'x' | 'farcaster' | 'ens' | 'shortened';
  toSource?: 'x' | 'farcaster' | 'ens' | 'shortened';
}

export interface ShameSoldier {
  soldier: string;
  totalShameDelivered: string;
  lastShameTime: number;
  rank: number;
}

export class ShameFeedService extends EventEmitter {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private handleResolver: HandleResolutionService;
  private isMonitoring: boolean = false;
  private lastProcessedBlock: number = 0;
  private shameHistory: ShameTransaction[] = [];
  private topSoldiers: ShameSoldier[] = [];

  constructor(rpcUrl: string = 'https://mainnet.base.org') {
    super();
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(WANKR_CONTRACT_ADDRESS, WANKR_ABI, this.provider);
    this.handleResolver = new HandleResolutionService();
  }

  /**
   * Start monitoring the WANKR contract for shame events
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🎭 Starting WANKR shame feed monitoring...');

    // Get current block number
    const currentBlock = await this.provider.getBlockNumber();
    this.lastProcessedBlock = currentBlock - 1000; // Start from 1000 blocks ago

    // Load initial data
    await this.loadInitialData();

    // For now, use polling-only mode to avoid filter errors
    // Event monitoring can be re-enabled later when we have a more stable setup
    console.log('🔄 Using polling-only mode for stability');
    this.startPollingOnly();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🛑 Stopped WANKR shame feed monitoring');
  }

  /**
   * Load initial shame history and leaderboard
   */
  private async loadInitialData() {
    try {
      // Check if the contract has our custom functions
      const hasCustomFunctions = await this.checkContractCapabilities();
      
      if (hasCustomFunctions) {
        // Load recent shame history
        const history = await this.contract.getShameHistory();
        this.shameHistory = history.map((tx: any) => ({
          from: tx.from,
          to: tx.to,
          amount: ethers.formatUnits(tx.amount, 18),
          timestamp: Number(tx.timestamp),
          reason: tx.reason
        })).slice(-50); // Keep last 50 transactions

        // Load top shame soldiers
        const soldiers = await this.contract.getTopShameSoldiers();
        this.topSoldiers = soldiers.map((soldier: any) => ({
          soldier: soldier.soldier,
          totalShameDelivered: ethers.formatUnits(soldier.totalShameDelivered, 18),
          lastShameTime: Number(soldier.lastShameTime),
          rank: Number(soldier.rank)
        }));
      } else {
        // Fallback: Load recent transfer events
        await this.loadRecentTransfers();
      }

      // Emit initial data
      this.emit('initialData', {
        shameHistory: this.shameHistory,
        topSoldiers: this.topSoldiers
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback to basic transfer monitoring
      await this.loadRecentTransfers();
    }
  }

  /**
   * Check if the contract has our custom functions
   */
  private async checkContractCapabilities(): Promise<boolean> {
    try {
      // Try to call a custom function to see if it exists
      await this.contract.getShameHistory();
      return true;
    } catch (error) {
      console.log('Contract does not have custom shame functions, using basic transfer monitoring');
      return false;
    }
  }

  /**
   * Load recent transfer events as fallback
   */
  private async loadRecentTransfers() {
    try {
      // Get recent transfer events
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = currentBlock - 5000; // Last 5000 blocks (increased to find more transactions)
      
      // Use provider to get logs directly since contract.filters might not work
      const filter = {
        address: WANKR_CONTRACT_ADDRESS,
        topics: [
          ethers.id('Transfer(address,address,uint256)') // Transfer event signature
        ],
        fromBlock: fromBlock,
        toBlock: currentBlock
      };
      
      const logs = await this.provider.getLogs(filter);
      
      console.log(`Found ${logs.length} total transfer logs in last 5000 blocks`);
      
      const filteredLogs = logs.slice(-20).filter((log: any) => {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        const amount = parseFloat(ethers.formatUnits(decoded?.args?.[2] || 0, 18));
        return amount > 0 && amount <= 10000; // Show transactions up to 10,000 WANKR (good for shame feed)
      });

      // Resolve handles for filtered transactions
      this.shameHistory = await Promise.all(filteredLogs.map(async (log: any) => {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        
        const from = decoded?.args?.[0] || 'Unknown';
        const to = decoded?.args?.[1] || 'Unknown';
        
        // Resolve display names
        const [fromResolution, toResolution] = await Promise.all([
          this.handleResolver.resolveHandle(from),
          this.handleResolver.resolveHandle(to)
        ]);
        
        return {
          from,
          to,
          amount: ethers.formatUnits(decoded?.args?.[2] || 0, 18),
          timestamp: Math.floor(Date.now() / 1000), // Approximate
          reason: '',
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          fromDisplayName: fromResolution.displayName,
          toDisplayName: toResolution.displayName,
          fromSource: fromResolution.source,
          toSource: toResolution.source
        };
      }));

      console.log(`Loaded ${this.shameHistory.length} recent transfers`);
    } catch (error) {
      console.error('Error loading recent transfers:', error);
      this.shameHistory = [];
    }
  }

  /**
   * Monitor contract events in real-time
   */
  private monitorEvents() {
    try {
      // Check if contract has custom events
      const hasCustomEvents = this.contract.interface.hasEvent('ShameDelivered');
      
      if (hasCustomEvents) {
        this.monitorCustomEvents();
      } else {
        this.monitorTransferEvents();
      }
    } catch (error) {
      console.log('Falling back to transfer event monitoring');
      this.monitorTransferEvents();
    }
  }

  /**
   * Monitor events with error handling and retry logic
   */
  private monitorEventsWithRetry() {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptMonitoring = () => {
      try {
        this.monitorEvents();
        retryCount = 0; // Reset on success
      } catch (error) {
        retryCount++;
        console.error(`Event monitoring attempt ${retryCount} failed:`, error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying event monitoring in 5 seconds... (${retryCount}/${maxRetries})`);
          setTimeout(attemptMonitoring, 5000);
        } else {
          console.log('Max retries reached, falling back to polling only');
          this.fallbackToPollingOnly();
        }
      }
    };

    attemptMonitoring();
  }

  /**
   * Monitor custom shame events
   */
  private monitorCustomEvents() {
    // Listen for ShameDelivered events
    this.contract.on('ShameDelivered', async (from: string, to: string, amount: bigint, reason: string, event: any) => {
      if (!this.isMonitoring) return;

      const shameTx: ShameTransaction = {
        from,
        to,
        amount: ethers.formatUnits(amount, 18),
        timestamp: Math.floor(Date.now() / 1000),
        reason,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      };

      this.addShameTransaction(shameTx);
      console.log(`🎭 New shame delivered: ${from} → ${to} (${shameTx.amount} WANKR)`);
    });

    // Listen for ShameSoldierRanked events
    this.contract.on('ShameSoldierRanked', async (soldier: string, totalShameDelivered: bigint, rank: bigint) => {
      if (!this.isMonitoring) return;
      await this.updateLeaderboard();
      console.log(`🏆 Shame soldier ranked: ${soldier} at rank ${rank}`);
    });

    // Listen for SpectralJudgment events
    this.contract.on('SpectralJudgment', async (target: string, judgment: number, reason: string) => {
      if (!this.isMonitoring) return;
      this.updateShameJudgment(target, judgment);
      console.log(`⚖️ Spectral judgment: ${target} rated ${judgment}/10`);
    });
  }

  /**
   * Monitor basic transfer events as fallback
   */
  private monitorTransferEvents() {
    try {
      this.contract.on('Transfer', async (from: string, to: string, amount: bigint, event: any) => {
        if (!this.isMonitoring) return;
        
        // Skip zero address transfers (minting/burning)
        if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) return;

        const shameTx: ShameTransaction = {
          from,
          to,
          amount: ethers.formatUnits(amount, 18),
          timestamp: Math.floor(Date.now() / 1000),
          reason: 'Transfer detected',
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };

        await this.addShameTransaction(shameTx);
        console.log(`💸 New transfer: ${from} → ${to} (${shameTx.amount} WANKR)`);
      });
    } catch (error) {
      console.error('Error setting up transfer event monitoring:', error);
      throw error;
    }
  }

  /**
   * Fallback to polling only when event monitoring fails
   */
  private fallbackToPollingOnly() {
    console.log('🔄 Switching to polling-only mode');
    this.isMonitoring = true;
    
    // Increase polling frequency when events fail
    this.startPollingOnly();
  }

  /**
   * Start polling-only mode with higher frequency
   */
  private startPollingOnly() {
    // Poll every 10 seconds instead of 30
    setInterval(async () => {
      if (!this.isMonitoring) return;

      try {
        await this.checkForNewTransactions();
      } catch (error) {
        console.error('Error in polling-only mode:', error);
      }
    }, 60000); // Changed from 10 seconds to 60 seconds (1 minute) to help with rate limiting
  }

  /**
   * Add shame transaction to history
   */
  private async addShameTransaction(shameTx: ShameTransaction) {
    // Only add transactions of 1000 WANKR or less (filter out traders)
    const amount = parseFloat(shameTx.amount);
    if (amount > 1000) {
      console.log(`🚫 Filtered out large transaction: ${shameTx.amount} WANKR (${shameTx.from} → ${shameTx.to})`);
      return;
    }
    
    // Skip zero-amount transactions (not real shame deliveries)
    if (amount === 0) {
      console.log(`🚫 Filtered out zero-amount transaction: ${shameTx.from} → ${shameTx.to}`);
      return;
    }

    // Resolve wallet addresses to display names
    try {
      const [fromResolution, toResolution] = await Promise.all([
        this.handleResolver.resolveHandle(shameTx.from),
        this.handleResolver.resolveHandle(shameTx.to)
      ]);

      // Add resolved display names to the transaction
      const enrichedShameTx = {
        ...shameTx,
        fromDisplayName: fromResolution.displayName,
        toDisplayName: toResolution.displayName,
        fromSource: fromResolution.source,
        toSource: toResolution.source
      };

      // Add to history
      this.shameHistory.unshift(enrichedShameTx);
      if (this.shameHistory.length > 100) {
        this.shameHistory = this.shameHistory.slice(0, 100);
      }

      // Emit events
      this.emit('newShame', enrichedShameTx);
      this.emit('shameHistoryUpdate', this.shameHistory);
    } catch (error) {
      console.error('Error resolving wallet handles:', error);
      
      // Fallback: add without display names
      this.shameHistory.unshift(shameTx);
      if (this.shameHistory.length > 100) {
        this.shameHistory = this.shameHistory.slice(0, 100);
      }

      this.emit('newShame', shameTx);
      this.emit('shameHistoryUpdate', this.shameHistory);
    }
  }

  /**
   * Update shame judgment
   */
  private updateShameJudgment(target: string, judgment: number) {
    const recentShame = this.shameHistory.find(tx => tx.to.toLowerCase() === target.toLowerCase());
    if (recentShame) {
      recentShame.judgment = judgment;
      this.emit('shameHistoryUpdate', this.shameHistory);
    }
  }

  /**
   * Polling as backup method
   */
  private startPolling() {
    setInterval(async () => {
      if (!this.isMonitoring) return;

      try {
        const currentBlock = await this.provider.getBlockNumber();
        
        // Check for new blocks
        if (currentBlock > this.lastProcessedBlock) {
          await this.checkForNewTransactions();
          this.lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        console.error('Error in polling:', error);
        // If polling fails, try to restart event monitoring
        this.restartEventMonitoring();
      }
    }, 30000); // Poll every 30 seconds
  }

  /**
   * Restart event monitoring if it fails
   */
  private restartEventMonitoring() {
    try {
      console.log('Restarting event monitoring...');
      this.contract.removeAllListeners();
      this.monitorEvents();
    } catch (error) {
      console.error('Failed to restart event monitoring:', error);
      // If restart fails, switch to polling only
      this.fallbackToPollingOnly();
    }
  }

  /**
   * Handle filter errors gracefully
   */
  private handleFilterError(error: any) {
    if (error?.error?.message === 'filter not found') {
      console.log('🔄 Filter expired, restarting event monitoring...');
      this.restartEventMonitoring();
    } else {
      console.error('Event monitoring error:', error);
    }
  }

  /**
   * Check for new transactions manually
   */
  private async checkForNewTransactions() {
    try {
      // Check if we have custom functions
      const hasCustomFunctions = await this.checkContractCapabilities();
      
      if (hasCustomFunctions) {
        await this.checkCustomTransactions();
      } else {
        await this.checkTransferTransactions();
      }
    } catch (error) {
      console.error('Error checking for new transactions:', error);
    }
  }

  /**
   * Check for new custom shame transactions
   */
  private async checkCustomTransactions() {
    try {
      const history = await this.contract.getShameHistory();
      const newTransactions = history.filter((tx: any) => 
        Number(tx.timestamp) > Math.floor(Date.now() / 1000) - 60 // Last minute
      );

      for (const tx of newTransactions) {
        const shameTx: ShameTransaction = {
          from: tx.from,
          to: tx.to,
          amount: ethers.formatUnits(tx.amount, 18),
          timestamp: Number(tx.timestamp),
          reason: tx.reason
        };

        // Check if we already have this transaction
        const exists = this.shameHistory.find(existing => 
          existing.from === shameTx.from && 
          existing.to === shameTx.to && 
          existing.timestamp === shameTx.timestamp
        );

        if (!exists) {
          await this.addShameTransaction(shameTx);
        }
      }
    } catch (error) {
      console.error('Error checking custom transactions:', error);
    }
  }

  /**
   * Check for new transfer transactions
   */
  private async checkTransferTransactions() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock + 1;
      
      if (fromBlock > currentBlock) return;

      // Use provider to get logs directly
      const filter = {
        address: WANKR_CONTRACT_ADDRESS,
        topics: [
          ethers.id('Transfer(address,address,uint256)') // Transfer event signature
        ],
        fromBlock: fromBlock,
        toBlock: currentBlock
      };
      
      const logs = await this.provider.getLogs(filter);
      
      for (const log of logs) {
        // Decode the log data
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        
        const from = decoded?.args?.[0] || 'Unknown';
        const to = decoded?.args?.[1] || 'Unknown';
        const value = decoded?.args?.[2] || 0;
        
        // Skip zero address transfers
        if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) continue;

        // Skip large transactions (over 1000 WANKR) and zero amounts
        const amount = parseFloat(ethers.formatUnits(value, 18));
        if (amount > 1000) {
          console.log(`🚫 Filtered out large transaction: ${amount} WANKR (${from} → ${to})`);
          continue;
        }
        if (amount === 0) {
          console.log(`🚫 Filtered out zero-amount transaction: ${from} → ${to}`);
          continue;
        }

                               const shameTx: ShameTransaction = {
                         from,
                         to,
                         amount: ethers.formatUnits(value, 18),
                         timestamp: Math.floor(Date.now() / 1000),
                         reason: '',
                         transactionHash: log.transactionHash,
                         blockNumber: log.blockNumber
                       };

        // Check if we already have this transaction
        const exists = this.shameHistory.find(existing => 
          existing.transactionHash === shameTx.transactionHash
        );

        if (!exists) {
          await this.addShameTransaction(shameTx);
        }
      }
      
      this.lastProcessedBlock = currentBlock;
    } catch (error) {
      console.error('Error checking transfer transactions:', error);
    }
  }

  /**
   * Update leaderboard data
   */
  private async updateLeaderboard() {
    try {
      const soldiers = await this.contract.getTopShameSoldiers();
      this.topSoldiers = soldiers.map((soldier: any) => ({
        soldier: soldier.soldier,
        totalShameDelivered: ethers.formatUnits(soldier.totalShameDelivered, 18),
        lastShameTime: Number(soldier.lastShameTime),
        rank: Number(soldier.rank)
      }));

      this.emit('leaderboardUpdate', this.topSoldiers);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  /**
   * Get current shame history
   */
  getShameHistory(): ShameTransaction[] {
    return this.shameHistory;
  }

  /**
   * Get current top soldiers
   */
  getTopSoldiers(): ShameSoldier[] {
    return this.topSoldiers;
  }

  /**
   * Get shame statistics
   */
  getShameStats() {
    const totalShames = this.shameHistory.length;
    const totalAmount = this.shameHistory.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const uniqueShamers = new Set(this.shameHistory.map(tx => tx.from)).size;
    const uniqueShamed = new Set(this.shameHistory.map(tx => tx.to)).size;

    return {
      totalShames,
      totalAmount: totalAmount.toFixed(2),
      uniqueShamers,
      uniqueShamed,
      averageJudgment: this.shameHistory
        .filter(tx => tx.judgment)
        .reduce((sum, tx) => sum + (tx.judgment || 0), 0) / 
        this.shameHistory.filter(tx => tx.judgment).length || 0
    };
  }
}

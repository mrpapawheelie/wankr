import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { HandleResolutionService, HandleResolution } from './handleResolutionService';

// WANKR Contract Configuration
const WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07';

// Contract ABI for events we need to monitor
const WANKR_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
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
  fromSource?: 'farcaster' | 'basenames' | 'shortened';
  toSource?: 'farcaster' | 'basenames' | 'shortened';
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
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(rpcUrl: string = 'https://mainnet.base.org', handleResolver?: HandleResolutionService) {
    super();
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(WANKR_CONTRACT_ADDRESS, WANKR_ABI, this.provider);
    this.handleResolver = handleResolver || new HandleResolutionService();
  }

  /**
   * Start monitoring the WANKR contract for shame events
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;

    // Get current block number
    const currentBlock = await this.provider.getBlockNumber();
    this.lastProcessedBlock = currentBlock - 1000; // Start from 1000 blocks ago

    // Load initial data
    await this.loadInitialData();

    // Start polling
    this.startPolling();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
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
      const fromBlock = currentBlock - 300; // Reduced from 2000 to 300 blocks (~10 minutes)
      
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
      

      
      // Filter and limit to last 20 transactions
      const filteredLogs = logs.slice(-20).filter((log: any) => {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        const amount = parseFloat(ethers.formatUnits(decoded?.args?.[2] || 0, 18));
        const roundedAmount = Math.round(amount);
        return roundedAmount >= 1 && (roundedAmount <= 10 || roundedAmount === 69); // Show transactions >= 1 AND (≤ 10 WANKR OR exactly 69 WANKR)
      });

      // Load transactions without handle resolution initially (for performance)
      this.shameHistory = filteredLogs.map((log: any) => {
        const iface = new ethers.Interface([
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ]);
        const decoded = iface.parseLog(log);
        
        const from = decoded?.args?.[0] || 'Unknown';
        const to = decoded?.args?.[1] || 'Unknown';
        const rawAmount = parseFloat(ethers.formatUnits(decoded?.args?.[2] || 0, 18));
        const roundedAmount = Math.round(rawAmount);
        
        return {
          from,
          to,
          amount: roundedAmount.toString(), // Use rounded amount for display
          timestamp: Math.floor(Date.now() / 1000), // Approximate
          reason: '',
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          fromDisplayName: this.shortenAddress(from),
          toDisplayName: this.shortenAddress(to),
          fromSource: 'shortened' as const,
          toSource: 'shortened' as const
        };
      });

      // Now resolve handles for the loaded transactions

      for (const transaction of this.shameHistory) {
        // Provide immediate fallbacks
        transaction.fromDisplayName = this.shortenAddress(transaction.from);
        transaction.toDisplayName = this.shortenAddress(transaction.to);
        transaction.fromSource = 'shortened';
        transaction.toSource = 'shortened';
        
        // Process handle resolution in background (non-blocking)
        this.resolveHandlesInBackground(transaction);
      }


    } catch (error) {
      console.error('Error loading recent transfers:', error);
      this.shameHistory = [];
    }
  }

  /**
   * Start polling for new transactions
   */
  private startPolling() {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll every 60 seconds
    this.pollingInterval = setInterval(async () => {
      if (!this.isMonitoring) return;

      try {
        await this.checkForNewTransactions();
      } catch (error) {
        console.error('Error in polling:', error);
      }
    }, 60000); // 60 seconds
  }

  /**
   * Add shame transaction to history
   */
  private async addShameTransaction(shameTx: ShameTransaction) {
    // Only add transactions >= 1 AND (≤ 10 WANKR OR exactly 69 WANKR) (filter out traders and decimal amounts)
    const amount = parseFloat(shameTx.amount);
    const roundedAmount = Math.round(amount);
    if (roundedAmount < 1 || (roundedAmount > 10 && roundedAmount !== 69)) {
      
      return;
    }
    
    // Skip zero-amount transactions (not real shame deliveries)
    if (amount === 0) {
      
      return;
    }

    // Check if we already have this transaction
    const exists = this.shameHistory.find(existing => 
      existing.transactionHash === shameTx.transactionHash
    );

    if (exists) {
      
      return;
    }

    // Resolve wallet addresses to display names (only for new transactions)
    try {
      // Provide immediate fallbacks first
      const enrichedShameTx = {
        ...shameTx,
        fromDisplayName: this.shortenAddress(shameTx.from),
        toDisplayName: this.shortenAddress(shameTx.to),
        fromSource: 'shortened' as const,
        toSource: 'shortened' as const
      };

      // Add to history immediately
      this.shameHistory.unshift(enrichedShameTx);
      if (this.shameHistory.length > 100) {
        this.shameHistory = this.shameHistory.slice(0, 100);
      }

      // Emit the new transaction immediately
      this.emit('newShameTransaction', enrichedShameTx);

      // Process handle resolution in background (non-blocking)
      this.resolveHandlesInBackground(enrichedShameTx);
    } catch (error) {
      console.error(`❌ Error processing shame transaction: ${shameTx.transactionHash}`, error);
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

        await this.addShameTransaction(shameTx);
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

        // Skip decimal-amount and large transactions (over 10 WANKR, except 69) and decimal amounts
        const amount = parseFloat(ethers.formatUnits(value, 18));
        const roundedAmount = Math.round(amount);
        if (roundedAmount < 1 || (roundedAmount > 10 && roundedAmount !== 69)) {
  
          continue;
        }

        const shameTx: ShameTransaction = {
          from,
          to,
          amount: roundedAmount.toString(), // Use rounded amount for display
          timestamp: Math.floor(Date.now() / 1000),
          reason: '',
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        };

        await this.addShameTransaction(shameTx);
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
   * Refresh shame history with resolved handles
   */
  async refreshShameHistoryWithHandles(): Promise<ShameTransaction[]> {
    try {
      // Get all unique addresses from current transactions
      const addresses = new Set<string>();
      this.shameHistory.forEach(tx => {
        addresses.add(tx.from.toLowerCase());
        addresses.add(tx.to.toLowerCase());
      });

      // Bulk resolve all addresses
      const resolutions = await this.handleResolver.resolveHandlesBulk(Array.from(addresses));

      // Update all transactions with resolved handles
      this.shameHistory.forEach(tx => {
        const fromResolution = resolutions[tx.from.toLowerCase()];
        const toResolution = resolutions[tx.to.toLowerCase()];

        if (fromResolution) {
          tx.fromDisplayName = fromResolution.displayName;
          tx.fromSource = fromResolution.source;
        }

        if (toResolution) {
          tx.toDisplayName = toResolution.displayName;
          tx.toSource = toResolution.source;
        }
      });

      console.log(`✅ Refreshed ${this.shameHistory.length} transactions with handle resolutions`);
      return this.shameHistory;
    } catch (error) {
      console.error('❌ Error refreshing shame history with handles:', error);
      return this.shameHistory;
    }
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
      totalTransactions: totalShames, // Changed from totalShames to totalTransactions
      totalShameDelivered: Math.floor(totalAmount), // Changed to whole integer
      uniqueShamers,
      uniqueShamed,
      averageJudgment: this.shameHistory
        .filter(tx => tx.judgment)
        .reduce((sum, tx) => sum + (tx.judgment || 0), 0) / 
        this.shameHistory.filter(tx => tx.judgment).length || 0
    };
  }

  /**
   * Helper method to shorten addresses
   */
  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Background process to resolve handles for transactions
   */
  private async resolveHandlesInBackground(transaction: ShameTransaction) {
    try {
      // Use handleResolver which handles the entire flow (cache → register → BNS → Farcaster → shortened)
      const [fromResolution, toResolution] = await Promise.all([
        this.handleResolver.resolveHandle(transaction.from),
        this.handleResolver.resolveHandle(transaction.to)
      ]);

      // Update the transaction with resolved handles
      transaction.fromDisplayName = fromResolution.displayName;
      transaction.toDisplayName = toResolution.displayName;
      transaction.fromSource = fromResolution.source;
      transaction.toSource = toResolution.source;

      console.log(`✅ Handles resolved for tx ${transaction.transactionHash}:`);
      console.log(`   From: ${transaction.from} → ${fromResolution.displayName} (${fromResolution.source})`);
      console.log(`   To: ${transaction.to} → ${toResolution.displayName} (${toResolution.source})`);

      // Emit an event to update the UI with the resolved handle
      this.emit('handleResolutionUpdate', transaction);
      
    } catch (error) {
      console.error(`❌ Background handle resolution failed for: ${transaction.transactionHash}`, error);
      // Keep the fallback values
      transaction.fromDisplayName = this.shortenAddress(transaction.from);
      transaction.toDisplayName = this.shortenAddress(transaction.to);
      transaction.fromSource = 'shortened';
      transaction.toSource = 'shortened';
      this.emit('handleResolutionUpdate', transaction);
    }
  }
}

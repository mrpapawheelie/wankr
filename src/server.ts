import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { ShameFeedService } from './services/shameFeedService';
import { HandleResolutionService } from './services/handleResolutionService';
import { LeaderboardService } from './services/leaderboardService';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// WANKR Token Contract Address on Base
const WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07';

// Basic ERC-20 ABI for reading token data
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Initialize provider for Base chain
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');

// Initialize shame feed service
const shameFeedService = new ShameFeedService(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
const handleResolver = new HandleResolutionService();
const leaderboardService = new LeaderboardService(process.env.BASE_RPC_URL || 'https://mainnet.base.org');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'WANKR API is running',
    contract: WANKR_CONTRACT_ADDRESS,
    chain: 'Base'
  });
});

// Get WANKR token info
app.get('/api/token-info', async (req, res) => {
  try {
    const contract = new ethers.Contract(WANKR_CONTRACT_ADDRESS, ERC20_ABI, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    res.json({
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: totalSupply.toString(),
      contractAddress: WANKR_CONTRACT_ADDRESS,
      chain: 'Base'
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// Get user's WANKR balance
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      res.status(400).json({ error: 'Invalid address format' });
      return;
    }

    const contract = new ethers.Contract(WANKR_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    const formattedBalance = ethers.formatUnits(balance, decimals);

    res.json({
      address,
      balance: balance.toString(),
      formattedBalance,
      symbol: 'WANKR'
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Shame leaderboard endpoint (placeholder for now)
app.get('/api/leaderboard', (req, res) => {
  // TODO: Implement shame leaderboard logic
  res.json({
    message: 'Shame leaderboard coming soon...',
    topShameSoldiers: []
  });
});

// Live shame feed endpoint
app.get('/api/shame-feed', (req, res) => {
  try {
    const shameHistory = shameFeedService.getShameHistory();
    const topSoldiers = shameFeedService.getTopSoldiers();
    const stats = shameFeedService.getShameStats();
    
    res.json({
      shameHistory,
      topSoldiers,
      stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching shame feed:', error);
    res.status(500).json({ error: 'Failed to fetch shame feed' });
  }
});

// WebSocket endpoint for real-time shame feed
app.get('/api/shame-feed/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial data
  const initialData = {
    shameHistory: shameFeedService.getShameHistory(),
    topSoldiers: shameFeedService.getTopSoldiers(),
    stats: shameFeedService.getShameStats()
  };
  sendEvent('initialData', initialData);

  // Listen for new shame events
  const onNewShame = (shameTx: any) => {
    sendEvent('newShame', shameTx);
  };

  const onShameHistoryUpdate = (history: any) => {
    sendEvent('shameHistoryUpdate', history);
  };

  const onLeaderboardUpdate = (soldiers: any) => {
    sendEvent('leaderboardUpdate', soldiers);
  };

  shameFeedService.on('newShame', onNewShame);
  shameFeedService.on('shameHistoryUpdate', onShameHistoryUpdate);
  shameFeedService.on('leaderboardUpdate', onLeaderboardUpdate);

  // Clean up on disconnect
  req.on('close', () => {
    shameFeedService.off('newShame', onNewShame);
    shameFeedService.off('shameHistoryUpdate', onShameHistoryUpdate);
    shameFeedService.off('leaderboardUpdate', onLeaderboardUpdate);
  });
});

// Handle resolution endpoint
app.get('/api/resolve-handle/:address', async (req, res) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    const resolution = await handleResolver.resolveHandle(address);
    return res.json(resolution);
  } catch (error) {
    console.error('Error resolving handle:', error);
    return res.status(500).json({ error: 'Failed to resolve handle' });
  }
});

// Batch handle resolution endpoint
app.post('/api/resolve-handles', async (req, res) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Invalid addresses array' });
    }
    
    const resolutions = await handleResolver.resolveMultipleHandles(addresses);
    return res.json(resolutions);
  } catch (error) {
    console.error('Error resolving handles:', error);
    return res.status(500).json({ error: 'Failed to resolve handles' });
  }
});

// Handle resolution stats endpoint
app.get('/api/handle-stats', (req, res) => {
  try {
    const cacheStats = handleResolver.getCacheStats();
    const apiStats = handleResolver.getApiUsageStats();
    
    return res.json({
      cache: cacheStats,
      api: apiStats
    });
  } catch (error) {
    console.error('Error getting handle stats:', error);
    return res.status(500).json({ error: 'Failed to get handle stats' });
  }
});

// Clear handle resolution cache endpoint
app.post('/api/clear-cache', (req, res) => {
  try {
    handleResolver.clearCache();
    return res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Leaderboard endpoints
app.get('/api/leaderboards/:type/:period', async (req, res) => {
  try {
    const { type, period } = req.params;
    
    if (!['received', 'sent'].includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type. Use "received" or "sent"' });
    }
    
    if (!['all', 'week', 'day'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use "all", "week", or "day"' });
    }

    let leaderboard;
    if (type === 'received') {
      leaderboard = await leaderboardService.getShameReceivedLeaderboard(period as 'all' | 'week' | 'day');
    } else {
      leaderboard = await leaderboardService.getShameSoldiersLeaderboard(period as 'all' | 'week' | 'day');
    }

    return res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get both leaderboards at once
app.get('/api/leaderboards/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    if (!['all', 'week', 'day'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use "all", "week", or "day"' });
    }

    const leaderboards = await leaderboardService.getLeaderboards(period as 'all' | 'week' | 'day');
    return res.json(leaderboards);
  } catch (error) {
    console.error('Error getting leaderboards:', error);
    return res.status(500).json({ error: 'Failed to get leaderboards' });
  }
});

// Test BankrBot SDK endpoint (handle → wallet)
app.get('/api/test-bankrbot/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    
    console.log(`Testing BankrBot SDK for handle: ${handle}`);
    
    // Note: BankrBot only supports handle → wallet, not wallet → handle
    // This endpoint is for testing handle → wallet lookup
    return res.json({
      handle,
      wallet: null,
      success: false,
      note: 'BankrBot SDK requires private key for signing. Use direct API calls instead.'
    });
  } catch (error) {
    console.error('Error testing BankrBot SDK:', error);
    return res.status(500).json({ error: 'Failed to test BankrBot SDK', details: (error as Error).message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 WANKR API server running on port ${PORT}`);
  console.log(`📊 Contract: ${WANKR_CONTRACT_ADDRESS}`);
  console.log(`🌐 Chain: Base`);
  
  // Start shame feed monitoring
  try {
    await shameFeedService.startMonitoring();
    console.log(`🎭 Shame feed monitoring started`);
  } catch (error) {
    console.error('Failed to start shame feed monitoring:', error);
  }
});

export default app;

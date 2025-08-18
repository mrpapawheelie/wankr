import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { ShameFeedService } from './services/shameFeedService';
import { HandleResolutionService } from './services/handleResolutionService';
import { LeaderboardService } from './services/leaderboardService';
import { RegisterService } from './services/register';
import { CheckRegisterService } from './services/checkRegister';

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
  // Initialize services with new architecture
  const registerService = new RegisterService();
  const checkRegisterService = new CheckRegisterService(registerService);
  const handleResolver = new HandleResolutionService(checkRegisterService, registerService);
  const shameFeedService = new ShameFeedService(process.env.BASE_RPC_URL || 'https://mainnet.base.org', handleResolver);
  const leaderboardService = new LeaderboardService(handleResolver);

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

// Get shame feed data
app.get('/api/shame-feed', async (req, res) => {
  try {
    const shameHistory = shameFeedService.getShameHistory();
    const topSoldiers = shameFeedService.getTopSoldiers();
    const stats = shameFeedService.getShameStats();

    return res.json({
      shameHistory,
      topSoldiers,
      stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting shame feed:', error);
    return res.status(500).json({ error: 'Failed to get shame feed' });
  }
});

// Refresh shame feed with resolved handles
app.post('/api/shame-feed/refresh-handles', async (req, res) => {
  try {
    const updatedHistory = await shameFeedService.refreshShameHistoryWithHandles();
    return res.json({ 
      message: 'Shame feed refreshed with handle resolutions',
      updatedCount: updatedHistory.length
    });
  } catch (error) {
    console.error('Error refreshing shame feed handles:', error);
    return res.status(500).json({ error: 'Failed to refresh shame feed handles' });
  }
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

// Bulk handle resolution endpoint for leaderboards
app.post('/api/resolve-handles-bulk', async (req, res) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses must be an array' });
    }
    

    const resolutions = await handleResolver.resolveHandlesBulk(addresses);
    return res.json(resolutions);
  } catch (error) {
    console.error('Error bulk resolving handles:', error);
    return res.status(500).json({ error: 'Failed to bulk resolve handles' });
  }
});

// Get handle resolution stats endpoint
app.get('/api/handle-stats', (req, res) => {
  try {
    const cacheStats = handleResolver.getCacheStats();
    
    return res.json({
      cache: cacheStats,
      note: 'API usage stats removed in simplified version'
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

// Clear handle resolution register endpoint
app.post('/api/clear-register', (req, res) => {
  try {
    registerService.clearRegister();
    return res.json({ message: 'Register cleared successfully' });
  } catch (error) {
    console.error('Error clearing register:', error);
    return res.status(500).json({ error: 'Failed to clear register' });
  }
});

// Remove specific addresses from cache endpoint
app.post('/api/remove-from-cache', (req, res) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses must be an array' });
    }
    
    handleResolver.removeFromCache(addresses);
    return res.json({ 
      message: `Removed ${addresses.length} addresses from cache`,
      removedAddresses: addresses
    });
  } catch (error) {
    console.error('Error removing from cache:', error);
    return res.status(500).json({ error: 'Failed to remove from cache' });
  }
});

// Remove specific addresses from register endpoint
app.post('/api/remove-from-register', (req, res) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses must be an array' });
    }
    
    const removedCount = registerService.removeFromRegisterBulk(addresses);
    return res.json({ 
      message: `Removed ${removedCount} addresses from register`,
      removedAddresses: addresses,
      removedCount
    });
  } catch (error) {
    console.error('Error removing from register:', error);
    return res.status(500).json({ error: 'Failed to remove from register' });
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

// Test Dune integration endpoint
app.get('/api/test-dune', async (req, res) => {
  try {
    const duneService = new (await import('./services/duneService')).DuneService();
    const isConnected = await duneService.testConnection();
    
    if (isConnected) {
      // Test getting some data
      const leaderboards = await duneService.getLeaderboards();
      
      return res.json({
        success: true,
        message: 'Dune API integration working',
        data: {
          receivedCount: leaderboards.received.length,
          sentCount: leaderboards.sent.length,
          sampleReceived: leaderboards.received.slice(0, 3),
          sampleSent: leaderboards.sent.slice(0, 3)
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Dune API connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing Dune integration:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to test Dune integration', 
      details: (error as Error).message 
    });
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

  } catch (error) {
    console.error('Failed to start shame feed monitoring:', error);
  }
});

export default app;

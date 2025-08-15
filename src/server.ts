import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

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

// Live shame feed endpoint (placeholder for now)
app.get('/api/shame-feed', (req, res) => {
  // TODO: Implement live shame feed
  res.json({
    message: 'Live shame feed coming soon...',
    recentShames: []
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WANKR API server running on port ${PORT}`);
  console.log(`📊 Contract: ${WANKR_CONTRACT_ADDRESS}`);
  console.log(`🌐 Chain: Base`);
});

export default app;

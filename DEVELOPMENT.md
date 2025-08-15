# 🚀 WANKR Development Guide

> **The Unholy Birth of WANKR GYATT** - Development setup and workflow

## 🛠️ Prerequisites

Before you start developing WANKR, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** or another Web3 wallet
- **Base Sepolia testnet ETH** (for testing)

## 🏗️ Project Structure

```
wankr/
├── contracts/                 # Smart contracts (Foundry)
│   ├── src/
│   │   └── WANKRToken.sol    # Main WANKR token contract
│   ├── test/
│   │   └── WANKRToken.t.sol  # Contract tests
│   ├── script/
│   │   └── Deploy.s.sol      # Deployment script
│   ├── foundry.toml          # Foundry configuration
│   └── remappings.txt        # Import remappings
├── frontend/                  # Web3 frontend (Vite + TypeScript)
│   ├── src/
│   │   └── main.ts           # Main frontend logic
│   ├── index.html            # Frontend HTML
│   └── package.json          # Frontend dependencies
├── src/                      # Backend API (Node.js + TypeScript)
│   ├── server.ts             # Express server
│   ├── controllers/          # API controllers
│   ├── services/             # Business logic
│   ├── models/               # Data models
│   ├── routes/               # API routes
│   └── utils/                # Utility functions
├── package.json              # Backend dependencies
├── tsconfig.json             # TypeScript configuration
└── nodemon.json              # Development server config
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd wankr

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Base Chain Configuration
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# WANKR Contract Address (already deployed on Base)
WANKR_CONTRACT_ADDRESS=0xa207c6e67cea08641503947ac05c65748bb9bb07

# For deployment (if needed)
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Smart Contract Development

#### Install Foundry

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # or source ~/.zshrc
foundryup
```

#### Compile Contracts

```bash
cd contracts
forge build
```

#### Run Tests

```bash
# Run all tests
forge test

# Run tests with verbose output
forge test -vvv

# Run specific test
forge test --match-test testDeliverShame
```

#### Deploy to Testnet

```bash
# Set your private key (be careful!)
export PRIVATE_KEY=your_private_key_here

# Deploy to Base Sepolia testnet
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
```

### 4. Backend Development

#### Start Development Server

```bash
# Start the backend server with hot reload
npm run dev
```

The backend will be available at `http://localhost:3001`

#### API Endpoints

- `GET /health` - Health check
- `GET /api/token-info` - Get WANKR token information
- `GET /api/balance/:address` - Get WANKR balance for an address
- `GET /api/leaderboard` - Get shame leaderboard (coming soon)
- `GET /api/shame-feed` - Get live shame feed (coming soon)

#### Build for Production

```bash
npm run build
npm start
```

### 5. Frontend Development

#### Start Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Build for Production

```bash
npm run build
npm run preview
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run tests with coverage
forge coverage
```

### Backend Tests

```bash
# Run backend tests (when implemented)
npm test
```

### Frontend Tests

```bash
cd frontend

# Run frontend tests (when implemented)
npm test
```

## 🔧 Development Workflow

### 1. Smart Contract Development

1. **Write your contract** in `contracts/src/`
2. **Write tests** in `contracts/test/`
3. **Run tests** with `forge test`
4. **Deploy to testnet** for testing
5. **Deploy to mainnet** when ready

### 2. Backend Development

1. **Add new routes** in `src/routes/`
2. **Add controllers** in `src/controllers/`
3. **Add services** in `src/services/`
4. **Test endpoints** with tools like Postman or curl
5. **Update API documentation**

### 3. Frontend Development

1. **Add new components** in `frontend/src/components/`
2. **Add new pages** in `frontend/src/pages/`
3. **Add new hooks** in `frontend/src/hooks/`
4. **Test with MetaMask** connected to Base network

## 🌐 Network Configuration

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **WANKR Contract**: `0xa207c6e67cea08641503947ac05c65748bb9bb07`

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### MetaMask Configuration

Add Base network to MetaMask:

**Base Mainnet:**
- Network Name: Base
- RPC URL: https://mainnet.base.org
- Chain ID: 8453
- Currency Symbol: ETH
- Block Explorer: https://basescan.org

**Base Sepolia:**
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

## 📊 Contract Functions

### Core Functions

- `deliverShame(address to, string reason)` - Deliver 10 WANKR shame
- `deliverCustomShame(address to, uint256 amount, string reason)` - Deliver custom amount
- `getTopShameSoldiers()` - Get top 50 shame soldiers
- `getShameStats(address target)` - Get shame statistics for an address
- `getShameHistory()` - Get all shame transactions

### Events

- `ShameDelivered(address from, address to, uint256 amount, string reason)`
- `ShameSoldierRanked(address soldier, uint256 totalShameDelivered, uint256 rank)`
- `ForbiddenSendAttempted(address from, address to, uint256 amount)`
- `SpectralJudgment(address target, uint8 judgment, string reason)`

## 🚨 Important Notes

### Security

- **Never commit private keys** to the repository
- **Use environment variables** for sensitive data
- **Test thoroughly** on testnet before mainnet
- **The Forbidden Send (69 WANKR)** is blocked by design

### Gas Optimization

- The contract uses efficient storage patterns
- Events are used for off-chain tracking
- Leaderboard updates are optimized for gas usage

### Testing

- All contract functions are thoroughly tested
- Edge cases are covered (self-shame, zero address, etc.)
- Gas usage is monitored and optimized

## 🐛 Troubleshooting

### Common Issues

1. **Foundry not found**: Make sure Foundry is installed and in your PATH
2. **Compilation errors**: Check Solidity version compatibility
3. **Test failures**: Ensure all dependencies are installed
4. **MetaMask connection**: Make sure you're on the correct network
5. **Gas errors**: Ensure you have enough ETH for transactions

### Getting Help

- Check the [Foundry Book](https://book.getfoundry.sh/)
- Review the [OpenZeppelin documentation](https://docs.openzeppelin.com/)
- Check the [Base documentation](https://docs.base.org/)

## 🎯 Next Steps

### Phase 2: Shame Implementation
- [ ] Implement backend leaderboard API
- [ ] Add real-time shame feed
- [ ] Create social media bot integration
- [ ] Add advanced shame mechanics

### Phase 3: Frontend & Launch
- [ ] Complete frontend functionality
- [ ] Add wallet connection improvements
- [ ] Implement live shame feed UI
- [ ] Add mobile responsiveness

### Phase 4: Ecosystem & Mainnet
- [ ] Deploy to mainnet
- [ ] Add exchange listings
- [ ] Implement advanced features
- [ ] Community expansion

---

**🚀 WANKR - The Dark Mirror of the Base Chain 🚀**

*Early adopters own the board. Latecomers earn it.*

*Stay tuned for more details where you can participate.*

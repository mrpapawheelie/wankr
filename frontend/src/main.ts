import { ethers } from 'ethers';

// WANKR Contract Configuration
const WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07';
const STANDARD_SHAME_AMOUNT = ethers.parseUnits('10', 18); // 10 WANKR

// Contract ABI for the functions we need
const WANKR_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function deliverShame(address to, string reason)',
  'function deliverCustomShame(address to, uint256 amount, string reason)',
  'function getTopShameSoldiers() view returns (tuple(address soldier, uint256 totalShameDelivered, uint256 lastShameTime, uint256 rank)[])',
  'function getShameStats(address target) view returns (uint256 delivered, uint256 received, uint256 rank)',
  'event ShameDelivered(address indexed from, address indexed to, uint256 amount, string reason)',
  'event ShameSoldierRanked(address indexed soldier, uint256 totalShameDelivered, uint256 rank)'
];

// Global variables
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;
let contract: ethers.Contract | null = null;
let connectedAddress: string | null = null;

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet') as HTMLButtonElement;
const walletInfo = document.getElementById('walletInfo') as HTMLDivElement;
const walletAddress = document.getElementById('walletAddress') as HTMLDivElement;
const wankrBalance = document.getElementById('wankrBalance') as HTMLSpanElement;
const shameForm = document.getElementById('shameForm') as HTMLFormElement;
const targetAddressInput = document.getElementById('targetAddress') as HTMLInputElement;
const shameReasonInput = document.getElementById('shameReason') as HTMLTextAreaElement;
const deliverShameBtn = document.getElementById('deliverShame') as HTMLButtonElement;
const leaderboard = document.getElementById('leaderboard') as HTMLDivElement;

// Initialize the application
async function init() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    showError('MetaMask is not installed. Please install MetaMask to use WANKR.');
    return;
  }

  // Set up event listeners
  connectWalletBtn.addEventListener('click', connectWallet);
  shameForm.addEventListener('submit', deliverShame);
  
  // Check if wallet is already connected
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length > 0) {
    await connectWallet();
  }
  
  // Load leaderboard
  loadLeaderboard();
}

// Connect wallet function
async function connectWallet() {
  try {
    connectWalletBtn.disabled = true;
    connectWalletBtn.textContent = 'Connecting...';
    
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    connectedAddress = accounts[0];
    
    // Set up provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    // Create contract instance
    contract = new ethers.Contract(WANKR_CONTRACT_ADDRESS, WANKR_ABI, signer);
    
    // Update UI
    updateWalletInfo();
    await updateBalance();
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showError('Failed to connect wallet: ' + (error as Error).message);
  } finally {
    connectWalletBtn.disabled = false;
    connectWalletBtn.textContent = 'Connect MetaMask';
  }
}

// Update wallet info display
function updateWalletInfo() {
  if (!connectedAddress) return;
  
  walletAddress.textContent = connectedAddress;
  walletInfo.style.display = 'block';
  connectWalletBtn.style.display = 'none';
}

// Update WANKR balance
async function updateBalance() {
  if (!contract || !connectedAddress) return;
  
  try {
    const balance = await contract.balanceOf(connectedAddress);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    wankrBalance.textContent = formattedBalance;
    
    // Enable/disable deliver shame button based on balance
    deliverShameBtn.disabled = balance < STANDARD_SHAME_AMOUNT;
    
  } catch (error) {
    console.error('Error updating balance:', error);
  }
}

// Deliver shame function
async function deliverShame(event: Event) {
  event.preventDefault();
  
  if (!contract || !signer) {
    showError('Please connect your wallet first');
    return;
  }
  
  const targetAddress = targetAddressInput.value.trim();
  const reason = shameReasonInput.value.trim();
  
  // Validate address
  if (!ethers.isAddress(targetAddress)) {
    showError('Invalid target address');
    return;
  }
  
  try {
    deliverShameBtn.disabled = true;
    deliverShameBtn.textContent = 'Delivering Shame...';
    
    // Deliver shame using the standard 10 WANKR amount
    const tx = await contract.deliverShame(targetAddress, reason || 'No reason provided');
    
    showSuccess('Shame transaction sent! Waiting for confirmation...');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    showSuccess(`Shame delivered successfully! Transaction: ${receipt.hash}`);
    
    // Update balance and leaderboard
    await updateBalance();
    await loadLeaderboard();
    
    // Clear form
    shameForm.reset();
    
  } catch (error) {
    console.error('Error delivering shame:', error);
    showError('Failed to deliver shame: ' + (error as Error).message);
  } finally {
    deliverShameBtn.disabled = false;
    deliverShameBtn.textContent = 'Deliver 10 WANKR Shame';
  }
}

// Load leaderboard
async function loadLeaderboard() {
  try {
    // For now, we'll show a placeholder since we need to connect to the backend
    // In a real implementation, this would call the backend API
    leaderboard.innerHTML = `
      <div class="loading">
        <p>Shame leaderboard coming soon...</p>
        <p>This will show the Top 50 Shame Soldiers ranked by total shame delivered.</p>
      </div>
    `;
    
    // TODO: Implement actual leaderboard loading from backend API
    // const response = await fetch('http://localhost:3001/api/leaderboard');
    // const data = await response.json();
    // displayLeaderboard(data.topShameSoldiers);
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboard.innerHTML = '<div class="error">Failed to load leaderboard</div>';
  }
}

// Display leaderboard data
function displayLeaderboard(soldiers: any[]) {
  if (soldiers.length === 0) {
    leaderboard.innerHTML = '<div class="loading">No shame soldiers yet. Be the first!</div>';
    return;
  }
  
  const soldiersHTML = soldiers.map((soldier, index) => `
    <div class="soldier-card">
      <div class="soldier-rank">#${soldier.rank || index + 1}</div>
      <div class="soldier-info">
        <div class="soldier-address">${soldier.soldier}</div>
        <div class="soldier-shame">${ethers.formatUnits(soldier.totalShameDelivered, 18)} WANKR delivered</div>
      </div>
    </div>
  `).join('');
  
  leaderboard.innerHTML = soldiersHTML;
}

// Handle account changes
async function handleAccountsChanged(accounts: string[]) {
  if (accounts.length === 0) {
    // User disconnected wallet
    connectedAddress = null;
    provider = null;
    signer = null;
    contract = null;
    
    walletInfo.style.display = 'none';
    connectWalletBtn.style.display = 'block';
    deliverShameBtn.disabled = true;
  } else {
    // User switched accounts
    connectedAddress = accounts[0];
    await updateBalance();
  }
}

// Handle chain changes
async function handleChainChanged(chainId: string) {
  // Reload the page when chain changes
  window.location.reload();
}

// Utility functions
function showError(message: string) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = message;
  
  // Insert at the top of the container
  const container = document.querySelector('.container');
  container?.insertBefore(errorDiv, container.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccess(message: string) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success';
  successDiv.textContent = message;
  
  // Insert at the top of the container
  const container = document.querySelector('.container');
  container?.insertBefore(successDiv, container.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Add ethereum to window type
declare global {
  interface Window {
    ethereum: any;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

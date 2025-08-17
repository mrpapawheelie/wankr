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
const leaderboardContent = document.getElementById('leaderboardContent') as HTMLDivElement;
const timePeriodSelect = document.getElementById('timePeriod') as HTMLSelectElement;

// Shame feed elements
const shameFeed = document.getElementById('shameFeed') as HTMLDivElement;
const feedStatus = document.getElementById('feedStatus') as HTMLDivElement;
const totalShames = document.getElementById('totalShames') as HTMLSpanElement;
const activeShamers = document.getElementById('activeShamers') as HTMLSpanElement;

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
  
  // Load leaderboards
  loadLeaderboards();
  
  // Start live shame feed
  startShameFeed();
  
  // Setup leaderboard events
  setupLeaderboardEvents();
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
    wankrBalance.textContent = Math.floor(parseFloat(formattedBalance)).toString();
    
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

// Load leaderboards data
async function loadLeaderboards() {
  try {
    // Show loading state
    leaderboardContent.style.display = 'flex';
    leaderboardContent.innerHTML = '<div class="loading">Loading leaderboards...</div>';
    
    const period = timePeriodSelect.value;
    const response = await fetch(`http://localhost:3001/api/leaderboards/${period}`);
    const data = await response.json();
    
    if (data.received && data.sent) {
      displayLeaderboards(data);
    } else {
      leaderboardContent.innerHTML = '<div class="error">Failed to load leaderboard data</div>';
    }
  } catch (error) {
    console.error('Error loading leaderboards:', error);
    leaderboardContent.innerHTML = '<div class="error">Failed to load leaderboard data</div>';
  }
}

// Setup leaderboard event listeners
function setupLeaderboardEvents() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked tab
      button.classList.add('active');
      
      // Show loading state on the clicked button
      const originalText = button.textContent;
      button.textContent = 'Loading...';
      button.disabled = true;
      
      // Load leaderboards with current period
      await loadLeaderboards();
      
      // Restore button state
      button.textContent = originalText;
      button.disabled = false;
    });
  });
  
  // Time period change
  timePeriodSelect.addEventListener('change', async () => {
    // Show loading state on the select
    const originalValue = timePeriodSelect.value;
    timePeriodSelect.disabled = true;
    
    await loadLeaderboards();
    
    // Restore select state
    timePeriodSelect.disabled = false;
  });
}

// Display leaderboards
function displayLeaderboards(data: any) {
  const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'received';
  const leaderboard = activeTab === 'received' ? data.received : data.sent;
  
  if (!leaderboard || leaderboard.length === 0) {
    leaderboardContent.innerHTML = '<div class="loading">No data available for this period</div>';
    return;
  }
  
  // Reset flex properties for table display
  leaderboardContent.style.display = 'block';
  
  const tableHTML = `
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Wallet/Handle</th>
          <th>Transactions</th>
          <th>Total WANKR</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        ${leaderboard.map((entry: any) => `
          <tr>
            <td class="rank-cell">#${entry.rank}</td>
            <td class="handle-cell">
              <span class="handle-name">${entry.displayName}</span>
              <span class="handle-source">${entry.source}</span>
            </td>
            <td class="stats-cell">${entry.transactionCount} tx</td>
            <td class="amount-cell">${entry.totalWankr} WANKR</td>
            <td>
              <a href="https://basescan.org/address/${entry.address}" target="_blank" class="basescan-link">🔗</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  leaderboardContent.innerHTML = tableHTML;
}

// Start live shame feed
async function startShameFeed() {
  try {
    // First, load initial data
    await loadInitialShameData();
    
    // Then start real-time updates
    startShameFeedStream();
    
  } catch (error) {
    console.error('Error starting shame feed:', error);
    feedStatus.textContent = '🔴 Offline';
    feedStatus.className = 'feed-status offline';
  }
}

// Load initial shame data
async function loadInitialShameData() {
  try {
    const response = await fetch('http://localhost:3001/api/shame-feed');
    const data = await response.json();
    
    displayShameFeed(data.shameHistory);
    updateFeedStats(data.stats);
    
  } catch (error) {
    console.error('Error loading initial shame data:', error);
    shameFeed.innerHTML = '<div class="error">Failed to load shame feed</div>';
  }
}

// Start real-time shame feed stream
function startShameFeedStream() {
  const eventSource = new EventSource('http://localhost:3001/api/shame-feed/stream');
  
  eventSource.onopen = () => {
    feedStatus.textContent = '🟢 Live';
    feedStatus.className = 'feed-status';
  };
  
  eventSource.onerror = () => {
    feedStatus.textContent = '🔴 Offline';
    feedStatus.className = 'feed-status offline';
  };
  
  eventSource.addEventListener('initialData', (event) => {
    const data = JSON.parse(event.data);
    displayShameFeed(data.shameHistory);
    updateFeedStats(data.stats);
  });
  
  eventSource.addEventListener('newShame', (event) => {
    const shameTx = JSON.parse(event.data);
    addNewShameToFeed(shameTx);
  });
  
  eventSource.addEventListener('shameHistoryUpdate', (event) => {
    const history = JSON.parse(event.data);
    displayShameFeed(history);
  });
  
  eventSource.addEventListener('leaderboardUpdate', (event) => {
    const soldiers = JSON.parse(event.data);
    // TODO: Update leaderboard when implemented
  });
}

// Display shame feed
function displayShameFeed(shameHistory: any[]) {
  if (shameHistory.length === 0) {
    shameFeed.innerHTML = '<div class="loading">No shame delivered yet. Be the first!</div>';
    return;
  }
  
  const feedHTML = shameHistory.slice(0, 20).map(shame => createShameItemHTML(shame)).join('');
  shameFeed.innerHTML = feedHTML;
}

// Add new shame to feed
function addNewShameToFeed(shameTx: any) {
  const shameItemHTML = createShameItemHTML(shameTx, true);
  
  // Add to the top of the feed
  shameFeed.insertAdjacentHTML('afterbegin', shameItemHTML);
  
  // Remove old items if we have too many
  const items = shameFeed.querySelectorAll('.shame-item');
  if (items.length > 20) {
    items[items.length - 1].remove();
  }
  
  // Remove the 'new' class after animation
  setTimeout(() => {
    const newItem = shameFeed.querySelector('.shame-item.new');
    if (newItem) {
      newItem.classList.remove('new');
    }
  }, 2000);
}

// Create shame item HTML
function createShameItemHTML(shame: any, isNew: boolean = false) {
  const fromDisplay = shame.fromDisplayName || shortenAddress(shame.from);
  const toDisplay = shame.toDisplayName || shortenAddress(shame.to);
  const timeAgo = getTimeAgo(shame.timestamp);
  const judgmentClass = shame.judgment ? `judgment-${shame.judgment}` : '';
  const judgmentHTML = shame.judgment ? `<span class="shame-judgment ${judgmentClass}">${shame.judgment}/10</span>` : '';
  
  // Format amount as whole integer
  const amount = Math.floor(parseFloat(shame.amount));
  
  // Create clickable transaction link
  const transactionLink = shame.transactionHash ? 
    `<a href="https://basescan.org/tx/${shame.transactionHash}" target="_blank" class="transaction-link">🔗</a>` : '';
  
  return `
    <div class="shame-item ${isNew ? 'new' : ''}">
      <div class="shame-header">
        <div class="shame-addresses">
          <span class="shamer">${fromDisplay}</span>
          <span class="shame-action">shamed</span>
          <span class="shamed">${toDisplay}</span>
        </div>
        <div class="shame-amount">
          <div class="amount-container">
            <span class="amount-number">${amount}</span>
            <span class="amount-label">WANKR</span>
          </div>
          ${judgmentHTML}
        </div>
      </div>
      <div class="shame-reason">${shame.reason || ''}</div>
      <div class="shame-footer">
        <div class="shame-time">${timeAgo} ${transactionLink}</div>
      </div>
    </div>
  `;
}

// Update feed statistics
function updateFeedStats(stats: any) {
  totalShames.textContent = stats.totalShames || '0';
  activeShamers.textContent = stats.uniqueShamers || '0';
}

// Utility functions
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
        <div class="soldier-shame">${Math.floor(parseFloat(ethers.formatUnits(soldier.totalShameDelivered, 18)))} WANKR delivered</div>
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

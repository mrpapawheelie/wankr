// Wallet and Contract Types
export interface WalletState {
  address: string | null
  balance: string | null
  isConnected: boolean
  isConnecting: boolean
}

export interface ContractState {
  contract: any | null
  provider: any | null
  signer: any | null
}

// Shame Feed Types
export interface ShameTransaction {
  from: string
  to: string
  amount: string
  timestamp: number
  reason: string
  transactionHash?: string
  blockNumber?: number
  judgment?: number
  fromDisplayName?: string
  toDisplayName?: string
  fromSource?: 'farcaster' | 'basenames' | 'shortened'
  toSource?: 'farcaster' | 'basenames' | 'shortened'
}

export interface ShameFeedStats {
  totalTransactions: number
  totalShameDelivered: number
  lastUpdate: string
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  transactionCount: number
  totalWankr: string
  period: 'all' | 'week' | 'day'
  source: 'farcaster' | 'basenames' | 'shortened'
}

export interface LeaderboardData {
  received: LeaderboardEntry[]
  sent: LeaderboardEntry[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Form Types
export interface SendShameForm {
  targetAddress: string
  reason: string
  customAmount?: string
}

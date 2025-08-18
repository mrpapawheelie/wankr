// Format wallet address to shortened version
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format timestamp to relative time
export function getTimeAgo(timestamp: number): string {
  const now = Date.now()
  
  // Handle both seconds and milliseconds timestamps
  let timestampMs = timestamp
  if (timestamp < 1000000000000) {
    // If timestamp is in seconds (less than year 2000 in milliseconds), convert to milliseconds
    timestampMs = timestamp * 1000
  }
  
  const diff = now - timestampMs
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

// Format WANKR amount
export function formatWankr(amount: string): string {
  const numAmount = parseFloat(amount)
  if (numAmount >= 1) {
    return numAmount.toFixed(0)
  }
  return numAmount.toFixed(2)
}

/**
 * Get humorous comment based on WANKR amount
 * @param amount - WANKR amount as string
 * @returns Comment text or icon for the amount
 */
export function getWankrAmountComment(amount: string): string {
  const numAmount = parseFloat(amount)
  if (numAmount === 69) return '🚫'
  if (numAmount === 1) return 'Baby Wankr'
  if (numAmount === 2) return 'Little Wankr'
  if (numAmount === 3) return 'Occasional Wankr'
  if (numAmount === 4) return 'Spicy Wankr'
  if (numAmount === 5) return 'Hot Wankr'
  if (numAmount === 6) return 'Big Wankr'
  if (numAmount === 7) return 'Brutal Wankr'
  if (numAmount === 8) return 'Major Wankr'
  if (numAmount === 9) return 'Savage Wankr'
  if (numAmount === 10) return 'Full Blown Wankr'
  return 'Unknown Wankr'
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

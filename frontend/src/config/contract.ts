import { ethers } from 'ethers'

// WANKR Contract Configuration
export const WANKR_CONTRACT_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07'
export const STANDARD_SHAME_AMOUNT = ethers.parseUnits('10', 18) // 10 WANKR

// Contract ABI for the functions we need
export const WANKR_ABI = [
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
]

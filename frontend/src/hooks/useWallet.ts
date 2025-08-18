import { useState, useEffect } from 'react'
import { walletService } from '../services/walletService'
import type { WalletState } from '../config/types'

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getWalletState())

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState)
    return unsubscribe
  }, [])

  const connectWallet = async () => {
    try {
      await walletService.connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = () => {
    walletService.disconnectWallet()
  }

  const updateBalance = async () => {
    await walletService.updateBalance()
  }

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateBalance
  }
}

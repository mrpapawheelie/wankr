import { useState, useEffect, useCallback, useRef } from 'react'
import { apiService } from '../services/apiService'
import type { ShameTransaction, ShameFeedStats } from '../config/types'

interface TransactionWithNewFlag extends ShameTransaction {
  isNew?: boolean
}

export function useShameFeed() {
  const [transactions, setTransactions] = useState<TransactionWithNewFlag[]>([])
  const [stats, setStats] = useState<ShameFeedStats>({ totalTransactions: 0, totalShameDelivered: 0, lastUpdate: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousTransactionHashes = useRef<Set<string>>(new Set())

  // Load shame data
  const loadData = useCallback(async () => {
    try {
      setError(null)
  
      const data = await apiService.getShameFeed()
      const newTransactions = data.shameHistory as TransactionWithNewFlag[]
      
      // Mark new transactions
      newTransactions.forEach(tx => {
        if (tx.transactionHash && !previousTransactionHashes.current.has(tx.transactionHash)) {
          tx.isNew = true
          // Remove the new flag after animation completes
          setTimeout(() => {
            setTransactions(current => 
              current.map(t => 
                t.transactionHash === tx.transactionHash 
                  ? { ...t, isNew: false }
                  : t
              )
            )
          }, 500) // Match animation duration
        }
      })
      
      // Update the set of known transaction hashes
      previousTransactionHashes.current = new Set(
        newTransactions
          .map(tx => tx.transactionHash)
          .filter((hash): hash is string => hash !== undefined)
      )
      
      setTransactions(newTransactions)
      setStats(data.stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shame feed')
      console.error('❌ Error loading shame feed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load initial data
    loadData()
    
    // Start refresh interval (every 10 seconds for more responsive handle updates)
    intervalRef.current = setInterval(() => {
      
      loadData()
    }, 10000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once

  return {
    transactions,
    stats,
    loading,
    error,
    refresh: loadData
  }
}

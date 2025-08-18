import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/apiService'
import type { LeaderboardData, LeaderboardEntry } from '../config/types'

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({ received: [], sent: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [timePeriod, setTimePeriod] = useState<string>('all')

  // Load leaderboard data
  const loadLeaderboards = useCallback(async (period: string = timePeriod) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getLeaderboards(period)
      setLeaderboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboards')
    } finally {
      setIsLoading(false)
    }
  }, [timePeriod])

  // Change time period
  const changeTimePeriod = useCallback((period: string) => {
    setTimePeriod(period)
    loadLeaderboards(period)
  }, [loadLeaderboards])

  // Get current leaderboard based on active tab
  const getCurrentLeaderboard = useCallback((): LeaderboardEntry[] => {
    return activeTab === 'received' ? leaderboardData.received : leaderboardData.sent
  }, [activeTab, leaderboardData])

  useEffect(() => {
    loadLeaderboards()
  }, [loadLeaderboards])

  return {
    leaderboardData,
    currentLeaderboard: getCurrentLeaderboard(),
    isLoading,
    error,
    activeTab,
    timePeriod,
    setActiveTab,
    changeTimePeriod,
    refresh: () => loadLeaderboards()
  }
}

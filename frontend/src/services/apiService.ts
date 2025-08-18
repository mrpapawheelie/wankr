import type { ShameTransaction, ShameFeedStats, LeaderboardData } from '../config/types'

const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  // Get shame feed data
  async getShameFeed(): Promise<{ shameHistory: ShameTransaction[], stats: ShameFeedStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/shame-feed`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch shame feed:', error)
      throw error
    }
  }

  // Get leaderboard data
  async getLeaderboards(period: string = 'all'): Promise<LeaderboardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboards/${period}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error)
      throw error
    }
  }

  // Resolve handles in bulk
  async resolveHandlesBulk(addresses: string[]): Promise<{ [address: string]: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/resolve-handles-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to resolve handles:', error)
      throw error
    }
  }

  // Test Dune API
  async testDune(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-dune`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to test Dune API:', error)
      throw error
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()

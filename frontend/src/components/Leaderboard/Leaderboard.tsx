
import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { LeaderboardTable } from './LeaderboardTable'

export function Leaderboard() {
  const {
    currentLeaderboard,
    isLoading,
    error,
    activeTab,
    timePeriod,
    setActiveTab,
    changeTimePeriod
  } = useLeaderboard()

  const [showAll, setShowAll] = useState(false)
  const displayedEntries = showAll ? currentLeaderboard : currentLeaderboard.slice(0, 20)

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4757' }}>
        <div>Error: {error}</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('received')}
            style={{
              background: activeTab === 'received' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === 'received' ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'received' ? '#ff6b6b' : '#a0a0a0',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
          >
            Top $WANKR's
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            style={{
              background: activeTab === 'sent' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === 'sent' ? '1px solid rgba(255, 107, 107, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'sent' ? '#ff6b6b' : '#a0a0a0',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
          >
            Shame Soldiers
          </button>
        </div>

        {/* Time Period Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={timePeriod}
            onChange={(e) => changeTimePeriod(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="day">Today</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable 
        entries={displayedEntries} 
        isLoading={isLoading} 
      />

      {/* Expand Button */}
      {currentLeaderboard.length > 20 && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#a0a0a0',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
          >
            {showAll ? `Show Top 20` : `Show All ${currentLeaderboard.length}`}
          </button>
        </div>
      )}
    </div>
  )
}

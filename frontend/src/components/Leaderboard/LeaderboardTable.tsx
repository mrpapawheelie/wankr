
import type { LeaderboardEntry } from '../../config/types'
import { formatNumber } from '../../utils/formatters'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading: boolean
}

export function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
          Loading leaderboard...
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
        No data available for this period
      </div>
    )
  }

  return (
    <div style={{
      maxHeight: '400px',
      overflowY: 'auto',
      minHeight: '200px'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead>
          <tr style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Rank
            </th>
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Wallet/Handle
            </th>
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Transactions
            </th>
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total WANKR
            </th>
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#ff6b6b',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.address} style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <td style={{
                padding: '0.75rem',
                fontWeight: '700',
                color: '#ff6b6b'
              }}>
                #{entry.rank}
              </td>
              <td style={{ padding: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#ffffff' }}>
                    {entry.displayName}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#a0a0a0',
                    textTransform: 'capitalize'
                  }}>
                    {entry.source}
                  </div>
                </div>
              </td>
              <td style={{
                padding: '0.75rem',
                color: '#a0a0a0',
                fontSize: '0.9rem'
              }}>
                {formatNumber(entry.transactionCount)} tx
              </td>
              <td style={{
                padding: '0.75rem',
                fontWeight: '600',
                color: '#ff6b6b'
              }}>
                {formatNumber(parseFloat(entry.totalWankr))} WANKR
              </td>
              <td style={{ padding: '0.75rem' }}>
                <a 
                  href={`https://basescan.org/address/${entry.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#ff6b6b',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


import { useShameFeed } from '../../hooks/useShameFeed'
import { ShameItem } from './ShameItem'

export function ShameFeed() {
  const { transactions, stats, loading, error, refresh } = useShameFeed()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          display: 'inline-block',
          width: '2rem',
          height: '2rem',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid #ff6b6b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Loading shame feed...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#ff4757', marginBottom: '1rem' }}>Error: {error}</p>
        <button 
          onClick={refresh}
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Stats and Live Status on same line */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#a0a0a0' }}>
            Total Transactions: <span style={{ color: '#ff8e53', fontWeight: '600' }}>{stats.totalTransactions}</span>
          </span>
          <span style={{ color: '#a0a0a0' }}>
            Total Shame Delivered: <span style={{ color: '#ff8e53', fontWeight: '600' }}>{stats.totalShameDelivered}</span>
          </span>
        </div>

        {/* Live Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.25rem 0.5rem',
          background: 'rgba(46, 213, 115, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(46, 213, 115, 0.2)'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#2ed573',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ fontSize: '0.8rem', color: '#2ed573', fontWeight: '500' }}>Live</span>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
            No shame transactions yet...
          </div>
        ) : (
          transactions.map((shame, index) => (
            <ShameItem key={`${shame.transactionHash}-${index}`} shame={shame} isNew={shame.isNew} />
          ))
        )}
      </div>
    </div>
  )
}

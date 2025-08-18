
import type { ShameTransaction } from '../../config/types'
import { shortenAddress, getTimeAgo, formatWankr, getWankrAmountComment } from '../../utils/formatters'

interface ShameItemProps {
  shame: ShameTransaction
  isNew?: boolean
}

export function ShameItem({ shame, isNew = false }: ShameItemProps) {
  const fromDisplay = shame.fromDisplayName || shortenAddress(shame.from)
  const toDisplay = shame.toDisplayName || shortenAddress(shame.to)
  const timeAgo = getTimeAgo(shame.timestamp)
  const judgmentHTML = shame.judgment ? `${shame.judgment}/10` : ''
  const amount = formatWankr(shame.amount)
  
  const transactionLink = shame.transactionHash ? 
    `https://basescan.org/tx/${shame.transactionHash}` : ''

  return (
    <div style={{
      background: isNew ? 'rgba(255, 107, 107, 0.08)' : 'rgba(255, 255, 255, 0.02)',
      border: isNew ? '1px solid rgba(255, 107, 107, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '6px',
      padding: '0.5rem',
      transition: 'all 0.3s ease',
      animation: isNew ? 'slideDown 0.5s ease-out' : 'none',
      backdropFilter: 'blur(10px)',
      marginBottom: '0.4rem',
      minHeight: '3.2rem'
    }}>
      {/* Main content - single row layout */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: '0.5rem',
        height: '100%'
      }}>
        {/* Left side - transaction details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Transaction line */}
          <div style={{
            fontSize: '0.8rem',
            color: '#a0a0a0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px', // Increased from 5px to 12px for better spacing
            marginBottom: '0.3rem' // Space for shame message line
          }}>
            <span style={{ color: '#ff6b6b', fontWeight: '600' }}>{fromDisplay}</span>
            <span style={{ color: '#ff8e53', fontWeight: '500', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>shamed</span>
            <span style={{ color: '#a0a0a0', fontWeight: '500' }}>{toDisplay}</span>
          </div>
          
          {/* Dedicated shame message line */}
          <div style={{
            minHeight: '1rem', // Consistent height whether message exists or not
            marginBottom: '0.3rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            {shame.reason && (
              <div style={{
                color: '#e0e0e0',
                fontStyle: 'italic',
                lineHeight: '1.2',
                fontSize: '0.75rem',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                "{shame.reason}"
              </div>
            )}
          </div>
          
          {/* Time and link line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.7rem'
          }}>
            <div style={{
              color: '#888',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              {timeAgo}
            </div>
            
            {transactionLink && (
              <a 
                href={transactionLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  fontSize: '0.7em',
                  transition: 'all 0.2s ease',
                  padding: '1px 3px',
                  borderRadius: '3px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  whiteSpace: 'nowrap'
                }}
              >
                🔗
              </a>
            )}
          </div>
          
          {judgmentHTML && (
            <div style={{ marginTop: '0.2rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.05rem 0.3rem',
                borderRadius: '3px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: 'rgba(255, 107, 107, 0.2)',
                color: '#ff4757'
              }}>
                {judgmentHTML}
              </span>
            </div>
          )}
        </div>
        
        {/* Right side - amount */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          marginLeft: '1.5rem',
          marginRight: '0.25rem',
          flexShrink: 0,
          justifyContent: 'center',
          alignSelf: 'center'
        }}>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            lineHeight: '1',
            color: '#ff6b6b'
          }}>
            {amount}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: '0.9',
            color: '#ff8e53'
          }}>
            WANKR
          </div>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: '500',
            textAlign: 'center',
            opacity: '0.8',
            color: '#a0a0a0',
            marginTop: '2px',
            maxWidth: '80px',
            lineHeight: '1.2'
          }}>
            {getWankrAmountComment(shame.amount)}
          </div>
        </div>
      </div>
    </div>
  )
}

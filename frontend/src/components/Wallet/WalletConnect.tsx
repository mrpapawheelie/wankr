
import { useWallet } from '../../hooks/useWallet'

export function WalletConnect() {
  const { address, balance, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          padding: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{
            color: '#ff6b6b',
            marginBottom: '0.25rem',
            fontSize: '0.8rem'
          }}>
            Connected Wallet
          </h3>
          <div style={{
            fontFamily: 'Courier New, monospace',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            wordBreak: 'break-all'
          }}>
            {address}
          </div>
        </div>
        {balance && (
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ff8e53'
          }}>
            Balance: {parseFloat(balance).toFixed(2)} WANKR
          </div>
        )}
        <button 
          onClick={disconnectWallet}
          style={{
            background: 'linear-gradient(45deg, #ff4757, #ff3742)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={connectWallet}
      disabled={isConnecting}
      style={{
        background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
        border: 'none',
        color: 'white',
        padding: '0.4rem 0.8rem', // Reduced from 1rem 2rem
        borderRadius: '8px', // Reduced from 12px
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        fontSize: '1rem', // Reduced from 1.1rem
        fontWeight: '600',
        transition: 'all 0.3s ease',
        width: '100%',
        opacity: isConnecting ? 0.6 : 1
      }}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

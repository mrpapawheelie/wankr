import { type ReactNode } from 'react'

interface WalletSectionProps {
  children: ReactNode
}

export function WalletSection({ children }: WalletSectionProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 100,
      maxWidth: '120px'
    }}>
      <div style={{
        
        borderRadius: '6px',
        padding: '0.3rem',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}>
        {children}
      </div>
    </div>
  )
}

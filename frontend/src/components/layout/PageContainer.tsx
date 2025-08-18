import { type ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      overflowX: 'hidden'
    }}>
      {children}
    </div>
  )
}

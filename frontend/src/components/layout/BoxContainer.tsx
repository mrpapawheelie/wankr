import { type ReactNode, CSSProperties } from 'react'

interface BoxContainerProps {
  children: ReactNode
  minHeight?: string
  padding?: string
  style?: CSSProperties
}

export function BoxContainer({ children, minHeight = 'auto', padding = '2rem', style }: BoxContainerProps) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      minHeight,
      maxWidth: '100%', // Ensure boxes don't overflow
      ...style // Merge custom styles
    }}>
      {children}
    </div>
  )
}

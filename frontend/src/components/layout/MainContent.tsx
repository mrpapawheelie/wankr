import { type ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div style={{
      maxWidth: '1200px', // Reduced from 1400px
      margin: '0 auto',
      padding: '2rem',
      marginRight: '200px' // Reduced from 280px to center better
    }}>
      {children}
    </div>
  )
}

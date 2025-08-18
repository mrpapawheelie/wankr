import { type ReactNode } from 'react'

interface GridLayoutProps {
  children: ReactNode
  columns?: number
  gap?: string
  marginBottom?: string
}

export function GridLayout({ children, columns = 2, gap = '2rem', marginBottom = '2rem' }: GridLayoutProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      marginBottom
    }}>
      {children}
    </div>
  )
}

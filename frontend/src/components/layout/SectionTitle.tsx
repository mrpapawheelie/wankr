import { type ReactNode } from 'react'

interface SectionTitleProps {
  children: ReactNode
  textAlign?: 'left' | 'center' | 'right'
}

export function SectionTitle({ children, textAlign = 'left' }: SectionTitleProps) {
  return (
    <h2 style={{
      fontSize: '1.5rem',
      marginBottom: '1rem',
      color: '#ff6b6b',
      textAlign
    }}>
      {children}
    </h2>
  )
}

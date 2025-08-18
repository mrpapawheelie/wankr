export function Header() {
  return (
    <header style={{
      textAlign: 'center',
      padding: '2rem',
      marginBottom: '2rem' // Reduced from 3rem to 1.5rem
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: '700',
        background: 'linear-gradient(45deg, #ff6b6b, #ff8e53, #ff6b6b)',
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'gradient 3s ease infinite',
        marginBottom: '1rem'
      }}>
        🚀 WANKR
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#a0a0a0',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        The Dark Mirror of the Base Chain - Where BankerBot optimized trades, WANKR GYATT optimized shame.
      </p>
    </header>
  )
}

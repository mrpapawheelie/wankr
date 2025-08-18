import { useEffect } from 'react'
import { WalletConnect } from './components/Wallet/WalletConnect'
import { ShameFeed } from './components/ShameFeed/ShameFeed'
import { Leaderboard } from './components/Leaderboard/Leaderboard'
import { SendWankr } from './components/SendWankr/SendWankr'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageContainer } from './components/layout/PageContainer'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { MainContent } from './components/layout/MainContent'
import { WalletSection } from './components/layout/WalletSection'
import { BoxContainer } from './components/layout/BoxContainer'
import { SectionTitle } from './components/layout/SectionTitle'
import { addNotificationStyles } from './utils/ui'

function App() {
  useEffect(() => {
    // Add notification styles
    addNotificationStyles()
  }, [])

  return (
    <PageContainer>
      <Header />
      
      <WalletSection>
        <WalletConnect />
      </WalletSection>

      <MainContent>
        {/* Top Row - Shame Feed and Send WANKR */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Live Shame Feed (Top Left) */}
          <BoxContainer minHeight="350px" padding="1.75rem">
            <SectionTitle>🎭 Live Shame Feed</SectionTitle>
            <ErrorBoundary>
              <ShameFeed />
            </ErrorBoundary>
          </BoxContainer>

          {/* Send WANKR (Top Right) */}
          <BoxContainer minHeight="350px" padding="1.75rem">
            <SectionTitle>🎭 Deliver Shame</SectionTitle>
            <ErrorBoundary>
              <SendWankr />
            </ErrorBoundary>
          </BoxContainer>
        </div>

        {/* Leaderboard (Full Width) */}
        <BoxContainer padding="1.75rem" style={{ width: '100%' }}>
          <SectionTitle textAlign="center">🏆 Leaderboards</SectionTitle>
          <ErrorBoundary>
            <Leaderboard />
          </ErrorBoundary>
        </BoxContainer>
      </MainContent>

      <Footer />

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
          
          .wallet-section {
            position: static;
            margin-bottom: 2rem;
          }
          
          .card {
            padding: 1.5rem;
            min-height: auto;
          }
        }
      `}</style>
    </PageContainer>
  )
}

export default App

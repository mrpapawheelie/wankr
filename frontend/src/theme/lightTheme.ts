export const lightTheme = {
  colors: {
    // Primary colors
    primary: '#3b82f6',
    primaryGradient: 'linear-gradient(45deg, #3b82f6, #1d4ed8, #3b82f6)',
    secondary: '#1d4ed8',
    
    // Background colors
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    
    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    
    // Button colors
    buttonPrimary: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
    buttonDanger: 'linear-gradient(45deg, #ef4444, #dc2626)',
    buttonSecondary: 'rgba(0, 0, 0, 0.05)',
    
    // Input colors
    inputBackground: 'rgba(255, 255, 255, 0.9)',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.02)',
    overlayHover: 'rgba(0, 0, 0, 0.04)',
    
    // Live status
    liveStatus: '#10b981',
    liveStatusBg: 'rgba(16, 185, 129, 0.1)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '2.5rem',
    xxxl: '3rem'
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    xxl: '16px'
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    xxxl: '2rem',
    huge: '3.5rem'
  }
} as const

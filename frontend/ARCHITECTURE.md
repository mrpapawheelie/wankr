# WANKR Frontend Architecture

## 🏗️ Modular Component Architecture

The frontend has been refactored to use a modular, reusable component architecture that makes it easy to maintain and modify.

## 📁 Directory Structure

```
src/
├── components/
│   ├── layout/           # Reusable layout components
│   │   ├── PageContainer.tsx
│   │   ├── BoxContainer.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MainContent.tsx
│   │   ├── WalletSection.tsx
│   │   ├── GridLayout.tsx
│   │   └── SectionTitle.tsx
│   ├── Wallet/           # Wallet-related components
│   ├── ShameFeed/        # Shame feed components
│   ├── Leaderboard/      # Leaderboard components
│   └── SendWankr/        # Send WANKR components
├── theme/                # Centralized theming system
│   ├── colors.ts
│   ├── spacing.ts
│   └── index.ts
├── services/             # Business logic
├── hooks/                # React hooks
└── utils/                # Utility functions
```

## 🎨 Theme System

### Centralized Styling
All colors, spacing, and typography are defined in the theme system:

```typescript
// src/theme/index.ts
export const theme = {
  colors: {
    primary: '#ff6b6b',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    // ... more colors
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    // ... more spacing
  },
  // ... more theme properties
}
```

### Easy Theme Switching
To change the entire site theme, just update the theme object:

```typescript
// Example: Switch to light theme
import { lightTheme } from './theme/lightTheme'
// Update components to use lightTheme instead of theme
```

## 🧩 Reusable Components

### Layout Components

#### `PageContainer`
- Provides the overall page layout
- Sets background, font family, and basic styling
- **Change here to modify the entire page appearance**

#### `BoxContainer`
- Reusable card/box styling
- Consistent background, border, and padding
- **Change here to modify all card appearances**

#### `GridLayout`
- Flexible grid system
- Configurable columns, gap, and margin
- **Change here to modify layout structure**

#### `SectionTitle`
- Consistent title styling
- Configurable text alignment
- **Change here to modify all section titles**

### Benefits

1. **Single Source of Truth**: Change one component to update the entire site
2. **Consistency**: All similar elements use the same styling
3. **Maintainability**: Easy to find and modify specific styles
4. **Reusability**: Components can be used anywhere in the app
5. **Theme Switching**: Easy to implement dark/light mode or custom themes

## 🔧 How to Modify

### Change All Card Styling
Edit `src/components/layout/BoxContainer.tsx`:
```typescript
// Change background, border, or padding here
background: 'rgba(255, 255, 255, 0.05)',
border: '1px solid rgba(255, 255, 255, 0.1)',
```

### Change All Colors
Edit `src/theme/colors.ts`:
```typescript
export const colors = {
  primary: '#your-new-color',
  // ... update other colors
}
```

### Change Layout Structure
Edit `src/components/layout/MainContent.tsx` or `GridLayout.tsx`:
```typescript
// Modify grid columns, spacing, or layout
gridTemplateColumns: '1fr 1fr 1fr', // 3 columns instead of 2
```

### Add New Theme
Create `src/theme/customTheme.ts`:
```typescript
export const customTheme = {
  colors: { /* your colors */ },
  spacing: { /* your spacing */ },
  // ... other theme properties
}
```

## 🚀 Performance Optimizations

- **Error Boundaries**: Each major section is wrapped in error boundaries
- **Lazy Loading**: Components can be easily made lazy-loadable
- **Optimized Rendering**: Minimal re-renders with proper component structure
- **Leaderboard Pagination**: Shows 20 items initially, expandable to 50

## 📱 Responsive Design

The layout components automatically handle responsive design:
- Mobile-friendly grid layouts
- Responsive spacing and typography
- Adaptive wallet section positioning

## 🎯 Best Practices

1. **Use Layout Components**: Always use `BoxContainer`, `GridLayout`, etc.
2. **Theme Consistency**: Use theme values instead of hardcoded styles
3. **Component Composition**: Build complex layouts by composing simple components
4. **Error Handling**: Wrap components in `ErrorBoundary` for stability
5. **Performance**: Use the expand functionality for large datasets

This architecture makes the codebase much more maintainable and allows for easy customization and theming!

/**
 * Wankr Color Scheme
 * 
 * This file contains all the color values and utility functions for the Wankr design system.
 * Use these colors consistently across your components for a cohesive brand experience.
 */

// Core Brand Colors
export const wankrColors = {
  // Primary Brand Color
  primary: "#7630D9", // Wankr-Gyatt-3 - buttons, links, key accents
  
  // Secondary Colors
  secondary: "#79F2E6", // Neon accent for highlights
  accent: "#F06BF2", // Pink accent for gradients
  
  // Cyber/UI Colors
  cyber: "#04588C", // Borders, underlines, subtle dividers
  
  // Text Colors
  textPrimary: "#532473", // Main text on light backgrounds
  textSecondary: "#7A5A8A", // Secondary text on light backgrounds
  
  // Background Colors
  backgroundLight: "#FAFAFF", // Light mode background
  backgroundDark: "#1a1a1a", // Dark mode background
  cardLight: "#FFFFFF", // Light mode card background
  cardDark: "#2a2a2a", // Dark mode card background
} as const;

// Gradient Definitions
export const wankrGradients = {
  // Hero gradient for main headlines
  hero: "linear-gradient(90deg, #F06BF2 0%, #7630D9 50%, #79F2E6 100%)",
  
  // CTA button gradient
  cta: "linear-gradient(135deg, #7630D9 0%, #04588C 100%)",
  
  // Section background stripe
  section: "radial-gradient(circle at 20% 10%, #F06BF2 0%, transparent 40%), radial-gradient(circle at 80% 80%, #04588C 0%, transparent 45%)",
} as const;

// Hover Effects
export const wankrHoverEffects = {
  // Cyber shift effect for buttons
  cyberShift: "linear-gradient(135deg, #7630D9 0%, #04588C 100%)",
  
  // Subtle glow effect
  glow: "0 0 20px rgba(118, 48, 217, 0.3)",
} as const;

// Accessibility Color Pairs
export const wankrAccessibility = {
  // High contrast text combinations
  lightMode: {
    primary: "#7630D9", // Primary button
    onPrimary: "#FFFFFF", // Text on primary
    background: "#FAFAFF", // Page background
    text: "#532473", // Main text
    secondaryText: "#7A5A8A", // Secondary text
  },
  darkMode: {
    primary: "#7630D9", // Primary button
    onPrimary: "#FFFFFF", // Text on primary
    background: "#0C0A12", // Page background
    text: "#FFFFFF", // Main text
    secondaryText: "#79F2E6", // Secondary text
  },
} as const;

// Usage Examples
export const wankrUsageExamples = {
  // Button Styles
  button: {
    primary: "bg-wankr-primary text-white hover:bg-gradient-to-r hover:from-wankr-primary hover:to-wankr-cyber",
    secondary: "bg-wankr-cyber text-white hover:bg-opacity-80",
    outline: "border border-wankr-cyber text-wankr-cyber hover:bg-wankr-cyber hover:text-white",
  },
  
  // Text Styles
  text: {
    hero: "text-gradient-hero", // Custom utility class
    primary: "text-wankr-primary",
    secondary: "text-wankr-secondary",
    cyber: "text-cyber", // Custom utility class
  },
  
  // Background Styles
  background: {
    hero: "bg-gradient-hero", // Custom utility class
    cta: "bg-gradient-cta", // Custom utility class
    section: "bg-gradient-section", // Custom utility class
    cyber: "bg-cyber", // Custom utility class
  },
  
  // Border Styles
  border: {
    cyber: "border-cyber", // Custom utility class
    primary: "border-wankr-primary",
    accent: "border-wankr-accent",
  },
} as const;

// CSS Custom Properties for use in styled-components or CSS-in-JS
export const wankrCSSVars = {
  "--wankr-primary": wankrColors.primary,
  "--wankr-secondary": wankrColors.secondary,
  "--wankr-accent": wankrColors.accent,
  "--wankr-cyber": wankrColors.cyber,
  "--wankr-text-primary": wankrColors.textPrimary,
  "--wankr-text-secondary": wankrColors.textSecondary,
  "--wankr-background-light": wankrColors.backgroundLight,
  "--wankr-background-dark": wankrColors.backgroundDark,
} as const;

// Type definitions for TypeScript
export type WankrColor = typeof wankrColors[keyof typeof wankrColors];
export type WankrGradient = typeof wankrGradients[keyof typeof wankrGradients];
export type WankrHoverEffect = typeof wankrHoverEffects[keyof typeof wankrHoverEffects];

# Wankr Color Scheme Documentation

This document outlines the custom color scheme implemented for the Wankr project, designed to work seamlessly with shadcn/ui and Tailwind CSS.

## 🎨 Color Palette

### Core Brand Colors
- **Primary (Wankr-Gyatt-3)**: `#7630D9` - Used for buttons, links, and key accents
- **Secondary**: `#79F2E6` - Neon accent for highlights and secondary elements
- **Accent**: `#F06BF2` - Pink accent for gradients and special effects
- **Cyber**: `#04588C` - Used for borders, underlines, and subtle dividers

### Text Colors
- **Primary Text**: `#532473` - Main text on light backgrounds
- **Secondary Text**: `#7A5A8A` - Secondary text on light backgrounds
- **Dark Mode Text**: `#FFFFFF` - Main text on dark backgrounds
- **Dark Mode Secondary**: `#79F2E6` - Secondary text on dark backgrounds

### Background Colors
- **Light Mode**: `#FAFAFF` - Near-white background
- **Dark Mode**: `#0C0A12` - Very dark background
- **Card Light**: `#FFFFFF` - Light mode card background
- **Card Dark**: `#1A1620` - Dark mode card background

## 🌈 Gradients

### Hero Gradient
```css
linear-gradient(90deg, #F06BF2 0%, #7630D9 50%, #79F2E6 100%)
```
Perfect for main headlines and hero text.

### CTA Button Gradient
```css
linear-gradient(135deg, #7630D9 0%, #04588C 100%)
```
Used for call-to-action buttons with cyber shift effect.

### Section Background
```css
radial-gradient(circle at 20% 10%, #F06BF2 0%, transparent 40%), 
radial-gradient(circle at 80% 80%, #04588C 0%, transparent 45%)
```
Subtle background stripe for sections.

## 🚀 Usage

### Tailwind Classes

#### Background Colors
```tsx
<div className="bg-wankr-primary">Primary background</div>
<div className="bg-wankr-secondary">Secondary background</div>
<div className="bg-wankr-accent">Accent background</div>
<div className="bg-wankr-cyber">Cyber background</div>
```

#### Text Colors
```tsx
<h1 className="text-wankr-primary">Primary text</h1>
<p className="text-wankr-secondary">Secondary text</p>
<span className="text-wankr-accent">Accent text</span>
```

#### Gradients
```tsx
<h1 className="text-gradient-hero">Hero text</h1>
<div className="bg-gradient-cta">CTA section</div>
<section className="bg-gradient-section">Background stripe</section>
```

#### Borders
```tsx
<div className="border-cyber">Cyber border</div>
<div className="border-wankr-primary">Primary border</div>
<div className="border-wankr-accent">Accent border</div>
```

### Custom Utility Classes

The following custom utility classes are available:

- `.text-gradient-hero` - Applies hero gradient to text
- `.bg-gradient-cta` - Applies CTA gradient to background
- `.bg-gradient-section` - Applies section background gradient
- `.hover-cyber` - Cyber shift hover effect
- `.border-cyber` - Cyber border color
- `.text-cyber` - Cyber text color
- `.bg-cyber` - Cyber background color

### CSS Variables

All colors are available as CSS custom properties:

```css
:root {
  --wankr-primary: #7630D9;
  --wankr-secondary: #79F2E6;
  --wankr-accent: #F06BF2;
  --wankr-cyber: #04588C;
  --wankr-text-primary: #532473;
  --wankr-text-secondary: #7A5A8A;
}
```

## 🎯 Component Examples

### Buttons
```tsx
// Primary button with hover effect
<button className="bg-wankr-primary text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r hover:from-wankr-primary hover:to-wankr-cyber transition-all duration-300">
  Click me
</button>

// Secondary button
<button className="bg-wankr-cyber text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition-all duration-300">
  Secondary action
</button>

// Outline button
<button className="border border-wankr-cyber text-wankr-cyber px-6 py-3 rounded-lg hover:bg-wankr-cyber hover:text-white transition-all duration-300">
  Outline style
</button>
```

### Cards
```tsx
<div className="bg-card border border-wankr-cyber rounded-lg p-6">
  <h3 className="text-wankr-primary font-bold mb-2">Card Title</h3>
  <p className="text-foreground">Card content with proper contrast</p>
</div>
```

### Hero Sections
```tsx
<section className="bg-gradient-section p-12 rounded-lg">
  <h1 className="text-gradient-hero text-6xl font-bold text-center mb-4">
    SHAME
  </h1>
  <p className="text-center text-white text-xl">
    Experience the Wankr aesthetic
  </p>
</section>
```

## ♿ Accessibility

All color combinations have been tested for WCAG compliance:

- **Primary button** (`#7630D9`) with white text passes WCAG AA for normal text
- **Dark text** (`#532473`) on light background (`#FAFAFF`) provides excellent contrast
- **Cyber accent** (`#04588C`) ensures readable borders and dividers
- Neon colors are used sparingly and only for accents, not body copy

## 🔧 Customization

### Adding New Colors
To add new colors to the system:

1. Add the color to `lib/colors.ts`
2. Add CSS variables to `app/globals.css`
3. Extend the Tailwind config in `tailwind.config.ts`

### Modifying Existing Colors
Colors can be modified by updating the values in `app/globals.css`. The changes will automatically apply to all components using the color system.

## 📱 Dark Mode Support

The color scheme automatically adapts to dark mode:

- Light backgrounds become dark
- Text colors adjust for optimal contrast
- Accent colors remain consistent for brand recognition
- Gradients and special effects work in both themes

## 🎨 Design Principles

1. **Consistency**: Use the same colors for the same purposes across the app
2. **Accessibility**: Ensure all text meets WCAG contrast requirements
3. **Brand Identity**: Maintain the cyberpunk aesthetic with the primary purple
4. **Subtlety**: Use gradients and effects sparingly for maximum impact
5. **Readability**: Prioritize text legibility over visual effects

## 🚀 Getting Started

1. Import the color utilities: `import { wankrColors, wankrUsageExamples } from "@/lib/colors"`
2. Use Tailwind classes: `className="bg-wankr-primary text-white"`
3. Apply custom utilities: `className="text-gradient-hero"`
4. Reference the showcase component for examples

For more examples, see the `ColorShowcase` component in `components/ui/color-showcase.tsx`.

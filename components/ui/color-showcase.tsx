"use client";

import { wankrColors, wankrGradients, wankrUsageExamples } from "@/lib/colors";

export function ColorShowcase() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-section p-8 rounded-lg">
        <h1 className="text-gradient-hero text-6xl font-bold text-center mb-4">
          SHAME
        </h1>
        <p className="text-center text-white text-xl">
          Experience the Wankr color scheme in action
        </p>
      </section>

      {/* Color Palette Display */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-wankr-primary">Color Palette</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Primary */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg"
              style={{ backgroundColor: wankrColors.primary }}
            />
            <p className="text-sm font-mono">Primary</p>
            <p className="text-xs text-muted-foreground">{wankrColors.primary}</p>
          </div>

          {/* Secondary */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg"
              style={{ backgroundColor: wankrColors.secondary }}
            />
            <p className="text-sm font-mono">Secondary</p>
            <p className="text-xs text-muted-foreground">{wankrColors.secondary}</p>
          </div>

          {/* Accent */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg"
              style={{ backgroundColor: wankrColors.accent }}
            />
            <p className="text-sm font-mono">Accent</p>
            <p className="text-xs text-muted-foreground">{wankrColors.accent}</p>
          </div>

          {/* Cyber */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg"
              style={{ backgroundColor: wankrColors.cyber }}
            />
            <p className="text-sm font-mono">Cyber</p>
            <p className="text-xs text-muted-foreground">{wankrColors.cyber}</p>
          </div>

          {/* Text Primary */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg border border-border"
              style={{ backgroundColor: wankrColors.textPrimary }}
            />
            <p className="text-sm font-mono">Text Primary</p>
            <p className="text-xs text-muted-foreground">{wankrColors.textPrimary}</p>
          </div>

          {/* Text Secondary */}
          <div className="space-y-2">
            <div 
              className="w-20 h-20 rounded-lg shadow-lg border border-border"
              style={{ backgroundColor: wankrColors.textSecondary }}
            />
            <p className="text-sm font-mono">Text Secondary</p>
            <p className="text-xs text-muted-foreground">{wankrColors.textSecondary}</p>
          </div>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-wankr-primary">Button Styles</h2>
        
        <div className="flex flex-wrap gap-4">
          <button className={wankrUsageExamples.button.primary + " px-6 py-3 rounded-lg font-semibold transition-all duration-300"}>
            Primary Button
          </button>
          
          <button className={wankrUsageExamples.button.secondary + " px-6 py-3 rounded-lg font-semibold transition-all duration-300"}>
            Secondary Button
          </button>
          
          <button className={wankrUsageExamples.button.outline + " px-6 py-3 rounded-lg font-semibold transition-all duration-300"}>
            Outline Button
          </button>
          
          <button className="bg-gradient-cta text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
            CTA Gradient
          </button>
        </div>
      </section>

      {/* Text Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-wankr-primary">Text Styles</h2>
        
        <div className="space-y-4">
          <h3 className={wankrUsageExamples.text.hero + " text-4xl font-bold"}>
            Hero Gradient Text
          </h3>
          
          <p className={wankrUsageExamples.text.primary + " text-xl"}>
            Primary colored text
          </p>
          
          <p className={wankrUsageExamples.text.secondary + " text-xl"}>
            Secondary colored text
          </p>
          
          <p className={wankrUsageExamples.text.cyber + " text-xl"}>
            Cyber colored text
          </p>
        </div>
      </section>

      {/* Background Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-wankr-primary">Background Styles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={wankrUsageExamples.background.hero + " p-6 rounded-lg text-white text-center"}>
            <h4 className="font-bold mb-2">Hero Gradient</h4>
            <p>Perfect for main headlines</p>
          </div>
          
          <div className={wankrUsageExamples.background.cta + " p-6 rounded-lg text-white text-center"}>
            <h4 className="font-bold mb-2">CTA Gradient</h4>
            <p>Great for call-to-action sections</p>
          </div>
          
          <div className={wankrUsageExamples.background.cyber + " p-6 rounded-lg text-white text-center"}>
            <h4 className="font-bold mb-2">Cyber Background</h4>
            <p>Subtle cyber aesthetic</p>
          </div>
        </div>
      </section>

      {/* Border Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-wankr-primary">Border Styles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={wankrUsageExamples.border.cyber + " p-6 rounded-lg border-2"}>
            <h4 className="font-bold mb-2">Cyber Border</h4>
            <p>Clean, modern borders</p>
          </div>
          
          <div className={wankrUsageExamples.border.primary + " p-6 rounded-lg border-2"}>
            <h4 className="font-bold mb-2">Primary Border</h4>
            <p>Brand-focused borders</p>
          </div>
          
          <div className={wankrUsageExamples.border.accent + " p-6 rounded-lg border-2"}>
            <h4 className="font-bold mb-2">Accent Border</h4>
            <p>Highlighted borders</p>
          </div>
        </div>
      </section>

      {/* Accessibility Note */}
      <section className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-bold text-wankr-primary mb-2">Accessibility</h3>
        <p className="text-muted-foreground">
          All color combinations have been tested for WCAG compliance. The primary brand color (#7630D9) 
          with white text provides excellent contrast, and the cyber accent (#04588C) ensures readable 
          borders and dividers across both light and dark themes.
        </p>
      </section>
    </div>
  );
}

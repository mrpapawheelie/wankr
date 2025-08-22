# 🎭 Contributing to WANKR

Welcome to the WANKR Protocol! This guide shows you how to add one feature or component at a time.

## 🚀 Quick Start

### 1. Fork & Clone
```bash
# Fork this repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/wankr.git
cd wankr
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Development Server
```bash
pnpm dev
```

## 🎯 Adding One Feature at a Time

### **Rule: One PR = One Feature**
- ✅ **Good**: "Add dark mode toggle button"
- ❌ **Bad**: "Add dark mode, fix mobile layout, update colors, and add animations"

### **Step-by-Step Process:**

1. **Pick ONE small feature** you want to add
2. **Create a new branch** for that feature
3. **Make your changes** (just that one thing)
4. **Test it works** locally
5. **Submit a PR** with a clear description

## 🧩 Example: Adding a Simple Button

### **1. Create Feature Branch:**
```bash
git checkout -b add-cool-button
```

### **2. Add Your Component:**
```tsx
// components/ui/cool-button.tsx
export function CoolButton({ children, ...props }) {
  return (
    <button 
      className="px-4 py-2 bg-wankr-primary text-white rounded-lg hover:bg-wankr-accent"
      {...props}
    >
      {children}
    </button>
  );
}
```

### **3. Use It in a Page:**
```tsx
// app/page.tsx (add just this line)
import { CoolButton } from "@/components/ui/cool-button";

// Then somewhere in your JSX:
<CoolButton>Click Me!</CoolButton>
```

### **4. Test & Commit:**
```bash
pnpm dev          # Test it works
git add .         # Add your changes
git commit -m "feat: Add cool button component"
git push origin add-cool-button
```

### **5. Submit PR:**
- Go to your fork on GitHub
- Click "New Pull Request"
- Title: "Add cool button component"
- Description: "Simple button component with WANKR styling"

## 🎨 WANKR Design System

### **Colors (use these):**
- **Primary**: `bg-wankr-primary` (Purple)
- **Secondary**: `bg-wankr-secondary` (Cyan)  
- **Accent**: `bg-wankr-accent` (Pink)
- **Cyber**: `bg-wankr-cyber` (Dark Blue)

### **Components Location:**
- **UI Components**: `components/ui/`
- **Pages**: `app/`
- **Utilities**: `lib/`
- **Styles**: `app/globals.css`

## 📱 Mobile-First Development

### **Always Test Mobile:**
- Use `pnpm dev` and check mobile view
- Test on different screen sizes
- Ensure no horizontal scrolling

### **Responsive Classes:**
```tsx
// Mobile first approach
className="text-lg md:text-xl lg:text-2xl"  // Small → Medium → Large
className="flex-col md:flex-row"           // Stacked → Side by side
```

## 🚫 What NOT to Do

- ❌ **Don't change multiple files** in one PR
- ❌ **Don't add multiple features** at once
- ❌ **Don't modify existing working code** unless necessary
- ❌ **Don't ignore mobile layout**

## ✅ What TO Do

- ✅ **Pick ONE small feature** to add
- ✅ **Test on mobile** before submitting
- ✅ **Use WANKR colors** and design system
- ✅ **Write clear commit messages**
- ✅ **Keep PRs small and focused**

## 🎯 Good First Issues

- Add a new UI component (button, card, input)
- Add a new page section
- Improve mobile responsiveness
- Add hover effects or animations
- Update documentation

## 🆘 Need Help?

- **Check existing components** in `components/ui/`
- **Look at current pages** in `app/`
- **Ask in PR comments** if you're stuck
- **Keep it simple** - one thing at a time!

---

**Remember: Small, focused contributions are better than big, complex ones!** 🎭🚀

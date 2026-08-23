---
name: apple-design-system
description: UI/UX design and frontend implementation guidelines based on Apple's Human Interface Guidelines (HIG) for web applications, featuring macOS/iOS glassmorphism, continuous squircle curvature, materials and vibrancy, SF Pro typography hierarchy, and fluid spring micro-interactions.
---

# Apple Human Interface Guidelines (HIG) & Design System for Web Applications

When building or refining interfaces adhering to Apple's design principles, implement the three core pillars: **Clarity**, **Deference**, and **Depth**.

---

## 1. Core Principles

### A. Clarity
- **Legibility**: Text is crisp, high-contrast, and readable at all sizes with semantic weight hierarchy.
- **Precise Iconography**: Clean, consistent SF-Symbols-style stroke icons (1.5px to 2px stroke width, consistent optical sizing).
- **Functionality First**: Unnecessary decorative clutter is stripped away; every element serves a functional purpose.

### B. Deference
- **Fluid & Unobtrusive Surfaces**: The interface never competes with user content. Translucency and subtle blurs hint at underlying layers without obscuring context.
- **Content Focus**: Content takes center stage. Structural chrome (sidebars, toolbars, modal sheets) is lightweight and harmoniously integrated.

### C. Depth & Materials
- **Materials & Vibrancy**:
  - `systemUltraThinMaterial`: `background: rgba(22, 22, 28, 0.72); backdrop-filter: blur(24px) saturate(190%);`
  - `systemThinMaterial`: `background: rgba(30, 30, 38, 0.85); backdrop-filter: blur(28px) saturate(200%);`
  - Hairline Specular Borders: `border: 1px solid rgba(255, 255, 255, 0.08);` with a top highlight `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12);`
- **Hierarchical Shadowing**: Multi-tier drop shadows that simulate real-world ambient occlusion (`0 10px 30px -5px rgba(0, 0, 0, 0.6)`).

---

## 2. Geometry & Spatial Layout

- **Continuous Squircles**: Use smooth, continuous corner radius curves:
  - Cards & Containers: `border-radius: 20px;` or `border-radius: 24px;`
  - Modals & Sheets: `border-radius: 26px;`
  - Buttons & Inputs: `border-radius: 12px;` or `border-radius: 14px;`
  - Segmented Controls & Pills: `border-radius: 28px;`
- **Spacious Breathing Room**: Minimum 16px to 24px internal padding; uncluttered grid spacing (20px to 28px).

---

## 3. Typography Hierarchy

- **Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", -apple-system, sans-serif;`
- **Letter Spacing**:
  - Display Titles: `font-size: 1.6rem - 2.2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;`
  - Section Headings: `font-size: 1.15rem - 1.35rem; font-weight: 700; letter-spacing: -0.02em;`
  - Body Text: `font-size: 0.88rem - 0.92rem; font-weight: 400; line-height: 1.55; letter-spacing: -0.01em;`
  - Micro Captions: `font-size: 0.72rem - 0.78rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase;`

---

## 4. Tactile Micro-Interactions & Spring Physics

- **Hover States**: Subtle lift with spring easing:
  `transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;`
  `&:hover { transform: translateY(-2px); }`
- **Active Depress Feedback**: Immediate tactile responsiveness:
  `&:active { transform: scale(0.975); }`
- **Segmented Pill Controls**: Floating capsule switcher with subtle inner backdrop and high-contrast active pill indicator.

---

## 5. Color Harmonies & Eye Protection

- **Dark Mode Space Gray / Midnight**: `#0d0d11`, `#14141a`, `#1c1c24`, `#262632`.
- **Metallic Titanium & Copper**: `#d4a373`, `#c89666`, `#e5b982`.
- **Apple Emerald & Sage**: `#34d399`, `#849c86`.
- **System Destructive / Warning**: `#c47662`, `#ff6b6b`.
- **High-Contrast Text**: Primary `#f5f5f7`, Secondary `#a1a1a6`, Dim `#6e6e73`.

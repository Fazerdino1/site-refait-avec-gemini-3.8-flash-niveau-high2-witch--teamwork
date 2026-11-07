# Raycast CSS Design System Specification

## 1. Design Tokens & CSS Custom Properties
```css
:root {
  /* Fonts */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'GeistMono', ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Consolas, monospace;

  /* Color Palette - Void Dark Canvas */
  --bg-void: #07080a;
  --bg-surface: #0c0d0f;
  --bg-card: rgba(18, 19, 23, 0.7);
  --bg-card-hover: rgba(26, 27, 33, 0.85);
  --bg-card-gradient: linear-gradient(137deg, rgba(20, 20, 24, 0.75) 4.87%, rgba(12, 13, 15, 0.9) 75.88%);
  --bg-pill: rgba(22, 23, 28, 0.85);

  /* Color Palette - Neutrals */
  --color-fg: #f4f4f6;
  --color-fg-muted: #8b8d98;
  --color-fg-subtle: #525462;
  --color-fg-white: #ffffff;

  /* Borders & Highlights */
  --color-border: #242728;
  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.18);
  --color-border-highlight: rgba(255, 255, 255, 0.25);

  /* Accents - Raycast Signature Crimson */
  --accent-crimson: #ff6363;
  --accent-crimson-hover: #ff7b7b;
  --accent-crimson-glow: #fa7e7e;
  --accent-crimson-subtle: rgba(255, 99, 99, 0.12);
  --accent-crimson-badge: rgba(255, 99, 99, 0.2);

  /* Secondary Accents */
  --accent-blue: #57c1ff;
  --accent-yellow: #ffc533;
  --accent-green: #59d499;
  --accent-purple: #d3b2ff;

  /* Glassmorphism & Elevation */
  --glass-blur-sm: 8px;
  --glass-blur-md: 16px;
  --glass-blur-lg: 32px;
  --shadow-elevation: 0 25px 60px rgba(0, 0, 0, 0.8);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 30px rgba(255, 99, 99, 0.25);

  /* Sizing & Layout */
  --container-max-width: 1204px;
  --navbar-height: 58px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 9999px;

  /* Spotlight mouse variables */
  --mouse-x: 50%;
  --mouse-y: 50%;
}
```

## 2. Key Component CSS Rules

### 2.1 Floating Pill Navbar (`#ray-navbar`)
```css
#ray-navbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: var(--container-max-width);
  height: var(--navbar-height);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: linear-gradient(137deg, rgba(17, 18, 20, 0.8) 0%, rgba(12, 13, 15, 0.92) 100%);
  backdrop-filter: blur(var(--glass-blur-md));
  -webkit-backdrop-filter: blur(var(--glass-blur-md));
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}
```

### 2.2 3D Mechanical Keyboards & Illuminated Trigger
```css
.ray-keycap {
  background: radial-gradient(75% 75% at 50% 92%, #151515 0%, #0d0d0d 100%);
  border-radius: 8px;
  box-shadow: 0 2px 1px 2px rgba(0, 0, 0, 0.5),
              0 0 1px 1px #000000,
              inset 0 2px 1px 1px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px 1px rgba(255, 255, 255, 0.12);
  color: var(--color-fg-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.15s ease;
}

.ray-keycap.glowing,
.ray-keycap[data-illuminated="true"] {
  background: linear-gradient(180deg, #181818 0%, #242424 100%);
  color: #ffcdcd;
  text-shadow: 0 0 6px var(--accent-crimson);
  border-color: rgba(255, 99, 99, 0.4);
  box-shadow: 0 0 16px 8px rgba(255, 99, 99, 0.18),
              0 0 6px 2px rgba(255, 99, 99, 0.25),
              inset 1px 0.5px 1px rgba(255, 118, 118, 0.35),
              inset 0 0 1px 1px rgba(255, 255, 255, 0.45);
}

.ray-keycap.glowing::before,
.ray-keycap[data-illuminated="true"]::before {
  content: "";
  position: absolute;
  inset: -15% -10%;
  z-index: -1;
  filter: blur(16px);
  background: radial-gradient(56% 65%, var(--accent-crimson-glow) 0%, rgba(249, 112, 112, 0) 100%);
  pointer-events: none;
}
```

### 2.3 Command Launcher Modal & Overlays
```css
#ray-launcher-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  background: rgba(7, 8, 10, 0.8);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

#ray-launcher-modal.is-open,
#ray-launcher-modal[aria-hidden="false"] {
  opacity: 1;
  pointer-events: auto;
}

#ray-launcher-modal .ray-launcher-box {
  width: 100%;
  max-width: 680px;
  background: rgba(17, 18, 23, 0.98);
  border: 1px solid var(--color-border-highlight);
  border-radius: var(--radius-lg);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.1);
  transform: translateY(-16px);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

#ray-launcher-modal.is-open .ray-launcher-box,
#ray-launcher-modal[aria-hidden="false"] .ray-launcher-box {
  transform: translateY(0);
}
```

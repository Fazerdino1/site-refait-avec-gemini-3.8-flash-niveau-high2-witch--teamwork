# Milestone 2 (M2: CSS Design System & Visual Polish) Briefing

## Executive Summary
Milestone 2 is responsible for embedding a production-grade, highly-polished CSS design system into `index.html`.
The visual design directly reflects Raycast's signature aesthetic: pure void dark theme, high-voltage glowing crimson bloom, frosted glassmorphism pills and cards, tactile 3D mechanical keycaps with illuminated shortcuts, and responsive layouts across all viewports (1440px, 1024px, 768px, 480px).

## Authoritative Inputs & References
- Original Request: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/.agents/teamwork/ORIGINAL_REQUEST.md`
- Project Scope: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/PROJECT.md`
- Visual Specification & Tokens: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/.agents/teamwork/teamwork_preview_explorer_survey_1/handoff.md`
- DOM Layout Handoff: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/.agents/teamwork/sub_orch_m1_dom/handoff.md`
- Target Deliverable: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/index.html`

## Core Styling Requirements
1. **True Raycast Void Dark Palette**:
   - Canvas background: `--bg-void: #07080a`, `--color-bg-100: #101111`, `--color-bg-200: #18191a`, `--color-bg-300: #313133`
   - Foreground / Typography: `--color-fg: #f4f4f6`, `--color-fg-200: #c2c7ca`, `--color-fg-300: #78787c`, `--color-fg-400: #5e6366`
   - Borders: `--color-border: #242728`, border highlights `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.15)`
2. **High-Voltage Glowing Crimson Bloom**:
   - Signature Raycast Crimson: `--red-dark: #ff6363`, `--color-red: #ff6161`, `--accent-glow: #fa7e7e`
   - Volumetric multi-stop linear/radial gradients, angled red light streak backdrop
   - Ambient spotlight gradient tracking `--mouse-x` and `--mouse-y`
3. **Glassmorphism Layering**:
   - Floating pill navbar: `backdrop-filter: blur(16px)`, `background: linear-gradient(137deg, rgba(17, 18, 20, 0.8) 0%, rgba(12, 13, 15, 0.92) 100%)`, 1px border highlight `rgba(255, 255, 255, 0.08)`, subtle box shadow
   - Cards & Bento containers: `backdrop-filter: blur(10px)`, `background: linear-gradient(137deg, rgba(17, 18, 20, 0.75) 4.87%, rgba(12, 13, 15, 0.9) 75.88%)`
   - Modal backdrops: `backdrop-filter: blur(24px)`, dark overlay
4. **Hero Section Styling**:
   - Red light streak atmospheric canvas
   - Typography hierarchy (H1 bold -0.02em letter spacing, crisp lead paragraph)
   - Dual-shadow Apple Download button
   - Rotating glowing conic gradient announcement capsule (`The Raycast Keyboard →`)
   - Monospace requirement badge and terminal command install links
5. **macOS Desktop Showcase (`#ray-desktop-showcase`)**:
   - macOS dark title bar, traffic light window controls (red `#ff5f56`, yellow `#ffbd2e`, green `#27c93f`)
   - Centered floating window (`.ray-window`): `backdrop-filter: blur(36px)`, `box-shadow: 0 25px 60px rgba(0,0,0,0.8)`
   - Two-pane layout: Master list with active crimson pill background, Detail preview pane with luminous torus ring and metadata table
   - Footer action bar with `<kbd>` shortcut badges (`↵`, `⌘`, `K`)
   - Floating 5-tab switcher dock with glowing tooltips
6. **3D Mechanical Keyboard Simulation**:
   - Mac layout tactile keycaps with multi-layer inset shadows, bevels, subtle top specular highlight
   - Illuminated trigger shortcut (`command` + `Spacebar`): warm radial bloom underglow (`radial-gradient(56% 65%, #fa7e7e 0%, rgba(249, 112, 112, 0) 100%)`), text glow, glowing border
7. **Extensions Store Grid & Filters**:
   - Responsive grid (auto-fill / 3 columns desktop, 2 columns tablet, 1 mobile)
   - Category pills with active states
   - Extension card hover elevation, rating stars, install badges
8. **Raycast AI Bento Grid**:
   - Multi-column responsive bento cards with glowing border highlights
   - AI Chat tool-calling sequence cards, Quick AI chip pills, AI Extensions integration node badges
9. **Wall of Love / Testimonials**:
   - Multi-column masonry/grid layout
   - Verified badges, subtle hover borders, author avatar styling
10. **Developer Platform & Community**:
    - Syntax-highlighted dark code preview box with line numbers and copy badge
    - Community cards (Slack, X) with brand colors and follower count monospace badges
    - YouTube video carousel with hover scale (`transform: scale(1.04)`)
11. **Comprehensive 6-Column Footer**:
    - Semantic grid, typography hierarchy, newsletter input with inline submit button and system status pulsing dot
12. **Modals, Overlays & Toasts**:
    - Global Command Launcher Modal (`#ray-launcher-modal`): smooth slide-down animation, fuzzy search input, action panel popover
    - Toast container (`#ray-toast-container`): floating bottom-right feedback toasts
13. **Responsive Breakpoints**:
    - 1440px desktop max-width
    - 1024px tablet landscape
    - 768px tablet portrait / small screen
    - 480px mobile view

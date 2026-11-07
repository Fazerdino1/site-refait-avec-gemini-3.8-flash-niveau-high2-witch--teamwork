# Project: Raycast Landing Page Recreation

## Architecture
The application is a single-file, production-grade, highly-polished web application contained entirely in `index.html`, designed for 100% static hosting compatibility on GitHub Pages.

```
index.html Architecture:
┌─────────────────────────────────────────────────────────────────────────────┐
│ <!DOCTYPE html>                                                             │
│ ├── <head>                                                                  │
│ │   ├── Meta tags (UTF-8, viewport, title, description, OpenGraph)          │
│ │   ├── Font imports (Inter / SF Pro font display)                          │
│ │   └── <style> Design System, Tokens, Glassmorphism, Animations, Layouts   │
│ ├── <body>                                                                  │
│ │   ├── Section 0: Sticky Glass Floating Pill Header (Nav & CTAs)           │
│ │   ├── Section 1: Hero Section (H1, Red motion streak, Download CTA, Modals)│
│ │   ├── Section 2: macOS Desktop Frame & Launcher Showcase (5 Dock Tabs)    │
│ │   │   ├── Mode 1: Clipboard History (Filter dropdown, 2-pane list+preview)│
│ │   │   ├── Mode 2: Raycast AI (Prompt chips, Typewriter streaming demo)    │
│ │   │   ├── Mode 3: Emoji & Symbols (Glyph grid, large inspector, copy)     │
│ │   │   ├── Mode 4: Snippets (Dynamic variable placeholders, copy demo)     │
│ │   │   └── Mode 5: Window Management (Interactive window snapping preview) │
│ │   ├── Section 3: Keyboard Ergonomics ("It's not about saving time")       │
│ │   ├── Section 4: Extensions Store (Filters, 18 extension cards, carousel) │
│ │   ├── Section 5: Raycast AI Bento Grid (Chat tool-calls, Quick AI, Agent) │
│ │   ├── Section 6: Testimonials & Wall of Love (24 tech figures)            │
│ │   ├── Section 7: Snippets, Automation & Quicklinks (12 sub-features)      │
│ │   ├── Section 8: Developer Platform & API (React/TypeScript code preview) │
│ │   ├── Section 9: Community & Social Engagement (Slack, X, YouTube carousel)│
│ │   ├── Section 10: Pro & Teams Pricing Teaser                              │
│ │   ├── Section 11: Final Download & 3D Glowing Mechanical Keyboard CTA     │
│ │   ├── Section 12: 6-Column Semantic Footer (63 links, Newsletter, Status) │
│ │   ├── Modal Overlay: Global Interactive Command Launcher (⌘K / Ctrl+K)   │
│ │   └── Toast Notification Container                                        │
│ └── <script> Modular Vanilla ECMAScript 2022+ Dynamic Engine                │
│     ├── EventBus & Toast Notification System                                │
│     ├── Global Keyboard Shortcuts (⌘K, Escape, Arrows, Enter)               │
│     ├── Interactive Command Launcher (Fuzzy Search, Action Panel)           │
│     ├── Desktop Window 5-Tab Showcase State Machine                         │
│     ├── Typewriter AI Streaming Engine                                      │
│     ├── Interactive Window Snapping Simulation                              │
│     ├── Extension Store Live Search & Category Filtering                    │
│     └── Ambient Spotlight Mouse-tracking Glow & Scroll Reveal Engine        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Sticky Glass Pill Navbar | Floating blurred pill with Raycast logo, 9 nav links, login, and Apple download CTA | M1, M2 | survey 1, 2 |
| 2 | Hero Announcement & Motion Banner | Red motion streak glow, "Your shortcut to everything.", download CTAs, Homebrew hint, Raycast Keyboard link | M1, M2 | survey 1, 2 |
| 3 | macOS Frame & Command Showcase | macOS desktop chrome, menu bar, and command bar container | M1, M2 | survey 1, 2, 4 |
| 4 | 5-Tab Dock Feature Switcher | Interactive dock pills switching between 5 built-in core features | M1, M3 | survey 2, 3, 4 |
| 5 | Clipboard History Simulation | 2-pane list + metadata preview table, type dropdown filter [Images Only ▾], copy action | M1, M3 | survey 2, 3, 4 |
| 6 | Raycast AI Interactive Streaming | Suggested prompt chips, character-by-character typewriter streaming response | M1, M3 | survey 2, 3 |
| 7 | Emoji & Symbols Picker | Grid of unicode symbols/emojis, large preview inspector, one-click copy | M1, M3 | survey 2, 3 |
| 8 | Snippets & Dynamic Placeholders | Snippet cards with dynamic variables (`{date}`, `{time}`), keyword triggers, copy | M1, M3 | survey 2, 3 |
| 9 | Window Management Simulator | Interactive snapping buttons (Left Half, Right Half, Maximize, Center) with animated preview window | M1, M3 | survey 2, 3 |
| 10 | Illuminated Keyboard Visualizer | 3D mechanical keyboard highlighting Command + Spacebar with warm radial glow bloom | M1, M2 | survey 1, 2 |
| 11 | Extensions Store Showcase | 4 category pills, search filter input, 18 extension cards with install count, rating, author | M1, M2, M3 | survey 2, 3 |
| 12 | Raycast AI Bento Grid | 3 Bento cards: Multi-step AI Chat, Quick AI floating prompt, AI Extensions | M1, M2 | survey 2 |
| 13 | Industry Testimonials Wall | 24 verified tech figures (Guillermo Rauch, MKBHD, Adam Wathan, etc.) with quotes and command badges | M1, M2 | survey 2 |
| 14 | Automations & Quicklinks Slider | 12 core sub-features with descriptions and shortcut tags | M1, M2 | survey 2 |
| 15 | Developer Platform API Section | React & TypeScript API showcase, code snippet preview, 4 architecture pillars | M1, M2 | survey 2 |
| 16 | Community Cards & YouTube Carousel | Slack card (37k), X/Twitter card (90k), 5 featured video tutorials carousel | M1, M2 | survey 1, 2 |
| 17 | Pro & Teams Pricing Teaser | Tier comparison cards (Free $0, Pro $8, Team $12, Enterprise) | M1, M2 | survey 2 |
| 18 | Final Download & Illuminated CTA | Closing banner with illuminated keys and download links | M1, M2 | survey 1, 2 |
| 19 | 6-Column Comprehensive Footer | 63 links across Product, Features, Extensions, Company, Community; newsletter form | M1, M2 | survey 2 |
| 20 | Global Command Launcher Modal (⌘K) | Modal launcher opened via ⌘K/Ctrl+K or CTA, live search, arrow keys, Enter execution, Action Panel | M1, M3 | survey 3 |
| 21 | Ambient Mouse Spotlight Glow | 60fps radial spotlight gradient tracking mouse coordinates (--mouse-x, --mouse-y) | M2, M3 | survey 1, 3 |
| 22 | Toast Notifications & Clipboard Feedback | Non-blocking toast feedback for copy actions (e.g. "Copied to clipboard!") | M3 | survey 3 |

## Milestones

### Implementation Track
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | DOM Structure & Semantic Layout | Complete HTML skeleton in `index.html`, all 13 sections, accessible semantic tags, all copy, and 18 inline SVGs | none | DONE (1,776 lines, 87 KB, Gate PASS) |
| M2 | CSS Design System & Visual Polish | Void dark theme, typography, glowing crimson underglow, glassmorphism, 3D mechanical keyboard, bento grids, responsive breakpoints | M1 | IN_PROGRESS (sub_orch: 0291c295dcfe7b06ba10aaa8d7fd462b) |
| M3 | Interactive JavaScript Systems | Vanilla JS engine: ⌘K modal, fuzzy filter, 5-tab desktop window state machine, AI typewriter, window snapping, store search, toasts, spotlight | M2 | PLANNED |
| M4 | Final Milestone (E2E Pass & Hardening) | Phase 1: 100% E2E test pass (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5) with Challenger + Forensic Auditor clean verdict | M3, TEST_READY.md | PLANNED |

### E2E Testing Track (Parallel)
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| T1 | E2E Testing Suite & Infrastructure | Autonomous opaque-box test runner covering Tiers 1-4 (>100 test cases) verifying DOM, styles, SVGs, responsiveness, launcher modal, and JS state machines; publishes `TEST_READY.md` | none | IN_PROGRESS (sub_orch: 92937ab305719f9a063e3fd5db4b8ece) |

## Interface Contracts
### DOM Structure (M1) ↔ CSS Design System (M2)
- Common CSS class naming convention (`.ray-*` prefix, e.g. `.ray-navbar`, `.ray-hero`, `.ray-card`, `.ray-launcher`, `.ray-store`, `.ray-bento`).
- Semantic attributes (`data-tab`, `data-category`, `data-shortcut`, `id="ray-launcher-modal"`, `id="ray-toast-container"`).
- Color CSS custom properties: `--bg-void: #07080a`, `--accent-crimson: #ff6363`, `--accent-glow: #fa7e7e`, `--text-primary: #ededed`, `--text-muted: #8b8d98`, `--card-bg: rgba(20, 20, 24, 0.7)`.

### CSS & Markup (M1, M2) ↔ JavaScript State Machine (M3)
- Global Launcher Modal: Element `#ray-launcher-modal` toggled via class `.is-open` or `[aria-hidden]`.
- Feature Dock: Buttons `[data-feature-tab]` activate corresponding panes `[data-feature-pane]`.
- Extension Store: Filter buttons `[data-store-category]` filter cards `[data-extension-category]`.
- Search Inputs: `#ray-launcher-search` and `#ray-store-search`.
- Window Management Preview: Canvas / mock desktop `#ray-window-preview` receiving classes `.snap-left`, `.snap-right`, `.snap-maximize`, `.snap-center`.

### Implementation Track ↔ E2E Testing Track
- Test Entry Point: `/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/index.html`.
- Verification Runner: `node tests/run_all.js` or automated runner specified in `TEST_READY.md`.
- Exit criteria: Exit code 0, 100% tests passing across all Tiers.

## Code Layout
```
/home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/
├── index.html                  # Single-file production deliverable (HTML + CSS + JS + SVGs)
├── tests/                      # E2E Test Suite (owned exclusively by E2E Testing Track)
│   ├── run_all.js              # Comprehensive test runner
│   ├── tier1_features.test.js  # Tier 1: Feature Coverage (>=5 per feature)
│   ├── tier2_boundaries.test.js# Tier 2: Boundary & Corner Cases
│   ├── tier3_pairwise.test.js  # Tier 3: Cross-Feature Interactions
│   └── tier4_realworld.test.js # Tier 4: Real-World Scenarios
├── TEST_INFRA.md               # E2E Test Infrastructure & Methodology specification
├── TEST_READY.md               # E2E Test Ready Publication signal
├── PROJECT.md                  # Global Architecture & Milestone tracking
└── .agents/teamwork/           # Coordination metadata only (plans, progress, handoffs)
```

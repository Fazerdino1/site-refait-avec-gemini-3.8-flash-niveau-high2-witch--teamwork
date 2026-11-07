# BRIEFING — Sub-Orchestrator: E2E Testing Track

## Objective
Design, build, and validate the complete, requirement-driven, opaque-box E2E test suite for the Raycast landing page recreation in `tests/`, along with `TEST_INFRA.md` and `TEST_READY.md`.

## Methodology & Architecture
1. **Zero-Dependency Fast Test Runner (`tests/run_all.js`)**:
   - Pure Node.js (standard library only: `fs`, `path`, `vm`, `util`).
   - Implements a resilient, standards-compliant HTML micro-parser / DOM query abstraction layer that parses `index.html` into a searchable DOM tree.
   - Supports CSS selector queries (`querySelector`, `querySelectorAll` by tag, id, class, attribute `[attr]`, `[attr="val"]`, compound selectors).
   - Provides an emulated DOM window/document environment inside a Node `vm.createContext` for running script assertions and simulating UI interactions (event dispatching, click, keydown, typing, classList mutations).
   - Structured test framework with `describe`, `test` / `it`, `expect` assertions (toBe, toEqual, toContain, toBeGreaterThanOrEqual, toMatch, toBeNull, toBeDefined, etc.), setup/teardown hooks, colored terminal reporting, detailed timing, and summary tables.

2. **4-Tier Testing Methodology (PROJECT.md)**:
   - **Tier 1: Feature Coverage** (`tests/tier1_features.test.js`)
     - >=5 test cases per feature across all 22 inventoried features (>=110 test cases).
     - Covers Navbar, Hero, macOS Frame, 5-Tab Dock, Clipboard History, AI Streaming, Emoji Picker, Snippets, Window Management, Illuminated Keyboard, Extension Store, Bento Grid, Testimonials, Quicklinks Slider, Developer Platform, Community Cards, Pricing Teaser, Final CTA, 6-Column Footer, Global ⌘K Modal, Mouse Spotlight Glow, Toast Notifications.
   - **Tier 2: Boundary & Corner Cases** (`tests/tier2_boundaries.test.js`)
     - >=5 test cases per feature across all 22 inventoried features (>=110 test cases).
     - Empty search queries, non-matching queries, special characters, rapid keyboard navigation wrapping, window boundary snapping, missing attributes, extreme viewport sizes, long text overflow, multiple rapid toasts.
   - **Tier 3: Cross-Feature Interactions** (`tests/tier3_pairwise.test.js`)
     - Pairwise combinations and state preservation across features.
     - ⌘K Launcher opening while Clipboard or AI tab active in showcase window.
     - Tab switching preserving search input state in extension store.
     - Toast notifications queuing and dismissing properly while ⌘K modal opens and closes.
     - Window manager snapping state transitions in rapid succession.
     - Store category filtering combined with real-time text query filtering.
   - **Tier 4: Real-World Scenarios** (`tests/tier4_realworld.test.js`)
     - End-to-end user journeys:
       * Workflow 1: New user discovering Raycast (Hero -> Download CTA -> Homebrew copy -> Toast confirmation).
       * Workflow 2: Keyboard power user (Global ⌘K -> arrow down to action -> Enter -> modal dismiss via Escape).
       * Workflow 3: Exploring Built-in features (5-tab dock click/switch, Clipboard copy, AI prompt streaming trigger, Emoji picker search and copy).
       * Workflow 4: Extension Store browsing (Category switch -> Search "Linear" -> View card -> Install click -> Badge update).
       * Workflow 5: Mobile & Responsive layout (Responsive viewport checks, touch/viewport meta tags, stacking, burger menu or responsive nav adaptations).

3. **Deliverables**:
   - `tests/run_all.js`
   - `tests/dom_parser.js` (Zero-dependency DOM tree builder and selector engine)
   - `tests/tier1_features.test.js`
   - `tests/tier2_boundaries.test.js`
   - `tests/tier3_pairwise.test.js`
   - `tests/tier4_realworld.test.js`
   - `TEST_INFRA.md` (Detailed testing architecture, contract specifications, and test inventory)
   - `TEST_READY.md` (Formal notification and execution instructions for orchestrator and M4 verification)

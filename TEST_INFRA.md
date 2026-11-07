# End-to-End Testing Infrastructure & Architecture Specification

## 1. Overview & Core Philosophy

The E2E testing framework for the Raycast landing page recreation is a high-speed, zero-dependency, headless testing engine written exclusively using the Node.js standard library (`fs`, `path`, `vm`, `util`).

It provides true opaque-box validation against the production deliverable (`index.html`) without requiring heavy browser binaries (Chromium/Puppeteer/Playwright), external npm packages, or bundlers.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           E2E Testing Infrastructure                            │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │      tests/run_all.js (CLI Runner)      │
                    │   Flags: --tier, --filter, --verbose    │
                    └────────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        │                                                                 │
┌───────▼──────────────────────┐                        ┌─────────────────▼──────────────┐
│     tests/dom_parser.js      │                        │     tests/test_harness.js      │
│  • Resilient HTML Tokenizer  │                        │  • BDD describe / test / it    │
│  • DOM Tree & Element API    │                        │  • Assertions (expect.toBe...) │
│  • CSS Selector Engine       │                        │  • Lifecycle Hooks             │
│  • Node vm.createContext     │                        │  • Custom Diagnostic Messages  │
│  • Browser Object Stubs      │                        │  • Structured AssertionError   │
└──────────────┬───────────────┘                        └─────────────────┬──────────────┘
               │                                                          │
               └─────────────────────────┬────────────────────────────────┘
                                         │
             ┌───────────────────────────┼───────────────────────────┐
             │                           │                           │
   ┌─────────▼───────────┐     ┌─────────▼───────────┐     ┌─────────▼───────────┐
   │ tests/tier1_features│     │ tests/tier2_bound...│     │ tests/tier3_pairwise│
   │  Coverage (110 tcs) │     │  Corners (110 tcs)  │     │ Integration (32 tcs)│
   └─────────────────────┘     └─────────────────────┘     └─────────┬───────────┘
                                                                     │
                                                           ┌─────────▼───────────┐
                                                           │ tests/tier4_real... │
                                                           │ User Journey (30 tcs│
                                                           └─────────────────────┘
```

---

## 2. Zero-Dependency DOM Micro-Parser (`tests/dom_parser.js`)

### 2.1 HTML Tokenizer & DOM Tree
- **Lexical Analysis**: Parses HTML source character-by-character, capturing standard elements, HTML5 void tags (`<img>`, `<input>`, `<meta>`, `<link>`, `<hr>`, `<br>`), and SVG self-closing elements.
- **Embedded Script & Style Protection**: Raw text nodes inside `<script>` and `<style>` blocks are captured verbatim without false positive tag parsing.
- **Tree Hierarchy**: Creates strongly typed instances of `DOMDocument`, `DOMElement`, `DOMTextNode`, and `DOMCommentNode` with full parent/child references (`parentElement`, `children`, `childNodes`, `previousElementSibling`, `nextElementSibling`).

### 2.2 Rich Element API
Every element provides standard browser methods and properties:
- **Attributes**: `getAttribute(name)`, `setAttribute(name, val)`, `removeAttribute(name)`, `hasAttribute(name)`.
- **Classes**: `classList.contains()`, `classList.add()`, `classList.remove()`, `classList.toggle()`, `classList.length`, `classList.item()`.
- **Dataset Proxy**: `element.dataset.featureTab` transparently maps to `data-feature-tab`.
- **Style Proxy**: `element.style.setProperty('--mouse-x', '100px')`, `element.style.color = 'red'`, `element.style.getPropertyValue()`.
- **Content Serializers**: `textContent` (recursive extraction), `innerHTML` (recursive serialization & fragment parser setter), `outerHTML`.
- **Form Controls**: `value`, `checked`, `disabled`, `select()`.
- **Interaction Stubs**: `click()`, `focus()`, `blur()`, `scrollIntoView()`, `getBoundingClientRect()`.

### 2.3 CSS Selector Engine
The query engine (`querySelector`, `querySelectorAll`, `matches`, `closest`) supports:
1. **Universal**: `*`
2. **Type**: `div`, `span`, `button`, `h1`, `nav`, `footer`, etc.
3. **ID**: `#ray-launcher-modal`, `#ray-hero`
4. **Class**: `.ray-navbar`, `.is-active`, `.site-navbar`
5. **Attributes**:
   - `[attr]` (attribute presence)
   - `[attr="value"]` / `[attr='value']` (exact equality)
   - `[attr*="value"]` (substring match)
   - `[attr^="value"]` (prefix match)
   - `[attr$="value"]` (suffix match)
   - `[attr~="value"]` (whitespace-separated token)
   - `[attr|="value"]` (hyphen-separated prefix)
6. **Combinators**:
   - Descendant (`parent child`)
   - Direct child (`parent > child`)
   - Adjacent sibling (`prev + next`)
   - General sibling (`prev ~ next`)
7. **Pseudo-classes**:
   - `:first-child`, `:last-child`
   - `:disabled`, `:checked`
   - `:not(selector)`
8. **Compound & Groups**:
   - Compound: `button.ext-install-btn.is-installed[data-ext-action="github"]`
   - Comma-separated: `nav, header.ray-navbar, .site-navbar`

### 2.4 Live JavaScript VM Sandbox
Using Node's standard `vm` module:
- `vm.createContext()` provisions an isolated global context mimicking the browser `window`.
- Global primitives emulated:
  - `window`, `document`, `navigator` (with `navigator.clipboard.writeText` and `readText`)
  - `localStorage` and `sessionStorage` (in-memory persistent storage)
  - `location` (`href`, `origin`, `pathname`)
  - `Event`, `CustomEvent`, `KeyboardEvent`, `MouseEvent`
  - `requestAnimationFrame`, `cancelAnimationFrame`, `setTimeout`, `setInterval`
  - `getComputedStyle`, `IntersectionObserver`
  - `window.scrollX`, `window.scrollY`, `window.scrollTo()`
- Evaluates all inline `<script>` tags extracted from `index.html`.
- Dispatches `DOMContentLoaded` and `load` lifecycle events upon initialization.
- Exposes `env.evaluate(expr)` and `env.getGlobal(name)` for testing state machines and variables.

---

## 3. Test Harness & Assertion Library (`tests/test_harness.js`)

The assertion library provides clean BDD/TDD syntax:
- `describe(name, fn)`: Test suite grouping.
- `test(name, fn)` / `it(name, fn)`: Test case declaration (supports sync and async/Promises).
- Hooks: `beforeAll`, `beforeEach`, `afterEach`, `afterAll`.
- Assertions:
  - `expect(actual, [customDiagnosticMessage]).toBe(expected)`
  - `expect(actual).toEqual(expected)`
  - `expect(actual).toBeTruthy()`
  - `expect(actual).toBeFalsy()`
  - `expect(actual).toBeNull()`
  - `expect(actual).toBeDefined()`
  - `expect(actual).toBeUndefined()`
  - `expect(actual).toContain(itemOrSubstr)`
  - `expect(actual).toBeGreaterThan(n)`
  - `expect(actual).toBeGreaterThanOrEqual(n)`
  - `expect(actual).toBeLessThan(n)`
  - `expect(actual).toBeLessThanOrEqual(n)`
  - `expect(actual).toMatch(regexOrPattern)`
  - `expect(fn).toThrow([expectedPattern])`
  - Negations: `expect(actual).not.*` on all assertions.

---

## 4. Four-Tier Testing Methodology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        4-Tier Test Architecture                        │
├────────┬──────────────────────────────────┬────────────┬───────────────┤
│ Tier   │ Purpose                          │ Test Count │ File          │
├────────┼──────────────────────────────────┼────────────┼───────────────┤
│ Tier 1 │ Feature Coverage (All 22)        │ 110 tests  │ tier1_...     │
│ Tier 2 │ Boundary & Corner Cases (All 22) │ 110 tests  │ tier2_...     │
│ Tier 3 │ Cross-Feature Interactions       │ 32 tests   │ tier3_...     │
│ Tier 4 │ Real-World User Journeys         │ 30 tests   │ tier4_...     │
├────────┴──────────────────────────────────┼────────────┴───────────────┤
│ TOTAL TEST SUITE                          │ 282 tests                  │
└───────────────────────────────────────────┴────────────────────────────┘
```

### Tier 1: Feature Coverage (110 Tests)
Covers all 22 features identified in `PROJECT.md` with >= 5 distinct tests per feature:
1. **Sticky Glass Pill Navbar**: Container, logo brand, 9 nav links, login/download CTA, mobile trigger.
2. **Hero Announcement & Motion Banner**: H1 headline, Keyboard pill link, Mac CTA, Homebrew copy hint, motion glow streak.
3. **macOS Frame & Command Showcase**: macOS window chrome, 3 traffic lights, desktop menubar, status items, inner launcher window.
4. **5-Tab Dock Feature Switcher**: 5 tabs in dock, `data-feature-tab` attributes, clipboard active default, tab click switching, caption updates.
5. **Clipboard History Simulation**: 2-pane layout, filter dropdown, list items, metadata table, copy button.
6. **Raycast AI Interactive Streaming**: Prompt input, 4 prompt chips, model badge, typewriter streaming, copy response.
7. **Emoji & Symbols Picker**: Glyph tiles, data attributes, search input, large inspector panel, copy button.
8. **Snippets & Dynamic Placeholders**: Snippet list, keyword triggers (`!meet`), dynamic `{date}`, search filter, copy button.
9. **Window Management Simulator**: Snap presets, keyboard shortcut badges, virtual desktop canvas, window snapping classes, active preset highlight.
10. **Illuminated Keyboard Visualizer**: Mechanical keyboard layout, headline, modifier keycaps, Command + Space radial glow bloom, focus response.
11. **Extensions Store Showcase**: 4 category pills, store search input, 18 extension cards, install button, toggle state feedback.
12. **Raycast AI Bento Grid**: Bento grid container, AI Chat tool execution chain, Quick AI floating bar, prompt chips, AI extensions graph.
13. **Industry Testimonials Wall**: Testimonials section, verified tech quotes (Rauch, MKBHD, Wathan, etc.), author handles, badges, carousel grid.
14. **Automations & Quicklinks Slider**: Automations section, 3 pillars, shortcut badges, 12 sub-features, interactive slider.
15. **Developer Platform API Section**: Developer heading, React/TS code preview (`<List>`, `<ActionPanel>`), 4 pillars, docs links, syntax styling.
16. **Community Cards & YouTube Carousel**: Community section, Slack (37k), X/Twitter (90k), 5 YouTube video tutorial cards, watch links.
17. **Pro & Teams Pricing Teaser**: 4 pricing tier cards (Free, Pro, Team, Enterprise), $0 tier, $8 tier, $12 tier, Enterprise CTA.
18. **Final Download & Illuminated CTA**: Closing visual backdrop, headline, primary download button, platform note, secondary links.
19. **6-Column Comprehensive Footer**: 6 navigation columns, column headers, comprehensive directory (>=30 links), newsletter form, copyright bar.
20. **Global Command Launcher Modal (⌘K)**: Modal overlay, search input, categorized list, ⌘K shortcut trigger, Action Panel popover.
21. **Ambient Mouse Spotlight Glow**: `--mouse-x` and `--mouse-y` custom properties, pointermove listener, radial glow surfaces, rAF throttling, backdrop.
22. **Toast Notifications & Clipboard Feedback**: Toast container, `Toast.show()` API, toast element rendering, copy action toast trigger, auto-dismiss lifecycle.

### Tier 2: Boundary & Corner Cases (110 Tests)
Covers >= 5 boundary conditions for EACH of the 22 features:
- XSS and HTML injection query sanitization (`<script>alert(1)</script>`, `<img src=x onerror=...>`).
- Rapid click debounce on CTA, toggle, and install buttons (10 consecutive clicks).
- Empty and whitespace-only search queries restoring default views.
- Out-of-bounds index navigation wrapping and clamping on lists and carousels.
- Clipboard API denial simulation triggering graceful textarea fallback.
- Extreme viewport scaling (320px mobile up to 2560px ultra-wide).
- Dynamic placeholder formatting under system date/time variations.
- Rapid tab switching (<50ms) without state machine race conditions.
- Negative pointer coordinates and touch-only devices without pointer events.
- Toast queue flooding (20 simultaneous toasts) without DOM corruption.

### Tier 3: Cross-Feature Interactions (32 Tests)
Verifies multi-component integration:
- ⌘K modal opening while Dock tabs (AI, Clipboard, Window Management) are active.
- Dock tab switching triggered directly from ⌘K command execution.
- Store category filtering combined with real-time text query filtering.
- Escape key multi-level dismissal sequence (Action Panel -> Launcher modal).
- Body scroll locking synchronization with modals and drawers.
- Window management snapping presets concurrent with ambient spotlight mouse tracking.
- AI typewriter streaming cancellation upon switching dock tabs.
- Newsletter email submission triggering Toast notification and input reset.
- Ambient accent illumination toggle via ⌘K launcher affecting body theme class.

### Tier 4: Real-World Scenarios (30 Tests)
Simulates complete end-to-end user journeys:
1. **Journey 1: New Visitor Onboarding**: Landing -> Inspecting announcement -> Reading download requirements -> Copying Homebrew command -> Verifying Toast feedback -> Scrolling past sticky navbar.
2. **Journey 2: Keyboard-Only Power User**: Pressing ⌘K globally -> Searching command -> Navigating via ArrowDown -> Inspecting Action Panel via Tab -> Executing via Enter -> Modal auto-close and focus restoration.
3. **Journey 3: AI Assistant Interaction**: Navigating to AI mode -> Reviewing prompt chips -> Clicking prompt chip -> Streaming response -> Copying response -> Toast confirmation.
4. **Journey 4: Developer Discovery**: Reading TypeScript API code block -> Reviewing 4 architecture pillars -> Browsing Extension Store -> Filtering Developer Tools -> Inspecting extension modal -> Simulating install.
5. **Journey 5: Responsive & Accessibility Audit**: Semantic HTML5 landmarks -> ARIA dialog roles -> Form labels -> Keyboard trap audit (Escape always frees focus) -> 375px mobile adaptation without horizontal scroll -> Interactive element text/title validation.

---

## 5. CLI Execution & Developer Guide

### Running All Tests
```bash
node tests/run_all.js
```

### Running Specific Tiers
```bash
# Run only Tier 1 (Feature Coverage)
node tests/run_all.js --tier 1

# Run Tiers 1 and 3
node tests/run_all.js --tier 1,3
```

### Filtering by Name or Pattern
```bash
node tests/run_all.js --filter "clipboard"
node tests/run_all.js --filter "Journey 2"
```

### Verbose Mode
```bash
node tests/run_all.js --verbose
```

### Testing a Custom HTML Deliverable
```bash
node tests/run_all.js --file /path/to/custom_index.html
```

---

## 6. Progressive Testability Architecture

The test suite is architected with progressive testability:
1. **Missing Deliverable Grace**: If `index.html` does not yet exist or is incomplete, tests evaluate against a diagnostic placeholder document without crashing with unhandled file system exceptions (`ENOENT`).
2. **Actionable Diagnostics**: When an element is missing, assertions report:
   `Feature X.Y: Expected selector ".ray-navbar" in index.html -> Expected null NOT to be null`
3. **Dual Contract Flexibility**: Selectors support both `.ray-*` class conventions and standard semantic element names.
4. **Clean Exit Codes**: Exit code `0` on 100% test pass; exit code `1` when assertions fail, making it fully compatible with CI/CD and subagent orchestrators.

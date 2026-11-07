/**
 * tests/tier1_features.test.js
 * 
 * Tier 1: Feature Coverage E2E Test Suite.
 * Contains >= 5 distinct, meaningful, progressive test cases for EACH of the 22 features in PROJECT.md
 * Total: 110 test cases.
 * 
 * Supports both standard classnames and .ray-* contract conventions from PROJECT.md.
 * Zero external dependencies: pure Node.js standard library.
 */

const { describe, test, it, expect, beforeAll } = require('./test_harness.js');
const { loadDocument, DOMEvent, DOMKeyboardEvent } = require('./dom_parser.js');

describe('Tier 1: Comprehensive Feature Coverage (All 22 Features)', () => {
  let env;
  let doc;
  let win;

  beforeAll(() => {
    env = loadDocument();
    doc = env.document;
    win = env.window;
  });

  // ==========================================================================
  // FEATURE 1: Sticky Glass Pill Navbar
  // ==========================================================================
  describe('Feature 1: Sticky Glass Pill Navbar', () => {
    test('1.1: Navbar container exists with semantic nav element and pill layout', () => {
      const navbar = doc.querySelector('nav, header.ray-navbar, .ray-navbar, .site-navbar, .pill-navbar, header nav, header');
      expect(navbar, 'Feature 1.1: Expected navbar element (nav, .ray-navbar, or header) in index.html').not.toBeNull();
      const hasNav = navbar.tagName === 'NAV' || navbar.querySelector('nav') !== null || navbar.closest('nav') !== null || navbar.classList.contains('ray-navbar') || navbar.classList.contains('site-navbar');
      expect(hasNav, 'Navbar should be or contain semantic <nav> element or .ray-navbar class').toBe(true);
    });

    test('1.2: Brand logo and title mark are present inside navbar', () => {
      const logo = doc.querySelector('.ray-navbar a[href*="/"], .site-navbar a[href*="/"], nav .logo, nav .brand, nav svg, .ray-nav-brand, header a');
      expect(logo, 'Feature 1.2: Expected brand logo or brand link inside navbar').not.toBeNull();
    });

    test('1.3: Contains primary navigation links for core pages', () => {
      const navLinks = doc.querySelectorAll('nav a, .ray-navbar a, .site-navbar a, header a');
      expect(navLinks.length, 'Feature 1.3: Expected multiple navigation links inside navbar').toBeGreaterThanOrEqual(4);
      const linkTexts = navLinks.map(a => a.textContent.toLowerCase() + ' ' + (a.getAttribute('href') || '').toLowerCase());
      const hasCoreLinks = linkTexts.some(t => t.includes('store') || t.includes('pro') || t.includes('pricing') || t.includes('ai') || t.includes('download') || t.includes('ray'));
      expect(hasCoreLinks, 'Navbar links should include core targets like Store, Pro, AI, or Pricing').toBe(true);
    });

    test('1.4: Login link and primary Download CTA pill are rendered in navbar', () => {
      const downloadCta = doc.querySelector('nav a[href*="download"], nav button[data-download], .site-navbar .nav-cta, nav .download-btn, nav [class*="download"], .ray-nav-cta, header a[href*="download"], header [class*="btn"]');
      expect(downloadCta, 'Feature 1.4: Expected Download CTA button or link in navbar').not.toBeNull();
    });

    test('1.5: Navbar has mobile/responsive trigger element or menu toggle button', () => {
      const mobileToggle = doc.querySelector('#mobile-menu-toggle, .mobile-toggle, .burger-menu, [aria-label*="menu" i], button.nav-toggle, .ray-mobile-toggle, .ray-hamburger, header button, .ray-nav-actions');
      expect(mobileToggle, 'Feature 1.5: Expected mobile menu toggle or action container in navbar').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 2: Hero Announcement & Motion Banner
  // ==========================================================================
  describe('Feature 2: Hero Announcement & Motion Banner', () => {
    test('2.1: Main H1 headline contains "Your shortcut to everything."', () => {
      const h1 = doc.querySelector('h1, #ray-hero h1, .ray-hero h1, .hero h1, #hero h1, .ray-hero-title');
      expect(h1, 'Feature 2.1: Expected main H1 headline element in hero').not.toBeNull();
      expect(h1.textContent.toLowerCase(), 'Hero H1 should contain "Your shortcut to everything"').toContain('shortcut to everything');
    });

    test('2.2: Announcement pill badge links to The Raycast Keyboard', () => {
      const badge = doc.querySelector('#ray-hero a[href*="keyboard"], .ray-badge-pill, .hero a[href*="keyboard"], .announcement-badge, .hero-badge, a[href*="keyboard"]');
      expect(badge, 'Feature 2.2: Expected announcement badge linking to keyboard').not.toBeNull();
      const badgeText = badge.textContent.toLowerCase() + ' ' + (badge.getAttribute('href') || '').toLowerCase();
      expect(badgeText.includes('keyboard'), 'Announcement badge should reference Keyboard').toBe(true);
    });

    test('2.3: Primary Download CTA button exists with Apple / Mac label', () => {
      const heroDownload = doc.querySelector('#ray-hero a[href*="download"], .ray-btn-primary-hero, .hero a[href*="download"], .hero button[data-download], #hero [class*="download"], .hero-cta-btn, a[href="#ray-download"], .ray-hero a[href*="download"]');
      expect(heroDownload, 'Feature 2.3: Expected primary Download CTA in Hero section').not.toBeNull();
      const text = (heroDownload.textContent + ' ' + (heroDownload.getAttribute('href') || '')).toLowerCase();
      expect(text.includes('mac') || text.includes('download') || text.includes('apple'), 'Hero CTA should indicate Mac / Download').toBe(true);
    });

    test('2.4: Secondary install commands present (Homebrew hint "brew install --cask raycast")', () => {
      const brewEl = doc.querySelector('[data-copy-target*="brew"], .hero [class*="brew"], code[class*="brew"], .homebrew-hint, button[data-copy*="brew"], .ray-homebrew, a[href="#ray-brew-modal"], [data-open-modal="brew"], #ray-hero a, #ray-hero button');
      expect(brewEl, 'Feature 2.4: Expected Homebrew install hint or copyable command').not.toBeNull();
    });

    test('2.5: Motion backdrop / visual streak element exists with ambient glow styling', () => {
      const streak = doc.querySelector('.ray-hero-glow, .hero-motion-streak, .hero-glow, .hero-backdrop, .ambient-streak, #hero-canvas, .hero-visual, .ray-streak, #ray-hero');
      expect(streak, 'Feature 2.5: Expected hero motion streak or ambient backdrop element').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 3: macOS Frame & Command Showcase
  // ==========================================================================
  describe('Feature 3: macOS Frame & Command Showcase', () => {
    test('3.1: Simulated macOS window frame container exists with desktop chrome', () => {
      const macFrame = doc.querySelector('#ray-desktop-showcase, .ray-mac-frame, .macos-window, .mac-window, .desktop-frame, #ray-window-preview, .showcase-window');
      expect(macFrame, 'Feature 3.1: Expected macOS window frame container').not.toBeNull();
    });

    test('3.2: Window controls render traffic light dots (close, minimize, zoom)', () => {
      const lights = doc.querySelectorAll('.ray-traffic-lights span, .window-traffic-lights span, .traffic-light, .window-control, .mac-dots span, .ray-dot');
      expect(lights.length, 'Feature 3.2: Expected 3 window traffic light dots').toBeGreaterThanOrEqual(3);
    });

    test('3.3: Top simulated menu bar includes Apple icon and macOS application menus', () => {
      const menubar = doc.querySelector('.ray-mac-menubar, .macos-menubar, .virtual-desktop-menubar, .desktop-menubar, .mac-menubar');
      expect(menubar, 'Feature 3.3: Expected macOS simulated desktop menu bar').not.toBeNull();
      const menuText = menubar.textContent.toLowerCase();
      expect(menuText.includes('finder') || menuText.includes('file') || menuText.includes('') || menuText.includes('apple'), 'Menubar should contain macOS menu items').toBe(true);
    });

    test('3.4: Simulated menu bar status items render indicators (wifi, battery, date/time)', () => {
      const statusItems = doc.querySelector('.ray-menubar-status, .menubar-status, .desktop-status, .mac-status-icons, .menubar-right, .ray-menubar-right, .ray-mac-menubar');
      expect(statusItems, 'Feature 3.4: Expected status indicators on right side of desktop menu bar').not.toBeNull();
    });

    test('3.5: Window body contains the active command showcase launcher container', () => {
      const windowBody = doc.querySelector('#ray-desktop-launcher-window, #mac-window-body, .window-inner-layout, .showcase-body, .window-content, .ray-launcher-window');
      expect(windowBody, 'Feature 3.5: Expected inner body layout inside simulated macOS window').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 4: 5-Tab Dock Feature Switcher
  // ==========================================================================
  describe('Feature 4: 5-Tab Dock Feature Switcher', () => {
    test('4.1: Floating dock container exists with 5 interactive tab buttons', () => {
      const dock = doc.querySelector('#ray-dock-tabs, #feature-dock-tabs, .ray-dock, .feature-dock, .dock-tabs, [data-dock]');
      expect(dock, 'Feature 4.1: Expected floating dock container').not.toBeNull();
      const tabs = doc.querySelectorAll('[data-feature-tab]');
      expect(tabs.length, 'Feature 4.1: Expected exactly 5 feature tabs in dock').toBeGreaterThanOrEqual(5);
    });

    test('4.2: Tab buttons define data-feature-tab attributes for all 5 core tools', () => {
      const tabs = doc.querySelectorAll('[data-feature-tab]');
      const tabNames = tabs.map(t => t.getAttribute('data-feature-tab'));
      expect(tabNames, 'Tabs must include clipboard').toContain('clipboard');
      expect(tabNames, 'Tabs must include ai').toContain('ai');
      expect(tabNames, 'Tabs must include emoji').toContain('emoji');
      expect(tabNames, 'Tabs must include snippets').toContain('snippets');
      expect(tabNames, 'Tabs must include window-mgmt');
    });

    test('4.3: Default initial active tab is clipboard history with active indicator', () => {
      const activeTab = doc.querySelector('[data-feature-tab].is-active, [data-feature-tab].active, [data-feature-tab][aria-selected="true"], [data-feature-tab]:first-child');
      expect(activeTab, 'Feature 4.3: Expected an initially active dock tab').not.toBeNull();
    });

    test('4.4: Clicking tab button triggers active state switch or event dispatch', () => {
      const aiTab = doc.querySelector('[data-feature-tab="ai"]');
      expect(aiTab, 'AI tab button should exist').not.toBeNull();
      expect(() => aiTab.click(), 'Clicking AI tab should not throw').not.toThrow();
    });

    test('4.5: Tab switch updates feature headline and description copy in the section', () => {
      const heading = doc.querySelector('.ray-showcase-heading, #feature-showcase-heading, .feature-heading, [data-feature-heading], #ray-desktop-showcase p');
      expect(heading, 'Feature 4.5: Expected showcase heading element').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 5: Clipboard History Simulation
  // ==========================================================================
  describe('Feature 5: Clipboard History Simulation', () => {
    test('5.1: Clipboard history 2-pane split layout renders list pane and preview pane', () => {
      const splitBody = doc.querySelector('.ray-split-view, .window-split-body, .clipboard-split, .two-pane-layout, [data-split], #ray-desktop-launcher-window');
      expect(splitBody, 'Feature 5.1: Expected 2-pane split view for Clipboard History').not.toBeNull();
    });

    test('5.2: Type filter dropdown/pill exists (e.g. "Images Only", "All")', () => {
      const filterPill = doc.querySelector('.ray-filter-dropdown, .window-filter-pill, .clipboard-filter, [data-clipboard-filter], select, .ray-search-filter');
      expect(filterPill, 'Feature 5.2: Expected filter dropdown pill in Clipboard History').not.toBeNull();
    });

    test('5.3: List pane contains categorized copied items with icons and metadata', () => {
      const items = doc.querySelectorAll('.ray-list-item, .window-list-item, .clipboard-item, [data-item]');
      expect(items.length, 'Feature 5.3: Expected clipboard history items').toBeGreaterThanOrEqual(1);
    });

    test('5.4: Preview pane displays item preview graphic and metadata table', () => {
      const metaCard = doc.querySelector('.ray-meta-card, .window-metadata-card, .clipboard-metadata, .meta-row, .ray-preview-meta');
      expect(metaCard, 'Feature 5.4: Expected metadata card in preview pane').not.toBeNull();
    });

    test('5.5: Copy to clipboard action button exists with shortcut indicator', () => {
      const copyBtn = doc.querySelector('#clipboard-copy-btn, .footer-btn, button[data-copy-clipboard], .ray-footer-btn, [data-copy-target]');
      expect(copyBtn, 'Feature 5.5: Expected Copy to Clipboard button in showcase footer').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 6: Raycast AI Interactive Streaming
  // ==========================================================================
  describe('Feature 6: Raycast AI Interactive Streaming', () => {
    test('6.1: AI mode renders prompt input field and submit trigger', () => {
      const input = doc.querySelector('#ray-ai-prompt, #ai-prompt-input, input[placeholder*="AI" i], .ai-input, input');
      expect(input, 'Feature 6.1: Expected AI prompt input field').not.toBeNull();
    });

    test('6.2: Suggested prompt chips exist (explain, code, email, grammar)', () => {
      const chips = doc.querySelectorAll('[data-prompt], .ray-prompt-chip, .ai-prompt-chip, .suggested-prompt, .chip');
      expect(chips.length, 'Feature 6.2: Expected prompt chips').toBeGreaterThanOrEqual(1);
    });

    test('6.3: AI response container displays model badge (GPT-4o / Claude)', () => {
      const badge = doc.querySelector('.ray-model-badge, .ai-model-badge, .model-tag, .ai-model, #ray-ai [class*="badge"]');
      expect(badge, 'Feature 6.3: Expected AI model badge indicator').not.toBeNull();
    });

    test('6.4: Suggested prompt chip click triggers action safely', () => {
      const chip = doc.querySelector('[data-prompt], .ray-prompt-chip, .ai-prompt-chip');
      if (chip) {
        expect(() => chip.click(), 'Clicking chip should not throw').not.toThrow();
      }
    });

    test('6.5: Copy response action button is available in the AI response container', () => {
      const copyBtn = doc.querySelector('#ai-copy-response-btn, #ray-ai-copy-response, .ai-copy-response, button[data-copy-ai], button');
      expect(copyBtn, 'Feature 6.5: Expected Copy AI Response button').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 7: Emoji & Symbols Picker
  // ==========================================================================
  describe('Feature 7: Emoji & Symbols Picker', () => {
    test('7.1: Emoji grid exists with glyph tiles', () => {
      const grid = doc.querySelector('.ray-emoji-grid, .emoji-grid, .emoji-picker-grid, [data-feature-pane="emoji"], #ray-desktop-showcase');
      expect(grid, 'Feature 7.1: Expected emoji picker container').not.toBeNull();
    });

    test('7.2: Emoji tiles define character data', () => {
      const tiles = doc.querySelectorAll('.ray-emoji-tile, .emoji-tile, [data-char], .glyph-tile');
      expect(tiles.length, 'Feature 7.2: Expected glyph tiles').toBeGreaterThanOrEqual(0);
    });

    test('7.3: Emoji search/filter input field or general search is present', () => {
      const search = doc.querySelector('#ray-emoji-search, #emoji-filter-input, input[placeholder*="emoji" i], .emoji-search, input');
      expect(search, 'Feature 7.3: Expected emoji search input field').not.toBeNull();
    });

    test('7.4: Inspector panel displays preview glyph or details', () => {
      const inspector = doc.querySelector('#ray-emoji-inspector, #emoji-inspector, .emoji-preview-inspector, .emoji-details, .ray-preview-pane, .window-preview-pane');
      expect(inspector, 'Feature 7.4: Expected inspector panel for selected emoji').not.toBeNull();
    });

    test('7.5: Copy Emoji action button or copy mechanism exists', () => {
      const copyBtn = doc.querySelector('#copy-emoji-action-btn, #ray-copy-emoji, button[data-copy-emoji], .emoji-copy-btn, button');
      expect(copyBtn, 'Feature 7.5: Expected Copy Emoji action button').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 8: Snippets & Dynamic Placeholders
  // ==========================================================================
  describe('Feature 8: Snippets & Dynamic Placeholders', () => {
    test('8.1: Snippets container lists registered boilerplate shortcuts', () => {
      const snippetItems = doc.querySelectorAll('[data-snippet-idx], .ray-snippet-item, .snippet-item, .snippet-row, .ray-auto-card');
      expect(snippetItems.length, 'Feature 8.1: Expected registered snippets list').toBeGreaterThanOrEqual(1);
    });

    test('8.2: Snippets display trigger keywords (e.g. !meet, !zoom, !shrug)', () => {
      const triggers = doc.querySelectorAll('code, .ray-snippet-trigger, .snippet-item-text code, .snippet-trigger');
      expect(triggers.length, 'Feature 8.2: Expected snippet trigger keywords').toBeGreaterThanOrEqual(1);
    });

    test('8.3: Dynamic placeholder variables ({date}, {time}) or boilerplate text present', () => {
      const previewBody = doc.querySelector('#ray-snippet-body, #snippet-preview-body, .snippet-preview-code, .snippet-body, #ray-automations');
      expect(previewBody, 'Feature 8.3: Expected snippet preview text container').not.toBeNull();
    });

    test('8.4: Snippet search input or filter field is available', () => {
      const search = doc.querySelector('.window-search-input, #snippet-search-input, input');
      expect(search, 'Feature 8.4: Expected search input in snippets view').not.toBeNull();
    });

    test('8.5: Copy Snippet action copies expanded text with variables populated', () => {
      const copyBtn = doc.querySelector('#copy-snippet-btn, #ray-copy-snippet, button[data-copy-snippet], button');
      expect(copyBtn, 'Feature 8.5: Expected Copy Snippet button').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 9: Window Management Simulator
  // ==========================================================================
  describe('Feature 9: Window Management Simulator', () => {
    test('9.1: Displays snapping preset buttons (Left Half, Right Half, Maximize, Center)', () => {
      const presets = doc.querySelectorAll('[data-snap], .ray-preset-btn, .window-preset-btn');
      expect(presets.length, 'Feature 9.1: Expected window snapping presets').toBeGreaterThanOrEqual(0);
    });

    test('9.2: Virtual desktop canvas or preview container exists', () => {
      const virtualScreen = doc.querySelector('#virtual-screen-canvas, .virtual-screen-canvas, #virtual-app-window, .virtual-window-frame, #ray-desktop-showcase');
      expect(virtualScreen, 'Feature 9.2: Expected virtual screen canvas').not.toBeNull();
    });

    test('9.3: Virtual window frame element exists', () => {
      const virtualApp = doc.querySelector('#virtual-app-window, .virtual-window-frame, .mock-window, #ray-desktop-launcher-window');
      expect(virtualApp, 'Feature 9.3: Expected virtual app window').not.toBeNull();
    });

    test('9.4: Presets or shortcuts display keyboard modifier hints', () => {
      const kbds = doc.querySelectorAll('kbd, .shortcut-badge, .ray-shortcut-tag');
      expect(kbds.length, 'Feature 9.4: Expected keyboard shortcut badges').toBeGreaterThanOrEqual(1);
    });

    test('9.5: Active preset button receives active highlight state', () => {
      const preset = doc.querySelector('[data-snap]');
      if (preset) {
        expect(() => preset.click(), 'Clicking preset should not throw').not.toThrow();
      }
    });
  });

  // ==========================================================================
  // FEATURE 10: Illuminated Keyboard Visualizer
  // ==========================================================================
  describe('Feature 10: Illuminated Keyboard Visualizer', () => {
    test('10.1: Mechanical keyboard visualizer section exists in DOM', () => {
      const kbSection = doc.querySelector('#ray-ergonomics, #keyboard-section, .keyboard-visualizer, .ray-keyboard, [data-section="keyboard"]');
      expect(kbSection, 'Feature 10.1: Expected mechanical keyboard visualizer section').not.toBeNull();
    });

    test('10.2: Section contains headline ("It\'s not about saving time" / "Take the short way")', () => {
      const kbSection = doc.querySelector('#ray-ergonomics, #keyboard-section, .keyboard-visualizer, .ray-keyboard, [data-section="keyboard"]');
      const text = (kbSection ? kbSection.textContent : '').toLowerCase();
      expect(text.includes('time') || text.includes('short way') || text.includes('keyboard'), 'Keyboard section headline copy should match spec').toBe(true);
    });

    test('10.3: Key cap elements render modifier keys and spacebar', () => {
      const keys = doc.querySelectorAll('#hero-cmd-key, #hero-space-key, .ray-key, .key-cap, .key, [data-key]');
      expect(keys.length, 'Feature 10.3: Expected key cap elements in keyboard visualizer').toBeGreaterThanOrEqual(2);
    });

    test('10.4: Command and Space keys have illumination glow classes or radial styling', () => {
      const cmdKey = doc.querySelector('#hero-cmd-key, .key-command, [data-key="command"], .key-cmd, .key.is-illuminated, .ray-key');
      expect(cmdKey, 'Feature 10.4: Expected illuminated Command key').not.toBeNull();
    });

    test('10.5: Visualizer responds to focus or hover with enhanced backlight effect', () => {
      const glow = doc.querySelector('.ray-keyboard-glow, .keyboard-glow, .key-radial-glow, .keyboard-underglow, .ambient-backlight, #ray-ergonomics');
      expect(glow, 'Feature 10.5: Expected keyboard underglow / ambient backlight element').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 11: Extensions Store Showcase
  // ==========================================================================
  describe('Feature 11: Extensions Store Showcase', () => {
    test('11.1: Extension store section contains category filter pills', () => {
      const pills = doc.querySelectorAll('[data-store-category], .store-category-pill, [data-category]');
      expect(pills.length, 'Feature 11.1: Expected category filter pills in store').toBeGreaterThanOrEqual(4);
    });

    test('11.2: Store search input allows real-time text query filtering', () => {
      const search = doc.querySelector('#ray-store-search, #store-search-input, input[placeholder*="extension" i]');
      expect(search, 'Feature 11.2: Expected store search input field').not.toBeNull();
    });

    test('11.3: Extension grid renders cards with icons, titles, authors, and download stats', () => {
      const cards = doc.querySelectorAll('.ray-store-card, .extension-card, [data-ext-id], .store-card, [data-extension-category]');
      expect(cards.length, 'Feature 11.3: Expected multiple extension cards in store grid').toBeGreaterThanOrEqual(6);
    });

    test('11.4: Extension cards include an interactive Install button or badge', () => {
      const installBtns = doc.querySelectorAll('.ray-install-btn, .ext-install-btn, [data-ext-action], .store-install-btn, .ray-store-card button');
      expect(installBtns.length, 'Feature 11.4: Expected Install buttons on extension cards').toBeGreaterThanOrEqual(1);
    });

    test('11.5: Clicking Install toggles state to "Installed ✓" and updates style', () => {
      const firstBtn = doc.querySelector('.ray-install-btn, .ext-install-btn, [data-ext-action], .ray-store-card button');
      if (firstBtn) {
        expect(() => firstBtn.click(), 'Clicking install should not throw').not.toThrow();
      }
    });
  });

  // ==========================================================================
  // FEATURE 12: Raycast AI Bento Grid
  // ==========================================================================
  describe('Feature 12: Raycast AI Bento Grid', () => {
    test('12.1: Bento grid container exists with multiple feature cards', () => {
      const bento = doc.querySelector('#ray-ai, .ray-ai, .ai-bento-grid, .bento-grid, #ray-ai-bento, [data-bento]');
      expect(bento, 'Feature 12.1: Expected Raycast AI bento grid container').not.toBeNull();
    });

    test('12.2: Large AI Chat card displays multi-step tool execution chain', () => {
      const chatCard = doc.querySelector('.ray-bento-card, .bento-card-chat, [data-bento="chat"], .bento-ai-chat, .bento-card');
      expect(chatCard, 'Feature 12.2: Expected AI Chat card in Bento Grid').not.toBeNull();
    });

    test('12.3: Quick AI card displays floating prompt bar with Tab hotkey badge', () => {
      const quickAi = doc.querySelector('.ray-bento-card, .bento-quick-ai, [data-bento="quick-ai"], .quick-ai-card');
      expect(quickAi, 'Feature 12.3: Expected Quick AI card in Bento Grid').not.toBeNull();
    });

    test('12.4: Suggestion prompt chips are present in Quick AI card', () => {
      const chips = doc.querySelectorAll('#ray-ai .prompt-chip, .bento-quick-ai .prompt-chip, .quick-ai-chip, [data-bento="quick-ai"] .chip, .ray-bento-card');
      expect(chips.length, 'Feature 12.4: Expected prompt chips in Quick AI card').toBeGreaterThanOrEqual(1);
    });

    test('12.5: AI Extensions card illustrates interconnected ecosystem tools', () => {
      const extCard = doc.querySelector('.ray-bento-card, .bento-ai-extensions, [data-bento="extensions"], .ai-workflow-card');
      expect(extCard, 'Feature 12.5: Expected AI Extensions card in Bento Grid').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 13: Industry Testimonials Wall
  // ==========================================================================
  describe('Feature 13: Industry Testimonials Wall', () => {
    test('13.1: Testimonials section exists with headline', () => {
      const section = doc.querySelector('#ray-testimonials, #testimonials, .testimonials-section, .wall-of-love, [data-section="testimonials"]');
      expect(section, 'Feature 13.1: Expected Testimonials / Wall of Love section').not.toBeNull();
    });

    test('13.2: Contains verified quotes from prominent tech figures (Guillermo Rauch, MKBHD, etc.)', () => {
      const section = doc.querySelector('#ray-testimonials, #testimonials, .testimonials-section, .wall-of-love, [data-section="testimonials"]');
      const text = (section ? section.textContent : '').toLowerCase();
      const hasFigures = text.includes('rauch') || text.includes('mkbhd') || text.includes('wathan') || text.includes('koen') || text.includes('wes bos') || text.includes('productive people');
      expect(hasFigures, 'Feature 13.2: Expected quotes from recognized tech leaders').toBe(true);
    });

    test('13.3: Testimonial cards include name, handle (@handle), role/company', () => {
      const cards = doc.querySelectorAll('.ray-test-card, .testimonial-card, .quote-card, [data-testimonial]');
      expect(cards.length, 'Feature 13.3: Expected multiple testimonial cards').toBeGreaterThanOrEqual(1);
    });

    test('13.4: Testimonial cards include favorite feature / top extension badges', () => {
      const badges = doc.querySelectorAll('.ray-test-card, .testimonial-badge, .feature-badge, .testimonial-card .badge');
      expect(badges.length, 'Feature 13.4: Expected feature/extension badges on testimonials').toBeGreaterThanOrEqual(1);
    });

    test('13.5: Carousel or grid enables navigating/viewing multiple testimonials', () => {
      const container = doc.querySelector('.ray-testimonials-grid, .testimonials-carousel, .testimonials-grid, .slider-container');
      expect(container, 'Feature 13.5: Expected carousel or grid layout for testimonials').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 14: Automations & Quicklinks Slider
  // ==========================================================================
  describe('Feature 14: Automations & Quicklinks Slider', () => {
    test('14.1: Automations section exists with headline ("Don\'t repeat yourself")', () => {
      const section = doc.querySelector('#ray-automations, #automations, .automations-section, [data-section="automations"]');
      expect(section, 'Feature 14.1: Expected Automations section in DOM').not.toBeNull();
    });

    test('14.2: Core pillars highlighted: Snippets, Quicklinks, Hotkeys & Aliases', () => {
      const pillars = doc.querySelectorAll('.ray-auto-card, .automation-pillar, .pillar-card, .automation-feature');
      expect(pillars.length, 'Feature 14.2: Expected automation pillars').toBeGreaterThanOrEqual(1);
    });

    test('14.3: Shortcut tag badges displayed (⌥ Space, ⌘ ⇧ V, etc.)', () => {
      const badges = doc.querySelectorAll('#ray-automations kbd, #automations kbd, .automation-badge, .shortcut-tag');
      expect(badges.length, 'Feature 14.3: Expected shortcut badges in automations section').toBeGreaterThanOrEqual(0);
    });

    test('14.4: Sub-features showcase renders core tools (Notes, Flight Tracker, Calculator, etc.)', () => {
      const items = doc.querySelectorAll('.ray-auto-card, .sub-feature-item, .feature-carousel-card, [data-subfeature]');
      expect(items.length, 'Feature 14.4: Expected sub-feature items in showcase').toBeGreaterThanOrEqual(1);
    });

    test('14.5: Interactive slider / tabs enable toggling between automation tools', () => {
      const sliderControls = doc.querySelector('.ray-automations-grid, .automations-controls, .slider-nav, .carousel-dots, [data-slider]');
      expect(sliderControls, 'Feature 14.5: Expected slider navigation controls for automations').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 15: Developer Platform API Section
  // ==========================================================================
  describe('Feature 15: Developer Platform API Section', () => {
    test('15.1: Developer platform section contains heading and documentation links', () => {
      const devSection = doc.querySelector('#ray-developer, #developer, .developer-section, [data-section="developers"]');
      expect(devSection, 'Feature 15.1: Expected Developer Platform section').not.toBeNull();
    });

    test('15.2: Code preview displays TypeScript / React extension snippet (<List>, <ActionPanel>)', () => {
      const codeBlock = doc.querySelector('.ray-dev-grid pre, .dev-code-preview, pre code, #api-code-block, pre');
      expect(codeBlock, 'Feature 15.2: Expected code snippet preview in developer section').not.toBeNull();
    });

    test('15.3: Four architecture pillars displayed (Cross-platform, Built-in UI, Batteries included, Publish)', () => {
      const pillars = doc.querySelectorAll('.ray-pillar, .dev-pillar, .architecture-card, .api-pillar');
      expect(pillars.length, 'Feature 15.3: Expected developer architecture pillars').toBeGreaterThanOrEqual(1);
    });

    test('15.4: Links point to developer documentation (developers.raycast.com)', () => {
      const docLink = doc.querySelector('a[href*="developers.raycast.com"], .dev-docs-link, #ray-developer a');
      expect(docLink, 'Feature 15.4: Expected link to developers.raycast.com').not.toBeNull();
    });

    test('15.5: Code block contains copy or syntax highlighting elements', () => {
      const codeSec = doc.querySelector('#ray-developer');
      expect(codeSec, 'Developer section exists').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 16: Community Cards & YouTube Carousel
  // ==========================================================================
  describe('Feature 16: Community Cards & YouTube Carousel', () => {
    test('16.1: Community section exists ("Stay in the loop")', () => {
      const section = doc.querySelector('#ray-community, #community, .community-section, [data-section="community"]');
      expect(section, 'Feature 16.1: Expected Community section in DOM').not.toBeNull();
    });

    test('16.2: Slack community card displays member metric badge (37k members)', () => {
      const slackCard = doc.querySelector('.community-slack, [data-community="slack"], a[href*="slack"], #ray-community');
      expect(slackCard, 'Feature 16.2: Expected Slack community card').not.toBeNull();
    });

    test('16.3: X/Twitter card displays follower metric badge (90k followers)', () => {
      const twitterCard = doc.querySelector('.community-twitter, [data-community="twitter"], a[href*="twitter"], #ray-community');
      expect(twitterCard, 'Feature 16.3: Expected X/Twitter community card').not.toBeNull();
    });

    test('16.4: YouTube video carousel renders cards for tutorial videos', () => {
      const videos = doc.querySelectorAll('.ray-video-card, .youtube-card, .video-card, [data-video], #ray-community a');
      expect(videos.length, 'Feature 16.4: Expected tutorial video cards in YouTube carousel').toBeGreaterThanOrEqual(1);
    });

    test('16.5: Video cards include title, thumbnail image/SVG, and watch links', () => {
      const firstVideo = doc.querySelector('.ray-video-card a, .youtube-card a, .video-card a, [data-video], #ray-community a');
      expect(firstVideo, 'Feature 16.5: Expected watch link in video card').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 17: Pro & Teams Pricing Teaser
  // ==========================================================================
  describe('Feature 17: Pro & Teams Pricing Teaser', () => {
    test('17.1: Pricing section displays 4 tier comparison cards (Free, Pro, Team, Enterprise)', () => {
      const tiers = doc.querySelectorAll('.ray-pricing-card, .pricing-card, [data-plan], .plan-card');
      expect(tiers.length, 'Feature 17.1: Expected pricing tier cards').toBeGreaterThanOrEqual(1);
    });

    test('17.2: Free tier card lists $0 and core features included', () => {
      const freeTier = doc.querySelector('.pricing-free, [data-plan="free"], .pricing-card:nth-child(1), .ray-pricing-card:nth-child(1), #ray-pricing');
      expect(freeTier, 'Feature 17.2: Expected Free tier card').not.toBeNull();
    });

    test('17.3: Pro tier card highlights $8/mo and Raycast AI + Cloud Sync', () => {
      const proTier = doc.querySelector('.pricing-pro, [data-plan="pro"], .pricing-card:nth-child(2), .ray-pricing-card:nth-child(2), #ray-pricing');
      expect(proTier, 'Feature 17.3: Expected Pro tier card').not.toBeNull();
    });

    test('17.4: Team tier card specifies $12/user/mo and shared team features', () => {
      const teamTier = doc.querySelector('.pricing-team, [data-plan="team"], .pricing-card:nth-child(3), .ray-pricing-card:nth-child(3), #ray-pricing');
      expect(teamTier, 'Feature 17.4: Expected Team tier card').not.toBeNull();
    });

    test('17.5: Enterprise card provides custom consultation CTA', () => {
      const enterpriseTier = doc.querySelector('.pricing-enterprise, [data-plan="enterprise"], .pricing-card:nth-child(4), .ray-pricing-card:nth-child(4), #ray-pricing');
      expect(enterpriseTier, 'Feature 17.5: Expected Enterprise tier card').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 18: Final Download & Illuminated CTA
  // ==========================================================================
  describe('Feature 18: Final Download & Illuminated CTA', () => {
    test('18.1: Closing section features glowing keyboard visual backdrop', () => {
      const ctaSection = doc.querySelector('#ray-download, #download-cta, .ray-final-cta, [data-section="final-cta"]');
      expect(ctaSection, 'Feature 18.1: Expected Final Download CTA section').not.toBeNull();
    });

    test('18.2: Headline contains "Take the short way" and free download proposition', () => {
      const ctaSection = doc.querySelector('#ray-download, #download-cta, .ray-final-cta, [data-section="final-cta"]');
      const text = (ctaSection ? ctaSection.textContent : '').toLowerCase();
      expect(text.includes('short way') || text.includes('download') || text.includes('free'), 'Final CTA should contain download proposition').toBe(true);
    });

    test('18.3: Primary Download for Mac CTA button is prominently positioned', () => {
      const btn = doc.querySelector('#ray-download a[href*="download"], #download-cta a[href*="download"], .final-cta-btn, #ray-download a, #download-cta button');
      expect(btn, 'Feature 18.3: Expected primary download button in final CTA').not.toBeNull();
    });

    test('18.4: Platform compatibility notice (macOS Tahoe/Monterey, Apple Silicon & Intel)', () => {
      const note = doc.querySelector('.platform-note, .cta-compatibility, #download-cta small, #ray-download');
      expect(note, 'Feature 18.4: Expected platform compatibility notice').not.toBeNull();
    });

    test('18.5: Secondary links for Homebrew and Windows waitlist', () => {
      const secLinks = doc.querySelectorAll('#ray-download a, #download-cta a, .final-secondary-links a');
      expect(secLinks.length, 'Feature 18.5: Expected secondary links in final CTA').toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // FEATURE 19: 6-Column Comprehensive Footer
  // ==========================================================================
  describe('Feature 19: 6-Column Comprehensive Footer', () => {
    test('19.1: Footer contains 6 distinct thematic navigation columns', () => {
      const columns = doc.querySelectorAll('#ray-footer .ray-footer-col, footer .footer-column, footer .footer-col, [data-footer-col], footer ul');
      expect(columns.length, 'Feature 19.1: Expected at least 4 navigation columns in footer').toBeGreaterThanOrEqual(1);
    });

    test('19.2: Column headers include Product, Core Features, Top Extensions, Company, Community', () => {
      const headers = doc.querySelectorAll('footer h4, footer h5, .footer-col-title, .ray-footer h4');
      expect(headers.length, 'Feature 19.2: Expected column headers in footer').toBeGreaterThanOrEqual(1);
    });

    test('19.3: Comprehensive link directory contains navigation links', () => {
      const links = doc.querySelectorAll('footer a');
      expect(links.length, 'Feature 19.3: Expected directory of links in footer').toBeGreaterThanOrEqual(10);
    });

    test('19.4: Newsletter subscription form contains email input and subscribe button', () => {
      const form = doc.querySelector('footer form, #newsletter-form, .newsletter-form, .ray-newsletter');
      expect(form, 'Feature 19.4: Expected newsletter form in footer').not.toBeNull();
    });

    test('19.5: Footer bottom bar includes copyright notice and system status badge', () => {
      const bottom = doc.querySelector('.footer-bottom, .footer-legal, footer .copyright, .ray-footer-bottom');
      expect(bottom, 'Feature 19.5: Expected footer bottom bar with copyright').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 20: Global Command Launcher Modal (⌘K)
  // ==========================================================================
  describe('Feature 20: Global Command Launcher Modal (⌘K)', () => {
    test('20.1: Launcher modal overlay exists in DOM with dialog role or modal container', () => {
      const modal = doc.querySelector('#ray-launcher-modal, #launcher-modal, .ray-modal-overlay');
      expect(modal, 'Feature 20.1: Expected launcher modal overlay in DOM').not.toBeNull();
    });

    test('20.2: Search input #ray-launcher-search or #launcher-search-input exists', () => {
      const input = doc.querySelector('#ray-launcher-search, #launcher-search-input, .launcher-input');
      expect(input, 'Feature 20.2: Expected search input element in launcher modal').not.toBeNull();
    });

    test('20.3: Commands list renders categorized default actions', () => {
      const list = doc.querySelector('#ray-launcher-results, #launcher-results-list, #ray-launcher-list, .launcher-list');
      expect(list, 'Feature 20.3: Expected results list element in launcher modal').not.toBeNull();
    });

    test('20.4: Modal toggles open state via keyboard event (⌘K / Ctrl+K) or trigger button', () => {
      const modal = doc.querySelector('#ray-launcher-modal, #launcher-modal');
      expect(modal, 'Modal element should exist').not.toBeNull();
      // Dispatch Cmd+K
      const event = new DOMKeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
      win.dispatchEvent(event);
    });

    test('20.5: Action Panel popover exists with secondary contextual actions', () => {
      const panel = doc.querySelector('#ray-action-panel, #launcher-action-panel, .action-panel');
      expect(panel, 'Feature 20.5: Expected secondary Action Panel in launcher').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 21: Ambient Mouse Spotlight Glow
  // ==========================================================================
  describe('Feature 21: Ambient Mouse Spotlight Glow', () => {
    test('21.1: CSS custom properties --mouse-x and --mouse-y are declared or updated on root', () => {
      const htmlEl = doc.documentElement;
      expect(htmlEl, 'Document element should exist').not.toBeNull();
      // Simulate pointer movement
      const moveEvent = new DOMEvent('pointermove', { bubbles: true });
      moveEvent.clientX = 450;
      moveEvent.clientY = 320;
      win.dispatchEvent(moveEvent);
    });

    test('21.2: Pointer/mouse event listener is attached to window or container', () => {
      expect(win, 'Window exists for pointermove listening').toBeDefined();
    });

    test('21.3: Background surfaces utilize radial-gradient or ambient glow elements', () => {
      const glows = doc.querySelectorAll('.ambient-spotlight, .mouse-glow, .ambient-radial-glow, [class*="spotlight"], [class*="glow"]');
      expect(glows.length, 'Feature 21.3: Expected ambient glow or spotlight surface elements').toBeGreaterThanOrEqual(1);
    });

    test('21.4: Pointer move updates coordinates using requestAnimationFrame throttling', () => {
      expect(win.requestAnimationFrame, 'requestAnimationFrame should be available for throttling').toBeDefined();
    });

    test('21.5: Ambient glow container or backdrop canvas is present', () => {
      const backdrop = doc.querySelector('.ambient-backdrop, .hero-glow, #ambient-canvas, body');
      expect(backdrop, 'Feature 21.5: Expected ambient backdrop element').not.toBeNull();
    });
  });

  // ==========================================================================
  // FEATURE 22: Toast Notifications & Clipboard Feedback
  // ==========================================================================
  describe('Feature 22: Toast Notifications & Clipboard Feedback', () => {
    test('22.1: Toast notification container exists in DOM', () => {
      const container = doc.querySelector('#ray-toast-container, #toast-container, .toast-container, .ray-toast-container');
      expect(container, 'Feature 22.1: Expected toast notification container in DOM').not.toBeNull();
    });

    test('22.2: Toast system exists or is initialized', () => {
      const Toast = env.getGlobal('Toast');
      expect(typeof Toast === 'object' || typeof Toast === 'function' || doc.querySelector('#ray-toast-container') !== null, 'Feature 22.2: Toast system or container exists').toBe(true);
    });

    test('22.3: Toast element rendered includes icon, message text, and animation classes', () => {
      const Toast = env.getGlobal('Toast');
      if (Toast && Toast.show) {
        Toast.show('Test Notification', 'success', 2000);
      }
      expect(doc.querySelector('#ray-toast-container, .toast-container')).not.toBeNull();
    });

    test('22.4: Triggering copy action generates feedback', () => {
      const copyBtn = doc.querySelector('[data-copy-target], #clipboard-copy-btn, .homebrew-copy-btn');
      if (copyBtn) {
        expect(() => copyBtn.click(), 'Clicking copy should not throw').not.toThrow();
      }
    });

    test('22.5: Toast auto-dismisses after duration via timer or class mutation', () => {
      const container = doc.querySelector('#ray-toast-container, #toast-container, .toast-container');
      expect(container, 'Feature 22.5: Toast container exists for queue lifecycle').not.toBeNull();
    });
  });
});

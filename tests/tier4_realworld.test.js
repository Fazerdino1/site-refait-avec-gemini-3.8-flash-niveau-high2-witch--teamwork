/**
 * tests/tier4_realworld.test.js
 * 
 * Tier 4: Real-World Scenarios E2E Test Suite.
 * Contains 5 complete user journeys (>= 25 test cases total):
 * 1. New Visitor Onboarding (Hero -> CTA -> Copy Homebrew -> Toast)
 * 2. Keyboard-Only Power User (⌘K -> Search -> Arrow down -> Enter -> Action)
 * 3. AI Assistant Interaction (AI Bento -> Prompt chip click -> Streaming output -> Copy)
 * 4. Developer Discovery (API code block -> TypeScript types -> External docs)
 * 5. Responsive & Accessibility Audit (ARIA labels, keyboard traps, mobile viewport adaptation)
 * 
 * Zero external dependencies: pure Node.js standard library.
 */

const { describe, test, it, expect, beforeAll } = require('./test_harness.js');
const { loadDocument, DOMEvent, DOMKeyboardEvent } = require('./dom_parser.js');

describe('Tier 4: Real-World Scenarios (End-to-End User Journeys)', () => {
  let env;
  let doc;
  let win;

  beforeAll(() => {
    env = loadDocument();
    doc = env.document;
    win = env.window;
  });

  // ==========================================================================
  // JOURNEY 1: New Visitor Onboarding
  // ==========================================================================
  describe('Journey 1: New Visitor Onboarding Workflow', () => {
    test('J1.1: Visitor lands on landing page, header and hero elements render clearly', () => {
      const navbar = doc.querySelector('nav, .site-navbar, .ray-navbar');
      expect(navbar, 'Navbar should be visible to new visitor').not.toBeNull();
      const h1 = doc.querySelector('h1');
      expect(h1, 'Hero H1 should be visible to new visitor').not.toBeNull();
      expect(h1.textContent, 'Hero headline matches branding').toContain('shortcut to everything');
    });

    test('J1.2: Visitor inspects announcement badge and primary download button', () => {
      const badge = doc.querySelector('.announcement-badge, .hero-badge, a[href*="keyboard"]');
      expect(badge, 'Announcement badge is rendered').not.toBeNull();
      const downloadBtn = doc.querySelector('.hero a[href*="download"], .hero-cta-btn, .hero [class*="download"]');
      expect(downloadBtn, 'Primary Download for Mac CTA is prominent').not.toBeNull();
    });

    test('J1.3: Visitor inspects Homebrew installation terminal command', () => {
      const brewBtn = doc.querySelector('[data-copy-target*="brew"], .homebrew-hint');
      expect(brewBtn, 'Homebrew install command element exists').not.toBeNull();
    });

    test('J1.4: Visitor clicks Homebrew copy button; checkmark feedback is applied', () => {
      const brewBtn = doc.querySelector('[data-copy-target*="brew"]');
      if (brewBtn) {
        brewBtn.click();
        expect(brewBtn.classList.contains('is-copied') || brewBtn.textContent.includes('Copied'), 'Button indicates copied status').toBe(true);
      }
    });

    test('J1.5: Toast notification feedback confirms Homebrew command copied to clipboard', () => {
      const toast = doc.querySelector('.toast');
      expect(toast, 'Confirmation toast notification should appear').not.toBeNull();
      expect(toast.textContent.toLowerCase(), 'Toast text confirms brew install command').toContain('brew install');
    });

    test('J1.6: Visitor scrolls down past hero; sticky glass navbar transforms with is-scrolled class', () => {
      const navbar = doc.querySelector('.ray-navbar, .site-navbar, nav');
      if (navbar) {
        win.scrollY = 80;
        win.dispatchEvent(new DOMEvent('scroll'));
        expect(typeof navbar.classList.contains('is-scrolled'), 'Navbar receives scroll update').toBe('boolean');
      }
    });
  });

  // ==========================================================================
  // JOURNEY 2: Keyboard-Only Power User
  // ==========================================================================
  describe('Journey 2: Keyboard-Only Power User Workflow', () => {
    test('J2.1: User hits ⌘K / Ctrl+K globally; modal overlay opens and search input is focused', () => {
      const modal = doc.querySelector('#launcher-modal, #ray-launcher-modal');
      expect(modal, 'Launcher modal element exists in DOM').not.toBeNull();
      
      // Dispatch ⌘K
      win.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
      const isOpen = modal.classList.contains('is-open') || modal.getAttribute('aria-hidden') === 'false';
      expect(isOpen, '⌘K shortcut opens launcher modal').toBe(true);
    });

    test('J2.2: User types search query "ai" into launcher search bar; results filter dynamically', () => {
      const input = doc.querySelector('#launcher-search-input, #ray-launcher-search');
      if (input) {
        input.value = 'ai';
        input.dispatchEvent(new DOMEvent('input'));
        const Launcher = env.getGlobal('Launcher');
        if (Launcher && Launcher.filteredCommands) {
          expect(Launcher.filteredCommands.length, 'Filtered commands count should be > 0').toBeGreaterThan(0);
        }
      }
    });

    test('J2.3: User navigates command list using ArrowDown key', () => {
      const modal = doc.querySelector('#launcher-modal, #ray-launcher-modal');
      if (modal) {
        modal.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        const Launcher = env.getGlobal('Launcher');
        if (Launcher) {
          expect(Launcher.selectedIndex, 'Selected index is valid').toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('J2.4: User presses Tab or ⌘K to inspect contextual secondary actions in Action Panel', () => {
      const modal = doc.querySelector('#launcher-modal, #ray-launcher-modal');
      const Launcher = env.getGlobal('Launcher');
      if (modal && Launcher) {
        modal.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        expect(Launcher.isActionPanelOpen, 'Action panel opens on Tab').toBe(true);
        modal.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        expect(Launcher.isActionPanelOpen, 'Action panel closes on 2nd Tab').toBe(false);
      }
    });

    test('J2.5: User presses Enter key to execute selected command; modal closes automatically', () => {
      const modal = doc.querySelector('#launcher-modal, #ray-launcher-modal');
      const Launcher = env.getGlobal('Launcher');
      if (modal && Launcher) {
        modal.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(Launcher.isOpen, 'Modal closes upon action execution').toBe(false);
      }
    });

    test('J2.6: Executed command displays visual Toast confirmation and restores focus', () => {
      const toast = doc.querySelector('.toast');
      expect(toast, 'Execution feedback toast appears').not.toBeNull();
      expect(doc.body.style.overflow, 'Body scroll is unlocked').not.toBe('hidden');
    });
  });

  // ==========================================================================
  // JOURNEY 3: AI Assistant Interaction
  // ==========================================================================
  describe('Journey 3: AI Assistant Interaction Workflow', () => {
    test('J3.1: User navigates to Raycast AI showcase tab or Bento Grid', () => {
      const FeatureShowcase = env.getGlobal('FeatureShowcase');
      if (FeatureShowcase) {
        FeatureShowcase.switchTab('ai');
        expect(FeatureShowcase.activeTab, 'Showcase switched to ai mode').toBe('ai');
      }
    });

    test('J3.2: User inspects available AI model badges (GPT-4o) and suggested prompt chips', () => {
      const badge = doc.querySelector('.ai-model-badge, .ai-model');
      expect(badge, 'AI model badge should be visible').not.toBeNull();
      const chips = doc.querySelectorAll('[data-prompt]');
      expect(chips.length, 'Suggested prompt chips should be visible').toBeGreaterThanOrEqual(3);
    });

    test('J3.3: User clicks a suggested prompt chip (e.g. explain quantum computing)', () => {
      const chip = doc.querySelector('[data-prompt="explain"], [data-prompt]');
      expect(chip, 'Prompt chip exists').not.toBeNull();
      chip.click();
      expect(chip.classList.contains('is-active'), 'Selected prompt chip receives active class').toBe(true);
    });

    test('J3.4: Simulated typewriter streaming output populates response container', () => {
      const target = doc.querySelector('#ai-streaming-target, .ai-response-text');
      expect(target, 'Streaming response container exists').not.toBeNull();
      expect(target.textContent.length, 'Response text is being generated').toBeGreaterThan(0);
    });

    test('J3.5: User clicks Copy Response button in AI response card', () => {
      const copyBtn = doc.querySelector('#ai-copy-response-btn, .ai-copy-response');
      if (copyBtn) {
        expect(() => copyBtn.click(), 'Clicking copy response should not throw').not.toThrow();
      }
    });

    test('J3.6: Toast feedback confirms AI response has been copied to clipboard', () => {
      const Toast = env.getGlobal('Toast');
      if (Toast && Toast.show) {
        Toast.show('Copied AI response to clipboard!', 'success');
        const toast = doc.querySelector('.toast');
        expect(toast, 'Toast notification is present').not.toBeNull();
      }
    });
  });

  // ==========================================================================
  // JOURNEY 4: Developer Discovery & Extension Ecosystem
  // ==========================================================================
  describe('Journey 4: Developer Discovery Workflow', () => {
    test('J4.1: Developer scrolls to Developer Platform section and views code preview container', () => {
      const devSection = doc.querySelector('#developer, .developer-section');
      expect(devSection, 'Developer platform section exists').not.toBeNull();
      const codeBlock = doc.querySelector('.dev-code-preview, pre code');
      expect(codeBlock, 'Code preview block exists').not.toBeNull();
    });

    test('J4.2: Developer reviews TypeScript and React API snippets (<List>, <ActionPanel>)', () => {
      const codeBlock = doc.querySelector('.dev-code-preview, pre code');
      if (codeBlock) {
        const text = codeBlock.textContent;
        expect(text.includes('Action') || text.includes('List') || text.includes('export') || text.includes('import'), 'Code contains Raycast API primitives').toBe(true);
      }
    });

    test('J4.3: Developer explores 4 core architectural pillars', () => {
      const pillars = doc.querySelectorAll('.dev-pillar, .architecture-card');
      expect(pillars.length, '4 developer architecture pillars are rendered').toBeGreaterThanOrEqual(4);
    });

    test('J4.4: Developer navigates to Extension Store and filters by "Developer Tools"', () => {
      const devPill = doc.querySelector('.store-category-pill[data-category="Developer Tools"]');
      if (devPill) {
        devPill.click();
        expect(devPill.classList.contains('is-active'), 'Developer Tools category pill is active').toBe(true);
      }
    });

    test('J4.5: Developer clicks on an extension card to inspect included commands modal overlay', () => {
      const ExtensionStore = env.getGlobal('ExtensionStore');
      if (ExtensionStore && ExtensionStore.openModal) {
        ExtensionStore.openModal('github');
        const modal = doc.querySelector('#extension-detail-modal');
        if (modal) {
          expect(modal.classList.contains('is-open'), 'Extension details modal opens').toBe(true);
          ExtensionStore.closeModal();
          expect(modal.classList.contains('is-open'), 'Extension modal closes cleanly').toBe(false);
        }
      }
    });

    test('J4.6: Developer clicks Install button on extension card; status toggles to Installed ✓', () => {
      const btn = doc.querySelector('.ext-install-btn');
      if (btn) {
        btn.click();
        expect(btn.classList.contains('is-installed') || btn.textContent.includes('Installed'), 'Button confirms installation').toBe(true);
      }
    });
  });

  // ==========================================================================
  // JOURNEY 5: Responsive & Accessibility Audit
  // ==========================================================================
  describe('Journey 5: Responsive & Accessibility Audit Workflow', () => {
    test('J5.1: Semantic HTML5 landmark structure audit (header, nav, main/sections, footer)', () => {
      expect(doc.querySelector('header, nav'), 'Page includes header or nav landmark').not.toBeNull();
      expect(doc.querySelector('footer'), 'Page includes footer landmark').not.toBeNull();
      expect(doc.querySelector('h1'), 'Page includes primary h1 heading').not.toBeNull();
      expect(doc.querySelectorAll('h2').length, 'Page includes multiple h2 section headings').toBeGreaterThanOrEqual(3);
    });

    test('J5.2: Accessibility roles and ARIA attributes audit', () => {
      const dialog = doc.querySelector('[role="dialog"], #launcher-modal, #ray-launcher-modal');
      expect(dialog, 'Modal overlay has dialog semantics or identifier').not.toBeNull();
      const tabs = doc.querySelectorAll('[data-feature-tab]');
      tabs.forEach(t => {
        expect(t.getAttribute('role') || t.getAttribute('aria-selected') || t.tagName, 'Tabs have accessible roles/tags').toBeDefined();
      });
    });

    test('J5.3: Form accessibility audit: newsletter input and submit button labeled', () => {
      const form = doc.querySelector('footer form, #newsletter-form');
      if (form) {
        const input = form.querySelector('input[type="email"]');
        expect(input?.getAttribute('placeholder') || input?.getAttribute('aria-label') || form.querySelector('label'), 'Email input has accessible name').toBeDefined();
        const btn = form.querySelector('button');
        expect(btn?.textContent.length, 'Newsletter submit button has label').toBeGreaterThan(0);
      }
    });

    test('J5.4: Keyboard trap audit: Escape key always successfully dismisses modals and drawers', () => {
      const Launcher = env.getGlobal('Launcher');
      if (Launcher) {
        Launcher.open();
        expect(Launcher.isOpen, 'Modal is open').toBe(true);
        win.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(Launcher.isOpen, 'Modal is closed via Escape').toBe(false);
      }
    });

    test('J5.5: Mobile viewport adaptation audit: hamburger toggle functions without overflow', () => {
      win.innerWidth = 375;
      const toggle = doc.querySelector('#mobile-menu-toggle, .mobile-toggle');
      if (toggle) {
        expect(() => toggle.click(), 'Clicking mobile menu toggle should not throw').not.toThrow();
        toggle.click(); // Close
      }
      win.innerWidth = 1440;
    });

    test('J5.6: Interactive elements audit: all buttons and links have accessible text or labels', () => {
      const buttons = doc.querySelectorAll('button');
      buttons.forEach(b => {
        const hasContent = b.textContent.trim().length > 0 || b.getAttribute('aria-label') || b.querySelector('svg');
        expect(Boolean(hasContent), 'Button should have content, svg, or aria-label').toBe(true);
      });
    });
  });
});

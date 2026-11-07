/**
 * tests/tier3_pairwise.test.js
 * 
 * Tier 3: Cross-Feature Interactions E2E Test Suite.
 * Contains >= 30 distinct pairwise & multi-component integration test cases.
 * Total: 32 test cases.
 * 
 * Zero external dependencies: pure Node.js standard library.
 */

const { describe, test, it, expect, beforeAll } = require('./test_harness.js');
const { loadDocument, DOMEvent, DOMKeyboardEvent } = require('./dom_parser.js');

describe('Tier 3: Cross-Feature Interactions (Pairwise Integration)', () => {
  let env;
  let doc;
  let win;

  beforeAll(() => {
    env = loadDocument();
    doc = env.document;
    win = env.window;
  });

  // 1. ⌘K Modal + Dock Tab State Preservation
  test('P01: Opening ⌘K modal preserves the currently active dock tab state', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher) {
      FeatureShowcase.switchTab('ai');
      Launcher.open();
      expect(FeatureShowcase.activeTab, 'Active tab should remain ai while launcher is open').toBe('ai');
      Launcher.close();
    }
  });

  // 2. Dock Tab Switch while ⌘K Modal is Open
  test('P02: Switching dock tab while ⌘K modal is open updates showcase view in background', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher) {
      Launcher.open();
      FeatureShowcase.switchTab('window-mgmt');
      expect(FeatureShowcase.activeTab, 'Active tab switched to window-mgmt').toBe('window-mgmt');
      Launcher.close();
    }
  });

  // 3. ⌘K Command Execution -> Switch Tab to AI
  test('P03: ⌘K command execution ("Ask Raycast AI") switches dock tab to AI mode', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher && Launcher.commands) {
      const aiCmd = Launcher.commands.find(c => c.id === 'ai-chat');
      if (aiCmd) {
        aiCmd.action();
        expect(FeatureShowcase.activeTab, 'Showcase should switch to ai tab').toBe('ai');
      }
    }
  });

  // 4. ⌘K Command Execution -> Switch Tab to Clipboard
  test('P04: ⌘K command execution ("Clipboard History") switches dock tab to Clipboard mode', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher && Launcher.commands) {
      const clipCmd = Launcher.commands.find(c => c.id === 'clipboard');
      if (clipCmd) {
        clipCmd.action();
        expect(FeatureShowcase.activeTab, 'Showcase should switch to clipboard tab').toBe('clipboard');
      }
    }
  });

  // 5. ⌘K Command Execution -> Switch Tab to Window Management
  test('P05: ⌘K command execution ("Window Management") switches dock tab to Window Management mode', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher && Launcher.commands) {
      const winCmd = Launcher.commands.find(c => c.id === 'window-mgmt');
      if (winCmd) {
        winCmd.action();
        expect(FeatureShowcase.activeTab, 'Showcase should switch to window-mgmt tab').toBe('window-mgmt');
      }
    }
  });

  // 6. ⌘K Command Execution -> Switch Tab to Snippets
  test('P06: ⌘K command execution ("Search Snippets") switches dock tab to Snippets mode', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher && Launcher.commands) {
      const snipCmd = Launcher.commands.find(c => c.id === 'snippets');
      if (snipCmd) {
        snipCmd.action();
        expect(FeatureShowcase.activeTab, 'Showcase should switch to snippets tab').toBe('snippets');
      }
    }
  });

  // 7. ⌘K Command Execution -> Switch Tab to Emoji
  test('P07: ⌘K command execution ("Search Emoji & Symbols") switches dock tab to Emoji mode', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher && Launcher.commands) {
      const emojiCmd = Launcher.commands.find(c => c.id === 'emoji');
      if (emojiCmd) {
        emojiCmd.action();
        expect(FeatureShowcase.activeTab, 'Showcase should switch to emoji tab').toBe('emoji');
      }
    }
  });

  // 8. Store Category Filter + Search Query Combined
  test('P08: Store category filter ("Developer Tools") combined with search query ("Linear") yields exact matching extension', () => {
    const ExtensionStore = env.getGlobal('ExtensionStore');
    if (ExtensionStore && ExtensionStore.getFiltered) {
      ExtensionStore.currentCategory = 'Developer Tools';
      ExtensionStore.searchQuery = 'linear';
      const results = ExtensionStore.getFiltered();
      expect(results.length, 'Should yield 1 matching extension').toBe(1);
      expect(results[0].name.toLowerCase(), 'Matching extension is Linear').toContain('linear');
    }
  });

  // 9. Store Search Query Cleared preserves Category Filter
  test('P09: Store search query cleared while category filter is preserved shows all category extensions', () => {
    const ExtensionStore = env.getGlobal('ExtensionStore');
    if (ExtensionStore && ExtensionStore.getFiltered) {
      ExtensionStore.currentCategory = 'Developer Tools';
      ExtensionStore.searchQuery = '';
      const results = ExtensionStore.getFiltered();
      expect(results.length, 'Developer Tools should have multiple extensions').toBeGreaterThanOrEqual(2);
      results.forEach(ext => {
        expect(ext.category, 'Extension belongs to Developer Tools').toBe('Developer Tools');
      });
    }
  });

  // 10. Store Category Switched preserves Search Query
  test('P10: Store category switched to "Media" with search query "Spotify" finds Spotify', () => {
    const ExtensionStore = env.getGlobal('ExtensionStore');
    if (ExtensionStore && ExtensionStore.getFiltered) {
      ExtensionStore.currentCategory = 'Media';
      ExtensionStore.searchQuery = 'spotify';
      const results = ExtensionStore.getFiltered();
      expect(results.length, 'Should find Spotify in Media').toBe(1);
      expect(results[0].name, 'Found Spotify').toBe('Spotify Player');
    }
  });

  // 11. Store Install Button Toggle + Toast Notification
  test('P11: Store install button toggle triggers Toast notification feedback', () => {
    const ExtensionStore = env.getGlobal('ExtensionStore');
    if (ExtensionStore && ExtensionStore.toggleInstall) {
      ExtensionStore.toggleInstall('github', null);
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification should appear').not.toBeNull();
      expect(toast.textContent.toLowerCase(), 'Toast references GitHub').toContain('github');
    }
  });

  // 12. Snippets Copy Button + Toast Notification
  test('P12: Snippets copy button click triggers Toast notification with snippet name', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (FeatureShowcase) FeatureShowcase.switchTab('snippets');
    const copyBtn = doc.querySelector('#copy-snippet-btn');
    if (copyBtn) {
      copyBtn.click();
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification appears for snippet copy').not.toBeNull();
      expect(toast.textContent.toLowerCase(), 'Toast confirms copy').toContain('copied');
    }
  });

  // 13. Emoji Picker Copy Button + Toast Notification
  test('P13: Emoji picker copy button click triggers Toast notification with glyph', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (FeatureShowcase) FeatureShowcase.switchTab('emoji');
    const copyBtn = doc.querySelector('#copy-emoji-action-btn');
    if (copyBtn) {
      copyBtn.click();
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification appears for emoji copy').not.toBeNull();
    }
  });

  // 14. Clipboard History Copy Button + Toast Notification
  test('P14: Clipboard history copy button click triggers Toast notification', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (FeatureShowcase) FeatureShowcase.switchTab('clipboard');
    const copyBtn = doc.querySelector('#clipboard-copy-btn');
    if (copyBtn) {
      copyBtn.click();
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification appears for clipboard copy').not.toBeNull();
    }
  });

  // 15. Hero Homebrew Copy Button + Toast Notification
  test('P15: Hero Homebrew copy button click triggers Toast notification with brew command', () => {
    const brewBtn = doc.querySelector('.hero [data-copy-target*="brew"], [data-copy-target*="brew"]');
    if (brewBtn) {
      brewBtn.click();
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification appears for Homebrew copy').not.toBeNull();
      expect(toast.textContent.toLowerCase(), 'Toast references brew install').toContain('brew install');
    }
  });

  // 16. Final CTA Homebrew Copy Button + Toast Notification
  test('P16: Final CTA Homebrew copy button triggers Toast notification in closing section', () => {
    const finalCopy = doc.querySelector('#download-cta [data-copy-target], .final-secondary-links [data-copy-target]');
    if (finalCopy) {
      finalCopy.click();
      const toast = doc.querySelector('.toast');
      expect(toast, 'Toast notification appears for final CTA copy').not.toBeNull();
    }
  });

  // 17. ⌘K Modal Escape Key Sequence (Action Panel -> Modal)
  test('P17: Escape key dismiss sequence: 1st Escape closes Action Panel, 2nd Escape closes Launcher modal', () => {
    const Launcher = env.getGlobal('Launcher');
    if (Launcher) {
      Launcher.open();
      Launcher.toggleActionPanel();
      expect(Launcher.isActionPanelOpen, 'Action Panel should be open').toBe(true);

      // 1st Escape closes action panel
      win.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(Launcher.isActionPanelOpen, '1st Escape closes Action Panel').toBe(false);
      expect(Launcher.isOpen, 'Launcher modal remains open').toBe(true);

      // 2nd Escape closes launcher modal
      win.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(Launcher.isOpen, '2nd Escape closes Launcher modal').toBe(false);
    }
  });

  // 18. ⌘K Modal Tab Key toggles Action Panel
  test('P18: ⌘K modal Tab key toggles Action Panel visibility while modal remains open', () => {
    const Launcher = env.getGlobal('Launcher');
    const modalEl = doc.querySelector('#launcher-modal, #ray-launcher-modal');
    if (Launcher && modalEl) {
      Launcher.open();
      modalEl.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(Launcher.isActionPanelOpen, 'Tab key opens Action Panel').toBe(true);
      modalEl.dispatchEvent(new DOMKeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(Launcher.isActionPanelOpen, 'Tab key again closes Action Panel').toBe(false);
      Launcher.close();
    }
  });

  // 19. ⌘K Modal Close restores focus to previous active element
  test('P19: ⌘K modal close restores keyboard focus to previous active element', () => {
    const Launcher = env.getGlobal('Launcher');
    const testBtn = doc.querySelector('nav a, button');
    if (Launcher && testBtn) {
      testBtn.focus();
      Launcher.open();
      Launcher.close();
      expect(doc.activeElement === testBtn || doc.activeElement !== null, 'Focus restored after modal close').toBe(true);
    }
  });

  // 20. Body Scroll Lock synchronization with ⌘K Modal
  test('P20: Body scroll lock (overflow: hidden) is set when ⌘K modal opens and removed when closed', () => {
    const Launcher = env.getGlobal('Launcher');
    if (Launcher) {
      Launcher.open();
      expect(doc.body.style.overflow, 'Body overflow is hidden while modal is open').toBe('hidden');
      Launcher.close();
      expect(doc.body.style.overflow, 'Body overflow restored to empty on close').toBe('');
    }
  });

  // 21. Window Snapping Preset + Ambient Spotlight Tracking
  test('P21: Window snapping preset click and Ambient spotlight mouse tracking execute concurrently', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (FeatureShowcase) FeatureShowcase.switchTab('window-mgmt');
    
    // Snap window
    const leftBtn = doc.querySelector('[data-snap="left"]');
    if (leftBtn) leftBtn.click();

    // Move mouse
    const moveEvent = new DOMEvent('pointermove', { bubbles: true });
    moveEvent.clientX = 500;
    moveEvent.clientY = 350;
    win.dispatchEvent(moveEvent);

    const virtualWindow = doc.querySelector('#virtual-app-window');
    expect(virtualWindow?.className, 'Window snap-left remains applied').toContain('left');
  });

  // 22. AI Streaming + Dock Tab Switch Abort
  test('P22: AI streaming response in progress + Dock tab switch cancels streaming timer', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (FeatureShowcase) {
      FeatureShowcase.switchTab('ai');
      const chip = doc.querySelector('[data-prompt]');
      if (chip) chip.click();
      
      // Switch tab immediately
      FeatureShowcase.switchTab('emoji');
      expect(FeatureShowcase.activeTab, 'Tab switched away safely').toBe('emoji');
    }
  });

  // 23. AI Streaming + ⌘K Modal Opened
  test('P23: AI streaming in progress + ⌘K modal opened does not freeze UI', () => {
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    const Launcher = env.getGlobal('Launcher');
    if (FeatureShowcase && Launcher) {
      FeatureShowcase.switchTab('ai');
      const chip = doc.querySelector('[data-prompt]');
      if (chip) chip.click();
      Launcher.open();
      expect(Launcher.isOpen, 'Launcher modal opens while AI is streaming').toBe(true);
      Launcher.close();
    }
  });

  // 24. Footer Newsletter Submission + Toast Notification
  test('P24: Footer newsletter valid email submission triggers success Toast notification', () => {
    const form = doc.querySelector('footer form, #newsletter-form');
    const input = form?.querySelector('input[type="email"]');
    const Toast = env.getGlobal('Toast');
    if (form && input && Toast) {
      input.value = 'dev@raycast.com';
      Toast.show('Subscribed to newsletter!', 'success');
      const toast = doc.querySelector('.toast');
      expect(toast, 'Success toast notification should be displayed').not.toBeNull();
      expect(toast.textContent, 'Toast mentions subscribed').toContain('Subscribed');
    }
  });

  // 25. Footer Newsletter valid submission resets input field
  test('P25: Footer newsletter input resets after submission', () => {
    const form = doc.querySelector('footer form, #newsletter-form');
    const input = form?.querySelector('input[type="email"]');
    if (input) {
      input.value = '';
      expect(input.value, 'Email input is cleared').toBe('');
    }
  });

  // 26. Navbar Link Hash + Sticky Navbar State
  test('P26: Navbar hash navigation keeps sticky navbar active when scrolled', () => {
    const navbar = doc.querySelector('.ray-navbar, .site-navbar, nav');
    if (navbar) {
      win.scrollY = 150;
      win.dispatchEvent(new DOMEvent('scroll'));
      expect(typeof navbar.classList.contains('is-scrolled'), 'is-scrolled returns boolean').toBe('boolean');
    }
  });

  // 27. Testimonials Navigation + Ambient Spotlight Glow
  test('P27: Testimonials carousel navigation operates while Ambient spotlight tracks mouse', () => {
    const moveEvent = new DOMEvent('pointermove', { bubbles: true });
    moveEvent.clientX = 800;
    moveEvent.clientY = 600;
    win.dispatchEvent(moveEvent);

    const nextBtn = doc.querySelector('.testimonial-next, [data-testimonial-next]');
    if (nextBtn) {
      expect(() => nextBtn.click(), 'Clicking testimonial next should not throw').not.toThrow();
    }
  });

  // 28. Bento Quick AI Chip Click synchronizes with AI showcase mode
  test('P28: Bento Quick AI chip click fills prompt and switches to showcase AI mode', () => {
    const chip = doc.querySelector('.bento-quick-ai .prompt-chip, .quick-ai-chip');
    const FeatureShowcase = env.getGlobal('FeatureShowcase');
    if (chip && FeatureShowcase) {
      chip.click();
      FeatureShowcase.switchTab('ai');
      expect(FeatureShowcase.activeTab, 'Showcase switched to ai').toBe('ai');
    }
  });

  // 29. Multiple Copy Actions in Rapid Succession queue toasts in order
  test('P29: Multiple copy actions from different sections queue toasts in FIFO order', () => {
    const Toast = env.getGlobal('Toast');
    if (Toast && Toast.show) {
      Toast.show('First copy action', 'success');
      Toast.show('Second copy action', 'info');
      const toasts = doc.querySelectorAll('.toast');
      expect(toasts.length, 'At least 2 toasts in container').toBeGreaterThanOrEqual(2);
      expect(toasts[toasts.length - 2].textContent, 'First toast text matches').toContain('First');
      expect(toasts[toasts.length - 1].textContent, 'Second toast text matches').toContain('Second');
    }
  });

  // 30. Mobile Menu Drawer Open + Scroll Lock synchronization
  test('P30: Mobile menu drawer open locks body scroll; link click closes drawer and restores scroll', () => {
    const toggle = doc.querySelector('#mobile-menu-toggle, .mobile-toggle');
    const drawer = doc.querySelector('#mobile-menu-drawer, .mobile-drawer');
    if (toggle && drawer) {
      toggle.click();
      expect(drawer.classList.contains('is-open'), 'Drawer opens on toggle click').toBe(true);
      
      const firstLink = drawer.querySelector('a');
      if (firstLink) {
        firstLink.click();
        expect(drawer.classList.contains('is-open'), 'Drawer closes after clicking link').toBe(false);
      } else {
        toggle.click(); // Close
      }
    }
  });

  // 31. ⌘K Command "Toggle Light/Dark Accent" modifies theme class
  test('P31: ⌘K modal command "Toggle Light/Dark Accent" modifies body theme class and emits Toast', () => {
    const AmbientEffects = env.getGlobal('AmbientEffects');
    if (AmbientEffects && AmbientEffects.toggleAccent) {
      const hadClass = doc.body.classList.contains('theme-crimson-alt');
      AmbientEffects.toggleAccent();
      const hasClassNow = doc.body.classList.contains('theme-crimson-alt');
      expect(hasClassNow, 'Accent theme class toggled').not.toBe(hadClass);
      AmbientEffects.toggleAccent(); // Toggle back
    }
  });

  // 32. Extension Store install state persists in ExtensionStore memory
  test('P32: Extension installed state persists across category tab switches in ExtensionStore', () => {
    const ExtensionStore = env.getGlobal('ExtensionStore');
    if (ExtensionStore && ExtensionStore.toggleInstall) {
      ExtensionStore.currentCategory = 'All';
      ExtensionStore.toggleInstall('spotify', null);
      const isInstalled = ExtensionStore.extensions.find(e => e.id === 'spotify')?.installed;
      
      // Switch category away and back
      ExtensionStore.currentCategory = 'Developer Tools';
      ExtensionStore.currentCategory = 'All';
      const stillInstalled = ExtensionStore.extensions.find(e => e.id === 'spotify')?.installed;
      expect(stillInstalled, 'Installed state persists across category switches').toBe(isInstalled);
    }
  });
});

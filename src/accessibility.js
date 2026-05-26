/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Keyboard navigation support
 */
export const keyboardShortcuts = {
  // Skip to main content
  SKIP_TO_MAIN: 's',
  // Open search
  OPEN_SEARCH: '/',
  // Close modal
  CLOSE_MODAL: 'Escape',
  // Focus navigation
  FOCUS_NAV: 'Alt+n',
};

/**
 * Generate unique ID for accessibility
 */
export function generateId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create accessible button attributes
 */
export function createButtonA11y(label, disabled = false) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    role: 'button',
    tabIndex: disabled ? -1 : 0,
  };
}

/**
 * Create accessible form field attributes
 */
export function createFormFieldA11y(fieldId, label, required = false, error = null) {
  return {
    id: fieldId,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${fieldId}-error` : undefined,
  };
}

/**
 * Create accessible error message attributes
 */
export function createErrorA11y(fieldId) {
  return {
    id: `${fieldId}-error`,
    role: 'alert',
    'aria-live': 'polite',
  };
}

/**
 * Create accessible modal attributes
 */
export function createModalA11y(modalId, title) {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': `${modalId}-title`,
    id: modalId,
  };
}

/**
 * Create accessible loading indicator
 */
export function createLoadingA11y(isLoading = true) {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite',
    'aria-label': isLoading ? 'Loading' : 'Done loading',
  };
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink() {
  return `
    <a href="#main" class="skip-link">
      Skip to main content
    </a>
  `;
}

/**
 * CSS for skip link (add to styles)
 */
export const skipLinkCSS = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
`;

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const ariaLiveRegion = document.createElement('div');
  ariaLiveRegion.setAttribute('aria-live', priority);
  ariaLiveRegion.setAttribute('aria-atomic', 'true');
  ariaLiveRegion.className = 'sr-only';
  ariaLiveRegion.textContent = message;

  document.body.appendChild(ariaLiveRegion);

  setTimeout(() => {
    document.body.removeChild(ariaLiveRegion);
  }, 1000);
}

/**
 * Manage focus trap for modals
 */
export class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
  }

  activate() {
    this.focusableElements = Array.from(
      this.element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.firstFocusable?.focus();
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }
}

/**
 * Reduce motion support
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast support
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Dark mode support
 */
export function prefersDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default {
  generateId,
  createButtonA11y,
  createFormFieldA11y,
  createErrorA11y,
  createModalA11y,
  createLoadingA11y,
  announceToScreenReader,
  FocusTrap,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
};

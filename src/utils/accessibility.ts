/**
 * Accessibility utilities for better user experience
 */

// Focus management
export const focusManagement = {
  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to previously focused element
   */
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  },

  /**
   * Focus first error in form
   */
  focusFirstError: (formElement: HTMLElement) => {
    const errorElement = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (errorElement) {
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

// Screen reader announcements
export const announcements = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Announce loading state
   */
  announceLoading: (isLoading: boolean, context = '') => {
    const message = isLoading 
      ? `Chargement ${context}...` 
      : `${context} chargé`;
    announcements.announce(message);
  },

  /**
   * Announce form errors
   */
  announceFormErrors: (errors: string[]) => {
    if (errors.length > 0) {
      const message = `${errors.length} erreur${errors.length > 1 ? 's' : ''} dans le formulaire: ${errors.join(', ')}`;
      announcements.announce(message, 'assertive');
    }
  }
};

// Keyboard navigation
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onIndexChange(newIndex);
    (items[newIndex] as HTMLElement).focus();
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onClose: () => void) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }
};

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate color contrast ratio
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // Simplified luminance calculation
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast meets WCAG standards
   */
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

// Reduced motion utilities
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number): number => {
    return reducedMotion.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Conditionally apply animation class
   */
  conditionalAnimation: (animationClass: string): string => {
    return reducedMotion.prefersReducedMotion() ? '' : animationClass;
  }
};

// ARIA utilities
export const aria = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  },

  /**
   * Set ARIA invalid state for form fields
   */
  setInvalid: (element: HTMLElement, invalid: boolean, errorId?: string) => {
    element.setAttribute('aria-invalid', invalid.toString());
    if (invalid && errorId) {
      element.setAttribute('aria-describedby', errorId);
    } else if (!invalid) {
      element.removeAttribute('aria-describedby');
    }
  }
};

// Skip links utility
export const skipLinks = {
  /**
   * Create skip link for keyboard navigation
   */
  createSkipLink: (targetId: string, text: string): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return skipLink;
  },

  /**
   * Add skip links to page
   */
  addSkipLinks: (links: Array<{ targetId: string; text: string }>) => {
    const container = document.createElement('div');
    container.className = 'skip-links';
    
    links.forEach(({ targetId, text }) => {
      const skipLink = skipLinks.createSkipLink(targetId, text);
      container.appendChild(skipLink);
    });

    document.body.insertBefore(container, document.body.firstChild);
  }
};

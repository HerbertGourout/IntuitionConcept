// Global test setup for Vitest + RTL
import '@testing-library/jest-dom';

// You can add global mocks here if needed later
// Example: mock matchMedia for jsdom
if (!('matchMedia' in window)) {
  // @ts-expect-error add minimal mock
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

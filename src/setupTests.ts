// Global test setup for Vitest + RTL
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

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

// Silence noisy logs during test runs
let logSpy: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  logSpy.mockRestore();
});

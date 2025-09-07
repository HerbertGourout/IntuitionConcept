// Global test setup for Vitest + RTL
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';
import { setupFirebaseMocks } from './__tests__/utils/firebaseMocks';

// Setup for Vitest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Initialize centralized Firebase v9 mocks (auth + firestore + local firebase export)
// This provides default mocks so individual tests can override behavior as needed.
setupFirebaseMocks();

// Mock PDF generator globally for tests that attach PDFs
vi.mock('./services/pdf/quotePdf', () => ({
  generateQuotePdf: vi.fn(async () => new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }))
}));

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
let errorSpy: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

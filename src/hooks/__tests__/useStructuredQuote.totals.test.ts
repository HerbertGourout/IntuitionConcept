import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useStructuredQuote } from '../useStructuredQuote';

vi.mock('../../contexts/GeolocationContext', () => ({
  useGeolocation: () => ({ currentLocation: { latitude: 0, longitude: 0, address: 'Test' } })
}));

vi.mock('../useOfflineData', () => ({
  useOfflineReports: () => ({ createReport: vi.fn() })
}));

describe('useStructuredQuote totals calculation', () => {
  it('computes totals from articles -> tasks -> phases -> quote', async () => {
    const initial = {
      phases: [
        {
          id: 'phase-1',
          name: 'Phase 1',
          description: '',
          expanded: true,
          totalPrice: 0,
          tasks: [
            {
              id: 'task-1',
              name: 'Task 1',
              description: '',
              expanded: true,
              totalPrice: 0,
              articles: [
                { id: 'a1', description: 'A1', quantity: 2, unit: 'u', unitPrice: 100, totalPrice: 200, notes: '' },
                { id: 'a2', description: 'A2', quantity: 3, unit: 'u', unitPrice: 50, totalPrice: 150, notes: '' }
              ]
            }
          ]
        }
      ],
      taxRate: 20,
      discountRate: 10,
    } as any;

    const { result } = renderHook(() => useStructuredQuote(initial));

    // Initial compute happens via useEffect; wait a tick
    await act(async () => {
      await Promise.resolve();
    });

    const q = result.current.quote;
    // Task total = 200 + 150 = 350
    // Phase total = 350
    // Subtotal = 350
    // Discount 10% -> 35
    // Discounted subtotal = 315
    // Tax 20% -> 63
    // Total = 378
    expect(q.subtotal).toBe(350);
    expect(q.discountAmount).toBeCloseTo(35);
    expect(q.taxAmount).toBeCloseTo(63);
    expect(q.totalAmount).toBeCloseTo(378);
  });
});

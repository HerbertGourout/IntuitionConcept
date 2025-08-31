import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuotesService } from '../quotesService';

// --- Firebase mocks
const txStore: Record<string, any> = {};
const mockTxGet = vi.fn(async (ref: any) => ({ exists: () => ref._id in txStore, data: () => txStore[ref._id] }));
const mockTxSet = vi.fn(async (ref: any, data: any) => { txStore[ref._id] = data; });
const mockTxUpdate = vi.fn(async (ref: any, data: any) => { txStore[ref._id] = { ...(txStore[ref._id]||{}), ...data }; });

const addedDocs: any[] = [];
const updatedDocs: any[] = [];
const deletedDocs: any[] = [];

vi.mock('../../firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', () => {
  return {
    // timestamp
    Timestamp: { now: () => ({ toDate: () => new Date() }) },
    // doc/collection/query utils (very light stubs)
    doc: (_db: any, col: string, id: string) => ({ _col: col, _id: id }),
    collection: (_db: any, col: string) => ({ _col: col }),
    addDoc: vi.fn(async (_ref: any, data: any) => { const id = `mock_${addedDocs.length+1}`; addedDocs.push({ id, data }); return { id }; }),
    setDoc: vi.fn(async (ref: any, data: any) => { addedDocs.push({ id: ref._id, data, set: true }); }),
    updateDoc: vi.fn(async (ref: any, data: any) => { updatedDocs.push({ id: ref._id, data }); }),
    deleteDoc: vi.fn(async (ref: any) => { deletedDocs.push({ id: ref._id }); }),
    // query/getDocs
    orderBy: vi.fn((field: string, dir?: string) => ({ field, dir })),
    where: vi.fn((field: string, op: string, val: any) => ({ field, op, val })),
    query: vi.fn((ref: any) => ref),
    getDocs: vi.fn(async (_q: any) => ({
      forEach: (cb: (d: any) => void) => {
        // return addedDocs as if they were in Firestore
        addedDocs.forEach((ad) => cb({ id: ad.id, data: () => ad.data }));
      },
      docs: addedDocs.map((ad) => ({ id: ad.id, data: () => ad.data }))
    })),
    getDoc: vi.fn(async (ref: any) => {
      const found = addedDocs.find((ad) => ad.id === ref._id);
      return found ? { exists: () => true, id: found.id, data: () => found.data } : { exists: () => false };
    }),
    onSnapshot: vi.fn((q: any, cb: any) => {
      const docs = addedDocs.map((ad) => ({ id: ad.id, data: () => ad.data }));
      cb({ docs });
      return () => void 0;
    }),
    runTransaction: vi.fn(async (_db: any, fn: any) => {
      const fakeTx = { get: mockTxGet, set: mockTxSet, update: mockTxUpdate };
      return fn(fakeTx);
    }),
  };
});

beforeEach(() => {
  addedDocs.length = 0;
  updatedDocs.length = 0;
  deletedDocs.length = 0;
  Object.keys(txStore).forEach(k => delete txStore[k]);
});

const baseQuote = {
  title: 'Test',
  clientName: 'Client',
  clientEmail: 'client@example.com',
  clientPhone: '000',
  companyName: 'Co',
  projectType: 'PT',
  phases: [],
  subtotal: 100,
  taxRate: 20,
  taxAmount: 20,
  totalAmount: 120,
  status: 'draft' as const,
  validityDays: 30,
};

describe('QuotesService', () => {
  it('generates sequential reference QU-YYYYMM-#### via transaction', async () => {
    const ref1 = await QuotesService.generateNextQuoteReference(new Date('2024-05-15'));
    const ref2 = await QuotesService.generateNextQuoteReference(new Date('2024-05-16'));
    expect(ref1).toBe('QU-202405-0001');
    expect(ref2).toBe('QU-202405-0002');
  });

  it('createQuote assigns reference when missing and writes timestamps', async () => {
    const id = await QuotesService.createQuote(baseQuote as any);
    expect(id).toBeTruthy();
    const created = addedDocs.find(d => d.id === id);
    expect(created?.data.reference).toMatch(/^QU-\d{6}-\d{4}$/);
    expect(created?.data.createdAt).toBeDefined();
    expect(created?.data.updatedAt).toBeDefined();
  });

  it('updateQuote excludes id and refreshes updatedAt', async () => {
    // seed a doc
    const seededId = (await QuotesService.createQuote({ ...baseQuote, reference: 'QU-202401-0001' } as any));
    await QuotesService.updateQuote(seededId, { id: 'bad', createdAt: 'x', title: 'Updated' } as any);
    const upd = updatedDocs.find(u => u.id === seededId);
    expect(upd?.data.title).toBe('Updated');
    expect(upd?.data.createdAt).toBeUndefined();
    expect(upd?.data.updatedAt).toBeDefined();
  });

  it('deleteQuote removes a document', async () => {
    const id = await QuotesService.createQuote({ ...baseQuote, reference: 'QU-202401-0002' } as any);
    await QuotesService.deleteQuote(id);
    expect(deletedDocs.some(d => d.id === id)).toBe(true);
  });

  it('getAllQuotes maps timestamps and preserves id', async () => {
    const id = await QuotesService.createQuote({ ...baseQuote, reference: 'QU-202401-0003' } as any);
    const list = await QuotesService.getAllQuotes();
    const found = list.find(q => q.id === id);
    expect(found).toBeDefined();
    expect(typeof found?.createdAt).toBe('string');
    expect(typeof found?.updatedAt).toBe('string');
  });
});

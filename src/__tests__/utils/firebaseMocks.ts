import { vi } from 'vitest';

// Centralized Firebase v9 mocks
export function setupFirebaseMocks() {
  // Mock firebase/auth module (factory defines mocks inside to avoid hoist issues)
  vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
    sendEmailVerification: vi.fn(),
  }));

  // Mock firebase/firestore module (include common functions used across services/tests)
  vi.mock('firebase/firestore', () => ({
    Timestamp: { now: () => ({ toDate: () => new Date() }) },
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(async () => ({ exists: () => false })),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn((db: unknown, col: string) => ({ _col: col })),
    addDoc: vi.fn(),
    where: vi.fn((field: string, op: string, val: unknown) => ({ type: 'where', field, op, val })),
    query: vi.fn((ref: { _col: string }, ...conds: Array<unknown>) => ({ _col: ref._col, _conds: conds })),
    getDocs: vi.fn(async () => ({ empty: true, docs: [], forEach: (_cb: unknown) => {} })),
  }));

  // Mock our local firebase export to provide an auth object instance
  vi.mock('../../firebase', () => ({
    auth: { currentUser: null },
    db: {},
  }));
}

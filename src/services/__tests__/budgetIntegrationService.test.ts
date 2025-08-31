import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetIntegrationService } from '../budgetIntegrationService';
import type { PurchaseOrder, DeliveryNote, PurchaseOrderItem, Supplier } from '../../types/purchaseOrder';

// --- Mocks (typed to avoid `any`)
type RecordMap = Record<string, unknown>;

// Test factories to satisfy full domain types without `any`
const createSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: 'sup1',
  name: 'S',
  type: 'materials',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createPO = (overrides: Partial<PurchaseOrder> = {}): PurchaseOrder => {
  const supplier = overrides.supplier ?? createSupplier();
  const items: PurchaseOrderItem[] = overrides.items ?? [];
  return {
    id: 'po1',
    orderNumber: 'BA-000',
    projectId: 'p1',
    supplierId: supplier.id,
    supplier,
    status: 'approved',
    items,
    subtotal: overrides.subtotal ?? 0,
    taxAmount: overrides.taxAmount ?? 0,
    totalAmount: overrides.totalAmount ?? 0,
    currency: 'FCFA',
    orderDate: new Date().toISOString(),
    requestedBy: 'tester',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

const createDelivery = (overrides: Partial<DeliveryNote> = {}): DeliveryNote => {
  const po = overrides.purchaseOrder ?? createPO();
  return {
    id: 'DN-1',
    deliveryNumber: 'DN-1',
    purchaseOrderId: po.id,
    purchaseOrder: po,
    status: 'received',
    items: [],
    deliveryDate: new Date().toISOString(),
    qualityCheck: true,
    overallCondition: 'good',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};
const added: Array<{ col: string; rec: RecordMap }> = [];
const updated: Array<{ id: string; data: RecordMap }> = [];
const deleted: Array<{ id: string }> = [];
const queried: Record<string, RecordMap[]> = {
  expenses: [],
};

vi.mock('../../firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', () => {
  return {
    Timestamp: { now: () => ({ toDate: () => new Date() }) },
    collection: (_db: unknown, col: string) => ({ _col: col }),
    addDoc: vi.fn(async (ref: { _col: string }, data: unknown) => {
      const id = `${ref._col}_${added.length + 1}`;
      const rec: RecordMap = { id, ...(data as RecordMap) };
      added.push({ col: ref._col, rec });
      (queried[ref._col] ||= []).push(rec);
      return { id };
    }),
    updateDoc: vi.fn(async (ref: unknown, data: unknown) => {
      const r = ref as { id?: string; _id?: string };
      const id = r.id || r._id || '';
      updated.push({ id, data: (data as RecordMap) });
      // naive update into queried store
      const list = queried.expenses;
      const idx = list.findIndex((d) => (d as { id?: string }).id === id);
      if (idx >= 0) list[idx] = { ...list[idx], ...(data as RecordMap) };
    }),
    deleteDoc: vi.fn(async (ref: unknown) => {
      const r = ref as { id?: string; _id?: string };
      const id = r.id || r._id || '';
      deleted.push({ id });
      const list = queried.expenses;
      const idx = list.findIndex((d) => (d as { id?: string }).id === id);
      if (idx >= 0) list.splice(idx, 1);
    }),
    where: vi.fn((field: string, _op: string, val: unknown) => ({ field, val })),
    query: vi.fn((ref: { _col: string }) => ref),
    getDocs: vi.fn(async (q: { _col: string }) => {
      const docs = (queried[q._col] || []).map((d) => ({ id: (d as { id: string }).id, data: () => d, ref: { id: (d as { id: string }).id, _id: (d as { id: string }).id } }));
      return {
        empty: docs.length === 0,
        docs,
        forEach: (cb: (d: { id: string; data: () => RecordMap; ref: { id: string } }) => void) => docs.forEach(cb),
      };
    }),
  };
});

vi.mock('../purchaseOrderService', () => ({
  PurchaseOrderService: {
    getPurchaseOrdersByProject: vi.fn(async (projectId: string) => [
      { id: 'po1', projectId, totalAmount: 1000, status: 'approved', supplier: { type: 'materials', name: 'X' } },
      { id: 'po2', projectId, totalAmount: 500, status: 'pending_approval', supplier: { type: 'labor', name: 'Y' } },
    ]),
  },
}));

beforeEach(() => {
  added.length = 0; updated.length = 0; deleted.length = 0;
  Object.keys(queried).forEach(k => (queried as Record<string, RecordMap[]>)[k] = []);
});

describe('BudgetIntegrationService', () => {
  it('syncPurchaseOrderToBudget creates planned expense only for approved POs', async () => {
    const approved = createPO({
      id: 'po_ok', orderNumber: 'BA-001', projectId: 'p1', totalAmount: 250,
      supplier: createSupplier({ id: 'sup_ok', type: 'materials', name: 'S1' }), orderDate: '2024-01-10'
    });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(approved);
    expect(added.length).toBe(1);
    expect(added[0].col).toBe('expenses');
    expect(added[0].rec.status).toBe('planned');

    const pending: PurchaseOrder = { ...approved, id: 'po_pending', status: 'pending_approval' };
    await BudgetIntegrationService.syncPurchaseOrderToBudget(pending);
    expect(added.length).toBe(1); // unchanged
  });

  it('syncDeliveryToActualExpense updates existing planned expense to actual, otherwise creates new', async () => {
    // seed planned expense for PO id A
    const seedPO = createPO({
      id: 'A', orderNumber: 'BA-002', projectId: 'p1', totalAmount: 400,
      supplier: createSupplier({ id: 'supA', type: 'materials', name: 'S' }), orderDate: '2024-01-11'
    });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(seedPO);

    const delivery = createDelivery({
      id: 'DN-1', deliveryNumber: 'DN-1', status: 'received',
      purchaseOrder: { ...seedPO, items: [] },
      items: [ { id: 'd1', purchaseOrderItemId: 'it1', name: 'it1', unit: 'u', deliveredQuantity: 1, orderedQuantity: 2, status: 'delivered', condition: 'good' } ],
      deliveryDate: '2024-01-12', actualDeliveryDate: '2024-01-13'
    });

    // Provide PO item matching calculateDeliveredAmount; approximate behavior
    delivery.purchaseOrder.items = [ { id: 'it1', name: 'Item 1', description: '', quantity: 1, unit: 'u', unitPrice: 400, totalPrice: 400 } ];

    await BudgetIntegrationService.syncDeliveryToActualExpense(delivery);
    // one update should have occurred on seeded expense
    expect(updated.length).toBe(1);
    const e0 = queried.expenses[0] as { status?: string };
    expect(e0.status).toBe('actual');

    // For a PO with no planned expense, it should create a new expense
    const poB = createPO({ id: 'B', totalAmount: 300, items: [ { id: 'x', name: 'X', description: '', quantity: 1, unit: 'u', unitPrice: 300, totalPrice: 300 } ], supplier: createSupplier({ id: 'supB', type: 'services', name: 'L' }) });
    const delivery2 = createDelivery({
      id: 'DN-2', deliveryNumber: 'DN-2', status: 'received',
      purchaseOrder: poB,
      items: [ { id: 'd2', purchaseOrderItemId: 'x', name: 'x', unit: 'u', deliveredQuantity: 1, orderedQuantity: 1, status: 'delivered', condition: 'good' } ],
      deliveryDate: '2024-01-12', actualDeliveryDate: '2024-01-13'
    });

    await BudgetIntegrationService.syncDeliveryToActualExpense(delivery2);
    expect(added.length).toBeGreaterThanOrEqual(2); // initial planned + new actual
    const found = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-2') as { status?: string } | undefined;
    expect(found?.status).toBe('actual');
  });

  it('removePurchaseOrderExpenses deletes all related expenses', async () => {
    // seed two expenses with same PO id
    const col = 'expenses';
    (queried[col] ||= []).push({ id: 'e1', purchaseOrderId: 'POX' });
    (queried[col] ||= []).push({ id: 'e2', purchaseOrderId: 'POX' });

    // pretend getDocs(query(expenses where purchaseOrderId == 'POX')) returns both
    await BudgetIntegrationService.removePurchaseOrderExpenses('POX');
    expect(queried.expenses.find(e => (e as { id?: string }).id === 'e1')).toBeUndefined();
    expect(queried.expenses.find(e => (e as { id?: string }).id === 'e2')).toBeUndefined();
  });

  it('getIntegratedProjectFinancials aggregates POs and expenses', async () => {
    // seed some expenses for project p1
    (queried.expenses ||= []).push(
      { id: 'ex1', projectId: 'p1', status: 'planned', category: 'materials', amount: 100 },
      { id: 'ex2', projectId: 'p1', status: 'actual', category: 'labor', amount: 50 },
    );

    const metrics = await BudgetIntegrationService.getIntegratedProjectFinancials('p1');
    expect(metrics.totalPurchaseOrders).toBe(2);
    expect(metrics.totalPurchaseOrderAmount).toBe(1500);
    expect(metrics.approvedPurchaseOrders).toBe(1);
    expect(metrics.pendingPurchaseOrders).toBe(1);
    expect(metrics.totalPlannedExpenses).toBe(100);
    expect(metrics.totalActualExpenses).toBe(50);
    expect(metrics.expensesByCategory.materials.amount).toBe(100);
    expect(metrics.purchaseOrdersBySupplierType.materials.amount).toBe(1000);
  });
});

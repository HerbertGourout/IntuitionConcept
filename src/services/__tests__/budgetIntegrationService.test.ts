import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addDoc, updateDoc } from 'firebase/firestore';
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
    where: vi.fn((field: string, op: string, val: unknown) => ({ type: 'where', field, op, val })),
    query: vi.fn((ref: { _col: string }, ...conds: Array<{ type: string; field: string; op: string; val: unknown }>) => ({ _col: ref._col, _conds: conds })),
    getDocs: vi.fn(async (q: { _col: string; _conds?: Array<{ type: string; field: string; op: string; val: unknown }> }) => {
      let rows = (queried[q._col] || []).slice();
      if (q._conds && q._conds.length) {
        rows = rows.filter((d) => q._conds!.every((c) => {
          if (c.type !== 'where') return true;
          // Only support equality for tests
          return (d as Record<string, unknown>)[c.field] === c.val;
        }));
      }
      const docs = rows.map((d) => ({ id: (d as { id: string }).id, data: () => d, ref: { id: (d as { id: string }).id, _id: (d as { id: string }).id } }));
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

  it('syncPurchaseOrderToBudget ignores non-approved statuses', async () => {
    const statuses = ['draft', 'pending_approval', 'ordered', 'partially_delivered', 'delivered', 'cancelled'] as const;
    for (const st of statuses) {
      const po = createPO({ id: `po_${st}`, status: st, totalAmount: 123, supplier: createSupplier({ type: 'materials' }) });
      await BudgetIntegrationService.syncPurchaseOrderToBudget(po);
    }
    // none should have been added because none are approved
    expect(added.length).toBe(0);

    // now approved should add exactly one
    const approved = createPO({ id: 'po_approved', status: 'approved', totalAmount: 99, supplier: createSupplier({ type: 'labor' }) });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(approved);
    expect(added.length).toBe(1);
    expect(added[0].rec.status).toBe('planned');
  });

  it('syncDeliveryToActualExpense ignores non-received deliveries', async () => {
    const seedPO = createPO({ id: 'po_r1', status: 'approved', totalAmount: 200, items: [ { id: 'i1', name: 'I1', description: '', quantity: 2, unit: 'u', unitPrice: 100, totalPrice: 200 } ] });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(seedPO);

    const delivery = createDelivery({
      id: 'DN-R1', deliveryNumber: 'DN-R1', status: 'in_transit',
      purchaseOrder: seedPO,
      items: [ { id: 'd1', purchaseOrderItemId: 'i1', name: 'i1', unit: 'u', deliveredQuantity: 1, orderedQuantity: 2, status: 'partial', condition: 'good' } ],
      deliveryDate: '2024-02-01'
    });

    await BudgetIntegrationService.syncDeliveryToActualExpense(delivery);
    // No update nor creation for non-received
    expect(updated.length).toBe(0);
    const dnCreated = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-R1');
    expect(dnCreated).toBeUndefined();
  });

  it('syncDeliveryToActualExpense computes partial delivered amounts and ignores missing items', async () => {
    const po = createPO({
      id: 'po_partial', status: 'approved', totalAmount: 1000,
      items: [
        { id: 'a', name: 'A', description: '', quantity: 4, unit: 'u', unitPrice: 100, totalPrice: 400 },
        { id: 'b', name: 'B', description: '', quantity: 3, unit: 'u', unitPrice: 200, totalPrice: 600 }
      ],
      supplier: createSupplier({ type: 'materials' })
    });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(po);

    const dn = createDelivery({
      id: 'DN-P', deliveryNumber: 'DN-P', status: 'received', purchaseOrder: po,
      items: [
        // 50% of item a => 200
        { id: 'da', purchaseOrderItemId: 'a', name: 'a', unit: 'u', deliveredQuantity: 2, orderedQuantity: 4, status: 'delivered', condition: 'good' },
        // 1/3 of item b => 200
        { id: 'db', purchaseOrderItemId: 'b', name: 'b', unit: 'u', deliveredQuantity: 1, orderedQuantity: 3, status: 'delivered', condition: 'good' },
        // missing in PO, should be ignored => +0
        { id: 'dx', purchaseOrderItemId: 'x', name: 'x', unit: 'u', deliveredQuantity: 10, orderedQuantity: 10, status: 'delivered', condition: 'good' }
      ],
      deliveryDate: '2024-03-01', actualDeliveryDate: '2024-03-02'
    });

    await BudgetIntegrationService.syncDeliveryToActualExpense(dn);
    const updatedExpense = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-P') as { amount?: number } | undefined;
    expect(updatedExpense?.amount).toBe(400); // 200 + 200
  });

  it('syncDeliveryToActualExpense handles multiple deliveries on same PO (first updates planned, next creates new actual)', async () => {
    const po = createPO({
      id: 'po_multi', status: 'approved', totalAmount: 600,
      items: [
        { id: 'i1', name: 'I1', description: '', quantity: 3, unit: 'u', unitPrice: 100, totalPrice: 300 },
        { id: 'i2', name: 'I2', description: '', quantity: 3, unit: 'u', unitPrice: 100, totalPrice: 300 }
      ],
      supplier: createSupplier({ type: 'materials' })
    });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(po);

    // First delivery converts the existing planned expense to actual
    const dn1 = createDelivery({
      id: 'DN-M1', deliveryNumber: 'DN-M1', status: 'received', purchaseOrder: po,
      items: [ { id: 'd1', purchaseOrderItemId: 'i1', name: 'i1', unit: 'u', deliveredQuantity: 1, orderedQuantity: 3, status: 'delivered', condition: 'good' } ],
      deliveryDate: '2024-04-01', actualDeliveryDate: '2024-04-02'
    });
    await BudgetIntegrationService.syncDeliveryToActualExpense(dn1);
    expect(updated.length).toBe(1);
    const e1 = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-M1') as { status?: string } | undefined;
    expect(e1?.status).toBe('actual');

    // Second delivery should create a new actual expense (no planned left to update)
    const dn2 = createDelivery({
      id: 'DN-M2', deliveryNumber: 'DN-M2', status: 'received', purchaseOrder: po,
      items: [ { id: 'd2', purchaseOrderItemId: 'i2', name: 'i2', unit: 'u', deliveredQuantity: 2, orderedQuantity: 3, status: 'delivered', condition: 'good' } ],
      deliveryDate: '2024-04-05', actualDeliveryDate: '2024-04-06'
    });
    await BudgetIntegrationService.syncDeliveryToActualExpense(dn2);
    const e2 = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-M2') as { status?: string; purchaseOrderId?: string } | undefined;
    expect(e2?.status).toBe('actual');
    // There should be two actual expenses for this PO after two deliveries
    const actualsForPO = queried.expenses.filter(e => (e as { purchaseOrderId?: string; status?: string }).purchaseOrderId === 'po_multi' && (e as { status?: string }).status === 'actual');
    expect(actualsForPO.length).toBe(2);
  });

  it('grouping adds unknown categories to other and metrics include supplier type aggregation', async () => {
    // Seed an expense without category to force grouping as 'other'
    (queried.expenses ||= []).push({ id: 'exX', projectId: 'p1', status: 'planned', amount: 10 });

    const metrics = await BudgetIntegrationService.getIntegratedProjectFinancials('p1');
    expect(metrics.expensesByCategory.other.amount).toBeGreaterThanOrEqual(10);
    // From mocked PurchaseOrderService
    expect(metrics.purchaseOrdersBySupplierType.labor.amount).toBe(500);
    expect(metrics.purchaseOrdersBySupplierType.labor.count).toBe(1);
  });

  it('removePurchaseOrderExpenses is a no-op when none exist', async () => {
    const before = (queried.expenses || []).length;
    await BudgetIntegrationService.removePurchaseOrderExpenses('NOTHING');
    const after = (queried.expenses || []).length;
    expect(after).toBe(before);
    expect(deleted.length).toBe(0);
  });

  it('syncPurchaseOrderToBudget propagates Firestore addDoc error', async () => {
    const po = createPO({ id: 'po_err', orderNumber: 'BA-ERR', totalAmount: 100, supplier: createSupplier({ type: 'materials' }) });
    // Force addDoc to reject once on the mocked function
    (addDoc as unknown as { mockRejectedValueOnce: (err: unknown) => void }).mockRejectedValueOnce(new Error('addDoc failed'));
    await expect(BudgetIntegrationService.syncPurchaseOrderToBudget(po)).rejects.toThrow('addDoc failed');
  });

  it('syncDeliveryToActualExpense propagates Firestore updateDoc error when planned exists', async () => {
    const po = createPO({ id: 'po_upd_err', totalAmount: 200, items: [ { id: 'i1', name: 'I1', description: '', quantity: 2, unit: 'u', unitPrice: 100, totalPrice: 200 } ] });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(po);
    const dn = createDelivery({ id: 'DN-UPD-ERR', status: 'received', purchaseOrder: po, items: [ { id: 'd1', purchaseOrderItemId: 'i1', name: 'i1', unit: 'u', deliveredQuantity: 1, orderedQuantity: 2, status: 'delivered', condition: 'good' } ] });
    (updateDoc as unknown as { mockRejectedValueOnce: (err: unknown) => void }).mockRejectedValueOnce(new Error('updateDoc failed'));
    await expect(BudgetIntegrationService.syncDeliveryToActualExpense(dn)).rejects.toThrow('updateDoc failed');
  });

  it('syncDeliveryToActualExpense uses deliveryDate when actualDeliveryDate is missing', async () => {
    const po = createPO({ id: 'po_date', totalAmount: 100, items: [ { id: 'i1', name: 'I1', description: '', quantity: 1, unit: 'u', unitPrice: 100, totalPrice: 100 } ] });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(po);
    const dn = createDelivery({ id: 'DN-DATE', status: 'received', purchaseOrder: po, items: [ { id: 'd1', purchaseOrderItemId: 'i1', name: 'i1', unit: 'u', deliveredQuantity: 1, orderedQuantity: 1, status: 'delivered', condition: 'good' } ], deliveryDate: '2024-05-01' });
    await BudgetIntegrationService.syncDeliveryToActualExpense(dn);
    const rec = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-DATE') as { date?: string } | undefined;
    expect(rec?.date).toBe('2024-05-01');
  });

  it('syncPurchaseOrderToBudget maps supplier types to categories as expected', async () => {
    const cases: Array<{ t: Supplier['type']; expected: string }> = [
      { t: 'materials', expected: 'materials' },
      { t: 'equipment', expected: 'equipment' },
      { t: 'labor', expected: 'labor' },
      { t: 'permits', expected: 'permits' },
      { t: 'services', expected: 'other' },
      { t: 'transport', expected: 'other' },
      { t: 'utilities', expected: 'other' },
    ];
    for (const c of cases) {
      const po = createPO({ id: `po_cat_${c.t}`, orderNumber: `BA-${c.t}`, totalAmount: 1, supplier: createSupplier({ type: c.t }) });
      await BudgetIntegrationService.syncPurchaseOrderToBudget(po);
      const last = queried.expenses[queried.expenses.length - 1] as { category?: string };
      expect(last.category).toBe(c.expected);
    }
  });

  it('syncDeliveryToActualExpense with zero delivered quantity results in zero amount actual', async () => {
    const po = createPO({ id: 'po_zero', totalAmount: 100, items: [ { id: 'i1', name: 'I1', description: '', quantity: 1, unit: 'u', unitPrice: 100, totalPrice: 100 } ] });
    await BudgetIntegrationService.syncPurchaseOrderToBudget(po);
    const dn = createDelivery({ id: 'DN-ZERO', status: 'received', purchaseOrder: po, items: [ { id: 'd0', purchaseOrderItemId: 'i1', name: 'i1', unit: 'u', deliveredQuantity: 0, orderedQuantity: 1, status: 'delivered', condition: 'good' } ] });
    await BudgetIntegrationService.syncDeliveryToActualExpense(dn);
    const rec = queried.expenses.find(e => (e as { deliveryNoteId?: string }).deliveryNoteId === 'DN-ZERO') as { amount?: number } | undefined;
    expect(rec?.amount).toBe(0);
  });
});

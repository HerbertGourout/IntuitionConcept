export type TransactionCategory =
  | 'materials'
  | 'labor'
  | 'equipment'
  | 'permits'
  | 'utilities'
  | 'insurance'
  | 'subcontractor'
  | 'transport'
  | 'maintenance'
  | 'other'
  | 'income'
  | 'client_payment'

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  category: TransactionCategory;
  amount: number;
  attachmentUrl?: string;
  supplier?: string;
  createdBy?: string;
  projectId?: string;
  phaseId?: string;
  taskId?: string;
  equipmentId?: string;
  invoiceNumber?: string;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
  attachments?: string[];
  notes?: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'check'
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'refunded';

// Interface pour les budgets par phase
export interface PhaseBudget {
  phaseId: string;
  phaseName: string;
  budgetAllocated: number;
  actualSpent: number;
  estimatedRemaining: number;
  categories: {
    materials: number;
    labor: number;
    equipment: number;
    other: number;
  };
}

// Interface pour les coûts d'équipement
export interface EquipmentCost {
  equipmentId: string;
  equipmentName: string;
  dailyRate: number;
  daysUsed: number;
  totalCost: number;
  maintenanceCosts: number;
  fuelCosts?: number;
  operatorCosts?: number;
}

// Interface pour les analyses financières
export interface FinancialAnalysis {
  projectId: string;
  period: {
    start: string;
    end: string;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    roi: number; // Return on Investment
  };
  budgetVariance: {
    planned: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  };
}

// Interface pour les factures
export interface Invoice {
  id: string;
  projectId: string;
  clientId?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taskId?: string;
}

// Interface pour les fournisseurs
export interface Vendor {
  id: string;
  name: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentTerms: number; // jours
  category: TransactionCategory;
  totalSpent: number;
  outstandingBalance: number;
}

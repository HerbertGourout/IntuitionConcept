export type {
  Project,
  ProjectPhase,
  ProjectTask,
  FinancialRecord,
  ExtendedEquipment as Equipment,
  MaintenanceEvent,
  ProjectHistoryEntry,
  TaskPriority,
  TaskStatus,
  ProjectSubTask,
  Expense,
  CostItem,
} from '../contexts/projectTypes';

// Vous pouvez ajouter ici d'autres types qui ne sont pas liés au projet
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project-manager' | 'foreman' | 'worker' | 'client';
  avatar?: string;
  phone: string;
  skills: string[];
}

export interface Document {
  id: string;
  name: string;
  type: 'plan' | 'contract' | 'permit' | 'report' | 'photo' | 'other';
  size: number;
  uploadDate: string;
  projectId: string;
  uploadedBy: string;
  version: string;
  url: string;
  folderId?: string;
  tags?: string[];
  description?: string;
  shared?: boolean;
  shareSettings?: {
    accessLevel: 'view' | 'comment' | 'edit';
    expiration: string;
    requireAuth: boolean;
    allowDownload: boolean;
  };
}

export interface WorkReport {
  id: string;
  projectId: string;
  date: string;
  weather: string;
  workersCount: number;
  hoursWorked: number;
  workCompleted: string;
  issues: string;
  materialUsed: string;
  equipmentUsed: string[];
  photos: string[];
  reportedBy: string;
  safetyIncidents: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}
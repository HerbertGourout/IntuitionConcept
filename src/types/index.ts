import { TaskStatus } from '../contexts/projectTypes';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  manager: string;
  location: string;
  client: string;
  team: string[];
  documents: Document[];
  tasks: Task[];
  equipment?: Equipment[];
}

export interface Equipment {
  id: string;
  name: string;
  type: 'excavator' | 'crane' | 'truck' | 'concrete-mixer' | 'bulldozer' | 'mixer' | 'generator' | 'compressor' | 'other';
  brand?: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service' | 'in_use' | 'out_of_order';
  location: string;
  assignedProject?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  dailyRate?: number;
  operator?: string;
  coordinates?: { lat: number; lng: number };
  // Additional properties for compatibility
  purchaseDate?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  description?: string;
  specifications?: {
    power?: string;
    capacity?: string;
    weight?: string;
    dimensions?: string;
  };
  projectId?: string;
  assignedTo?: string;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  projectId: string;
  startDate: string;
  dueDate: string;
  progress: number;
  dependencies: string[];
  estimatedHours: number;
  actualHours: number;
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

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: 'materials' | 'labor' | 'equipment' | 'permits' | 'other';
  amount: number;
  description: string;
  date: string;
  projectId: string;
  invoiceNumber?: string;
  vendor?: string;
  approved: boolean;
  status: 'planned' | 'actual' | 'pending';
  // Propriétés pour l'intégration budgétaire avancée
  phaseId?: string;
  taskId?: string;
  purchaseOrderId?: string;
  deliveryNoteId?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project-manager' | 'foreman' | 'worker' | 'client';
  avatar?: string;
  phone: string;
  skills: string[];
}
export type ApprovalRole = 'project_manager' | 'engineer' | 'director' | 'financial_controller';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type WorkflowStatus = 'draft' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalStep {
  id: string;
  role: ApprovalRole;
  approverName?: string;
  approverEmail?: string;
  status: ApprovalStatus;
  comments?: string;
  timestamp?: string;
  signature?: string;
  order: number;
}

export interface ApprovalWorkflow {
  id: string;
  quoteId: string;
  quoteTitle: string;
  quoteAmount: number;
  initiatedBy: string;
  initiatedAt: string;
  steps: ApprovalStep[];
  currentStepIndex: number;
  status: WorkflowStatus;
  completedAt?: string;
  history: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  timestamp: string;
  action: 'created' | 'approved' | 'rejected' | 'revision_requested' | 'cancelled' | 'completed';
  stepId?: string;
  userName: string;
  comments?: string;
}

export interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  steps: Omit<ApprovalStep, 'id' | 'status' | 'timestamp' | 'signature'>[];
  applicableFor: 'all' | 'preliminary' | 'definitive';
  minAmount?: number;
  maxAmount?: number;
}

export const DEFAULT_APPROVAL_TEMPLATES: ApprovalTemplate[] = [
  {
    id: 'simple',
    name: 'Approbation Simple',
    description: 'Chef de projet → Directeur',
    steps: [
      { role: 'project_manager', order: 1 },
      { role: 'director', order: 2 }
    ],
    applicableFor: 'all',
    maxAmount: 10000000
  },
  {
    id: 'standard',
    name: 'Approbation Standard',
    description: 'Chef de projet → Ingénieur → Directeur',
    steps: [
      { role: 'project_manager', order: 1 },
      { role: 'engineer', order: 2 },
      { role: 'director', order: 3 }
    ],
    applicableFor: 'all',
    minAmount: 10000000,
    maxAmount: 50000000
  },
  {
    id: 'complete',
    name: 'Approbation Complète',
    description: 'Chef de projet → Ingénieur → Contrôleur financier → Directeur',
    steps: [
      { role: 'project_manager', order: 1 },
      { role: 'engineer', order: 2 },
      { role: 'financial_controller', order: 3 },
      { role: 'director', order: 4 }
    ],
    applicableFor: 'definitive',
    minAmount: 50000000
  }
];

export const ROLE_LABELS: Record<ApprovalRole, string> = {
  project_manager: 'Chef de Projet',
  engineer: 'Ingénieur Structure',
  director: 'Directeur',
  financial_controller: 'Contrôleur Financier'
};

export const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  revision_requested: 'Révision demandée'
};

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  cancelled: 'Annulé'
};

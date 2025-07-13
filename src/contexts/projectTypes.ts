export interface ProjectHistoryEntry {
  date: string;
  action: string;
  user?: string;
  details?: string;
}

// Utilise maintenant l'interface Equipment globale du dossier types
import type { Equipment } from '../types';

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  budget: number;
  spent: number;
  phases: ProjectPhase[];
  manager: string;
  client: string;
  progress: number;
  priority: string;
  team: string[];
  createdAt: string;
  updatedAt: string;
  history?: ProjectHistoryEntry[];
  equipment?: Equipment[]; // <-- Utilise maintenant l'interface Equipment globale
}

export interface ProjectPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: ProjectTask[];
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'todo' | 'done';

export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  assignedTo: string[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  costItems?: CostItem[];
  subtasks?: ProjectTask[];
  parentId?: string;
  budget?: number;
  spent?: number; // Dépense réelle pour cette tâche
  priority?: 'low' | 'medium' | 'high';
  dependencies?: string[];
  precision?: number;
}

export interface ProjectSubTask {
  id: string;
  name: string;
  status: TaskStatus;
  assignedTo: string[];
}

export interface Expense {
  id: string;
  date: string;
  supplier?: string;
  invoiceNumber?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  attachments: string[];
  notes?: string;
}

export interface CostItem {
  id: string;
  name: string;
  type: 'material' | 'labor' | 'equipment' | 'subcontractor' | 'other';
  estimatedQuantity: number;
  estimatedUnitPrice: number;
  unit: 'unit' | 'm2' | 'm3' | 'ml' | 'day' | 'hour' | 'kg' | 'month';
  actualQuantity?: number;
  actualUnitPrice?: number;
  actualTotal?: number;
  expenses?: Expense[];
  notes?: string;
}

export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'phases'> | Omit<Project, 'id'> | Project) => Promise<void>;
  updateProject: (
    id: string,
    updates: Partial<Project>,
    historyAction?: string,
    user?: string,
    details?: string
  ) => void;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  addPhase: (projectId: string, phase: Omit<ProjectPhase, 'id' | 'tasks'>) => void;
  updatePhase: (projectId: string, phaseId: string, updates: Partial<ProjectPhase>) => void;
  addTask: (projectId: string, phaseId: string, task: Omit<ProjectTask, 'id'>, parentTaskId?: string) => void;
  updateTask: (projectId: string, phaseId: string, taskId: string, updates: Partial<ProjectTask>) => void;
  reorderTasks: (projectId: string, phaseId: string, taskId: string, newIndex: number) => Promise<void>;
  removeTask: (projectId: string, phaseId: string, taskId: string) => Promise<void>;
  addSubTask: (projectId: string, phaseId: string, parentTaskId: string, subTask: Omit<ProjectTask, 'id'>) => Promise<void>;
  removeSubTask: (projectId: string, phaseId: string, subTaskId: string) => Promise<void>;
  reorderSubTasks: (projectId: string, phaseId: string, parentTaskId: string, subTaskId: string, newIndex: number) => Promise<void>;
  currentProjectBudget: number;
  loadingProjects: boolean;
}



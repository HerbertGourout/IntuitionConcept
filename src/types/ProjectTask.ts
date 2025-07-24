export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  assignedTo: string[];
  budget?: number;
  spent?: number;
  precision?: number;
  subTasks?: ProjectTask[];
}

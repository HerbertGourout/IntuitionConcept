export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'project_manager' | 'supervisor' | 'worker' | 'client';
  speciality: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  projectsCount: number;
  avatar?: string;
  department?: string;
  salary?: number;
  workload?: number;
  skills?: string[];
  certifications?: string[];
  lastActivity?: string;
  performance?: number;
}

export interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: any;
  level: number;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  onLeaveMembers: number;
  averageWorkload: number;
  topPerformers: number;
}

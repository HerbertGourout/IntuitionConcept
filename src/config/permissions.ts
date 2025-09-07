export type UserRole = 'admin' | 'manager' | 'supervisor' | 'worker' | 'client';

export type Permission = 
  // Projets
  | 'projects.view' | 'projects.create' | 'projects.edit' | 'projects.delete'
  // Devis
  | 'quotes.view' | 'quotes.create' | 'quotes.edit' | 'quotes.send' | 'quotes.delete'
  // Tâches
  | 'tasks.view' | 'tasks.create' | 'tasks.edit' | 'tasks.delete' | 'tasks.assign'
  // Finances
  | 'finances.view' | 'finances.edit' | 'finances.reports'
  // Équipe
  | 'team.view' | 'team.manage' | 'team.payroll'
  // Équipements
  | 'equipment.view' | 'equipment.manage' | 'equipment.rent'
  // Documents
  | 'documents.view' | 'documents.upload' | 'documents.delete'
  // Planning
  | 'planning.view' | 'planning.edit'
  // Rapports
  | 'reports.view' | 'reports.export'
  // Administration
  | 'admin.users' | 'admin.settings' | 'admin.system';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Accès complet
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.send', 'quotes.delete',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'finances.view', 'finances.edit', 'finances.reports',
    'team.view', 'team.manage', 'team.payroll',
    'equipment.view', 'equipment.manage', 'equipment.rent',
    'documents.view', 'documents.upload', 'documents.delete',
    'planning.view', 'planning.edit',
    'reports.view', 'reports.export',
    'admin.users', 'admin.settings', 'admin.system'
  ],
  manager: [
    // Gestion complète des projets et équipe
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.send',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
    'finances.view', 'finances.edit', 'finances.reports',
    'team.view', 'team.manage',
    'equipment.view', 'equipment.manage', 'equipment.rent',
    'documents.view', 'documents.upload', 'documents.delete',
    'planning.view', 'planning.edit',
    'reports.view', 'reports.export'
  ],
  supervisor: [
    // Supervision des projets et tâches
    'projects.view', 'projects.edit',
    'quotes.view', 'quotes.create', 'quotes.edit',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
    'finances.view',
    'team.view',
    'equipment.view', 'equipment.rent',
    'documents.view', 'documents.upload',
    'planning.view', 'planning.edit',
    'reports.view'
  ],
  worker: [
    // Accès limité aux tâches assignées
    'projects.view',
    'tasks.view', 'tasks.edit',
    'equipment.view',
    'documents.view',
    'planning.view'
  ],
  client: [
    // Accès en lecture seule aux projets et devis
    'projects.view',
    'quotes.view',
    'documents.view',
    'planning.view'
  ]
};

export const MODULE_PERMISSIONS: Record<string, Permission[]> = {
  dashboard: ['projects.view'],
  projects: ['projects.view'],
  quotes: ['quotes.view'],
  tasks: ['tasks.view'],
  finances: ['finances.view'],
  team: ['team.view'],
  equipment: ['equipment.view'],
  documents: ['documents.view'],
  planning: ['planning.view'],
  reports: ['reports.view'],
  settings: ['admin.settings']
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const canAccessModule = (userRole: UserRole, module: string): boolean => {
  const requiredPermissions = MODULE_PERMISSIONS[module];
  if (!requiredPermissions) return true; // Module sans restriction
  return hasAnyPermission(userRole, requiredPermissions);
};

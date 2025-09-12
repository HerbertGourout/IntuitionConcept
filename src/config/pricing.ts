import { Permission, ROLE_PERMISSIONS } from './permissions';

export type PlanId = 'basic' | 'pro' | 'enterprise';
export type Currency = 'XOF' | 'XAF' | 'MAD' | 'DZD' | 'TND';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  requiredPermissions: Permission[];
  category: 'core' | 'advanced' | 'premium';
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  color: string;
  popular: boolean;
  features: PlanFeature[];
  limits: {
    projects: number | 'unlimited';
    users: number | 'unlimited';
    storage: string;
  };
}

// Fonctionnalités mappées aux permissions réelles
export const PLAN_FEATURES: PlanFeature[] = [
  // Core features
  {
    id: 'projects_basic',
    name: 'Gestion de projets',
    description: 'Créer et gérer vos projets',
    requiredPermissions: ['projects.view', 'projects.create'],
    category: 'core'
  },
  {
    id: 'quotes_basic',
    name: 'Devis simples',
    description: 'Créer des devis basiques',
    requiredPermissions: ['quotes.view', 'quotes.create'],
    category: 'core'
  },
  {
    id: 'tasks_basic',
    name: 'Gestion des tâches',
    description: 'Organiser et suivre les tâches',
    requiredPermissions: ['tasks.view', 'tasks.create'],
    category: 'core'
  },
  {
    id: 'team_basic',
    name: 'Équipe de base',
    description: 'Voir les membres de l\'équipe',
    requiredPermissions: ['team.view'],
    category: 'core'
  },
  
  // Advanced features
  {
    id: 'quotes_advanced',
    name: 'Devis avancés + Export PDF',
    description: 'Devis complexes avec export PDF professionnel',
    requiredPermissions: ['quotes.edit', 'quotes.send'],
    category: 'advanced'
  },
  {
    id: 'finances',
    name: 'Gestion financière',
    description: 'Suivi des coûts et budgets',
    requiredPermissions: ['finances.view', 'finances.edit'],
    category: 'advanced'
  },
  {
    id: 'ocr_scanner',
    name: 'Scanner OCR intelligent',
    description: 'Extraction automatique de données depuis factures',
    requiredPermissions: ['finances.edit', 'documents.upload'],
    category: 'advanced'
  },
  {
    id: 'planning_gantt',
    name: 'Diagrammes de Gantt',
    description: 'Planning visuel avancé',
    requiredPermissions: ['planning.view', 'planning.edit'],
    category: 'advanced'
  },
  {
    id: 'equipment',
    name: 'Gestion d\'équipements',
    description: 'Suivi et maintenance des équipements',
    requiredPermissions: ['equipment.view', 'equipment.manage'],
    category: 'advanced'
  },
  
  // Premium features
  {
    id: 'team_management',
    name: 'Gestion d\'équipe complète',
    description: 'Gestion avancée des membres et paie',
    requiredPermissions: ['team.manage', 'team.payroll'],
    category: 'premium'
  },
  {
    id: 'reports_advanced',
    name: 'Rapports personnalisés',
    description: 'Rapports avancés et export',
    requiredPermissions: ['reports.view', 'reports.export'],
    category: 'premium'
  },
  {
    id: 'admin_full',
    name: 'Administration complète',
    description: 'Gestion utilisateurs et système',
    requiredPermissions: ['admin.users', 'admin.settings', 'admin.system'],
    category: 'premium'
  },
  {
    id: 'api_access',
    name: 'Accès API complet',
    description: 'Intégrations tierces illimitées',
    requiredPermissions: ['admin.system'],
    category: 'premium'
  }
];

// Configuration des plans avec features basées sur les rôles
export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basique',
    description: 'Parfait pour les petites équipes qui démarrent',
    color: 'blue',
    popular: false,
    features: PLAN_FEATURES.filter(f => 
      f.category === 'core' && 
      f.requiredPermissions.every(p => ROLE_PERMISSIONS.supervisor.includes(p))
    ),
    limits: {
      projects: 5,
      users: 10,
      storage: '1GB'
    }
  },
  {
    id: 'pro',
    name: 'Professionnel',
    description: 'Solution complète pour équipes en croissance',
    color: 'green',
    popular: true,
    features: PLAN_FEATURES.filter(f => 
      (f.category === 'core' || f.category === 'advanced') &&
      f.requiredPermissions.every(p => ROLE_PERMISSIONS.manager.includes(p))
    ),
    limits: {
      projects: 50,
      users: 100,
      storage: '10GB'
    }
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    description: 'Toute la puissance pour grandes organisations',
    color: 'purple',
    popular: false,
    features: PLAN_FEATURES, // Toutes les features
    limits: {
      projects: 'unlimited',
      users: 'unlimited',
      storage: 'Illimité'
    }
  }
];

// Tarification par devise
export const PRICING: Record<Currency, Record<PlanId, number>> = {
  XOF: { basic: 5000, pro: 15000, enterprise: 50000 },
  XAF: { basic: 5000, pro: 15000, enterprise: 50000 },
  MAD: { basic: 100, pro: 350, enterprise: 1200 },
  DZD: { basic: 1400, pro: 4200, enterprise: 15000 },
  TND: { basic: 20, pro: 60, enterprise: 200 }
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XOF: 'FCFA',
  XAF: 'FCFA',
  MAD: 'DH',
  DZD: 'DA',
  TND: 'DT'
};

// Fonction utilitaire pour vérifier si un plan inclut une fonctionnalité
export const planIncludesFeature = (planId: PlanId, featureId: string): boolean => {
  const plan = PLANS.find(p => p.id === planId);
  return plan?.features.some(f => f.id === featureId) || false;
};

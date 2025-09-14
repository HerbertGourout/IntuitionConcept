import { Permission } from './permissions';

export type PlanId = 'basic' | 'pro' | 'enterprise';
export type Currency = 'XOF' | 'XAF' | 'MAD' | 'DZD' | 'TND' | 'GNF' | 'LRD' | 'SLL' | 'CDF' | 'KES' | 'TZS' | 'UGX' | 'RWF' | 'BIF' | 'ETB' | 'ZAR' | 'USD' | 'ZMW' | 'MWK' | 'MZN' | 'BWP' | 'NAD' | 'SZL' | 'LSL' | 'LYD' | 'EGP';

// Messages d'affichage pour les plans
export const PLAN_DISPLAY_MESSAGES = {
  basic: {
    title: 'Fonctionnalités incluses :',
    features: 'Toutes les fonctionnalités de base + IA d\'assistance'
  },
  pro: {
    title: 'Tout du plan Artisan +',
    features: 'Suite IA complète + Fonctionnalités avancées'
  },
  enterprise: {
    title: 'Tout du plan Pro +', 
    features: 'IA Prédictive + Analytics + Intégrations Enterprise'
  }
};

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

// Fonctionnalités mappées aux permissions réelles avec affichage incrémental
export const PLAN_FEATURES: PlanFeature[] = [
  // === PLAN ARTISAN - FONCTIONNALITÉS DE BASE ===
  {
    id: 'projects_basic',
    name: 'Gestion de projets BTP',
    description: 'Créer et gérer vos chantiers et projets',
    requiredPermissions: ['projects.view', 'projects.create'],
    category: 'core'
  },
  {
    id: 'quotes_basic',
    name: 'Devis BTP simples',
    description: 'Créer des devis métré basiques',
    requiredPermissions: ['quotes.view', 'quotes.create'],
    category: 'core'
  },
  {
    id: 'tasks_basic',
    name: 'Planning chantier',
    description: 'Organiser et suivre les tâches de chantier',
    requiredPermissions: ['tasks.view', 'tasks.create'],
    category: 'core'
  },
  {
    id: 'team_basic',
    name: 'Équipe chantier',
    description: 'Voir les ouvriers et équipes',
    requiredPermissions: ['team.view'],
    category: 'core'
  },
  {
    id: 'documents_basic',
    name: 'Documents chantier',
    description: 'Stockage plans et photos (2GB)',
    requiredPermissions: ['documents.view', 'documents.upload'],
    category: 'core'
  },
  {
    id: 'ai_quote_suggestions',
    name: '🤖 Suggestions Devis IA',
    description: 'Suggestions intelligentes pour optimiser vos devis',
    requiredPermissions: ['ai.suggestions', 'quotes.create'],
    category: 'core'
  },
  
  // === PLAN PRO - TOUT ARTISAN + FONCTIONNALITÉS AVANCÉES ===
  {
    id: 'quotes_advanced',
    name: 'Devis BTP avancés + PDF',
    description: 'Devis métré complexes avec export PDF professionnel',
    requiredPermissions: ['quotes.edit', 'quotes.send'],
    category: 'advanced'
  },
  {
    id: 'finances_advanced',
    name: 'Gestion financière BTP',
    description: 'Suivi coûts, fournisseurs, trésorerie chantier',
    requiredPermissions: ['finances.view', 'finances.edit'],
    category: 'advanced'
  },
  {
    id: 'ocr_intelligent',
    name: '🤖 Scanner OCR Multi-Documents IA',
    description: 'Extraction automatique factures, bons de livraison, contrats',
    requiredPermissions: ['finances.edit', 'documents.upload'],
    category: 'advanced'
  },
  {
    id: 'ai_arch_plan_reader_lite',
    name: '🤖 Lecture Plans d’Architecture IA (Lite)',
    description: 'Extraction des surfaces/pièces depuis plans + pré-remplissage d’un devis brouillon',
    requiredPermissions: ['ai.plan.read', 'documents.upload'],
    category: 'advanced'
  },
  {
    id: 'ai_project_planner',
    name: '🤖 Générateur Plans Projet IA',
    description: 'Génération automatique de plans de projet détaillés par IA',
    requiredPermissions: ['ai.planner', 'projects.create'],
    category: 'advanced'
  },
  {
    id: 'ai_copilot_basic',
    name: '🤖 Assistant IA Conversationnel',
    description: 'Assistant intelligent pour questions BTP et aide à la décision',
    requiredPermissions: ['ai.copilot'],
    category: 'advanced'
  },
  {
    id: 'ai_anomaly_alerts',
    name: '🤖 Alertes Anomalies Budget IA',
    description: 'Détection automatique dépassements et alertes préventives',
    requiredPermissions: ['ai.anomaly', 'reports.view'],
    category: 'advanced'
  },
  {
    id: 'planning_gantt',
    name: 'Diagrammes de Gantt BTP',
    description: 'Planning visuel phases de chantier',
    requiredPermissions: ['planning.view', 'planning.edit'],
    category: 'advanced'
  },
  {
    id: 'equipment_management',
    name: 'Gestion parc matériel',
    description: 'Suivi équipements et maintenance prédictive',
    requiredPermissions: ['equipment.view', 'equipment.manage'],
    category: 'advanced'
  },
  {
    id: 'purchase_orders',
    name: 'Bons de commande',
    description: 'Gestion achats et fournisseurs BTP',
    requiredPermissions: ['purchases.view', 'purchases.create'],
    category: 'advanced'
  },
  {
    id: 'email_integration',
    name: 'Envoi email automatique',
    description: 'Envoi devis et documents par email',
    requiredPermissions: ['quotes.send', 'documents.send'],
    category: 'advanced'
  },
  
  // === PLAN ENTERPRISE - TOUT PRO + FONCTIONNALITÉS PREMIUM IA ===
  {
    id: 'ai_anomaly_detection_advanced',
    name: '🤖 IA - Détection Anomalies Avancée',
    description: 'Détection prédictive complète : budget, délais, qualité, risques',
    requiredPermissions: ['ai.anomaly.advanced', 'reports.view'],
    category: 'premium'
  },
  {
    id: 'ai_vocal_copilot',
    name: '🤖 Copilot Vocal IA',
    description: 'Commandes vocales intelligentes sur chantier',
    requiredPermissions: ['ai.vocal'],
    category: 'premium'
  },
  {
    id: 'ai_quote_generator_advanced',
    name: '🤖 Générateur Devis IA Complet',
    description: 'Création automatique devis complexes avec optimisation prix',
    requiredPermissions: ['ai.quotes.advanced', 'quotes.create'],
    category: 'premium'
  },
  {
    id: 'ai_predictive_analytics',
    name: '🤖 Analytics Prédictifs IA',
    description: 'Prédictions avancées coûts, délais, risques projet',
    requiredPermissions: ['ai.analytics', 'reports.advanced'],
    category: 'premium'
  },
  {
    id: 'ai_automated_reporting',
    name: '🤖 Rapports Automatisés IA',
    description: 'Génération automatique rapports exécutifs personnalisés',
    requiredPermissions: ['ai.reporting', 'reports.export'],
    category: 'premium'
  },
  {
    id: 'ai_ocr_advanced',
    name: '🤖 OCR Avancé Multi-Formats IA',
    description: 'Extraction intelligente tous documents : plans, contrats, factures manuscrites',
    requiredPermissions: ['ai.ocr.advanced', 'documents.upload'],
    category: 'premium'
  },
  {
    id: 'ai_arch_plan_reader',
    name: '🤖 Lecture Plans d’Architecture IA',
    description: 'Analyse automatique de plans (surfaces, pièces, métrés) et préparation de devis',
    requiredPermissions: ['ai.ocr.advanced', 'ai.quotes.advanced', 'documents.upload', 'ai.plan.read'],
    category: 'premium'
  },
  {
    id: 'team_payroll',
    name: 'Gestion paie équipes',
    description: 'Calcul automatique paie ouvriers avec optimisation fiscale',
    requiredPermissions: ['team.manage', 'team.payroll'],
    category: 'premium'
  },
  {
    id: 'geolocation',
    name: 'Géolocalisation chantiers',
    description: 'Suivi GPS équipes et équipements en temps réel',
    requiredPermissions: ['location.view', 'location.track'],
    category: 'premium'
  },
  {
    id: 'signature_electronic',
    name: 'Signatures électroniques',
    description: 'Validation documents et contrats avec conformité légale',
    requiredPermissions: ['signature.create', 'signature.validate'],
    category: 'premium'
  },
  {
    id: 'api_integrations',
    name: 'API & Intégrations',
    description: 'Connexions ERP, comptabilité, banques, systèmes tiers',
    requiredPermissions: ['admin.system', 'api.access'],
    category: 'premium'
  },
  {
    id: 'security_audit',
    name: 'Sécurité & Audit',
    description: 'Traçabilité complète et conformité réglementaire',
    requiredPermissions: ['admin.audit', 'security.view'],
    category: 'premium'
  }
];

// Configuration des plans avec affichage incrémental optimisé
export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Artisan',
    description: 'Idéal pour artisans et petites entreprises BTP + IA basique',
    color: 'blue',
    popular: false,
    features: PLAN_FEATURES.filter(f => 
      f.category === 'core'
    ),
    limits: {
      projects: 5,
      users: 10,
      storage: '2GB'
    }
  },
  {
    id: 'pro',
    name: 'Professionnel BTP',
    description: 'Tout Artisan + Suite IA complète + Fonctionnalités avancées',
    color: 'green',
    popular: true,
    features: PLAN_FEATURES.filter(f => 
      f.category === 'advanced'
    ),
    limits: {
      projects: 50,
      users: 100,
      storage: '25GB'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise BTP',
    description: 'Tout Pro + IA Prédictive + Analytics Avancés + Intégrations',
    color: 'purple',
    popular: false,
    features: PLAN_FEATURES.filter(f => 
      f.category === 'premium'
    ),
    limits: {
      projects: 1000,
      users: 500,
      storage: '500GB'
    }
  }
];

// Fonction pour obtenir toutes les fonctionnalités d'un plan (incluant les plans inférieurs)
export const getAllPlanFeatures = (planId: PlanId): PlanFeature[] => {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return [];
  
  switch (planId) {
    case 'basic':
      return PLAN_FEATURES.filter(f => f.category === 'core');
    case 'pro':
      return PLAN_FEATURES.filter(f => f.category === 'core' || f.category === 'advanced');
    case 'enterprise':
      return PLAN_FEATURES; // Toutes les fonctionnalités
    default:
      return [];
  }
};

// Fonction pour obtenir uniquement les nouvelles fonctionnalités d'un plan
export const getPlanIncrementalFeatures = (planId: PlanId): PlanFeature[] => {
  const plan = PLANS.find(p => p.id === planId);
  return plan?.features || [];
};

// Tarification par devise (prix mensuel) - Marge 50% minimum
export const PRICING: Record<Currency, Record<PlanId, number>> = {
  XOF: { basic: 12600, pro: 35700, enterprise: 76900 },
  XAF: { basic: 12600, pro: 35700, enterprise: 76900 },
  MAD: { basic: 260, pro: 740, enterprise: 1600 },
  DZD: { basic: 3360, pro: 9520, enterprise: 20500 },
  TND: { basic: 50, pro: 143, enterprise: 308 },
  GNF: { basic: 126000, pro: 357000, enterprise: 769000 },
  LRD: { basic: 1890, pro: 5355, enterprise: 11535 },
  SLL: { basic: 252000, pro: 714000, enterprise: 1538000 },
  CDF: { basic: 31500, pro: 89250, enterprise: 192250 },
  KES: { basic: 1575, pro: 4462, enterprise: 9612 },
  TZS: { basic: 29400, pro: 83300, enterprise: 179380 },
  UGX: { basic: 47250, pro: 133875, enterprise: 288225 },
  RWF: { basic: 13125, pro: 37187, enterprise: 80062 },
  BIF: { basic: 26250, pro: 74375, enterprise: 160125 },
  ETB: { basic: 682, pro: 1932, enterprise: 4162 },
  ZAR: { basic: 210, pro: 595, enterprise: 1282 },
  USD: { basic: 13, pro: 36, enterprise: 77 },
  ZMW: { basic: 315, pro: 892, enterprise: 1922 },
  MWK: { basic: 13125, pro: 37187, enterprise: 80062 },
  MZN: { basic: 787, pro: 2232, enterprise: 4807 },
  BWP: { basic: 168, pro: 476, enterprise: 1025 },
  NAD: { basic: 210, pro: 595, enterprise: 1282 },
  SZL: { basic: 210, pro: 595, enterprise: 1282 },
  LSL: { basic: 210, pro: 595, enterprise: 1282 },
  LYD: { basic: 58, pro: 164, enterprise: 353 },
  EGP: { basic: 388, pro: 1100, enterprise: 2370 }
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XOF: 'FCFA',
  XAF: 'FCFA',
  MAD: 'DH',
  DZD: 'DA',
  TND: 'DT',
  GNF: 'GNF',
  LRD: 'L$',
  SLL: 'Le',
  CDF: 'FC',
  KES: 'KSh',
  TZS: 'TSh',
  UGX: 'USh',
  RWF: 'RF',
  BIF: 'FBu',
  ETB: 'Br',
  ZAR: 'R',
  USD: '$',
  ZMW: 'ZK',
  MWK: 'MK',
  MZN: 'MT',
  BWP: 'P',
  NAD: 'N$',
  SZL: 'E',
  LSL: 'L',
  LYD: 'LD',
  EGP: 'E£'
};

// Fonction utilitaire pour vérifier si un plan inclut une fonctionnalité
export const planIncludesFeature = (planId: PlanId, featureId: string): boolean => {
  const plan = PLANS.find(p => p.id === planId);
  return plan?.features.some(f => f.id === featureId) || false;
};

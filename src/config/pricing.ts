import { Permission } from './permissions';

export type PlanId = 'starter' | 'pro' | 'enterprise';
export type Currency = 'XOF' | 'XAF' | 'MAD' | 'DZD' | 'TND' | 'GNF' | 'LRD' | 'SLL' | 'CDF' | 'KES' | 'TZS' | 'UGX' | 'RWF' | 'BIF' | 'ETB' | 'ZAR' | 'USD' | 'ZMW' | 'MWK' | 'MZN' | 'BWP' | 'NAD' | 'SZL' | 'LSL' | 'LYD' | 'EGP';

// Messages d'affichage pour les plans
export const PLAN_DISPLAY_MESSAGES = {
  starter: {
    title: 'Fonctionnalités incluses :',
    features: 'Essentiels BTP + IA basique + Automations n8n (sans LLM payant) + Essai 14 jours'
  },
  pro: {
    title: 'Tout Starter +',
    features: 'Finances + Facturation + IA LLM de base + Automations n8n (sans LLM payant)'
  },
  enterprise: {
    title: 'Tout Pro +', 
    features: 'IA Avancée + Analytics + Automations n8n Avancées (LLM payants) + Support Premium'
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
  usersIncluded: number;
  pricePerExtraUser: number;
  aiCreditsIncluded: number; // en FCFA
  aiOverage: {
    llmPer100Calls: number; // FCFA
    ocrPerPage: number; // FCFA
    planReaderPerPlan: number; // FCFA
  };
  trialDays?: number; // Essai gratuit en jours
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
  {
    id: 'offline_mode',
    name: 'Mode Hors-Ligne',
    description: 'Utilisation de la plateforme sans connexion (synchronisation différée)',
    requiredPermissions: ['offline.use'],
    category: 'core'
  },
  {
    id: 'notifications_center',
    name: 'Centre de notifications',
    description: 'Notifications système et alertes opérationnelles',
    requiredPermissions: ['notifications.view'],
    category: 'core'
  },
  {
    id: 'mobile_pwa_access',
    name: 'Accès mobile (PWA installable)',
    description: 'Installation sur mobile depuis le navigateur, mode hors-ligne et raccourci écran d’accueil',
    requiredPermissions: ['mobile.access'],
    category: 'core'
  },
  
  // === AUTOMATION DE BASE (DISPONIBLE STATER/PRO) ===
  {
    id: 'automation_basic',
    name: 'Automations n8n (hors LLM payants)',
    description: 'Webhooks, enchaînements API, emails et règles sans coûts LLM',
    requiredPermissions: ['automation.run', 'webhooks.manage'],
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
    id: 'finances_basic',
    name: 'Gestion financière BTP',
    description: 'Suivi coûts, fournisseurs, trésorerie chantier',
    requiredPermissions: ['finances.view', 'finances.edit'],
    category: 'core'
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
    id: 'planning_kanban',
    name: 'Kanban chantier (Drag & Drop)',
    description: 'Organisation visuelle des tâches par colonnes',
    requiredPermissions: ['planning.view', 'planning.kanban'],
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
    id: 'payments_mobile_money',
    name: 'Paiements & Mobile Money',
    description: 'Encaissement via Mobile Money et cartes',
    requiredPermissions: ['payments.view', 'payments.collect'],
    category: 'advanced'
  },
  {
    id: 'invoicing_and_receivables',
    name: 'Facturation & Encaissement',
    description: 'Factures depuis devis, envoi et suivi des paiements',
    requiredPermissions: ['invoices.create', 'invoices.send', 'payments.collect'],
    category: 'advanced'
  },
  {
    id: 'email_integration',
    name: 'Envoi email automatique',
    description: 'Envoi devis et documents par email',
    requiredPermissions: ['quotes.send', 'documents.send'],
    category: 'advanced'
  },
  {
    id: 'btp_price_library',
    name: 'Bibliothèque de prix BTP',
    description: 'Base d’ouvrages/métrés et prix par corps de métier',
    requiredPermissions: ['prices.view', 'prices.add'],
    category: 'advanced'
  },
  {
    id: 'support_center',
    name: 'Centre de support (tickets & live chat)',
    description: 'Gestion des tickets et assistance en temps réel',
    requiredPermissions: ['support.view', 'support.create'],
    category: 'advanced'
  },
  {
    id: 'documents_advanced',
    name: 'Documents avancés',
    description: 'Tags, versions et intégration signature',
    requiredPermissions: ['documents.manage'],
    category: 'advanced'
  },
  {
    id: 'dashboard_advanced',
    name: 'Dashboard & Rapports avancés',
    description: 'Widgets personnalisables et rapports détaillés',
    requiredPermissions: ['reports.view', 'reports.dashboard'],
    category: 'advanced'
  },
  {
    id: 'team_time_tracking',
    name: 'Pointage & Temps équipe',
    description: 'Pointage terrain et suivi heures',
    requiredPermissions: ['team.time.view', 'team.time.record'],
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
  ,
  {
    id: 'workflows_automation',
    name: 'Automations & Workflows',
    description: 'Automatisations n8n avancées avec LLM payants, webhooks et intégrations de processus',
    requiredPermissions: ['automation.run', 'webhooks.manage'],
    category: 'premium'
  }
];

// Configuration des plans avec affichage incrémental optimisé
export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Gestion BTP de base - ⚠️ IA limitée',
    color: 'blue',
    popular: false,
    features: PLAN_FEATURES.filter(f => 
      f.category === 'core'
    ),
    limits: {
      projects: 10,
      users: 5,
      storage: '5GB'
    },
    usersIncluded: 3,
    pricePerExtraUser: 2000,
    aiCreditsIncluded: 3000, // Réduit pour pousser vers Pro
    aiOverage: {
      llmPer100Calls: 3000, // Plus cher pour inciter à upgrader
      ocrPerPage: 300,
      planReaderPerPlan: 1500
    },
    trialDays: 14
  },
  {
    id: 'pro',
    name: '⭐ Pro BTP + IA',
    description: '🤖 Toute la puissance de l\'IA : Devis auto, OCR, Plans, Anomalies',
    color: 'green',
    popular: true, // Le plus populaire maintenant
    features: PLAN_FEATURES.filter(f => 
      f.category === 'core' || f.category === 'advanced'
    ),
    limits: {
      projects: 100,
      users: 25,
      storage: '50GB'
    },
    usersIncluded: 10,
    pricePerExtraUser: 3000,
    aiCreditsIncluded: 30000, // Généreux pour montrer la valeur
    aiOverage: {
      llmPer100Calls: 1200,
      ocrPerPage: 120,
      planReaderPerPlan: 700
    },
    trialDays: 7 // Essai pour tester l'IA
  },
  {
    id: 'enterprise',
    name: '🚀 Enterprise IA Premium',
    description: '🤖 IA Avancée : Vocal, Analytics Prédictifs, Rapports Auto + API',
    color: 'purple',
    popular: false,
    features: PLAN_FEATURES,
    limits: {
      projects: 'unlimited',
      users: 'unlimited',
      storage: '1TB' // Augmenté
    },
    usersIncluded: 50,
    pricePerExtraUser: 2000,
    aiCreditsIncluded: 150000, // Très généreux
    aiOverage: {
      llmPer100Calls: 800,
      ocrPerPage: 80,
      planReaderPerPlan: 500
    }
  }
];

// Fonction pour obtenir toutes les fonctionnalités d'un plan (incluant les plans inférieurs)
export const getAllPlanFeatures = (planId: PlanId): PlanFeature[] => {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return [];
  
  switch (planId) {
    case 'starter':
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
  switch (planId) {
    case 'starter':
      return PLAN_FEATURES.filter(f => f.category === 'core');
    case 'pro':
      return PLAN_FEATURES.filter(f => f.category === 'advanced'); // Seulement les nouvelles
    case 'enterprise':
      return PLAN_FEATURES.filter(f => f.category === 'premium'); // Seulement les nouvelles
    default:
      return [];
  }
};

// Tarification par devise (prix mensuel) - Stratégie aimant IA
export const PRICING: Record<Currency, Record<PlanId, number>> = {
  XOF: { starter: 12000, pro: 35000, enterprise: 95000 }, // +33% Starter, +43% Pro, +54% Enterprise
  XAF: { starter: 12000, pro: 35000, enterprise: 95000 },
  MAD: { starter: 50, pro: 200, enterprise: 800 },
  DZD: { starter: 650, pro: 2600, enterprise: 10500 },
  TND: { starter: 10, pro: 40, enterprise: 160 },
  GNF: { starter: 49000, pro: 199000, enterprise: 799000 },
  LRD: { starter: 75, pro: 300, enterprise: 1200 },
  SLL: { starter: 10000, pro: 40000, enterprise: 160000 },
  CDF: { starter: 1225, pro: 4900, enterprise: 19600 },
  KES: { starter: 63, pro: 250, enterprise: 1000 },
  TZS: { starter: 1150, pro: 4600, enterprise: 18400 },
  UGX: { starter: 1850, pro: 7400, enterprise: 29600 },
  RWF: { starter: 515, pro: 2060, enterprise: 8240 },
  BIF: { starter: 1030, pro: 4120, enterprise: 16480 },
  ETB: { starter: 27, pro: 108, enterprise: 432 },
  ZAR: { starter: 8, pro: 32, enterprise: 128 },
  USD: { starter: 5, pro: 20, enterprise: 80 },
  ZMW: { starter: 12, pro: 48, enterprise: 192 },
  MWK: { starter: 515, pro: 2060, enterprise: 8240 },
  MZN: { starter: 31, pro: 124, enterprise: 496 },
  BWP: { starter: 7, pro: 28, enterprise: 112 },
  NAD: { starter: 8, pro: 32, enterprise: 128 },
  SZL: { starter: 8, pro: 32, enterprise: 128 },
  LSL: { starter: 8, pro: 32, enterprise: 128 },
  LYD: { starter: 2, pro: 8, enterprise: 32 },
  EGP: { starter: 15, pro: 60, enterprise: 240 }
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

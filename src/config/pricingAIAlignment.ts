// Analyse de l'alignement entre tarification et fonctionnalités IA

export interface AIFeatureGap {
  featureId: string;
  featureName: string;
  currentlyInPricing: boolean;
  shouldBeInPlan: 'basic' | 'pro' | 'enterprise';
  missingFromPlans: string[];
  recommendation: string;
}

// Analyse des fonctionnalités IA existantes vs tarification
export const AI_PRICING_ANALYSIS: AIFeatureGap[] = [
  {
    featureId: 'ocr_intelligent_basic',
    featureName: 'Scanner OCR Intelligent (basique)',
    currentlyInPricing: true, // Existe comme 'ocr_intelligent'
    shouldBeInPlan: 'pro',
    missingFromPlans: [],
    recommendation: 'Déjà correctement positionné dans le plan Pro'
  },
  {
    featureId: 'ai_project_plan_generator',
    featureName: 'Générateur Plans Projet IA',
    currentlyInPricing: false,
    shouldBeInPlan: 'pro',
    missingFromPlans: ['pro', 'enterprise'],
    recommendation: 'AJOUTER - Fonctionnalité majeure manquante dans tarification'
  },
  {
    featureId: 'ai_enhanced_ocr_extraction',
    featureName: 'OCR Avancé Multi-Documents',
    currentlyInPricing: false,
    shouldBeInPlan: 'enterprise',
    missingFromPlans: ['enterprise'],
    recommendation: 'AJOUTER - Différencier OCR basique vs avancé'
  },
  {
    featureId: 'ai_copilot_basic',
    featureName: 'Assistant IA Basique',
    currentlyInPricing: false,
    shouldBeInPlan: 'pro',
    missingFromPlans: ['pro'],
    recommendation: 'AJOUTER - Version simplifiée pour plan Pro'
  },
  {
    featureId: 'ai_anomaly_basic',
    featureName: 'Alertes Anomalies Basiques',
    currentlyInPricing: false,
    shouldBeInPlan: 'pro',
    missingFromPlans: ['pro'],
    recommendation: 'AJOUTER - Version simplifiée détection anomalies'
  },
  {
    featureId: 'ai_quote_optimization',
    featureName: 'Optimisation Devis IA',
    currentlyInPricing: false,
    shouldBeInPlan: 'pro',
    missingFromPlans: ['pro'],
    recommendation: 'AJOUTER - Suggestions amélioration devis automatiques'
  }
];

// Fonctionnalités IA manquantes par plan
export const MISSING_AI_FEATURES_BY_PLAN = {
  basic: [
    {
      id: 'ai_quote_suggestions',
      name: 'Suggestions Devis IA',
      description: 'Suggestions basiques pour améliorer vos devis',
      category: 'core'
    }
  ],
  pro: [
    {
      id: 'ai_project_planner',
      name: 'Générateur Plans Projet IA',
      description: 'Génération automatique de plans de projet détaillés',
      category: 'advanced'
    },
    {
      id: 'ai_copilot_basic',
      name: 'Assistant IA Basique',
      description: 'Assistant conversationnel pour questions courantes BTP',
      category: 'advanced'
    },
    {
      id: 'ai_anomaly_alerts',
      name: 'Alertes Anomalies Budget',
      description: 'Détection automatique dépassements budget simples',
      category: 'advanced'
    },
    {
      id: 'ai_ocr_enhanced',
      name: 'OCR Multi-Documents',
      description: 'Scanner factures, bons de livraison, contrats',
      category: 'advanced'
    }
  ],
  enterprise: [
    {
      id: 'ai_predictive_analytics',
      name: 'Analytics Prédictifs IA',
      description: 'Prédictions avancées coûts, délais, risques',
      category: 'premium'
    },
    {
      id: 'ai_automated_reporting',
      name: 'Rapports Automatisés IA',
      description: 'Génération automatique rapports projet personnalisés',
      category: 'premium'
    }
  ]
};

// Recommandations de mise à jour tarification
export const PRICING_UPDATE_RECOMMENDATIONS = {
  immediate: [
    'Ajouter "Générateur Plans Projet IA" au plan Pro',
    'Ajouter "Assistant IA Basique" au plan Pro',
    'Différencier OCR basique (Pro) vs OCR avancé (Enterprise)'
  ],
  shortTerm: [
    'Créer version "Alertes Anomalies" pour plan Pro',
    'Ajouter "Suggestions Devis IA" au plan Artisan',
    'Intégrer "Analytics Prédictifs" au plan Enterprise'
  ],
  positioning: [
    'Mettre en avant les fonctionnalités IA comme différenciateurs principaux',
    'Clarifier la progression IA : Artisan (suggestions) → Pro (génération) → Enterprise (prédiction)',
    'Ajouter badges "IA" sur les fonctionnalités concernées'
  ]
};

// Calcul de la valeur IA par plan
export const AI_VALUE_BY_PLAN = {
  basic: {
    aiFeatures: 1, // Suggestions basiques
    aiValuePercentage: 10, // 10% de la valeur vient de l'IA
    monthlyAICost: 200, // Coût API mensuel
    aiMargin: 12400 // 12600 - 200
  },
  pro: {
    aiFeatures: 5, // OCR + Plans + Assistant + Alertes + Suggestions
    aiValuePercentage: 40, // 40% de la valeur vient de l'IA
    monthlyAICost: 8000, // Coût API mensuel
    aiMargin: 27700 // 35700 - 8000
  },
  enterprise: {
    aiFeatures: 8, // Toutes les fonctionnalités IA
    aiValuePercentage: 60, // 60% de la valeur vient de l'IA
    monthlyAICost: 15000, // Coût API mensuel
    aiMargin: 61900 // 76900 - 15000
  }
};

// Justification tarifaire basée sur l'IA
export const AI_PRICING_JUSTIFICATION = {
  basic: 'IA d\'assistance pour optimiser vos devis et éviter les erreurs courantes',
  pro: 'Suite IA complète : génération automatique, assistant intelligent, détection anomalies',
  enterprise: 'IA prédictive avancée : analytics, automatisation complète, optimisation continue'
};

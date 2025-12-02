
export interface ExistingAIFeature {
  id: string;
  name: string;
  currentStatus: 'implemented' | 'partial' | 'needs_optimization';
  module: string;
  description: string;
  optimizationOpportunities: string[];
  businessImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedCost: number;
  expectedROI: string;
}

export const EXISTING_AI_OPTIMIZATION_ROADMAP: ExistingAIFeature[] = [
  
  
  {
    id: 'optimize_quote_generator',
    name: 'Optimisation Générateur Devis IA',
    currentStatus: 'implemented',
    module: 'Quotes',
    description: 'Améliorer la précision et la personnalisation des devis générés',
    optimizationOpportunities: [
      'Enrichir la base de données de prix matériaux BTP africains',
      'Ajouter des templates de devis par type de projet',
      'Intégrer l\'historique des devis pour améliorer les suggestions',
      'Optimiser les prompts Service pour plus de précision',
      'Ajouter la génération de métrés détaillés'
    ],
    businessImpact: 'Devis 50% plus précis, réduction 30% temps création',
    implementationEffort: 'medium',
    estimatedCost: 200000,
    expectedROI: '300% en 4 mois'
  },

  // === ASSISTANT VOCAL ===
  {
    id: 'enhance_vocal_copilot',
    name: 'Amélioration Assistant Vocal',
    currentStatus: 'implemented',
    module: 'AI',
    description: 'Étendre les commandes vocales et améliorer la reconnaissance',
    optimizationOpportunities: [
      'Ajouter 20+ nouvelles commandes vocales BTP',
      'Améliorer la reconnaissance des termes techniques BTP',
      'Intégrer le feedback vocal pour confirmation d\'actions',
      'Optimiser pour les accents africains francophones',
      'Ajouter le mode hors-ligne pour chantiers isolés'
    ],
    businessImpact: 'Productivité chantier +40%, adoption +60%',
    implementationEffort: 'medium',
    estimatedCost: 180000,
    expectedROI: '250% en 6 mois'
  },

  // === OCR INTELLIGENT ===
  {
    id: 'optimize_ocr_scanner',
    name: 'Optimisation Scanner OCR',
    currentStatus: 'implemented',
    module: 'OCR',
    description: 'Améliorer la précision et étendre les types de documents',
    optimizationOpportunities: [
      'Entraîner sur factures fournisseurs BTP locaux',
      'Ajouter reconnaissance bons de livraison',
      'Intégrer extraction automatique TVA et taxes locales',
      'Améliorer traitement documents manuscrits',
      'Ajouter validation croisée des données extraites'
    ],
    businessImpact: 'Précision OCR 95%, économie 80% temps saisie',
    implementationEffort: 'medium',
    estimatedCost: 150000,
    expectedROI: '400% en 3 mois'
  },

  // === DÉTECTION D'ANOMALIES ===
  {
    id: 'enhance_anomaly_detection',
    name: 'Amélioration Détection Anomalies',
    currentStatus: 'implemented',
    module: 'AI',
    description: 'Affiner les algorithmes et ajouter de nouveaux types d\'anomalies',
    optimizationOpportunities: [
      'Ajouter détection anomalies qualité matériaux',
      'Intégrer alertes proactives par email/SMS',
      'Améliorer seuils de détection par type de projet',
      'Ajouter suggestions d\'actions correctives automatiques',
      'Créer dashboard prédictif des risques'
    ],
    businessImpact: 'Prévention 90% problèmes, réduction 40% coûts imprevus',
    implementationEffort: 'medium',
    estimatedCost: 220000,
    expectedROI: '280% en 8 mois'
  },

  // === COPILOT CONVERSATIONNEL ===
  {
    id: 'optimize_ai_copilot',
    name: 'Optimisation Copilot Conversationnel',
    currentStatus: 'implemented',
    module: 'Support',
    description: 'Enrichir la base de connaissances et améliorer les réponses',
    optimizationOpportunities: [
      'Enrichir base connaissances BTP avec 1000+ FAQ',
      'Ajouter expertise réglementaire par pays africain',
      'Intégrer calculs automatiques (surfaces, volumes, coûts)',
      'Améliorer compréhension du contexte conversationnel',
      'Ajouter génération de recommandations personnalisées'
    ],
    businessImpact: 'Résolution 85% questions, satisfaction client +50%',
    implementationEffort: 'high',
    estimatedCost: 300000,
    expectedROI: '200% en 10 mois'
  },

  // === GÉNÉRATEUR DE PLANS PROJET ===
  {
    id: 'enhance_project_planner',
    name: 'Amélioration Générateur Plans Projet',
    currentStatus: 'implemented',
    module: 'Projects',
    description: 'Optimiser la génération de plans et ajouter des fonctionnalités avancées',
    optimizationOpportunities: [
      'Intégrer templates par type de construction africaine',
      'Ajouter estimation durées basée sur données locales',
      'Intégrer contraintes saisonnières (saisons des pluies)',
      'Améliorer séquençage des tâches et dépendances',
      'Ajouter optimisation automatique des ressources'
    ],
    businessImpact: 'Plans 60% plus réalistes, respect délais +35%',
    implementationEffort: 'high',
    estimatedCost: 250000,
    expectedROI: '220% en 12 mois'
  }
];

// Roadmap d'optimisation par priorité
export const OPTIMIZATION_ROADMAP = {
  phase1_immediate: [
    'optimize_ocr_scanner',
    'optimize_quote_generator'
  ],
  phase2_shortTerm: [
    'enhance_vocal_copilot',
    'enhance_anomaly_detection'
  ],
  phase3_mediumTerm: [
    'optimize_ai_copilot',
    'enhance_project_planner'
  ]
};

// Fonctionnalités mises en standby (pas de focus actuel)
export const STANDBY_FEATURES = {
  weatherAndLocation: [
    'Analyseur impact météo',
    'Optimisateur trajets GPS', 
    'Intégration Google Maps API'
  ],
  recommendationsOptimization: [
    'Recommandeur fournisseurs',
    'Optimisateur prix dynamique',
    'Prédicteur budget/trésorerie'
  ],
  securityCompliance: [
    'Analyseur sécurité photos',
    'Vérificateur conformité documents',
    'Analyseur contrats juridiques'
  ],
  multilingualSupport: [
    'Traduction automatique',
    'Support 20+ langues africaines'
  ]
};

// Métriques de succès pour les optimisations
export const OPTIMIZATION_SUCCESS_METRICS = {
  quoteGenerator: {
    currentAccuracy: '70%',
    targetAccuracy: '95%',
    currentTimeToGenerate: '5 minutes',
    targetTimeToGenerate: '2 minutes'
  },
  vocalCopilot: {
    currentCommands: '10',
    targetCommands: '30+',
    currentAccuracy: '80%',
    targetAccuracy: '95%'
  },
  ocrScanner: {
    currentAccuracy: '85%',
    targetAccuracy: '95%',
    currentDocumentTypes: '3',
    targetDocumentTypes: '8+'
  },
  anomalyDetection: {
    currentDetectionRate: '70%',
    targetDetectionRate: '90%',
    currentFalsePositives: '15%',
    targetFalsePositives: '5%'
  }
};

// Calcul ROI optimisations existantes
export const calculateOptimizationROI = () => {
  const totalOptimizationCost = EXISTING_AI_OPTIMIZATION_ROADMAP.reduce(
    (sum, feature) => sum + feature.estimatedCost, 0
  );
  
  const currentMonthlyRevenue = 2685000; // Revenue actuel
  const optimizationBoost = 0.25; // 25% boost via optimisations
  const monthlyBoost = currentMonthlyRevenue * optimizationBoost;
  
  return {
    totalInvestment: totalOptimizationCost,
    monthlyRevenueBoost: monthlyBoost,
    paybackPeriod: Math.ceil(totalOptimizationCost / monthlyBoost),
    roi12Months: ((monthlyBoost * 12 - totalOptimizationCost) / totalOptimizationCost) * 100
  };
};

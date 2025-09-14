// Alternatives IA Open Source pour réduire les coûts API
export interface OpenSourceAIOption {
  id: string;
  name: string;
  type: 'self_hosted' | 'api_service' | 'hybrid';
  description: string;
  capabilities: string[];
  costStructure: {
    setup: number; // Coût initial en FCFA
    monthly: number; // Coût mensuel en FCFA
    perRequest: number; // Coût par requête en FCFA
    scaling: 'linear' | 'exponential' | 'flat';
  };
  performance: {
    accuracy: number; // 0-100%
    speed: 'slow' | 'medium' | 'fast';
    reliability: number; // 0-100%
  };
  technicalRequirements: {
    serverSpecs: string;
    bandwidth: string;
    storage: string;
    expertise: 'low' | 'medium' | 'high';
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
  implementationEffort: 'low' | 'medium' | 'high';
  roi: string;
}

export const OPEN_SOURCE_AI_ALTERNATIVES: OpenSourceAIOption[] = [
  
  // === MODÈLES DE LANGAGE OPEN SOURCE ===
  {
    id: 'ollama_llama',
    name: 'Ollama + Llama 3.1 (Meta)',
    type: 'self_hosted',
    description: 'Modèle de langage open source de Meta, hébergé localement via Ollama',
    capabilities: [
      'Génération de texte',
      'Analyse de documents',
      'Questions-réponses BTP',
      'Génération de devis',
      'Assistance conversationnelle'
    ],
    costStructure: {
      setup: 500000, // Serveur + configuration
      monthly: 150000, // Hébergement serveur
      perRequest: 0, // Gratuit une fois hébergé
      scaling: 'flat'
    },
    performance: {
      accuracy: 85, // Très bon pour usage général
      speed: 'medium',
      reliability: 90
    },
    technicalRequirements: {
      serverSpecs: '16GB RAM, GPU 8GB+ (RTX 4070 ou équivalent)',
      bandwidth: '100 Mbps minimum',
      storage: '50GB SSD',
      expertise: 'medium'
    },
    pros: [
      'Coût fixe après installation',
      'Données restent privées',
      'Pas de limite de requêtes',
      'Customisation possible',
      'Pas de dépendance externe'
    ],
    cons: [
      'Investissement initial élevé',
      'Maintenance technique requise',
      'Performance moindre qu\'OpenAI GPT-4',
      'Mise à jour manuelle'
    ],
    bestFor: [
      'Génération de devis standards',
      'Assistant conversationnel basique',
      'Analyse de documents simples'
    ],
    implementationEffort: 'medium',
    roi: '300% après 6 mois si >1000 requêtes/mois'
  },

  {
    id: 'huggingface_transformers',
    name: 'Hugging Face Transformers',
    type: 'hybrid',
    description: 'Bibliothèque open source avec modèles pré-entraînés, API gratuite limitée',
    capabilities: [
      'Classification de texte',
      'Extraction d\'entités',
      'Résumé de documents',
      'Traduction',
      'Analyse de sentiment'
    ],
    costStructure: {
      setup: 200000, // Développement intégration
      monthly: 50000, // Hébergement léger
      perRequest: 2, // API gratuite puis payante
      scaling: 'linear'
    },
    performance: {
      accuracy: 80,
      speed: 'fast',
      reliability: 85
    },
    technicalRequirements: {
      serverSpecs: '8GB RAM, CPU moderne',
      bandwidth: '50 Mbps',
      storage: '20GB',
      expertise: 'low'
    },
    pros: [
      'Très large choix de modèles',
      'Communauté active',
      'API gratuite pour débuter',
      'Documentation excellente',
      'Intégration Python simple'
    ],
    cons: [
      'Limites API gratuite',
      'Performance variable selon modèles',
      'Pas spécialisé BTP'
    ],
    bestFor: [
      'Classification documents BTP',
      'Extraction données factures',
      'Analyse sentiment clients'
    ],
    implementationEffort: 'low',
    roi: '200% dès le premier mois'
  },

  // === VISION PAR ORDINATEUR OPEN SOURCE ===
  {
    id: 'tesseract_ocr',
    name: 'Tesseract OCR + OpenCV',
    type: 'self_hosted',
    description: 'OCR open source de Google + traitement d\'image OpenCV',
    capabilities: [
      'Reconnaissance texte documents',
      'Extraction données factures',
      'Lecture plans (basique)',
      'Traitement images chantier'
    ],
    costStructure: {
      setup: 300000, // Développement + optimisation
      monthly: 75000, // Serveur traitement
      perRequest: 0,
      scaling: 'flat'
    },
    performance: {
      accuracy: 75, // Bon pour texte clair
      speed: 'fast',
      reliability: 90
    },
    technicalRequirements: {
      serverSpecs: '8GB RAM, CPU multi-core',
      bandwidth: '25 Mbps',
      storage: '30GB',
      expertise: 'medium'
    },
    pros: [
      'Totalement gratuit',
      'Très rapide',
      'Customisable',
      'Pas de limite usage',
      'Fonctionne hors ligne'
    ],
    cons: [
      'Précision moindre que solutions payantes',
      'Difficile avec écriture manuscrite',
      'Pas d\'IA avancée'
    ],
    bestFor: [
      'OCR factures imprimées',
      'Extraction texte plans numériques',
      'Traitement documents standards'
    ],
    implementationEffort: 'medium',
    roi: '500% dès 3 mois'
  },

  // === SERVICES IA ABORDABLES ===
  {
    id: 'groq_api',
    name: 'Groq API (Ultra-rapide)',
    type: 'api_service',
    description: 'API IA ultra-rapide avec modèles Llama, Mixtral à prix réduit',
    capabilities: [
      'Génération texte ultra-rapide',
      'Analyse documents',
      'Code generation',
      'Résumés intelligents'
    ],
    costStructure: {
      setup: 100000, // Intégration simple
      monthly: 25000, // Quota de base
      perRequest: 5, // 10x moins cher qu\'OpenAI
      scaling: 'linear'
    },
    performance: {
      accuracy: 82,
      speed: 'fast', // 10x plus rapide qu\'OpenAI
      reliability: 88
    },
    technicalRequirements: {
      serverSpecs: 'Aucun (API)',
      bandwidth: '10 Mbps',
      storage: 'Minimal',
      expertise: 'low'
    },
    pros: [
      'Extrêmement rapide',
      'Prix très compétitif',
      'API compatible OpenAI',
      'Pas d\'infrastructure',
      'Modèles récents'
    ],
    cons: [
      'Moins précis qu\'OpenAI GPT-4',
      'Quotas limités',
      'Dépendance externe'
    ],
    bestFor: [
      'Génération rapide de devis',
      'Assistant temps réel',
      'Traitement gros volumes'
    ],
    implementationEffort: 'low',
    roi: '400% dès le premier mois'
  },

  {
    id: 'anthropic_claude',
    name: 'Anthropic Claude (Haiku)',
    type: 'api_service',
    description: 'Modèle Claude Haiku, plus abordable que GPT-4, excellent pour l\'analyse',
    capabilities: [
      'Analyse documents complexes',
      'Raisonnement logique',
      'Génération structurée',
      'Sécurité renforcée'
    ],
    costStructure: {
      setup: 150000,
      monthly: 40000,
      perRequest: 8, // 5x moins cher que GPT-4
      scaling: 'linear'
    },
    performance: {
      accuracy: 88, // Excellent pour analyse
      speed: 'medium',
      reliability: 92
    },
    technicalRequirements: {
      serverSpecs: 'Aucun (API)',
      bandwidth: '15 Mbps',
      storage: 'Minimal',
      expertise: 'low'
    },
    pros: [
      'Excellent pour analyse documents',
      'Plus sûr qu\'OpenAI',
      'Moins de hallucinations',
      'Bon rapport qualité/prix'
    ],
    cons: [
      'Moins créatif qu\'OpenAI',
      'Disponibilité limitée',
      'API moins mature'
    ],
    bestFor: [
      'Analyse contrats BTP',
      'Vérification conformité',
      'Audit documents'
    ],
    implementationEffort: 'low',
    roi: '350% en 4 mois'
  },

  // === SOLUTIONS HYBRIDES OPTIMISÉES ===
  {
    id: 'local_api_mix',
    name: 'Mix Local + API (Stratégie Hybride)',
    type: 'hybrid',
    description: 'Combinaison modèles locaux pour tâches simples + API premium pour complexes',
    capabilities: [
      'Routage intelligent des requêtes',
      'Optimisation coûts automatique',
      'Fallback de sécurité',
      'Performance adaptative'
    ],
    costStructure: {
      setup: 800000, // Développement système hybride
      monthly: 100000, // Infrastructure mixte
      perRequest: 3, // Coût moyen optimisé
      scaling: 'linear'
    },
    performance: {
      accuracy: 87, // Optimisé selon usage
      speed: 'fast',
      reliability: 95
    },
    technicalRequirements: {
      serverSpecs: '12GB RAM, GPU optionnelle',
      bandwidth: '75 Mbps',
      storage: '40GB',
      expertise: 'high'
    },
    pros: [
      'Meilleur rapport qualité/prix',
      'Résilience élevée',
      'Optimisation automatique',
      'Évolutif selon besoins'
    ],
    cons: [
      'Complexité technique élevée',
      'Développement sur mesure',
      'Maintenance continue'
    ],
    bestFor: [
      'Plateforme complète BTP',
      'Usage mixte intensif',
      'Optimisation coûts long terme'
    ],
    implementationEffort: 'high',
    roi: '600% en 12 mois'
  }
];

// Analyse comparative des coûts
export const COST_COMPARISON_ANALYSIS = {
  currentOpenAICost: {
    gpt4: 50, // FCFA par requête
    gpt35: 15, // FCFA par requête
    monthlyEstimate: 750000 // Pour 15000 requêtes/mois
  },
  
  openSourceSavings: {
    immediate: {
      option: 'groq_api',
      savings: '70%', // 15 FCFA vs 50 FCFA
      monthlyReduction: 525000
    },
    mediumTerm: {
      option: 'ollama_llama',
      savings: '90%', // Après amortissement
      monthlyReduction: 675000,
      breakEvenMonths: 6
    },
    longTerm: {
      option: 'local_api_mix',
      savings: '85%',
      monthlyReduction: 637500,
      additionalBenefits: ['Données privées', 'Pas de limites', 'Customisation']
    }
  },

  recommendedStrategy: {
    phase1: {
      duration: '3 mois',
      solution: 'groq_api',
      goal: 'Réduction immédiate des coûts',
      expectedSavings: 1575000 // 3 mois
    },
    phase2: {
      duration: '6 mois',
      solution: 'huggingface_transformers',
      goal: 'Spécialisation tâches simples',
      expectedSavings: 2250000
    },
    phase3: {
      duration: '12 mois',
      solution: 'local_api_mix',
      goal: 'Autonomie et optimisation complète',
      expectedSavings: 7650000 // Par an
    }
  }
};

// Matrice de décision par cas d'usage
export const USE_CASE_RECOMMENDATIONS = {
  'quote_generation': {
    simple: 'ollama_llama', // Devis standards
    complex: 'anthropic_claude', // Devis sur mesure
    volume: 'groq_api' // Gros volumes
  },
  'document_analysis': {
    ocr: 'tesseract_ocr',
    understanding: 'huggingface_transformers',
    legal: 'anthropic_claude'
  },
  'conversational_ai': {
    basic: 'ollama_llama',
    advanced: 'groq_api',
    specialized: 'local_api_mix'
  },
  'predictive_analytics': {
    simple: 'huggingface_transformers',
    complex: 'local_api_mix',
    realtime: 'groq_api'
  }
};

// Plan d'implémentation recommandé
export const IMPLEMENTATION_ROADMAP = {
  immediate: [
    {
      action: 'Intégrer Groq API comme alternative à OpenAI',
      timeline: '1 semaine',
      cost: 100000,
      impact: 'Réduction 70% coûts IA'
    },
    {
      action: 'Implémenter Tesseract pour OCR basique',
      timeline: '2 semaines', 
      cost: 300000,
      impact: 'OCR gratuit pour factures'
    }
  ],
  shortTerm: [
    {
      action: 'Déployer Ollama + Llama pour génération devis',
      timeline: '1 mois',
      cost: 500000,
      impact: 'Devis gratuits après setup'
    },
    {
      action: 'Intégrer Hugging Face pour classification',
      timeline: '3 semaines',
      cost: 200000,
      impact: 'Analyse documents optimisée'
    }
  ],
  longTerm: [
    {
      action: 'Développer système hybride intelligent',
      timeline: '6 mois',
      cost: 800000,
      impact: 'Optimisation complète coûts + performance'
    }
  ]
};

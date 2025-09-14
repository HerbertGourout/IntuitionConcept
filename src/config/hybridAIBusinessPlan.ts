// Business Plan Détaillé - Système Hybride IA pour IntuitionConcept BTP
export const HYBRID_AI_BUSINESS_PLAN = {
  
  // === STRUCTURE TARIFAIRE ACTUELLE ===
  currentPricing: {
    artisan: {
      monthlyPrice: 12600, // FCFA
      users: 3,
      projects: 5,
      aiFeatures: 1, // Suggestions basiques
      targetMarket: 'Artisans individuels, petites entreprises'
    },
    pro: {
      monthlyPrice: 35700, // FCFA
      users: 15,
      projects: 50,
      aiFeatures: 5, // OCR + Plans + Assistant + Alertes
      targetMarket: 'PME BTP, entrepreneurs'
    },
    enterprise: {
      monthlyPrice: 76900, // FCFA
      users: 'unlimited',
      projects: 'unlimited',
      aiFeatures: 8, // Suite complète IA
      targetMarket: 'Grandes entreprises, promoteurs'
    }
  },

  // === STRUCTURE DE COÛTS HYBRIDE IA ===
  aiCostStructure: {
    // Coûts par requête (FCFA)
    providers: {
      groq: 3,           // 80% des requêtes
      claude: 8,         // 10% des requêtes
      googleVision: 12,  // 5% des requêtes
      openai: 50         // 5% des requêtes (fallback)
    },
    
    // Estimation usage mensuel par plan
    monthlyUsage: {
      artisan: {
        totalRequests: 200,
        distribution: {
          groq: 160,      // 80%
          claude: 20,     // 10%
          vision: 10,     // 5%
          openai: 10      // 5%
        },
        totalCost: 200 // FCFA/mois
      },
      pro: {
        totalRequests: 1500,
        distribution: {
          groq: 1200,     // 80%
          claude: 150,    // 10%
          vision: 75,     // 5%
          openai: 75      // 5%
        },
        totalCost: 1500 // FCFA/mois
      },
      enterprise: {
        totalRequests: 5000,
        distribution: {
          groq: 4000,     // 80%
          claude: 500,    // 10%
          vision: 250,    // 5%
          openai: 250     // 5%
        },
        totalCost: 5000 // FCFA/mois
      }
    }
  },

  // === PROJECTIONS FINANCIÈRES DÉTAILLÉES ===
  financialProjections: {
    year1: {
      customers: {
        artisan: 500,    // clients
        pro: 200,        // clients
        enterprise: 50   // clients
      },
      revenue: {
        artisan: 500 * 12600 * 12,      // 75,600,000 FCFA
        pro: 200 * 35700 * 12,          // 85,680,000 FCFA
        enterprise: 50 * 76900 * 12,    // 46,140,000 FCFA
        total: 207420000 // FCFA
      },
      aiCosts: {
        artisan: 500 * 200 * 12,        // 1,200,000 FCFA
        pro: 200 * 1500 * 12,           // 3,600,000 FCFA
        enterprise: 50 * 5000 * 12,     // 3,000,000 FCFA
        total: 7800000 // FCFA
      },
      otherCosts: {
        infrastructure: 12000000,       // Serveurs, CDN, etc.
        development: 24000000,          // Équipe dev
        marketing: 15000000,            // Acquisition clients
        operations: 18000000,           // Support, admin
        total: 69000000 // FCFA
      },
      netProfit: 207420000 - 7800000 - 69000000 // 130,620,000 FCFA
    },

    year2: {
      customers: {
        artisan: 1200,   // +140% croissance
        pro: 500,        // +150% croissance
        enterprise: 120  // +140% croissance
      },
      revenue: {
        artisan: 1200 * 12600 * 12,     // 181,440,000 FCFA
        pro: 500 * 35700 * 12,          // 214,200,000 FCFA
        enterprise: 120 * 76900 * 12,   // 110,736,000 FCFA
        total: 506376000 // FCFA
      },
      aiCosts: {
        artisan: 1200 * 200 * 12,       // 2,880,000 FCFA
        pro: 500 * 1500 * 12,           // 9,000,000 FCFA
        enterprise: 120 * 5000 * 12,    // 7,200,000 FCFA
        total: 19080000 // FCFA
      },
      otherCosts: {
        infrastructure: 18000000,       // Scaling infrastructure
        development: 36000000,          // Équipe élargie
        marketing: 25000000,            // Expansion marché
        operations: 30000000,           // Support élargi
        total: 109000000 // FCFA
      },
      netProfit: 506376000 - 19080000 - 109000000 // 378,296,000 FCFA
    },

    year3: {
      customers: {
        artisan: 2500,   // Marché mature
        pro: 1000,       // Pénétration PME
        enterprise: 200  // Grandes entreprises
      },
      revenue: {
        artisan: 2500 * 12600 * 12,     // 378,000,000 FCFA
        pro: 1000 * 35700 * 12,         // 428,400,000 FCFA
        enterprise: 200 * 76900 * 12,   // 184,560,000 FCFA
        total: 990960000 // FCFA
      },
      aiCosts: {
        artisan: 2500 * 200 * 12,       // 6,000,000 FCFA
        pro: 1000 * 1500 * 12,          // 18,000,000 FCFA
        enterprise: 200 * 5000 * 12,    // 12,000,000 FCFA
        total: 36000000 // FCFA
      },
      otherCosts: {
        infrastructure: 25000000,       // Infrastructure mature
        development: 45000000,          // Innovation continue
        marketing: 35000000,            // Expansion régionale
        operations: 45000000,           // Support premium
        total: 150000000 // FCFA
      },
      netProfit: 990960000 - 36000000 - 150000000 // 804,960,000 FCFA
    }
  },

  // === COMPARAISON AVEC OPENAI PUR ===
  costComparison: {
    openaiOnly: {
      year1: {
        aiCosts: 7800000 * 12.5,        // 97,500,000 FCFA (25x plus cher)
        netProfit: 207420000 - 97500000 - 69000000 // 40,920,000 FCFA
      },
      year2: {
        aiCosts: 19080000 * 12.5,       // 238,500,000 FCFA
        netProfit: 506376000 - 238500000 - 109000000 // 158,876,000 FCFA
      },
      year3: {
        aiCosts: 36000000 * 12.5,       // 450,000,000 FCFA
        netProfit: 990960000 - 450000000 - 150000000 // 390,960,000 FCFA
      }
    },
    
    savingsWithHybrid: {
      year1: 89700000,   // FCFA économisés
      year2: 219420000,  // FCFA économisés
      year3: 414000000,  // FCFA économisés
      total3Years: 723120000 // FCFA économisés sur 3 ans
    }
  },

  // === MÉTRIQUES CLÉS DE PERFORMANCE ===
  kpis: {
    aiCostAsPercentageOfRevenue: {
      year1: '3.8%',     // Très faible
      year2: '3.8%',     // Stable
      year3: '3.6%'      // Amélioration avec scale
    },
    
    netProfitMargin: {
      year1: '63%',      // Excellent
      year2: '75%',      // Exceptionnel
      year3: '81%'       // Leader marché
    },
    
    customerAcquisitionCost: {
      artisan: 30000,    // FCFA
      pro: 125000,       // FCFA
      enterprise: 300000 // FCFA
    },
    
    customerLifetimeValue: {
      artisan: 151200,   // 12 mois moyenne
      pro: 428400,       // 12 mois moyenne
      enterprise: 923000 // 12 mois moyenne
    }
  },

  // === STRATÉGIE DE TARIFICATION OPTIMISÉE ===
  pricingStrategy: {
    currentAdvantages: [
      'Coûts IA 87% inférieurs à la concurrence',
      'Marges exceptionnelles permettant investissement R&D',
      'Capacité à proposer prix compétitifs',
      'Flexibilité pour promotions et acquisitions'
    ],
    
    optimizationOpportunities: [
      'Augmentation prix 10-15% possible (marge IA faible)',
      'Plans premium avec IA avancée',
      'Facturation usage IA pour gros consommateurs',
      'Offres spéciales marché entreprise'
    ],
    
    recommendedActions: [
      'Maintenir prix actuels pour pénétration marché',
      'Communiquer sur valeur IA sans révéler coûts',
      'Développer offres sur-mesure entreprises',
      'Préparer augmentation prix année 2 (+10%)'
    ]
  },

  // === ANALYSE DES RISQUES ===
  riskAnalysis: {
    technical: {
      risk: 'Dépendance providers IA externes',
      mitigation: 'Système fallback + diversification providers',
      impact: 'Faible - architecture hybride résiliente'
    },
    
    financial: {
      risk: 'Augmentation prix APIs IA',
      mitigation: 'Négociation volumes + alternatives prêtes',
      impact: 'Moyen - marges confortables permettent absorption'
    },
    
    competitive: {
      risk: 'Concurrents adoptent IA similaire',
      mitigation: 'Innovation continue + avance technologique',
      impact: 'Moyen - avantage premier entrant significatif'
    },
    
    market: {
      risk: 'Adoption IA plus lente que prévu',
      mitigation: 'Fonctionnalités classiques maintenues',
      impact: 'Faible - IA est bonus, pas prérequis'
    }
  },

  // === PLAN D'INVESTISSEMENT ===
  investmentPlan: {
    immediate: {
      aiInfrastructure: 2000000,      // Configuration hybride
      teamTraining: 1500000,          // Formation équipes
      monitoring: 1000000,            // Outils surveillance
      total: 4500000 // FCFA
    },
    
    year1: {
      aiOptimization: 5000000,        // Amélioration algorithmes
      newFeatures: 8000000,           // Fonctionnalités IA avancées
      scaling: 3000000,               // Infrastructure scaling
      total: 16000000 // FCFA
    },
    
    roi: {
      paybackPeriod: '2.1 mois',      // Très rapide
      roi3Years: '4500%',             // Exceptionnel
      breakEvenPoint: 'Mois 3'        // Très précoce
    }
  },

  // === RECOMMANDATIONS STRATÉGIQUES ===
  strategicRecommendations: [
    {
      priority: 'Immédiate',
      action: 'Déployer système hybride IA',
      impact: 'Réduction 87% coûts IA',
      timeline: '3 semaines'
    },
    {
      priority: 'Court terme',
      action: 'Communiquer avantage IA dans marketing',
      impact: 'Différenciation concurrentielle',
      timeline: '1 mois'
    },
    {
      priority: 'Moyen terme',
      action: 'Développer fonctionnalités IA premium',
      impact: 'Augmentation ARPU 20-30%',
      timeline: '6 mois'
    },
    {
      priority: 'Long terme',
      action: 'Expansion géographique avec avantage coût',
      impact: 'Domination marché régional',
      timeline: '18 mois'
    }
  ],

  // === CONCLUSION EXÉCUTIVE ===
  executiveSummary: {
    opportunity: 'Révolution coûts IA permet marges exceptionnelles',
    advantage: '87% économies vs concurrence = avantage compétitif majeur',
    projection: '804M FCFA profit net année 3 vs 391M avec OpenAI',
    recommendation: 'Déploiement immédiat pour capture avantage premier entrant',
    timeline: 'ROI positif dès mois 3, domination marché possible année 2'
  }
};

// Export des métriques clés pour dashboards
export const BUSINESS_METRICS_SUMMARY = {
  costSavings3Years: 723120000,    // FCFA
  additionalProfit3Years: 414000000, // FCFA vs OpenAI
  netMarginYear3: 81,              // %
  paybackPeriod: 2.1,              // mois
  roiYear3: 4500                   // %
};

export default HYBRID_AI_BUSINESS_PLAN;

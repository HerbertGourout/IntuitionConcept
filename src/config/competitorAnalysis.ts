// Analyse comparative des concurrents BTP en Afrique
export interface Competitor {
  name: string;
  type: 'local' | 'international' | 'generic';
  marketPresence: 'high' | 'medium' | 'low';
  pricing: {
    basic: number;
    pro: number;
    enterprise: number;
    currency: string;
  };
  features: {
    projectManagement: boolean;
    quotes: boolean;
    financialManagement: boolean;
    teamManagement: boolean;
    equipment: boolean;
    ocr: boolean;
    ai: boolean;
    mobileApp: boolean;
    reporting: boolean;
    integrations: boolean;
  };
  limitations: string[];
  strengths: string[];
}

export const BTP_COMPETITORS: Competitor[] = [
  {
    name: "Sage BTP",
    type: "international",
    marketPresence: "high",
    pricing: {
      basic: 25000,
      pro: 45000,
      enterprise: 85000,
      currency: "FCFA"
    },
    features: {
      projectManagement: true,
      quotes: true,
      financialManagement: true,
      teamManagement: false,
      equipment: false,
      ocr: false,
      ai: false,
      mobileApp: true,
      reporting: true,
      integrations: true
    },
    limitations: [
      "Pas d'IA intégrée",
      "Pas de scanner OCR",
      "Interface complexe",
      "Support limité en français",
      "Coût des modules additionnels"
    ],
    strengths: [
      "Marque reconnue",
      "Intégrations comptables",
      "Conformité fiscale"
    ]
  },
  {
    name: "Ciel BTP",
    type: "international",
    marketPresence: "medium",
    pricing: {
      basic: 18000,
      pro: 35000,
      enterprise: 65000,
      currency: "FCFA"
    },
    features: {
      projectManagement: true,
      quotes: true,
      financialManagement: true,
      teamManagement: false,
      equipment: false,
      ocr: false,
      ai: false,
      mobileApp: false,
      reporting: true,
      integrations: false
    },
    limitations: [
      "Pas d'application mobile",
      "Pas d'IA",
      "Fonctionnalités limitées",
      "Interface datée"
    ],
    strengths: [
      "Prix accessible",
      "Simplicité d'usage",
      "Support français"
    ]
  },
  {
    name: "Batiprix",
    type: "local",
    marketPresence: "medium",
    pricing: {
      basic: 15000,
      pro: 28000,
      enterprise: 50000,
      currency: "FCFA"
    },
    features: {
      projectManagement: false,
      quotes: true,
      financialManagement: false,
      teamManagement: false,
      equipment: false,
      ocr: false,
      ai: false,
      mobileApp: false,
      reporting: false,
      integrations: false
    },
    limitations: [
      "Uniquement devis/métré",
      "Pas de gestion projet",
      "Pas de fonctionnalités avancées",
      "Support limité"
    ],
    strengths: [
      "Spécialisé métré",
      "Prix local",
      "Base de données matériaux africains"
    ]
  },
  {
    name: "Monday.com (BTP)",
    type: "international",
    marketPresence: "low",
    pricing: {
      basic: 12000,
      pro: 24000,
      enterprise: 48000,
      currency: "FCFA"
    },
    features: {
      projectManagement: true,
      quotes: false,
      financialManagement: false,
      teamManagement: true,
      equipment: false,
      ocr: false,
      ai: false,
      mobileApp: true,
      reporting: true,
      integrations: true
    },
    limitations: [
      "Pas spécialisé BTP",
      "Pas de devis/métré",
      "Pas de gestion financière BTP",
      "Configuration complexe"
    ],
    strengths: [
      "Interface moderne",
      "Collaboration équipe",
      "Nombreuses intégrations"
    ]
  },
  {
    name: "Procore",
    type: "international",
    marketPresence: "low",
    pricing: {
      basic: 60000,
      pro: 120000,
      enterprise: 250000,
      currency: "FCFA"
    },
    features: {
      projectManagement: true,
      quotes: true,
      financialManagement: true,
      teamManagement: true,
      equipment: true,
      ocr: true,
      ai: false,
      mobileApp: true,
      reporting: true,
      integrations: true
    },
    limitations: [
      "Prix très élevé",
      "Complexité d'implémentation",
      "Pas adapté PME africaines",
      "Support anglais uniquement"
    ],
    strengths: [
      "Solution complète",
      "Fonctionnalités avancées",
      "Marché US/Europe"
    ]
  },
  {
    name: "Solutions locales artisanales",
    type: "local",
    marketPresence: "high",
    pricing: {
      basic: 5000,
      pro: 12000,
      enterprise: 25000,
      currency: "FCFA"
    },
    features: {
      projectManagement: false,
      quotes: true,
      financialManagement: false,
      teamManagement: false,
      equipment: false,
      ocr: false,
      ai: false,
      mobileApp: false,
      reporting: false,
      integrations: false
    },
    limitations: [
      "Fonctionnalités très limitées",
      "Pas de support technique",
      "Pas de mises à jour",
      "Interface basique"
    ],
    strengths: [
      "Prix très bas",
      "Simplicité",
      "Adapté micro-entreprises"
    ]
  }
];

// Analyse comparative avec IntuitionConcept
export const INTUITION_CONCEPT_ANALYSIS = {
  name: "IntuitionConcept BTP",
  type: "local" as const,
  marketPresence: "new" as const,
  pricing: {
    basic: 12600,
    pro: 35700,
    enterprise: 76900,
    currency: "FCFA"
  },
  features: {
    projectManagement: true,
    quotes: true,
    financialManagement: true,
    teamManagement: true,
    equipment: true,
    ocr: true,
    ai: true,
    mobileApp: true,
    reporting: true,
    integrations: true
  },
  uniqueAdvantages: [
    "IA conversationnelle + vocale",
    "Scanner OCR intelligent",
    "Détection d'anomalies automatique",
    "Géolocalisation GPS intégrée",
    "Support multi-devises africaines",
    "Interface moderne et intuitive",
    "Support français complet",
    "Spécialisé marché africain BTP"
  ]
};

// Analyse de positionnement prix
export const PRICE_POSITIONING_ANALYSIS = {
  segments: {
    budget: {
      range: "5 000 - 15 000 FCFA",
      competitors: ["Solutions locales", "Batiprix basic"],
      positioning: "IntuitionConcept Artisan légèrement au-dessus mais avec 10x plus de fonctionnalités"
    },
    midRange: {
      range: "15 000 - 40 000 FCFA",
      competitors: ["Ciel BTP", "Monday.com", "Sage BTP basic"],
      positioning: "IntuitionConcept Pro compétitif avec IA unique"
    },
    premium: {
      range: "40 000 - 85 000 FCFA",
      competitors: ["Sage BTP pro/enterprise", "Procore basic"],
      positioning: "IntuitionConcept Enterprise excellent rapport qualité/prix"
    }
  },
  
  valueProposition: {
    vsInternational: [
      "Prix 30-50% moins cher que Sage/Procore",
      "IA intégrée (inexistante chez concurrents)",
      "Support local en français",
      "Adapté spécifiquement au marché africain"
    ],
    vsLocal: [
      "Fonctionnalités 10x supérieures",
      "Technologie moderne (cloud, mobile, IA)",
      "Support technique professionnel",
      "Évolutivité et mises à jour régulières"
    ]
  },
  
  competitiveAdvantages: [
    "Seule solution BTP avec IA conversationnelle en Afrique",
    "Scanner OCR pour factures fournisseurs (unique)",
    "Géolocalisation GPS intégrée",
    "Support 26 devises africaines",
    "Prix transparent avec limites claires",
    "Interface moderne vs solutions datées",
    "Spécialisation BTP vs solutions génériques"
  ]
};

// Recommandations stratégiques
export const STRATEGIC_RECOMMENDATIONS = {
  pricing: {
    status: "Bien positionné",
    reasoning: [
      "Prix compétitifs vs fonctionnalités offertes",
      "Segment premium justifié par l'IA unique",
      "Marge 50% permet investissement R&D"
    ]
  },
  
  messaging: [
    "Première solution BTP avec IA en Afrique",
    "10x plus de fonctionnalités que les solutions locales",
    "30-50% moins cher que les solutions internationales",
    "Conçu spécifiquement pour le marché BTP africain"
  ],
  
  targetSegments: [
    "PME BTP en croissance (Plan Pro)",
    "Grandes entreprises cherchant innovation (Plan Enterprise)",
    "Artisans tech-savvy (Plan Artisan)"
  ]
};

import { PlanId, PRICING } from './pricing';
import { PLAN_API_LIMITS, API_UNIT_COSTS } from './apiLimits';

// Analyse de rentabilité détaillée
export interface ProfitabilityAnalysis {
  planId: PlanId;
  monthlyRevenue: number;
  monthlyCosts: {
    infrastructure: number;
    apiUsage: number;
    support: number;
    marketing: number;
    development: number;
    operations: number;
    total: number;
  };
  grossMargin: number;
  marginPercentage: number;
  breakEvenUsers: number;
}

// Coûts fixes mensuels par utilisateur (FCFA)
const FIXED_COSTS_PER_USER = {
  infrastructure: {
    firebase: 500,        // Firestore + Auth + Functions
    hosting: 200,         // CDN + Hosting
    monitoring: 150,      // Logs + Analytics
    security: 100         // SSL + Backup
  },
  operations: {
    support: 800,         // Support technique spécialisé BTP
    maintenance: 600,     // Mises à jour + Bug fixes
    compliance: 200       // Sécurité + Conformité
  },
  business: {
    marketing: 500,       // Acquisition client
    sales: 300,          // Commercial + Onboarding
    development: 400      // Nouvelles fonctionnalités
  }
};

// Calcul des coûts API moyens par plan (utilisation à 70%)
const calculateAverageApiCosts = (planId: PlanId): number => {
  const limits = PLAN_API_LIMITS[planId];
  const utilizationRate = 0.7; // 70% d'utilisation moyenne
  
  let totalApiCost = 0;
  
  // OCR
  totalApiCost += (limits.ocrScansPerMonth * utilizationRate) * API_UNIT_COSTS.ocrScan;
  
  // IA
  totalApiCost += (limits.aiQueriesPerMonth * utilizationRate) * API_UNIT_COSTS.aiQuery;
  totalApiCost += (limits.aiQuoteGenerationsPerMonth * utilizationRate) * API_UNIT_COSTS.aiQuoteGeneration;
  
  // Communications
  totalApiCost += (limits.emailsPerMonth * utilizationRate) * API_UNIT_COSTS.email;
  totalApiCost += (limits.smsNotificationsPerMonth * utilizationRate) * API_UNIT_COSTS.smsNotification;
  
  // Géolocalisation
  totalApiCost += (limits.gpsTrackingHours * utilizationRate) * API_UNIT_COSTS.gpsTrackingHour;
  totalApiCost += (limits.mapApiCalls * utilizationRate) * API_UNIT_COSTS.mapApiCall;
  
  // Stockage et bande passante
  totalApiCost += limits.storageGB * API_UNIT_COSTS.storageGBMonth;
  totalApiCost += (limits.bandwidthGB * utilizationRate) * API_UNIT_COSTS.bandwidthGB;
  
  // API externes
  totalApiCost += (limits.externalApiCalls * utilizationRate) * API_UNIT_COSTS.externalApiCall;
  totalApiCost += (limits.webhookCalls * utilizationRate) * API_UNIT_COSTS.webhookCall;
  
  return Math.round(totalApiCost);
};

// Analyse de rentabilité par plan
export const analyzeProfitability = (): ProfitabilityAnalysis[] => {
  const plans: PlanId[] = ['basic', 'pro', 'enterprise'];
  
  return plans.map(planId => {
    const revenue = PRICING.XOF[planId];
    
    // Calcul des coûts
    const infrastructureCost = Object.values(FIXED_COSTS_PER_USER.infrastructure).reduce((a, b) => a + b, 0);
    const operationsCost = Object.values(FIXED_COSTS_PER_USER.operations).reduce((a, b) => a + b, 0);
    const businessCost = Object.values(FIXED_COSTS_PER_USER.business).reduce((a, b) => a + b, 0);
    const apiCost = calculateAverageApiCosts(planId);
    
    const totalCosts = infrastructureCost + operationsCost + businessCost + apiCost;
    const grossMargin = revenue - totalCosts;
    const marginPercentage = (grossMargin / revenue) * 100;
    
    return {
      planId,
      monthlyRevenue: revenue,
      monthlyCosts: {
        infrastructure: infrastructureCost,
        apiUsage: apiCost,
        support: FIXED_COSTS_PER_USER.operations.support,
        marketing: FIXED_COSTS_PER_USER.business.marketing,
        development: FIXED_COSTS_PER_USER.business.development,
        operations: operationsCost,
        total: totalCosts
      },
      grossMargin,
      marginPercentage,
      breakEvenUsers: Math.ceil(10000 / grossMargin) // Coûts fixes entreprise 10k FCFA
    };
  });
};

// Opportunités de revenus additionnels
export interface RevenueOpportunity {
  id: string;
  name: string;
  description: string;
  estimatedMonthlyRevenue: number;
  implementationCost: number;
  timeToMarket: string;
  targetMarket: string;
}

export const ADDITIONAL_REVENUE_OPPORTUNITIES: RevenueOpportunity[] = [
  {
    id: 'training_services',
    name: 'Formation BTP digitale',
    description: 'Formations en ligne pour maîtriser la plateforme + certification',
    estimatedMonthlyRevenue: 50000, // 10 formations x 5000 FCFA
    implementationCost: 200000,
    timeToMarket: '2 mois',
    targetMarket: 'Entreprises BTP + Écoles techniques'
  },
  {
    id: 'consulting_services',
    name: 'Conseil en digitalisation BTP',
    description: 'Accompagnement personnalisé transformation digitale',
    estimatedMonthlyRevenue: 150000, // 3 missions x 50k FCFA
    implementationCost: 100000,
    timeToMarket: '1 mois',
    targetMarket: 'Grandes entreprises BTP'
  },
  {
    id: 'marketplace_commission',
    name: 'Marketplace fournisseurs BTP',
    description: 'Commission sur achats via plateforme (2-5%)',
    estimatedMonthlyRevenue: 200000, // 4M FCFA achats x 5%
    implementationCost: 500000,
    timeToMarket: '4 mois',
    targetMarket: 'Tous utilisateurs + Fournisseurs'
  },
  {
    id: 'white_label',
    name: 'Solution White Label',
    description: 'Licence plateforme pour autres secteurs (agriculture, logistique)',
    estimatedMonthlyRevenue: 300000, // 3 licences x 100k FCFA
    implementationCost: 800000,
    timeToMarket: '6 mois',
    targetMarket: 'Entreprises tech + Intégrateurs'
  },
  {
    id: 'premium_support',
    name: 'Support Premium 24/7',
    description: 'Support dédié avec SLA garanti',
    estimatedMonthlyRevenue: 75000, // 15 clients x 5k FCFA
    implementationCost: 150000,
    timeToMarket: '1 mois',
    targetMarket: 'Plan Enterprise + Grandes entreprises'
  },
  {
    id: 'custom_integrations',
    name: 'Intégrations sur mesure',
    description: 'Développement connecteurs ERP/comptabilité spécifiques',
    estimatedMonthlyRevenue: 100000, // 2 projets x 50k FCFA
    implementationCost: 200000,
    timeToMarket: '2 mois',
    targetMarket: 'Grandes entreprises avec ERP existant'
  },
  {
    id: 'data_analytics',
    name: 'Analytics & BI Premium',
    description: 'Rapports avancés et prédictions sectorielles',
    estimatedMonthlyRevenue: 80000, // 20 clients x 4k FCFA
    implementationCost: 300000,
    timeToMarket: '3 mois',
    targetMarket: 'Managers + Dirigeants BTP'
  },
  {
    id: 'mobile_app_premium',
    name: 'App mobile Premium',
    description: 'Fonctionnalités avancées hors ligne + sync',
    estimatedMonthlyRevenue: 60000, // Add-on 2k FCFA x 30 clients
    implementationCost: 400000,
    timeToMarket: '4 mois',
    targetMarket: 'Chefs de chantier + Superviseurs'
  }
];

// Calcul du potentiel de revenus total
export const calculateTotalRevenuePotential = (): {
  currentMonthlyRevenue: number;
  additionalOpportunities: number;
  totalPotential: number;
  recommendedPriorities: RevenueOpportunity[];
} => {
  const analysis = analyzeProfitability();
  
  // Estimation revenus actuels (100 clients répartis)
  const currentRevenue = 
    (analysis[0].monthlyRevenue * 50) + // 50 clients Artisan
    (analysis[1].monthlyRevenue * 40) + // 40 clients Pro
    (analysis[2].monthlyRevenue * 10);  // 10 clients Enterprise
  
  const additionalRevenue = ADDITIONAL_REVENUE_OPPORTUNITIES
    .reduce((total, opp) => total + opp.estimatedMonthlyRevenue, 0);
  
  // Priorisation par ROI (revenus/coût implémentation)
  const prioritized = ADDITIONAL_REVENUE_OPPORTUNITIES
    .map(opp => ({
      ...opp,
      roi: opp.estimatedMonthlyRevenue / opp.implementationCost
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);
  
  return {
    currentMonthlyRevenue: currentRevenue,
    additionalOpportunities: additionalRevenue,
    totalPotential: currentRevenue + additionalRevenue,
    recommendedPriorities: prioritized
  };
};

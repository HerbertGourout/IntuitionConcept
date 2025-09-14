import { PlanId } from './pricing';

export interface ApiLimits {
  // OCR & IA
  ocrScansPerMonth: number;
  aiQueriesPerMonth: number;
  aiQuoteGenerationsPerMonth: number;
  
  // Communications
  emailsPerMonth: number;
  smsNotificationsPerMonth: number;
  
  // Géolocalisation
  gpsTrackingHours: number;
  mapApiCalls: number;
  
  // Stockage et bande passante
  storageGB: number;
  bandwidthGB: number;
  
  // API externes
  externalApiCalls: number;
  webhookCalls: number;
}

// Limites par plan pour contrôler les coûts API
export const PLAN_API_LIMITS: Record<PlanId, ApiLimits> = {
  basic: {
    ocrScansPerMonth: 50,           // ~2500 FCFA de coût OCR
    aiQueriesPerMonth: 100,         // ~1500 FCFA de coût IA
    aiQuoteGenerationsPerMonth: 10, // ~1000 FCFA de coût IA
    emailsPerMonth: 200,            // ~300 FCFA de coût email
    smsNotificationsPerMonth: 50,   // ~500 FCFA de coût SMS
    gpsTrackingHours: 100,          // ~800 FCFA de coût GPS
    mapApiCalls: 1000,              // ~200 FCFA de coût cartes
    storageGB: 2,                   // Inclus dans le plan
    bandwidthGB: 10,                // ~200 FCFA de coût bande passante
    externalApiCalls: 500,          // ~300 FCFA de coût API
    webhookCalls: 100               // ~100 FCFA de coût webhooks
  },
  
  pro: {
    ocrScansPerMonth: 350,          // ~8750 FCFA de coût OCR
    aiQueriesPerMonth: 700,         // ~5250 FCFA de coût IA
    aiQuoteGenerationsPerMonth: 70, // ~3500 FCFA de coût IA
    emailsPerMonth: 1500,           // ~1125 FCFA de coût email
    smsNotificationsPerMonth: 350,  // ~1750 FCFA de coût SMS
    gpsTrackingHours: 700,          // ~2800 FCFA de coût GPS
    mapApiCalls: 7000,              // ~700 FCFA de coût cartes
    storageGB: 25,                  // Inclus dans le plan
    bandwidthGB: 70,                // ~700 FCFA de coût bande passante
    externalApiCalls: 3500,         // ~1050 FCFA de coût API
    webhookCalls: 700               // ~350 FCFA de coût webhooks
  },
  
  enterprise: {
    ocrScansPerMonth: 1500,         // ~18750 FCFA de coût OCR
    aiQueriesPerMonth: 3500,        // ~14000 FCFA de coût IA
    aiQuoteGenerationsPerMonth: 350,// ~10500 FCFA de coût IA
    emailsPerMonth: 7500,           // ~3750 FCFA de coût email
    smsNotificationsPerMonth: 1500, // ~6000 FCFA de coût SMS
    gpsTrackingHours: 3500,         // ~10500 FCFA de coût GPS
    mapApiCalls: 35000,             // ~2100 FCFA de coût cartes
    storageGB: 500,                 // ~2000 FCFA de coût stockage
    bandwidthGB: 700,               // ~2100 FCFA de coût bande passante
    externalApiCalls: 17500,        // ~3500 FCFA de coût API
    webhookCalls: 3500              // ~1050 FCFA de coût webhooks
  }
};

// Coûts unitaires pour calcul des dépassements
export const API_UNIT_COSTS = {
  ocrScan: 50,              // 50 FCFA par scan OCR
  aiQuery: 15,              // 15 FCFA par requête IA
  aiQuoteGeneration: 100,   // 100 FCFA par génération devis IA
  email: 0.75,              // 0.75 FCFA par email
  smsNotification: 10,      // 10 FCFA par SMS
  gpsTrackingHour: 4,       // 4 FCFA par heure GPS
  mapApiCall: 0.2,          // 0.2 FCFA par appel carte
  storageGBMonth: 4,        // 4 FCFA par GB/mois
  bandwidthGB: 10,          // 10 FCFA par GB
  externalApiCall: 0.3,     // 0.3 FCFA par appel API
  webhookCall: 0.5          // 0.5 FCFA par webhook
};

// Seuils d'alerte (% des limites)
export const USAGE_WARNING_THRESHOLDS = {
  warning: 80,    // Alerte à 80% d'utilisation
  critical: 95,   // Alerte critique à 95%
  blocked: 100    // Blocage à 100%
};

// Types pour le suivi d'usage
export interface UsageStats {
  planId: PlanId;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: {
    ocrScans: number;
    aiQueries: number;
    aiQuoteGenerations: number;
    emails: number;
    smsNotifications: number;
    gpsTrackingHours: number;
    mapApiCalls: number;
    storageGB: number;
    bandwidthGB: number;
    externalApiCalls: number;
    webhookCalls: number;
  };
  overageCharges: number; // Frais de dépassement en FCFA
}

// Fonction pour calculer les frais de dépassement
export const calculateOverageCharges = (usage: UsageStats['usage'], planId: PlanId): number => {
  const limits = PLAN_API_LIMITS[planId];
  let totalOverage = 0;

  // Calcul pour chaque type d'usage
  if (usage.ocrScans > limits.ocrScansPerMonth) {
    totalOverage += (usage.ocrScans - limits.ocrScansPerMonth) * API_UNIT_COSTS.ocrScan;
  }
  
  if (usage.aiQueries > limits.aiQueriesPerMonth) {
    totalOverage += (usage.aiQueries - limits.aiQueriesPerMonth) * API_UNIT_COSTS.aiQuery;
  }
  
  if (usage.aiQuoteGenerations > limits.aiQuoteGenerationsPerMonth) {
    totalOverage += (usage.aiQuoteGenerations - limits.aiQuoteGenerationsPerMonth) * API_UNIT_COSTS.aiQuoteGeneration;
  }
  
  if (usage.emails > limits.emailsPerMonth) {
    totalOverage += (usage.emails - limits.emailsPerMonth) * API_UNIT_COSTS.email;
  }
  
  if (usage.smsNotifications > limits.smsNotificationsPerMonth) {
    totalOverage += (usage.smsNotifications - limits.smsNotificationsPerMonth) * API_UNIT_COSTS.smsNotification;
  }
  
  if (usage.gpsTrackingHours > limits.gpsTrackingHours) {
    totalOverage += (usage.gpsTrackingHours - limits.gpsTrackingHours) * API_UNIT_COSTS.gpsTrackingHour;
  }
  
  if (usage.mapApiCalls > limits.mapApiCalls) {
    totalOverage += (usage.mapApiCalls - limits.mapApiCalls) * API_UNIT_COSTS.mapApiCall;
  }
  
  if (usage.storageGB > limits.storageGB) {
    totalOverage += (usage.storageGB - limits.storageGB) * API_UNIT_COSTS.storageGBMonth;
  }
  
  if (usage.bandwidthGB > limits.bandwidthGB) {
    totalOverage += (usage.bandwidthGB - limits.bandwidthGB) * API_UNIT_COSTS.bandwidthGB;
  }
  
  if (usage.externalApiCalls > limits.externalApiCalls) {
    totalOverage += (usage.externalApiCalls - limits.externalApiCalls) * API_UNIT_COSTS.externalApiCall;
  }
  
  if (usage.webhookCalls > limits.webhookCalls) {
    totalOverage += (usage.webhookCalls - limits.webhookCalls) * API_UNIT_COSTS.webhookCall;
  }

  return Math.round(totalOverage);
};

// Fonction pour vérifier si une action est autorisée
export const canPerformAction = (
  actionType: keyof UsageStats['usage'], 
  currentUsage: UsageStats['usage'], 
  planId: PlanId
): { allowed: boolean; reason?: string } => {
  const limits = PLAN_API_LIMITS[planId];
  const currentCount = currentUsage[actionType];
  const limit = limits[actionType as keyof ApiLimits] as number;
  
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Limite mensuelle atteinte (${limit}). Passez à un plan supérieur ou attendez le prochain cycle.`
    };
  }
  
  return { allowed: true };
};

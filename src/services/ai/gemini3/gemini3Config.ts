/**
 * Configuration centralisée pour Gemini 3
 */

import type { 
  Gemini3ClientConfig, 
  ThinkingLevel, 
  MediaResolution,
  RetryOptions 
} from './gemini3Types';

// Configuration par défaut
export const DEFAULT_CONFIG: Omit<Gemini3ClientConfig, 'api_key'> = {
  api_version: 'v1alpha',
  base_url: 'https://generativelanguage.googleapis.com',
  timeout_ms: 120000, // 2 minutes
  default_thinking_level: 'high',
  default_temperature: 1.0, // Recommandé par Google pour Gemini 3
  retry_options: {
    max_retries: 3,
    initial_delay_ms: 1000,
    max_delay_ms: 10000,
    backoff_multiplier: 2
  }
};

// Options de retry par défaut
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  max_retries: 3,
  initial_delay_ms: 1000,
  max_delay_ms: 10000,
  backoff_multiplier: 2
};

// Profils de configuration prédéfinis
export const CONFIG_PROFILES = {
  // Profil rapide et économique
  FAST: {
    thinking_level: 'low' as ThinkingLevel,
    media_resolution: 'media_resolution_low' as MediaResolution,
    temperature: 1.0,
    description: 'Rapide et économique - Idéal pour triage et analyses simples'
  },
  
  // Profil équilibré
  BALANCED: {
    thinking_level: 'medium' as ThinkingLevel,
    media_resolution: 'media_resolution_medium' as MediaResolution,
    temperature: 1.0,
    description: 'Équilibré - Bon compromis vitesse/qualité'
  },
  
  // Profil précision maximale
  PRECISE: {
    thinking_level: 'high' as ThinkingLevel,
    media_resolution: 'media_resolution_high' as MediaResolution,
    temperature: 1.0,
    description: 'Précision maximale - Pour analyses complexes et critiques'
  },
  
  // Profil analyse architecturale
  ARCHITECTURAL: {
    thinking_level: 'high' as ThinkingLevel,
    media_resolution: 'media_resolution_high' as MediaResolution,
    temperature: 0.1,
    description: 'Optimisé pour plans architecturaux - Précision technique'
  },
  
  // Profil génération créative
  CREATIVE: {
    thinking_level: 'high' as ThinkingLevel,
    media_resolution: 'media_resolution_high' as MediaResolution,
    temperature: 1.0,
    description: 'Créativité maximale - Pour rendus 3D et visualisations'
  }
} as const;

// Limites et quotas
export const QUOTAS = {
  // Requêtes par minute
  RPM_FREE: 15,
  RPM_PAID: 1000,
  
  // Tokens par minute
  TPM_FREE: 1000000,
  TPM_PAID: 4000000,
  
  // Requêtes par jour
  RPD_FREE: 1500,
  RPD_PAID: 50000,
  
  // Taille maximale des requêtes
  MAX_INPUT_TOKENS: 1000000,
  MAX_OUTPUT_TOKENS: 8192,
  
  // Taille maximale des fichiers
  MAX_FILE_SIZE_MB: 20,
  MAX_VIDEO_DURATION_MINUTES: 60
} as const;

// Configuration des coûts (en FCFA)
export const COST_CONFIG = {
  // Prix par 1M tokens
  INPUT_TOKEN_PRICE: 0.30,
  OUTPUT_TOKEN_PRICE: 1.20,
  
  // Prix par image générée
  IMAGE_512PX_PRICE: 25,
  IMAGE_1024PX_PRICE: 50,
  IMAGE_2K_PRICE: 75,
  IMAGE_4K_PRICE: 100,
  IMAGE_8K_PRICE: 150,
  
  // Multiplicateurs selon thinking_level
  THINKING_LEVEL_MULTIPLIERS: {
    low: 0.5,
    medium: 1.0,
    high: 2.0
  },
  
  // Multiplicateurs selon media_resolution
  MEDIA_RESOLUTION_MULTIPLIERS: {
    media_resolution_low: 0.3,
    media_resolution_medium: 1.0,
    media_resolution_high: 2.5
  }
} as const;

// Seuils d'alerte budget
export const BUDGET_ALERTS = {
  WARNING_THRESHOLD: 0.8,  // 80% du budget
  CRITICAL_THRESHOLD: 0.95, // 95% du budget
  DEFAULT_MONTHLY_BUDGET: 50000 // FCFA
} as const;

// Configuration des timeouts selon le type d'opération
export const OPERATION_TIMEOUTS = {
  QUICK_SCAN: 10000,        // 10 secondes
  STANDARD_ANALYSIS: 30000, // 30 secondes
  DEEP_ANALYSIS: 120000,    // 2 minutes
  IMAGE_GENERATION: 60000,  // 1 minute
  VIDEO_ANALYSIS: 180000    // 3 minutes
} as const;

// Messages d'erreur personnalisés
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'Clé API Gemini 3 manquante. Configurez VITE_GEMINI_3_API_KEY dans .env.local',
  QUOTA_EXCEEDED: 'Quota Gemini 3 dépassé. Attendez quelques minutes ou passez à un plan supérieur.',
  INVALID_REQUEST: 'Requête invalide. Vérifiez les paramètres envoyés.',
  TIMEOUT: 'Délai d\'attente dépassé. Réessayez avec un thinking_level plus bas.',
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion internet.',
  BUDGET_EXCEEDED: 'Budget mensuel dépassé. Augmentez votre limite ou attendez le mois prochain.'
} as const;

// Fonction pour obtenir la configuration depuis les variables d'environnement
export function getConfigFromEnv(): Partial<Gemini3ClientConfig> {
  const apiKey = import.meta.env.VITE_GEMINI_3_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ VITE_GEMINI_3_API_KEY non configurée');
  }
  
  return {
    api_key: apiKey || '',
    api_version: (import.meta.env.VITE_GEMINI_3_API_VERSION as 'v1alpha' | 'v1beta' | 'v1') || 'v1alpha',
    base_url: import.meta.env.VITE_GEMINI_3_BASE_URL || DEFAULT_CONFIG.base_url,
    timeout_ms: parseInt(import.meta.env.VITE_GEMINI_3_TIMEOUT_MS || '120000'),
    default_thinking_level: (import.meta.env.VITE_GEMINI_3_DEFAULT_THINKING_LEVEL as ThinkingLevel) || 'high',
    default_temperature: parseFloat(import.meta.env.VITE_GEMINI_3_DEFAULT_TEMPERATURE || '1.0')
  };
}

// Fonction pour vérifier si les fonctionnalités avancées sont activées
export function isAdvancedFeaturesEnabled(): boolean {
  const enabled = import.meta.env.VITE_ENABLE_ADVANCED_FEATURES;
  return enabled === 'true' || enabled === true;
}

// Fonction pour calculer le coût estimé
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  thinkingLevel: ThinkingLevel = 'high',
  mediaResolution?: MediaResolution
): number {
  let cost = 0;
  
  // Coût des tokens
  const inputCost = (inputTokens / 1000000) * COST_CONFIG.INPUT_TOKEN_PRICE;
  const outputCost = (outputTokens / 1000000) * COST_CONFIG.OUTPUT_TOKEN_PRICE;
  cost = inputCost + outputCost;
  
  // Appliquer multiplicateur thinking_level
  const thinkingMultiplier = COST_CONFIG.THINKING_LEVEL_MULTIPLIERS[thinkingLevel];
  cost *= thinkingMultiplier;
  
  // Appliquer multiplicateur media_resolution si applicable
  if (mediaResolution) {
    const mediaMultiplier = COST_CONFIG.MEDIA_RESOLUTION_MULTIPLIERS[mediaResolution];
    cost *= mediaMultiplier;
  }
  
  return Math.round(cost * 100) / 100; // Arrondir à 2 décimales
}

// Fonction pour obtenir le profil recommandé selon le cas d'usage
export function getRecommendedProfile(useCase: string): typeof CONFIG_PROFILES[keyof typeof CONFIG_PROFILES] {
  const useCaseLower = useCase.toLowerCase();
  
  if (useCaseLower.includes('plan') || useCaseLower.includes('architectural')) {
    return CONFIG_PROFILES.ARCHITECTURAL;
  }
  
  if (useCaseLower.includes('render') || useCaseLower.includes('3d') || useCaseLower.includes('image')) {
    return CONFIG_PROFILES.CREATIVE;
  }
  
  if (useCaseLower.includes('quick') || useCaseLower.includes('scan') || useCaseLower.includes('triage')) {
    return CONFIG_PROFILES.FAST;
  }
  
  if (useCaseLower.includes('precise') || useCaseLower.includes('detailed') || useCaseLower.includes('complex')) {
    return CONFIG_PROFILES.PRECISE;
  }
  
  return CONFIG_PROFILES.BALANCED;
}

export default {
  DEFAULT_CONFIG,
  DEFAULT_RETRY_OPTIONS,
  CONFIG_PROFILES,
  QUOTAS,
  COST_CONFIG,
  BUDGET_ALERTS,
  OPERATION_TIMEOUTS,
  ERROR_MESSAGES,
  getConfigFromEnv,
  isAdvancedFeaturesEnabled,
  estimateCost,
  getRecommendedProfile
};

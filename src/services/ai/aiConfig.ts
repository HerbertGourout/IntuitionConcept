
export interface AIConfig {
  
  provider: 'Service' | 'Modèle' | 'local';
  
  // Clés API (à stocker dans .env)
  ServiceApiKey?: string;
  ModèleApiKey?: string;
  
  // Configuration OCR
  ocr: {
    enhancementEnabled: boolean;
    validateAmounts: boolean;
    mapVendors: boolean;
    correctDates: boolean;
    confidenceThreshold: number;
  };
  
  
  ocrEnhancement: {
    enabled: boolean;
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Configuration génération de devis
  quoteGeneration: {
    enabled: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Configuration détection d'anomalies
  anomalyDetection: {
    enabled: boolean;
    thresholds: {
      budgetOverrun: number; // %
      unusualAmount: number; // FCFA
      frequencyAlert: number; // transactions/jour
    };
  };
  
  // Configuration copilote
  copilot: {
    enabled: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
  };
}

// Configuration par défaut
export const defaultAIConfig: AIConfig = {
  provider: 'Service',
  
  ocr: {
    enhancementEnabled: true,
    validateAmounts: true,
    mapVendors: true,
    correctDates: true,
    confidenceThreshold: 70
  },
  
  ocrEnhancement: {
    enabled: true,
    apiKey: import.meta.env.VITE_Service_API_KEY || '',
    model: 'Modèle-4-vision-preview',
    maxTokens: 1000,
    temperature: 0.1
  },
  
  quoteGeneration: {
    enabled: true, // Activé par défaut si clé API présente
    model: 'Modèle-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.3
  },
  
  anomalyDetection: {
    enabled: true,
    thresholds: {
      budgetOverrun: 20, // 20% de dépassement
      unusualAmount: 1000000, // 1M FCFA
      frequencyAlert: 10 // Plus de 10 transactions/jour
    }
  },
  
  copilot: {
    enabled: true, // Activé par défaut si clé API présente
    model: 'Modèle-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.1,
    systemPrompt: `Tu es un Assistant spécialisé dans la gestion de projets BTP en Afrique.
    Tu aides les utilisateurs avec leurs projets de construction, devis, finances et planning.
    Réponds toujours en français et de manière concise et professionnelle.
    Utilise les unités locales (FCFA, m², etc.) et tiens compte du contexte africain.`
  }
};

// Fonction pour charger la configuration depuis les variables d'environnement
export function loadAIConfigFromEnv(): AIConfig {
  const config = { ...defaultAIConfig };
  
  // Charger les clés API depuis .env
  if (import.meta.env.VITE_Service_API_KEY) {
    config.ServiceApiKey = import.meta.env.VITE_Service_API_KEY;
    config.provider = 'Service';
    config.quoteGeneration.enabled = true;
    config.copilot.enabled = true;
  }
  
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    config.ModèleApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    config.provider = 'Modèle';
    config.quoteGeneration.enabled = true;
    config.copilot.enabled = true;
  }
  
  // Charger les seuils personnalisés
  if (import.meta.env.VITE_AI_BUDGET_THRESHOLD) {
    config.anomalyDetection.thresholds.budgetOverrun = 
      parseInt(import.meta.env.VITE_AI_BUDGET_THRESHOLD);
  }
  
  if (import.meta.env.VITE_AI_AMOUNT_THRESHOLD) {
    config.anomalyDetection.thresholds.unusualAmount = 
      parseInt(import.meta.env.VITE_AI_AMOUNT_THRESHOLD);
  }
  
  return config;
}

// Instance globale de configuration
export const aiConfig = loadAIConfigFromEnv();

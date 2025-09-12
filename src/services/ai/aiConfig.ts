// Configuration centralisée pour tous les services IA
export interface AIConfig {
  // Fournisseur IA principal
  provider: 'openai' | 'claude' | 'local';
  
  // Clés API (à stocker dans .env)
  openaiApiKey?: string;
  claudeApiKey?: string;
  
  // Configuration OCR
  ocr: {
    enhancementEnabled: boolean;
    validateAmounts: boolean;
    mapVendors: boolean;
    correctDates: boolean;
    confidenceThreshold: number;
  };
  
  // Configuration amélioration OCR avec IA
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
  provider: 'openai',
  
  ocr: {
    enhancementEnabled: true,
    validateAmounts: true,
    mapVendors: true,
    correctDates: true,
    confidenceThreshold: 70
  },
  
  ocrEnhancement: {
    enabled: true,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4-vision-preview',
    maxTokens: 1000,
    temperature: 0.1
  },
  
  quoteGeneration: {
    enabled: false, // Désactivé par défaut jusqu'à configuration API
    model: 'gpt-3.5-turbo',
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
    enabled: false, // Désactivé par défaut
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.1,
    systemPrompt: `Tu es un assistant IA spécialisé dans la gestion de projets BTP en Afrique.
    Tu aides les utilisateurs avec leurs projets de construction, devis, finances et planning.
    Réponds toujours en français et de manière concise et professionnelle.
    Utilise les unités locales (FCFA, m², etc.) et tiens compte du contexte africain.`
  }
};

// Fonction pour charger la configuration depuis les variables d'environnement
export function loadAIConfigFromEnv(): AIConfig {
  const config = { ...defaultAIConfig };
  
  // Charger les clés API depuis .env
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    config.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    config.provider = 'openai';
    config.quoteGeneration.enabled = true;
    config.copilot.enabled = true;
  }
  
  if (import.meta.env.VITE_CLAUDE_API_KEY) {
    config.claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    config.provider = 'claude';
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

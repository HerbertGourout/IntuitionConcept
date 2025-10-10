// Configuration centralisée pour le système hybride IA
export const aiConfig = {
  // Legacy OpenAI (Fallback)
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  
  // Hybrid AI System Configuration
  hybrid: {
    enabled: true,
    primaryProvider: import.meta.env.AI_PRIMARY_PROVIDER || 'groq',
    fallbackEnabled: import.meta.env.AI_FALLBACK_ENABLED === 'true',
    costTrackingEnabled: import.meta.env.AI_COST_TRACKING_ENABLED === 'true'
  },
  
  // Groq Configuration
  groq: {
    apiKey: import.meta.env.GROQ_API_KEY || '',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: {
      fast: 'llama3-8b-8192',      // Classification, tâches simples
      balanced: 'llama3-70b-8192', // Génération devis, chat
      precise: 'mixtral-8x7b-32768' // Tâches complexes
    },
    costPerToken: 0.0003 // FCFA
  },
  
  // Anthropic Claude Configuration
  claude: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    // In dev, go through Vite proxy to avoid CORS; in prod, call Anthropic directly
    baseUrl: import.meta.env.DEV ? '/api/anthropic/v1' : 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    version: '2023-06-01',
    costPerToken: 0.0008 // FCFA
  },
  
  // Google Vision Configuration
  googleVision: {
    apiKey: import.meta.env.GOOGLE_VISION_API_KEY || '',
    baseUrl: 'https://vision.googleapis.com/v1',
    costPerRequest: 12 // FCFA
  },
  
  // Configuration pour la génération de devis
  quoteGeneration: {
    enabled: true,
    primaryProvider: 'groq', // Économique
    fallbackProvider: 'openai',
    model: 'llama3-70b-8192',
    temperature: 0.3,
    maxTokens: 3000
  },
  
  // Configuration pour l'OCR intelligent
  ocrAnalysis: {
    enabled: true,
    primaryProvider: 'googleVision', // Précision maximale
    fallbackProvider: 'openai',
    temperature: 0.2,
    maxTokens: 2000
  },
  
  // Configuration pour l'analyse de documents
  documentAnalysis: {
    enabled: true,
    primaryProvider: 'claude', // Excellent pour analyse
    fallbackProvider: 'openai',
    temperature: 0.2,
    maxTokens: 4000
  },
  
  // Configuration pour le chat conversationnel
  conversational: {
    enabled: true,
    primaryProvider: 'groq', // Rapide et économique
    fallbackProvider: 'openai',
    temperature: 0.7,
    maxTokens: 1500
  }
};

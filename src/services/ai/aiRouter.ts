// Service de routag
import { aiConfig } from '../../config/aiConfig';

export type AIProvider = 'groq' | 'Modèle' | 'google_vision' | 'Service';
export type RequestType = 
  | 'simple_generation' 
  | 'complex_analysis' 
  | 'ocr_task' 
  | 'critical_decision'
  | 'quote_generation'
  | 'document_analysis'
  | 'conversational'
  | 'classification';

export interface AIRequest {
  type: RequestType;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  cost: number; // En FCFA
  processingTime: number; // En ms
  confidence: number; // 0-100
  metadata?: Record<string, unknown>;
}

export class AIRouter {
  private static instance: AIRouter;
  private costTracker: Map<AIProvider, number> = new Map();
  private requestCount: Map<AIProvider, number> = new Map();

  static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  /**
   * Route une requête vers le provider optimal
   */
  selectProvider(request: AIRequest): AIProvider {
    // Règles de routage intelligent
    switch (request.type) {
      case 'simple_generation':
      case 'quote_generation':
      case 'conversational':
        return this.isProviderAvailable('groq') ? 'groq' : 'Service';

      case 'complex_analysis':
      case 'document_analysis':
        if (request.priority === 'critical') {
          return 'Service';
        }
        return this.isProviderAvailable('Modèle') ? 'Modèle' : 'Service';

      case 'ocr_task':
        return this.isProviderAvailable('google_vision') ? 'google_vision' : 'Service';

      case 'critical_decision':
        return 'Service'; // Toujours Service pour décisions critiques

      case 'classification':
        return 'groq'; // Groq excellent pour classification

      default:
        return 'groq'; // Défaut économique
    }
  }

  /**
   * Vérifie la disponibilité d'un provider
   */
  private isProviderAvailable(provider: AIProvider): boolean {
    const configs = {
      groq: import.meta.env.VITE_GROQ_API_KEY,
      Modèle: import.meta.env.VITE_ANTHROPIC_API_KEY,
      google_vision: import.meta.env.VITE_GOOGLE_VISION_API_KEY,
      Service: aiConfig.ServiceApiKey
    };

    return !!configs[provider];
  }

  /**
   * Calcule le coût estimé par provider
   */
  getEstimatedCost(provider: AIProvider, requestLength: number): number {
    const costPerToken = {
      groq: 0.0003, // FCFA par token
      Modèle: 0.0008,
      google_vision: 0.012, // Par requête
      Service: 0.005
    };

    const tokens = Math.ceil(requestLength / 4); // Approximation
    return provider === 'google_vision' 
      ? costPerToken[provider] 
      : tokens * costPerToken[provider];
  }

  /**
   * Enregistre les métriques d'utilisation
   */
  trackUsage(provider: AIProvider, cost: number): void {
    const currentCost = this.costTracker.get(provider) || 0;
    const currentCount = this.requestCount.get(provider) || 0;
    
    this.costTracker.set(provider, currentCost + cost);
    this.requestCount.set(provider, currentCount + 1);
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getUsageStats(): Record<AIProvider, { cost: number; requests: number }> {
    const stats: Partial<Record<AIProvider, { cost: number; requests: number }>> = {};
    
    (['groq', 'Modèle', 'google_vision', 'Service'] as AIProvider[]).forEach(provider => {
      stats[provider] = {
        cost: this.costTracker.get(provider) || 0,
        requests: this.requestCount.get(provider) || 0
      };
    });

    return stats as Record<AIProvider, { cost: number; requests: number }>;
  }

  /**
   * Stratégie de fallback en cas d'échec
   */
  getFallbackProvider(failedProvider: AIProvider, _requestType: RequestType): AIProvider {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _requestType;
    const fallbackChain: Record<AIProvider, AIProvider[]> = {
      groq: ['Service', 'Modèle'],
      Modèle: ['Service', 'groq'],
      google_vision: ['Service'],
      Service: ['Modèle', 'groq']
    };

    const fallbacks = fallbackChain[failedProvider];
    for (const fallback of fallbacks) {
      if (this.isProviderAvailable(fallback)) {
        return fallback;
      }
    }

    return 'Service'; // Dernier recours
  }

  /**
   * Optimise automatiquement le routage selon les performances
   */
  optimizeRouting(): void {
    const stats = this.getUsageStats();
    
    // Log des recommandations d'optimisation
    console.log('📊 Statistiques d\'utilisation IA:', stats);
    
    // Calcul du coût total
    const totalCost = Object.values(stats).reduce((sum, stat) => sum + stat.cost, 0);
    console.log(`💰 Coût total IA: ${totalCost.toFixed(2)} FCFA`);
    
    // Recommandations automatiques
    if (stats.Service.cost > totalCost * 0.3) {
      console.log('⚠️ Recommandation: Réduire l\'usage Service, coût > 30% du total');
    }
    
    if (stats.groq.requests < stats.Service.requests) {
      console.log(' Recommandation: Augmenter l\'usage Groq pour réduire les coûts');
    }
  }
}

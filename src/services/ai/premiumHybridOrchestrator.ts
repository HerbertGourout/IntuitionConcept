import { ClaudeService } from './claudeService';

// Types pour les requêtes et réponses
export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface PremiumAIRequest {
  type: 'plan' | 'invoice' | 'contract' | 'market' | 'chat' | 'project' | 'risk' | 'compliance' | 'cost' | 'progress' | 'quote';
  files?: Array<{
    base64: string;
    mimeType: string;
    name: string;
  }>;
  context?: {
    planType?: string;
    [key: string]: unknown;
  };
}

export interface PremiumAIResponse {
  success: boolean;
  content: string;
  provider: string;
  cost: number;
  processingTime: number;
  confidence: number;
  metadata: {
    model?: string;
    usage?: AIUsage;
    supports_pdf?: boolean;
    [key: string]: unknown;
  };
  extractedData?: unknown;
  recommendations?: string[];
  nextActions?: string[];
}

/**
 * Orchestrateur IA Premium - VERSION CLAUDE UNIQUEMENT
 * Analyse des plans architecturaux avec Claude PDF natif seulement
 */
export class PremiumHybridOrchestrator {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  /**
   * Point d'entrée principal pour toutes les requêtes IA
   */
  async processRequest(request: PremiumAIRequest): Promise<PremiumAIResponse> {
    const startTime = Date.now();

    try {
      switch (request.type) {
        case 'plan':
          return await this.analyzePlan(request);
        default:
          return {
            success: false,
            content: `Type de requête non supporté: ${request.type}. Seule l'analyse de plans est disponible avec Claude.`,
            provider: 'none',
            cost: 0,
            processingTime: Date.now() - startTime,
            confidence: 0,
            metadata: {}
          };
      }
    } catch (error) {
      console.error('❌ Erreur PremiumHybridOrchestrator:', error);
      return {
        success: false,
        content: `Erreur lors du traitement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        provider: 'error',
        cost: 0,
        processingTime: Date.now() - startTime,
        confidence: 0,
        metadata: {}
      };
    }
  }

  /**
   * Analyse de plan avec Claude PDF natif UNIQUEMENT
   */
  private async analyzePlan(request: PremiumAIRequest): Promise<PremiumAIResponse> {
    const startTime = Date.now();
    
    if (!request.files?.[0]) {
      throw new Error('Plan requis pour analyse');
    }

    const file = request.files[0];
    const planType = request.context?.planType as string;
    
    // CLAUDE UNIQUEMENT - Tous les autres modèles désactivés
    if (file.mimeType === 'application/pdf' && await this.claudeService.healthCheck()) {
      try {
        console.log('📄 Analyse PDF native avec Claude (modèle unique)...');
        const claudeResponse = await this.claudeService.analyzePlanPDF(file.base64, planType);
        
        return {
          success: true,
          content: claudeResponse.content,
          provider: 'claude-pdf',
          cost: claudeResponse.cost,
          processingTime: Date.now() - startTime,
          confidence: 95,
          metadata: { 
            model: claudeResponse.model,
            usage: claudeResponse.usage,
            supports_pdf: true
          }
        };
      } catch (error) {
        console.error('❌ Erreur Claude PDF:', error);
        return {
          success: false,
          content: `Analyse Claude échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          provider: 'claude-pdf',
          processingTime: Date.now() - startTime,
          confidence: 0,
          cost: 0,
          metadata: {}
        };
      }
    }

    // Si pas de PDF ou Claude indisponible
    return {
      success: false,
      content: 'Claude PDF natif requis. Vérifiez la configuration de la clé API.',
      provider: 'none',
      processingTime: Date.now() - startTime,
      confidence: 0,
      cost: 0,
      metadata: {}
    };
  }

  /**
   * Vérification de l'état des services
   */
  async getServiceStatus() {
    return {
      claude: await this.claudeService.healthCheck(),
      others: 'disabled'
    };
  }
}

// Instance singleton
export const premiumHybridOrchestrator = new PremiumHybridOrchestrator();

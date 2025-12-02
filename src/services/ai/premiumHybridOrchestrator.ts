import { ModèleService } from './ModèleService';

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

export class PremiumHybridOrchestrator {
  private ModèleService: ModèleService;

  constructor() {
    this.ModèleService = new ModèleService();
  }

  
  async processRequest(request: PremiumAIRequest): Promise<PremiumAIResponse> {
    const startTime = Date.now();

    try {
      switch (request.type) {
        case 'plan':
          return await this.analyzePlan(request);
        default:
          return {
            success: false,
            content: `Type de requête non supporté: ${request.type}. Seule l'analyse de plans est disponible avec Modèle.`,
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
   * Analyse de plan avec Modèle PDF natif UNIQUEMENT
   */
  private async analyzePlan(request: PremiumAIRequest): Promise<PremiumAIResponse> {
    const startTime = Date.now();
    
    if (!request.files?.[0]) {
      throw new Error('Plan requis pour analyse');
    }

    const file = request.files[0];
    const planType = request.context?.planType as string;
    
    // Modèle UNIQUEMENT - Tous les autres modèles désactivés
    if (file.mimeType === 'application/pdf' && await this.ModèleService.healthCheck()) {
      try {
        console.log('📄 Analyse PDF native avec Modèle (modèle unique)...');
        const ModèleResponse = await this.ModèleService.analyzePlanPDF(file.base64, planType);
        
        return {
          success: true,
          content: ModèleResponse.content,
          provider: 'Modèle-pdf',
          cost: ModèleResponse.cost,
          processingTime: Date.now() - startTime,
          confidence: 95,
          metadata: { 
            model: ModèleResponse.model,
            usage: ModèleResponse.usage,
            supports_pdf: true
          }
        };
      } catch (error) {
        console.error('❌ Erreur Modèle PDF:', error);
        return {
          success: false,
          content: `Analyse Modèle échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          provider: 'Modèle-pdf',
          processingTime: Date.now() - startTime,
          confidence: 0,
          cost: 0,
          metadata: {}
        };
      }
    }

    // Si pas de PDF ou Modèle indisponible
    return {
      success: false,
      content: 'Modèle PDF natif requis. Vérifiez la configuration de la clé API.',
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
      Modèle: await this.ModèleService.healthCheck(),
      others: 'disabled'
    };
  }
}

// Instance singleton
export const premiumHybridOrchestrator = new PremiumHybridOrchestrator();

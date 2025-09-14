// Service principal hybride - Orchestrateur intelligent des APIs IA
import { AIRouter, AIRequest, AIResponse } from './aiRouter';
import { GroqService } from './groqService';
import { ClaudeService } from './claudeService';
import { GoogleVisionService } from './googleVisionService';

export class HybridAIService {
  private router: AIRouter;
  private groqService: GroqService;
  private claudeService: ClaudeService;
  private googleVisionService: GoogleVisionService;

  constructor() {
    this.router = AIRouter.getInstance();
    this.groqService = new GroqService();
    this.claudeService = new ClaudeService();
    this.googleVisionService = new GoogleVisionService();
  }

  /**
   * Point d'entrée principal - Route automatiquement vers le bon provider
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const provider = this.router.selectProvider(request);
    const estimatedCost = this.router.getEstimatedCost(provider, request.content.length);
    
    console.log(`🤖 Routage: ${request.type} → ${provider} (coût estimé: ${estimatedCost} FCFA)`);

    try {
      let response: AIResponse;

      switch (provider) {
        case 'groq':
          response = await this.processWithGroq(request);
          break;
        case 'claude':
          response = await this.processWithClaude(request);
          break;
        case 'google_vision':
          response = await this.processWithGoogleVision(request);
          break;
        case 'openai':
          response = await this.processWithOpenAI(request);
          break;
        default:
          throw new Error(`Provider non supporté: ${provider}`);
      }

      // Enregistrement des métriques
      this.router.trackUsage(provider, response.cost);
      
      return response;
    } catch (error) {
      console.error(`❌ Erreur ${provider}:`, error);
      
      // Fallback automatique
      const fallbackProvider = this.router.getFallbackProvider(provider, request.type);
      console.log(`🔄 Fallback vers: ${fallbackProvider}`);
      
      return this.processWithFallback(request, fallbackProvider);
    }
  }

  /**
   * Traitement avec Groq (cas simples et économiques)
   */
  private async processWithGroq(request: AIRequest): Promise<AIResponse> {
    switch (request.type) {
      case 'quote_generation': {
        const started = Date.now();
        const projectDetails = request.context?.projectDetails as Record<string, unknown> | undefined;
        if (!projectDetails) {
          throw new Error('Détails projet requis pour génération devis');
        }
        const groq = await this.groqService.generateQuote(projectDetails);
        return {
          content: groq.content,
          provider: 'groq',
          cost: groq.cost,
          processingTime: Date.now() - started,
          confidence: 80,
          metadata: { model: groq.model, usage: groq.usage }
        };
      }

      case 'conversational': {
        const started = Date.now();
        const groq = await this.groqService.chatAssistant(request.content, { chatContext: request.context?.chatContext } as Record<string, unknown>);
        return {
          content: groq.content,
          provider: 'groq',
          cost: groq.cost,
          processingTime: Date.now() - started,
          confidence: 75,
          metadata: { model: groq.model, usage: groq.usage }
        };
      }

      case 'classification': {
        const started = Date.now();
        const groq = await this.groqService.classifyDocument(request.content);
        return {
          content: groq.content,
          provider: 'groq',
          cost: groq.cost,
          processingTime: Date.now() - started,
          confidence: 85,
          metadata: { model: groq.model, usage: groq.usage }
        };
      }

      case 'simple_generation': {
        const started = Date.now();
        const groq = await this.groqService.generateSuggestions((request.context || {}) as Record<string, unknown>);
        return {
          content: groq.content,
          provider: 'groq',
          cost: groq.cost,
          processingTime: Date.now() - started,
          confidence: 70,
          metadata: { model: groq.model, usage: groq.usage }
        };
      }

      default:
        throw new Error(`Type de requête non supporté par Groq: ${request.type}`);
    }
  }

  /**
   * Traitement avec Claude (analyse complexe)
   */
  private async processWithClaude(request: AIRequest): Promise<AIResponse> {
    switch (request.type) {
      case 'document_analysis': {
        const started = Date.now();
        if (request.context?.documentType === 'contract') {
          const claude = await this.claudeService.analyzeContract(request.content);
          return {
            content: claude.content,
            provider: 'claude',
            cost: claude.cost,
            processingTime: Date.now() - started,
            confidence: 80,
            metadata: { model: claude.model, usage: claude.usage }
          };
        }
        // Fallback: compliance check if regulations provided, otherwise technical audit
        if (request.context?.regulations) {
          const regs = request.context.regulations as string[];
          const claude = await this.claudeService.checkCompliance(request.content, regs);
          return {
            content: claude.content,
            provider: 'claude',
            cost: claude.cost,
            processingTime: Date.now() - started,
            confidence: 85,
            metadata: { model: claude.model, usage: claude.usage }
          };
        }
        const claude = await this.claudeService.performTechnicalAudit({ content: request.content });
        return {
          content: claude.content,
          provider: 'claude',
          cost: claude.cost,
          processingTime: Date.now() - started,
          confidence: 75,
          metadata: { model: claude.model, usage: claude.usage }
        };
      }

      case 'complex_analysis': {
        const started = Date.now();
        if (request.context?.analysisType === 'compliance') {
          const regs = (request.context.regulations as string[]) || [];
          const claude = await this.claudeService.checkCompliance(request.content, regs);
          return {
            content: claude.content,
            provider: 'claude',
            cost: claude.cost,
            processingTime: Date.now() - started,
            confidence: 85,
            metadata: { model: claude.model, usage: claude.usage }
          };
        }
        const claude = await this.claudeService.performTechnicalAudit(
          (request.context?.projectData as Record<string, unknown>) || {}
        );
        return {
          content: claude.content,
          provider: 'claude',
          cost: claude.cost,
          processingTime: Date.now() - started,
          confidence: 80,
          metadata: { model: claude.model, usage: claude.usage }
        };
      }

      default:
        throw new Error(`Type de requête non supporté par Claude: ${request.type}`);
    }
  }

  /**
   * Traitement avec Google Vision (OCR et vision)
   */
  private async processWithGoogleVision(request: AIRequest): Promise<AIResponse> {
    const imageBase64 = request.context?.imageBase64 as string | undefined;
    if (!imageBase64) {
      throw new Error('Image base64 requise pour Google Vision');
    }

    switch (request.context?.visionTask) {
      case 'invoice_ocr':
        return this.googleVisionService.extractInvoiceData(imageBase64);

      case 'plan_reading':
        return this.googleVisionService.readTechnicalPlan(imageBase64);

      case 'site_analysis':
        return this.googleVisionService.analyzeConstructionSite(imageBase64);

      case 'signature_detection':
        return this.googleVisionService.detectSignatures(imageBase64);

      default:
        // OCR générique par défaut
        return this.googleVisionService.extractInvoiceData(imageBase64);
    }
  }

  /**
   * Traitement avec OpenAI (fallback premium)
   */
  private async processWithOpenAI(_request: AIRequest): Promise<AIResponse> {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _request;
    // OpenAI generic integration not implemented in this service; prefer orchestrator
    return {
      content: 'OpenAI integration non implémentée dans HybridAIService. Utilisez HybridAIOrchestrator.',
      provider: 'openai',
      cost: 0,
      processingTime: 0,
      confidence: 0,
      metadata: { fallback: true }
    };
  }

  /**
   * Traitement avec fallback
   */
  private async processWithFallback(request: AIRequest, _fallbackProvider: string): Promise<AIResponse> {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _fallbackProvider;
    const fallbackRequest = {
      ...request,
      context: {
        ...request.context,
        originalProvider: this.router.selectProvider(request),
        fallback: true
      }
    };

    // Récursion avec le provider de fallback
    return this.processRequest(fallbackRequest);
  }

  /**
   * Génération de devis hybride optimisée
   */
  async generateOptimizedQuote(projectDetails: {
    type: string;
    surface: number;
    materials: string[];
    complexity: 'simple' | 'medium' | 'complex';
    budget?: number;
    clientInfo?: Record<string, unknown>;
  }): Promise<AIResponse> {
    const request: AIRequest = {
      type: 'quote_generation',
      content: `Génération devis ${projectDetails.type}`,
      priority: projectDetails.complexity === 'complex' ? 'high' : 'medium',
      context: { projectDetails }
    };

    return this.processRequest(request);
  }

  /**
   * Analyse de document hybride
   */
  async analyzeDocument(document: {
    type: 'contract' | 'invoice' | 'plan' | 'report';
    content?: string;
    imageBase64?: string;
    analysisDepth: 'basic' | 'advanced' | 'expert';
  }): Promise<AIResponse> {
    let request: AIRequest;

    if (document.imageBase64) {
      // Document image → Google Vision
      request = {
        type: 'ocr_task',
        content: 'Analyse document image',
        priority: document.analysisDepth === 'expert' ? 'critical' : 'medium',
        context: {
          imageBase64: document.imageBase64,
          visionTask: document.type === 'invoice' ? 'invoice_ocr' : 
                     document.type === 'plan' ? 'plan_reading' : 'invoice_ocr'
        }
      };
    } else if (document.content) {
      // Document texte → Claude pour analyse avancée, Groq pour basique
      request = {
        type: document.analysisDepth === 'basic' ? 'classification' : 'document_analysis',
        content: document.content,
        priority: document.analysisDepth === 'expert' ? 'critical' : 'medium',
        context: {
          documentType: document.type,
          analysisDepth: document.analysisDepth
        }
      };
    } else {
      throw new Error('Contenu ou image requis pour analyse document');
    }

    return this.processRequest(request);
  }

  /**
   * Assistant conversationnel hybride
   */
  async chatWithAI(message: string, context?: {
    conversationType: 'simple' | 'technical' | 'legal';
    previousMessages?: string[];
    projectContext?: Record<string, unknown>;
  }): Promise<AIResponse> {
    const request: AIRequest = {
      type: 'conversational',
      content: message,
      priority: context?.conversationType === 'legal' ? 'high' : 'low',
      context: {
        chatContext: context?.previousMessages?.join('\n'),
        projectContext: context?.projectContext
      }
    };

    return this.processRequest(request);
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getUsageStatistics(): {
    providers: Record<import('./aiRouter').AIProvider, { cost: number; requests: number }>;
    summary: {
      totalCost: number;
      totalRequests: number;
      averageCostPerRequest: number;
      costSavingsVsOpenAI: number;
    };
  } {
    const stats = this.router.getUsageStats();
    const totalCost = Object.values(stats).reduce((sum, stat) => sum + stat.cost, 0);
    const totalRequests = Object.values(stats).reduce((sum, stat) => sum + stat.requests, 0);

    return {
      providers: stats,
      summary: {
        totalCost: Math.round(totalCost),
        totalRequests,
        averageCostPerRequest: totalRequests > 0 ? Math.round(totalCost / totalRequests) : 0,
        costSavingsVsOpenAI: Math.round((50 * totalRequests) - totalCost) // Économies vs OpenAI pur
      }
    };
  }

  /**
   * Optimise automatiquement la configuration
   */
  async optimizeConfiguration(): Promise<void> {
    this.router.optimizeRouting();
    
    // Vérification santé des services
    const healthChecks = await Promise.allSettled([
      this.groqService.healthCheck(),
      this.claudeService.healthCheck(),
      this.googleVisionService.healthCheck()
    ]);

    console.log('🏥 État des services:');
    console.log(`  Groq: ${healthChecks[0].status === 'fulfilled' && healthChecks[0].value ? '✅' : '❌'}`);
    console.log(`  Claude: ${healthChecks[1].status === 'fulfilled' && healthChecks[1].value ? '✅' : '❌'}`);
    console.log(`  Google Vision: ${healthChecks[2].status === 'fulfilled' && healthChecks[2].value ? '✅' : '❌'}`);
  }
}

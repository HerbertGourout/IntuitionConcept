// Orchestrateur hybride IA - Unification des services AI
import { AIRouter, AIRequest, AIResponse } from './aiRouter';
import { GroqService } from './groqService';
import { ClaudeService } from './claudeService';
import { GoogleVisionService } from './googleVisionService';

export interface HybridAIRequest extends AIRequest {
  preferredProvider?: 'groq' | 'claude' | 'google_vision' | 'openai';
  fallbackEnabled?: boolean;
  costOptimization?: boolean;
  qualityThreshold?: number; // 0-100
}

export interface HybridAIResponse extends AIResponse {
  providersUsed: string[];
  fallbackReason?: string;
  costOptimization?: {
    originalCost: number;
    optimizedCost: number;
    savings: number;
  };
}

export interface AIUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageResponseTime: number;
  providerUsage: Record<string, {
    requests: number;
    cost: number;
    averageTime: number;
    successRate: number;
  }>;
}

export class HybridAIOrchestrator {
  private router: AIRouter;
  private groqService: GroqService;
  private claudeService: ClaudeService;
  private googleVisionService: GoogleVisionService;
  private usageMetrics: AIUsageMetrics;

  constructor() {
    this.router = new AIRouter();
    this.groqService = new GroqService();
    this.claudeService = new ClaudeService();
    this.googleVisionService = new GoogleVisionService();
    
    this.usageMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      averageResponseTime: 0,
      providerUsage: {}
    };
  }

  /**
   * Point d'entrée principal pour toutes les requêtes IA
   */
  async processRequest(request: HybridAIRequest): Promise<HybridAIResponse> {
    const startTime = Date.now();
    this.usageMetrics.totalRequests++;

    try {
      // 1. Déterminer le meilleur provider via le router
      const recommendedProvider = this.router.selectProvider(request);
      
      // 2. Exécuter la requête avec fallback si nécessaire
      const response = await this.executeWithFallback(request, recommendedProvider);
      
      // 3. Optimiser les coûts si demandé
      if (request.costOptimization) {
        response.costOptimization = this.calculateCostOptimization(response);
      }

      // 4. Mettre à jour les métriques
      this.updateMetrics(response, Date.now() - startTime);
      
      this.usageMetrics.successfulRequests++;
      
      return response;

    } catch (error) {
      this.usageMetrics.failedRequests++;
      
      return {
        content: `Erreur orchestrateur hybride: ${error}`,
        provider: this.router.selectProvider(request),
        cost: 0,
        processingTime: Date.now() - startTime,
        confidence: 0,
        metadata: {},
        providersUsed: []
      };
    }
  }

  /**
   * Génération de devis avec optimisation multi-provider
   */
  async generateQuote(projectData: Record<string, unknown>): Promise<HybridAIResponse> {
    const request: HybridAIRequest = {
      type: 'quote_generation',
      content: JSON.stringify(projectData),
      priority: 'high',
      context: { projectType: projectData.type },
      preferredProvider: 'groq', // Groq pour rapidité + économie
      fallbackEnabled: true,
      costOptimization: true
    };

    return this.processRequest(request);
  }

  /**
   * Analyse de documents avec Google Vision + Claude
   */
  async analyzeDocument(file: File, analysisType: 'invoice' | 'contract' | 'plan'): Promise<HybridAIResponse> {
    try {
      // 1. OCR avec Google Vision
      let ocrResult: Record<string, unknown>;
      let ocrResponse: AIResponse | null = null;
      if (analysisType === 'invoice') {
        const base64 = await this.fileToBase64(file);
        ocrResponse = await this.googleVisionService.extractInvoiceData(base64);
        ocrResult = JSON.parse(ocrResponse.content);
      } else if (analysisType === 'plan') {
        const base64 = await this.fileToBase64(file);
        ocrResponse = await this.googleVisionService.readTechnicalPlan(base64);
        ocrResult = JSON.parse(ocrResponse.content);
      } else {
        // Fallback OCR générique via orchestrateur
        const base64 = await this.fileToBase64(file);
        const visionRequest: HybridAIRequest = {
          type: 'ocr_task',
          content: base64,
          priority: 'medium'
        };
        const visionResponse = await this.processRequest(visionRequest);
        ocrResponse = visionResponse; // compatible avec AIResponse shape
        ocrResult = JSON.parse(visionResponse.content);
      }

      // 2. Analyse avancée avec Claude si nécessaire
      if (analysisType === 'contract') {
        const rawText = (ocrResult as Record<string, unknown>).rawText;
        const extractedText = (ocrResult as Record<string, unknown>).extractedText;
        const ocrText = typeof rawText === 'string'
          ? rawText
          : typeof extractedText === 'string'
            ? extractedText
            : '';

        const claudeRequest: HybridAIRequest = {
          type: 'document_analysis',
          content: ocrText,
          priority: 'high',
          preferredProvider: 'claude',
          context: { documentType: 'contract', analysisDepth: 'comprehensive' }
        };

        const claudeResponse = await this.processRequest(claudeRequest);
        
        const parsedClaudeData = JSON.parse(claudeResponse.content);
        return {
          ...claudeResponse,
          content: JSON.stringify({
            ...parsedClaudeData,
            ocrResult,
            enhancedAnalysis: parsedClaudeData
          }),
          providersUsed: ['google_vision', 'claude']
        };
      }

      return {
        content: JSON.stringify(ocrResult),
        provider: 'google_vision',
        cost: (ocrResponse && ocrResponse.cost) || 0,
        processingTime: (ocrResponse && ocrResponse.processingTime) || 0,
        confidence: (ocrResponse && ocrResponse.confidence) || 85,
        metadata: { analysisType },
        providersUsed: ['google_vision']
      };

    } catch (error) {
      throw new Error(`Erreur analyse document: ${error}`);
    }
  }

  /**
   * Assistant conversationnel intelligent
   */
  async chatAssistant(message: string, context?: Record<string, unknown>): Promise<HybridAIResponse> {
    // Déterminer le meilleur provider selon le type de question
    let preferredProvider: 'groq' | 'claude' = 'groq';
    
    // Questions complexes -> Claude
    if (message.length > 200 || 
        message.includes('analyse') || 
        message.includes('recommandation') ||
        message.includes('stratégie')) {
      preferredProvider = 'claude';
    }

    const request: HybridAIRequest = {
      type: 'conversational',
      content: message,
      priority: 'medium',
      context,
      preferredProvider,
      fallbackEnabled: true,
      costOptimization: true
    };

    return this.processRequest(request);
  }

  /**
   * Détection d'anomalies budgétaires
   */
  async detectBudgetAnomalies(projectData: Record<string, unknown>): Promise<HybridAIResponse> {
    const request: HybridAIRequest = {
      type: 'complex_analysis',
      content: JSON.stringify(projectData),
      priority: 'high',
      preferredProvider: 'claude', // Claude pour analyse complexe
      context: { analysisType: 'budget', sensitivity: 'high' }
    };

    return this.processRequest(request);
  }

  /**
   * Exécution avec mécanisme de fallback
   */
  private async executeWithFallback(
    request: HybridAIRequest, 
    primaryProvider: string
  ): Promise<HybridAIResponse> {
    const providersUsed: string[] = [];
    let lastError: string = '';

    // Ordre de fallback
    const fallbackChain = this.getFallbackChain(primaryProvider);

    for (const provider of fallbackChain) {
      try {
        providersUsed.push(provider);
        
        const response = await this.executeOnProvider(request, provider);
        
        // Vérifier la qualité si seuil défini
        if (request.qualityThreshold && response.confidence) {
          if (response.confidence < request.qualityThreshold) {
            lastError = `Qualité insuffisante: ${response.confidence}% < ${request.qualityThreshold}%`;
            continue;
          }
        }

        return {
          ...response,
          providersUsed,
          fallbackReason: providersUsed.length > 1 ? lastError : undefined
        };

      } catch (error) {
        lastError = `${provider}: ${error}`;
        
        // Si fallback désactivé, arrêter après le premier échec
        if (!request.fallbackEnabled) {
          break;
        }
      }
    }

    throw new Error(`Tous les providers ont échoué. Dernière erreur: ${lastError}`);
  }

  /**
   * Exécution sur un provider spécifique
   */
  private async executeOnProvider(request: HybridAIRequest, provider: string): Promise<AIResponse> {
    switch (provider) {
      case 'groq':
        return this.executeGroqRequest(request);
      
      case 'claude':
        return this.executeClaudeRequest(request);
      
      case 'google_vision':
        return this.executeVisionRequest(request);
      
      case 'openai':
        // Fallback vers OpenAI existant
        throw new Error('OpenAI fallback non implémenté');
      
      default:
        throw new Error(`Provider inconnu: ${provider}`);
    }
  }

  /**
   * Exécution requête Groq
   */
  private async executeGroqRequest(request: HybridAIRequest): Promise<AIResponse> {
    switch (request.type) {
      case 'quote_generation': {
        const started = Date.now();
        const projectData = JSON.parse(request.content);
        const groq = await this.groqService.generateQuote(projectData);
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
        const groq = await this.groqService.chatAssistant(request.content, request.context);
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
      
      default:
        throw new Error(`Type de requête non supporté par Groq: ${request.type}`);
    }
  }

  /**
   * Exécution requête Claude
   */
  private async executeClaudeRequest(request: HybridAIRequest): Promise<AIResponse> {
    switch (request.type) {
      case 'document_analysis': {
        const started = Date.now();
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
      
      case 'complex_analysis': {
        const started = Date.now();
        const data = JSON.parse(request.content);
        const claude = await this.claudeService.performTechnicalAudit(data);
        return {
          content: claude.content,
          provider: 'claude',
          cost: claude.cost,
          processingTime: Date.now() - started,
          confidence: 85,
          metadata: { model: claude.model, usage: claude.usage }
        };
      }
      
      case 'conversational': {
        // Claude n'a pas de méthode générique dédiée ici; on utilise une analyse textuelle générique
        const started = Date.now();
        const claude = await this.claudeService.analyzeContract(request.content);
        return {
          content: claude.content,
          provider: 'claude',
          cost: claude.cost,
          processingTime: Date.now() - started,
          confidence: 70,
          metadata: { model: claude.model, usage: claude.usage, note: 'generic_text_analysis' }
        };
      }
      
      default:
        throw new Error(`Type de requête non supporté par Claude: ${request.type}`);
    }
  }

  /**
   * Exécution requête Google Vision
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeVisionRequest(_request: HybridAIRequest): Promise<AIResponse> {
    // Google Vision nécessite des fichiers, pas du texte
    throw new Error('Google Vision requiert des fichiers image');
  }

  /**
   * Chaîne de fallback selon le provider principal
   */
  private getFallbackChain(primaryProvider: string): string[] {
    const chains: Record<string, string[]> = {
      'groq': ['groq', 'claude', 'openai'],
      'claude': ['claude', 'groq', 'openai'],
      'google_vision': ['google_vision', 'openai'],
      'openai': ['openai', 'groq', 'claude']
    };

    return chains[primaryProvider] || ['groq', 'claude', 'openai'];
  }

  /**
   * Calcul d'optimisation des coûts
   */
  private calculateCostOptimization(response: AIResponse): {
    originalCost: number;
    optimizedCost: number;
    savings: number;
  } {
    // Estimation de référence avec OpenAI en fonction de la longueur de la réponse
    // Note: approximation basée sur la longueur du contenu de sortie
    const estimatedOpenAICost = this.router.getEstimatedCost('openai', response.content.length);
    
    return {
      originalCost: estimatedOpenAICost,
      optimizedCost: response.cost,
      savings: Math.max(0, estimatedOpenAICost - response.cost)
    };
  }

  /**
   * Mise à jour des métriques d'usage
   */
  private updateMetrics(response: AIResponse, processingTime: number): void {
    this.usageMetrics.totalCost += response.cost;
    this.usageMetrics.averageResponseTime = 
      (this.usageMetrics.averageResponseTime + processingTime) / 2;

    // Métriques par provider
    if (!this.usageMetrics.providerUsage[response.provider]) {
      this.usageMetrics.providerUsage[response.provider] = {
        requests: 0,
        cost: 0,
        averageTime: 0,
        successRate: 0
      };
    }

    const providerStats = this.usageMetrics.providerUsage[response.provider];
    providerStats.requests++;
    providerStats.cost += response.cost;
    providerStats.averageTime = (providerStats.averageTime + processingTime) / 2;
    providerStats.successRate = response.content ? 
      (providerStats.successRate + 1) / 2 : 
      providerStats.successRate / 2;
  }

  /**
   * Conversion File vers Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtenir les métriques d'usage
   */
  getUsageMetrics(): AIUsageMetrics {
    return { ...this.usageMetrics };
  }

  /**
   * Réinitialiser les métriques
   */
  resetMetrics(): void {
    this.usageMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      averageResponseTime: 0,
      providerUsage: {}
    };
  }

  /**
   * Vérification de santé de tous les services
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      results.groq = await this.groqService.healthCheck();
    } catch {
      results.groq = false;
    }

    try {
      results.claude = await this.claudeService.healthCheck();
    } catch {
      results.claude = false;
    }

    try {
      results.googleVision = await this.googleVisionService.healthCheck();
    } catch {
      results.googleVision = false;
    }

    return results;
  }
}

/**
 * Client Gemini 3 avec gestion complète des appels API
 * Support: thinking_level, media_resolution, thought_signatures, tools
 */

import type {
  Gemini3ClientConfig,
  GenerateContentRequest,
  GenerateContentResponse,
  Content,
  ContentPart,
  ThinkingLevel,
  MediaResolution,
  UsageStats,
  Gemini3Error,
  AnalysisMetadata
} from './gemini3Types';

import {
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  COST_CONFIG,
  estimateCost,
  getConfigFromEnv
} from './gemini3Config';

export class Gemini3Client {
  private config: Gemini3ClientConfig;
  private stats: UsageStats;
  private requestCount: number = 0;

  constructor(config?: Partial<Gemini3ClientConfig>) {
    const envConfig = getConfigFromEnv();
    
    this.config = {
      ...DEFAULT_CONFIG,
      ...envConfig,
      ...config
    } as Gemini3ClientConfig;

    if (!this.config.api_key) {
      throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
    }

    this.stats = this.initializeStats();
  }

  /**
   * Initialise les statistiques d'utilisation
   */
  private initializeStats(): UsageStats {
    return {
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      total_tokens: 0,
      total_cost: 0,
      average_latency_ms: 0,
      by_thinking_level: {
        low: { requests: 0, tokens: 0, cost: 0 },
        medium: { requests: 0, tokens: 0, cost: 0 },
        high: { requests: 0, tokens: 0, cost: 0 }
      },
      by_media_resolution: {
        media_resolution_low: { requests: 0, tokens: 0, cost: 0 },
        media_resolution_medium: { requests: 0, tokens: 0, cost: 0 },
        media_resolution_high: { requests: 0, tokens: 0, cost: 0 }
      }
    };
  }

  /**
   * Génère du contenu avec Gemini 3
   */
  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    const startTime = Date.now();
    this.stats.total_requests++;
    this.requestCount++;

    try {
      // Construire l'URL
      const url = `${this.config.base_url}/${this.config.api_version}/models/${request.model}:generateContent`;

      // Préparer les headers
      const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.config.api_key
      };

      // Préparer le body
      const body = {
        contents: Array.isArray(request.contents) ? request.contents : [request.contents],
        generationConfig: request.config || {}
      };

      // Ajouter les outils si présents
      if (request.config?.tools) {
        Object.assign(body, { tools: request.config.tools });
      }

      // Ajouter la config d'image si présente
      if (request.config?.image_config) {
        Object.assign(body.generationConfig, { imageConfig: request.config.image_config });
      }

      console.log('🚀 Gemini 3 Request:', {
        model: request.model,
        thinking_level: request.config?.thinking_level,
        tools: request.config?.tools?.length || 0,
        url
      });

      // Faire la requête avec retry
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error: Gemini3Error = await response.json();
        throw new Error(`Gemini 3 API Error: ${error.message}`);
      }

      const result: GenerateContentResponse = await response.json();

      // Mettre à jour les statistiques
      const latency = Date.now() - startTime;
      this.updateStats(result, latency, request.config?.thinking_level);

      this.stats.successful_requests++;

      console.log('✅ Gemini 3 Response:', {
        candidates: result.candidates?.length || 0,
        tokens: result.usage_metadata?.total_token_count || 0,
        latency: `${latency}ms`
      });

      return result;

    } catch (error) {
      this.stats.failed_requests++;
      console.error('❌ Gemini 3 Error:', error);
      throw error;
    }
  }

  /**
   * Fetch avec retry automatique
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout_ms);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      const maxRetries = this.config.retry_options?.max_retries || 3;
      
      if (retryCount < maxRetries) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`⏳ Retry ${retryCount + 1}/${maxRetries} après ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Calcule le délai de retry avec backoff exponentiel
   */
  private calculateRetryDelay(retryCount: number): number {
    const { initial_delay_ms = 1000, max_delay_ms = 10000, backoff_multiplier = 2 } = 
      this.config.retry_options || {};
    
    const delay = initial_delay_ms * Math.pow(backoff_multiplier, retryCount);
    return Math.min(delay, max_delay_ms);
  }

  /**
   * Met à jour les statistiques d'utilisation
   */
  private updateStats(
    response: GenerateContentResponse,
    latency: number,
    thinkingLevel?: ThinkingLevel
  ): void {
    const tokens = response.usage_metadata?.total_token_count || 0;
    const inputTokens = response.usage_metadata?.prompt_token_count || 0;
    const outputTokens = response.usage_metadata?.candidates_token_count || 0;

    // Calculer le coût
    const cost = estimateCost(inputTokens, outputTokens, thinkingLevel);

    // Mettre à jour les stats globales
    this.stats.total_tokens += tokens;
    this.stats.total_cost += cost;
    this.stats.average_latency_ms = 
      (this.stats.average_latency_ms * (this.stats.total_requests - 1) + latency) / 
      this.stats.total_requests;

    // Mettre à jour les stats par thinking_level
    if (thinkingLevel) {
      this.stats.by_thinking_level[thinkingLevel].requests++;
      this.stats.by_thinking_level[thinkingLevel].tokens += tokens;
      this.stats.by_thinking_level[thinkingLevel].cost += cost;
    }
  }

  /**
   * Extrait le texte de la réponse
   */
  extractText(response: GenerateContentResponse): string {
    if (!response.candidates || response.candidates.length === 0) {
      return '';
    }

    const parts = response.candidates[0].content.parts;
    const textParts = parts
      .filter((part): part is { text: string } => 'text' in part)
      .map(part => part.text);

    return textParts.join('\n');
  }

  /**
   * Extrait la signature de pensée de la réponse
   */
  extractThoughtSignature(response: GenerateContentResponse): string | undefined {
    if (!response.candidates || response.candidates.length === 0) {
      return undefined;
    }

    const parts = response.candidates[0].content.parts;
    const signaturePart = parts.find(
      (part): part is { thought_signature: string } => 'thought_signature' in part
    );

    return signaturePart?.thought_signature;
  }

  /**
   * Extrait les données inline (images) de la réponse
   */
  extractInlineData(response: GenerateContentResponse): Array<{ mime_type: string; data: string }> {
    if (!response.candidates || response.candidates.length === 0) {
      return [];
    }

    const parts = response.candidates[0].content.parts;
    return parts
      .filter((part): part is { inline_data: { mime_type: string; data: string } } => 
        'inline_data' in part
      )
      .map(part => part.inline_data);
  }

  /**
   * Crée des métadonnées d'analyse
   */
  createMetadata(
    response: GenerateContentResponse,
    model: string,
    thinkingLevel: ThinkingLevel,
    mediaResolution?: MediaResolution,
    processingTime?: number
  ): AnalysisMetadata {
    const inputTokens = response.usage_metadata?.prompt_token_count || 0;
    const outputTokens = response.usage_metadata?.candidates_token_count || 0;
    const totalTokens = response.usage_metadata?.total_token_count || 0;
    const cost = estimateCost(inputTokens, outputTokens, thinkingLevel, mediaResolution);

    return {
      model,
      thinking_level: thinkingLevel,
      media_resolution: mediaResolution,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      cost,
      processing_time: processingTime || 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getStats(): UsageStats {
    return { ...this.stats };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = this.initializeStats();
    this.requestCount = 0;
  }

  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    return !!this.config.api_key;
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): Gemini3ClientConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<Gemini3ClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Instance singleton par défaut
let defaultClient: Gemini3Client | null = null;

/**
 * Obtient ou crée l'instance par défaut du client
 */
export function getDefaultClient(): Gemini3Client {
  if (!defaultClient) {
    try {
      defaultClient = new Gemini3Client();
    } catch (error) {
      console.warn('⚠️ Impossible de créer le client Gemini 3 par défaut:', error);
      throw error;
    }
  }
  return defaultClient;
}

/**
 * Réinitialise l'instance par défaut
 */
export function resetDefaultClient(): void {
  defaultClient = null;
}

export default Gemini3Client;

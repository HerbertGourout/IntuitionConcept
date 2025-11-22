/**
 * Types TypeScript pour Gemini 3 API
 * Documentation: https://ai.google.dev/gemini-api/docs/gemini-3
 */

// Niveaux de réflexion
export type ThinkingLevel = 'low' | 'medium' | 'high';

// Résolutions média
export type MediaResolution = 'media_resolution_low' | 'media_resolution_medium' | 'media_resolution_high';

// Tailles d'images
export type ImageSize = '512px' | '768px' | '1024px' | '2K' | '4K' | '8K';

// Ratios d'aspect
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

// Configuration de génération
export interface GenerationConfig {
  thinking_level?: ThinkingLevel;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  response_mime_type?: string;
  response_json_schema?: Record<string, unknown>;
}

// Configuration d'image
export interface ImageConfig {
  aspect_ratio?: AspectRatio;
  image_size?: ImageSize;
  num_images?: number;
}

// Configuration média
export interface MediaResolutionConfig {
  level: MediaResolution;
}

// Partie de contenu (texte)
export interface TextPart {
  text: string;
}

// Partie de contenu (données inline)
export interface InlineDataPart {
  inline_data: {
    mime_type: string;
    data: string; // Base64
  };
  media_resolution?: MediaResolutionConfig;
}

// Partie de contenu (signature de pensée)
export interface ThoughtSignaturePart {
  thought_signature: string;
}

// Partie de contenu (appel de fonction)
export interface FunctionCallPart {
  function_call: {
    name: string;
    args: Record<string, unknown>;
  };
  thought_signature?: string;
}

// Partie de contenu (réponse de fonction)
export interface FunctionResponsePart {
  function_response: {
    name: string;
    response: Record<string, unknown>;
  };
}

// Union de toutes les parties
export type ContentPart = 
  | TextPart 
  | InlineDataPart 
  | ThoughtSignaturePart 
  | FunctionCallPart 
  | FunctionResponsePart;

// Contenu de message
export interface Content {
  role?: 'user' | 'model';
  parts: ContentPart[];
}

// Outils disponibles
export interface GoogleSearchTool {
  google_search: Record<string, never>;
}

export interface UrlContextTool {
  url_context: Record<string, never>;
}

export interface CodeExecutionTool {
  code_execution: Record<string, never>;
}

export type Tool = GoogleSearchTool | UrlContextTool | CodeExecutionTool;

// Requête de génération de contenu
export interface GenerateContentRequest {
  model: string;
  contents: Content | Content[];
  config?: GenerationConfig & {
    tools?: Tool[];
    image_config?: ImageConfig;
  };
}

// Candidat de réponse
export interface Candidate {
  content: Content;
  finish_reason?: string;
  safety_ratings?: Array<{
    category: string;
    probability: string;
  }>;
}

// Usage de tokens
export interface UsageMetadata {
  prompt_token_count: number;
  candidates_token_count: number;
  total_token_count: number;
}

// Réponse de génération de contenu
export interface GenerateContentResponse {
  candidates: Candidate[];
  usage_metadata?: UsageMetadata;
  prompt_feedback?: {
    block_reason?: string;
    safety_ratings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

// Métadonnées d'analyse
export interface AnalysisMetadata {
  model: string;
  thinking_level: ThinkingLevel;
  media_resolution?: MediaResolution;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  processing_time: number;
  timestamp: string;
}

// Résultat d'analyse générique
export interface AnalysisResult<T = unknown> {
  data: T;
  metadata: AnalysisMetadata;
  thought_signature?: string;
  confidence: number;
}

// Erreur Gemini 3
export interface Gemini3Error {
  code: number;
  message: string;
  status: string;
  details?: unknown[];
}

// Options de retry
export interface RetryOptions {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
}

// Configuration du client
export interface Gemini3ClientConfig {
  api_key: string;
  api_version?: 'v1alpha' | 'v1beta' | 'v1';
  base_url?: string;
  timeout_ms?: number;
  retry_options?: RetryOptions;
  default_thinking_level?: ThinkingLevel;
  default_temperature?: number;
}

// Statistiques d'utilisation
export interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_cost: number;
  average_latency_ms: number;
  by_thinking_level: Record<ThinkingLevel, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
  by_media_resolution: Record<MediaResolution, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// Export des constantes
export const GEMINI_3_MODELS = {
  PRO_PREVIEW: 'gemini-3-pro-preview',
  PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview'
} as const;

export const DEFAULT_THINKING_LEVELS: Record<string, ThinkingLevel> = {
  QUICK_SCAN: 'low',
  STANDARD: 'medium',
  DEEP_ANALYSIS: 'high'
} as const;

export const DEFAULT_MEDIA_RESOLUTIONS: Record<string, MediaResolution> = {
  FAST: 'media_resolution_low',
  BALANCED: 'media_resolution_medium',
  PRECISE: 'media_resolution_high'
} as const;

// Pricing (en FCFA par 1M tokens)
export const GEMINI_3_PRICING = {
  INPUT_TOKEN_PRICE: 0.30,  // $0.30/1M tokens
  OUTPUT_TOKEN_PRICE: 1.20, // $1.20/1M tokens
  IMAGE_4K_PRICE: 100       // ~$0.10 per image
} as const;

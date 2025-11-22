/**
 * Export centralisé pour l'infrastructure Gemini 3
 */

// Client
export { Gemini3Client, getDefaultClient, resetDefaultClient } from './gemini3Client';

// Types
export type {
  ThinkingLevel,
  MediaResolution,
  ImageSize,
  AspectRatio,
  GenerationConfig,
  ImageConfig,
  MediaResolutionConfig,
  Content,
  ContentPart,
  TextPart,
  InlineDataPart,
  ThoughtSignaturePart,
  FunctionCallPart,
  FunctionResponsePart,
  Tool,
  GoogleSearchTool,
  UrlContextTool,
  CodeExecutionTool,
  GenerateContentRequest,
  GenerateContentResponse,
  Candidate,
  UsageMetadata,
  AnalysisMetadata,
  AnalysisResult,
  Gemini3Error,
  RetryOptions,
  Gemini3ClientConfig,
  UsageStats
} from './gemini3Types';

export { GEMINI_3_MODELS, DEFAULT_THINKING_LEVELS, DEFAULT_MEDIA_RESOLUTIONS, GEMINI_3_PRICING } from './gemini3Types';

// Configuration
export {
  DEFAULT_CONFIG,
  DEFAULT_RETRY_OPTIONS,
  CONFIG_PROFILES,
  QUOTAS,
  COST_CONFIG,
  BUDGET_ALERTS,
  OPERATION_TIMEOUTS,
  ERROR_MESSAGES,
  getConfigFromEnv,
  isAdvancedFeaturesEnabled,
  estimateCost,
  getRecommendedProfile
} from './gemini3Config';

// Export par défaut
import { Gemini3Client as Client, getDefaultClient as getClient } from './gemini3Client';
export default { Gemini3Client: Client, getDefaultClient: getClient };

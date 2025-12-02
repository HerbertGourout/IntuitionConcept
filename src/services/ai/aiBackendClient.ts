import { apiClient } from '../api/httpClient';

export type BackendAIProvider =
  | 'Service'
  | 'anthropic'
  | 'groq'
  | 'grok'
  | 'gemini'
  | 'google_vision'
  | 'qwen';

export type BackendAIOperation =
  | 'chat_completion'
  | 'image_analysis'
  | 'plan_analysis'
  | 'plan_pdf_analysis'
  | 'progress_comparison'
  | 'visual_report'
  | 'safety_compliance'
  | 'document_project_analysis'
  | 'regulatory_analysis'
  | 'ocr_invoice'
  | 'technical_plan_read'
  | 'construction_site_analysis'
  | 'contract_analysis'
  | 'quote_estimation';

export interface BackendAIGenerateRequest {
  type:
    | 'simple_generation'
    | 'complex_analysis'
    | 'ocr_task'
    | 'critical_decision'
    | 'quote_generation'
    | 'document_analysis'
    | 'conversational'
    | 'classification';
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export interface BackendAIGenerateResponse {
  provider: BackendAIProvider;
  content?: string;
  usage?: unknown;
  raw?: unknown;
  [key: string]: unknown;
}

export interface BackendAIProxyRequest<P extends BackendAIProvider = BackendAIProvider, O extends BackendAIOperation = BackendAIOperation> {
  provider: P;
  operation: O;
  payload: Record<string, unknown>;
}

export interface BackendAIProxyResponse<T = unknown, P extends BackendAIProvider = BackendAIProvider, O extends BackendAIOperation = BackendAIOperation> {
  provider: P;
  operation: O;
  data: T;
}

class AIBackendClient {
  async generate(request: BackendAIGenerateRequest): Promise<BackendAIGenerateResponse> {
    return apiClient.post<BackendAIGenerateResponse>('/ai/generate', {
      priority: 'medium',
      ...request
    });
  }

  async proxy<T = unknown>(request: BackendAIProxyRequest): Promise<BackendAIProxyResponse<T>> {
    return apiClient.post<BackendAIProxyResponse<T>>('/ai/proxy', request);
  }
}

export const aiBackendClient = new AIBackendClient();
export default aiBackendClient;

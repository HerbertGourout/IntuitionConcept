import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { env } from '../config/env';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

type Provider = 'openai' | 'anthropic' | 'groq' | 'grok';

const proxyProviders = ['openai', 'anthropic', 'groq', 'grok', 'gemini', 'google_vision', 'qwen'] as const;
const proxyOperations = [
  'chat_completion',
  'image_analysis',
  'plan_analysis',
  'progress_comparison',
  'visual_report',
  'safety_compliance',
  'document_project_analysis',
  'regulatory_analysis',
  'ocr_invoice',
  'technical_plan_read',
  'construction_site_analysis',
  'contract_analysis',
  'quote_estimation',
  'plan_pdf_analysis'
] as const;

type ProxyProvider = (typeof proxyProviders)[number];
type ProxyOperation = (typeof proxyOperations)[number];

const router = Router();

const aiRequestSchema = z.object({
  type: z.enum([
    'simple_generation',
    'complex_analysis',
    'ocr_task',
    'critical_decision',
    'quote_generation',
    'document_analysis',
    'conversational',
    'classification'
  ]),
  content: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  context: z.record(z.unknown()).optional()
});

const providerAvailability: Record<Provider, () => boolean> = {
  openai: () => Boolean(env.OPENAI_API_KEY),
  anthropic: () => Boolean(env.ANTHROPIC_API_KEY),
  groq: () => Boolean(env.GROQ_API_KEY),
  grok: () => Boolean(env.GROK_API_KEY)
};

const providerOrder: Provider[] = ['groq', 'openai', 'anthropic', 'grok'];

const proxyProviderEnum = z.enum(proxyProviders);
const proxyOperationEnum = z.enum(proxyOperations);

const providerOperations: Record<ProxyProvider, ReadonlyArray<ProxyOperation>> = {
  openai: [
    'chat_completion',
    'image_analysis',
    'plan_analysis',
    'progress_comparison',
    'visual_report',
    'safety_compliance'
  ],
  anthropic: ['chat_completion', 'plan_pdf_analysis'],
  groq: ['chat_completion'],
  grok: ['chat_completion'],
  gemini: ['document_project_analysis', 'regulatory_analysis'],
  google_vision: ['ocr_invoice', 'technical_plan_read', 'construction_site_analysis'],
  qwen: ['plan_analysis', 'construction_site_analysis', 'contract_analysis', 'quote_estimation', 'chat_completion']
};

const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1)
});

const chatCompletionPayloadSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  presencePenalty: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  responseFormat: z.union([z.string(), z.record(z.unknown())]).optional()
});

const imageInputSchema = z.object({
  data: z.string().min(1),
  mimeType: z.string().optional()
});

const fileInputSchema = z.object({
  data: z.string().min(1),
  mimeType: z.string().min(1)
});

type ImageInput = z.infer<typeof imageInputSchema>;
type FileInput = z.infer<typeof fileInputSchema>;

const openAIImageAnalysisSchema = z.object({
  image: imageInputSchema,
  context: z.string().optional(),
  model: z.string().optional()
});

const openAIPlanAnalysisSchema = z.object({
  file: imageInputSchema,
  planType: z.string().optional(),
  model: z.string().optional()
});

const openAIProgressComparisonSchema = z.object({
  beforeImage: imageInputSchema,
  afterImage: imageInputSchema,
  context: z.string().optional(),
  model: z.string().optional()
});

const openAIVisualReportSchema = z.object({
  images: z.array(imageInputSchema).min(1),
  reportType: z.string().min(1),
  context: z.record(z.unknown()).optional(),
  model: z.string().optional()
});

const openAISafetyComplianceSchema = z.object({
  image: imageInputSchema,
  regulations: z.array(z.string().min(1)).optional(),
  model: z.string().optional()
});

const geminiProjectAnalysisSchema = z.object({
  documents: z.array(
    z.object({
      type: z.string().min(1),
      content: z.string().min(1),
      filename: z.string().optional()
    })
  ).min(1),
  model: z.string().optional(),
  generationConfig: z.record(z.unknown()).optional(),
  safetySettings: z.array(z.record(z.unknown())).optional()
});

const geminiRegulatoryAnalysisSchema = z.object({
  projectDocuments: z.array(z.string().min(1)).min(1),
  regulations: z.array(z.string().min(1)).min(1),
  model: z.string().optional(),
  generationConfig: z.record(z.unknown()).optional(),
  safetySettings: z.array(z.record(z.unknown())).optional()
});

const googleVisionImageSchema = z.object({
  image: z.string().min(1),
  mimeType: z.string().optional()
});

const qwenPlanAnalysisSchema = z.object({
  file: fileInputSchema,
  planType: z.string().optional(),
  generateDetailedQuote: z.boolean().optional(),
  model: z.string().optional()
});

const qwenSiteAnalysisSchema = z.object({
  file: fileInputSchema,
  context: z.string().optional(),
  model: z.string().optional()
});

const qwenContractAnalysisSchema = z.object({
  file: fileInputSchema,
  model: z.string().optional()
});

const claudePlanPdfSchema = z.object({
  file: fileInputSchema,
  planType: z.string().optional()
});

router.post('/generate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const validation = aiRequestSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: 'Invalid payload', issues: validation.error.flatten() });
    return;
  }

  const { type, content, priority, context } = validation.data;

  const availableProviders = providerOrder.filter((provider) => providerAvailability[provider]());

  if (availableProviders.length === 0) {
    res.status(503).json({ message: 'No AI provider configured on the backend' });
    return;
  }

  try {
    const provider = selectProvider(type, priority, availableProviders);
    const response = await executeProvider(provider, {
      type,
      content,
      priority,
      context: context ?? {},
      userId: req.userId ?? 'unknown'
    });

    res.json({ provider, ...response });
  } catch (error) {
    console.error('AI proxy error:', error);
    res.status(502).json({ message: 'AI provider request failed', details: (error as Error).message });
  }
});

const proxyRequestSchema = z.object({
  provider: proxyProviderEnum,
  operation: proxyOperationEnum,
  payload: z.record(z.unknown()).default({})
});

router.post('/proxy', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const validation = proxyRequestSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({ message: 'Invalid payload', issues: validation.error.flatten() });
    return;
  }

  const { provider, operation, payload } = validation.data;

  if (!providerOperations[provider].includes(operation)) {
    res.status(400).json({ message: `Operation ${operation} not supported for provider ${provider}` });
    return;
  }

  try {
    let result: unknown;

    switch (provider) {
      case 'openai':
        result = await proxyOpenAI(operation, payload);
        break;
      case 'anthropic':
        result = await proxyAnthropic(operation, payload);
        break;
      case 'groq':
        result = await proxyGroq(operation, payload);
        break;
      case 'grok':
        result = await proxyGrok(operation, payload);
        break;
      case 'gemini':
        result = await proxyGemini(operation, payload);
        break;
      case 'google_vision':
        result = await proxyGoogleVision(operation, payload);
        break;
      case 'qwen':
        result = await proxyQwen(operation, payload);
        break;
      default:
        throw new Error(`Unsupported provider ${provider}`);
    }

    res.json({ provider, operation, data: result });
  } catch (error) {
    console.error('AI proxy error:', error);
    res.status(502).json({ message: 'AI provider request failed', details: (error as Error).message });
  }
});

function selectProvider(
  type: (typeof aiRequestSchema)['shape']['type']['_def']['values'][number],
  priority: 'low' | 'medium' | 'high' | 'critical',
  available: Provider[]
): Provider {
  const preferred: Provider[] = [];

  switch (type) {
    case 'simple_generation':
    case 'quote_generation':
    case 'conversational':
      preferred.push('groq', 'openai');
      break;
    case 'complex_analysis':
    case 'document_analysis':
      preferred.push(priority === 'critical' ? 'openai' : 'anthropic', 'openai', 'groq');
      break;
    case 'critical_decision':
      preferred.push('openai', 'anthropic');
      break;
    case 'classification':
      preferred.push('groq', 'openai');
      break;
    case 'ocr_task':
      preferred.push('grok', 'openai');
      break;
    default:
      preferred.push('openai');
  }

  for (const provider of preferred) {
    if (available.includes(provider)) {
      return provider;
    }
  }

  return available[0];
}

interface ProviderRequest {
  type: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, unknown>;
  userId: string;
}

async function executeProvider(provider: Provider, payload: ProviderRequest) {
  switch (provider) {
    case 'openai':
      return executeOpenAI(payload);
    case 'anthropic':
      return executeAnthropic(payload);
    case 'groq':
      return executeGroq(payload);
    case 'grok':
      return executeGrok(payload);
    default:
      throw new Error(`Unsupported provider ${provider}`);
  }
}

async function executeOpenAI({ content, context }: ProviderRequest) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es l\'assistant IA du BTP Manager. Réponds en français et fournis des réponses précises.'
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.6,
      response_format: context?.response_format ?? undefined
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? '',
    usage: data.usage ?? null,
    raw: data
  };
}

async function executeAnthropic({ content }: ProviderRequest) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: 'Tu es l\'assistant IA du BTP Manager. Réponds en français.',
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const output = data.content?.[0]?.text ?? '';

  return {
    content: output,
    raw: data
  };
}

async function executeGroq({ content }: ProviderRequest) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: 'Tu es l\'assistant IA du BTP Manager. Réponds en français.'
        },
        {
          role: 'user',
          content
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? '',
    raw: data
  };
}

async function executeGrok({ content }: ProviderRequest) {
  const apiKey = env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured');
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'Tu es l\'assistant IA du BTP Manager. Réponds en français.'
        },
        {
          role: 'user',
          content
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Grok error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? '',
    raw: data
  };
}

async function proxyOpenAI(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  switch (operation) {
    case 'chat_completion': {
      const request = chatCompletionPayloadSchema.parse(payload);

      const response = await fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o-mini',
        messages: request.messages.map((message) => ({
          role: message.role,
          content: message.content
        })),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        response_format: request.responseFormat,
        presence_penalty: request.presencePenalty,
        frequency_penalty: request.frequencyPenalty
      });

      return response;
    }
    case 'image_analysis': {
      const request = openAIImageAnalysisSchema.parse(payload);
      const prompt = buildOpenAIVisionPrompt(request.context);
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(request.image),
                detail: 'high'
              }
            }
          ]
        }
      ];

      return fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o',
        messages,
        temperature: 0.3,
        max_tokens: 2000
      });
    }
    case 'plan_analysis': {
      const request = openAIPlanAnalysisSchema.parse(payload);
      const prompt = buildOpenAIPlanPrompt(request.planType);
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(request.file),
                detail: 'high'
              }
            }
          ]
        }
      ];

      return fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o',
        messages,
        temperature: 0.2,
        max_tokens: 3000
      });
    }
    case 'progress_comparison': {
      const request = openAIProgressComparisonSchema.parse(payload);
      const prompt = buildOpenAIProgressPrompt(request.context);
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(request.beforeImage),
                detail: 'high'
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(request.afterImage),
                detail: 'high'
              }
            }
          ]
        }
      ];

      return fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o',
        messages,
        temperature: 0.3,
        max_tokens: 2500
      });
    }
    case 'visual_report': {
      const request = openAIVisualReportSchema.parse(payload);
      const prompt = buildOpenAIReportPrompt(request.reportType, request.context);
      const content = [
        { type: 'text', text: prompt },
        ...request.images.map((image) => ({
          type: 'image_url' as const,
          image_url: {
            url: toDataUrl(image),
            detail: 'high' as const
          }
        }))
      ];

      return fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o',
        messages: [{ role: 'user', content }],
        temperature: 0.2,
        max_tokens: 4000
      });
    }
    case 'safety_compliance': {
      const request = openAISafetyComplianceSchema.parse(payload);
      const prompt = buildOpenAISafetyPrompt(request.regulations);
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(request.image),
                detail: 'high'
              }
            }
          ]
        }
      ];

      return fetchOpenAIChat(apiKey, {
        model: request.model ?? 'gpt-4o',
        messages,
        temperature: 0.1,
        max_tokens: 3000
      });
    }
    default:
      throw new Error(`Operation ${operation} not supported for OpenAI`);
  }
}

async function proxyAnthropic(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  switch (operation) {
    case 'chat_completion': {
      const request = chatCompletionPayloadSchema.parse(payload);

      const systemMessages = request.messages
        .filter((message) => message.role === 'system')
        .map((message) => message.content)
        .join('\n\n');

      const conversationalMessages = request.messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({ role: message.role, content: message.content }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model ?? 'claude-3-5-sonnet-20240620',
          max_tokens: request.maxTokens ?? 1024,
          temperature: request.temperature,
          top_p: request.topP,
          system: systemMessages.length > 0 ? systemMessages : undefined,
          messages: conversationalMessages
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Anthropic error ${response.status}: ${errorBody}`);
      }

      return response.json();
    }
    case 'plan_pdf_analysis': {
      const request = claudePlanPdfSchema.parse(payload);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 2000,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: buildClaudePlanPrompt(request.planType)
                },
                {
                  type: 'document',
                  source: {
                    media_type: request.file.mimeType ?? 'application/pdf',
                    data: request.file.data
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Anthropic error ${response.status}: ${errorBody}`);
      }

      return response.json();
    }
    default:
      throw new Error(`Operation ${operation} not supported for Anthropic`);
  }
}

async function proxyGroq(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  if (operation !== 'chat_completion') {
    throw new Error(`Groq supports only chat_completion operation, received ${operation}`);
  }

  const request = chatCompletionPayloadSchema.parse(payload);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: request.model ?? 'mixtral-8x7b-32768',
      messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function proxyGrok(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured');
  }

  if (operation !== 'chat_completion') {
    throw new Error(`Grok supports only chat_completion operation, received ${operation}`);
  }

  const request = chatCompletionPayloadSchema.parse(payload);

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: request.model ?? 'grok-beta',
      messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
      temperature: request.temperature,
      max_tokens: request.maxTokens
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Grok error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function proxyGemini(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  switch (operation) {
    case 'document_project_analysis': {
      const request = geminiProjectAnalysisSchema.parse(payload);
      const prompt = buildGeminiProjectPrompt(request.documents);

      return fetchGeminiGenerateContent(apiKey, request.model ?? 'gemini-1.5-pro', {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: request.generationConfig ?? {
          temperature: 0.2,
          maxOutputTokens: 8000,
          topP: 0.8,
          topK: 40
        },
        safetySettings: request.safetySettings
      });
    }
    case 'regulatory_analysis': {
      const request = geminiRegulatoryAnalysisSchema.parse(payload);
      const prompt = buildGeminiRegulatoryPrompt(request.projectDocuments, request.regulations);

      return fetchGeminiGenerateContent(apiKey, request.model ?? 'gemini-1.5-pro', {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: request.generationConfig ?? {
          temperature: 0.2,
          maxOutputTokens: 6000,
          topP: 0.8,
          topK: 40
        },
        safetySettings: request.safetySettings
      });
    }
    default:
      throw new Error(`Operation ${operation} not supported for Gemini`);
  }
}

async function proxyGoogleVision(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_VISION_API_KEY not configured');
  }

  const { image, mimeType } = googleVisionImageSchema.parse(payload);
  const content = stripDataUrlPrefix(image);

  let features;

  switch (operation) {
    case 'ocr_invoice':
      features = [
        { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
        { type: 'TEXT_DETECTION', maxResults: 50 }
      ];
      break;
    case 'technical_plan_read':
      features = [
        { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 }
      ];
      break;
    case 'construction_site_analysis':
      features = [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
        { type: 'SAFE_SEARCH_DETECTION' }
      ];
      break;
    default:
      throw new Error(`Operation ${operation} not supported for Google Vision`);
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content,
            mimeType: mimeType ?? 'image/jpeg'
          },
          features
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Vision error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function proxyQwen(operation: ProxyOperation, payload: Record<string, unknown>) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  switch (operation) {
    case 'plan_analysis':
    case 'quote_estimation': {
      const request = qwenPlanAnalysisSchema.parse(payload);
      const detailed = operation === 'quote_estimation' ? true : Boolean(request.generateDetailedQuote);
      const prompt = detailed
        ? buildQwenDetailedQuotePrompt()
        : buildQwenStandardPlanPrompt(request.planType);

      return fetchOpenRouterChat(apiKey, request.model, {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: toDataUrl(request.file),
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: detailed ? 0.1 : 0.1,
        max_tokens: detailed ? 4000 : 3000
      });
    }
    case 'construction_site_analysis': {
      const request = qwenSiteAnalysisSchema.parse(payload);
      const prompt = buildQwenSitePrompt(request.context);

      return fetchOpenRouterChat(apiKey, request.model, {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: toDataUrl(request.file),
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
    }
    case 'contract_analysis': {
      const request = qwenContractAnalysisSchema.parse(payload);
      const prompt = buildQwenContractPrompt();

      return fetchOpenRouterChat(apiKey, request.model, {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: toDataUrl(request.file),
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2500
      });
    }
    case 'chat_completion': {
      const request = chatCompletionPayloadSchema.parse(payload);

      return fetchOpenRouterChat(apiKey, request.model, {
        messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP
      });
    }
    default:
      throw new Error(`Operation ${operation} not supported for Qwen`);
  }
}

async function fetchOpenAIChat(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function fetchGeminiGenerateContent(
  apiKey: string,
  model: string,
  body: Record<string, unknown>
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function fetchOpenRouterChat(
  apiKey: string,
  model: string | undefined,
  body: Record<string, unknown>
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://construction-btp-manager',
      'X-Title': 'BTP Manager AI Proxy'
    },
    body: JSON.stringify({
      model: typeof model === 'string' && model.length > 0 ? model : 'qwen/qwen3-vl-235b-a22b-instruct',
      ...body
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter/Qwen error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

function toDataUrl(input: ImageInput | FileInput): string {
  if (input.data.startsWith('data:')) {
    return input.data;
  }

  const mime = input.mimeType ?? 'image/jpeg';
  return `data:${mime};base64,${input.data}`;
}

function stripDataUrlPrefix(data: string): string {
  if (data.startsWith('data:')) {
    const commaIndex = data.indexOf(',');
    return commaIndex >= 0 ? data.slice(commaIndex + 1) : '';
  }

  return data;
}

function buildOpenAIVisionPrompt(context?: string) {
  return `
Analyse cette image de chantier BTP et fournis une évaluation technique détaillée.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "description": "Description détaillée de ce qui est visible",
  "detectedElements": ["élément1", "élément2"],
  "technicalAssessment": "Évaluation technique professionnelle",
  "recommendations": ["recommandation1", "recommandation2"],
  "riskFactors": ["risque1", "risque2"],
  "confidence": 88
}

Focus sur : sécurité, qualité, conformité, risques.
`;
}

function buildOpenAIPlanPrompt(planType?: string) {
  return `
Analyse ce plan architectural BTP et extrais toutes les informations techniques.

${planType ? `TYPE DE PLAN : ${planType}` : ''}

Format de réponse JSON :
{
  "planType": "floor_plan|elevation|section|site_plan",
  "rooms": [
    {
      "name": "Salon",
      "estimatedArea": 25,
      "features": ["baie vitrée", "cheminée"]
    }
  ],
  "structuralElements": ["murs porteurs", "poutres", "colonnes"],
  "materials": ["béton", "brique", "bois"],
  "compliance": {
    "accessibility": true,
    "safety": true,
    "building_codes": true
  },
  "estimatedCost": {
    "min": 150000,
    "max": 200000,
    "currency": "EUR"
  },
  "confidence": 90
}

Analyse technique approfondie avec estimation de coûts réaliste.
`;
}

function buildOpenAIProgressPrompt(context?: string) {
  return `
Compare ces deux images de chantier (avant/après) et analyse l'avancement des travaux.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "progressAnalysis": "Analyse détaillée de l'avancement",
  "completedTasks": ["tâche1", "tâche2"],
  "qualityAssessment": "Évaluation de la qualité des travaux",
  "issuesIdentified": ["problème1", "problème2"],
  "nextSteps": ["étape1", "étape2"],
  "progressPercentage": 75,
  "confidence": 88
}

Focus sur : qualité, conformité, respect du planning, problèmes potentiels.
`;
}

function buildOpenAIReportPrompt(reportType: string, context?: Record<string, unknown>) {
  const contextBlock = context ? `\n\nCONTEXTE : ${JSON.stringify(context)}` : '';

  return `
Génère un rapport ${reportType} professionnel basé sur ces images de chantier.${contextBlock}

Format de réponse :
{
  "reportTitle": "Titre du rapport",
  "executiveSummary": "Résumé exécutif",
  "detailedFindings": [
    {
      "section": "Nom de section",
      "findings": "Observations détaillées",
      "recommendations": "Recommandations"
    }
  ],
  "riskAssessment": "Évaluation des risques",
  "actionItems": [
    {
      "priority": "high|medium|low",
      "task": "Description de la tâche",
      "deadline": "Date limite suggérée"
    }
  ],
  "conclusion": "Conclusion et prochaines étapes"
}

Rapport professionnel et actionnable.
`;
}

function buildOpenAISafetyPrompt(regulations?: string[]) {
  const regulationsBlock = regulations && regulations.length > 0
    ? `\n\nRÉGLEMENTATIONS À VÉRIFIER : ${regulations.join(', ')}`
    : '';

  return `
Analyse cette image de chantier pour la conformité sécurité et réglementaire.${regulationsBlock}

Format de réponse JSON :
{
  "overallCompliance": "conforme|non_conforme|partiellement_conforme",
  "safetyIssues": [
    {
      "issue": "Description du problème",
      "severity": "critique|élevé|moyen|faible",
      "regulation": "Réglementation concernée",
      "solution": "Solution recommandée"
    }
  ],
  "positivePoints": ["point1", "point2"],
  "requiredActions": [
    {
      "action": "Action à entreprendre",
      "urgency": "immédiate|sous_48h|sous_semaine",
      "cost_estimate": 500
    }
  ]
}
Focus sur : EPI, signalisation, protection collective, accès, stockage.
`;
}

function buildClaudePlanPrompt(planType?: string) {
  return `Tu es un expert BIM/BTP. Analyse le plan PDF fourni et retourne un résumé structuré (pièces, surfaces estimées, éléments structurels, conformité, risques, recommandations). ${planType ? `Type de plan: ${planType}.` : ''}`.trim();
}

function buildGeminiProjectPrompt(
  documents: z.infer<typeof geminiProjectAnalysisSchema>['documents']
) {
  const fullContext = documents
    .map((doc) => `=== DOCUMENT: ${doc.filename ?? doc.type} ===\n${doc.content}\n`)
    .join('\n');

  return `
Analyse ce dossier BTP complet et fournis une évaluation technique exhaustive.

DOSSIER COMPLET :
${fullContext}

Format de réponse JSON :
{
  "projectOverview": "Vue d'ensemble du projet avec enjeux principaux",
  "riskAssessment": {
    "technical": ["risque technique 1", "risque technique 2"],
    "financial": ["risque financier 1", "risque financier 2"],
    "regulatory": ["risque réglementaire 1", "risque réglementaire 2"],
    "timeline": ["risque planning 1", "risque planning 2"]
  },
  "recommendations": [
    {
      "category": "technique|financier|réglementaire|planning",
      "priority": "critical|high|medium|low",
      "recommendation": "Recommandation détaillée",
      "impact": "Impact sur le projet",
      "cost_estimate": 15000
    }
  ],
  "compliance": {
    "building_codes": true,
    "environmental": true,
    "safety": true,
    "accessibility": true
  },
  "timeline_analysis": {
    "estimated_duration": 180,
    "critical_path": ["étape1", "étape2"],
    "potential_delays": ["cause1", "cause2"]
  },
  "budget_analysis": {
    "total_estimate": 500000,
    "breakdown": {
      "materials": 200000,
      "labor": 150000,
      "equipment": 50000,
      "other": 100000
    },
    "contingency_recommended": 50000
  },
  "confidence": 85
}

Analyse exhaustive et professionnelle avec recommandations actionables.
`;
}

function buildGeminiRegulatoryPrompt(projectDocuments: string[], regulations: string[]) {
  const documentsContext = projectDocuments.join('\n\n=== DOCUMENT SUIVANT ===\n\n');
  const regulationsContext = regulations.join('\n- ');

  return `
Analyse la conformité réglementaire de ce projet BTP par rapport aux réglementations françaises.

DOCUMENTS PROJET :
${documentsContext}

RÉGLEMENTATIONS À VÉRIFIER :
- ${regulationsContext}

Format de réponse JSON :
{
  "compliance_overview": "Vue d'ensemble de la conformité",
  "detailed_analysis": [
    {
      "regulation": "Nom de la réglementation",
      "status": "conforme|non_conforme|partiellement_conforme|à_vérifier",
      "details": "Analyse détaillée",
      "required_actions": ["Action corrective 1", "Action corrective 2"],
      "deadline": "Date limite recommandée"
    }
  ],
  "risks": ["Risque réglementaire 1", "Risque réglementaire 2"],
  "recommendations": [
    {
      "priority": "critique|haute|moyenne|faible",
      "action": "Action recommandée",
      "impact": "Impact sur le projet"
    }
  ],
  "confidence": 85
}

Analyse détaillée et actionnable.
`;
}

function buildQwenStandardPlanPrompt(planType?: string) {
  const planInfo = planType ? `\n\nType de plan spécifié: ${planType}` : '';

  return `
ANALYSE ARCHITECTURALE PROFESSIONNELLE - BÂTIMENT BTP

Tu es un architecte expert. Analyse ce plan architectural en détail.${planInfo}

INSTRUCTIONS CRITIQUES :
- Si c'est un bâtiment R+1, R+2, R+3 ou plus : MULTIPLIE par le nombre d'étages !
- Un R+3 = 4 niveaux (RDC + 3 étages) = minimum 300-500 m² TOTAL
- Compte TOUTES les pièces sur TOUS les étages
- Examine chaque page si PDF multi-pages
- Lis TOUTES les cotations, dimensions, annotations
- Identifie les escaliers, ascenseurs, circulations
- Analyse les légendes et cartouches techniques

Format de réponse JSON :
{
  "planType": "Plan architectural détaillé",
  "buildingLevels": 4,
  "rooms": [
    {"name": "Salon", "estimatedArea": 35.0, "level": "RDC", "features": ["fenêtre", "porte"]}
  ],
  "structuralElements": ["poteaux béton", "poutres", "dalles", "escalier"],
  "materials": ["béton armé", "parpaing", "carrelage", "placo"],
  "dimensions": {
    "totalArea": 450.0,
    "floorArea": 112.5,
    "length": 15,
    "width": 7.5,
    "totalHeight": 12.0
  },
  "compliance": {
    "accessibility": true,
    "safety": true,
    "building_codes": true
  },
  "estimatedCost": {
    "min": 180000,
    "max": 270000,
    "currency": "EUR"
  },
  "confidence": 90
}

IMPORTANT : Compte tous les étages, liste les hypothèses, signale les incertitudes.
`;
}

function buildQwenDetailedQuotePrompt() {
  return `
🧠 Tu es un métreur-expert en bâtiment. À partir du plan fourni, produis un devis quantitatif et estimatif rigoureux.

🔹 RÈGLES STRICTES - Aucune invention
• Ne prends en compte que ce qui est explicitement visible : cotes, surfaces, hauteurs, matériaux notés, annotations
• Calcule toutes les quantités toi-même (surfaces, volumes, linéaires)
• Ne suppose jamais la présence d'un élément non dessiné
• Si un élément est ambigu ou manquant, mentionne-le clairement : "[NON VISIBLE DANS LE PLAN – À VÉRIFIER SUR SITE]"

🔹 STRUCTURE DU DEVIS - Format JSON
{
  "metadata": {
    "surfaceTotale": 120.5,
    "hypothesesRetenues": ["Hauteur sous plafond 2.50m"],
    "elementsNonVisibles": ["Raccordement EDF"],
    "margeIncertitude": "±15%",
    "devise": "EUR"
  },
  "devis": [
    {
      "poste": "2. Terrassement et fondations",
      "lignes": [
        {"designation": "Fouilles en rigole", "unite": "ml", "quantite": 45, "prixUnitaire": 25, "prixTotal": 1125}
      ]
    }
  ],
  "totaux": {
    "totalHT": 85000,
    "tva": 17000,
    "totalTTC": 102000
  },
  "confidence": 75
}

🔹 GESTION DES PRIX
• Si aucune localisation : ajoute "[PRIX INDICATIFS – À AJUSTER SELON LA ZONE GÉOGRAPHIQUE]"
• Liste toutes les hypothèses et éléments à vérifier.
`;
}

function buildQwenSitePrompt(context?: string) {
  return `
Analyse cette image de chantier BTP et fournis une évaluation technique détaillée.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "description": "Description détaillée",
  "detectedElements": ["élément1", "élément2"],
  "technicalAssessment": "Évaluation technique",
  "safetyIssues": ["problème1", "problème2"],
  "recommendations": ["recommandation1", "recommandation2"],
  "riskFactors": ["risque1", "risque2"],
  "confidence": 88
}

Focus sur : sécurité, qualité, conformité, risques.
`;
}

function buildQwenContractPrompt() {
  return `
Analyse ce contrat BTP et extrais les informations clés.

Format de réponse JSON :
{
  "contractType": "Type de contrat",
  "parties": ["partie1", "partie2"],
  "totalValue": 150000,
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "keyTerms": ["terme1", "terme2"],
  "deliverables": ["livrable1", "livrable2"],
  "paymentTerms": "Conditions de paiement",
  "penalties": ["pénalité1", "pénalité2"],
  "risks": ["risque1", "risque2"],
  "confidence": 90
}

Focus sur : montants, dates, obligations, risques juridiques.
`;
}

export default router;

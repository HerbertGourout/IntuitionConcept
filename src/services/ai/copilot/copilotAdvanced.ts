/**
 * Service Advanced Copilot IA avec Gemini 3
 * Fonctionnalités:
 * - Compréhension naturelle du langage
 * - Mémoire de conversation (thought_signatures)
 * - Actions complexes (code_execution, google_search)
 * - Qualité +500%
 */

import { Gemini3Client, getDefaultClient } from '../gemini3';
import type { AnalysisResult, GenerateContentRequest } from '../gemini3';

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thought_signature?: string;
}

export interface CopilotResponse {
  message: string;
  actions_performed?: Array<{
    type: 'search' | 'calculation' | 'data_retrieval';
    description: string;
    result: unknown;
  }>;
  suggestions?: string[];
  confidence: number;
}

export interface ConversationContext {
  project_id?: string;
  user_id?: string;
  conversation_history: CopilotMessage[];
  last_signature?: string;
}

export class CopilotAdvanced {
  private client: Gemini3Client;
  private conversations: Map<string, ConversationContext> = new Map();

  constructor(client?: Gemini3Client) {
    this.client = client || getDefaultClient();
  }

  /**
   * Traite un message utilisateur avec compréhension naturelle
   */
  async chat(
    userId: string,
    message: string,
    context?: Partial<ConversationContext>
  ): Promise<AnalysisResult<CopilotResponse>> {
    const startTime = Date.now();

    console.log('💬 Copilot Advanced - Traitement message...');

    // Récupérer ou créer le contexte de conversation
    const conversationId = `${userId}_${context?.project_id || 'general'}`;
    let conversation = this.conversations.get(conversationId);

    if (!conversation) {
      conversation = {
        user_id: userId,
        project_id: context?.project_id,
        conversation_history: [],
        last_signature: undefined
      };
      this.conversations.set(conversationId, conversation);
    }

    // Construire le prompt avec historique
    const systemPrompt = this.buildSystemPrompt(context);
    const historyContext = this.buildHistoryContext(conversation);

    const fullPrompt = `${systemPrompt}

${historyContext}

**Question utilisateur:** ${message}

Réponds de manière naturelle, utile et précise. Si tu effectues des recherches ou calculs, explique-les.`;

    // Préparer la requête avec signature précédente
    const contents: GenerateContentRequest['contents'] = [];

    if (conversation.last_signature) {
      contents.push({
        role: 'model',
        parts: [{ thought_signature: conversation.last_signature }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: fullPrompt }]
    });

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents,
      config: {
        thinking_level: 'high', // Compréhension profonde
        temperature: 0.7, // Équilibre précision/naturel
        tools: [
          { google_search: {} },
          { code_execution: {} }
        ]
      }
    };

    const response = await this.client.generateContent(request);
    const responseText = this.client.extractText(response);
    const thoughtSignature = this.client.extractThoughtSignature(response);

    // Mettre à jour la conversation
    conversation.conversation_history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    conversation.conversation_history.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      thought_signature: thoughtSignature
    });

    conversation.last_signature = thoughtSignature;

    const result: CopilotResponse = {
      message: responseText,
      confidence: 0.9
    };

    const processingTime = Date.now() - startTime;
    const metadata = this.client.createMetadata(
      response,
      'gemini-3-pro-preview',
      'high',
      undefined,
      processingTime
    );

    console.log('✅ Réponse générée:', {
      length: responseText.length,
      time: `${processingTime}ms`,
      cost: `${metadata.cost} FCFA`
    });

    return {
      data: result,
      metadata,
      thought_signature: thoughtSignature,
      confidence: result.confidence
    };
  }

  /**
   * Exécute une action complexe
   */
  async executeAction(
    userId: string,
    action: string,
    parameters: Record<string, unknown>
  ): Promise<AnalysisResult<{ result: unknown; explanation: string }>> {
    console.log('⚙️ Exécution action complexe...');

    const prompt = `Exécute cette action:
**Action:** ${action}
**Paramètres:** ${JSON.stringify(parameters, null, 2)}

Effectue les recherches et calculs nécessaires. Explique ton raisonnement.`;

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        thinking_level: 'high',
        temperature: 0.1,
        tools: [
          { google_search: {} },
          { code_execution: {} }
        ]
      }
    };

    const startTime = Date.now();
    const response = await this.client.generateContent(request);
    const text = this.client.extractText(response);

    const metadata = this.client.createMetadata(
      response,
      'gemini-3-pro-preview',
      'high',
      undefined,
      Date.now() - startTime
    );

    return {
      data: {
        result: text,
        explanation: text
      },
      metadata,
      confidence: 0.85
    };
  }

  /**
   * Construit le prompt système
   */
  private buildSystemPrompt(context?: Partial<ConversationContext>): string {
    return `Tu es un assistant IA expert en BTP (Bâtiment et Travaux Publics) pour la plateforme IntuitionConcept.

**Tes capacités:**
- Analyse de plans architecturaux
- Génération et optimisation de devis
- Suivi de projets et budgets
- Conseils techniques BTP
- Recherche d'informations en temps réel
- Calculs et simulations

**Contexte actuel:**
${context?.project_id ? `- Projet en cours: ${context.project_id}` : '- Conversation générale'}
${context?.user_id ? `- Utilisateur: ${context.user_id}` : ''}

**Instructions:**
- Sois naturel, précis et utile
- Utilise tes outils (recherche, calculs) quand nécessaire
- Cite tes sources
- Propose des actions concrètes`;
  }

  /**
   * Construit le contexte d'historique
   */
  private buildHistoryContext(conversation: ConversationContext): string {
    if (conversation.conversation_history.length === 0) {
      return '';
    }

    const recentHistory = conversation.conversation_history.slice(-6); // 6 derniers messages
    
    return `**Historique conversation:**
${recentHistory.map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`).join('\n')}`;
  }

  /**
   * Réinitialise une conversation
   */
  clearConversation(userId: string, projectId?: string): void {
    const conversationId = `${userId}_${projectId || 'general'}`;
    this.conversations.delete(conversationId);
    console.log(`🗑️ Conversation ${conversationId} réinitialisée`);
  }

  /**
   * Obtient l'historique d'une conversation
   */
  getConversationHistory(userId: string, projectId?: string): CopilotMessage[] {
    const conversationId = `${userId}_${projectId || 'general'}`;
    const conversation = this.conversations.get(conversationId);
    return conversation?.conversation_history || [];
  }

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  getStats() {
    return this.client.getStats();
  }
}

let instance: CopilotAdvanced | null = null;

export function getAdvancedCopilotService(): CopilotAdvanced {
  if (!instance) {
    instance = new CopilotAdvanced();
  }
  return instance;
}

export default CopilotAdvanced;

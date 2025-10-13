// Service Anthropic Claude - Analyse documentaire avancée
import { aiBackendClient } from './aiBackendClient';

// Types de réponse minimaux pour l'API Claude messages
interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  model?: string;
  usage?: AnthropicUsage;
}

export interface ClaudeRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: Record<string, unknown>;
}

export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  cost: number; // En FCFA
}

export class ClaudeService {
  private readonly defaultModel = 'claude-3-5-sonnet-20240620';

  /**
   * Vérifie la santé du service Claude
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await aiBackendClient.proxy({
        provider: 'anthropic',
        operation: 'chat_completion',
        payload: {
          messages: [
            { role: 'user', content: 'test' }
          ]
        }
      });

      return Boolean(response?.data);
    } catch (error) {
      console.error('❌ Claude health check failed:', error);
      return false;
    }
  }

  /**
   * Analyse native d'un plan PDF avec Claude (document attaché)
   */
  async analyzePlanPDF(pdfBase64: string, planType?: string): Promise<ClaudeResponse> {
    const data = await this.callPlanPdf({
      file: {
        data: pdfBase64,
        mimeType: 'application/pdf'
      },
      planType
    });

    const contentBlocks: AnthropicContentBlock[] = Array.isArray(data?.content)
      ? data.content
      : [];

    const textContent = contentBlocks.find((block) => typeof block.text === 'string')?.text
      ?? contentBlocks[0]?.text
      ?? '';

    const usage = data?.usage ?? {};
    const inputTokens = usage.input_tokens ?? 0;
    const outputTokens = usage.output_tokens ?? 0;
    const totalTokens = inputTokens + outputTokens;
    const cost = calculateClaudeCost(totalTokens);

    return {
      content: textContent || '',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens
      },
      model: data?.model || this.defaultModel,
      cost
    };
  }

  /**
   * Analyse de contrats BTP avancée
   */
  async analyzeContract(contractText: string): Promise<ClaudeResponse> {
    const prompt = `
Analysez ce contrat BTP de manière approfondie:

${contractText}

Fournissez une analyse structurée incluant:
1. PARTIES CONTRACTUELLES
   - Identité du maître d'ouvrage
   - Identité de l'entrepreneur
   - Autres intervenants

2. OBJET DU CONTRAT
   - Nature des travaux
   - Localisation du chantier
   - Spécifications techniques principales

3. ASPECTS FINANCIERS
   - Montant total du contrat
   - Modalités de paiement
   - Révisions de prix prévues
   - Pénalités et bonus

4. PLANNING ET DÉLAIS
   - Date de commencement
   - Durée d'exécution
   - Jalons importants
   - Pénalités de retard

5. RISQUES IDENTIFIÉS
   - Clauses défavorables
   - Ambiguïtés contractuelles
   - Risques financiers
   - Risques techniques

6. RECOMMANDATIONS
   - Points à négocier
   - Clauses à clarifier
   - Mesures de protection

Format: JSON structuré avec sections clairement définies.
`;

    return this.makeRequest({
      prompt,
      maxTokens: 4000,
      temperature: 0.2
    });
  }

  /**
   * Vérification de conformité réglementaire
   */
  async checkCompliance(documentText: string, regulations: string[]): Promise<ClaudeResponse> {
    const prompt = `
Vérifiez la conformité de ce document BTP aux réglementations:

DOCUMENT À ANALYSER:
${documentText}

RÉGLEMENTATIONS À VÉRIFIER:
${regulations.join('\n- ')}

Fournissez un rapport de conformité avec:
1. CONFORMITÉ GLOBALE (Score sur 100)
2. POINTS CONFORMES
   - Liste des exigences respectées
3. NON-CONFORMITÉS DÉTECTÉES
   - Description précise
   - Gravité (Critique/Majeure/Mineure)
   - Article réglementaire concerné
4. ACTIONS CORRECTIVES
   - Modifications nécessaires
   - Priorité d'intervention
5. RECOMMANDATIONS
   - Bonnes pratiques
   - Améliorations suggérées

Format: JSON structuré avec scoring détaillé.
`;

    return this.makeRequest({
      prompt,
      maxTokens: 3500,
      temperature: 0.1
    });
  }

  /**
   * Audit technique de projet BTP
   */
  async performTechnicalAudit(projectData: Record<string, unknown>): Promise<ClaudeResponse> {
    const prompt = `
Réalisez un audit technique complet de ce projet BTP:

DONNÉES PROJET:
${JSON.stringify(projectData, null, 2)}

Fournissez un rapport d'audit incluant:
1. ANALYSE TECHNIQUE
   - Faisabilité du projet
   - Cohérence des spécifications
   - Adéquation moyens/objectifs

2. ÉVALUATION DES RISQUES
   - Risques techniques identifiés
   - Probabilité d'occurrence
   - Impact potentiel
   - Mesures de mitigation

3. OPTIMISATIONS POSSIBLES
   - Améliorations techniques
   - Économies potentielles
   - Gains de performance

4. RECOMMANDATIONS PRIORITAIRES
   - Actions immédiates
   - Améliorations à moyen terme
   - Stratégie long terme

5. SCORE GLOBAL
   - Note technique sur 100
   - Justification du scoring

Format: JSON avec sections détaillées et scoring.
`;

    return this.makeRequest({
      prompt,
      maxTokens: 4000,
      temperature: 0.3
    });
  }

  /**
   * Requête générique vers l'API Claude
   */
  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    try {
      const data = await this.callChat({
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: request.maxTokens || 3000,
        temperature: request.temperature || 0.2
      });
      const usage = data.usage || {};
      const totalTokens = (usage.input_tokens || 0) + (usage.output_tokens || 0);
      const cost = calculateClaudeCost(totalTokens);

      return {
        content: data.content?.[0]?.text || '',
        usage: {
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          totalTokens
        },
        model: data.model || this.defaultModel,
        cost
      };

    } catch (error) {
      console.error('❌ Erreur Claude Service:', error);
      throw error;
    }
  }

  private async callChat(payload: Record<string, unknown>): Promise<AnthropicResponse> {
    const response = await aiBackendClient.proxy<AnthropicResponse>({
      provider: 'anthropic',
      operation: 'chat_completion',
      payload
    });

    return response.data;
  }

  private async callPlanPdf(payload: Record<string, unknown>): Promise<AnthropicResponse> {
    const response = await aiBackendClient.proxy<AnthropicResponse>({
      provider: 'anthropic',
      operation: 'plan_pdf_analysis',
      payload
    });

    return response.data;
  }
}

function calculateClaudeCost(totalTokens: number): number {
  // Align cost with backend configuration (fallback value)
  const costPerToken = 0.00002;
  return totalTokens * costPerToken;
}

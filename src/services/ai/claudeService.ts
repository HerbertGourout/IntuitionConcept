// Service Anthropic Claude - Analyse documentaire avancée
import { aiConfig } from '../../config/aiConfig';

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
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = aiConfig.claude.apiKey;
    this.baseUrl = aiConfig.claude.baseUrl;
    this.model = aiConfig.claude.model;
    
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Claude manquante. Service désactivé.');
    }
  }

  /**
   * Vérifie la santé du service Claude
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      // Test simple avec requête minimale
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': aiConfig.claude.version
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Claude health check failed:', error);
      return false;
    }
  }

  /**
   * Analyse native d'un plan PDF avec Claude (document attaché)
   */
  async analyzePlanPDF(pdfBase64: string, planType?: string): Promise<ClaudeResponse> {
    if (!this.apiKey) throw new Error('Clé API Claude manquante');

    const url = `${this.baseUrl}/messages`;

    const systemPrompt = `Tu es un expert BIM/BTP. Analyse le plan PDF fourni et retourne un résumé structuré (pièces, surfaces estimées, éléments structurels, conformité, risques, recommandations). ${planType ? `Type de plan: ${planType}.` : ''}`.trim();

    const body = {
      model: this.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'document',
              source: { media_type: 'application/pdf', data: pdfBase64 }
            }
          ]
        }
      ]
    } as unknown as Record<string, unknown>;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': aiConfig.claude.version
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Claude API error: 401 Unauthorized - vérifiez la clé API.');
      }
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data: AnthropicResponse = await response.json();

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
    const cost = totalTokens * aiConfig.claude.costPerToken;

    return {
      content: textContent || '',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens
      },
      model: data?.model || this.model,
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
    if (!this.apiKey) {
      throw new Error('Clé API Claude manquante');
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': aiConfig.claude.version
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens || 3000,
          temperature: request.temperature || 0.2,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const usage = data.usage || {};
      const totalTokens = (usage.input_tokens || 0) + (usage.output_tokens || 0);
      const cost = totalTokens * aiConfig.claude.costPerToken;

      return {
        content: data.content[0]?.text || '',
        usage: {
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          totalTokens
        },
        model: data.model,
        cost
      };

    } catch (error) {
      console.error('❌ Erreur Claude Service:', error);
      throw error;
    }
  }
}

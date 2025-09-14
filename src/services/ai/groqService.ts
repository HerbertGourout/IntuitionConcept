// Service Groq API - Provider principal économique
import { aiConfig } from '../../config/aiConfig';

export interface GroqRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
}

export interface GroqResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  cost: number; // En FCFA
}

export class GroqService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = aiConfig.groq.apiKey;
    this.baseUrl = aiConfig.groq.baseUrl;
    
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Groq manquante. Service désactivé.');
    }
  }

  /**
   * Vérifie la santé du service Groq
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await this.makeRequest({
        prompt: 'Test de connectivité',
        model: aiConfig.groq.models.fast,
        maxTokens: 10
      });
      return !!response.content;
    } catch (error) {
      console.error('❌ Groq health check failed:', error);
      return false;
    }
  }

  /**
   * Génération de devis BTP rapide et économique
   */
  async generateQuote(projectData: Record<string, unknown>): Promise<GroqResponse> {
    const prompt = `
En tant qu'expert BTP, générez un devis détaillé pour ce projet:

Projet: ${projectData.type || 'Non spécifié'}
Surface: ${projectData.surface || 'Non spécifiée'}
Localisation: ${projectData.location || 'Non spécifiée'}
Spécifications: ${JSON.stringify(projectData.specifications || {})}

Générez un devis structuré avec:
1. Liste des matériaux avec quantités et prix
2. Main d'œuvre par phase
3. Délais d'exécution
4. Total HT/TTC

Format de sortie en JSON structuré.
`;

    return this.makeRequest({
      prompt,
      model: aiConfig.groq.models.balanced,
      temperature: 0.3,
      maxTokens: 3000
    });
  }

  /**
   * Assistant conversationnel rapide
   */
  async chatAssistant(message: string, context?: Record<string, unknown>): Promise<GroqResponse> {
    const prompt = `
Vous êtes un assistant BTP expert. Répondez de manière professionnelle et précise.

Contexte: ${context ? JSON.stringify(context) : 'Aucun'}
Question: ${message}

Réponse:
`;

    return this.makeRequest({
      prompt,
      model: aiConfig.groq.models.balanced,
      temperature: 0.7,
      maxTokens: 1500
    });
  }

  /**
   * Classification de documents BTP
   */
  async classifyDocument(text: string): Promise<GroqResponse> {
    const prompt = `
Classifiez ce document BTP parmi ces catégories:
- FACTURE
- DEVIS
- CONTRAT
- PLAN_TECHNIQUE
- RAPPORT_CHANTIER
- BON_COMMANDE
- AUTRE

Texte à classifier:
${text.substring(0, 1000)}

Répondez uniquement par la catégorie en majuscules.
`;

    return this.makeRequest({
      prompt,
      model: aiConfig.groq.models.fast,
      temperature: 0.1,
      maxTokens: 50
    });
  }

  /**
   * Génération de suggestions d'amélioration
   */
  async generateSuggestions(projectData: Record<string, unknown>): Promise<GroqResponse> {
    const prompt = `
Analysez ce projet BTP et proposez 5 suggestions d'amélioration:

Données projet: ${JSON.stringify(projectData)}

Suggestions pour:
1. Optimisation des coûts
2. Amélioration de la qualité
3. Réduction des délais
4. Sécurité du chantier
5. Durabilité environnementale

Format: Liste numérotée avec justification courte.
`;

    return this.makeRequest({
      prompt,
      model: aiConfig.groq.models.balanced,
      temperature: 0.5,
      maxTokens: 2000
    });
  }

  /**
   * Requête générique vers l'API Groq
   */
  private async makeRequest(request: GroqRequest): Promise<GroqResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Groq manquante');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model || aiConfig.groq.models.balanced,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const usage = data.usage || { total_tokens: 0 };
      const cost = usage.total_tokens * aiConfig.groq.costPerToken;

      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0
        },
        model: data.model,
        cost
      };

    } catch (error) {
      console.error('❌ Erreur Groq Service:', error);
      throw error;
    }
  }
}

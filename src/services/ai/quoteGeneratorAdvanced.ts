/**
 * Service Advanced de génération de devis avec Gemini 3
 * Fonctionnalités:
 * - Prix matériaux temps réel via Google Search
 * - Optimisation temporelle (meilleur moment d'achat)
 * - Sortie structurée garantie (response_json_schema)
 * - Économie 15-20% pour clients
 */

import { Gemini3Client, getDefaultClient } from './gemini3';
import type {
  AnalysisResult,
  GenerateContentRequest
} from './gemini3';
import type { ArchitecturalAnalysis } from '../../types/architecturalAnalysis';

// Types pour le devis advanced
export interface MaterialPriceInfo {
  material: string;
  current_price: number;
  unit: string;
  supplier: string;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  delivery_time_days: number;
  price_trend: 'rising' | 'stable' | 'falling';
  price_history_30d: Array<{
    date: string;
    price: number;
  }>;
  best_purchase_date?: string;
  estimated_savings?: number;
}

export interface QuotePhase {
  name: string;
  description: string;
  items: Array<{
    designation: string;
    unit: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    material_info?: MaterialPriceInfo;
    alternative_suppliers?: Array<{
      supplier: string;
      price: number;
      delivery_time_days: number;
    }>;
  }>;
  subtotal: number;
  optimal_start_date?: string;
  weather_considerations?: string[];
}

export interface AdvancedQuote {
  id: string;
  title: string;
  client_name: string;
  project_location: string;
  phases: QuotePhase[];
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  validity_days: number;
  generated_at: string;
  market_analysis: {
    total_potential_savings: number;
    optimal_purchase_timeline: string;
    market_conditions: 'favorable' | 'neutral' | 'unfavorable';
    recommendations: string[];
  };
  confidence: number;
}

export interface QuoteGenerationOptions {
  location: string; // Pour recherche prix locaux
  include_market_analysis?: boolean;
  include_alternatives?: boolean;
  budget_constraint?: number;
  timeline_constraint_days?: number;
  previous_signature?: string;
}

export class QuoteGeneratorAdvanced {
  private client: Gemini3Client;

  constructor(client?: Gemini3Client) {
    this.client = client || getDefaultClient();
  }

  /**
   * Génère un devis avec prix temps réel
   */
  async generateQuote(
    analysis: ArchitecturalAnalysis,
    options: QuoteGenerationOptions
  ): Promise<AnalysisResult<AdvancedQuote>> {
    const startTime = Date.now();

    console.log('💰 Génération devis avec prix temps réel...');

    // Étape 1: Recherche prix matériaux
    const materialPrices = options.include_market_analysis 
      ? await this.fetchMarketPrices(analysis, options.location)
      : null;

    // Étape 2: Générer le devis
    const prompt = this.buildQuotePrompt(analysis, options, materialPrices);

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        thinking_level: 'high', // Précision pour calculs
        temperature: 0.1,
        response_mime_type: 'application/json',
        response_json_schema: this.getQuoteSchema(),
        tools: options.include_market_analysis ? [
          { google_search: {} },
          { url_context: {} }
        ] : undefined
      }
    };

    // Ajouter signature précédente si fournie
    if (options.previous_signature) {
      request.contents = [
        {
          role: 'model',
          parts: [{ thought_signature: options.previous_signature }]
        },
        request.contents
      ];
    }

    const response = await this.client.generateContent(request);
    const text = this.client.extractText(response);
    const thoughtSignature = this.client.extractThoughtSignature(response);
    
    const quote: AdvancedQuote = JSON.parse(text);

    const processingTime = Date.now() - startTime;
    const metadata = this.client.createMetadata(
      response,
      'gemini-3-pro-preview',
      'high',
      undefined,
      processingTime
    );

    console.log('✅ Devis généré:', {
      phases: quote.phases.length,
      total: `${quote.total} ${quote.currency}`,
      savings: quote.market_analysis?.total_potential_savings || 0,
      time: `${processingTime}ms`,
      cost: `${metadata.cost} FCFA`
    });

    return {
      data: quote,
      metadata,
      thought_signature: thoughtSignature,
      confidence: quote.confidence
    };
  }

  /**
   * Recherche les prix du marché en temps réel
   */
  private async fetchMarketPrices(
    analysis: ArchitecturalAnalysis,
    location: string
  ): Promise<Record<string, MaterialPriceInfo>> {
    console.log(`🔍 Recherche prix matériaux à ${location}...`);

    // Extraire les matériaux de l'analyse
    const materials = analysis.materials?.map(m => m.type) || [];
    
    if (materials.length === 0) {
      return {};
    }

    const prompt = `Recherche les prix actuels des matériaux BTP suivants à ${location}:
${materials.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Pour chaque matériau, fournis:
- Prix actuel (FCFA)
- Unité
- Fournisseur principal
- Disponibilité
- Délai livraison
- Tendance prix (hausse/stable/baisse)

Réponds en JSON structuré.`;

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        thinking_level: 'low', // Rapide pour recherche
        temperature: 0.1,
        response_mime_type: 'application/json',
        tools: [
          { google_search: {} },
          { url_context: {} }
        ]
      }
    };

    const response = await this.client.generateContent(request);
    const text = this.client.extractText(response);
    
    return JSON.parse(text);
  }

  /**
   * Construit le prompt de génération de devis
   */
  private buildQuotePrompt(
    analysis: ArchitecturalAnalysis,
    options: QuoteGenerationOptions,
    marketPrices: Record<string, MaterialPriceInfo> | null
  ): string {
    let prompt = `# GÉNÉRATION DEVIS BTP DÉTAILLÉ

## PROJET
- Localisation: ${options.location}
- Surface totale: ${analysis.measurements?.totalArea || 0} m²
- Étages: ${analysis.measurements?.floors?.length || 1}
- Pièces: ${analysis.measurements?.rooms?.length || 0}

## ANALYSE ARCHITECTURALE
${JSON.stringify(analysis, null, 2)}
`;

    if (marketPrices) {
      prompt += `\n## PRIX MARCHÉ ACTUELS
${JSON.stringify(marketPrices, null, 2)}

**IMPORTANT**: Utilise ces prix du marché pour calculer le devis. Identifie les opportunités d'économies.
`;
    }

    if (options.budget_constraint) {
      prompt += `\n## CONTRAINTE BUDGET
Budget maximum: ${options.budget_constraint} FCFA
Optimise le devis pour respecter ce budget tout en maintenant la qualité.
`;
    }

    if (options.timeline_constraint_days) {
      prompt += `\n## CONTRAINTE DÉLAI
Délai maximum: ${options.timeline_constraint_days} jours
Propose un planning optimisé selon la météo et les disponibilités matériaux.
`;
    }

    prompt += `\n## INSTRUCTIONS
1. Génère un devis détaillé en 13 phases BTP standard
2. Calcule les quantités précises selon l'analyse
3. Utilise les prix du marché si fournis, sinon estime les prix moyens ${options.location}
4. Identifie les opportunités d'économies (meilleur moment d'achat, fournisseurs alternatifs)
5. Fournis des recommandations d'optimisation

## PHASES BTP STANDARD
1. Installation de chantier
2. Terrassement et fondations
3. Gros œuvre (maçonnerie)
4. Charpente et couverture
5. Menuiseries extérieures
6. Plomberie
7. Électricité
8. Isolation
9. Cloisons et doublages
10. Revêtements sols
11. Revêtements murs
12. Menuiseries intérieures
13. Finitions et nettoyage

Réponds UNIQUEMENT en JSON selon le schéma fourni.`;

    return prompt;
  }

  /**
   * Schéma JSON pour la sortie structurée
   */
  private getQuoteSchema(): Record<string, unknown> {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        client_name: { type: 'string' },
        project_location: { type: 'string' },
        phases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    designation: { type: 'string' },
                    unit: { type: 'string' },
                    quantity: { type: 'number' },
                    unit_price: { type: 'number' },
                    total_price: { type: 'number' }
                  },
                  required: ['designation', 'unit', 'quantity', 'unit_price', 'total_price']
                }
              },
              subtotal: { type: 'number' }
            },
            required: ['name', 'description', 'items', 'subtotal']
          }
        },
        subtotal: { type: 'number' },
        taxes: { type: 'number' },
        total: { type: 'number' },
        currency: { type: 'string' },
        validity_days: { type: 'number' },
        generated_at: { type: 'string' },
        market_analysis: {
          type: 'object',
          properties: {
            total_potential_savings: { type: 'number' },
            optimal_purchase_timeline: { type: 'string' },
            market_conditions: { 
              type: 'string',
              enum: ['favorable', 'neutral', 'unfavorable']
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['total_potential_savings', 'market_conditions', 'recommendations']
        },
        confidence: { type: 'number' }
      },
      required: ['id', 'title', 'phases', 'subtotal', 'taxes', 'total', 'currency', 'confidence']
    };
  }

  /**
   * Optimise un devis existant
   */
  async optimizeQuote(
    quote: AdvancedQuote,
    optimization_goals: string[],
    previous_signature?: string
  ): Promise<AnalysisResult<AdvancedQuote>> {
    console.log('⚡ Optimisation devis...');

    const prompt = `Optimise ce devis selon les objectifs suivants:
${optimization_goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Devis actuel:
${JSON.stringify(quote, null, 2)}

Fournis un devis optimisé avec:
- Économies réalisées
- Alternatives proposées
- Justification des changements`;

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: previous_signature ? [
        {
          role: 'model',
          parts: [{ thought_signature: previous_signature }]
        },
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ] : {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        thinking_level: 'high',
        temperature: 0.1,
        response_mime_type: 'application/json',
        response_json_schema: this.getQuoteSchema(),
        tools: [
          { google_search: {} },
          { code_execution: {} } // Pour calculs d'optimisation
        ]
      }
    };

    const startTime = Date.now();
    const response = await this.client.generateContent(request);
    const text = this.client.extractText(response);
    const thoughtSignature = this.client.extractThoughtSignature(response);
    
    const optimizedQuote: AdvancedQuote = JSON.parse(text);

    const metadata = this.client.createMetadata(
      response,
      'gemini-3-pro-preview',
      'high',
      undefined,
      Date.now() - startTime
    );

    return {
      data: optimizedQuote,
      metadata,
      thought_signature: thoughtSignature,
      confidence: optimizedQuote.confidence
    };
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getStats() {
    return this.client.getStats();
  }
}

// Instance singleton
let instance: QuoteGeneratorAdvanced | null = null;

export function getAdvancedQuoteService(): QuoteGeneratorAdvanced {
  if (!instance) {
    instance = new QuoteGeneratorAdvanced();
  }
  return instance;
}

export default QuoteGeneratorAdvanced;

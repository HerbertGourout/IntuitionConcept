/**
 * Service Advanced OCR avec Gemini 3
 * Fonctionnalités:
 * - Résolution adaptative automatique
 * - Validation temps réel via Google Search
 * - Enrichissement automatique fournisseurs
 * - Économie 90%
 */

import { Gemini3Client, getDefaultClient } from '../gemini3';
import type { AnalysisResult, GenerateContentRequest, MediaResolution } from '../gemini3';

export interface OCRResult {
  vendor_name: string;
  vendor_address?: string;
  vendor_phone?: string;
  vendor_email?: string;
  vendor_website?: string;
  document_type: 'invoice' | 'quote' | 'delivery_note' | 'receipt';
  document_number: string;
  document_date: string;
  total_amount: number;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  validation: {
    vendor_exists: boolean;
    prices_coherent: boolean;
    anomalies: string[];
  };
  enrichment: {
    vendor_reputation?: number;
    vendor_payment_terms?: string;
    market_price_comparison?: Record<string, number>;
  };
  confidence: number;
}

export class SmartOcrStrategyAdvanced {
  private client: Gemini3Client;

  constructor(client?: Gemini3Client) {
    this.client = client || getDefaultClient();
  }

  /**
   * Extrait et valide un document avec OCR intelligent
   */
  async extractAndValidate(
    documentImage: string, // Base64
    validate: boolean = true
  ): Promise<AnalysisResult<OCRResult>> {
    const startTime = Date.now();

    console.log('📄 OCR Advanced avec validation temps réel...');

    // Étape 1: Détection qualité document
    const mediaResolution = await this.detectDocumentQuality(documentImage);

    console.log(`🎯 Résolution adaptée: ${mediaResolution}`);

    // Étape 2: Extraction OCR
    const extractionPrompt = `Extrait TOUTES les informations de ce document:

1. Informations fournisseur (nom, adresse, téléphone, email, site web)
2. Type de document
3. Numéro et date
4. Montant total et devise
5. Liste détaillée des articles/services

Réponds en JSON structuré.`;

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [
          { text: extractionPrompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: documentImage
            },
            media_resolution: { level: mediaResolution }
          }
        ]
      },
      config: {
        thinking_level: 'low', // Rapide pour OCR
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    };

    const response = await this.client.generateContent(request);
    const text = this.client.extractText(response);
    const extracted = JSON.parse(text);

    // Étape 3: Validation si demandée
    let validation = {
      vendor_exists: true,
      prices_coherent: true,
      anomalies: [] as string[]
    };

    let enrichment = {};

    if (validate) {
      const validationResult = await this.validateExtraction(extracted);
      validation = validationResult.validation;
      enrichment = validationResult.enrichment;
    }

    const result: OCRResult = {
      ...extracted,
      validation,
      enrichment
    };

    const processingTime = Date.now() - startTime;
    const metadata = this.client.createMetadata(
      response,
      'gemini-3-pro-preview',
      'low',
      mediaResolution,
      processingTime
    );

    console.log('✅ OCR terminé:', {
      vendor: result.vendor_name,
      amount: `${result.total_amount} ${result.currency}`,
      valid: validation.vendor_exists && validation.prices_coherent,
      time: `${processingTime}ms`,
      cost: `${metadata.cost} FCFA`
    });

    return {
      data: result,
      metadata,
      confidence: result.confidence
    };
  }

  /**
   * Détecte la qualité du document pour choisir la résolution
   */
  private async detectDocumentQuality(documentImage: string): Promise<MediaResolution> {
    // Quick scan pour détecter qualité
    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [
          { text: 'Ce document est-il: 1=clair et net, 2=qualité moyenne, 3=flou/manuscrit? Réponds juste le chiffre.' },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: documentImage
            },
            media_resolution: { level: 'media_resolution_low' }
          }
        ]
      },
      config: {
        thinking_level: 'low',
        temperature: 0
      }
    };

    const response = await this.client.generateContent(request);
    const quality = parseInt(this.client.extractText(response));

    if (quality === 1) return 'media_resolution_low'; // Clair = rapide
    if (quality === 2) return 'media_resolution_medium';
    return 'media_resolution_high'; // Flou = précision max
  }

  /**
   * Valide l'extraction via Google Search
   */
  private async validateExtraction(extracted: Partial<OCRResult>): Promise<{
    validation: OCRResult['validation'];
    enrichment: OCRResult['enrichment'];
  }> {
    console.log('🔍 Validation via Google Search...');

    const validationPrompt = `Vérifie ces informations extraites d'un document:

Fournisseur: ${extracted.vendor_name}
Montant total: ${extracted.total_amount} ${extracted.currency}
Articles: ${JSON.stringify(extracted.items)}

Recherche et vérifie:
1. Le fournisseur existe-t-il? (nom, adresse, contact)
2. Les prix sont-ils cohérents avec le marché?
3. Y a-t-il des anomalies?

Enrichis avec:
- Réputation fournisseur
- Conditions de paiement habituelles
- Comparaison prix marché

Réponds en JSON.`;

    const request: GenerateContentRequest = {
      model: 'gemini-3-pro-preview',
      contents: {
        role: 'user',
        parts: [{ text: validationPrompt }]
      },
      config: {
        thinking_level: 'low',
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

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  getStats() {
    return this.client.getStats();
  }
}

let instance: SmartOcrStrategyAdvanced | null = null;

export function getAdvancedOCRService(): SmartOcrStrategyAdvanced {
  if (!instance) {
    instance = new SmartOcrStrategyAdvanced();
  }
  return instance;
}

export default SmartOcrStrategyAdvanced;

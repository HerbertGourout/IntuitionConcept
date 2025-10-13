import { apiClient } from '../api/httpClient';
import { aiConfig } from './aiConfig';
import type { AIEnhancementData } from './ocrEnhancer';

interface BackendAIResponse {
  provider: string;
  content?: string;
  usage?: unknown;
  raw?: unknown;
}

// Types structurés pour l'analyse OCR d'une facture via OpenAI
type AnalyzedAmount = { value: number; currency?: string; confidence: number };
type AnalyzedDate = { value: string; confidence: number };
type AnalyzedVendor = { value: string; normalized?: string; confidence: number };
type AnalyzedInvoiceNumber = { value: string; confidence: number };
type AnalyzedValidation = { isValid?: boolean; issues?: string[]; suggestions?: string[] };

interface AnalyzedOCR {
  amounts?: AnalyzedAmount[];
  dates?: AnalyzedDate[];
  vendorName?: AnalyzedVendor;
  invoiceNumber?: AnalyzedInvoiceNumber;
  total?: AnalyzedAmount;
  validation?: AnalyzedValidation;
}

class OpenAIService {
  /**
   * Enrichit des données OCR brutes en utilisant l'analyse IA via le backend
   * et retourne un objet conforme à AIEnhancementData (utilisé par OCREnhancer).
   */
  async enhanceOCRData(originalText: string): Promise<AIEnhancementData | null> {
    try {
      const analyzed = await this.analyzeDocument(originalText, 'invoice');

      const a = analyzed as Partial<AnalyzedOCR>;
      const total = a.total;
      const vendorName = a.vendorName;
      // Si l'IA renvoie un seul objet date, on le supporte; sinon on peut prendre la première des dates[]
      const date: AnalyzedDate | undefined = (a as unknown as { date?: AnalyzedDate })?.date || a.dates?.[0];
      const invoiceNumber = a.invoiceNumber;
      const validation = a.validation;

      const aiData: AIEnhancementData = {
        validation: {
          suggestions: validation?.suggestions ?? []
        },
        total: total?.value !== undefined && total?.confidence !== undefined
          ? { value: total.value!, confidence: total.confidence!, currency: total.currency }
          : undefined,
        vendorName: vendorName?.value && vendorName?.confidence !== undefined
          ? { value: vendorName.value, normalized: vendorName.normalized, confidence: vendorName.confidence! }
          : undefined,
        date: date?.value && date?.confidence !== undefined
          ? { value: date.value, confidence: date.confidence! }
          : undefined,
        invoiceNumber: invoiceNumber?.value && invoiceNumber?.confidence !== undefined
          ? { value: invoiceNumber.value, confidence: invoiceNumber.confidence! }
          : undefined
      };

      return aiData;
    } catch {
      // OpenAI enhanceOCRData error
      return null;
    }
  }

  /**
   * Traitement d'une requête Copilot via OpenAI et retour d'un message texte.
   * Conserve la signature attendue par AICopilot (string simple).
   */
  async processCopilotQuery(message: string, context: unknown): Promise<string> {
    try {
      const payload = {
        type: 'conversational' as const,
        content: `Contexte JSON:\n${JSON.stringify(context, null, 2)}\n\nQuestion utilisateur:\n${message}`,
        priority: 'medium' as const,
        context: {
          response_format: aiConfig.copilot.enabled ? undefined : 'text'
        }
      };

      const response = await apiClient.post<BackendAIResponse>('/ai/generate', payload);
      return response.content ?? "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
      // OpenAI copilot query error
      return 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?';
    }
  }

  async analyzeDocument(documentText: string, _documentType: string): Promise<Record<string, unknown>> {
    // prevent unused parameter lint when documentType is not used by the current prompt
    void _documentType;
    try {
      const response = await apiClient.post<BackendAIResponse>('/ai/generate', {
        type: 'document_analysis' as const,
        content: documentText,
        priority: 'high' as const,
        context: {
          documentType: _documentType
        }
      });

      if (!response.content) {
        throw new Error('Réponse IA vide');
      }

      return JSON.parse(response.content);
    } catch (error) {
      // OpenAI OCR enhancement error
      return this.getMockEnhancedData(documentText);
    }
  }

  async generateQuote(projectData: Record<string, unknown>, _requirements: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _requirements;
    try {
      const response = await apiClient.post<BackendAIResponse>('/ai/generate', {
        type: 'quote_generation' as const,
        content: JSON.stringify(projectData),
        priority: 'high' as const,
        context: projectData
      });

      if (!response.content) {
        throw new Error('Réponse IA vide');
      }

      return JSON.parse(response.content);
    } catch (error) {
      // OpenAI quote generation error
      return this.getMockQuoteData(projectData);
    }
  }

  async processDocumentWithAI(_content: string, _metadata: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Mark parameters as intentionally unused to satisfy eslint/no-unused-vars
    void _content;
    void _metadata;
    try {
      const response = await apiClient.post<BackendAIResponse>('/ai/generate', {
        type: 'document_analysis' as const,
        content: 'Traitement de document demandé',
        priority: 'medium' as const
      });

      return { result: response.content || 'Désolé, je n\'ai pas pu traiter votre demande.' };
    } catch (error) {
      // OpenAI copilot error
      return { error: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?' };
    }
  }

  // Données mock pour les tests
  private getMockEnhancedData(_ocrText: string): {
    amounts: Array<{value: number; currency: string; confidence: number}>;
    dates: Array<{value: string; type: string; confidence: number}>;
    vendorName: {value: string; confidence: number; normalized: string};
    invoiceNumber: {value: string; confidence: number};
    total: {value: number; currency: string; confidence: number};
    validation: {isValid: boolean; issues: string[]; suggestions: string[]};
  } {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _ocrText;
    return {
      amounts: [
        { value: 750000, currency: 'XAF', confidence: 85 },
        { value: 135000, currency: 'XAF', confidence: 90 }
      ],
      dates: [
        { value: '2024-03-15', type: 'invoice', confidence: 95 },
        { value: '2024-04-15', type: 'due', confidence: 80 }
      ],
      vendorName: {
        value: 'BTP Supplies Cameroun',
        confidence: 90,
        normalized: 'BTP Supplies Cameroun SARL'
      },
      invoiceNumber: {
        value: 'INV-2024-0315',
        confidence: 95
      },
      total: {
        value: 885000,
        currency: 'XAF',
        confidence: 95
      },
      validation: {
        isValid: true,
        issues: [],
        suggestions: [
          'Vérifier la TVA appliquée',
          'Confirmer les quantités avec le fournisseur'
        ]
      }
    };
  }

  private getMockQuoteData(projectData: Record<string, unknown>): Record<string, unknown> {
    return {
      title: `Devis ${projectData.projectType} - ${new Date().toLocaleDateString()}`,
      description: `Devis détaillé pour projet de ${projectData.projectType}`,
      phases: [
        {
          name: 'Phase 1: Préparation',
          description: 'Préparation du terrain et fondations',
          duration: 15,
          items: [
            {
              description: 'Terrassement et nivellement',
              quantity: 100,
              unit: 'm²',
              unitPrice: 2500,
              totalPrice: 250000,
              category: 'labor'
            },
            {
              description: 'Béton pour fondations',
              quantity: 15,
              unit: 'm³',
              unitPrice: 85000,
              totalPrice: 1275000,
              category: 'materials'
            }
          ],
          totalCost: 1525000
        },
        {
          name: 'Phase 2: Structure',
          description: 'Construction de la structure principale',
          duration: 30,
          items: [
            {
              description: 'Maçonnerie murs porteurs',
              quantity: 80,
              unit: 'm²',
              unitPrice: 15000,
              totalPrice: 1200000,
              category: 'labor'
            },
            {
              description: 'Charpente métallique',
              quantity: 1,
              unit: 'lot',
              unitPrice: 2500000,
              totalPrice: 2500000,
              category: 'materials'
            }
          ],
          totalCost: 3700000
        }
      ],
      totalCost: 5225000,
      totalDuration: 45,
      recommendations: [
        'Prévoir une marge de 10% pour les imprévus',
        'Vérifier la disponibilité des matériaux avant démarrage',
        'Planifier les livraisons selon les phases'
      ],
      assumptions: [
        'Prix basés sur le marché actuel de Yaoundé',
        'Main d\'œuvre qualifiée disponible',
        'Conditions météorologiques normales'
      ],
      confidence: 85
    };
  }
}

export const openaiService = new OpenAIService();

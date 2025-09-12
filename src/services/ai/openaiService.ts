import { aiConfig } from './aiConfig';

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface OpenAIVisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = aiConfig.openaiApiKey || '';
  }

  async analyzeDocument(documentText: string, _documentType: string): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock data');
      return this.getMockEnhancedData(documentText);
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `Tu es un expert en analyse de documents financiers BTP en Afrique. 
          Analyse le texte OCR fourni et enrichis les données extraites.
          
          Retourne un JSON avec cette structure:
          {
            "amounts": [{"value": number, "currency": "XAF", "confidence": number}],
            "dates": [{"value": "YYYY-MM-DD", "type": "invoice|due", "confidence": number}],
            "vendorName": {"value": string, "confidence": number, "normalized": string},
            "invoiceNumber": {"value": string, "confidence": number},
            "total": {"value": number, "currency": "XAF", "confidence": number},
            "validation": {
              "isValid": boolean,
              "issues": [string],
              "suggestions": [string]
            }
          }`
        },
        {
          role: 'user',
          content: `Analyse ce texte OCR d'une facture/devis BTP:\n\n${documentText}`
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 1000,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI OCR enhancement error:', error);
      return this.getMockEnhancedData(documentText);
    }
  }

  async generateQuote(projectData: Record<string, unknown>, _requirements: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock data');
      return this.getMockQuoteData(projectData);
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `Tu es un expert en devis BTP en Afrique. Génère un devis détaillé basé sur la description du projet.
          
          Retourne un JSON avec cette structure:
          {
            "title": string,
            "description": string,
            "phases": [{
              "name": string,
              "description": string,
              "duration": number,
              "items": [{
                "description": string,
                "quantity": number,
                "unit": string,
                "unitPrice": number,
                "totalPrice": number,
                "category": "materials|labor|equipment|other"
              }],
              "totalCost": number
            }],
            "totalCost": number,
            "totalDuration": number,
            "recommendations": [string],
            "assumptions": [string],
            "confidence": number
          }
          
          Utilise les prix du marché camerounais en FCFA. Sois réaliste et détaillé.`
        },
        {
          role: 'user',
          content: `Génère un devis pour ce projet BTP:
          Type: ${projectData.projectType}
          Description: ${projectData.description}
          Budget: ${(projectData.budget as any)?.min || 0} - ${(projectData.budget as any)?.max || 0} XAF
          Localisation: ${projectData.location || 'Cameroun'}
          Délai: ${projectData.timeline || 'Standard'}`
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI quote generation error:', error);
      return this.getMockQuoteData(projectData);
    }
  }

  async processDocumentWithAI(_content: string, _metadata: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock response');
      return { error: "Je suis désolé, l'API OpenAI n'est pas configurée. Veuillez vérifier votre clé API." };
    }

    try {
      const messages = [
        {
          role: 'system',
          content: aiConfig.copilot.systemPrompt
        },
        {
          role: 'user',
          content: `Traitement de document demandé`
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig.copilot.model,
          messages,
          max_tokens: aiConfig.copilot.maxTokens,
          temperature: aiConfig.copilot.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return { result: data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.' };
    } catch (error) {
      console.error('OpenAI copilot error:', error);
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

// Service Google Vision API - OCR professionnel
import { AIResponse } from './aiRouter';

export interface GoogleVisionConfig {
  apiKey: string;
  baseUrl: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    coordinates: number[];
    confidence: number;
  }>;
}

export class GoogleVisionService {
  private config: GoogleVisionConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
      baseUrl: 'https://vision.googleapis.com/v1'
    };
  }

  /**
   * OCR avancé pour factures BTP
   */
  async extractInvoiceData(imageBase64: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1
                },
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 50
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      if (data.responses[0].error) {
        throw new Error(data.responses[0].error.message);
      }

      const fullText = data.responses[0].fullTextAnnotation?.text || '';
      const textAnnotations = data.responses[0].textAnnotations || [];

      // Extraction structurée des données de facture
      const extractedData = this.parseInvoiceText(fullText);

      return {
        content: JSON.stringify({
          rawText: fullText,
          extractedData,
          textAnnotations: textAnnotations.slice(1, 11) // Top 10 détections
        }, null, 2),
        provider: 'google_vision',
        cost: 12, // FCFA par requête
        processingTime,
        confidence: this.calculateConfidence(textAnnotations),
        metadata: {
          task: 'invoice_ocr',
          text_length: fullText.length,
          annotations_count: textAnnotations.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur Google Vision OCR: ${error}`);
    }
  }

  /**
   * Lecture de plans techniques
   */
  async readTechnicalPlan(imageBase64: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 20
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      const fullText = data.responses[0].fullTextAnnotation?.text || '';
      const objects = data.responses[0].localizedObjectAnnotations || [];

      // Analyse spécialisée pour plans techniques
      const planAnalysis = this.analyzeTechnicalPlan(fullText, objects);

      return {
        content: JSON.stringify({
          extractedText: fullText,
          detectedObjects: objects,
          planAnalysis
        }, null, 2),
        provider: 'google_vision',
        cost: 12,
        processingTime,
        confidence: 85,
        metadata: {
          task: 'technical_plan_reading',
          objects_detected: objects.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur Lecture Plan: ${error}`);
    }
  }

  /**
   * Analyse d'images de chantier
   */
  async analyzeConstructionSite(imageBase64: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 20
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 15
                },
                {
                  type: 'SAFE_SEARCH_DETECTION'
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      const labels = data.responses[0].labelAnnotations || [];
      const objects = data.responses[0].localizedObjectAnnotations || [];
      const safeSearch = data.responses[0].safeSearchAnnotation || {};

      // Analyse spécialisée chantier
      const siteAnalysis = this.analyzeConstructionElements(labels);

      return {
        content: JSON.stringify({
          detectedLabels: labels,
          detectedObjects: objects,
          safetyCheck: safeSearch,
          siteAnalysis
        }, null, 2),
        provider: 'google_vision',
        cost: 12,
        processingTime,
        confidence: 80,
        metadata: {
          task: 'construction_site_analysis',
          labels_count: labels.length,
          objects_count: objects.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur Analyse Chantier: ${error}`);
    }
  }

  /**
   * Reconnaissance de signatures sur documents
   */
  async detectSignatures(imageBase64: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 30
                },
                {
                  type: 'LOGO_DETECTION',
                  maxResults: 10
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      const textAnnotations = data.responses[0].textAnnotations || [];
      const logos = data.responses[0].logoAnnotations || [];

      // Détection de signatures et cachets
      const signatureAnalysis = this.detectSignatureElements(textAnnotations, logos);

      return {
        content: JSON.stringify({
          textDetections: textAnnotations,
          logoDetections: logos,
          signatureAnalysis
        }, null, 2),
        provider: 'google_vision',
        cost: 12,
        processingTime,
        confidence: 75,
        metadata: {
          task: 'signature_detection',
          text_detections: textAnnotations.length,
          logo_detections: logos.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur Détection Signatures: ${error}`);
    }
  }

  /**
   * Parsing spécialisé pour factures BTP
   */
  private parseInvoiceText(text: string): Record<string, unknown> {
    const lines = text.split('\n').filter(line => line.trim());
    
    const extractedData: {
      supplier: string | null;
      invoiceNumber: string | null;
      date: string | null;
      totalAmount: number | null;
      items: Array<Record<string, unknown>>;
      taxAmount: number | null;
      supplierAddress: string | null;
      clientInfo: string | null;
      paymentTerms: string | null;
      dueDate: string | null;
    } = {
      supplier: null,
      invoiceNumber: null,
      date: null,
      totalAmount: null,
      items: [],
      taxAmount: null,
      supplierAddress: null,
      clientInfo: null,
      paymentTerms: null,
      dueDate: null
    };

    // Patterns de reconnaissance améliorés
    const patterns = {
      invoiceNumber: /(?:facture|invoice|n°|#|num[eé]ro)\s*:?\s*([A-Z0-9-]+)/i,
      date: /(?:date|du|le)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      dueDate: /(?:échéance|due|à payer avant)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      amount: /(\d+(?:\s?\d{3})*(?:[,.]\d{2})?)\s*(?:FCFA|CFA|€|EUR|$|XOF)/i,
      tva: /(?:tva|tax|taxe)\s*:?\s*(\d+(?:[,.]\d{2})?)\s*(?:FCFA|CFA|€|%)/i,
      supplier: /^([A-Z][A-Za-z\s&.-]+(?:SARL|SA|SAS|EURL|SNC)?)$/m,
      phone: /(?:\+221|\+33|0)[1-9](?:[0-9\s.-]{8,})/,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      paymentTerms: /(?:paiement|payment)\s*:?\s*(.+?)(?:\n|$)/i
    };

    let supplierFound = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Numéro de facture
      const invoiceMatch = trimmedLine.match(patterns.invoiceNumber);
      if (invoiceMatch && !extractedData.invoiceNumber) {
        extractedData.invoiceNumber = invoiceMatch[1];
      }

      // Date de facture
      const dateMatch = trimmedLine.match(patterns.date);
      if (dateMatch && !extractedData.date) {
        extractedData.date = dateMatch[1];
      }

      // Date d'échéance
      const dueDateMatch = trimmedLine.match(patterns.dueDate);
      if (dueDateMatch && !extractedData.dueDate) {
        extractedData.dueDate = dueDateMatch[1];
      }

      // Fournisseur (généralement dans les premières lignes)
      if (!supplierFound && index < 10) {
        const supplierMatch = trimmedLine.match(patterns.supplier);
        if (supplierMatch && trimmedLine.length > 5 && trimmedLine.length < 100) {
          extractedData.supplier = supplierMatch[1];
          supplierFound = true;
        }
      }

      // Montants
      const amountMatch = trimmedLine.match(patterns.amount);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
        if (trimmedLine.toLowerCase().includes('total') && 
            !trimmedLine.toLowerCase().includes('ht')) {
          extractedData.totalAmount = amount;
        }
      }

      // TVA
      const tvaMatch = trimmedLine.match(patterns.tva);
      if (tvaMatch && !extractedData.taxAmount) {
        extractedData.taxAmount = parseFloat(tvaMatch[1].replace(',', '.'));
      }

      // Conditions de paiement
      const paymentMatch = trimmedLine.match(patterns.paymentTerms);
      if (paymentMatch && !extractedData.paymentTerms) {
        extractedData.paymentTerms = paymentMatch[1].trim();
      }
    });

    // Extraction des articles de facture
    extractedData.items = this.extractInvoiceItems(text);

    // Validation et nettoyage des données
    if (extractedData.supplier && extractedData.supplier.length < 3) {
      extractedData.supplier = null;
    }

    return extractedData;
  }

  /**
   * Parsing spécialisé pour plans d'architecture
   */
  parseArchitecturalPlan(text: string): Record<string, unknown> {
    return {
      dimensions: this.extractDimensions(text),
      rooms: this.extractRooms(text),
      materials: this.extractMaterials(text),
      scales: this.extractScales(text),
      symbols: []
    };
  }

  /**
   * Analyse spécialisée pour plans techniques
   */
  private analyzeTechnicalPlan(text: string, objects: Array<{ name: string; score: number; }>): {
    dimensions: string[];
    rooms: string[];
    materials: string[];
    scales: string[];
    symbols: Array<{ name: string; score: number; }>;
  } {
    return {
      dimensions: this.extractDimensions(text),
      rooms: this.extractRooms(text),
      materials: this.extractMaterials(text),
      scales: this.extractScales(text),
      symbols: objects.filter(obj => obj.score > 0.7)
    };
  }

  /**
   * Analyse des éléments de construction sur photos
   */
  private analyzeConstructionElements(
    labels: Array<{ description: string; score: number; }>
  ): {
    constructionElements: Array<{ description: string; score: number; }>;
    safetyEquipment: Array<{ description: string; score: number; }>;
    progressIndicators: Array<{ description: string; score: number; }>;
    qualityIssues: Array<{ description: string; score: number; }>;
    completionEstimate: string;
  } {
    const constructionKeywords = [
      'building', 'construction', 'concrete', 'steel', 'brick',
      'scaffold', 'crane', 'worker', 'helmet', 'safety'
    ];

    const relevantLabels = labels.filter(label => 
      constructionKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    return {
      constructionElements: relevantLabels,
      safetyEquipment: this.identifySafetyEquipment(labels),
      progressIndicators: this.identifyProgress(labels),
      qualityIssues: this.identifyQualityIssues(labels),
      completionEstimate: this.estimateCompletion(labels)
    };
  }

  /**
   * Détection d'éléments de signature
   */
  private detectSignatureElements(
    textAnnotations: Array<{ description: string; boundingPoly?: unknown; }>, 
    logos: Array<{ name: string; score: number; }>
  ): {
    possibleSignatures: Array<{ description: string; boundingPoly?: unknown; }>;
    stamps: Array<{ name: string; score: number; }>;
    handwrittenElements: Array<{ description: string; boundingPoly?: unknown; }>;
  } {
    return {
      possibleSignatures: textAnnotations.filter(annotation => 
        annotation.description.length < 20 && 
        /[A-Za-z]/.test(annotation.description) &&
        annotation.boundingPoly
      ),
      stamps: logos,
      handwrittenElements: textAnnotations.filter(annotation =>
        annotation.description.length > 2 && annotation.description.length < 50
      )
    };
  }

  /**
   * Extraction de dimensions depuis le texte
   */
  private extractDimensions(text: string): string[] {
    const dimensionPattern = /(\d+(?:[,.]\d+)?)\s*[x×]\s*(\d+(?:[,.]\d+)?)\s*(?:m|cm|mm)?/gi;
    const matches = text.match(dimensionPattern) || [];
    return matches;
  }

  /**
   * Extraction des articles de facture
   */
  private extractInvoiceItems(text: string): Array<Record<string, unknown>> {
    const lines = text.split('\n').filter(line => line.trim());
    const items: Array<Record<string, unknown>> = [];
    
    // Patterns pour différents formats de lignes d'articles
    const patterns = {
      // Format: "Description Quantité Prix unitaire Total"
      standard: /^(.+?)\s+(\d+(?:[,.]\d+)?)\s+(\d+(?:[,.]\d+)?)\s+(\d+(?:[,.]\d+)?)\s*(?:FCFA|CFA|€|$)?/i,
      // Format: "Description: Prix"
      simple: /^(.+?)\s*:\s*(\d+(?:[,.]\d+)?)\s*(?:FCFA|CFA|€|$)/i,
      // Format avec code article: "REF123 Description Qté Prix"
      withCode: /^([A-Z0-9-]+)\s+(.+?)\s+(\d+(?:[,.]\d+)?)\s+(\d+(?:[,.]\d+)?)\s*(?:FCFA|CFA|€|$)?/i
    };

    lines.forEach((line, index) => {
      // Ignorer les en-têtes et lignes de total
      if (line.toLowerCase().includes('total') || 
          line.toLowerCase().includes('sous-total') ||
          line.toLowerCase().includes('tva') ||
          line.toLowerCase().includes('description') ||
          line.toLowerCase().includes('quantité') ||
          line.toLowerCase().includes('prix')) {
        return;
      }

      // Essayer le pattern standard
      let match = line.match(patterns.standard);
      if (match) {
        items.push({
          lineNumber: index + 1,
          description: match[1].trim(),
          quantity: parseFloat(match[2].replace(',', '.')),
          unitPrice: parseFloat(match[3].replace(',', '.')),
          totalPrice: parseFloat(match[4].replace(',', '.')),
          type: 'standard'
        });
        return;
      }

      // Essayer le pattern avec code
      match = line.match(patterns.withCode);
      if (match) {
        items.push({
          lineNumber: index + 1,
          code: match[1],
          description: match[2].trim(),
          quantity: parseFloat(match[3].replace(',', '.')),
          unitPrice: parseFloat(match[4].replace(',', '.')),
          type: 'with_code'
        });
        return;
      }

      // Essayer le pattern simple
      match = line.match(patterns.simple);
      if (match) {
        items.push({
          lineNumber: index + 1,
          description: match[1].trim(),
          price: parseFloat(match[2].replace(',', '.')),
          type: 'simple'
        });
      }
    });

    return items;
  }

  /**
   * Extraction de pièces/espaces
   */
  private extractRooms(text: string): string[] {
    const roomKeywords = [
      'salon', 'chambre', 'cuisine', 'salle de bain', 'bureau',
      'garage', 'cave', 'grenier', 'terrasse', 'balcon'
    ];
    
    return roomKeywords.filter(room => 
      text.toLowerCase().includes(room)
    );
  }

  /**
   * Extraction de matériaux
   */
  private extractMaterials(text: string): string[] {
    const materialKeywords = [
      'béton', 'acier', 'bois', 'brique', 'parpaing',
      'placo', 'carrelage', 'peinture', 'isolant'
    ];
    
    return materialKeywords.filter(material => 
      text.toLowerCase().includes(material)
    );
  }

  /**
   * Extraction d'échelles
   */
  private extractScales(text: string): string[] {
    const scalePattern = /1\s*[:\\/]\s*\d+/g;
    return text.match(scalePattern) || [];
  }

  /**
   * Identification équipements de sécurité
   */
  private identifySafetyEquipment(labels: Array<{ description: string; score: number; }>): Array<{ description: string; score: number; }> {
    const safetyKeywords = ['helmet', 'safety', 'vest', 'gloves', 'boots'];
    return labels.filter(label => 
      safetyKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Identification indicateurs de progression
   */
  private identifyProgress(
    labels: Array<{ description: string; score: number; }>
  ): Array<{ description: string; score: number; }> {
    return labels.filter(l => 
      ['worker', 'construction', 'building', 'progress', 'completion'].some(keyword =>
        l.description.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Identification problèmes qualité
   */
  private identifyQualityIssues(labels: Array<{ description: string; score: number; }>): Array<{ description: string; score: number; }> {
    const issueKeywords = ['crack', 'damage', 'rust', 'leak'];
    return labels.filter(label => 
      issueKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Estimation du niveau d'achèvement
   */
  private estimateCompletion(labels: Array<{ description: string; score: number; }>): string {
    const foundationKeywords = ['foundation', 'concrete', 'ground'];
    const structureKeywords = ['frame', 'wall', 'roof'];
    const finishKeywords = ['paint', 'floor', 'window', 'door'];

    if (labels.some(l => finishKeywords.includes(l.description.toLowerCase()))) {
      return 'finishing';
    } else if (labels.some(l => structureKeywords.includes(l.description.toLowerCase()))) {
      return 'structure';
    } else if (labels.some(l => foundationKeywords.includes(l.description.toLowerCase()))) {
      return 'foundation';
    }
    return 'unknown';
  }

  /**
   * Calcul de la confidence moyenne
   */
  private calculateConfidence(result: Record<string, unknown>): number {
    const textAnnotations = result.textAnnotations as Array<Record<string, unknown>> | undefined;
    if (!textAnnotations || !Array.isArray(textAnnotations)) return 0;
    
    const confidences = textAnnotations
      .filter((annotation: Record<string, unknown>) => annotation.confidence)
      .map((annotation: Record<string, unknown>) => annotation.confidence as number);
    if (!confidences.length) return 0;
    const avgConfidence = confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length;
    return Math.round(avgConfidence * 100);
  }

  /**
   * Vérification de la disponibilité du service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1 pixel test
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ]
            }
          ]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

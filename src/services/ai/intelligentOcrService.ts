import { ocrService, OCRResult, ExtractedData } from '../ocrService';

export interface IntelligentOCRResult extends ExtractedData {
  documentType: 'invoice' | 'quote' | 'receipt' | 'contract' | 'delivery_note' | 'unknown';
  confidence: number;
  structuredData: {
    supplier?: {
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      siret?: string;
    };
    client?: {
      name: string;
      address?: string;
    };
    items?: Array<{
      description: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
      unit?: string;
    }>;
    taxes?: {
      tva?: number;
      totalHT?: number;
      totalTTC?: number;
    };
    payment?: {
      method?: string;
      dueDate?: string;
      terms?: string;
    };
  };
  suggestions: {
    category?: string;
    project?: string;
    phase?: string;
    autoFillFields: Record<string, any>;
  };
  aiAnalysis: {
    summary: string;
    keyInsights: string[];
    potentialIssues: string[];
    recommendations: string[];
  };
}

class IntelligentOCRService {
  private openaiApiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  // Traitement intelligent d'un document
  async processDocumentIntelligently(file: File): Promise<IntelligentOCRResult> {
    try {
      // Étape 1: OCR de base
      const ocrResult = await ocrService.processImage(file);
      const extractedData = ocrService.extractData(ocrResult.text);

      // Étape 2: Analyse IA du texte
      const aiAnalysis = await this.analyzeWithAI(ocrResult.text);

      // Étape 3: Classification du document
      const documentType = this.classifyDocument(ocrResult.text);

      // Étape 4: Extraction structurée selon le type
      const structuredData = await this.extractStructuredData(ocrResult.text, documentType);

      // Étape 5: Génération de suggestions
      const suggestions = await this.generateSuggestions(structuredData, aiAnalysis);

      return {
        ...extractedData,
        documentType,
        confidence: ocrResult.confidence,
        structuredData,
        suggestions,
        aiAnalysis
      };
    } catch (error) {
      console.error('Erreur traitement intelligent OCR:', error);
      
      // Fallback vers OCR basique
      const ocrResult = await ocrService.processImage(file);
      const extractedData = ocrService.extractData(ocrResult.text);
      
      return {
        ...extractedData,
        documentType: 'unknown',
        confidence: ocrResult.confidence,
        structuredData: {},
        suggestions: { autoFillFields: {} },
        aiAnalysis: {
          summary: 'Analyse IA non disponible',
          keyInsights: [],
          potentialIssues: [],
          recommendations: []
        }
      };
    }
  }

  // Analyse du texte avec IA
  private async analyzeWithAI(text: string): Promise<IntelligentOCRResult['aiAnalysis']> {
    if (!this.openaiApiKey) {
      return this.getFallbackAnalysis(text);
    }

    try {
      const prompt = `
Analyse ce document BTP en français et fournis une analyse structurée:

TEXTE DU DOCUMENT:
${text}

Réponds au format JSON avec:
{
  "summary": "Résumé du document en 1-2 phrases",
  "keyInsights": ["Insight 1", "Insight 2", ...],
  "potentialIssues": ["Problème potentiel 1", ...],
  "recommendations": ["Recommandation 1", ...]
}

Concentre-toi sur les aspects BTP: matériaux, coûts, délais, qualité, conformité.
`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parser la réponse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  // Classification du type de document
  private classifyDocument(text: string): IntelligentOCRResult['documentType'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('facture') || lowerText.includes('invoice')) {
      return 'invoice';
    }
    if (lowerText.includes('devis') || lowerText.includes('quote') || lowerText.includes('estimation')) {
      return 'quote';
    }
    if (lowerText.includes('reçu') || lowerText.includes('ticket') || lowerText.includes('receipt')) {
      return 'receipt';
    }
    if (lowerText.includes('contrat') || lowerText.includes('contract')) {
      return 'contract';
    }
    if (lowerText.includes('bon de livraison') || lowerText.includes('delivery') || lowerText.includes('livraison')) {
      return 'delivery_note';
    }
    
    return 'unknown';
  }

  // Extraction de données structurées
  private async extractStructuredData(text: string, documentType: IntelligentOCRResult['documentType']): Promise<IntelligentOCRResult['structuredData']> {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const result: IntelligentOCRResult['structuredData'] = {};

    // Extraction du fournisseur
    result.supplier = this.extractSupplierInfo(lines);

    // Extraction du client
    result.client = this.extractClientInfo(lines);

    // Extraction des articles selon le type de document
    if (['invoice', 'quote', 'delivery_note'].includes(documentType)) {
      result.items = this.extractItems(text);
    }

    // Extraction des taxes
    result.taxes = this.extractTaxInfo(text);

    // Extraction des informations de paiement
    if (['invoice', 'quote'].includes(documentType)) {
      result.payment = this.extractPaymentInfo(text);
    }

    return result;
  }

  // Extraction des informations fournisseur
  private extractSupplierInfo(lines: string[]): IntelligentOCRResult['structuredData']['supplier'] {
    const supplier: any = {};

    // Nom (généralement dans les premières lignes)
    if (lines.length > 0) {
      supplier.name = lines[0];
    }

    // Adresse (lignes suivantes)
    const addressLines = lines.slice(1, 4).filter(line => 
      !line.match(/^(tel|phone|email|siret)/i) && 
      line.length > 5
    );
    if (addressLines.length > 0) {
      supplier.address = addressLines.join(', ');
    }

    // Téléphone
    const phoneMatch = lines.find(line => line.match(/(?:tel|phone)[\s:]*([+\d\s\-\.]+)/i));
    if (phoneMatch) {
      const match = phoneMatch.match(/([+\d\s\-\.]+)/);
      if (match) supplier.phone = match[1].trim();
    }

    // Email
    const emailMatch = lines.find(line => line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/));
    if (emailMatch) {
      const match = emailMatch.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (match) supplier.email = match[1];
    }

    // SIRET
    const siretMatch = lines.find(line => line.match(/siret[\s:]*(\d{14})/i));
    if (siretMatch) {
      const match = siretMatch.match(/(\d{14})/);
      if (match) supplier.siret = match[1];
    }

    return Object.keys(supplier).length > 0 ? supplier : undefined;
  }

  // Extraction des informations client
  private extractClientInfo(lines: string[]): IntelligentOCRResult['structuredData']['client'] {
    // Rechercher des patterns comme "Facturé à:", "Client:", etc.
    const clientPatterns = [
      /(?:facturé à|client|destinataire)[\s:]*(.+)/i,
      /(?:à l'attention de|attention)[\s:]*(.+)/i
    ];

    for (const pattern of clientPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          return { name: match[1].trim() };
        }
      }
    }

    return undefined;
  }

  // Extraction des articles/lignes
  private extractItems(text: string): IntelligentOCRResult['structuredData']['items'] {
    const items: any[] = [];
    const lines = text.split('\n');

    // Patterns pour identifier les lignes d'articles
    const itemPatterns = [
      // Quantité Description Prix_unitaire Prix_total
      /(\d+(?:[.,]\d+)?)\s+(.+?)\s+(\d+(?:[.,]\d{3})*[.,]\d{2})\s+(\d+(?:[.,]\d{3})*[.,]\d{2})/,
      // Description Quantité Prix
      /(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d{3})*[.,]\d{2})/
    ];

    for (const line of lines) {
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          let item: any = {};
          
          if (match.length === 5) {
            // Format: Qté Description Prix_unit Prix_total
            item = {
              quantity: parseFloat(match[1].replace(',', '.')),
              description: match[2].trim(),
              unitPrice: parseFloat(match[3].replace(/[.,]/g, '.')),
              totalPrice: parseFloat(match[4].replace(/[.,]/g, '.'))
            };
          } else if (match.length === 4) {
            // Format: Description Qté Prix
            item = {
              description: match[1].trim(),
              quantity: parseFloat(match[2].replace(',', '.')),
              totalPrice: parseFloat(match[3].replace(/[.,]/g, '.'))
            };
          }

          if (item.description && item.description.length > 3) {
            items.push(item);
          }
          break;
        }
      }
    }

    return items.length > 0 ? items : undefined;
  }

  // Extraction des informations de taxes
  private extractTaxInfo(text: string): IntelligentOCRResult['structuredData']['taxes'] {
    const taxes: any = {};

    // TVA
    const tvaMatch = text.match(/tva[\s:]*(\d+(?:[.,]\d+)?)\s*%/i);
    if (tvaMatch) {
      taxes.tva = parseFloat(tvaMatch[1].replace(',', '.'));
    }

    // Total HT
    const htMatch = text.match(/(?:total\s*)?h\.?t\.?[\s:]*(\d+(?:[.,]\d{3})*[.,]\d{2})/i);
    if (htMatch) {
      taxes.totalHT = parseFloat(htMatch[1].replace(/[.,]/g, '.'));
    }

    // Total TTC
    const ttcMatch = text.match(/(?:total\s*)?t\.?t\.?c\.?[\s:]*(\d+(?:[.,]\d{3})*[.,]\d{2})/i);
    if (ttcMatch) {
      taxes.totalTTC = parseFloat(ttcMatch[1].replace(/[.,]/g, '.'));
    }

    return Object.keys(taxes).length > 0 ? taxes : undefined;
  }

  // Extraction des informations de paiement
  private extractPaymentInfo(text: string): IntelligentOCRResult['structuredData']['payment'] {
    const payment: any = {};

    // Méthode de paiement
    const methodPatterns = [
      /paiement[\s:]*(.+?)(?:\n|$)/i,
      /mode de paiement[\s:]*(.+?)(?:\n|$)/i,
      /règlement[\s:]*(.+?)(?:\n|$)/i
    ];

    for (const pattern of methodPatterns) {
      const match = text.match(pattern);
      if (match) {
        payment.method = match[1].trim();
        break;
      }
    }

    // Date d'échéance
    const dueDatePatterns = [
      /échéance[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
      /à payer avant le[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
    ];

    for (const pattern of dueDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        payment.dueDate = match[1];
        break;
      }
    }

    // Conditions de paiement
    const termsPatterns = [
      /conditions[\s:]*(.+?)(?:\n|$)/i,
      /net à (\d+) jours/i,
      /(\d+)% d'acompte/i
    ];

    for (const pattern of termsPatterns) {
      const match = text.match(pattern);
      if (match) {
        payment.terms = match[1] ? match[1].trim() : match[0];
        break;
      }
    }

    return Object.keys(payment).length > 0 ? payment : undefined;
  }

  // Génération de suggestions intelligentes
  private async generateSuggestions(
    structuredData: IntelligentOCRResult['structuredData'],
    aiAnalysis: IntelligentOCRResult['aiAnalysis']
  ): Promise<IntelligentOCRResult['suggestions']> {
    const suggestions: IntelligentOCRResult['suggestions'] = {
      autoFillFields: {}
    };

    // Auto-remplissage basé sur les données extraites
    if (structuredData.supplier?.name) {
      suggestions.autoFillFields.supplierName = structuredData.supplier.name;
    }

    if (structuredData.taxes?.totalTTC) {
      suggestions.autoFillFields.amount = structuredData.taxes.totalTTC;
    }

    if (structuredData.payment?.dueDate) {
      suggestions.autoFillFields.dueDate = structuredData.payment.dueDate;
    }

    // Suggestions de catégorie basées sur les articles
    if (structuredData.items) {
      const categories = this.suggestCategories(structuredData.items);
      if (categories.length > 0) {
        suggestions.category = categories[0];
      }
    }

    // Suggestions de projet basées sur l'analyse IA
    suggestions.project = this.suggestProject(aiAnalysis);

    return suggestions;
  }

  // Suggérer des catégories basées sur les articles
  private suggestCategories(items: any[]): string[] {
    const categories = new Set<string>();
    
    for (const item of items) {
      const description = item.description?.toLowerCase() || '';
      
      if (description.includes('béton') || description.includes('ciment')) {
        categories.add('Gros œuvre');
      }
      if (description.includes('carrelage') || description.includes('peinture')) {
        categories.add('Finitions');
      }
      if (description.includes('électri') || description.includes('câble')) {
        categories.add('Électricité');
      }
      if (description.includes('plomb') || description.includes('tuyau')) {
        categories.add('Plomberie');
      }
      if (description.includes('bois') || description.includes('porte')) {
        categories.add('Menuiserie');
      }
    }

    return Array.from(categories);
  }

  // Suggérer un projet basé sur l'analyse
  private suggestProject(aiAnalysis: IntelligentOCRResult['aiAnalysis']): string | undefined {
    const summary = aiAnalysis.summary.toLowerCase();
    
    if (summary.includes('villa') || summary.includes('maison')) {
      return 'Construction villa';
    }
    if (summary.includes('bureau') || summary.includes('commercial')) {
      return 'Construction bureau';
    }
    if (summary.includes('rénovation')) {
      return 'Rénovation';
    }
    
    return undefined;
  }

  // Analyse de fallback sans IA
  private getFallbackAnalysis(text: string): IntelligentOCRResult['aiAnalysis'] {
    const wordCount = text.split(/\s+/).length;
    const hasAmounts = /\d+(?:[.,]\d{3})*[.,]\d{2}/.test(text);
    const hasDate = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(text);
    
    return {
      summary: `Document de ${wordCount} mots ${hasAmounts ? 'avec montants' : 'sans montants'} ${hasDate ? 'et dates' : ''}`,
      keyInsights: [
        hasAmounts ? 'Contient des informations financières' : 'Pas de montants détectés',
        hasDate ? 'Contient des dates' : 'Pas de dates détectées'
      ],
      potentialIssues: wordCount < 50 ? ['Document très court, données possiblement incomplètes'] : [],
      recommendations: [
        'Vérifier manuellement les données extraites',
        'Compléter les informations manquantes'
      ]
    };
  }
}

export const intelligentOcrService = new IntelligentOCRService();
export default intelligentOcrService;

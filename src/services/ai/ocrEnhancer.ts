import { ExtractedData } from '../ocrService';
import { openaiService } from './openaiService';
import { aiConfig } from './aiConfig';

export interface EnhancedOCRData extends ExtractedData {
  confidence: number;
  validationStatus: 'valid' | 'warning' | 'error';
  suggestions: string[];
  mappedVendor?: {
    id: string;
    name: string;
    confidence: number;
  };
  normalizedData: {
    amount: number | null;
    currency: string;
    date: string | null;
    invoiceNumber: string | null;
    vendorName: string | null;
  };
  items?: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category?: string;
  }>;
}

export interface OCREnhancementConfig {
  apiKey?: string;
  model: 'openai' | 'claude' | 'local';
  validateAmounts: boolean;
  mapVendors: boolean;
  correctDates: boolean;
  enabled?: boolean;
}

export interface AIEnhancementData {
  validation?: {
    suggestions: string[];
  };
  total?: {
    value: number;
    confidence: number;
    currency?: string;
  };
  vendorName?: {
    value: string;
    normalized?: string;
    confidence: number;
  };
  date?: {
    value: string;
    confidence: number;
  };
  invoiceNumber?: {
    value: string;
    confidence: number;
  };
}

class OCREnhancer {
  private config: OCREnhancementConfig;

  constructor(config: OCREnhancementConfig) {
    this.config = config;
  }

  async enhanceOCRData(extractedData: ExtractedData, originalText?: string): Promise<EnhancedOCRData> {
    if (!this.config.enabled) {
      return await this.createFallbackEnhancedData(extractedData);
    }

    try {
      // Utiliser OpenAI si configuré et texte original disponible
      if (aiConfig.openaiApiKey && originalText && this.config.model === 'openai') {
        const aiEnhanced = await openaiService.enhanceOCRData(originalText);
        return await this.mergeAIEnhancement(extractedData, aiEnhanced);
      }
      
      // Sinon utiliser l'enrichissement local
      return await this.createFallbackEnhancedData(extractedData);
    } catch {
      // Erreur lors de l'enrichissement OCR
      return await this.createFallbackEnhancedData(extractedData);
    }
  }

  private async createFallbackEnhancedData(extractedData: ExtractedData): Promise<EnhancedOCRData> {
    const enhanced: EnhancedOCRData = {
      ...extractedData,
      confidence: 0,
      validationStatus: 'valid',
      suggestions: [],
      normalizedData: {
        amount: null,
        currency: 'FCFA',
        date: null,
        invoiceNumber: null,
        vendorName: null
      }
    };

    // 1. Validation et normalisation des montants
    if (this.config.validateAmounts) {
      enhanced.normalizedData.amount = this.validateAndNormalizeAmount(extractedData.total);
      if (!enhanced.normalizedData.amount && extractedData.amounts && extractedData.amounts.length > 0) {
        enhanced.normalizedData.amount = Math.max(...extractedData.amounts);
        enhanced.suggestions.push('Montant principal détecté automatiquement');
      }
    }

    // 2. Correction et validation des dates
    if (this.config.correctDates) {
      enhanced.normalizedData.date = this.validateAndCorrectDate(extractedData.dates);
      if (!enhanced.normalizedData.date && extractedData.dates && extractedData.dates.length > 0) {
        enhanced.suggestions.push('Date non standardisée détectée');
      }
    }

    // 3. Normalisation du nom du fournisseur
    enhanced.normalizedData.vendorName = this.normalizeVendorName(extractedData.vendorName);

    // 4. Validation du numéro de facture
    enhanced.normalizedData.invoiceNumber = this.validateInvoiceNumber(extractedData.invoiceNumber);

    // 5. Mapping intelligent des fournisseurs (si activé)
    if (this.config.mapVendors && enhanced.normalizedData.vendorName) {
      enhanced.mappedVendor = await this.mapToKnownVendor(enhanced.normalizedData.vendorName);
    }

    // 6. Calcul de la confiance globale
    enhanced.confidence = this.calculateConfidence(enhanced);

    // 7. Détermination du statut de validation
    enhanced.validationStatus = this.determineValidationStatus(enhanced);

    // 8. Enrichissement IA (si configuré)
    if (this.config.model !== 'local' && aiConfig.openaiApiKey) {
      enhanced.suggestions.push('Enrichissement IA OpenAI activé');
    } else if (this.config.model !== 'local') {
      enhanced.suggestions.push('Enrichissement IA disponible mais clé API manquante');
    }

    return enhanced;
  }

  private validateAndNormalizeAmount(amount?: number): number | null {
    if (!amount || isNaN(amount) || amount <= 0) return null;
    
    // Validation des montants aberrants (trop petits ou trop grands)
    if (amount < 100 || amount > 10000000) {
      return null;
    }
    
    return Math.round(amount * 100) / 100; // Arrondi à 2 décimales
  }

  private validateAndCorrectDate(dates: string[]): string | null {
    if (!dates || dates.length === 0) return null;

    for (const dateStr of dates) {
      // Essayer de parser et valider la date
      const parsed = this.parseDate(dateStr);
      if (parsed && this.isValidBusinessDate(parsed)) {
        return parsed.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }
    }

    return null;
  }

  private parseDate(dateStr: string): Date | null {
    // Patterns de dates courantes
    const patterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,  // DD/MM/YYYY
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,  // YYYY/MM/DD
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        const [, p1, p2, p3] = match;
        // Assumer DD/MM/YYYY pour le premier pattern
        const day = pattern.source.startsWith('(\\d{4})') ? parseInt(p3) : parseInt(p1);
        const month = parseInt(p2) - 1; // JS months are 0-indexed
        const year = pattern.source.startsWith('(\\d{4})') ? parseInt(p1) : parseInt(p3);
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  private isValidBusinessDate(date: Date): boolean {
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    return date >= twoYearsAgo && date <= oneYearFromNow;
  }

  private normalizeVendorName(vendorName?: string): string | null {
    if (!vendorName) return null;
    
    // Nettoyage basique
    return vendorName
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-&]/g, '')
      .toUpperCase();
  }

  private validateInvoiceNumber(invoiceNumber?: string): string | null {
    if (!invoiceNumber) return null;
    
    // Nettoyage et validation basique
    const cleaned = invoiceNumber.trim().replace(/\s+/g, '');
    
    // Doit contenir au moins 3 caractères alphanumériques
    if (cleaned.length >= 3 && /^[A-Z0-9-]+$/i.test(cleaned)) {
      return cleaned.toUpperCase();
    }
    
    return null;
  }

  private async mapToKnownVendor(vendorName: string): Promise<{ id: string; name: string; confidence: number } | undefined> {
    // Simulation - à remplacer par une vraie recherche dans la base de données
    const knownVendors = [
      { id: '1', name: 'EIFFAGE SENEGAL', aliases: ['EIFFAGE', 'EIFFAGE SN'] },
      { id: '2', name: 'SOGEA SATOM', aliases: ['SOGEA', 'SATOM'] },
      { id: '3', name: 'COLAS SENEGAL', aliases: ['COLAS', 'COLAS SN'] },
    ];

    const normalizedInput = vendorName.toUpperCase();
    
    for (const vendor of knownVendors) {
      // Correspondance exacte
      if (vendor.name === normalizedInput) {
        return { id: vendor.id, name: vendor.name, confidence: 1.0 };
      }
      
      // Correspondance avec alias
      for (const alias of vendor.aliases) {
        if (alias === normalizedInput) {
          return { id: vendor.id, name: vendor.name, confidence: 0.9 };
        }
      }
      
      // Correspondance partielle
      if (normalizedInput.includes(vendor.aliases[0]) || vendor.aliases[0].includes(normalizedInput)) {
        return { id: vendor.id, name: vendor.name, confidence: 0.7 };
      }
    }

    return undefined;
  }

  private calculateConfidence(data: EnhancedOCRData): number {
    let score = 0;
    let maxScore = 0;

    // Montant (30%)
    maxScore += 30;
    if (data.normalizedData.amount && data.normalizedData.amount > 0) {
      score += 30;
    }

    // Date (20%)
    maxScore += 20;
    if (data.normalizedData.date) {
      score += 20;
    }

    // Fournisseur (25%)
    maxScore += 25;
    if (data.normalizedData.vendorName) {
      score += data.mappedVendor ? 25 : 15;
    }

    // Numéro facture (15%)
    maxScore += 15;
    if (data.normalizedData.invoiceNumber) {
      score += 15;
    }

    // Cohérence générale (10%)
    maxScore += 10;
    if (data.amounts.length > 0 && data.dates.length > 0) {
      score += 10;
    }

    return Math.round((score / maxScore) * 100);
  }

  private determineValidationStatus(data: EnhancedOCRData): 'valid' | 'warning' | 'error' {
    if (data.confidence >= 80) return 'valid';
    if (data.confidence >= 60) return 'warning';
    return 'error';
  }

  private async performAIEnhancement(originalText: string, currentData: EnhancedOCRData): Promise<Partial<EnhancedOCRData>> {
    // Placeholder pour l'enrichissement IA
    // À implémenter avec OpenAI/Claude selon la configuration
    
    if (this.config.model === 'openai' && this.config.apiKey) {
      return await this.enhanceWithOpenAI(originalText, currentData);
    }
    
    return {};
  }

  private async enhanceWithOpenAI(originalText: string, currentData: EnhancedOCRData): Promise<Partial<EnhancedOCRData>> {
    try {
      const apiKey = aiConfig.openaiApiKey;
      if (!apiKey) {
        console.warn('🔑 Clé API OpenAI non configurée');
        return {
          suggestions: ['Configuration OpenAI requise pour l\'enrichissement IA']
        };
      }

      console.log('🤖 Enrichissement OCR avec OpenAI...');

      const prompt = `
Analyse ce texte OCR d'une facture BTP et enrichis les données:

TEXTE OCR:
${originalText}

DONNÉES ACTUELLES:
${JSON.stringify({
  vendorName: currentData.vendorName,
  total: currentData.total,
  amounts: currentData.amounts,
  dates: currentData.dates,
  invoiceNumber: currentData.invoiceNumber
}, null, 2)}

INSTRUCTIONS:
1. Corrige les erreurs OCR (caractères mal reconnus)
2. Extrait/valide: montant total, nom fournisseur, date, numéro facture
3. Identifie les articles BTP avec quantités et prix
4. Réponds en JSON strict avec cette structure:
{
  "normalizedData": {
    "amount": number,
    "currency": "XAF",
    "date": "YYYY-MM-DD",
    "vendorName": "string",
    "invoiceNumber": "string"
  },
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unit": "string", 
      "unitPrice": number,
      "totalPrice": number,
      "category": "materiau|main_oeuvre|equipement|transport"
    }
  ],
  "suggestions": ["string"],
  "confidence": number
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert comptable BTP. Analyse les factures avec précision. Réponds UNIQUEMENT en JSON valide, sans texte avant/après.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API OpenAI:', response.status, errorText);
        throw new Error(`API OpenAI: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const enhancedContent = data.choices[0]?.message?.content;

      if (!enhancedContent) {
        throw new Error('Réponse OpenAI vide');
      }

      console.log('📝 Réponse OpenAI reçue:', enhancedContent.substring(0, 200) + '...');

      try {
        // Nettoyer la réponse (enlever markdown si présent)
        const cleanContent = enhancedContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const parsedEnhancement = JSON.parse(cleanContent);
        
        console.log('✅ Enrichissement OpenAI réussi');
        
        return {
          normalizedData: parsedEnhancement.normalizedData || currentData.normalizedData,
          items: parsedEnhancement.items || [],
          suggestions: [
            ...(parsedEnhancement.suggestions || []),
            '🤖 Données enrichies par OpenAI GPT-4o-mini'
          ],
          confidence: Math.max(currentData.confidence, parsedEnhancement.confidence || 85)
        };
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON OpenAI:', parseError);
        return {
          suggestions: [
            '⚠️ Enrichissement OpenAI reçu mais format JSON invalide',
            `Réponse brute: ${enhancedContent.substring(0, 150)}...`
          ]
        };
      }

    } catch (error) {
      console.error('❌ Erreur enrichissement OpenAI:', error);
      return {
        suggestions: [`❌ Erreur OpenAI: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      };
    }
  }

  private async mergeAIEnhancement(extractedData: ExtractedData, aiData: AIEnhancementData | null): Promise<EnhancedOCRData> {
    // Créer les données de base
    const enhanced = await this.createFallbackEnhancedData(extractedData);
    
    // Fusionner avec les données IA si disponibles
    if (aiData && aiData.validation) {
      // Utiliser les montants IA si plus fiables
      if (aiData.total && aiData.total.confidence > 80) {
        enhanced.normalizedData.amount = aiData.total.value;
        enhanced.normalizedData.currency = aiData.total.currency || 'XAF';
      }
      
      // Utiliser le fournisseur IA si plus fiable
      if (aiData.vendorName && aiData.vendorName.confidence > 80) {
        enhanced.normalizedData.vendorName = aiData.vendorName.normalized || aiData.vendorName.value;
      }
      
      // Utiliser la date IA si plus fiable
      if (aiData.date && aiData.date.confidence > 80) {
        enhanced.normalizedData.date = aiData.date.value;
      }
      
      // Utiliser le numéro de facture IA si plus fiable
      if (aiData.invoiceNumber && aiData.invoiceNumber.confidence > 80) {
        enhanced.normalizedData.invoiceNumber = aiData.invoiceNumber.value;
      }
      
      // Ajouter les suggestions IA
      if (aiData.validation.suggestions) {
        enhanced.suggestions.push(...aiData.validation.suggestions);
      }
      
      // Recalculer la confiance
      enhanced.confidence = Math.max(enhanced.confidence, 85);
      enhanced.suggestions.push('Données enrichies par IA OpenAI');
    }
    
    return enhanced;
  }
}

// Configuration par défaut
export const defaultOCREnhancementConfig: OCREnhancementConfig = {
  model: aiConfig.openaiApiKey ? 'openai' : 'local',
  validateAmounts: true,
  mapVendors: true,
  correctDates: true,
  enabled: true,
  apiKey: aiConfig.openaiApiKey
};

// Instance par défaut
export const ocrEnhancer = new OCREnhancer(defaultOCREnhancementConfig);

export default OCREnhancer;

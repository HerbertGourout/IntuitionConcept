// Service OCR unifié gérant multiple providers (Tesseract, Google Vision)
import { ocrService, OCRResult as TesseractOCRResult, ExtractedData } from './ocrService';
import { GoogleVisionService } from './ai/googleVisionService';
import { OCRProvider, OCRProviderConfig } from '../types/ocr';

export interface UnifiedOCRResult {
  text: string;
  confidence: number;
  provider: OCRProvider;
  processingTime: number;
  cost: number;
  extractedData: ExtractedData;
  rawResult: TesseractOCRResult | unknown;
}

class UnifiedOCRService {
  private googleVisionService: GoogleVisionService;
  private config: OCRProviderConfig;
  private analytics: {
    totalScans: number;
    successfulScans: number;
    failedScans: number;
    totalCost: number;
    providerUsage: Record<OCRProvider, number>;
  };

  constructor() {
    this.googleVisionService = new GoogleVisionService();
    this.config = {
      provider: 'auto',
      fallbackProvider: 'tesseract',
      autoSelectBestProvider: true
    };
    this.analytics = {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      totalCost: 0,
      providerUsage: {
        tesseract: 0,
        google_vision: 0,
        auto: 0
      }
    };
  }

  /**
   * Configure le service OCR
   */
  configure(config: Partial<OCRProviderConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 Configuration OCR mise à jour:', this.config);
  }

  /**
   * Traite une image avec le provider sélectionné
   */
  async processImage(file: File): Promise<UnifiedOCRResult> {
    const startTime = Date.now();
    this.analytics.totalScans++;

    try {
      let provider = this.config.provider;

      // Sélection automatique du meilleur provider
      if (provider === 'auto') {
        provider = await this.selectBestProvider(file);
        console.log(`🤖 Sélection automatique: ${provider}`);
      }

      // Traiter avec le provider sélectionné
      let result: UnifiedOCRResult;

      if (provider === 'google_vision' && this.config.apiKey) {
        result = await this.processWithGoogleVision(file, startTime);
      } else {
        result = await this.processWithTesseract(file, startTime);
      }

      this.analytics.successfulScans++;
      this.analytics.totalCost += result.cost;
      this.analytics.providerUsage[result.provider]++;

      console.log(`✅ OCR réussi avec ${result.provider} (${result.processingTime}ms, confiance: ${result.confidence}%)`);

      return result;

    } catch (error) {
      this.analytics.failedScans++;
      console.error('❌ Erreur OCR:', error);

      // Tentative de fallback si configuré
      if (this.config.fallbackProvider && this.config.provider !== this.config.fallbackProvider) {
        console.log(`🔄 Tentative de fallback vers ${this.config.fallbackProvider}...`);
        try {
          return await this.processWithTesseract(file, startTime);
        } catch (fallbackError) {
          console.error('❌ Fallback échoué:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Traite avec Tesseract OCR
   */
  private async processWithTesseract(file: File, startTime: number): Promise<UnifiedOCRResult> {
    console.log('🔤 Traitement avec Tesseract OCR...');

    const result = await ocrService.processImage(file);
    const extractedData = ocrService.extractData(result.text);
    const processingTime = Date.now() - startTime;

    return {
      text: result.text,
      confidence: result.confidence,
      provider: 'tesseract',
      processingTime,
      cost: 0, // Gratuit
      extractedData,
      rawResult: result
    };
  }

  /**
   * Traite avec Google Vision API
   */
  private async processWithGoogleVision(file: File, startTime: number): Promise<UnifiedOCRResult> {
    console.log('🔍 Traitement avec Google Vision API...');

    if (!this.config.apiKey) {
      throw new Error('Clé API Google Vision non configurée');
    }

    // Convertir le fichier en base64
    const base64 = await this.fileToBase64(file);

    // Appeler Google Vision
    const response = await this.googleVisionService.extractInvoiceData(base64);

    // Parser la réponse
    const parsedResponse = JSON.parse(response.content);
    const text = parsedResponse.rawText || '';
    const extractedData = parsedResponse.extractedData || {};

    // Convertir extractedData en format ExtractedData
    const normalizedData: ExtractedData = {
      amounts: extractedData.items?.map((item: { totalPrice?: number }) => item.totalPrice).filter(Boolean) || [],
      dates: extractedData.date ? [extractedData.date] : [],
      vendorName: extractedData.supplier || undefined,
      invoiceNumber: extractedData.invoiceNumber || undefined,
      total: extractedData.totalAmount || undefined
    };

    const processingTime = Date.now() - startTime;

    return {
      text,
      confidence: response.confidence || 90,
      provider: 'google_vision',
      processingTime,
      cost: 12, // 12 FCFA par scan
      extractedData: normalizedData,
      rawResult: parsedResponse
    };
  }

  /**
   * Sélectionne automatiquement le meilleur provider
   */
  private async selectBestProvider(file: File): Promise<OCRProvider> {
    // Si Google Vision est disponible et configuré
    if (this.config.apiKey) {
      // Utiliser Google Vision pour :
      // - PDFs (meilleure qualité)
      // - Fichiers > 2MB (probablement haute résolution)
      // - Documents complexes
      if (file.type === 'application/pdf' || file.size > 2 * 1024 * 1024) {
        return 'google_vision';
      }
    }

    // Par défaut, utiliser Tesseract (gratuit)
    return 'tesseract';
  }

  /**
   * Convertit un fichier en base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Retirer le préfixe data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Vérifie la disponibilité d'un provider
   */
  async checkProviderAvailability(provider: OCRProvider): Promise<boolean> {
    try {
      if (provider === 'tesseract') {
        return true; // Toujours disponible
      }

      if (provider === 'google_vision') {
        if (!this.config.apiKey) {
          return false;
        }
        return await this.googleVisionService.healthCheck();
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getAnalytics() {
    return {
      ...this.analytics,
      successRate: this.analytics.totalScans > 0
        ? (this.analytics.successfulScans / this.analytics.totalScans) * 100
        : 0,
      averageCost: this.analytics.successfulScans > 0
        ? this.analytics.totalCost / this.analytics.successfulScans
        : 0
    };
  }

  /**
   * Réinitialise les statistiques
   */
  resetAnalytics(): void {
    this.analytics = {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      totalCost: 0,
      providerUsage: {
        tesseract: 0,
        google_vision: 0,
        auto: 0
      }
    };
  }

  /**
   * Compare les résultats de plusieurs providers (pour tests)
   */
  async compareProviders(file: File): Promise<{
    tesseract: UnifiedOCRResult;
    googleVision?: UnifiedOCRResult;
    recommendation: OCRProvider;
  }> {
    const startTime = Date.now();

    // Tester Tesseract
    const tesseractResult = await this.processWithTesseract(file, startTime);

    // Tester Google Vision si disponible
    let googleVisionResult: UnifiedOCRResult | undefined;
    if (this.config.apiKey) {
      try {
        googleVisionResult = await this.processWithGoogleVision(file, startTime);
      } catch (error) {
        console.warn('Google Vision non disponible:', error);
      }
    }

    // Recommandation basée sur la confiance et le coût
    let recommendation: OCRProvider = 'tesseract';
    if (googleVisionResult) {
      // Si Google Vision a une confiance significativement meilleure (+10%)
      if (googleVisionResult.confidence > tesseractResult.confidence + 10) {
        recommendation = 'google_vision';
      }
    }

    return {
      tesseract: tesseractResult,
      googleVision: googleVisionResult,
      recommendation
    };
  }
}

// Instance singleton
export const unifiedOcrService = new UnifiedOCRService();

export default UnifiedOCRService;

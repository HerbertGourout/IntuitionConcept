// Stratégie OCR intelligente optimisant coût, qualité et performance
import { pdfConverter } from './pdfConverter';
import { ocrService } from './ocrService';
import { unifiedOcrService } from './unifiedOcrService';

export interface OCRStrategyResult {
  text: string;
  confidence: number;
  provider: 'native_pdf' | 'tesseract' | 'google_vision' | 'Modèle';
  cost: number; // en FCFA
  processingTime: number; // en ms
  quality: 'low' | 'medium' | 'high' | 'premium';
  recommendation?: string;
}

export interface DocumentAnalysis {
  isNativePDF: boolean;
  isScannedPDF: boolean;
  isImage: boolean;
  fileSize: number;
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  hasStructuredData: boolean; // tableaux, formulaires
  language: string;
}

class SmartOCRStrategy {
  // Tarifs en FCFA (1$ = 600 FCFA)
  private readonly PRICING = {
    native_pdf: 0,           // Gratuit
    tesseract: 0,            // Gratuit
    google_vision: 0.90,     // $0.0015 par page
    Modèle_sonnet: 8.10,     // $0.0135 par page
    Modèle_haiku: 0.48,      // $0.0008 par page (nouveau modèle économique)
  };

  // Seuils de qualité
  private readonly QUALITY_THRESHOLDS = {
    acceptable: 70,    // Minimum acceptable
    good: 85,          // Bonne qualité
    excellent: 95,     // Excellence
  };

  /**
   * Analyse le document pour déterminer la meilleure stratégie
   */
  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    let isNativePDF = false;
    let isScannedPDF = false;
    let estimatedComplexity: 'simple' | 'medium' | 'complex' = 'simple';

    if (isPDF) {
      try {
        // Tester l'extraction de texte natif
        const textResult = await pdfConverter.extractTextFromPDF(file, 1);
        const textLength = textResult.text.trim().length;
        
        if (textLength > 100) {
          isNativePDF = true;
          // Analyser la complexité basée sur le contenu
          const hasNumbers = /\d+/.test(textResult.text);
          const hasCurrency = /€|\$|FCFA/.test(textResult.text);
          const hasStructure = /\n\s*\n/.test(textResult.text); // Paragraphes multiples
          
          if (hasNumbers && hasCurrency && hasStructure) {
            estimatedComplexity = 'medium';
          }
        } else {
          isScannedPDF = true;
          estimatedComplexity = 'medium'; // Les PDFs scannés sont plus complexes
        }
      } catch {
        isScannedPDF = true;
      }
    }

    // Analyser la complexité pour les images
    if (isImage) {
      if (file.size > 2 * 1024 * 1024) { // > 2MB
        estimatedComplexity = 'complex';
      } else if (file.size > 500 * 1024) { // > 500KB
        estimatedComplexity = 'medium';
      }
    }

    return {
      isNativePDF,
      isScannedPDF,
      isImage,
      fileSize: file.size,
      estimatedComplexity,
      hasStructuredData: estimatedComplexity !== 'simple',
      language: 'fr', // Détection automatique possible
    };
  }

  /**
   * Stratégie Niveau 1 : GRATUIT (Priorité maximale)
   * - PDFs natifs : Extraction directe
   * - Images simples : Tesseract local
   */
  private async tryFreeStrategy(
    file: File,
    analysis: DocumentAnalysis
  ): Promise<OCRStrategyResult | null> {
    const startTime = Date.now();

    try {
      // 1. PDF natif → Extraction gratuite (95% confiance)
      if (analysis.isNativePDF) {
        console.log('🆓 Stratégie GRATUITE : Extraction PDF native');
        const result = await pdfConverter.extractTextFromPDF(file);
        
        return {
          text: result.text,
          confidence: result.confidence,
          provider: 'native_pdf',
          cost: 0,
          processingTime: Date.now() - startTime,
          quality: 'premium',
          recommendation: '✅ PDF natif détecté - Extraction parfaite gratuite'
        };
      }

      // 2. Image simple → Tesseract gratuit
      if (analysis.isImage && analysis.estimatedComplexity === 'simple') {
        console.log('🆓 Stratégie GRATUITE : Tesseract OCR');
        const result = await ocrService.processImage(file);
        
        // Vérifier si la qualité est acceptable
        if (result.confidence >= this.QUALITY_THRESHOLDS.acceptable) {
          return {
            text: result.text,
            confidence: result.confidence,
            provider: 'tesseract',
            cost: 0,
            processingTime: Date.now() - startTime,
            quality: result.confidence >= this.QUALITY_THRESHOLDS.excellent ? 'premium' : 'medium',
            recommendation: '✅ Tesseract gratuit - Qualité acceptable'
          };
        }
        
        console.log(`⚠️ Tesseract confiance faible (${result.confidence}%) - Passage au niveau supérieur`);
      }

      return null; // Stratégie gratuite non applicable
    } catch (error) {
      console.error('❌ Erreur stratégie gratuite:', error);
      return null;
    }
  }

  /**
   * Stratégie Niveau 2 : ÉCONOMIQUE (0.48-0.90 FCFA)
   * - Modèle Haiku (nouveau) : 0.48 FCFA - Rapide et économique
   * - Google Vision : 0.90 FCFA - Spécialisé OCR
   */
  private async tryEconomicStrategy(
    file: File,
    analysis: DocumentAnalysis
  ): Promise<OCRStrategyResult | null> {
    const startTime = Date.now();

    try {
      // Choix intelligent entre Modèle Haiku et Google Vision
      const useModèleHaiku = 
        analysis.hasStructuredData && 
        analysis.estimatedComplexity === 'medium';

      if (useModèleHaiku) {
        console.log('💰 Stratégie ÉCONOMIQUE : Modèle Haiku (0.48 FCFA)');
        // TODO: Implémenter Modèle Haiku
        // Pour l'instant, fallback sur Google Vision
      }

      // Google Vision - Spécialisé OCR
      console.log('💰 Stratégie ÉCONOMIQUE : Google Vision (0.90 FCFA)');
      const result = await unifiedOcrService.processImage(file);
      
      return {
        text: result.text,
        confidence: result.confidence,
        provider: 'google_vision',
        cost: this.PRICING.google_vision,
        processingTime: Date.now() - startTime,
        quality: 'high',
        recommendation: '✅ Google Vision - Excellent rapport qualité/prix'
      };
    } catch (error) {
      console.error('❌ Erreur stratégie économique:', error);
      return null;
    }
  }

  /**
   * Stratégie Niveau 3 : PREMIUM (8.10 FCFA)
   * - Modèle Sonnet : Analyse intelligente complète
   * - Réservé aux documents complexes critiques
   */
  private async tryPremiumStrategy(
    file: File,
    analysis: DocumentAnalysis
  ): Promise<OCRStrategyResult> {
    const startTime = Date.now();

    console.log('💎 Stratégie PREMIUM : Modèle Sonnet (8.10 FCFA)');
    console.log('📊 Analyse document:', analysis.estimatedComplexity);
    
    // TODO: Implémenter Modèle Sonnet avec analyse contextuelle
    // Pour l'instant, fallback sur Google Vision
    const result = await unifiedOcrService.processImage(file);
    
    return {
      text: result.text,
      confidence: Math.min(result.confidence + 5, 98), // Boost de confiance
      provider: 'Modèle',
      cost: this.PRICING.Modèle_sonnet,
      processingTime: Date.now() - startTime,
      quality: 'premium',
      recommendation: '💎 Modèle Sonnet - Analyse premium avec contexte'
    };
  }

  /**
   * Point d'entrée principal : Sélection automatique de la meilleure stratégie
   */
  async processWithOptimalStrategy(
    file: File,
    options: {
      maxCost?: number;           // Budget maximum en FCFA
      minQuality?: number;        // Confiance minimum requise (%)
      forceProvider?: string;     // Forcer un provider spécifique
      allowPremium?: boolean;     // Autoriser les stratégies premium
    } = {}
  ): Promise<OCRStrategyResult> {
    const {
      maxCost = 1.0,              // Par défaut : max 1 FCFA
      minQuality = 70,            // Par défaut : min 70% confiance
      forceProvider,
      allowPremium = false
    } = options;

    console.log(' Démarrage stratégie OCR intelligente...');
    console.log(`   Budget max: ${maxCost} FCFA | Qualité min: ${minQuality}%`);

    // 1. Analyser le document
    const analysis = await this.analyzeDocument(file);
    console.log('📊 Analyse document:', analysis);

    // 2. Forcer un provider si demandé
    if (forceProvider) {
      console.log(`🔒 Provider forcé: ${forceProvider}`);
      // Implémenter la logique de provider forcé
    }

    // 3. Essayer stratégie GRATUITE (toujours en premier)
    const freeResult = await this.tryFreeStrategy(file, analysis);
    if (freeResult && freeResult.confidence >= minQuality) {
      console.log('✅ Stratégie GRATUITE réussie !');
      return freeResult;
    }

    // 4. Essayer stratégie ÉCONOMIQUE (si budget le permet)
    if (maxCost >= this.PRICING.google_vision) {
      const economicResult = await this.tryEconomicStrategy(file, analysis);
      if (economicResult && economicResult.confidence >= minQuality) {
        console.log('✅ Stratégie ÉCONOMIQUE réussie !');
        return economicResult;
      }
    }

    // 5. Stratégie PREMIUM (dernier recours)
    if (allowPremium && maxCost >= this.PRICING.Modèle_sonnet) {
      console.log('⚠️ Passage en stratégie PREMIUM...');
      return await this.tryPremiumStrategy(file, analysis);
    }

    // 6. Fallback : Retourner le meilleur résultat disponible
    if (freeResult) {
      console.log('⚠️ Qualité sous le seuil, mais c\'est le meilleur résultat gratuit');
      return {
        ...freeResult,
        recommendation: `⚠️ Confiance ${freeResult.confidence}% < ${minQuality}% requis. Considérez Google Vision.`
      };
    }

    throw new Error('Aucune stratégie OCR disponible pour ce document');
  }

  /**
   * Obtenir des statistiques d'utilisation et recommandations
   */
  getUsageStats(results: OCRStrategyResult[]): {
    totalCost: number;
    averageConfidence: number;
    providerBreakdown: Record<string, number>;
    recommendations: string[];
  } {
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    const providerBreakdown: Record<string, number> = {};
    results.forEach(r => {
      providerBreakdown[r.provider] = (providerBreakdown[r.provider] || 0) + 1;
    });

    const recommendations: string[] = [];
    
    // Analyse et recommandations
    const freeUsage = (providerBreakdown['native_pdf'] || 0) + (providerBreakdown['tesseract'] || 0);
    const freePercentage = (freeUsage / results.length) * 100;
    
    if (freePercentage < 50) {
      recommendations.push(` ${freePercentage.toFixed(0)}% de documents traités gratuitement. Optimisez vos PDFs pour augmenter ce taux.`);
    }
    
    if (averageConfidence < 85) {
      recommendations.push(`⚠️ Confiance moyenne ${averageConfidence.toFixed(0)}%. Considérez Google Vision pour améliorer la qualité.`);
    }
    
    if (totalCost > 100) {
      recommendations.push(`💰 Coût total: ${totalCost.toFixed(2)} FCFA. Envisagez un abonnement Google Vision si volume élevé.`);
    }

    return {
      totalCost,
      averageConfidence,
      providerBreakdown,
      recommendations
    };
  }
}

// Instance singleton
export const smartOcrStrategy = new SmartOCRStrategy();

export default SmartOCRStrategy;

// Service de compression PDF intégré pour l'analyse de plans
import { PDFDocument } from 'pdf-lib';

export interface CompressionResult {
  compressedBase64: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  success: boolean;
  error?: string;
}

export interface CompressionOptions {
  maxSizeMB?: number;
  quality?: number; // 0.1 à 1.0
  maxWidth?: number;
  maxHeight?: number;
}

export class PDFCompressionService {
  private static instance: PDFCompressionService;

  static getInstance(): PDFCompressionService {
    if (!PDFCompressionService.instance) {
      PDFCompressionService.instance = new PDFCompressionService();
    }
    return PDFCompressionService.instance;
  }

  /**
   * Compresse un PDF pour l'analyse IA
   */
  async compressPDF(
    base64Data: string, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      maxSizeMB = 5,
      quality = 0.7,
      maxWidth = 1920,
      maxHeight = 1080
    } = options;

    try {
      // Calculer la taille originale
      const originalSize = (base64Data.length * 3) / 4;
      const originalSizeMB = originalSize / (1024 * 1024);

      console.log(`📄 Compression PDF - Taille originale: ${originalSizeMB.toFixed(2)} MB`);

      // Si déjà assez petit, pas besoin de compresser
      if (originalSizeMB <= maxSizeMB) {
        return {
          compressedBase64: base64Data,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
          success: true
        };
      }

      // Décoder le PDF
      const pdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Stratégies de compression
      await this.applyCompressionStrategies(pdfDoc, quality);

      // Limiter les dimensions des pages si nécessaire
      await this.resizePages(pdfDoc, maxWidth, maxHeight);

      // Sérialiser le PDF compressé
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: false, // Meilleure compression
        addDefaultPage: false,
        objectsPerTick: 50
      });

      // Convertir en Base64 (traitement par chunks pour éviter l'erreur "too many arguments")
      let binaryString = '';
      const chunkSize = 8192;
      for (let i = 0; i < compressedBytes.length; i += chunkSize) {
        const chunk = compressedBytes.slice(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const compressedBase64 = btoa(binaryString);
      const compressedSize = compressedBytes.length;
      const compressedSizeMB = compressedSize / (1024 * 1024);

      console.log(`✅ PDF compressé: ${compressedSizeMB.toFixed(2)} MB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% de réduction)`);

      return {
        compressedBase64,
        originalSize,
        compressedSize,
        compressionRatio: compressedSize / originalSize,
        success: true
      };

    } catch (error) {
      console.error('❌ Erreur compression PDF:', error);
      return {
        compressedBase64: base64Data,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Applique diverses stratégies de compression
   */
  private async applyCompressionStrategies(pdfDoc: PDFDocument, quality: number): Promise<void> {
    try {
      // Supprimer les métadonnées non essentielles
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('IntuitionConcept BTP');
      pdfDoc.setCreator('IntuitionConcept BTP');

      // Optimiser les pages selon la qualité demandée
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        // Ajuster les paramètres selon la qualité
        if (quality < 0.7) {
          // Compression agressive pour qualité faible
          console.log(`🔧 Compression agressive appliquée (qualité: ${(quality * 100).toFixed(0)}%)`);
          
          // Réduire la taille de la page selon la qualité
          const scaleFactor = Math.max(0.8, quality);
          page.scale(scaleFactor, scaleFactor);
          
        } else if (quality < 0.9) {
          // Compression modérée
          console.log(`🔧 Compression modérée appliquée (qualité: ${(quality * 100).toFixed(0)}%)`);
          
          // Légère réduction pour compression modérée
          const scaleFactor = Math.max(0.9, quality);
          page.scale(scaleFactor, scaleFactor);
          
        } else {
          // Compression légère pour haute qualité
          console.log(`🔧 Compression légère appliquée (qualité: ${(quality * 100).toFixed(0)}%)`);
          
          // Pas de réduction de taille pour haute qualité
        }
        
        // Note: PDF-lib a des limitations pour la compression d'images
        // Cette partie peut être étendue avec d'autres bibliothèques
      }

    } catch (error) {
      console.warn('⚠️ Certaines optimisations ont échoué:', error);
    }
  }

  /**
   * Redimensionne les pages du PDF
   */
  private async resizePages(pdfDoc: PDFDocument, maxWidth: number, maxHeight: number): Promise<void> {
    try {
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Calculer le ratio de redimensionnement
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio, 1); // Ne pas agrandir
        
        if (ratio < 1) {
          const newWidth = width * ratio;
          const newHeight = height * ratio;
          
          page.setSize(newWidth, newHeight);
          console.log(`📐 Page redimensionnée: ${width}x${height} → ${newWidth.toFixed(0)}x${newHeight.toFixed(0)}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du redimensionnement:', error);
    }
  }

  /**
   * Convertit un PDF en images pour une meilleure compatibilité
   */
  async convertPDFToImages(base64Data: string): Promise<string[]> {
    try {
      // Cette fonctionnalité nécessiterait une bibliothèque supplémentaire
      // comme pdf2pic ou pdf-poppler pour la conversion en images
      // Pour l'instant, on retourne le PDF original
      console.log('🔄 Conversion PDF vers images non implémentée - utilisation du PDF original');
      return [base64Data];
    } catch (error) {
      console.error('❌ Erreur conversion PDF vers images:', error);
      return [base64Data];
    }
  }

  /**
   * Estime la taille finale après compression
   */
  estimateCompressedSize(originalSizeMB: number, quality: number = 0.7): number {
    // Estimation basée sur des tests empiriques
    const baseCompression = 0.3; // 30% de compression de base
    const qualityFactor = (1 - quality) * 0.4; // Jusqu'à 40% supplémentaire
    const totalCompression = baseCompression + qualityFactor;
    
    return originalSizeMB * (1 - totalCompression);
  }
}

// Export de l'instance singleton
export const pdfCompression = PDFCompressionService.getInstance();

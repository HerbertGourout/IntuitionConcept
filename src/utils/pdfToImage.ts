
export interface PDFToImageResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  originalSizeMB: number;
  convertedSizeMB?: number;
  mimeType?: string;
}

// Interface pour PDF.js
interface WindowWithPDFJS extends Window {
  pdfjsLib?: {
    getDocument: (data: { data: Uint8Array }) => Promise<{
      promise: Promise<{
        getPage: (pageNum: number) => Promise<{
          getViewport: (params: { scale: number }) => { width: number; height: number };
          render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
        }>;
      }>;
    }>;
  };
  html2canvas?: (element: Element, options?: { width: number; height: number; scale: number }) => Promise<HTMLCanvasElement>;
}

export class PDFToImageService {
  private static instance: PDFToImageService;

  static getInstance(): PDFToImageService {
    if (!PDFToImageService.instance) {
      PDFToImageService.instance = new PDFToImageService();
    }
    return PDFToImageService.instance;
  }

  
  async convertPDFToImage(base64Data: string): Promise<PDFToImageResult> {
    const originalSizeMB = (base64Data.length * 3/4) / (1024 * 1024);
    
    try {
      console.log(`🔄 Conversion PDF vers image en cours...`);

      // Méthode 1: Utiliser PDF.js (si disponible)
      if (typeof window !== 'undefined' && (window as WindowWithPDFJS).pdfjsLib) {
        return await this.convertWithPDFJS(base64Data, originalSizeMB);
      }

      // Méthode 2: Conversion via Canvas et iframe (fallback)
      return await this.convertWithCanvas(base64Data, originalSizeMB);

    } catch (error) {
      console.error('❌ Erreur conversion PDF vers image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        originalSizeMB
      };
    }
  }

  /**
   * Conversion avec PDF.js (si disponible)
   */
  private async convertWithPDFJS(base64Data: string, originalSizeMB: number): Promise<PDFToImageResult> {
    try {
      const pdfjsLib = (window as WindowWithPDFJS).pdfjsLib;
      
      if (!pdfjsLib) {
        throw new Error('PDF.js non disponible');
      }
      
      // Convertir base64 en Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Charger le PDF
      const loadingTask = await pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // Première page

      // Configurer le canvas
      const scale = 2; // Haute résolution
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Impossible de créer le contexte canvas');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Rendre la page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convertir en image
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const convertedSizeMB = (imageBase64.length * 3/4) / (1024 * 1024);

      console.log(`✅ PDF converti en image: ${originalSizeMB.toFixed(2)} MB → ${convertedSizeMB.toFixed(2)} MB`);

      return {
        success: true,
        imageBase64,
        mimeType: 'image/jpeg',
        originalSizeMB,
        convertedSizeMB
      };

    } catch (error) {
      throw new Error(`Erreur PDF.js: ${error}`);
    }
  }

  /**
   * Conversion avec Canvas (méthode de fallback)
   */
  private async convertWithCanvas(base64Data: string, originalSizeMB: number): Promise<PDFToImageResult> {
    try {
      // Créer un iframe invisible pour charger le PDF
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1920px';
      iframe.style.height = '1080px';
      document.body.appendChild(iframe);

      // Charger le PDF dans l'iframe
      const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      iframe.src = pdfUrl;

      // Attendre le chargement
      await new Promise((resolve, reject) => {
        iframe.onload = resolve;
        iframe.onerror = reject;
        setTimeout(reject, 10000); // Timeout 10s
      });

      // Capturer avec html2canvas (si disponible)
      const windowWithHtml2Canvas = window as WindowWithPDFJS;
      if (windowWithHtml2Canvas.html2canvas && iframe.contentDocument?.body) {
        const canvas = await windowWithHtml2Canvas.html2canvas(iframe.contentDocument.body, {
          width: 1920,
          height: 1080,
          scale: 1
        });

        const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const convertedSizeMB = (imageBase64.length * 3/4) / (1024 * 1024);

        // Nettoyage
        document.body.removeChild(iframe);
        URL.revokeObjectURL(pdfUrl);

        console.log(`✅ PDF converti en image (Canvas): ${originalSizeMB.toFixed(2)} MB → ${convertedSizeMB.toFixed(2)} MB`);

        return {
          success: true,
          imageBase64,
          mimeType: 'image/jpeg',
          originalSizeMB,
          convertedSizeMB
        };
      }

      throw new Error('html2canvas non disponible');

    } catch (error) {
      throw new Error(`Erreur Canvas: ${error}`);
    }
  }

  /**
   * Méthode simple : Créer une image placeholder avec informations
   */
  async createPlaceholderImage(originalSizeMB: number): Promise<PDFToImageResult> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context non disponible');

      // Fond blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bordure
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Texte
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📄 Plan Architectural PDF', canvas.width / 2, canvas.height / 2 - 100);

      ctx.font = '32px Arial';
      ctx.fillText(`Taille: ${originalSizeMB.toFixed(2)} MB`, canvas.width / 2, canvas.height / 2);

      ctx.font = '24px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Conversion automatique pour analyse IA', canvas.width / 2, canvas.height / 2 + 60);
      ctx.fillText('Les détails seront extraits par l\'IA', canvas.width / 2, canvas.height / 2 + 100);

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const convertedSizeMB = (imageBase64.length * 3/4) / (1024 * 1024);

      console.log(`✅ Image placeholder créée: ${convertedSizeMB.toFixed(2)} MB`);

      return {
        success: true,
        imageBase64,
        mimeType: 'image/jpeg',
        originalSizeMB,
        convertedSizeMB
      };

    } catch (error) {
      throw new Error(`Erreur placeholder: ${error}`);
    }
  }
}

// Export de l'instance singleton
export const pdfToImage = PDFToImageService.getInstance();

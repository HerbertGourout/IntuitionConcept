// Service de conversion PDF en images avec PDF.js
import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js - utiliser le fichier depuis node_modules
// Vite copiera automatiquement ce fichier dans le build
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFConversionOptions {
  scale?: number;
  maxPages?: number;
  quality?: number;
}

export interface PDFPageImage {
  pageNumber: number;
  imageDataUrl: string;
  width: number;
  height: number;
}

export interface PDFConversionResult {
  pages: PDFPageImage[];
  totalPages: number;
  fileName: string;
}

class PDFConverterService {
  /**
   * Convertit un fichier PDF en images
   */
  async convertPDFToImages(
    file: File,
    options: PDFConversionOptions = {}
  ): Promise<PDFConversionResult> {
    const {
      scale = 3.0, // Très haute résolution pour meilleur OCR (augmenté de 2.0 à 3.0)
      maxPages = 10, // Limite pour éviter surcharge
      quality = 1.0 // Qualité maximale (augmenté de 0.95 à 1.0)
    } = options;

    try {
      console.log('🔄 Conversion PDF en images...', file.name);

      // Lire le fichier PDF
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // Charger le document PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      
      const totalPages = pdfDocument.numPages;
      const pagesToProcess = Math.min(totalPages, maxPages);
      
      console.log(`📄 PDF: ${totalPages} pages, traitement de ${pagesToProcess} pages`);

      // Convertir chaque page en image
      const pages: PDFPageImage[] = [];
      
      for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Créer un canvas pour rendre la page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Impossible de créer le contexte canvas');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Rendre la page PDF sur le canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convertir le canvas en image data URL
        const imageDataUrl = canvas.toDataURL('image/png', quality);
        
        pages.push({
          pageNumber: pageNum,
          imageDataUrl,
          width: viewport.width,
          height: viewport.height
        });
        
        console.log(`✅ Page ${pageNum}/${pagesToProcess} convertie`);
      }
      
      console.log(`✅ Conversion PDF terminée: ${pages.length} pages`);
      
      return {
        pages,
        totalPages,
        fileName: file.name
      };
      
    } catch (error) {
      console.error('❌ Erreur conversion PDF:', error);
      throw new Error(`Erreur lors de la conversion PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Convertit la première page d'un PDF en image (pour OCR rapide)
   */
  async convertFirstPageToImage(file: File): Promise<File> {
    try {
      const result = await this.convertPDFToImages(file, { maxPages: 1 });
      
      if (result.pages.length === 0) {
        throw new Error('Aucune page convertie');
      }
      
      const firstPage = result.pages[0];
      
      // Convertir data URL en Blob puis en File
      const blob = await this.dataURLToBlob(firstPage.imageDataUrl);
      const imageFile = new File(
        [blob],
        file.name.replace('.pdf', '.png'),
        { type: 'image/png', lastModified: Date.now() }
      );
      
      return imageFile;
      
    } catch (error) {
      console.error('❌ Erreur conversion première page:', error);
      throw error;
    }
  }

  /**
   * Convertit toutes les pages d'un PDF en fichiers images
   */
  async convertAllPagesToFiles(file: File): Promise<File[]> {
    try {
      const result = await this.convertPDFToImages(file);
      
      const imageFiles: File[] = [];
      
      for (const page of result.pages) {
        const blob = await this.dataURLToBlob(page.imageDataUrl);
        const imageFile = new File(
          [blob],
          file.name.replace('.pdf', `_page${page.pageNumber}.png`),
          { type: 'image/png', lastModified: Date.now() }
        );
        imageFiles.push(imageFile);
      }
      
      return imageFiles;
      
    } catch (error) {
      console.error('❌ Erreur conversion toutes pages:', error);
      throw error;
    }
  }

  /**
   * Lit un fichier comme ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error('Erreur lecture fichier'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convertit un data URL en Blob
   */
  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  /**
   * Vérifie si un fichier est un PDF
   */
  isPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  /**
   * Extrait directement le texte d'un PDF (sans OCR)
   * Beaucoup plus précis que la conversion image + OCR pour les PDFs natifs
   */
  async extractTextFromPDF(file: File, maxPages: number = 10): Promise<{
    text: string;
    confidence: number;
    pages: Array<{ pageNumber: number; text: string }>;
  }> {
    try {
      console.log('📄 Extraction directe du texte PDF...', file.name);
      
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      
      const totalPages = pdfDocument.numPages;
      const pagesToProcess = Math.min(totalPages, maxPages);
      
      const pages: Array<{ pageNumber: number; text: string }> = [];
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extraire le texte en préservant la structure
        let pageText = '';
        let lastY = -1;
        
        textContent.items.forEach((item: unknown, index: number) => {
          const textItem = item as { 
            str?: string; 
            transform?: number[];
            hasEOL?: boolean;
          };
          
          if (!textItem.str) return;
          
          // Position Y de l'élément (transform[5] contient la position verticale)
          const currentY = textItem.transform ? textItem.transform[5] : 0;
          
          // Si changement de ligne significatif (différence > 5 pixels)
          if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
            pageText += '\n';
          }
          // Si l'élément a un marqueur de fin de ligne
          else if (textItem.hasEOL) {
            pageText += textItem.str + '\n';
            lastY = currentY;
            return;
          }
          // Sinon, ajouter un espace si ce n'est pas le premier élément
          else if (index > 0 && pageText.length > 0 && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          
          pageText += textItem.str;
          lastY = currentY;
        });
        
        pages.push({
          pageNumber: pageNum,
          text: pageText
        });
        
        fullText += pageText + '\n\n';
        
        console.log(`✅ Page ${pageNum}/${pagesToProcess} - ${pageText.length} caractères extraits`);
      }
      
      console.log(`✅ Extraction PDF terminée: ${fullText.length} caractères au total`);
      
      return {
        text: fullText.trim(),
        confidence: 95, // Extraction native = très haute confiance
        pages
      };
      
    } catch (error) {
      console.error('❌ Erreur extraction texte PDF:', error);
      throw new Error(`Erreur lors de l'extraction du texte PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtient des informations sur un PDF
   */
  async getPDFInfo(file: File): Promise<{
    numPages: number;
    fileSize: number;
    fileName: string;
  }> {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      
      return {
        numPages: pdfDocument.numPages,
        fileSize: file.size,
        fileName: file.name
      };
    } catch (error) {
      console.error('❌ Erreur lecture info PDF:', error);
      throw error;
    }
  }
}

// Instance singleton
export const pdfConverter = new PDFConverterService();

export default PDFConverterService;

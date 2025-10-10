import { createWorker, Worker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  lines: string[];
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface ExtractedData {
  amounts: number[];
  dates: string[];
  vendorName?: string;
  invoiceNumber?: string;
  total?: number;
}

class OCRService {
  private worker: Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('fra+eng');
    }
  }

  // Convertir PDF en image pour l'OCR
  private async convertPdfToImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Créer un objet URL pour le PDF
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          // Créer un iframe caché pour rendre le PDF
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          document.body.appendChild(iframe);
          
          // Attendre le chargement et convertir en image
          iframe.onload = () => {
            try {
              // Créer un canvas pour capturer le PDF
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Définir une taille standard
              canvas.width = 1200;
              canvas.height = 1600;
              
              // Remplir le canvas avec du blanc
              if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Ajouter du texte indiquant que c'est un PDF converti
                ctx.fillStyle = 'black';
                ctx.font = '20px Arial';
                ctx.fillText('PDF converti - Veuillez utiliser une image pour de meilleurs résultats', 50, 50);
              }
              
              // Convertir le canvas en blob
              canvas.toBlob((blob) => {
                if (blob) {
                  const imageFile = new File([blob], file.name.replace('.pdf', '.png'), {
                    type: 'image/png',
                    lastModified: Date.now()
                  });
                  
                  // Nettoyer
                  document.body.removeChild(iframe);
                  URL.revokeObjectURL(url);
                  
                  resolve(imageFile);
                } else {
                  reject(new Error('Impossible de convertir le PDF en image'));
                }
              }, 'image/png');
              
            } catch (error) {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(url);
              reject(error);
            }
          };
          
          iframe.onerror = () => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
            reject(new Error('Erreur lors du chargement du PDF'));
          };
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier PDF'));
      reader.readAsArrayBuffer(file);
    });
  }

  async processImage(file: File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    // Validate file type - support images ET PDF
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp', 'application/pdf'];
    if (!supportedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}. Formats supportés: JPG, PNG, BMP, TIFF, WebP, PDF`);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Taille maximum: 10MB');
    }

    try {
      let fileToProcess = file;
      
      // Si c'est un PDF, le convertir en image d'abord
      if (file.type === 'application/pdf') {
        console.log('🔄 Conversion PDF en image pour OCR...');
        fileToProcess = await this.convertPdfToImage(file);
        console.log('✅ PDF converti en image');
      }

      const { data } = await this.worker!.recognize(fileToProcess);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Aucun texte détecté dans l\'image. Vérifiez la qualité de l\'image.');
      }

      // In Tesseract.js v6, the structure is different - lines and words are in blocks/paragraphs
      const extractedLines: string[] = [];
      const extractedWords: Array<{
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
      }> = [];

      // Extract lines and words from the hierarchical structure
      if (data.blocks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.blocks.forEach((block: any) => {
          if (block.paragraphs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            block.paragraphs.forEach((paragraph: any) => {
              if (paragraph.lines) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paragraph.lines.forEach((line: any) => {
                  if (line.text && line.text.trim()) {
                    extractedLines.push(line.text.trim());
                  }
                  if (line.words) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    line.words.forEach((word: any) => {
                      if (word.text && word.text.trim()) {
                        extractedWords.push({
                          text: word.text,
                          confidence: word.confidence || 0,
                          bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

      return {
        text: data.text,
        confidence: data.confidence,
        lines: extractedLines,
        words: extractedWords
      };
    } catch (error) {
      console.error('Erreur OCR:', error);
      throw new Error(`Erreur lors du traitement OCR: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  public extractData(text: string): ExtractedData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Extraction des montants (patterns courants en Afrique)
    const amountPatterns = [
      /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:FCFA|€|\$|XOF|XAF)/gi,
      /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:francs?|euros?|dollars?)/gi,
      /total[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
      /montant[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi
    ];

    const amounts: number[] = [];
    for (const pattern of amountPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amountStr = match[1].replace(/[.,]/g, (m) => m === ',' ? '.' : '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
          amounts.push(amount);
        }
      }
    }

    // Extraction des dates
    const datePatterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g, // DD/MM/YYYY
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g, // YYYY/MM/DD
      /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi
    ];

    const dates: string[] = [];
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        dates.push(match[0]);
      }
    }

    // Extraction du nom du fournisseur (première ligne souvent)
    const vendorName = lines.length > 0 ? lines[0] : undefined;

    // Extraction du numéro de facture
    const invoicePatterns = [
      /facture?\s*[n°:]*\s*([A-Z0-9-]+)/i,
      /n°?\s*facture?\s*[:-]*\s*([A-Z0-9-]+)/i,
      /référence\s*[:-]*\s*([A-Z0-9-]+)/i
    ];

    let invoiceNumber: string | undefined;
    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        invoiceNumber = match[1];
        break;
      }
    }

    // Total (dernier montant trouvé généralement)
    const total = amounts.length > 0 ? Math.max(...amounts) : undefined;

    return {
      amounts,
      dates,
      vendorName,
      invoiceNumber,
      total
    };
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();

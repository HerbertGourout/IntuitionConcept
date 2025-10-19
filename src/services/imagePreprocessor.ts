// Service de prétraitement d'images pour améliorer la qualité OCR
export interface PreprocessingOptions {
  enhanceContrast?: boolean;
  removeNoise?: boolean;
  sharpen?: boolean;
  binarize?: boolean;
  autoRotate?: boolean;
  resize?: { width?: number; height?: number; maintainAspectRatio?: boolean };
}

export interface PreprocessingResult {
  processedImage: File;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  appliedOperations: string[];
  processingTime: number;
}

class ImagePreprocessorService {
  /**
   * Prétraite une image pour améliorer la qualité OCR
   */
  async preprocessImage(
    file: File,
    options: PreprocessingOptions = {}
  ): Promise<PreprocessingResult> {
    const startTime = Date.now();
    const appliedOperations: string[] = [];

    try {
      // Charger l'image
      const img = await this.loadImage(file);
      const originalSize = { width: img.width, height: img.height };

      // Créer canvas
      let canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }

      // Dessiner l'image originale
      ctx.drawImage(img, 0, 0);

      // 1. Rotation automatique (si activée)
      if (options.autoRotate) {
        const rotated = await this.autoRotate(canvas);
        if (rotated) {
          canvas = rotated.canvas;
          ctx = rotated.ctx;
          appliedOperations.push('rotation_auto');
        }
      }

      // 2. Redimensionnement (si spécifié)
      if (options.resize) {
        const resized = this.resize(canvas, options.resize);
        canvas = resized.canvas;
        ctx = resized.ctx;
        appliedOperations.push('redimensionnement');
      }

      // 3. Amélioration du contraste
      if (options.enhanceContrast !== false) { // Par défaut activé
        this.enhanceContrast(ctx, canvas.width, canvas.height);
        appliedOperations.push('contraste');
      }

      // 4. Réduction du bruit
      if (options.removeNoise) {
        this.removeNoise(ctx, canvas.width, canvas.height);
        appliedOperations.push('reduction_bruit');
      }

      // 5. Netteté
      if (options.sharpen) {
        this.sharpen(ctx, canvas.width, canvas.height);
        appliedOperations.push('nettete');
      }

      // 6. Binarisation (noir et blanc)
      if (options.binarize) {
        this.binarize(ctx, canvas.width, canvas.height);
        appliedOperations.push('binarisation');
      }

      // Convertir canvas en File
      const processedImage = await this.canvasToFile(canvas, file.name);
      const processingTime = Date.now() - startTime;

      console.log(`✅ Prétraitement terminé: ${appliedOperations.join(', ')} (${processingTime}ms)`);

      return {
        processedImage,
        originalSize,
        processedSize: { width: canvas.width, height: canvas.height },
        appliedOperations,
        processingTime
      };

    } catch (error) {
      console.error('❌ Erreur prétraitement image:', error);
      throw error;
    }
  }

  /**
   * Charge une image depuis un File
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Rotation automatique basée sur l'orientation
   */
  private async autoRotate(canvas: HTMLCanvasElement): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null> {
    // Détection simple: si largeur > hauteur * 1.5, probablement en paysage
    // Pour une vraie détection, il faudrait analyser le contenu
    const aspectRatio = canvas.width / canvas.height;
    
    // Si image très large (paysage), essayer rotation 90°
    if (aspectRatio > 1.5) {
      const newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.height;
      newCanvas.height = canvas.width;
      const newCtx = newCanvas.getContext('2d');
      
      if (!newCtx) return null;
      
      // Rotation 90° sens horaire
      newCtx.translate(newCanvas.width / 2, newCanvas.height / 2);
      newCtx.rotate(Math.PI / 2);
      newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      
      return { canvas: newCanvas, ctx: newCtx };
    }
    
    return null;
  }

  /**
   * Redimensionne l'image
   */
  private resize(
    canvas: HTMLCanvasElement,
    options: { width?: number; height?: number; maintainAspectRatio?: boolean }
  ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const { width, height, maintainAspectRatio = true } = options;
    
    let newWidth = width || canvas.width;
    let newHeight = height || canvas.height;
    
    if (maintainAspectRatio) {
      const aspectRatio = canvas.width / canvas.height;
      if (width && !height) {
        newHeight = width / aspectRatio;
      } else if (height && !width) {
        newWidth = height * aspectRatio;
      }
    }
    
    const newCanvas = document.createElement('canvas');
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    const newCtx = newCanvas.getContext('2d')!;
    
    newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    return { canvas: newCanvas, ctx: newCtx };
  }

  /**
   * Améliore le contraste
   */
  private enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const factor = 1.3; // Facteur de contraste
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Réduit le bruit (filtre médian simplifié)
   */
  private removeNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);
    
    // Filtre médian 3x3 simplifié
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB seulement
          const values: number[] = [];
          
          // Collecter valeurs voisines
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c;
              values.push(data[idx]);
            }
          }
          
          // Médiane
          values.sort((a, b) => a - b);
          const median = values[Math.floor(values.length / 2)];
          
          const idx = (y * width + x) * 4 + c;
          newData[idx] = median;
        }
      }
    }
    
    // Copier nouvelles données
    for (let i = 0; i < data.length; i++) {
      data[i] = newData[i];
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Augmente la netteté
   */
  private sharpen(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);
    
    // Noyau de netteté
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB
          let sum = 0;
          let ki = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c;
              sum += data[idx] * kernel[ki++];
            }
          }
          
          const idx = (y * width + x) * 4 + c;
          newData[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
    
    for (let i = 0; i < data.length; i++) {
      data[i] = newData[i];
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Binarise l'image (noir et blanc)
   */
  private binarize(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Calculer seuil (méthode Otsu simplifiée)
    const threshold = this.calculateOtsuThreshold(data);
    
    // Appliquer binarisation
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const value = gray > threshold ? 255 : 0;
      
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Calcule le seuil optimal (méthode Otsu)
   */
  private calculateOtsuThreshold(data: Uint8ClampedArray): number {
    // Histogramme
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      histogram[gray]++;
    }
    
    // Total pixels
    const total = data.length / 4;
    
    // Calcul seuil optimal
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }
    
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;
    
    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      
      wF = total - wB;
      if (wF === 0) break;
      
      sumB += t * histogram[t];
      
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      
      const variance = wB * wF * (mB - mF) * (mB - mF);
      
      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }
    
    return threshold;
  }

  /**
   * Convertit un canvas en File
   */
  private canvasToFile(canvas: HTMLCanvasElement, originalName: string): Promise<File> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Impossible de convertir canvas en blob'));
          return;
        }
        
        const fileName = originalName.replace(/\.[^/.]+$/, '_processed.png');
        const file = new File([blob], fileName, {
          type: 'image/png',
          lastModified: Date.now()
        });
        
        resolve(file);
      }, 'image/png', 0.95);
    });
  }

  /**
   * Prétraitement optimal pour OCR (preset)
   */
  async preprocessForOCR(file: File): Promise<PreprocessingResult> {
    return this.preprocessImage(file, {
      enhanceContrast: true,
      removeNoise: true,
      sharpen: false, // Peut créer des artefacts
      binarize: false, // Tesseract gère mieux les niveaux de gris
      autoRotate: true,
      resize: {
        // Redimensionner si trop grande (optimisation)
        width: 2000,
        maintainAspectRatio: true
      }
    });
  }

  /**
   * Prétraitement pour documents de mauvaise qualité
   */
  async preprocessLowQuality(file: File): Promise<PreprocessingResult> {
    return this.preprocessImage(file, {
      enhanceContrast: true,
      removeNoise: true,
      sharpen: true,
      binarize: true,
      autoRotate: true
    });
  }
}

// Instance singleton
export const imagePreprocessor = new ImagePreprocessorService();

export default ImagePreprocessorService;

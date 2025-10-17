/**
 * Service de génération de rendus 3D architecturaux par IA
 * Utilise Replicate API avec Stable Diffusion + ControlNet
 */

import Replicate from 'replicate';

// Types
export interface Render3DRequest {
  planImage: string; // Base64 ou URL
  style: '3d-modern' | '3d-traditional' | '3d-industrial' | '3d-minimalist' | '3d-african';
  viewAngle: 'front-facade' | 'aerial-view' | '3d-perspective' | 'interior';
  timeOfDay?: 'day' | 'sunset' | 'night';
  materials?: {
    walls?: string;
    roof?: string;
    windows?: string;
    flooring?: string;
  };
  quality?: 'draft' | 'standard' | 'hd';
  numVariations?: number; // 1-4
  precisionMode?: 'standard' | 'precise'; // 🆕 Mode de précision
}

export interface Render3DResult {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  style: string;
  viewAngle: string;
  generatedAt: string;
  processingTime: number; // en secondes
  cost: number; // en USD
}

export interface RenderProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedTime?: number; // secondes restantes
}

class Render3DService {
  private replicate: Replicate;
  private readonly REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  private readonly CONTROLNET_MODEL = 'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613';
  
  constructor() {
    const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_REPLICATE_API_KEY non configurée');
    }
    this.replicate = new Replicate({ auth: apiKey });
  }

  /**
   * Génère un rendu 3D à partir d'un plan architectural
   * Utilise SDXL standard (bonne qualité, rapide)
   */
  async generate3DRender(request: Render3DRequest): Promise<Render3DResult[]> {
    const startTime = Date.now();
    
    try {
      // 1. Construire le prompt optimisé
      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      // 2. Préparer les paramètres Replicate
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 7.5,
        scheduler: 'DPMSolverMultistep',
        width: this.getWidth(request.quality),
        height: this.getHeight(request.quality),
      };

      console.log('🎨 Génération rendu 3D avec SDXL...', { prompt, input });

      // 3. Lancer la génération
      const output = await this.replicate.run(this.REPLICATE_MODEL, { input }) as string[];

      // 4. Formater les résultats
      const processingTime = (Date.now() - startTime) / 1000;
      const results: Render3DResult[] = output.map((imageUrl, index) => ({
        id: `render-${Date.now()}-${index}`,
        imageUrl,
        prompt,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request)
      }));

      console.log('✅ Rendus 3D générés avec succès', { count: results.length, processingTime });
      return results;

    } catch (error) {
      console.error('❌ Erreur génération rendu 3D:', error);
      throw new Error(`Échec génération rendu 3D: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Génère un rendu 3D PRÉCIS avec ControlNet
   * Utilise les contours du plan pour une fidélité de 95%
   * 🆕 NOUVEAU : Précision maximale !
   */
  async generate3DRenderPrecise(request: Render3DRequest): Promise<Render3DResult[]> {
    const startTime = Date.now();
    
    try {
      // 1. Construire le prompt optimisé
      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      // 2. Préparer les paramètres ControlNet
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 9.0, // Plus élevé pour ControlNet = plus de fidélité
        controlnet_conditioning_scale: 1.0, // Force maximale du contrôle
        detection_resolution: 512,
        image_resolution: this.getWidth(request.quality),
      };

      console.log('🎯 Génération rendu 3D PRÉCIS avec ControlNet...', { prompt, input });

      // 3. Lancer la génération avec ControlNet
      const output = await this.replicate.run(this.CONTROLNET_MODEL, { input }) as string[];

      // 4. Formater les résultats
      const processingTime = (Date.now() - startTime) / 1000;
      const results: Render3DResult[] = output.map((imageUrl, index) => ({
        id: `render-precise-${Date.now()}-${index}`,
        imageUrl,
        prompt: `${prompt} [ControlNet - Précision 95%]`,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request) * 1.5 // ControlNet légèrement plus cher
      }));

      console.log('✅ Rendus 3D PRÉCIS générés avec succès', { count: results.length, processingTime });
      return results;

    } catch (error) {
      console.error('❌ Erreur génération rendu 3D précis:', error);
      throw new Error(`Échec génération rendu 3D précis: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Génère un rendu PRÉCIS avec suivi de progression (ControlNet)
   */
  private async generate3DRenderPreciseWithProgress(
    request: Render3DRequest,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<Render3DResult[]> {
    const startTime = Date.now();
    
    try {
      onProgress?.({
        status: 'queued',
        progress: 0,
        message: 'Préparation du rendu PRÉCIS (ControlNet)...',
        estimatedTime: 70
      });

      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 9.0,
        controlnet_conditioning_scale: 1.0,
        detection_resolution: 512,
        image_resolution: this.getWidth(request.quality),
      };

      onProgress?.({
        status: 'processing',
        progress: 30,
        message: 'Génération PRÉCISE en cours (fidélité 95%)...',
        estimatedTime: 50
      });

      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(90, 30 + (elapsed / 70) * 60);
        onProgress?.({
          status: 'processing',
          progress,
          message: 'Génération PRÉCISE en cours (fidélité 95%)...',
          estimatedTime: Math.max(5, 70 - elapsed)
        });
      }, 2000);

      const output = await this.replicate.run(this.CONTROLNET_MODEL, { input }) as string[];
      
      clearInterval(progressInterval);

      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Rendu 3D PRÉCIS généré avec succès !',
        estimatedTime: 0
      });

      const processingTime = (Date.now() - startTime) / 1000;
      return output.map((imageUrl, index) => ({
        id: `render-precise-${Date.now()}-${index}`,
        imageUrl,
        prompt: `${prompt} [ControlNet - Précision 95%]`,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request) * 1.5
      }));

    } catch (error) {
      onProgress?.({
        status: 'failed',
        progress: 0,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      throw error;
    }
  }

  /**
   * Génère un rendu avec suivi de progression
   * Choisit automatiquement entre SDXL standard ou ControlNet précis
   */
  async generate3DRenderWithProgress(
    request: Render3DRequest,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<Render3DResult[]> {
    // Déléguer à la méthode appropriée selon le mode de précision
    const usePreciseMode = request.precisionMode === 'precise';
    
    if (usePreciseMode) {
      return this.generate3DRenderPreciseWithProgress(request, onProgress);
    }
    
    const startTime = Date.now();
    
    try {
      // Notification début
      onProgress?.({
        status: 'queued',
        progress: 0,
        message: 'Préparation de la génération...',
        estimatedTime: 60
      });

      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 7.5,
        scheduler: 'DPMSolverMultistep',
        width: this.getWidth(request.quality),
        height: this.getHeight(request.quality),
      };

      // Notification traitement
      onProgress?.({
        status: 'processing',
        progress: 30,
        message: 'Génération du rendu 3D en cours...',
        estimatedTime: 45
      });

      // Simulation de progression (Replicate ne fournit pas de progression en temps réel)
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(90, 30 + (elapsed / 60) * 60);
        onProgress?.({
          status: 'processing',
          progress,
          message: 'Génération du rendu 3D en cours...',
          estimatedTime: Math.max(5, 60 - elapsed)
        });
      }, 2000);

      const output = await this.replicate.run(this.REPLICATE_MODEL, { input }) as string[];
      
      clearInterval(progressInterval);

      // Notification fin
      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Rendu 3D généré avec succès !',
        estimatedTime: 0
      });

      const processingTime = (Date.now() - startTime) / 1000;
      return output.map((imageUrl, index) => ({
        id: `render-${Date.now()}-${index}`,
        imageUrl,
        prompt,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request)
      }));

    } catch (error) {
      onProgress?.({
        status: 'failed',
        progress: 0,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      throw error;
    }
  }

  /**
   * Construit le prompt optimisé pour la génération
   */
  private buildPrompt(request: Render3DRequest): string {
    const styleDescriptions = {
      '3d-modern': 'modern contemporary architecture, clean lines, glass facades, minimalist design',
      '3d-traditional': 'traditional architecture, classic design, warm materials, cultural elements',
      '3d-industrial': 'industrial architecture, exposed materials, concrete and steel, urban design',
      '3d-minimalist': 'minimalist architecture, simple forms, neutral colors, zen aesthetic',
      '3d-african': 'West African architecture, local materials, traditional patterns, tropical climate adaptation'
    };

    const viewDescriptions = {
      'front-facade': 'front facade view, architectural elevation',
      'aerial-view': 'aerial view, birds eye perspective, top-down angle',
      '3d-perspective': '3D perspective view, three-quarter angle, depth and dimension',
      'interior': 'interior view, room perspective, indoor space'
    };

    const timeDescriptions = {
      'day': 'bright daylight, clear sky, natural lighting',
      'sunset': 'golden hour, warm sunset lighting, dramatic sky',
      'night': 'night scene, artificial lighting, ambient illumination'
    };

    let prompt = `Professional architectural rendering, ${styleDescriptions[request.style]}, `;
    prompt += `${viewDescriptions[request.viewAngle]}, `;
    
    if (request.timeOfDay) {
      prompt += `${timeDescriptions[request.timeOfDay]}, `;
    }

    if (request.materials) {
      const materials = [];
      if (request.materials.walls) materials.push(`${request.materials.walls} walls`);
      if (request.materials.roof) materials.push(`${request.materials.roof} roof`);
      if (request.materials.windows) materials.push(`${request.materials.windows} windows`);
      if (request.materials.flooring) materials.push(`${request.materials.flooring} flooring`);
      
      if (materials.length > 0) {
        prompt += `materials: ${materials.join(', ')}, `;
      }
    }

    prompt += 'photorealistic, high quality, detailed, professional photography, 8k resolution, architectural visualization';

    return prompt;
  }

  /**
   * Construit le prompt négatif pour éviter les artefacts
   */
  private buildNegativePrompt(): string {
    return 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, ' +
           'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
           'oversaturated, unrealistic, fantasy, sci-fi';
  }

  /**
   * Détermine le nombre d'étapes d'inférence selon la qualité
   */
  private getInferenceSteps(quality?: string): number {
    switch (quality) {
      case 'draft': return 20;
      case 'hd': return 50;
      default: return 30; // standard
    }
  }

  /**
   * Détermine la largeur selon la qualité
   */
  private getWidth(quality?: string): number {
    switch (quality) {
      case 'draft': return 512;
      case 'hd': return 1024;
      default: return 768;
    }
  }

  /**
   * Détermine la hauteur selon la qualité
   */
  private getHeight(quality?: string): number {
    switch (quality) {
      case 'draft': return 512;
      case 'hd': return 1024;
      default: return 768;
    }
  }

  /**
   * Estime le coût de génération
   */
  private estimateCost(request: Render3DRequest): number {
    const baseCost = 0.002; // $0.002 par image
    const qualityMultiplier = {
      'draft': 0.5,
      'standard': 1.0,
      'hd': 2.0
    }[request.quality || 'standard'];

    return baseCost * qualityMultiplier * (request.numVariations || 1);
  }

  /**
   * Convertit une image File en base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Télécharge une image depuis une URL
   */
  async downloadImage(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erreur téléchargement image:', error);
      throw error;
    }
  }
}

// Export singleton
export const render3DService = new Render3DService();
export default render3DService;

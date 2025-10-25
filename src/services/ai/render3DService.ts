/**
 * Service de génération de rendus 3D architecturaux par IA
 * Utilise Replicate API avec Stable Diffusion + ControlNet
 */

// import Replicate from 'replicate'; // Désactivé - utilisation du proxy Vite à la place

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
  model?: 'sdxl' | 'flux-pro' | 'flux-1.1-pro' | 'seedream-4' | 'imagen-4'; // 🆕 Modèle Replicate
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
  private readonly REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  // Modèle précis privilégié (remplace l'ancien ControlNet)
  private readonly FLUX_11_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
  private readonly PROXY_BASE_URL = '/api/replicate'; // Proxy Vite pour contourner CORS
  // Nouveaux modèles performants
  private readonly FLUX_PRO_MODEL = 'black-forest-labs/flux-pro';
  private readonly SEEDREAM_MODEL = 'bytedance/seedream-4';
  private readonly IMAGEN4_MODEL = 'google/imagen-4';
  
  constructor() {
    const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_REPLICATE_API_KEY non configurée - Le service 3D ne fonctionnera pas');
    } else {
      console.log('✅ Service Render3D initialisé avec proxy Vite');
    }
  }

  /**
   * Génération via un modèle Replicate spécifique (Flux Pro, Seedream-4, Imagen-4)
   */
  private async generateWithSpecificModel(
    request: Render3DRequest,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<Render3DResult[]> {
    if (!this.isConfigured()) {
      throw new Error('❌ Service 3D non configuré. Ajoutez VITE_REPLICATE_API_KEY dans votre fichier .env.local');
    }

    const startTime = Date.now();

    const modelId =
      request.model === 'flux-pro' ? this.FLUX_PRO_MODEL :
      request.model === 'seedream-4' ? this.SEEDREAM_MODEL :
      request.model === 'imagen-4' ? this.IMAGEN4_MODEL :
      this.REPLICATE_MODEL.split(':')[0];

    try {
      onProgress?.({ status: 'queued', progress: 0, message: 'Préparation de la génération (modèle avancé)...', estimatedTime: 70 });

      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();

      // Paramètres génériques compatibles image-to-image sur Replicate
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 7.5,
        width: this.getWidth(request.quality),
        height: this.getHeight(request.quality)
      };

      onProgress?.({ status: 'processing', progress: 25, message: 'Génération en cours (modèle avancé)...', estimatedTime: 55 });

      const prediction = await this.replicateRequest('/v1/predictions', 'POST', {
        model: modelId,
        input
      });

      let predictionData = prediction;
      while (predictionData.status === 'starting' || predictionData.status === 'processing') {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(90, 25 + (elapsed / 75) * 65);
        onProgress?.({ status: 'processing', progress, message: 'Génération en cours (modèle avancé)...', estimatedTime: Math.max(5, 75 - elapsed) });
        await new Promise(r => setTimeout(r, 2000));
        predictionData = await this.replicateRequest(`/v1/predictions/${predictionData.id}`, 'GET');
      }

      if (predictionData.status !== 'succeeded') {
        throw new Error(`Génération échouée: ${predictionData.error || 'Erreur inconnue'}`);
      }

      onProgress?.({ status: 'completed', progress: 100, message: 'Rendu généré avec succès !', estimatedTime: 0 });
      const output: string[] = predictionData.output as string[];
      const processingTime = (Date.now() - startTime) / 1000;
      return output.map((imageUrl, index) => ({
        id: `render-adv-${Date.now()}-${index}`,
        imageUrl,
        prompt,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request) * 1.8 // estimation plus élevée
      }));
    } catch (error) {
      onProgress?.({ status: 'failed', progress: 0, message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` });
      throw error;
    }
  }
  

  /**
   * Vérifie si le service est correctement configuré
   */
  private isConfigured(): boolean {
    return import.meta.env.VITE_REPLICATE_API_KEY !== undefined;
  }

  /**
   * Appel API Replicate via le proxy Vite
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async replicateRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.PROXY_BASE_URL}${endpoint}`;
    console.log(`🔗 Appel Replicate via proxy: ${method} ${url}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error (${response.status}): ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * Génère un rendu 3D à partir d'un plan architectural
   * Utilise SDXL standard (bonne qualité, rapide)
   */
  async generate3DRender(request: Render3DRequest): Promise<Render3DResult[]> {
    if (!this.isConfigured()) {
      throw new Error('❌ Service 3D non configuré. Ajoutez VITE_REPLICATE_API_KEY dans votre fichier .env.local');
    }
    
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

      // 3. Lancer la génération via le proxy
      const prediction = await this.replicateRequest('/v1/predictions', 'POST', {
        model: this.REPLICATE_MODEL.split(':')[0],
        version: this.REPLICATE_MODEL.split(':')[1],
        input
      });
      
      // 4. Attendre la complétion
      let output: string[] = [];
      let predictionData = prediction;
      
      while (predictionData.status === 'starting' || predictionData.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        predictionData = await this.replicateRequest(`/v1/predictions/${predictionData.id}`, 'GET');
      }
      
      if (predictionData.status === 'succeeded') {
        output = predictionData.output as string[];
      } else {
        throw new Error(`Génération échouée: ${predictionData.error || 'Erreur inconnue'}`);
      }

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
    if (!this.isConfigured()) {
      throw new Error('❌ Service 3D non configuré. Ajoutez VITE_REPLICATE_API_KEY dans votre fichier .env.local');
    }
    
    const startTime = Date.now();
    
    try {
      // 1. Construire le prompt optimisé
      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      // 2. Préparer les paramètres pour Flux 1.1 Pro (génériques image-to-image)
      const width = this.getWidth(request.quality);
      const height = this.getHeight(request.quality);
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 8.0,
        width,
        height,
      };

      console.log('🎯 Génération rendu 3D PRÉCIS avec Flux 1.1 Pro...', { prompt, input });

      // 3. Lancer la génération avec Flux 1.1 Pro via le proxy
      const prediction = await this.replicateRequest('/v1/predictions', 'POST', {
        model: this.FLUX_11_PRO_MODEL,
        input
      });
      
      // 4. Attendre la complétion
      let output: string[] = [];
      let predictionData = prediction;
      
      while (predictionData.status === 'starting' || predictionData.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        predictionData = await this.replicateRequest(`/v1/predictions/${predictionData.id}`, 'GET');
      }
      
      if (predictionData.status === 'succeeded') {
        output = predictionData.output as string[];
      } else {
        throw new Error(`Génération échouée: ${predictionData.error || 'Erreur inconnue'}`);
      }

      // 4. Formater les résultats
      const processingTime = (Date.now() - startTime) / 1000;
      const results: Render3DResult[] = output.map((imageUrl, index) => ({
        id: `render-precise-${Date.now()}-${index}`,
        imageUrl,
        prompt: `${prompt} [Flux 1.1 Pro - Précision élevée]`,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request) * 1.6 // estimation plus élevée
      }));

      console.log('✅ Rendus 3D PRÉCIS (Flux 1.1 Pro) générés avec succès', { count: results.length, processingTime });
      return results;

    } catch (error) {
      console.error('❌ Erreur génération rendu 3D précis:', error);
      throw new Error(`Échec génération rendu 3D précis: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Génère un rendu PRÉCIS avec suivi de progression (Flux 1.1 Pro)
   */
  private async generate3DRenderPreciseWithProgress(
    request: Render3DRequest,
    onProgress?: (progress: RenderProgress) => void
  ): Promise<Render3DResult[]> {
    if (!this.isConfigured()) {
      throw new Error('❌ Service 3D non configuré. Ajoutez VITE_REPLICATE_API_KEY dans votre fichier .env.local');
    }
    
    const startTime = Date.now();
    
    try {
      onProgress?.({ status: 'queued', progress: 0, message: 'Préparation du rendu PRÉCIS (Flux 1.1 Pro)...', estimatedTime: 70 });

      const prompt = this.buildPrompt(request);
      const negativePrompt = this.buildNegativePrompt();
      
      const width = this.getWidth(request.quality);
      const height = this.getHeight(request.quality);
      const input = {
        prompt,
        negative_prompt: negativePrompt,
        image: request.planImage,
        num_outputs: request.numVariations || 1,
        num_inference_steps: this.getInferenceSteps(request.quality),
        guidance_scale: 8.0,
        width,
        height,
      };

      onProgress?.({ status: 'processing', progress: 30, message: 'Génération PRÉCISE en cours (Flux 1.1 Pro)...', estimatedTime: 50 });

      // Lancer la génération via le proxy (Flux 1.1 Pro)
      const prediction = await this.replicateRequest('/v1/predictions', 'POST', {
        model: this.FLUX_11_PRO_MODEL,
        input
      });
      
      // Polling avec progression
      let predictionData = prediction;
      
      while (predictionData.status === 'starting' || predictionData.status === 'processing') {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(90, 30 + (elapsed / 70) * 60);
        onProgress?.({ status: 'processing', progress, message: 'Génération PRÉCISE en cours (Flux 1.1 Pro)...', estimatedTime: Math.max(5, 70 - elapsed) });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        predictionData = await this.replicateRequest(`/v1/predictions/${predictionData.id}`, 'GET');
      }
      
      let output: string[] = [];
      if (predictionData.status === 'succeeded') {
        output = predictionData.output as string[];
      } else {
        throw new Error(`Génération échouée: ${predictionData.error || 'Erreur inconnue'}`);
      }

      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Rendu 3D PRÉCIS (Flux 1.1 Pro) généré avec succès !',
        estimatedTime: 0
      });

      const processingTime = (Date.now() - startTime) / 1000;
      return output.map((imageUrl, index) => ({
        id: `render-precise-${Date.now()}-${index}`,
        imageUrl,
        prompt: `${prompt} [Flux 1.1 Pro - Précision élevée]`,
        style: request.style,
        viewAngle: request.viewAngle,
        generatedAt: new Date().toISOString(),
        processingTime,
        cost: this.estimateCost(request) * 1.6
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
    // Si l'utilisateur force le modèle précis Flux 1.1 Pro (via precisionMode ou model)
    const usePreciseMode = request.precisionMode === 'precise' || request.model === 'flux-1.1-pro';
    if (usePreciseMode) {
      return this.generate3DRenderPreciseWithProgress(request, onProgress);
    }
    // Si un modèle spécifique est choisi (flux-pro, seedream-4, imagen-4), l'utiliser
    if (request.model && request.model !== 'sdxl' && request.model !== 'flux-1.1-pro') {
      return this.generateWithSpecificModel(request, onProgress);
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

      // Lancer la génération via le proxy
      const prediction = await this.replicateRequest('/v1/predictions', 'POST', {
        version: this.REPLICATE_MODEL.split(':')[1],
        input
      });
      
      // Polling avec progression
      let predictionData = prediction;
      
      while (predictionData.status === 'starting' || predictionData.status === 'processing') {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(90, 30 + (elapsed / 60) * 60);
        onProgress?.({
          status: 'processing',
          progress,
          message: 'Génération du rendu 3D en cours...',
          estimatedTime: Math.max(5, 60 - elapsed)
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        predictionData = await this.replicateRequest(`/v1/predictions/${predictionData.id}`, 'GET');
      }
      
      let output: string[] = [];
      if (predictionData.status === 'succeeded') {
        output = predictionData.output as string[];
      } else {
        throw new Error(`Génération échouée: ${predictionData.error || 'Erreur inconnue'}`);
      }

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

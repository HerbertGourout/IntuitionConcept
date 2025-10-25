/**
 * Templates optimisés pour les vues extérieures
 * Prompts spécialisés par type de façade et vue aérienne
 */

import {
  ArchitecturalAnalysis,
  ViewSpec,
  FacadeInfo,
  GlobalRenderSettings
} from '../../types/architecturalAnalysis';

export interface ExteriorViewTemplate {
  id: string;
  name: string;
  description: string;
  viewType: ViewSpec['type'];
  viewAngle: ViewSpec['viewAngle'];
  recommendedModel: ViewSpec['model'];
  cameraSettings: {
    distance: 'close' | 'medium' | 'far';
    angle: 'low' | 'eye-level' | 'high';
    fov?: number; // Field of view
  };
  promptTemplate: (analysis: ArchitecturalAnalysis, facade?: FacadeInfo) => string;
  negativePromptAdditions: string[];
  qualityMultiplier: number; // 1.0 = standard, 1.5 = plus d'étapes
}

class ExteriorViewTemplateService {
  /**
   * Templates de façades principales
   */
  private facadeTemplates: Record<string, ExteriorViewTemplate> = {
    'facade-principale-day': {
      id: 'facade-principale-day',
      name: 'Façade Principale - Jour',
      description: 'Vue frontale de la façade principale en plein jour',
      viewType: 'facade-principale',
      viewAngle: 'front-facade',
      recommendedModel: 'flux-1.1-pro',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level',
        fov: 50
      },
      promptTemplate: (analysis, facade) => {
        const materials = facade?.materials.join(', ') || analysis.project.materials.join(', ');
        const windows = facade?.openings.windows || 0;
        const doors = facade?.openings.doors || 0;
        
        return `Professional architectural elevation rendering, main facade front view, ${analysis.project.style} architecture style, ` +
               `materials: ${materials}, ${windows} windows precisely placed, ${doors} entrance doors, ` +
               `accurate proportions from architectural plan, symmetrical composition, ` +
               `bright daylight, clear blue sky, natural shadows, ` +
               `photorealistic, 8K resolution, architectural photography, sharp details, ` +
               `professional lighting, no distortion, accurate geometry`;
      },
      negativePromptAdditions: [
        'asymmetric facade',
        'distorted windows',
        'incorrect proportions',
        'cartoon style',
        'people',
        'vehicles'
      ],
      qualityMultiplier: 1.5
    },

    'facade-principale-night': {
      id: 'facade-principale-night',
      name: 'Façade Principale - Nuit',
      description: 'Vue frontale de la façade principale de nuit avec éclairage',
      viewType: 'facade-principale',
      viewAngle: 'front-facade',
      recommendedModel: 'flux-1.1-pro',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level',
        fov: 50
      },
      promptTemplate: (analysis, facade) => {
        const materials = facade?.materials.join(', ') || analysis.project.materials.join(', ');
        
        return `Professional architectural elevation rendering, main facade front view at night, ${analysis.project.style} architecture, ` +
               `materials: ${materials}, warm interior lighting through windows, ` +
               `exterior architectural lighting, ambient illumination, ` +
               `night scene, dark blue sky, subtle stars, ` +
               `dramatic lighting, photorealistic, 8K resolution, ` +
               `professional night photography, accurate geometry, no distortion`;
      },
      negativePromptAdditions: [
        'daylight',
        'bright sky',
        'harsh shadows',
        'overexposed',
        'people',
        'vehicles'
      ],
      qualityMultiplier: 1.5
    },

    'facade-secondaire': {
      id: 'facade-secondaire',
      name: 'Façade Secondaire',
      description: 'Vue latérale ou secondaire du bâtiment',
      viewType: 'facade-secondaire',
      viewAngle: 'front-facade',
      recommendedModel: 'flux-1.1-pro',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level',
        fov: 50
      },
      promptTemplate: (analysis, facade) => {
        const materials = facade?.materials.join(', ') || analysis.project.materials.join(', ');
        
        return `Architectural elevation rendering, secondary facade side view, ${analysis.project.style} style, ` +
               `materials: ${materials}, accurate window and door placement, ` +
               `consistent with main facade design, proper proportions, ` +
               `natural daylight, clear sky, realistic shadows, ` +
               `photorealistic, high quality, architectural visualization`;
      },
      negativePromptAdditions: ['distorted', 'asymmetric', 'cartoon'],
      qualityMultiplier: 1.2
    }
  };

  /**
   * Templates de vues aériennes
   */
  private aerialTemplates: Record<string, ExteriorViewTemplate> = {
    'aerial-oblique': {
      id: 'aerial-oblique',
      name: 'Vue Aérienne Oblique',
      description: 'Vue aérienne en perspective du bâtiment et son site',
      viewType: 'aerial-oblique',
      viewAngle: 'aerial-view',
      recommendedModel: 'flux-pro',
      cameraSettings: {
        distance: 'far',
        angle: 'high',
        fov: 70
      },
      promptTemplate: (analysis) => {
        const landscaping = analysis.landscaping.features.join(', ');
        const totalArea = analysis.technicalDetails.totalArea_m2 || 'large';
        
        return `Professional architectural aerial rendering, oblique birds eye view, 45-degree angle, ` +
               `${analysis.project.style} building architecture, site context with ${landscaping}, ` +
               `building massing showing all facades, accurate proportions, ${totalArea}m² site, ` +
               `surrounding landscape, property boundaries, access roads, ` +
               `natural daylight, soft shadows, realistic vegetation, ` +
               `photorealistic, 8K resolution, drone photography style, ` +
               `clear composition, professional architectural visualization`;
      },
      negativePromptAdditions: [
        'top-down view',
        'flat perspective',
        'distorted geometry',
        'unrealistic scale'
      ],
      qualityMultiplier: 1.3
    },

    'aerial-frontal': {
      id: 'aerial-frontal',
      name: 'Vue Aérienne Frontale',
      description: 'Vue aérienne plus frontale du bâtiment',
      viewType: 'aerial-frontal',
      viewAngle: 'aerial-view',
      recommendedModel: 'flux-pro',
      cameraSettings: {
        distance: 'medium',
        angle: 'high',
        fov: 60
      },
      promptTemplate: (analysis) => {
        const landscaping = analysis.landscaping.features.join(', ');
        
        return `Architectural aerial rendering, frontal elevated view, 30-degree angle, ` +
               `${analysis.project.style} building, clear view of main facade and roof, ` +
               `site context with ${landscaping}, accurate building proportions, ` +
               `surrounding environment, natural lighting, realistic shadows, ` +
               `photorealistic, high quality, professional architectural photography`;
      },
      negativePromptAdditions: ['extreme angle', 'distorted', 'unrealistic'],
      qualityMultiplier: 1.2
    }
  };

  /**
   * Templates de vues paysagères
   */
  private landscapingTemplates: Record<string, ExteriorViewTemplate> = {
    'landscaping-garden': {
      id: 'landscaping-garden',
      name: 'Jardin et Aménagements',
      description: 'Vue des aménagements extérieurs (jardin, terrasse, piscine)',
      viewType: 'landscaping',
      viewAngle: '3d-perspective',
      recommendedModel: 'seedream-4',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level',
        fov: 60
      },
      promptTemplate: (analysis) => {
        const features = analysis.landscaping.features;
        const hasGarden = features.includes('jardin');
        const hasPool = features.includes('piscine');
        const hasTerrace = features.includes('terrasse');
        
        let prompt = `Professional landscape architectural rendering, outdoor living spaces, ` +
                    `${analysis.project.style} architecture integration, `;
        
        if (hasGarden) prompt += 'lush garden with native plants, well-maintained landscaping, ';
        if (hasPool) prompt += 'modern swimming pool with clean water, pool deck, ';
        if (hasTerrace) prompt += 'elegant terrace with outdoor furniture, ';
        
        prompt += 'natural daylight, realistic vegetation, accurate scale, ' +
                 'photorealistic, 8K resolution, landscape photography style, ' +
                 'harmonious integration with building architecture';
        
        return prompt;
      },
      negativePromptAdditions: [
        'overgrown',
        'neglected',
        'artificial plants',
        'unrealistic colors'
      ],
      qualityMultiplier: 1.2
    }
  };

  /**
   * Récupère tous les templates extérieurs
   */
  getAllTemplates(): ExteriorViewTemplate[] {
    return [
      ...Object.values(this.facadeTemplates),
      ...Object.values(this.aerialTemplates),
      ...Object.values(this.landscapingTemplates)
    ];
  }

  /**
   * Récupère un template par ID
   */
  getTemplate(id: string): ExteriorViewTemplate | undefined {
    return this.getAllTemplates().find(t => t.id === id);
  }

  /**
   * Génère les vues extérieures optimisées
   */
  generateExteriorViews(
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    options: {
      includeFacades: boolean;
      includeAerial: boolean;
      includeLandscaping: boolean;
      includeNightViews: boolean;
      quality: ViewSpec['quality'];
    }
  ): ViewSpec[] {
    const views: ViewSpec[] = [];

    // Façades
    if (options.includeFacades) {
      for (const facade of analysis.facades) {
        // Vue jour
        const dayTemplate = this.facadeTemplates['facade-principale-day'];
        views.push(this.createViewFromTemplate(
          dayTemplate,
          analysis,
          globalSettings,
          options.quality,
          facade
        ));

        // Vue nuit (si demandé)
        if (options.includeNightViews) {
          const nightTemplate = this.facadeTemplates['facade-principale-night'];
          views.push(this.createViewFromTemplate(
            nightTemplate,
            analysis,
            globalSettings,
            options.quality,
            facade
          ));
        }
      }
    }

    // Vues aériennes
    if (options.includeAerial) {
      const obliqueTemplate = this.aerialTemplates['aerial-oblique'];
      views.push(this.createViewFromTemplate(
        obliqueTemplate,
        analysis,
        globalSettings,
        options.quality
      ));

      const frontalTemplate = this.aerialTemplates['aerial-frontal'];
      views.push(this.createViewFromTemplate(
        frontalTemplate,
        analysis,
        globalSettings,
        options.quality
      ));
    }

    // Aménagements paysagers
    if (options.includeLandscaping && analysis.landscaping.features.length > 0) {
      const landscapingTemplate = this.landscapingTemplates['landscaping-garden'];
      views.push(this.createViewFromTemplate(
        landscapingTemplate,
        analysis,
        globalSettings,
        options.quality
      ));
    }

    return views;
  }

  /**
   * Crée une ViewSpec à partir d'un template
   */
  private createViewFromTemplate(
    template: ExteriorViewTemplate,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    quality: ViewSpec['quality'],
    facade?: FacadeInfo
  ): ViewSpec {
    const prompt = template.promptTemplate(analysis, facade);
    
    return {
      id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.viewType,
      category: 'exterior',
      viewAngle: template.viewAngle,
      cameraPosition: template.cameraSettings,
      subject: template.name + (facade ? ` (${facade.type})` : ''),
      facadeType: facade?.type,
      model: template.recommendedModel,
      quality,
      timeOfDay: template.id.includes('night') ? 'night' : 'day'
    };
  }

  /**
   * Construit un prompt enrichi à partir d'un template
   */
  buildEnrichedPrompt(
    template: ExteriorViewTemplate,
    analysis: ArchitecturalAnalysis,
    facade?: FacadeInfo
  ): { prompt: string; negativePrompt: string } {
    const prompt = template.promptTemplate(analysis, facade);
    
    const baseNegative = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, ' +
                        'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
                        'oversaturated, unrealistic, fantasy, sci-fi';
    
    const negativePrompt = [baseNegative, ...template.negativePromptAdditions].join(', ');
    
    return { prompt, negativePrompt };
  }

  /**
   * Recommande le meilleur modèle pour un type de vue
   */
  recommendModel(viewType: ViewSpec['type']): ViewSpec['model'] {
    const template = this.getAllTemplates().find(t => t.viewType === viewType);
    return template?.recommendedModel || 'flux-1.1-pro';
  }

  /**
   * Calcule le nombre d'étapes d'inférence selon template et qualité
   */
  calculateInferenceSteps(
    template: ExteriorViewTemplate,
    quality: ViewSpec['quality']
  ): number {
    const baseSteps: Record<string, number> = {
      'draft': 20,
      'standard': 30,
      'hd': 50,
      '4k': 70,
      '8k': 100
    };

    const base = baseSteps[quality] || 30;
    return Math.round(base * template.qualityMultiplier);
  }
}

export const exteriorViewTemplates = new ExteriorViewTemplateService();
export default exteriorViewTemplates;

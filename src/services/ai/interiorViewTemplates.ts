/**
 * Templates optimisés pour les vues intérieures
 * Prompts spécialisés par type de pièce et style de décoration
 */

import {
  ArchitecturalAnalysis,
  ViewSpec,
  RoomInfo,
  DecorationStyle,
  LightingMode,
  GlobalRenderSettings
} from '../../types/architecturalAnalysis';

export interface InteriorViewTemplate {
  id: string;
  name: string;
  description: string;
  roomType: RoomInfo['type'];
  shotType: 'wide' | 'detail';
  viewAngle: ViewSpec['viewAngle'];
  recommendedModel: ViewSpec['model'];
  cameraSettings: {
    distance: 'close' | 'medium' | 'far';
    angle: 'low' | 'eye-level' | 'high';
    focus?: string;
  };
  promptTemplate: (
    room: RoomInfo,
    analysis: ArchitecturalAnalysis,
    decorationStyle: DecorationStyle,
    lightingMode: LightingMode
  ) => string;
  negativePromptAdditions: string[];
  qualityMultiplier: number;
}

class InteriorViewTemplateService {
  /**
   * Templates par type de pièce - Vue large
   */
  private wideViewTemplates: Record<string, InteriorViewTemplate> = {
    'salon-wide': {
      id: 'salon-wide',
      name: 'Salon - Vue Large',
      description: 'Vue d\'ensemble du salon avec mobilier complet',
      roomType: 'salon',
      shotType: 'wide',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        const area = room.area_m2 ? `${room.area_m2}m²` : 'spacious';
        const features = room.features?.join(', ') || '';
        
        return `Professional interior design photography, living room wide shot, ${area} space, ` +
               `${analysis.project.style} architecture style, ${decorationStyle} decoration, ` +
               `comfortable seating arrangement, modern sofa and armchairs, ` +
               `coffee table, entertainment unit, ${features ? `special features: ${features}, ` : ''}` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `large windows with natural light, realistic textures, ` +
               `photorealistic, 8K resolution, interior design magazine quality, ` +
               `accurate proportions, depth of field, professional staging`;
      },
      negativePromptAdditions: ['cluttered', 'messy', 'unrealistic furniture', 'distorted perspective'],
      qualityMultiplier: 1.3
    },

    'cuisine-wide': {
      id: 'cuisine-wide',
      name: 'Cuisine - Vue Large',
      description: 'Vue d\'ensemble de la cuisine avec équipements',
      roomType: 'cuisine',
      shotType: 'wide',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        const area = room.area_m2 ? `${room.area_m2}m²` : 'functional';
        const features = room.features?.join(', ') || 'modern appliances';
        
        return `Professional kitchen interior photography, wide angle view, ${area} kitchen, ` +
               `${analysis.project.style} design, ${decorationStyle} style, ` +
               `modern kitchen cabinets, countertops, ${features}, ` +
               `integrated appliances, functional layout, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `clean and organized, realistic materials, ` +
               `photorealistic, 8K resolution, architectural digest quality, ` +
               `accurate proportions, professional kitchen design`;
      },
      negativePromptAdditions: ['dirty', 'cluttered', 'old appliances', 'unrealistic'],
      qualityMultiplier: 1.3
    },

    'chambre-wide': {
      id: 'chambre-wide',
      name: 'Chambre - Vue Large',
      description: 'Vue d\'ensemble de la chambre avec lit et rangements',
      roomType: 'chambre',
      shotType: 'wide',
      viewAngle: 'interior',
      recommendedModel: 'seedream-4',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        const area = room.area_m2 ? `${room.area_m2}m²` : 'comfortable';
        const features = room.features?.join(', ') || '';
        
        return `Professional bedroom interior photography, wide shot, ${area} bedroom, ` +
               `${analysis.project.style} architecture, ${decorationStyle} decoration, ` +
               `comfortable bed with quality bedding, nightstands, wardrobe, ` +
               `${features ? `${features}, ` : ''}` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `cozy atmosphere, soft textures, realistic fabrics, ` +
               `photorealistic, 8K resolution, interior design quality, ` +
               `inviting and restful ambiance, accurate proportions`;
      },
      negativePromptAdditions: ['messy bed', 'cluttered', 'unrealistic', 'poor lighting'],
      qualityMultiplier: 1.2
    },

    'salle-de-bain-wide': {
      id: 'salle-de-bain-wide',
      name: 'Salle de Bain - Vue Large',
      description: 'Vue d\'ensemble de la salle de bain avec équipements',
      roomType: 'salle-de-bain',
      shotType: 'wide',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'medium',
        angle: 'eye-level'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        const area = room.area_m2 ? `${room.area_m2}m²` : 'modern';
        const features = room.features?.join(', ') || 'shower, sink, toilet';
        
        return `Professional bathroom interior photography, wide view, ${area} bathroom, ` +
               `${analysis.project.style} design, ${decorationStyle} style, ` +
               `${features}, modern fixtures, clean tiles, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `spa-like atmosphere, realistic reflections on tiles, ` +
               `photorealistic, 8K resolution, luxury bathroom design, ` +
               `accurate proportions, professional staging`;
      },
      negativePromptAdditions: ['dirty', 'old fixtures', 'mold', 'unrealistic'],
      qualityMultiplier: 1.3
    }
  };

  /**
   * Templates détails par type de pièce
   */
  private detailViewTemplates: Record<string, InteriorViewTemplate> = {
    'salon-detail': {
      id: 'salon-detail',
      name: 'Salon - Vue Détail',
      description: 'Gros plan sur un coin du salon',
      roomType: 'salon',
      shotType: 'detail',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'close',
        angle: 'eye-level',
        focus: 'seating area'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        return `Professional interior detail photography, living room corner close-up, ` +
               `${decorationStyle} decoration style, comfortable seating area, ` +
               `armchair or sofa detail, side table with decor, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `soft textures, realistic fabrics, decorative elements, ` +
               `photorealistic, 8K resolution, magazine quality detail shot, ` +
               `shallow depth of field, professional composition`;
      },
      negativePromptAdditions: ['blurry', 'unrealistic textures', 'poor composition'],
      qualityMultiplier: 1.2
    },

    'cuisine-detail': {
      id: 'cuisine-detail',
      name: 'Cuisine - Vue Détail',
      description: 'Gros plan sur l\'îlot ou plan de travail',
      roomType: 'cuisine',
      shotType: 'detail',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'close',
        angle: 'eye-level',
        focus: 'countertop'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        const features = room.features?.includes('îlot central') ? 'kitchen island' : 'countertop';
        
        return `Professional kitchen detail photography, ${features} close-up, ` +
               `${decorationStyle} style, modern countertop surface, ` +
               `high-end materials, elegant fixtures, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `realistic textures, professional food photography style, ` +
               `photorealistic, 8K resolution, architectural detail quality, ` +
               `shallow depth of field, magazine worthy composition`;
      },
      negativePromptAdditions: ['dirty', 'cluttered', 'unrealistic materials'],
      qualityMultiplier: 1.2
    },

    'chambre-detail': {
      id: 'chambre-detail',
      name: 'Chambre - Vue Détail',
      description: 'Gros plan sur la tête de lit',
      roomType: 'chambre',
      shotType: 'detail',
      viewAngle: 'interior',
      recommendedModel: 'seedream-4',
      cameraSettings: {
        distance: 'close',
        angle: 'eye-level',
        focus: 'headboard'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        return `Professional bedroom detail photography, headboard and bedding close-up, ` +
               `${decorationStyle} decoration, elegant headboard design, ` +
               `quality bedding with soft textures, decorative pillows, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `cozy and inviting, realistic fabric textures, ` +
               `photorealistic, 8K resolution, luxury hotel quality, ` +
               `shallow depth of field, professional staging`;
      },
      negativePromptAdditions: ['messy', 'unrealistic fabrics', 'poor lighting'],
      qualityMultiplier: 1.2
    },

    'salle-de-bain-detail': {
      id: 'salle-de-bain-detail',
      name: 'Salle de Bain - Vue Détail',
      description: 'Gros plan sur la vasque et miroir',
      roomType: 'salle-de-bain',
      shotType: 'detail',
      viewAngle: 'interior',
      recommendedModel: 'imagen-4',
      cameraSettings: {
        distance: 'close',
        angle: 'eye-level',
        focus: 'vanity'
      },
      promptTemplate: (room, analysis, decorationStyle, lightingMode) => {
        return `Professional bathroom detail photography, vanity and mirror close-up, ` +
               `${decorationStyle} style, modern sink and faucet, ` +
               `elegant mirror with lighting, luxury fixtures, ` +
               `${this.getLightingPrompt(lightingMode)}, ` +
               `realistic reflections, clean surfaces, spa atmosphere, ` +
               `photorealistic, 8K resolution, luxury bathroom detail, ` +
               `professional composition, magazine quality`;
      },
      negativePromptAdditions: ['dirty', 'water stains', 'unrealistic reflections'],
      qualityMultiplier: 1.2
    }
  };

  /**
   * Génère le prompt d'éclairage selon le mode
   */
  private getLightingPrompt(lightingMode: LightingMode): string {
    const lightingPrompts: Record<LightingMode, string> = {
      'natural': 'natural daylight through windows, soft ambient light, realistic shadows',
      'spots': 'recessed spot lighting, focused illumination, dramatic accents',
      'led': 'modern LED lighting, even illumination, contemporary fixtures',
      'ambient': 'soft ambient lighting, warm glow, atmospheric mood',
      'dramatic': 'dramatic lighting, strong contrasts, architectural lighting design'
    };
    
    return lightingPrompts[lightingMode] || lightingPrompts['natural'];
  }

  /**
   * Récupère tous les templates intérieurs
   */
  getAllTemplates(): InteriorViewTemplate[] {
    return [
      ...Object.values(this.wideViewTemplates),
      ...Object.values(this.detailViewTemplates)
    ];
  }

  /**
   * Récupère un template par ID
   */
  getTemplate(id: string): InteriorViewTemplate | undefined {
    return this.getAllTemplates().find(t => t.id === id);
  }

  /**
   * Génère les vues intérieures optimisées
   */
  generateInteriorViews(
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    options: {
      includeWideViews: boolean;
      includeDetailViews: boolean;
      decorationStyles: DecorationStyle[];
      lightingModes: LightingMode[];
      quality: ViewSpec['quality'];
    }
  ): ViewSpec[] {
    const views: ViewSpec[] = [];

    // Filtrer les pièces principales
    const mainRooms = analysis.rooms.filter(room => 
      ['salon', 'cuisine', 'chambre', 'salle-de-bain'].includes(room.type)
    );

    for (const room of mainRooms) {
      // Vue large
      if (options.includeWideViews) {
        const wideTemplate = this.wideViewTemplates[`${room.type}-wide`];
        if (wideTemplate) {
          for (const decorationStyle of options.decorationStyles) {
            for (const lightingMode of options.lightingModes) {
              views.push(this.createViewFromTemplate(
                wideTemplate,
                room,
                analysis,
                globalSettings,
                options.quality,
                decorationStyle,
                lightingMode
              ));
            }
          }
        }
      }

      // Vue détail (seulement pour pièces importantes)
      if (options.includeDetailViews && ['salon', 'cuisine', 'chambre'].includes(room.type)) {
        const detailTemplate = this.detailViewTemplates[`${room.type}-detail`];
        if (detailTemplate) {
          // Une seule variante pour les détails (éviter surcharge)
          const decorationStyle = options.decorationStyles[0] || 'moderne';
          const lightingMode = options.lightingModes[0] || 'natural';
          
          views.push(this.createViewFromTemplate(
            detailTemplate,
            room,
            analysis,
            globalSettings,
            options.quality,
            decorationStyle,
            lightingMode
          ));
        }
      }
    }

    return views;
  }

  /**
   * Crée une ViewSpec à partir d'un template
   */
  private createViewFromTemplate(
    template: InteriorViewTemplate,
    room: RoomInfo,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings,
    quality: ViewSpec['quality'],
    decorationStyle: DecorationStyle,
    lightingMode: LightingMode
  ): ViewSpec {
    const roomLabel = room.name || this.getRoomLabel(room.type);
    
    return {
      id: `${template.id}-${room.id}-${decorationStyle}-${lightingMode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.shotType === 'wide' ? 'interior-wide' : 'interior-detail',
      category: 'interior',
      viewAngle: template.viewAngle,
      cameraPosition: template.cameraSettings,
      subject: `${roomLabel} - ${template.shotType === 'wide' ? 'Vue Large' : 'Détail'} (${decorationStyle}, ${lightingMode})`,
      roomId: room.id,
      model: template.recommendedModel,
      quality,
      timeOfDay: 'day',
      decorationStyle,
      lightingMode
    };
  }

  /**
   * Construit un prompt enrichi à partir d'un template
   */
  buildEnrichedPrompt(
    template: InteriorViewTemplate,
    room: RoomInfo,
    analysis: ArchitecturalAnalysis,
    decorationStyle: DecorationStyle,
    lightingMode: LightingMode
  ): { prompt: string; negativePrompt: string } {
    const prompt = template.promptTemplate(room, analysis, decorationStyle, lightingMode);
    
    const baseNegative = 'blurry, low quality, distorted, deformed, ugly, bad proportions, ' +
                        'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
                        'oversaturated, unrealistic, fantasy';
    
    const negativePrompt = [baseNegative, ...template.negativePromptAdditions].join(', ');
    
    return { prompt, negativePrompt };
  }

  /**
   * Label lisible pour type de pièce
   */
  private getRoomLabel(roomType: string): string {
    const labels: Record<string, string> = {
      'salon': 'Salon',
      'cuisine': 'Cuisine',
      'salle-a-manger': 'Salle à manger',
      'chambre': 'Chambre',
      'salle-de-bain': 'Salle de bain',
      'wc': 'WC',
      'hall': 'Hall',
      'entree': 'Entrée',
      'couloir': 'Couloir',
      'bureau': 'Bureau'
    };
    return labels[roomType] || roomType;
  }

  /**
   * Recommande le meilleur modèle pour un type de pièce
   */
  recommendModel(roomType: RoomInfo['type']): ViewSpec['model'] {
    // Imagen-4 excellent pour photoréalisme intérieur
    // Seedream-4 bon pour ambiances cosy/chambres
    const modelMapping: Record<string, ViewSpec['model']> = {
      'salon': 'imagen-4',
      'cuisine': 'imagen-4',
      'salle-de-bain': 'imagen-4',
      'chambre': 'seedream-4',
      'salle-a-manger': 'imagen-4',
      'bureau': 'imagen-4'
    };
    
    return modelMapping[roomType] || 'imagen-4';
  }

  /**
   * Calcule le nombre d'étapes d'inférence
   */
  calculateInferenceSteps(
    template: InteriorViewTemplate,
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

export const interiorViewTemplates = new InteriorViewTemplateService();
export default interiorViewTemplates;

/**
 * Constructeur de prompts enrichis pour génération 3D
 * Utilise l'analyse architecturale pour créer des prompts précis et fidèles
 */

import {
  ArchitecturalAnalysis,
  ViewSpec,
  GlobalRenderSettings
} from '../../types/architecturalAnalysis';

export class EnrichedPromptBuilder {
  /**
   * Construit un prompt enrichi à partir d'une spécification de vue et de l'analyse
   */
  buildPrompt(
    viewSpec: ViewSpec,
    analysis: ArchitecturalAnalysis,
    globalSettings: GlobalRenderSettings
  ): string {
    let prompt = '';

    // Base: type de vue
    prompt += this.getViewTypePrompt(viewSpec);

    // Style architectural
    prompt += this.getStylePrompt(analysis.project.style);

    // Matériaux et couleurs
    prompt += this.getMaterialsPrompt(globalSettings.projectAnchor.materials, globalSettings.projectAnchor.colorPalette);

    // Spécificités selon catégorie
    if (viewSpec.category === 'exterior') {
      prompt += this.getExteriorPrompt(viewSpec, analysis);
    } else {
      prompt += this.getInteriorPrompt(viewSpec, analysis);
    }

    // Ambiance (jour/nuit, saison)
    prompt += this.getAmbiancePrompt(viewSpec);

    // Qualité et contraintes techniques
    prompt += this.getTechnicalPrompt(viewSpec, globalSettings);

    return prompt.trim();
  }

  /**
   * Prompt négatif enrichi
   */
  buildNegativePrompt(viewSpec: ViewSpec): string {
    const base = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, ' +
                 'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
                 'oversaturated, unrealistic, fantasy, sci-fi';

    // Ajouts spécifiques
    const additions: string[] = [];

    if (viewSpec.category === 'exterior') {
      additions.push('indoor', 'interior', 'furniture');
    } else {
      additions.push('outdoor', 'exterior', 'sky', 'clouds');
    }

    if (viewSpec.timeOfDay === 'day') {
      additions.push('night', 'dark', 'moonlight');
    } else if (viewSpec.timeOfDay === 'night') {
      additions.push('bright daylight', 'noon', 'harsh shadows');
    }

    return [base, ...additions].join(', ');
  }

  /**
   * Prompt de base selon le type de vue
   */
  private getViewTypePrompt(viewSpec: ViewSpec): string {
    const prompts: Record<string, string> = {
      'facade-principale': 'Main facade architectural elevation, front view, ',
      'facade-secondaire': 'Secondary facade elevation, side view, ',
      'facade-arriere': 'Rear facade elevation, back view, ',
      'facade-cote': 'Side facade elevation, lateral view, ',
      'aerial-oblique': 'Oblique aerial view, birds eye perspective, site context, ',
      'aerial-frontal': 'Frontal aerial view, top-down perspective, building massing, ',
      'perspective-3d': '3D perspective view, three-quarter angle, volumetric rendering, ',
      'landscaping': 'Landscape architectural rendering, outdoor spaces, garden and terraces, ',
      'interior-wide': 'Interior wide shot, full room view, spatial composition, ',
      'interior-detail': 'Interior detail view, close-up composition, focused perspective, ',
      'interior-circulation': 'Interior circulation space, hallway or corridor view, '
    };

    return prompts[viewSpec.type] || 'Architectural rendering, ';
  }

  /**
   * Prompt de style architectural
   */
  private getStylePrompt(style: string): string {
    const styles: Record<string, string> = {
      'moderne': 'modern contemporary architecture, clean lines, minimalist design, ',
      'contemporain': 'contemporary architecture, innovative forms, bold design, ',
      'mediterraneen': 'Mediterranean architecture, warm tones, traditional elements, ',
      'traditionnel': 'traditional architecture, classic proportions, cultural heritage, ',
      'industriel': 'industrial architecture, exposed materials, raw aesthetic, ',
      'minimaliste': 'minimalist architecture, simple forms, essential design, ',
      'classique': 'classical architecture, symmetry, refined details, '
    };

    return styles[style] || 'architectural design, ';
  }

  /**
   * Prompt de matériaux et couleurs
   */
  private getMaterialsPrompt(materials: string[], colorPalette: string[]): string {
    let prompt = '';

    if (materials.length > 0) {
      prompt += `materials: ${materials.join(', ')}, `;
    }

    if (colorPalette.length > 0) {
      prompt += `color palette: ${colorPalette.join(', ')}, `;
    }

    return prompt;
  }

  /**
   * Prompt spécifique extérieur
   */
  private getExteriorPrompt(viewSpec: ViewSpec, analysis: ArchitecturalAnalysis): string {
    let prompt = '';

    // Ouvertures (fenêtres, portes)
    if (analysis.openings.windows.total > 0) {
      prompt += `${analysis.openings.windows.total} windows with accurate placement, `;
    }

    // Aménagements paysagers
    if (viewSpec.type === 'landscaping' && analysis.landscaping.features.length > 0) {
      prompt += `landscaping features: ${analysis.landscaping.features.join(', ')}, `;
    }

    // Contexte site
    prompt += 'realistic site context, accurate proportions from plan, ';

    return prompt;
  }

  /**
   * Prompt spécifique intérieur
   */
  private getInteriorPrompt(viewSpec: ViewSpec, analysis: ArchitecturalAnalysis): string {
    let prompt = '';

    // Trouver la pièce
    const room = analysis.rooms.find(r => r.id === viewSpec.roomId);
    if (room) {
      prompt += `${this.getRoomTypePrompt(room.type)}, `;

      // Surface si disponible
      if (room.area_m2) {
        prompt += `${room.area_m2}m² space, `;
      }

      // Features spécifiques
      if (room.features && room.features.length > 0) {
        prompt += `features: ${room.features.join(', ')}, `;
      }
    }

    // Style de décoration
    if (viewSpec.decorationStyle) {
      prompt += this.getDecorationPrompt(viewSpec.decorationStyle);
    }

    // Mode d'éclairage
    if (viewSpec.lightingMode) {
      prompt += this.getLightingPrompt(viewSpec.lightingMode);
    }

    return prompt;
  }

  /**
   * Prompt selon type de pièce
   */
  private getRoomTypePrompt(roomType: string): string {
    const prompts: Record<string, string> = {
      'salon': 'living room with comfortable seating, modern furniture',
      'cuisine': 'kitchen with functional layout, contemporary appliances',
      'salle-a-manger': 'dining room with table and chairs, elegant setting',
      'chambre': 'bedroom with bed and storage, cozy atmosphere',
      'salle-de-bain': 'bathroom with fixtures, clean modern design',
      'bureau': 'office space with desk and storage, professional setting',
      'hall': 'entrance hall, welcoming space',
      'couloir': 'corridor with good circulation, well-lit'
    };

    return prompts[roomType] || 'interior space';
  }

  /**
   * Prompt de style de décoration
   */
  private getDecorationPrompt(style: string): string {
    const styles: Record<string, string> = {
      'minimaliste': 'minimalist decor, clean lines, neutral tones, uncluttered, ',
      'cosy': 'cozy atmosphere, warm textures, comfortable furnishings, inviting, ',
      'luxueux': 'luxurious finishes, high-end materials, elegant furniture, refined, ',
      'moderne': 'modern furniture, contemporary design, sleek finishes, ',
      'classique': 'classic furniture, traditional elements, timeless style, ',
      'industriel': 'industrial style, exposed elements, raw materials, '
    };

    return styles[style] || '';
  }

  /**
   * Prompt de mode d'éclairage
   */
  private getLightingPrompt(mode: string): string {
    const modes: Record<string, string> = {
      'natural': 'natural daylight, soft shadows, ambient light, ',
      'spots': 'spot lighting, focused illumination, dramatic accents, ',
      'led': 'LED lighting, modern fixtures, even illumination, ',
      'ambient': 'ambient lighting, soft glow, atmospheric, ',
      'dramatic': 'dramatic lighting, strong contrasts, mood lighting, '
    };

    return modes[mode] || '';
  }

  /**
   * Prompt d'ambiance (jour/nuit, saison)
   */
  private getAmbiancePrompt(viewSpec: ViewSpec): string {
    let prompt = '';

    // Moment de la journée
    const timePrompts: Record<string, string> = {
      'day': 'bright daylight, clear sky, natural lighting, ',
      'sunset': 'golden hour, warm sunset lighting, dramatic sky, ',
      'night': 'night scene, artificial lighting, ambient illumination, starry sky, '
    };
    prompt += timePrompts[viewSpec.timeOfDay] || '';

    // Saison (si spécifiée)
    if (viewSpec.season) {
      const seasonPrompts: Record<string, string> = {
        'summer': 'summer season, lush vegetation, bright atmosphere, ',
        'winter': 'winter season, bare trees, soft light, ',
        'spring': 'spring season, blooming flowers, fresh greenery, ',
        'autumn': 'autumn season, warm colors, falling leaves, '
      };
      prompt += seasonPrompts[viewSpec.season] || '';
    }

    return prompt;
  }

  /**
   * Prompt de contraintes techniques
   */
  private getTechnicalPrompt(viewSpec: ViewSpec, globalSettings: GlobalRenderSettings): string {
    let prompt = 'photorealistic, high quality, detailed, professional photography, ';

    // Qualité
    const qualityPrompts: Record<string, string> = {
      'draft': '512px resolution, ',
      'standard': '768px resolution, ',
      'hd': '1024px resolution, ',
      '4k': '4K resolution, ultra detailed, ',
      '8k': '8K resolution, hyper detailed, '
    };
    prompt += qualityPrompts[viewSpec.quality] || '';

    // Contraintes de fidélité
    if (globalSettings.respectDimensions) {
      prompt += 'accurate proportions from architectural plan, ';
    }

    if (globalSettings.respectOpenings) {
      prompt += 'precise window and door placement, ';
    }

    if (globalSettings.respectMaterials) {
      prompt += 'faithful material representation, ';
    }

    prompt += 'architectural visualization';

    return prompt;
  }
}

export const enrichedPromptBuilder = new EnrichedPromptBuilder();
export default enrichedPromptBuilder;

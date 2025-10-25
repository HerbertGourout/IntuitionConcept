/**
 * Service de génération de spécifications de vues 3D
 * À partir de l'analyse architecturale et de la classification des pages
 */

import {
  ArchitecturalAnalysis,
  ViewGenerationSpec,
  ViewSpec,
  PageClassification,
  ViewType,
  GlobalRenderSettings,
  VariantSettings,
  DecorationStyle,
  LightingMode
} from '../../types/architecturalAnalysis';
import { exteriorViewTemplates } from './exteriorViewTemplates';
import { interiorViewTemplates } from './interiorViewTemplates';

class ViewSpecGenerator {
  /**
   * Génère les spécifications complètes de vues à partir de l'analyse
   */
  generateViewSpecs(
    analysis: ArchitecturalAnalysis,
    pageClassifications: PageClassification[],
    selectedPages: number[],
    options?: Partial<{
      includeVariants: boolean;
      quality: ViewSpec['quality'];
      generateInteriors: boolean;
      generateExteriors: boolean;
    }>
  ): ViewGenerationSpec {
    const opts = {
      includeVariants: true,
      quality: 'hd' as ViewSpec['quality'],
      generateInteriors: true,
      generateExteriors: true,
      ...options
    };

    const views: ViewSpec[] = [];

    // Générer les vues extérieures
    if (opts.generateExteriors) {
      views.push(...this.generateExteriorViews(analysis, pageClassifications, selectedPages, opts.quality));
    }

    // Générer les vues intérieures
    if (opts.generateInteriors) {
      views.push(...this.generateInteriorViews(analysis, pageClassifications, selectedPages, opts.quality));
    }

    // Paramètres globaux
    const globalSettings: GlobalRenderSettings = {
      projectAnchor: {
        style: analysis.project.style,
        materials: analysis.project.materials,
        colorPalette: analysis.project.colorPalette,
        sharedSeed: Date.now() // Seed partagé pour cohérence
      },
      defaultQuality: opts.quality,
      defaultModel: 'flux-1.1-pro',
      respectDimensions: true,
      respectOpenings: true,
      respectMaterials: true
    };

    // Variantes
    const variants: VariantSettings = {
      generateDayNight: opts.includeVariants,
      generateSeasons: false, // Optionnel
      decorationStyles: opts.includeVariants ? ['minimaliste', 'cosy', 'luxueux'] : [],
      lightingModes: opts.includeVariants ? ['natural', 'spots'] : []
    };

    return {
      views,
      globalSettings,
      variants
    };
  }

  /**
   * Génère les vues extérieures (façades, aérienne, paysage)
   * Utilise les templates optimisés pour des prompts de haute qualité
   */
  private generateExteriorViews(
    analysis: ArchitecturalAnalysis,
    pageClassifications: PageClassification[],
    selectedPages: number[],
    quality: ViewSpec['quality']
  ): ViewSpec[] {
    // Utiliser le service de templates extérieurs optimisés
    const globalSettings: GlobalRenderSettings = {
      projectAnchor: {
        style: analysis.project.style,
        materials: analysis.project.materials,
        colorPalette: analysis.project.colorPalette
      },
      defaultQuality: quality,
      defaultModel: 'flux-1.1-pro',
      respectDimensions: true,
      respectOpenings: true,
      respectMaterials: true
    };

    const views = exteriorViewTemplates.generateExteriorViews(
      analysis,
      globalSettings,
      {
        includeFacades: true,
        includeAerial: true,
        includeLandscaping: analysis.landscaping.features.length > 0,
        includeNightViews: true,
        quality
      }
    );

    // Associer les pages aux vues
    const facadePages = pageClassifications.filter(
      p => selectedPages.includes(p.pageIndex) && p.type === 'facade'
    );
    const aerialPages = pageClassifications.filter(
      p => selectedPages.includes(p.pageIndex) && 
      (p.type === 'plan-niveau' || p.type === 'plan-masse')
    );

    views.forEach(view => {
      if (view.category === 'exterior') {
        if (view.type.includes('facade') && facadePages.length > 0) {
          view.pageIndex = facadePages[0].pageIndex;
        } else if (view.type.includes('aerial') && aerialPages.length > 0) {
          view.pageIndex = aerialPages[0].pageIndex;
        }
      }
    });

    return views;
  }

  /**
   * Version legacy pour compatibilité (non utilisée avec templates)
   */
  private generateExteriorViewsLegacy(
    analysis: ArchitecturalAnalysis,
    pageClassifications: PageClassification[],
    selectedPages: number[],
    quality: ViewSpec['quality']
  ): ViewSpec[] {
    const views: ViewSpec[] = [];

    // Vues des façades
    for (const facade of analysis.facades) {
      const facadePages = pageClassifications.filter(
        p => selectedPages.includes(p.pageIndex) && p.type === 'facade'
      );

      const pageIndex = facadePages.length > 0 ? facadePages[0].pageIndex : undefined;

      const viewType = this.mapFacadeTypeToViewType(facade.type);

      // Vue jour
      views.push({
        id: `ext-${facade.type}-day`,
        type: viewType,
        category: 'exterior',
        pageIndex,
        viewAngle: 'front-facade',
        subject: `Façade ${facade.type}`,
        facadeType: facade.type,
        model: 'flux-1.1-pro',
        quality,
        timeOfDay: 'day'
      });

      // Vue nuit
      views.push({
        id: `ext-${facade.type}-night`,
        type: viewType,
        category: 'exterior',
        pageIndex,
        viewAngle: 'front-facade',
        subject: `Façade ${facade.type} (nuit)`,
        facadeType: facade.type,
        model: 'flux-1.1-pro',
        quality,
        timeOfDay: 'night'
      });
    }

    // Vues aériennes
    const aerialPages = pageClassifications.filter(
      p => selectedPages.includes(p.pageIndex) && 
      (p.type === 'plan-niveau' || p.type === 'plan-masse')
    );

    if (aerialPages.length > 0) {
      const pageIndex = aerialPages[0].pageIndex;

      // Vue aérienne oblique
      views.push({
        id: 'ext-aerial-oblique-day',
        type: 'aerial-oblique',
        category: 'exterior',
        pageIndex,
        viewAngle: 'aerial-view',
        cameraPosition: { distance: 'far', angle: 'high' },
        subject: 'Vue aérienne oblique',
        model: 'flux-pro', // Bon pour vues marketing
        quality,
        timeOfDay: 'day'
      });

      // Vue aérienne frontale
      views.push({
        id: 'ext-aerial-frontal-day',
        type: 'aerial-frontal',
        category: 'exterior',
        pageIndex,
        viewAngle: 'aerial-view',
        cameraPosition: { distance: 'medium', angle: 'high' },
        subject: 'Vue aérienne frontale',
        model: 'flux-pro',
        quality,
        timeOfDay: 'day'
      });
    }

    // Vue paysage (jardin, terrasse, piscine)
    if (analysis.landscaping.features.length > 0) {
      const landscapePages = pageClassifications.filter(
        p => selectedPages.includes(p.pageIndex) && p.type === 'plan-masse'
      );

      if (landscapePages.length > 0) {
        views.push({
          id: 'ext-landscaping-day',
          type: 'landscaping',
          category: 'exterior',
          pageIndex: landscapePages[0].pageIndex,
          viewAngle: '3d-perspective',
          cameraPosition: { distance: 'medium', angle: 'eye-level' },
          subject: 'Aménagements extérieurs',
          model: 'seedream-4', // Bon pour végétation/ambiance
          quality,
          timeOfDay: 'day'
        });
      }
    }

    return views;
  }

  /**
   * Génère les vues intérieures (pièces principales)
   * Utilise les templates optimisés pour des prompts de haute qualité
   */
  private generateInteriorViews(
    analysis: ArchitecturalAnalysis,
    pageClassifications: PageClassification[],
    selectedPages: number[],
    quality: ViewSpec['quality']
  ): ViewSpec[] {
    // Utiliser le service de templates intérieurs optimisés
    const globalSettings: GlobalRenderSettings = {
      projectAnchor: {
        style: analysis.project.style,
        materials: analysis.project.materials,
        colorPalette: analysis.project.colorPalette
      },
      defaultQuality: quality,
      defaultModel: 'imagen-4',
      respectDimensions: true,
      respectOpenings: true,
      respectMaterials: true
    };

    const views = interiorViewTemplates.generateInteriorViews(
      analysis,
      globalSettings,
      {
        includeWideViews: true,
        includeDetailViews: true,
        decorationStyles: ['moderne'], // Par défaut, sera configurable
        lightingModes: ['natural'], // Par défaut, sera configurable
        quality
      }
    );

    // Associer les pages aux vues
    const interiorPages = pageClassifications.filter(
      p => selectedPages.includes(p.pageIndex) && 
      (p.type === 'plan-interieur' || p.type === 'plan-niveau')
    );

    views.forEach(view => {
      if (view.category === 'interior' && interiorPages.length > 0) {
        view.pageIndex = interiorPages[0].pageIndex;
      }
    });

    return views;
  }

  /**
   * Version legacy pour compatibilité (non utilisée avec templates)
   */
  private generateInteriorViewsLegacy(
    analysis: ArchitecturalAnalysis,
    pageClassifications: PageClassification[],
    selectedPages: number[],
    quality: ViewSpec['quality']
  ): ViewSpec[] {
    const views: ViewSpec[] = [];

    const mainRooms = analysis.rooms.filter(room => 
      ['salon', 'cuisine', 'salle-a-manger', 'chambre', 'salle-de-bain'].includes(room.type)
    );

    const interiorPages = pageClassifications.filter(
      p => selectedPages.includes(p.pageIndex) && 
      (p.type === 'plan-interieur' || p.type === 'plan-niveau')
    );

    const pageIndex = interiorPages.length > 0 ? interiorPages[0].pageIndex : undefined;

    for (const room of mainRooms) {
      // Vue large de la pièce
      views.push({
        id: `int-${room.id}-wide-day`,
        type: 'interior-wide',
        category: 'interior',
        pageIndex,
        viewAngle: 'interior',
        cameraPosition: { distance: 'medium', angle: 'eye-level' },
        subject: `${this.getRoomLabel(room.type)} - Vue large`,
        roomId: room.id,
        model: 'imagen-4', // Photoréalisme intérieur
        quality,
        timeOfDay: 'day',
        decorationStyle: 'moderne',
        lightingMode: 'natural'
      });

      // Vue détail (si pièce importante)
      if (['salon', 'cuisine', 'chambre'].includes(room.type)) {
        views.push({
          id: `int-${room.id}-detail-day`,
          type: 'interior-detail',
          category: 'interior',
          pageIndex,
          viewAngle: 'interior',
          cameraPosition: { distance: 'close', angle: 'eye-level', focus: this.getRoomDetailFocus(room.type) },
          subject: `${this.getRoomLabel(room.type)} - Détail`,
          roomId: room.id,
          model: 'imagen-4',
          quality,
          timeOfDay: 'day',
          decorationStyle: 'moderne',
          lightingMode: 'natural'
        });
      }
    }

    return views;
  }

  /**
   * Mapping type de façade → type de vue
   */
  private mapFacadeTypeToViewType(facadeType: string): ViewType {
    const mapping: Record<string, ViewType> = {
      'principale': 'facade-principale',
      'secondaire': 'facade-secondaire',
      'arriere': 'facade-arriere',
      'cote': 'facade-cote'
    };
    return mapping[facadeType] || 'facade-principale';
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
      'bureau': 'Bureau',
      'cellier': 'Cellier',
      'garage': 'Garage',
      'terrasse': 'Terrasse',
      'balcon': 'Balcon'
    };
    return labels[roomType] || roomType;
  }

  /**
   * Focus pour vue détail selon type de pièce
   */
  private getRoomDetailFocus(roomType: string): string {
    const focus: Record<string, string> = {
      'salon': 'coin salon',
      'cuisine': 'îlot central',
      'chambre': 'tête de lit',
      'salle-de-bain': 'vasque et miroir'
    };
    return focus[roomType] || 'centre de la pièce';
  }

  /**
   * Génère des variantes pour une vue de base
   */
  generateVariants(
    baseView: ViewSpec,
    variants: VariantSettings
  ): ViewSpec[] {
    const views: ViewSpec[] = [baseView];

    // Variantes jour/nuit
    if (variants.generateDayNight && baseView.timeOfDay === 'day') {
      views.push({
        ...baseView,
        id: `${baseView.id}-night`,
        timeOfDay: 'night',
        subject: `${baseView.subject} (nuit)`
      });
    }

    // Variantes décoration (intérieurs uniquement)
    if (baseView.category === 'interior' && variants.decorationStyles.length > 0) {
      for (const style of variants.decorationStyles) {
        if (style !== baseView.decorationStyle) {
          views.push({
            ...baseView,
            id: `${baseView.id}-${style}`,
            decorationStyle: style,
            subject: `${baseView.subject} (${style})`
          });
        }
      }
    }

    // Variantes éclairage (intérieurs uniquement)
    if (baseView.category === 'interior' && variants.lightingModes.length > 0) {
      for (const lighting of variants.lightingModes) {
        if (lighting !== baseView.lightingMode) {
          views.push({
            ...baseView,
            id: `${baseView.id}-${lighting}`,
            lightingMode: lighting,
            subject: `${baseView.subject} (${lighting})`
          });
        }
      }
    }

    return views;
  }
}

export const viewSpecGenerator = new ViewSpecGenerator();
export default viewSpecGenerator;

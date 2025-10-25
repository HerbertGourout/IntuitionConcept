/**
 * Générateur de variantes pour vues 3D
 * Gère les combinaisons jour/nuit, styles déco, éclairage, saisons
 */

import {
  ViewSpec,
  DecorationStyle,
  LightingMode,
  VariantSettings
} from '../../types/architecturalAnalysis';

export interface VariantConfig {
  generateDayNight: boolean;
  generateSeasons: boolean;
  decorationStyles: DecorationStyle[];
  lightingModes: LightingMode[];
  maxVariantsPerView: number; // Limite pour éviter explosion combinatoire
}

class VariantsGenerator {
  /**
   * Génère toutes les variantes d'une vue de base
   */
  generateVariants(
    baseView: ViewSpec,
    config: VariantConfig
  ): ViewSpec[] {
    const variants: ViewSpec[] = [baseView];

    if (baseView.category === 'exterior') {
      return this.generateExteriorVariants(baseView, config);
    } else {
      return this.generateInteriorVariants(baseView, config);
    }
  }

  /**
   * Génère les variantes pour vues extérieures
   */
  private generateExteriorVariants(
    baseView: ViewSpec,
    config: VariantConfig
  ): ViewSpec[] {
    const variants: ViewSpec[] = [];

    // Variante de base
    variants.push(baseView);

    // Variantes jour/nuit
    if (config.generateDayNight) {
      if (baseView.timeOfDay === 'day') {
        variants.push({
          ...baseView,
          id: `${baseView.id}-night`,
          timeOfDay: 'night',
          subject: `${baseView.subject} (Nuit)`
        });
      }

      // Ajouter sunset comme variante intermédiaire
      variants.push({
        ...baseView,
        id: `${baseView.id}-sunset`,
        timeOfDay: 'sunset',
        subject: `${baseView.subject} (Coucher de soleil)`
      });
    }

    // Variantes saisons (seulement pour vues avec végétation)
    if (config.generateSeasons && this.hasVegetation(baseView)) {
      for (const season of ['summer', 'winter'] as const) {
        if (season !== baseView.season) {
          variants.push({
            ...baseView,
            id: `${baseView.id}-${season}`,
            season,
            subject: `${baseView.subject} (${this.getSeasonLabel(season)})`
          });
        }
      }
    }

    // Limiter le nombre de variantes
    return variants.slice(0, config.maxVariantsPerView);
  }

  /**
   * Génère les variantes pour vues intérieures
   */
  private generateInteriorVariants(
    baseView: ViewSpec,
    config: VariantConfig
  ): ViewSpec[] {
    const variants: ViewSpec[] = [];

    // Variante de base
    variants.push(baseView);

    // Variantes styles de décoration
    if (config.decorationStyles.length > 0) {
      for (const style of config.decorationStyles) {
        if (style !== baseView.decorationStyle) {
          variants.push({
            ...baseView,
            id: `${baseView.id}-${style}`,
            decorationStyle: style,
            subject: `${baseView.subject?.replace(/\(.*\)/, '')}(${style})`
          });
        }
      }
    }

    // Variantes modes d'éclairage
    if (config.lightingModes.length > 0) {
      for (const lighting of config.lightingModes) {
        if (lighting !== baseView.lightingMode) {
          variants.push({
            ...baseView,
            id: `${baseView.id}-${lighting}`,
            lightingMode: lighting,
            subject: `${baseView.subject?.replace(/\(.*\)/, '')}(${lighting})`
          });
        }
      }
    }

    // Limiter le nombre de variantes
    return variants.slice(0, config.maxVariantsPerView);
  }

  /**
   * Génère une grille de variantes combinées (pour cas spéciaux)
   */
  generateVariantGrid(
    baseView: ViewSpec,
    decorationStyles: DecorationStyle[],
    lightingModes: LightingMode[]
  ): ViewSpec[] {
    const variants: ViewSpec[] = [];

    if (baseView.category !== 'interior') {
      return [baseView];
    }

    // Générer toutes les combinaisons
    for (const decorationStyle of decorationStyles) {
      for (const lightingMode of lightingModes) {
        variants.push({
          ...baseView,
          id: `${baseView.id}-${decorationStyle}-${lightingMode}`,
          decorationStyle,
          lightingMode,
          subject: `${baseView.subject?.split('(')[0].trim()} (${decorationStyle}, ${lightingMode})`
        });
      }
    }

    return variants;
  }

  /**
   * Calcule le nombre total de variantes
   */
  calculateTotalVariants(
    baseViews: ViewSpec[],
    config: VariantConfig
  ): number {
    let total = 0;

    for (const view of baseViews) {
      const variants = this.generateVariants(view, config);
      total += variants.length;
    }

    return total;
  }

  /**
   * Estime le coût total des variantes
   */
  estimateCost(
    baseViews: ViewSpec[],
    config: VariantConfig,
    costPerView: number = 0.004 // Coût moyen HD
  ): number {
    const totalVariants = this.calculateTotalVariants(baseViews, config);
    return totalVariants * costPerView;
  }

  /**
   * Estime la durée totale de génération
   */
  estimateDuration(
    baseViews: ViewSpec[],
    config: VariantConfig,
    secondsPerView: number = 60,
    concurrency: number = 2
  ): number {
    const totalVariants = this.calculateTotalVariants(baseViews, config);
    return Math.ceil((totalVariants * secondsPerView) / concurrency);
  }

  /**
   * Vérifie si une vue contient de la végétation
   */
  private hasVegetation(view: ViewSpec): boolean {
    return view.type === 'landscaping' || 
           view.type === 'aerial-oblique' || 
           view.type === 'aerial-frontal';
  }

  /**
   * Label de saison
   */
  private getSeasonLabel(season: string): string {
    const labels: Record<string, string> = {
      'summer': 'Été',
      'winter': 'Hiver',
      'spring': 'Printemps',
      'autumn': 'Automne'
    };
    return labels[season] || season;
  }

  /**
   * Génère des variantes intelligentes (évite surcharge)
   */
  generateSmartVariants(
    baseViews: ViewSpec[],
    settings: VariantSettings
  ): ViewSpec[] {
    const allVariants: ViewSpec[] = [];

    for (const baseView of baseViews) {
      if (baseView.category === 'exterior') {
        // Extérieurs: jour/nuit seulement
        allVariants.push(baseView);
        if (settings.generateDayNight && baseView.timeOfDay === 'day') {
          allVariants.push({
            ...baseView,
            id: `${baseView.id}-night`,
            timeOfDay: 'night',
            subject: `${baseView.subject} (Nuit)`
          });
        }
      } else {
        // Intérieurs: une variante déco + une variante éclairage max
        allVariants.push(baseView);
        
        // Ajouter une variante déco si disponible
        if (settings.decorationStyles.length > 0) {
          const altStyle = settings.decorationStyles.find(s => s !== baseView.decorationStyle);
          if (altStyle) {
            allVariants.push({
              ...baseView,
              id: `${baseView.id}-${altStyle}`,
              decorationStyle: altStyle,
              subject: `${baseView.subject?.split('(')[0].trim()} (${altStyle})`
            });
          }
        }

        // Ajouter une variante éclairage si disponible
        if (settings.lightingModes.length > 0) {
          const altLighting = settings.lightingModes.find(l => l !== baseView.lightingMode);
          if (altLighting) {
            allVariants.push({
              ...baseView,
              id: `${baseView.id}-${altLighting}`,
              lightingMode: altLighting,
              subject: `${baseView.subject?.split('(')[0].trim()} (${altLighting})`
            });
          }
        }
      }
    }

    return allVariants;
  }

  /**
   * Filtre les variantes selon un budget
   */
  filterByBudget(
    variants: ViewSpec[],
    maxCost: number,
    costPerView: number = 0.004
  ): ViewSpec[] {
    const maxViews = Math.floor(maxCost / costPerView);
    return variants.slice(0, maxViews);
  }

  /**
   * Priorise les variantes selon leur importance
   */
  prioritizeVariants(variants: ViewSpec[]): ViewSpec[] {
    return variants.sort((a, b) => {
      // Priorité 1: Vues de base (sans variantes)
      const aIsBase = !a.id.includes('-night') && !a.id.includes('-sunset') && 
                      !a.id.includes('-minimaliste') && !a.id.includes('-cosy');
      const bIsBase = !b.id.includes('-night') && !b.id.includes('-sunset') && 
                      !b.id.includes('-minimaliste') && !b.id.includes('-cosy');
      
      if (aIsBase && !bIsBase) return -1;
      if (!aIsBase && bIsBase) return 1;

      // Priorité 2: Extérieurs avant intérieurs
      if (a.category === 'exterior' && b.category === 'interior') return -1;
      if (a.category === 'interior' && b.category === 'exterior') return 1;

      // Priorité 3: Vues larges avant détails
      if (a.type === 'interior-wide' && b.type === 'interior-detail') return -1;
      if (a.type === 'interior-detail' && b.type === 'interior-wide') return 1;

      return 0;
    });
  }
}

export const variantsGenerator = new VariantsGenerator();
export default variantsGenerator;

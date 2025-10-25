/**
 * Garde-fou budgétaire pour les générations 3D
 * Estime les coûts et applique des limites
 */

import { ViewSpec } from '../../types/architecturalAnalysis';

export interface BudgetEstimate {
  totalViews: number;
  estimatedCost: number; // USD
  estimatedCostFCFA: number;
  estimatedDuration: number; // secondes
  breakdown: {
    exteriors: { count: number; cost: number };
    interiors: { count: number; cost: number };
    variants: { count: number; cost: number };
  };
  warnings: string[];
}

export interface BudgetLimits {
  maxCostUSD: number;
  maxViews: number;
  maxDuration: number; // secondes
  warnThresholdUSD: number;
}

class BudgetGuardrail {
  // Coûts par modèle (estimation moyenne)
  private modelCosts: Record<string, number> = {
    'flux-1.1-pro': 0.005, // Plus cher, haute qualité
    'flux-pro': 0.004,
    'imagen-4': 0.004,
    'seedream-4': 0.003,
    'sdxl': 0.002
  };

  // Coûts par qualité
  private qualityCosts: Record<string, number> = {
    'draft': 0.5,    // 50% du coût de base
    'standard': 1.0, // 100%
    'hd': 1.5,       // 150%
    '4k': 2.0,       // 200%
    '8k': 3.0        // 300%
  };

  // Taux de conversion USD → FCFA
  private readonly USD_TO_FCFA = 655;

  // Limites par défaut
  private defaultLimits: BudgetLimits = {
    maxCostUSD: 1.0,        // 1 USD = 655 FCFA
    maxViews: 50,
    maxDuration: 3600,      // 1 heure
    warnThresholdUSD: 0.5   // Avertir à 0.50 USD
  };

  /**
   * Estime le coût d'une vue
   */
  estimateViewCost(view: ViewSpec): number {
    const baseCost = this.modelCosts[view.model] || 0.004;
    const qualityMultiplier = this.qualityCosts[view.quality] || 1.0;
    return baseCost * qualityMultiplier;
  }

  /**
   * Estime le coût total d'un batch
   */
  estimateBatchCost(views: ViewSpec[]): BudgetEstimate {
    const exteriors = views.filter(v => v.category === 'exterior');
    const interiors = views.filter(v => v.category === 'interior');
    
    // Identifier les variantes (vues avec même base mais paramètres différents)
    const baseViews = views.filter(v => 
      !v.id.includes('-night') && 
      !v.id.includes('-sunset') &&
      !v.id.includes('-minimaliste') &&
      !v.id.includes('-cosy')
    );
    const variants = views.filter(v => !baseViews.includes(v));

    const exteriorCost = exteriors.reduce((sum, v) => sum + this.estimateViewCost(v), 0);
    const interiorCost = interiors.reduce((sum, v) => sum + this.estimateViewCost(v), 0);
    const variantCost = variants.reduce((sum, v) => sum + this.estimateViewCost(v), 0);

    const totalCost = exteriorCost + interiorCost + variantCost;
    const estimatedDuration = this.estimateDuration(views.length);

    const warnings: string[] = [];
    
    // Vérifications
    if (totalCost > this.defaultLimits.warnThresholdUSD) {
      warnings.push(`Coût élevé: ${totalCost.toFixed(2)} USD (${(totalCost * this.USD_TO_FCFA).toFixed(0)} FCFA)`);
    }
    
    if (views.length > this.defaultLimits.maxViews) {
      warnings.push(`Nombre de vues élevé: ${views.length} vues`);
    }
    
    if (estimatedDuration > this.defaultLimits.maxDuration) {
      warnings.push(`Durée estimée longue: ${Math.ceil(estimatedDuration / 60)} minutes`);
    }

    return {
      totalViews: views.length,
      estimatedCost: totalCost,
      estimatedCostFCFA: totalCost * this.USD_TO_FCFA,
      estimatedDuration,
      breakdown: {
        exteriors: { count: exteriors.length, cost: exteriorCost },
        interiors: { count: interiors.length, cost: interiorCost },
        variants: { count: variants.length, cost: variantCost }
      },
      warnings
    };
  }

  /**
   * Estime la durée de génération
   */
  private estimateDuration(
    viewCount: number,
    secondsPerView: number = 60,
    concurrency: number = 2
  ): number {
    return Math.ceil((viewCount * secondsPerView) / concurrency);
  }

  /**
   * Vérifie si un batch respecte les limites
   */
  checkLimits(
    views: ViewSpec[],
    customLimits?: Partial<BudgetLimits>
  ): { allowed: boolean; reasons: string[] } {
    const limits = { ...this.defaultLimits, ...customLimits };
    const estimate = this.estimateBatchCost(views);
    const reasons: string[] = [];

    if (estimate.estimatedCost > limits.maxCostUSD) {
      reasons.push(
        `Coût trop élevé: ${estimate.estimatedCost.toFixed(2)} USD > ${limits.maxCostUSD} USD limite`
      );
    }

    if (estimate.totalViews > limits.maxViews) {
      reasons.push(
        `Trop de vues: ${estimate.totalViews} > ${limits.maxViews} limite`
      );
    }

    if (estimate.estimatedDuration > limits.maxDuration) {
      reasons.push(
        `Durée trop longue: ${Math.ceil(estimate.estimatedDuration / 60)} min > ${Math.ceil(limits.maxDuration / 60)} min limite`
      );
    }

    return {
      allowed: reasons.length === 0,
      reasons
    };
  }

  /**
   * Optimise un batch pour respecter les limites
   */
  optimizeBatch(
    views: ViewSpec[],
    limits?: Partial<BudgetLimits>
  ): { optimized: ViewSpec[]; removed: ViewSpec[]; savings: number } {
    const targetLimits = { ...this.defaultLimits, ...limits };
    const check = this.checkLimits(views, targetLimits);

    if (check.allowed) {
      return { optimized: views, removed: [], savings: 0 };
    }

    // Prioriser les vues
    const prioritized = this.prioritizeViews(views);
    const optimized: ViewSpec[] = [];
    const removed: ViewSpec[] = [];
    let currentCost = 0;

    for (const view of prioritized) {
      const viewCost = this.estimateViewCost(view);
      
      if (currentCost + viewCost <= targetLimits.maxCostUSD && 
          optimized.length < targetLimits.maxViews) {
        optimized.push(view);
        currentCost += viewCost;
      } else {
        removed.push(view);
      }
    }

    const originalCost = this.estimateBatchCost(views).estimatedCost;
    const optimizedCost = this.estimateBatchCost(optimized).estimatedCost;
    const savings = originalCost - optimizedCost;

    return { optimized, removed, savings };
  }

  /**
   * Priorise les vues par importance
   */
  private prioritizeViews(views: ViewSpec[]): ViewSpec[] {
    return views.sort((a, b) => {
      // Priorité 1: Vues de base avant variantes
      const aIsBase = !a.id.includes('-night') && !a.id.includes('-minimaliste');
      const bIsBase = !b.id.includes('-night') && !b.id.includes('-minimaliste');
      if (aIsBase && !bIsBase) return -1;
      if (!aIsBase && bIsBase) return 1;

      // Priorité 2: Extérieurs avant intérieurs
      if (a.category === 'exterior' && b.category === 'interior') return -1;
      if (a.category === 'interior' && b.category === 'exterior') return 1;

      // Priorité 3: Façades principales avant secondaires
      if (a.type === 'facade-principale' && b.type !== 'facade-principale') return -1;
      if (a.type !== 'facade-principale' && b.type === 'facade-principale') return 1;

      // Priorité 4: Vues larges avant détails
      if (a.type === 'interior-wide' && b.type === 'interior-detail') return -1;
      if (a.type === 'interior-detail' && b.type === 'interior-wide') return 1;

      return 0;
    });
  }

  /**
   * Suggère des optimisations
   */
  suggestOptimizations(views: ViewSpec[]): string[] {
    const suggestions: string[] = [];
    const estimate = this.estimateBatchCost(views);

    // Suggérer réduction qualité
    const hdViews = views.filter(v => v.quality === 'hd' || v.quality === '4k');
    if (hdViews.length > 10) {
      suggestions.push(
        `Réduire la qualité de ${hdViews.length} vues HD → Standard pour économiser ~${(hdViews.length * 0.002).toFixed(2)} USD`
      );
    }

    // Suggérer réduction variantes
    const variants = views.filter(v => 
      v.id.includes('-night') || v.id.includes('-minimaliste') || v.id.includes('-cosy')
    );
    if (variants.length > 10) {
      suggestions.push(
        `Réduire les variantes de ${variants.length} à 5-10 pour économiser ~${(variants.length * 0.002).toFixed(2)} USD`
      );
    }

    // Suggérer modèles moins chers
    const expensiveViews = views.filter(v => v.model === 'flux-1.1-pro' || v.model === 'imagen-4');
    if (expensiveViews.length > 15) {
      suggestions.push(
        `Utiliser flux-pro ou seedream-4 pour ${expensiveViews.length} vues pour économiser ~${(expensiveViews.length * 0.001).toFixed(2)} USD`
      );
    }

    // Suggérer cache
    suggestions.push(
      'Activer le cache pour éviter les recomputes (économies potentielles: 30-50%)'
    );

    return suggestions;
  }

  /**
   * Formate un montant en FCFA
   */
  formatFCFA(usd: number): string {
    const fcfa = usd * this.USD_TO_FCFA;
    return `${Math.round(fcfa).toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Formate une durée en minutes/heures
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.ceil((seconds % 3600) / 60);
      return `${hours}h ${minutes}min`;
    }
  }
}

export const budgetGuardrail = new BudgetGuardrail();
export default budgetGuardrail;

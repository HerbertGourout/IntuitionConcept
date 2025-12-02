import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StructuredQuote } from '../types/StructuredQuote';

export interface ComparisonData {
  quoteId: string;
  quoteTitle: string;
  estimatedTotal: number;
  definitiveTotal: number;
  gap: number; // %
  gapAmount: number; // FCFA
  gapByCategory: {
    foundations: { estimated: number; definitive: number; gap: number };
    structure: { estimated: number; definitive: number; gap: number };
    reinforcement: { estimated: number; definitive: number; gap: number };
    other: { estimated: number; definitive: number; gap: number };
  };
  lessons: string[];
  comparisonDate: string;
}

export interface ComparisonHistory {
  id: string;
  comparisons: ComparisonData[];
  avgGap: number;
  totalComparisons: number;
}

export class QuoteComparisonService {
  /**
   * Compare un devis estimatif avec sa version définitive
   */
  static async compareQuotes(
    estimativeQuoteId: string,
    definitiveQuoteId: string
  ): Promise<ComparisonData> {
    try {
      // Récupérer les deux devis
      const estimativeDoc = await getDoc(doc(db, 'structuredQuotes', estimativeQuoteId));
      const definitiveDoc = await getDoc(doc(db, 'structuredQuotes', definitiveQuoteId));

      if (!estimativeDoc.exists() || !definitiveDoc.exists()) {
        throw new Error('Un ou plusieurs devis introuvables');
      }

      const estimative = estimativeDoc.data() as StructuredQuote;
      const definitive = definitiveDoc.data() as StructuredQuote;

      // Calculer les totaux
      const estimatedTotal = estimative.totalAmount || 0;
      const definitiveTotal = definitive.totalAmount || 0;
      const gapAmount = definitiveTotal - estimatedTotal;
      const gap = estimatedTotal > 0 ? (gapAmount / estimatedTotal) * 100 : 0;

      // Analyser par catégorie
      const gapByCategory = this.analyzeGapByCategory(estimative, definitive);

      // Générer les leçons apprises
      const lessons = this.generateLessons(gap, gapByCategory);

      const comparison: ComparisonData = {
        quoteId: definitiveQuoteId,
        quoteTitle: definitive.title || 'Sans titre',
        estimatedTotal,
        definitiveTotal,
        gap,
        gapAmount,
        gapByCategory,
        lessons,
        comparisonDate: new Date().toISOString()
      };

      console.log('✅ Comparaison générée:', comparison);
      return comparison;
    } catch (error) {
      console.error('❌ Erreur comparaison devis:', error);
      throw error;
    }
  }

  /**
   * Analyse les écarts par catégorie
   */
  private static analyzeGapByCategory(
    estimative: StructuredQuote,
    definitive: StructuredQuote
  ) {
    const estimatedProvisions = estimative.structuralProvisions || {
      foundations: 0,
      structure: 0,
      reinforcement: 0
    };

    // Extraire les montants réels du devis définitif
    const definitiveAmounts = this.extractStructuralAmounts(definitive);

    const calculateGap = (est: number, def: number) => {
      return est > 0 ? ((def - est) / est) * 100 : 0;
    };

    return {
      foundations: {
        estimated: estimatedProvisions.foundations,
        definitive: definitiveAmounts.foundations,
        gap: calculateGap(estimatedProvisions.foundations, definitiveAmounts.foundations)
      },
      structure: {
        estimated: estimatedProvisions.structure,
        definitive: definitiveAmounts.structure,
        gap: calculateGap(estimatedProvisions.structure, definitiveAmounts.structure)
      },
      reinforcement: {
        estimated: estimatedProvisions.reinforcement,
        definitive: definitiveAmounts.reinforcement,
        gap: calculateGap(estimatedProvisions.reinforcement, definitiveAmounts.reinforcement)
      },
      other: {
        estimated: (estimative.totalAmount || 0) - 
                   (estimatedProvisions.foundations + estimatedProvisions.structure + estimatedProvisions.reinforcement),
        definitive: (definitive.totalAmount || 0) - 
                    (definitiveAmounts.foundations + definitiveAmounts.structure + definitiveAmounts.reinforcement),
        gap: 0
      }
    };
  }

  /**
   * Extrait les montants structurels d'un devis définitif
   */
  private static extractStructuralAmounts(quote: StructuredQuote) {
    let foundations = 0;
    let structure = 0;
    let reinforcement = 0;

    // Parcourir les phases et tâches pour identifier les postes structurels
    quote.phases?.forEach(phase => {
      phase.tasks?.forEach(task => {
        const taskName = task.name?.toLowerCase() || '';
        const taskAmount = task.totalPrice || 0;

        if (taskName.includes('fondation') || taskName.includes('semelle')) {
          foundations += taskAmount;
        } else if (taskName.includes('structure') || taskName.includes('béton') || taskName.includes('poteau') || taskName.includes('dalle')) {
          structure += taskAmount;
        } else if (taskName.includes('ferraillage') || taskName.includes('acier') || taskName.includes('armature')) {
          reinforcement += taskAmount;
        }
      });
    });

    return { foundations, structure, reinforcement };
  }

  /**
   * Génère des leçons apprises basées sur les écarts
   */
  private static generateLessons(gap: number, gapByCategory: ComparisonData['gapByCategory']): string[] {
    const lessons: string[] = [];

    // Leçon sur l'écart global
    if (Math.abs(gap) < 5) {
      lessons.push('✅ Excellente estimation ! Écart inférieur à 5%.');
    } else if (Math.abs(gap) < 15) {
      lessons.push('✓ Bonne estimation. Écart acceptable entre 5% et 15%.');
    } else if (gap > 15) {
      lessons.push('⚠️ Sous-estimation significative. Revoir les ratios de provisions.');
    } else {
      lessons.push('⚠️ Sur-estimation. Possibilité d\'optimisation des coûts.');
    }

    // Leçons par catégorie
    Object.entries(gapByCategory).forEach(([category, data]) => {
      if (Math.abs(data.gap) > 20) {
        const direction = data.gap > 0 ? 'sous-estimé' : 'sur-estimé';
        lessons.push(`📊 ${category}: ${direction} de ${Math.abs(data.gap).toFixed(1)}%`);
      }
    });

    // Recommandations
    if (gap > 15) {
      lessons.push(' Recommandation: Augmenter les marges de sécurité pour les futurs devis estimatifs.');
    }

    if (gapByCategory.foundations.gap > 25) {
      lessons.push('🏗️ Fondations: Prévoir une étude géotechnique systématique.');
    }

    if (gapByCategory.reinforcement.gap > 25) {
      lessons.push('🔩 Ferraillage: Revoir les ratios kg/m³ utilisés dans les templates.');
    }

    return lessons;
  }

  /**
   * Récupère l'historique des comparaisons
   */
  static async getComparisonHistory(): Promise<ComparisonHistory> {
    // TODO: Implémenter stockage dans Firestore
    return {
      id: 'history',
      comparisons: [],
      avgGap: 0,
      totalComparisons: 0
    };
  }

  /**
   * Sauvegarde une comparaison dans l'historique
   */
  static async saveComparison(comparison: ComparisonData): Promise<void> {
    // TODO: Implémenter stockage dans Firestore
    console.log('💾 Comparaison sauvegardée:', comparison);
  }

  /**
   * Calcule les statistiques globales des comparaisons
   */
  static calculateStats(comparisons: ComparisonData[]) {
    if (comparisons.length === 0) {
      return {
        avgGap: 0,
        minGap: 0,
        maxGap: 0,
        totalComparisons: 0,
        underestimated: 0,
        overestimated: 0,
        accurate: 0
      };
    }

    const gaps = comparisons.map(c => c.gap);
    const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    const minGap = Math.min(...gaps);
    const maxGap = Math.max(...gaps);

    return {
      avgGap,
      minGap,
      maxGap,
      totalComparisons: comparisons.length,
      underestimated: comparisons.filter(c => c.gap > 5).length,
      overestimated: comparisons.filter(c => c.gap < -5).length,
      accurate: comparisons.filter(c => Math.abs(c.gap) <= 5).length
    };
  }
}

export default QuoteComparisonService;

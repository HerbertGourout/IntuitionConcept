import { 
  doc, 
  updateDoc, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { StructuralStudy, StructuralStudyStatus, QuoteType, StructuralProvisions } from '../types/StructuredQuote';

const QUOTES_COLLECTION = 'structuredQuotes';

export class StructuralStudyService {
  /**
   * Met à jour le statut de l'étude structurale d'un devis
   */
  static async updateStudyStatus(
    quoteId: string,
    status: StructuralStudyStatus,
    additionalData?: Partial<StructuralStudy>
  ): Promise<void> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      const updateData: Record<string, unknown> = {
        'structuralStudy.status': status,
        updatedAt: Timestamp.now()
      };

      // Ajouter les données supplémentaires si fournies
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[`structuralStudy.${key}`] = value;
          }
        });
      }

      // Mettre à jour automatiquement les dates selon le statut
      if (status === 'in_progress' && !additionalData?.startDate) {
        updateData['structuralStudy.startDate'] = new Date().toISOString();
      }
      if (status === 'completed' && !additionalData?.completionDate) {
        updateData['structuralStudy.completionDate'] = new Date().toISOString();
      }

      await updateDoc(quoteRef, updateData);
      console.log(`✅ Statut étude structurale mis à jour: ${status}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour statut étude:', error);
      throw error;
    }
  }

  /**
   * Convertit un devis estimatif en devis définitif
   */
  static async convertToPreliminary(quoteId: string): Promise<void> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(quoteRef, {
        quoteType: 'preliminary' as QuoteType,
        uncertaintyMargin: 35, // 35% par défaut pour estimatif
        'structuralStudy.status': 'none' as StructuralStudyStatus,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Devis converti en estimatif');
    } catch (error) {
      console.error('❌ Erreur conversion devis estimatif:', error);
      throw error;
    }
  }

  /**
   * Convertit un devis estimatif en devis définitif (après étude complète)
   */
  static async convertToDefinitive(
    quoteId: string,
    removeProvisions: boolean = true
  ): Promise<void> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      const updateData: Record<string, unknown> = {
        quoteType: 'definitive' as QuoteType,
        uncertaintyMargin: 10, // 10% pour définitif
        'structuralStudy.status': 'completed' as StructuralStudyStatus,
        updatedAt: Timestamp.now()
      };

      // Supprimer les provisions si demandé
      if (removeProvisions) {
        updateData.structuralProvisions = null;
      }

      await updateDoc(quoteRef, updateData);
      console.log('✅ Devis converti en définitif');
    } catch (error) {
      console.error('❌ Erreur conversion devis définitif:', error);
      throw error;
    }
  }

  /**
   * Ajoute ou met à jour les provisions structurelles
   */
  static async updateStructuralProvisions(
    quoteId: string,
    provisions: StructuralProvisions
  ): Promise<void> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(quoteRef, {
        structuralProvisions: provisions,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Provisions structurelles mises à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour provisions:', error);
      throw error;
    }
  }

  /**
   * Calcule la marge d'incertitude recommandée selon le type de projet et l'état de l'étude
   */
  static calculateRecommendedMargin(
    projectType: string,
    studyStatus: StructuralStudyStatus
  ): number {
    // Marges de base par type de projet
    const baseMargins: Record<string, number> = {
      construction: 40,
      renovation: 35,
      extension: 30,
      infrastructure: 45,
      maintenance: 25,
      demolition: 30
    };

    const baseMargin = baseMargins[projectType] || 35;

    // Réduction selon l'avancement de l'étude
    switch (studyStatus) {
      case 'completed':
        return 10; // Étude complète = marge minimale
      case 'in_progress':
        return Math.round(baseMargin * 0.6); // 60% de la marge de base
      case 'pending':
        return Math.round(baseMargin * 0.8); // 80% de la marge de base
      case 'none':
      default:
        return baseMargin; // Marge maximale
    }
  }

  /**
   * Génère un disclaimer automatique selon le type de devis
   */
  static generateDisclaimer(
    quoteType: QuoteType,
    studyStatus: StructuralStudyStatus,
    uncertaintyMargin: number
  ): string {
    if (quoteType === 'definitive' && studyStatus === 'completed') {
      return `✅ Devis définitif basé sur étude structurale complète. Marge d'incertitude: ±${uncertaintyMargin}%`;
    }

    const warnings: string[] = [];

    if (studyStatus === 'none') {
      warnings.push('⚠️ ATTENTION: Aucune étude structurale réalisée');
      warnings.push('• Les quantités de béton armé et ferraillage sont estimatives');
      warnings.push('• Le type de fondations n\'est pas déterminé');
      warnings.push('• Les sections des éléments porteurs sont provisoires');
    } else if (studyStatus === 'pending' || studyStatus === 'in_progress') {
      warnings.push('⏳ Étude structurale en cours');
      warnings.push('• Certains éléments structurels restent à préciser');
    }

    warnings.push(`• Marge d'incertitude: ±${uncertaintyMargin}%`);
    warnings.push('• Un devis définitif sera établi après étude béton armé complète');
    warnings.push('• Les prix peuvent varier selon les résultats de l\'étude géotechnique');

    return warnings.join('\n');
  }

  /**
   * Vérifie si un devis peut être converti en définitif
   */
  static async canConvertToDefinitive(quoteId: string): Promise<{
    canConvert: boolean;
    reasons: string[];
  }> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      const quoteSnap = await getDoc(quoteRef);

      if (!quoteSnap.exists()) {
        return { canConvert: false, reasons: ['Devis introuvable'] };
      }

      const quote = quoteSnap.data();
      const reasons: string[] = [];

      // Vérifier le statut de l'étude
      if (quote.structuralStudy?.status !== 'completed') {
        reasons.push('L\'étude structurale doit être complétée');
      }

      // Vérifier que les provisions ont été remplacées par des quantitatifs précis
      if (quote.structuralProvisions && Object.keys(quote.structuralProvisions).length > 0) {
        reasons.push('Les provisions structurelles doivent être remplacées par des quantitatifs précis');
      }

      // Vérifier qu'il y a des phases et tâches
      if (!quote.phases || quote.phases.length === 0) {
        reasons.push('Le devis doit contenir au moins une phase');
      }

      return {
        canConvert: reasons.length === 0,
        reasons
      };
    } catch (error) {
      console.error('❌ Erreur vérification conversion:', error);
      return { canConvert: false, reasons: ['Erreur lors de la vérification'] };
    }
  }
}

export default StructuralStudyService;

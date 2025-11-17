import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface StudyCost {
  id: string;
  quoteId: string;
  quoteTitle: string;
  budgetEstimated: number;
  actualCost: number;
  engineerFees: number;
  internalCost: number;
  geotechnicalCost: number;
  otherCosts: number;
  clientBilled: number;
  margin: number; // %
  marginAmount: number;
  status: 'estimated' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  breakdown: CostBreakdown[];
}

export interface CostBreakdown {
  id: string;
  category: 'engineer' | 'geotechnical' | 'internal' | 'other';
  description: string;
  amount: number;
  date: string;
  invoiceNumber?: string;
}

const STUDY_COSTS_COLLECTION = 'studyCosts';

export class StudyCostService {
  /**
   * Crée un suivi de coûts pour une étude
   */
  static async createStudyCost(
    quoteId: string,
    quoteTitle: string,
    budgetEstimated: number
  ): Promise<StudyCost> {
    const id = `cost_${Date.now()}`;
    const studyCost: StudyCost = {
      id,
      quoteId,
      quoteTitle,
      budgetEstimated,
      actualCost: 0,
      engineerFees: 0,
      internalCost: 0,
      geotechnicalCost: 0,
      otherCosts: 0,
      clientBilled: 0,
      margin: 0,
      marginAmount: 0,
      status: 'estimated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      breakdown: []
    };

    await setDoc(doc(db, STUDY_COSTS_COLLECTION, id), {
      ...studyCost,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('✅ Suivi coûts créé:', id);
    return studyCost;
  }

  /**
   * Ajoute un coût à l'étude
   */
  static async addCost(
    studyCostId: string,
    category: CostBreakdown['category'],
    description: string,
    amount: number,
    invoiceNumber?: string
  ): Promise<void> {
    const costRef = doc(db, STUDY_COSTS_COLLECTION, studyCostId);
    const costDoc = await getDoc(costRef);

    if (!costDoc.exists()) {
      throw new Error('Suivi coûts introuvable');
    }

    const studyCost = costDoc.data() as StudyCost;

    // Ajouter le coût au breakdown
    const newCost: CostBreakdown = {
      id: `breakdown_${Date.now()}`,
      category,
      description,
      amount,
      date: new Date().toISOString(),
      invoiceNumber
    };

    studyCost.breakdown.push(newCost);

    // Mettre à jour les totaux
    switch (category) {
      case 'engineer':
        studyCost.engineerFees += amount;
        break;
      case 'geotechnical':
        studyCost.geotechnicalCost += amount;
        break;
      case 'internal':
        studyCost.internalCost += amount;
        break;
      case 'other':
        studyCost.otherCosts += amount;
        break;
    }

    studyCost.actualCost = 
      studyCost.engineerFees + 
      studyCost.geotechnicalCost + 
      studyCost.internalCost + 
      studyCost.otherCosts;

    // Recalculer la marge
    if (studyCost.clientBilled > 0) {
      studyCost.marginAmount = studyCost.clientBilled - studyCost.actualCost;
      studyCost.margin = (studyCost.marginAmount / studyCost.clientBilled) * 100;
    }

    studyCost.updatedAt = new Date().toISOString();

    await updateDoc(costRef, {
      breakdown: studyCost.breakdown,
      engineerFees: studyCost.engineerFees,
      geotechnicalCost: studyCost.geotechnicalCost,
      internalCost: studyCost.internalCost,
      otherCosts: studyCost.otherCosts,
      actualCost: studyCost.actualCost,
      marginAmount: studyCost.marginAmount,
      margin: studyCost.margin,
      updatedAt: Timestamp.now()
    });

    console.log('✅ Coût ajouté:', newCost.id);
  }

  /**
   * Met à jour le montant facturé au client
   */
  static async updateClientBilling(
    studyCostId: string,
    clientBilled: number
  ): Promise<void> {
    const costRef = doc(db, STUDY_COSTS_COLLECTION, studyCostId);
    const costDoc = await getDoc(costRef);

    if (!costDoc.exists()) {
      throw new Error('Suivi coûts introuvable');
    }

    const studyCost = costDoc.data() as StudyCost;
    studyCost.clientBilled = clientBilled;
    studyCost.marginAmount = clientBilled - studyCost.actualCost;
    studyCost.margin = clientBilled > 0 
      ? (studyCost.marginAmount / clientBilled) * 100 
      : 0;

    await updateDoc(costRef, {
      clientBilled,
      marginAmount: studyCost.marginAmount,
      margin: studyCost.margin,
      updatedAt: Timestamp.now()
    });

    console.log('✅ Facturation client mise à jour');
  }

  /**
   * Marque l'étude comme complétée
   */
  static async completeStudy(studyCostId: string): Promise<void> {
    await updateDoc(doc(db, STUDY_COSTS_COLLECTION, studyCostId), {
      status: 'completed',
      updatedAt: Timestamp.now()
    });

    console.log('✅ Étude marquée comme complétée');
  }

  /**
   * Récupère le suivi de coûts d'un devis
   */
  static async getStudyCostByQuoteId(quoteId: string): Promise<StudyCost | null> {
    const q = query(
      collection(db, STUDY_COSTS_COLLECTION),
      where('quoteId', '==', quoteId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as StudyCost;
  }

  /**
   * Calcule les statistiques globales des coûts d'études
   */
  static async getGlobalStats() {
    const snapshot = await getDocs(collection(db, STUDY_COSTS_COLLECTION));
    const costs = snapshot.docs.map(doc => doc.data() as StudyCost);

    const totalBudget = costs.reduce((sum, c) => sum + c.budgetEstimated, 0);
    const totalActual = costs.reduce((sum, c) => sum + c.actualCost, 0);
    const totalBilled = costs.reduce((sum, c) => sum + c.clientBilled, 0);
    const totalMargin = totalBilled - totalActual;
    const avgMargin = totalBilled > 0 ? (totalMargin / totalBilled) * 100 : 0;

    return {
      totalStudies: costs.length,
      totalBudget,
      totalActual,
      totalBilled,
      totalMargin,
      avgMargin,
      budgetVariance: totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0
    };
  }

  /**
   * Génère un rapport de rentabilité
   */
  static generateProfitabilityReport(studyCost: StudyCost) {
    const costByCategory = {
      engineer: {
        amount: studyCost.engineerFees,
        percentage: studyCost.actualCost > 0 
          ? (studyCost.engineerFees / studyCost.actualCost) * 100 
          : 0
      },
      geotechnical: {
        amount: studyCost.geotechnicalCost,
        percentage: studyCost.actualCost > 0 
          ? (studyCost.geotechnicalCost / studyCost.actualCost) * 100 
          : 0
      },
      internal: {
        amount: studyCost.internalCost,
        percentage: studyCost.actualCost > 0 
          ? (studyCost.internalCost / studyCost.actualCost) * 100 
          : 0
      },
      other: {
        amount: studyCost.otherCosts,
        percentage: studyCost.actualCost > 0 
          ? (studyCost.otherCosts / studyCost.actualCost) * 100 
          : 0
      }
    };

    const budgetVariance = studyCost.budgetEstimated > 0
      ? ((studyCost.actualCost - studyCost.budgetEstimated) / studyCost.budgetEstimated) * 100
      : 0;

    const isProfitable = studyCost.margin > 0;
    const isOnBudget = Math.abs(budgetVariance) < 10;

    return {
      costByCategory,
      budgetVariance,
      isProfitable,
      isOnBudget,
      recommendations: this.generateRecommendations(studyCost, budgetVariance)
    };
  }

  /**
   * Génère des recommandations
   */
  private static generateRecommendations(studyCost: StudyCost, budgetVariance: number): string[] {
    const recommendations: string[] = [];

    if (studyCost.margin < 10) {
      recommendations.push('⚠️ Marge faible (<10%). Revoir la grille tarifaire.');
    }

    if (budgetVariance > 20) {
      recommendations.push('📊 Dépassement budget >20%. Améliorer l\'estimation initiale.');
    }

    if (studyCost.engineerFees > studyCost.actualCost * 0.6) {
      recommendations.push('💰 Honoraires ingénieur >60% du coût. Négocier les tarifs.');
    }

    if (studyCost.margin > 30) {
      recommendations.push('✅ Excellente rentabilité ! Capitaliser sur ce modèle.');
    }

    return recommendations;
  }
}

export default StudyCostService;

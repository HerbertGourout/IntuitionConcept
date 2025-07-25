import { PurchaseOrderService } from './purchaseOrderService';
import type { PurchaseOrder, DeliveryNote } from '../types/purchaseOrder';
import type { FinancialRecord } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Service d'intégration entre les bons d'achat et les budgets de projet
 * Synchronise automatiquement les données financières entre les modules
 */
export class BudgetIntegrationService {
  
  /**
   * Synchronise un bon d'achat approuvé avec le budget du projet
   * Crée une entrée de dépense prévisionnelle dans le projet
   */
  static async syncPurchaseOrderToBudget(purchaseOrder: PurchaseOrder): Promise<void> {
    try {
      console.log('🔄 Synchronisation bon d\'achat vers budget:', purchaseOrder.orderNumber);
      
      if (purchaseOrder.status !== 'approved') {
        console.log('⚠️ Bon d\'achat non approuvé, synchronisation ignorée');
        return;
      }

      // Créer une entrée de dépense prévisionnelle
      const financialRecord: Omit<FinancialRecord, 'id'> = {
        type: 'expense',
        category: this.mapSupplierTypeToCategory(purchaseOrder.supplier.type),
        amount: purchaseOrder.totalAmount,
        description: `Bon d'achat ${purchaseOrder.orderNumber} - ${purchaseOrder.supplier.name}`,
        date: purchaseOrder.approvedDate || purchaseOrder.orderDate,
        projectId: purchaseOrder.projectId,
        phaseId: purchaseOrder.phaseId,
        taskId: purchaseOrder.taskId,
        purchaseOrderId: purchaseOrder.id,
        status: 'planned', // Dépense planifiée
        tags: ['purchase_order', purchaseOrder.supplier.type],
        attachments: purchaseOrder.attachments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter à la collection des dépenses
      const expensesRef = collection(db, 'expenses');
      await addDoc(expensesRef, {
        ...financialRecord,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log('✅ Dépense prévisionnelle créée pour le bon d\'achat');
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation bon d\'achat vers budget:', error);
      throw error;
    }
  }

  /**
   * Met à jour les dépenses lors de la réception d'une livraison
   * Convertit les dépenses prévisionnelles en dépenses réelles
   */
  static async syncDeliveryToActualExpense(deliveryNote: DeliveryNote): Promise<void> {
    try {
      console.log('🔄 Synchronisation livraison vers dépense réelle:', deliveryNote.deliveryNumber);
      
      if (deliveryNote.status !== 'received') {
        console.log('⚠️ Livraison non réceptionnée, synchronisation ignorée');
        return;
      }

      const purchaseOrder = deliveryNote.purchaseOrder;
      
      // Calculer le montant réellement livré
      const actualAmount = this.calculateDeliveredAmount(deliveryNote);
      
      // Rechercher la dépense prévisionnelle correspondante
      const expensesRef = collection(db, 'expenses');
      const q = query(expensesRef, where('purchaseOrderId', '==', purchaseOrder.id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Mettre à jour la dépense existante
        const expenseDoc = querySnapshot.docs[0];
        await updateDoc(expenseDoc.ref, {
          amount: actualAmount,
          status: 'actual', // Dépense réelle
          description: `${expenseDoc.data().description} - Livré le ${deliveryNote.actualDeliveryDate}`,
          deliveryNoteId: deliveryNote.id,
          updatedAt: Timestamp.now()
        });
        
        console.log('✅ Dépense mise à jour avec le montant réel livré');
      } else {
        // Créer une nouvelle dépense réelle si pas de prévisionnelle
        const financialRecord: Omit<FinancialRecord, 'id'> = {
          type: 'expense',
          category: this.mapSupplierTypeToCategory(purchaseOrder.supplier.type) as 'materials' | 'equipment' | 'labor' | 'permits' | 'other',
          amount: actualAmount,
          description: `Livraison ${deliveryNote.deliveryNumber} - ${purchaseOrder.supplier.name}`,
          date: deliveryNote.actualDeliveryDate || deliveryNote.deliveryDate,
          projectId: purchaseOrder.projectId,
          phaseId: purchaseOrder.phaseId,
          taskId: purchaseOrder.taskId,
          purchaseOrderId: purchaseOrder.id,
          deliveryNoteId: deliveryNote.id,
          status: 'actual',
          tags: ['delivery', purchaseOrder.supplier.type],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addDoc(expensesRef, {
          ...financialRecord,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        console.log('✅ Nouvelle dépense réelle créée pour la livraison');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation livraison vers dépense:', error);
      throw error;
    }
  }

  /**
   * Supprime les dépenses associées à un bon d'achat annulé
   */
  static async removePurchaseOrderExpenses(purchaseOrderId: string): Promise<void> {
    try {
      console.log('🗑️ Suppression des dépenses pour bon d\'achat:', purchaseOrderId);
      
      const expensesRef = collection(db, 'expenses');
      const q = query(expensesRef, where('purchaseOrderId', '==', purchaseOrderId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`✅ ${querySnapshot.docs.length} dépense(s) supprimée(s)`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des dépenses:', error);
      throw error;
    }
  }

  /**
   * Calcule les métriques financières intégrées pour un projet
   * Inclut les données des bons d'achat dans les calculs
   */
  static async getIntegratedProjectFinancials(projectId: string) {
    try {
      console.log('📊 Calcul des métriques financières intégrées pour projet:', projectId);
      
      // Récupérer les bons d'achat du projet
      const purchaseOrders = await PurchaseOrderService.getPurchaseOrdersByProject(projectId);
      
      // Récupérer les dépenses du projet
      const expensesRef = collection(db, 'expenses');
      const q = query(expensesRef, where('projectId', '==', projectId));
      const expensesSnapshot = await getDocs(q);
      const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (FinancialRecord & { id: string })[];
      
      // Calculer les métriques
      const metrics = {
        // Bons d'achat
        totalPurchaseOrders: purchaseOrders.length,
        totalPurchaseOrderAmount: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
        approvedPurchaseOrders: purchaseOrders.filter(po => po.status === 'approved').length,
        pendingPurchaseOrders: purchaseOrders.filter(po => po.status === 'pending_approval').length,
        
        // Dépenses
        totalPlannedExpenses: expenses.filter(e => e.status === 'planned').reduce((sum, e) => sum + e.amount, 0),
        totalActualExpenses: expenses.filter(e => e.status === 'actual').reduce((sum, e) => sum + e.amount, 0),
        
        // Écarts
        budgetVariance: 0, // À calculer avec le budget total du projet
        
        // Répartition par catégorie
        expensesByCategory: this.groupExpensesByCategory(expenses),
        purchaseOrdersBySupplierType: this.groupPurchaseOrdersBySupplierType(purchaseOrders)
      };
      
      console.log('✅ Métriques financières intégrées calculées');
      return metrics;
      
    } catch (error) {
      console.error('❌ Erreur lors du calcul des métriques intégrées:', error);
      throw error;
    }
  }

  /**
   * Mappe le type de fournisseur vers une catégorie de dépense
   */
  private static mapSupplierTypeToCategory(supplierType: string): string {
    const mapping: { [key: string]: string } = {
      'materials': 'materials',
      'equipment': 'equipment',
      'services': 'labor',
      'transport': 'transport'
    };
    return mapping[supplierType] || 'other';
  }

  /**
   * Calcule le montant réellement livré basé sur les quantités reçues
   */
  private static calculateDeliveredAmount(deliveryNote: DeliveryNote): number {
    return deliveryNote.items.reduce((total, item) => {
      const purchaseOrderItem = deliveryNote.purchaseOrder.items.find(
        poi => poi.id === item.purchaseOrderItemId
      );
      if (purchaseOrderItem) {
        const deliveredRatio = item.deliveredQuantity / item.orderedQuantity;
        return total + (purchaseOrderItem.totalPrice * deliveredRatio);
      }
      return total;
    }, 0);
  }

  /**
   * Groupe les dépenses par catégorie
   */
  private static groupExpensesByCategory(expenses: (FinancialRecord & { id: string })[]) {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0 };
      }
      acc[category].count++;
      acc[category].amount += expense.amount;
      return acc;
    }, {});
  }

  /**
   * Groupe les bons d'achat par type de fournisseur
   */
  private static groupPurchaseOrdersBySupplierType(purchaseOrders: PurchaseOrder[]) {
    return purchaseOrders.reduce((acc, po) => {
      const type = po.supplier.type;
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 };
      }
      acc[type].count++;
      acc[type].amount += po.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);
  }
}

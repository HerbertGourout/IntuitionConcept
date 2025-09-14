import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, where, orderBy } from 'firebase/firestore';

export interface PurchaseOrder {
  id: string;
  projectId: string;
  phaseId?: string;
  taskId?: string;
  orderNumber: string;
  supplier: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface DeliveryNote {
  id: string;
  purchaseOrderId: string;
  projectId: string;
  phaseId?: string;
  taskId?: string;
  deliveryNumber: string;
  supplier: string;
  deliveryDate: string;
  receivedBy: string;
  items: DeliveryItem[];
  status: 'pending' | 'partial' | 'complete' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  purchaseOrderItemId: string;
  description: string;
  quantityOrdered: number;
  quantityDelivered: number;
  quantityAccepted: number;
  quantityRejected: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  phaseId?: string;
  taskId?: string;
  purchaseOrderId?: string;
  deliveryNoteId?: string;
  category: 'materials' | 'labor' | 'equipment' | 'services' | 'other';
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  receipt?: string; // URL to receipt image/document
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  projectId: string;
  phaseId?: string;
  taskId?: string;
  estimatedBudget: number;
  allocatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  commitments: number; // Montant des commandes en cours
  projectedTotal: number; // Dépensé + Engagements
  variance: number; // Écart par rapport au budget estimé
  variancePercentage: number;
  lastUpdated: Date;
}

class FinancialService {
  // Purchase Orders
  async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'purchaseOrders'), {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mettre à jour les budgets après création de commande
      await this.updateBudgetSummary(orderData.projectId, orderData.phaseId, orderData.taskId);
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du bon de commande:', error);
      throw error;
    }
  }

  async updatePurchaseOrder(orderId: string, updates: Partial<PurchaseOrder>): Promise<void> {
    try {
      const orderRef = doc(db, 'purchaseOrders', orderId);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date()
      });

      // Récupérer l'ordre pour mettre à jour les budgets
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as PurchaseOrder;
        await this.updateBudgetSummary(orderData.projectId, orderData.phaseId, orderData.taskId);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon de commande:', error);
      throw error;
    }
  }

  async getPurchaseOrdersByProject(projectId: string): Promise<PurchaseOrder[]> {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
    } catch (error) {
      console.error('Erreur lors de la récupération des bons de commande:', error);
      throw error;
    }
  }

  // Delivery Notes
  async createDeliveryNote(deliveryData: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'deliveryNotes'), {
        ...deliveryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mettre à jour le statut du bon de commande si livraison complète
      await this.updatePurchaseOrderStatus(deliveryData.purchaseOrderId, deliveryData);
      
      // Mettre à jour les budgets
      await this.updateBudgetSummary(deliveryData.projectId, deliveryData.phaseId, deliveryData.taskId);
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du bon de livraison:', error);
      throw error;
    }
  }

  // Expenses
  async createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mettre à jour les budgets
      await this.updateBudgetSummary(expenseData.projectId, expenseData.phaseId, expenseData.taskId);
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      throw error;
    }
  }

  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('projectId', '==', projectId),
        orderBy('expenseDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      throw error;
    }
  }

  // Budget Management
  async updateBudgetSummary(projectId: string, phaseId?: string, taskId?: string): Promise<void> {
    try {
      // Calculer les montants pour le niveau demandé
      const summary = await this.calculateBudgetSummary(projectId, phaseId, taskId);
      
      // Sauvegarder le résumé
      const summaryId = taskId || phaseId || projectId;
      const summaryRef = doc(db, 'budgetSummaries', summaryId);
      
      await updateDoc(summaryRef, {
        ...summary,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du résumé budgétaire:', error);
      throw error;
    }
  }

  async calculateBudgetSummary(projectId: string, phaseId?: string, taskId?: string): Promise<BudgetSummary> {
    try {
      // Construire les requêtes selon le niveau
      let expenseQuery = query(collection(db, 'expenses'), where('projectId', '==', projectId));
      let purchaseQuery = query(collection(db, 'purchaseOrders'), where('projectId', '==', projectId));

      if (taskId) {
        expenseQuery = query(expenseQuery, where('taskId', '==', taskId));
        purchaseQuery = query(purchaseQuery, where('taskId', '==', taskId));
      } else if (phaseId) {
        expenseQuery = query(expenseQuery, where('phaseId', '==', phaseId));
        purchaseQuery = query(purchaseQuery, where('phaseId', '==', phaseId));
      }

      // Récupérer les dépenses
      const expenseSnapshot = await getDocs(expenseQuery);
      const expenses = expenseSnapshot.docs.map(doc => doc.data() as Expense);
      
      // Récupérer les commandes
      const purchaseSnapshot = await getDocs(purchaseQuery);
      const purchaseOrders = purchaseSnapshot.docs.map(doc => doc.data() as PurchaseOrder);

      // Calculer les montants
      const spentAmount = expenses
        .filter(expense => expense.status === 'paid')
        .reduce((sum, expense) => sum + expense.amount, 0);

      const commitments = purchaseOrders
        .filter(order => ['sent', 'approved'].includes(order.status))
        .reduce((sum, order) => sum + order.amount, 0);

      const projectedTotal = spentAmount + commitments;

      // Récupérer le budget réel depuis le projet/phase/tâche
      let estimatedBudget = 0;
      let allocatedBudget = 0;

      if (taskId) {
        // Budget au niveau tâche
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          estimatedBudget = taskData.budget || taskData.estimatedCost || 0;
          allocatedBudget = taskData.allocatedBudget || estimatedBudget;
        }
      } else if (phaseId) {
        // Budget au niveau phase
        const phaseDoc = await getDoc(doc(db, 'phases', phaseId));
        if (phaseDoc.exists()) {
          const phaseData = phaseDoc.data();
          estimatedBudget = phaseData.budget || phaseData.estimatedCost || 0;
          allocatedBudget = phaseData.allocatedBudget || estimatedBudget;
        }
      } else if (projectId) {
        // Budget au niveau projet
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          estimatedBudget = projectData.budget || projectData.totalBudget || 0;
          allocatedBudget = projectData.allocatedBudget || estimatedBudget;
        }
      }

      // Fallback si aucun budget trouvé - calculer basé sur les dépenses historiques
      if (estimatedBudget === 0) {
        // Calculer un budget estimé basé sur les dépenses existantes + marge
        const historicalSpending = spentAmount > 0 ? spentAmount : 0;
        const averageProjectBudget = await this.calculateAverageProjectBudget();
        estimatedBudget = Math.max(historicalSpending * 1.5, averageProjectBudget, 5000);
        allocatedBudget = estimatedBudget;
      }
      const remainingBudget = allocatedBudget - projectedTotal;
      const variance = projectedTotal - estimatedBudget;
      const variancePercentage = estimatedBudget > 0 ? (variance / estimatedBudget) * 100 : 0;

      return {
        projectId,
        phaseId,
        taskId,
        estimatedBudget,
        allocatedBudget,
        spentAmount,
        remainingBudget,
        commitments,
        projectedTotal,
        variance,
        variancePercentage,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Erreur lors du calcul du résumé budgétaire:', error);
      throw error;
    }
  }

  /**
   * Calculer les tendances mensuelles réelles basées sur les transactions Firebase
   */
  async calculateMonthlyTrends(projectId: string, months: number = 6): Promise<{ month: string; income: number; expenses: number; }[]> {
    try {
      // Récupérer toutes les transactions du projet
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('projectId', '==', projectId),
        orderBy('date', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Créer un objet pour stocker les données par mois
      const monthlyData: Record<string, { income: number; expenses: number }> = {};
      
      // Générer les derniers mois
      const currentDate = new Date();
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      // Traiter les transactions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions.forEach((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          const amount = Math.abs(transaction.amount || 0);
          
          // Catégoriser comme revenus ou dépenses
          if (transaction.category === 'revenue' || transaction.category === 'client_payment' || transaction.amount > 0) {
            monthlyData[monthKey].income += amount;
          } else {
            monthlyData[monthKey].expenses += amount;
          }
        }
      });

      // Convertir en format attendu
      const result = Object.entries(monthlyData).map(([monthKey, data]) => {
        const [, month] = monthKey.split('-');
        const monthIndex = parseInt(month) - 1;
        const monthLabel = monthNames[monthIndex];
        
        return {
          month: monthLabel,
          income: data.income,
          expenses: data.expenses
        };
      });

      console.log('✅ Tendances mensuelles calculées depuis Firebase:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des tendances mensuelles:', error);
      // Retourner des données vides en cas d'erreur
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
      return monthNames.map(month => ({ month, income: 0, expenses: 0 }));
    }
  }

  async getBudgetSummary(projectId: string, phaseId?: string, taskId?: string): Promise<BudgetSummary | null> {
    try {
      const summaryId = taskId || phaseId || projectId;
      const summaryRef = doc(db, 'budgetSummaries', summaryId);
      const summaryDoc = await getDoc(summaryRef);
      
      if (summaryDoc.exists()) {
        return summaryDoc.data() as BudgetSummary;
      }
      
      // Si pas de résumé existant, le calculer
      return await this.calculateBudgetSummary(projectId, phaseId, taskId);
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé budgétaire:', error);
      throw error;
    }
  }

  /**
   * Calcule le budget moyen des projets pour estimation
   */
  private async calculateAverageProjectBudget(): Promise<number> {
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      if (snapshot.empty) return 10000; // Fallback par défaut
      
      let totalBudget = 0;
      let projectCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const budget = data.budget || data.totalBudget || 0;
        if (budget > 0) {
          totalBudget += budget;
          projectCount++;
        }
      });
      
      return projectCount > 0 ? totalBudget / projectCount : 10000;
    } catch (error) {
      console.error('Erreur lors du calcul du budget moyen:', error);
      return 10000; // Fallback sécurisé
    }
  }

  private async updatePurchaseOrderStatus(purchaseOrderId: string, delivery: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      // Logique pour déterminer si la commande est complètement livrée
      // et mettre à jour son statut en conséquence
      const orderRef = doc(db, 'purchaseOrders', purchaseOrderId);
      
      if (delivery.status === 'complete') {
        await updateDoc(orderRef, {
          status: 'received',
          actualDeliveryDate: delivery.deliveryDate,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de commande:', error);
      throw error;
    }
  }
}

export const financialService = new FinancialService();
export default financialService;

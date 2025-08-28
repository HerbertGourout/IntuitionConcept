import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Transaction } from '../types/finance';

class TransactionService {
  private collectionName = 'transactions';

  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...transactionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Transaction créée avec succès:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la transaction:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une transaction existante
   */
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactionRef = doc(db, this.collectionName, transactionId);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Transaction mise à jour avec succès:', transactionId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la transaction:', error);
      throw error;
    }
  }

  /**
   * Supprimer une transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactionRef = doc(db, this.collectionName, transactionId);
      await deleteDoc(transactionRef);
      
      console.log('✅ Transaction supprimée avec succès:', transactionId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la transaction:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les transactions d'un projet
   */
  async getTransactionsByProject(projectId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('projectId', '==', projectId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      console.log(`✅ ${transactions.length} transactions récupérées pour le projet ${projectId}`);
      return transactions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  /**
   * Récupérer les transactions d'une phase spécifique
   */
  async getTransactionsByPhase(projectId: string, phaseId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('projectId', '==', projectId),
        where('phaseId', '==', phaseId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      console.log(`✅ ${transactions.length} transactions récupérées pour la phase ${phaseId}`);
      return transactions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des transactions de la phase:', error);
      throw error;
    }
  }

  /**
   * Récupérer les transactions d'une tâche spécifique
   */
  async getTransactionsByTask(projectId: string, taskId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('projectId', '==', projectId),
        where('taskId', '==', taskId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      console.log(`✅ ${transactions.length} transactions récupérées pour la tâche ${taskId}`);
      return transactions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des transactions de la tâche:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements de transactions en temps réel
   */
  subscribeToTransactions(
    projectId: string, 
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('projectId', '==', projectId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      callback(transactions);
    }, (error) => {
      console.error('❌ Erreur lors de l\'écoute des transactions:', error);
    });

    return unsubscribe;
  }

  /**
   * Calculer les dépenses réelles d'une tâche depuis les transactions
   */
  async calculateTaskExpenses(projectId: string, taskId: string): Promise<{
    totalSpent: number;
    transactionCount: number;
    lastExpenseDate?: string;
  }> {
    try {
      const transactions = await this.getTransactionsByTask(projectId, taskId);
      
      // Filtrer seulement les dépenses (montants négatifs ou catégories de dépenses)
      const expenses = transactions.filter(t => 
        t.amount < 0 || 
        ['materials', 'labor', 'equipment', 'transport', 'permits', 'utilities', 'insurance', 'maintenance', 'other'].includes(t.category)
      );
      
      const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const lastExpenseDate = expenses.length > 0 ? expenses[0].date : undefined;
      
      return {
        totalSpent,
        transactionCount: expenses.length,
        lastExpenseDate
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des dépenses de la tâche:', error);
      return { totalSpent: 0, transactionCount: 0 };
    }
  }

  /**
   * Calculer les dépenses réelles d'une phase depuis les transactions
   */
  async calculatePhaseExpenses(projectId: string, phaseId: string): Promise<{
    totalSpent: number;
    transactionCount: number;
    lastExpenseDate?: string;
  }> {
    try {
      const transactions = await this.getTransactionsByPhase(projectId, phaseId);
      
      // Filtrer seulement les dépenses
      const expenses = transactions.filter(t => 
        t.amount < 0 || 
        ['materials', 'labor', 'equipment', 'transport', 'permits', 'utilities', 'insurance', 'maintenance', 'other'].includes(t.category)
      );
      
      const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const lastExpenseDate = expenses.length > 0 ? expenses[0].date : undefined;
      
      return {
        totalSpent,
        transactionCount: expenses.length,
        lastExpenseDate
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des dépenses de la phase:', error);
      return { totalSpent: 0, transactionCount: 0 };
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;

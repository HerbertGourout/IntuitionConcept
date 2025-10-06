/**
 * Service pour gérer l'isolation des données par projet
 * Toutes les données (équipements, documents, transactions, etc.) sont liées à un projet spécifique
 */

import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Equipment, Document as ServiceDocument } from '../types';
import type { FinancialRecord } from '../types';

export class ProjectDataService {
  /**
    * ÉQUIPEMENTS
   */
  static async getEquipmentByProject(projectId: string): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, 'equipment'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
    } catch (error) {
      console.error('Erreur lors du chargement des équipements du projet:', error);
      return [];
    }
  }

  static async addEquipmentToProject(projectId: string, equipment: Omit<Equipment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'equipment'), {
        ...equipment,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement:', error);
      throw error;
    }
  }

  static subscribeToProjectEquipment(projectId: string, callback: (equipment: Equipment[]) => void): () => void {
    const q = query(
      collection(db, 'equipment'),
      where('projectId', '==', projectId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const equipment = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
      callback(equipment);
    });
  }

  /**
   * DOCUMENTS
   */
  static async getDocumentsByProject(projectId: string): Promise<ServiceDocument[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
    } catch (error) {
      console.error('Erreur lors du chargement des documents du projet:', error);
      return [];
    }
  }

  static async addDocumentToProject(projectId: string, document: Omit<ServiceDocument, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        ...document,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  }

  static subscribeToProjectDocuments(projectId: string, callback: (documents: ServiceDocument[]) => void): () => void {
    const q = query(
      collection(db, 'documents'),
      where('projectId', '==', projectId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
      callback(documents);
    });
  }

  /**
   * TRANSACTIONS FINANCIÈRES
   */
  static async getTransactionsByProject(projectId: string): Promise<FinancialRecord[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialRecord));
    } catch (error) {
      console.error('Erreur lors du chargement des transactions du projet:', error);
      return [];
    }
  }

  static async addTransactionToProject(projectId: string, transaction: Omit<FinancialRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      throw error;
    }
  }

  static subscribeToProjectTransactions(projectId: string, callback: (transactions: FinancialRecord[]) => void): () => void {
    const q = query(
      collection(db, 'transactions'),
      where('projectId', '==', projectId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialRecord));
      callback(transactions);
    });
  }

  /**
   * DEVIS
   */
  static async getQuotesByProject(projectId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur lors du chargement des devis du projet:', error);
      return [];
    }
  }

  static async addQuoteToProject(projectId: string, quote: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'quotes'), {
        ...quote,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du devis:', error);
      throw error;
    }
  }

  /**
   * BONS D'ACHAT
   */
  static async getPurchaseOrdersByProject(projectId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur lors du chargement des bons d\'achat du projet:', error);
      return [];
    }
  }

  static async addPurchaseOrderToProject(projectId: string, purchaseOrder: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'purchaseOrders'), {
        ...purchaseOrder,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon d\'achat:', error);
      throw error;
    }
  }

  static subscribeToProjectPurchaseOrders(projectId: string, callback: (purchaseOrders: any[]) => void): () => void {
    const q = query(
      collection(db, 'purchaseOrders'),
      where('projectId', '==', projectId)
    );
    return onSnapshot(q, (snapshot) => {
      const purchaseOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(purchaseOrders);
    });
  }

  /**
   * LOCALISATIONS
   */
  static async getLocationsByProject(projectId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'locations'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur lors du chargement des localisations du projet:', error);
      return [];
    }
  }

  static async addLocationToProject(projectId: string, location: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'locations'), {
        ...location,
        projectId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la localisation:', error);
      throw error;
    }
  }

  static subscribeToProjectLocations(projectId: string, callback: (locations: any[]) => void): () => void {
    const q = query(
      collection(db, 'locations'),
      where('projectId', '==', projectId)
    );
    return onSnapshot(q, (snapshot) => {
      const locations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(locations);
    });
  }

  /**
   * NETTOYAGE - Supprimer toutes les données d'un projet
   */
  static async deleteAllProjectData(projectId: string): Promise<void> {
    try {
      console.log('🗑️ Suppression de toutes les données du projet:', projectId);

      // Supprimer les équipements
      const equipmentQuery = query(collection(db, 'equipment'), where('projectId', '==', projectId));
      const equipmentSnapshot = await getDocs(equipmentQuery);
      await Promise.all(equipmentSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Supprimer les documents
      const documentsQuery = query(collection(db, 'documents'), where('projectId', '==', projectId));
      const documentsSnapshot = await getDocs(documentsQuery);
      await Promise.all(documentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Supprimer les transactions
      const transactionsQuery = query(collection(db, 'transactions'), where('projectId', '==', projectId));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      await Promise.all(transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Supprimer les devis
      const quotesQuery = query(collection(db, 'quotes'), where('projectId', '==', projectId));
      const quotesSnapshot = await getDocs(quotesQuery);
      await Promise.all(quotesSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Supprimer les bons d'achat
      const purchaseOrdersQuery = query(collection(db, 'purchaseOrders'), where('projectId', '==', projectId));
      const purchaseOrdersSnapshot = await getDocs(purchaseOrdersQuery);
      await Promise.all(purchaseOrdersSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Supprimer les localisations
      const locationsQuery = query(collection(db, 'locations'), where('projectId', '==', projectId));
      const locationsSnapshot = await getDocs(locationsQuery);
      await Promise.all(locationsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      console.log('✅ Toutes les données du projet supprimées');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des données du projet:', error);
      throw error;
    }
  }

  /**
   * STATISTIQUES DU PROJET
   */
  static async getProjectStats(projectId: string): Promise<{
    equipmentCount: number;
    documentCount: number;
    transactionCount: number;
    quoteCount: number;
    purchaseOrderCount: number;
    locationCount: number;
  }> {
    try {
      const [equipment, documents, transactions, quotes, purchaseOrders, locations] = await Promise.all([
        this.getEquipmentByProject(projectId),
        this.getDocumentsByProject(projectId),
        this.getTransactionsByProject(projectId),
        this.getQuotesByProject(projectId),
        this.getPurchaseOrdersByProject(projectId),
        this.getLocationsByProject(projectId)
      ]);

      return {
        equipmentCount: equipment.length,
        documentCount: documents.length,
        transactionCount: transactions.length,
        quoteCount: quotes.length,
        purchaseOrderCount: purchaseOrders.length,
        locationCount: locations.length
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques du projet:', error);
      return {
        equipmentCount: 0,
        documentCount: 0,
        transactionCount: 0,
        quoteCount: 0,
        purchaseOrderCount: 0,
        locationCount: 0
      };
    }
  }
}

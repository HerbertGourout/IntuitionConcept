import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  PurchaseOrder, 
  DeliveryNote, 
  Supplier, 
  PurchaseOrderStats, 
  DeliveryStats 
} from '../types/purchaseOrder';

const PURCHASE_ORDERS_COLLECTION = 'purchaseOrders';
const DELIVERY_NOTES_COLLECTION = 'deliveryNotes';
const SUPPLIERS_COLLECTION = 'suppliers';

export class PurchaseOrderService {
  /**
   * GESTION DES BONS D'ACHAT
   */
  
  // Récupérer tous les bons d'achat
  static async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const q = query(collection(db, PURCHASE_ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as PurchaseOrder[];
    } catch (error) {
      console.error('Erreur lors de la récupération des bons d\'achat:', error);
      throw error;
    }
  }

  // Récupérer les bons d'achat par projet
  static async getPurchaseOrdersByProject(projectId: string): Promise<PurchaseOrder[]> {
    try {
      const q = query(
        collection(db, PURCHASE_ORDERS_COLLECTION), 
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as PurchaseOrder[];
    } catch (error) {
      console.error('Erreur lors de la récupération des bons d\'achat par projet:', error);
      throw error;
    }
  }

  // Ajouter un bon d'achat
  static async addPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, PURCHASE_ORDERS_COLLECTION), {
        ...orderData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon d\'achat:', error);
      throw error;
    }
  }

  // Mettre à jour un bon d'achat
  static async updatePurchaseOrder(id: string, updates: Partial<Omit<PurchaseOrder, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, PURCHASE_ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon d\'achat:', error);
      throw error;
    }
  }

  // Approuver un bon d'achat
  static async approvePurchaseOrder(id: string, approvedBy: string, notes?: string): Promise<void> {
    try {
      const docRef = doc(db, PURCHASE_ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        status: 'approved',
        approvedBy,
        approvalNotes: notes || '',
        approvedDate: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation du bon d\'achat:', error);
      throw error;
    }
  }

  // Supprimer un bon d'achat
  static async deletePurchaseOrder(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PURCHASE_ORDERS_COLLECTION, id));
    } catch (error) {
      console.error('Erreur lors de la suppression du bon d\'achat:', error);
      throw error;
    }
  }

  // Générer un numéro de bon d'achat unique
  static generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `BA-${year}${month}${day}-${time}`;
  }

  /**
   * GESTION DES BONS DE LIVRAISON
   */

  // Récupérer tous les bons de livraison
  static async getAllDeliveryNotes(): Promise<DeliveryNote[]> {
    try {
      const q = query(collection(db, DELIVERY_NOTES_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as DeliveryNote[];
    } catch (error) {
      console.error('Erreur lors de la récupération des bons de livraison:', error);
      throw error;
    }
  }

  // Récupérer les bons de livraison par bon d'achat
  static async getDeliveryNotesByPurchaseOrder(purchaseOrderId: string): Promise<DeliveryNote[]> {
    try {
      const q = query(
        collection(db, DELIVERY_NOTES_COLLECTION), 
        where('purchaseOrderId', '==', purchaseOrderId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as DeliveryNote[];
    } catch (error) {
      console.error('Erreur lors de la récupération des bons de livraison:', error);
      throw error;
    }
  }

  // Ajouter un bon de livraison
  static async addDeliveryNote(noteData: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, DELIVERY_NOTES_COLLECTION), {
        ...noteData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon de livraison:', error);
      throw error;
    }
  }

  // Mettre à jour un bon de livraison
  static async updateDeliveryNote(id: string, updates: Partial<Omit<DeliveryNote, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, DELIVERY_NOTES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon de livraison:', error);
      throw error;
    }
  }

  // Réceptionner une livraison
  static async receiveDelivery(id: string, receivedBy: string, qualityCheck: boolean, notes?: string): Promise<void> {
    try {
      const docRef = doc(db, DELIVERY_NOTES_COLLECTION, id);
      await updateDoc(docRef, {
        status: 'received',
        receivedBy,
        qualityCheck,
        qualityNotes: notes || '',
        actualDeliveryDate: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la réception de la livraison:', error);
      throw error;
    }
  }

  // Supprimer un bon de livraison
  static async deleteDeliveryNote(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, DELIVERY_NOTES_COLLECTION, id));
    } catch (error) {
      console.error('Erreur lors de la suppression du bon de livraison:', error);
      throw error;
    }
  }

  // Générer un numéro de bon de livraison unique
  static generateDeliveryNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `BL-${year}${month}${day}-${time}`;
  }

  /**
   * GESTION DES FOURNISSEURS
   */

  // Récupérer tous les fournisseurs
  static async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const q = query(collection(db, SUPPLIERS_COLLECTION), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as Supplier[];
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      throw error;
    }
  }

  // Ajouter un fournisseur
  static async addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
        ...supplierData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
      throw error;
    }
  }

  // Mettre à jour un fournisseur
  static async updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, SUPPLIERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      throw error;
    }
  }

  /**
   * STATISTIQUES ET RAPPORTS
   */

  // Calculer les statistiques des bons d'achat
  static async getPurchaseOrderStats(): Promise<PurchaseOrderStats> {
    try {
      const orders = await this.getAllPurchaseOrders();
      
      const stats: PurchaseOrderStats = {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingApproval: orders.filter(o => o.status === 'pending_approval').length,
        approved: orders.filter(o => o.status === 'approved').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
        topSuppliers: []
      };

      // Calculer les top fournisseurs
      const supplierStats = new Map<string, { name: string; count: number; amount: number }>();
      orders.forEach(order => {
        const existing = supplierStats.get(order.supplierId) || { name: order.supplier.name, count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += order.totalAmount;
        supplierStats.set(order.supplierId, existing);
      });

      stats.topSuppliers = Array.from(supplierStats.entries())
        .map(([id, data]) => ({
          supplierId: id,
          supplierName: data.name,
          orderCount: data.count,
          totalAmount: data.amount
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des bons d\'achat:', error);
      throw error;
    }
  }

  // Calculer les statistiques des livraisons
  static async getDeliveryStats(): Promise<DeliveryStats> {
    try {
      const deliveries = await this.getAllDeliveryNotes();
      
      const onTime = deliveries.filter(d => {
        if (!d.actualDeliveryDate || !d.deliveryDate) return false;
        return new Date(d.actualDeliveryDate) <= new Date(d.deliveryDate);
      }).length;

      const late = deliveries.filter(d => {
        if (!d.actualDeliveryDate || !d.deliveryDate) return false;
        return new Date(d.actualDeliveryDate) > new Date(d.deliveryDate);
      }).length;

      const rejected = deliveries.filter(d => d.status === 'rejected').length;
      
      const goodCondition = deliveries.filter(d => 
        d.overallCondition === 'excellent' || d.overallCondition === 'good'
      ).length;

      return {
        totalDeliveries: deliveries.length,
        onTimeDeliveries: onTime,
        lateDeliveries: late,
        rejectedDeliveries: rejected,
        averageDeliveryTime: 0, // À calculer selon les besoins
        qualityScore: deliveries.length > 0 ? (goodCondition / deliveries.length) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des livraisons:', error);
      throw error;
    }
  }

  /**
   * ÉCOUTE EN TEMPS RÉEL
   */

  // Écouter les changements des bons d'achat
  static subscribeToPurchaseOrders(callback: (orders: PurchaseOrder[]) => void): () => void {
    const q = query(collection(db, PURCHASE_ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as PurchaseOrder[];
      
      callback(orders);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des bons d\'achat:', error);
    });
  }

  // Écouter les changements des bons de livraison
  static subscribeToDeliveryNotes(callback: (notes: DeliveryNote[]) => void): () => void {
    const q = query(collection(db, DELIVERY_NOTES_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt || new Date().toISOString()
        };
      }) as DeliveryNote[];
      
      callback(notes);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des bons de livraison:', error);
    });
  }
}

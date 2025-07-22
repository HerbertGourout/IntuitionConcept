import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import type { 
  PurchaseOrder, 
  DeliveryNote, 
  Supplier, 
  PurchaseOrderStats, 
  DeliveryStats,
  PurchaseOrderContextType 
} from '../types/purchaseOrder';

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export const PurchaseOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // États pour les bons d'achat
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState<boolean>(true);

  // États pour les bons de livraison
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [currentDeliveryNote, setCurrentDeliveryNote] = useState<DeliveryNote | null>(null);
  const [loadingDeliveryNotes, setLoadingDeliveryNotes] = useState<boolean>(true);

  // États pour les fournisseurs
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // États pour les statistiques
  const [purchaseOrderStats, setPurchaseOrderStats] = useState<PurchaseOrderStats | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingPurchaseOrders(true);
        setLoadingDeliveryNotes(true);

        // Charger les données en parallèle
        const [ordersData, notesData, suppliersData] = await Promise.all([
          PurchaseOrderService.getAllPurchaseOrders(),
          PurchaseOrderService.getAllDeliveryNotes(),
          PurchaseOrderService.getAllSuppliers()
        ]);

        setPurchaseOrders(ordersData);
        setDeliveryNotes(notesData);
        setSuppliers(suppliersData);

        // Charger les statistiques
        const [orderStats, deliveryStatsData] = await Promise.all([
          PurchaseOrderService.getPurchaseOrderStats(),
          PurchaseOrderService.getDeliveryStats()
        ]);

        setPurchaseOrderStats(orderStats);
        setDeliveryStats(deliveryStatsData);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoadingPurchaseOrders(false);
        setLoadingDeliveryNotes(false);
      }
    };

    loadInitialData();

    // Écouter les changements en temps réel
    const unsubscribeOrders = PurchaseOrderService.subscribeToPurchaseOrders((orders) => {
      setPurchaseOrders(orders);
    });

    const unsubscribeNotes = PurchaseOrderService.subscribeToDeliveryNotes((notes) => {
      setDeliveryNotes(notes);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotes();
    };
  }, []);

  // Actions pour les bons d'achat
  const addPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await PurchaseOrderService.addPurchaseOrder(orderData);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon d\'achat:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      await PurchaseOrderService.updatePurchaseOrder(id, updates);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon d\'achat:', error);
      throw error;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await PurchaseOrderService.deletePurchaseOrder(id);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de la suppression du bon d\'achat:', error);
      throw error;
    }
  };

  const approvePurchaseOrder = async (id: string, approvedBy: string, notes?: string) => {
    try {
      await PurchaseOrderService.approvePurchaseOrder(id, approvedBy, notes);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de l\'approbation du bon d\'achat:', error);
      throw error;
    }
  };

  // Actions pour les bons de livraison
  const addDeliveryNote = async (noteData: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await PurchaseOrderService.addDeliveryNote(noteData);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon de livraison:', error);
      throw error;
    }
  };

  const updateDeliveryNote = async (id: string, updates: Partial<DeliveryNote>) => {
    try {
      await PurchaseOrderService.updateDeliveryNote(id, updates);
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon de livraison:', error);
      throw error;
    }
  };

  const receiveDelivery = async (id: string, receivedBy: string, items: any[]) => {
    try {
      await PurchaseOrderService.receiveDelivery(id, receivedBy, true, 'Livraison réceptionnée');
      // Les données seront mises à jour via l'écoute en temps réel
    } catch (error) {
      console.error('Erreur lors de la réception de la livraison:', error);
      throw error;
    }
  };

  // Actions pour les fournisseurs
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await PurchaseOrderService.addSupplier(supplierData);
      // Recharger la liste des fournisseurs
      const updatedSuppliers = await PurchaseOrderService.getAllSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await PurchaseOrderService.updateSupplier(id, updates);
      // Recharger la liste des fournisseurs
      const updatedSuppliers = await PurchaseOrderService.getAllSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      throw error;
    }
  };

  const contextValue: PurchaseOrderContextType = {
    // Bons d'achat
    purchaseOrders,
    currentPurchaseOrder,
    loadingPurchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,

    // Bons de livraison
    deliveryNotes,
    currentDeliveryNote,
    loadingDeliveryNotes,
    addDeliveryNote,
    updateDeliveryNote,
    receiveDelivery,

    // Fournisseurs
    suppliers,
    addSupplier,
    updateSupplier,

    // Statistiques
    purchaseOrderStats,
    deliveryStats
  };

  return (
    <PurchaseOrderContext.Provider value={contextValue}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const usePurchaseOrderContext = () => {
  const context = React.useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrderContext must be used within a PurchaseOrderProvider');
  }
  return context;
};

export default PurchaseOrderContext;

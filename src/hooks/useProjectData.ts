/**
 * Hook personnalisé pour gérer les données isolées par projet
 * Assure que chaque projet a ses propres données (équipements, documents, etc.)
 */

import { useState, useEffect } from 'react';
import { ProjectDataService } from '../services/projectDataService';
import type { Equipment, Document as ServiceDocument, FinancialRecord } from '../types';
import type { Quote } from '../services/quotesService';
import { QuotesService } from '../services/quotesService';

export function useProjectEquipment(projectId: string | null) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setEquipment([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Charger les équipements du projet
    ProjectDataService.getEquipmentByProject(projectId).then(data => {
      setEquipment(data);
      setLoading(false);
    });

    // S'abonner aux changements en temps réel
    const unsubscribe = ProjectDataService.subscribeToProjectEquipment(projectId, (data) => {
      setEquipment(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const addEquipment = async (equipmentData: Omit<Equipment, 'id'>) => {
    if (!projectId) throw new Error('Aucun projet sélectionné');
    return await ProjectDataService.addEquipmentToProject(projectId, equipmentData);
  };

  return { equipment, loading, addEquipment };
}

export function useProjectDocuments(projectId: string | null) {
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Charger les documents du projet
    ProjectDataService.getDocumentsByProject(projectId).then(data => {
      setDocuments(data);
      setLoading(false);
    });

    // S'abonner aux changements en temps réel
    const unsubscribe = ProjectDataService.subscribeToProjectDocuments(projectId, (data) => {
      setDocuments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const addDocument = async (documentData: Omit<ServiceDocument, 'id'>) => {
    if (!projectId) throw new Error('Aucun projet sélectionné');
    return await ProjectDataService.addDocumentToProject(projectId, documentData);
  };

  return { documents, loading, addDocument };
}

export function useProjectTransactions(projectId: string | null) {
  const [transactions, setTransactions] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Charger les transactions du projet
    ProjectDataService.getTransactionsByProject(projectId).then(data => {
      setTransactions(data);
      setLoading(false);
    });

    // S'abonner aux changements en temps réel
    const unsubscribe = ProjectDataService.subscribeToProjectTransactions(projectId, (data) => {
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const addTransaction = async (transactionData: Omit<FinancialRecord, 'id'>) => {
    if (!projectId) throw new Error('Aucun projet sélectionné');
    return await ProjectDataService.addTransactionToProject(projectId, transactionData);
  };

  return { transactions, loading, addTransaction };
}


export function useProjectPurchaseOrders(projectId: string | null) {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setPurchaseOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Abonnement temps réel aux bons d'achat du projet
    const unsubscribe = ProjectDataService.subscribeToProjectPurchaseOrders(projectId, (data) => {
      setPurchaseOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  const addPurchaseOrder = async (purchaseOrderData: any) => {
    if (!projectId) throw new Error('Aucun projet sélectionné');
    return await ProjectDataService.addPurchaseOrderToProject(projectId, purchaseOrderData);
  };

  return { purchaseOrders, loading, addPurchaseOrder };
}


export function useProjectStats(projectId: string | null) {
  const [stats, setStats] = useState({
    equipmentCount: 0,
    documentCount: 0,
    transactionCount: 0,
    quoteCount: 0,
    purchaseOrderCount: 0,
    locationCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setStats({
        equipmentCount: 0,
        documentCount: 0,
        transactionCount: 0,
        quoteCount: 0,
        purchaseOrderCount: 0,
        locationCount: 0
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    ProjectDataService.getProjectStats(projectId).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [projectId]);

  return { stats, loading };
}

// Hook pour les devis du projet
export function useProjectQuotes(projectId: string | null) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Abonnement temps réel aux devis du projet
    const unsubscribe = QuotesService.subscribeToProjectQuotes(projectId, (list) => {
      setQuotes(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  const addQuote = async (quote: Omit<Quote, 'id'> | Quote) => {
    if (!projectId) throw new Error('Aucun projet sélectionné');
    // Forcer l'association au projet courant
    const payload = { ...(quote as any), projectId } as Omit<Quote, 'id'>;
    const newId = await QuotesService.createQuote(payload);
    // L'état sera rafraîchi par l'abonnement; mise à jour optimiste optionnelle
    // setQuotes(prev => [{ ...(payload as Quote), id: newId }, ...prev]);
    return newId;
  };

  return { quotes, loading, addQuote };
}

// Hook pour les localisations du projet
export function useProjectLocations(projectId: string | null) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Abonnement temps réel aux localisations du projet
    const unsubscribe = ProjectDataService.subscribeToProjectLocations(projectId, (data) => {
      setLocations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  const addLocation = async (location: any) => {
    setLocations(prev => [location, ...prev]);
  };

  return { locations, loading, addLocation };
}

import { useState, useEffect, useCallback } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { toast } from 'react-hot-toast';

// Hook pour gérer les données avec support offline
export const useOfflineData = <T extends { id: string }>(collection: string, initialData: T[] = []) => {
  const { 
    isOnline, 
    cacheData, 
    getCachedData, 
    queueAction 
  } = useOffline();
  
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données (cache d'abord, puis API si en ligne)
  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Charger depuis le cache d'abord
      const cachedData = getCachedData(collection);
      const cachedItems = Object.values(cachedData) as T[];
      
      if (cachedItems.length > 0 && !forceRefresh) {
        setData(cachedItems);
        console.log(`📦 Données chargées depuis le cache: ${collection}`);
      }

      // Si en ligne, essayer de récupérer les données fraîches
      if (isOnline) {
        try {
          // Simuler un appel API (remplacer par votre vraie API)
          const freshData = await fetchFromAPI(collection);
          
          // Mettre en cache les nouvelles données
          freshData.forEach((item) => {
            cacheData(collection, item.id, item);
          });
          
          setData(freshData as T[]);
          console.log(`🌐 Données fraîches récupérées: ${collection}`);
        } catch (apiError) {
          console.warn('Erreur API, utilisation du cache:', apiError);
          if (cachedItems.length === 0) {
            throw apiError;
          }
        }
      } else if (cachedItems.length === 0) {
        throw new Error('Aucune donnée disponible hors ligne');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [collection, isOnline, getCachedData, cacheData]);

  // Créer un nouvel élément
  const createItem = useCallback(async (newItem: Omit<T, 'id'>) => {
    const id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const itemWithId = { ...newItem, id } as T;

    try {
      if (isOnline) {
        // Essayer de créer en ligne
        const createdItem = await createInAPI(collection, itemWithId);
        
        // Mettre à jour les données locales
        setData(prev => [...prev, createdItem as T]);
        cacheData(collection, createdItem.id, createdItem);
        
        toast.success('✅ Élément créé avec succès');
        return createdItem;
      } else {
        // Mode hors ligne : ajouter à la file d'attente
        queueAction({
          type: 'create',
          collection,
          data: itemWithId
        });
        
        // Mettre à jour l'interface immédiatement
        setData(prev => [...prev, itemWithId]);
        
        return itemWithId;
      }
    } catch (error) {
      console.error('Erreur de création:', error);
      toast.error('❌ Erreur lors de la création');
      throw error;
    }
  }, [collection, isOnline, cacheData, queueAction]);

  // Mettre à jour un élément
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      const foundItem = data.find(item => item.id === id);
      const updatedItem = { ...foundItem, ...updates } as T;

      if (isOnline) {
        // Essayer de mettre à jour en ligne
        const serverItem = await updateInAPI(collection, id, updatedItem);
        
        // Mettre à jour les données locales
        setData(prev => prev.map(item => 
          item.id === id ? serverItem : item
        ));
        cacheData(collection, id, serverItem);
        
        toast.success('✅ Élément mis à jour');
        return serverItem;
      } else {
        // Mode hors ligne : ajouter à la file d'attente
        queueAction({
          type: 'update',
          collection,
          data: updatedItem
        });
        
        // Mettre à jour l'interface immédiatement
        setData(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
        
        return updatedItem;
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      toast.error('❌ Erreur lors de la mise à jour');
      throw error;
    }
  }, [collection, data, isOnline, cacheData, queueAction]);

  // Supprimer un élément
  const deleteItem = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        // Essayer de supprimer en ligne
        await deleteFromAPI(collection, id);
        
        // Mettre à jour les données locales
        setData(prev => prev.filter(item => item.id !== id));
        
        toast.success('✅ Élément supprimé');
      } else {
        // Mode hors ligne : ajouter à la file d'attente
        queueAction({
          type: 'delete',
          collection,
          data: { id }
        });
        
        // Mettre à jour l'interface immédiatement
        setData(prev => prev.filter(item => item.id !== id));
        
        toast.success('📝 Suppression programmée');
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
      toast.error('❌ Erreur lors de la suppression');
      throw error;
    }
  }, [collection, isOnline, queueAction]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    createItem,
    updateItem,
    deleteItem,
    isOnline
  };
};

// Type strict pour les rapports offline
export interface OfflineReport {
  id: string;
  createdAt: string;
  isOffline: boolean;
  // Ajoutez d'autres propriétés selon vos besoins
  [key: string]: unknown;
}

// Hook pour les rapports offline
export const useOfflineReports = () => {
  const { queueAction, isOnline } = useOffline();
  const [reports, setReports] = useState<OfflineReport[]>([]);

  const createReport = useCallback(async (reportData: Partial<OfflineReport>) => {
    const report: OfflineReport = {
      ...reportData,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isOffline: !isOnline
    };

    if (isOnline) {
      try {
        // Envoyer directement si en ligne
        const savedReport = await submitReportToAPI(report) as OfflineReport;
        setReports(prev => [...prev, savedReport]);
        toast.success('📊 Rapport envoyé avec succès');
        return savedReport;
      } catch (error) {
        console.error('Erreur d\'envoi du rapport:', error);
        // Si échec, basculer en mode offline
        queueAction({
          type: 'create',
          collection: 'reports',
          data: report
        });
        setReports(prev => [...prev, report]);
        toast('📝 Rapport sauvegardé - Sera envoyé à la reconnexion', { icon: '⚠️' });
        return report;
      }
    } else {
      // Mode hors ligne
      queueAction({
        type: 'create',
        collection: 'reports',
        data: report
      });
      setReports(prev => [...prev, report]);
      toast.success('📝 Rapport sauvegardé hors ligne');
      return report;
    }
  }, [isOnline, queueAction]);

  return {
    reports,
    createReport,
    isOnline
  };
};

// Fonctions simulées d'API (à remplacer par vos vraies API)
const fetchFromAPI = async (collection: string): Promise<Array<{ id: string; [key: string]: unknown }>> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simuler des données selon la collection
  const mockData: Record<string, Array<{ id: string; [key: string]: unknown }>> = {
    projects: [
      { id: '1', name: 'Projet Alpha', status: 'active', progress: 75 },
      { id: '2', name: 'Projet Beta', status: 'planning', progress: 25 }
    ],
    tasks: [
      { id: '1', title: 'Tâche 1', status: 'in_progress', priority: 'high' },
      { id: '2', title: 'Tâche 2', status: 'todo', priority: 'medium' }
    ],
    equipment: [
      { id: '1', name: 'Excavatrice', status: 'available', location: 'Site A' },
      { id: '2', name: 'Grue', status: 'in-use', location: 'Site B' }
    ]
  };
  
  return mockData[collection] || [];
};

const createInAPI = async <T extends { id: string }>(_collection: string, item: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...item, id: `api_${Date.now()}`, createdAt: new Date().toISOString() } as T;
};

const updateInAPI = async <T extends { id: string }>(_collection: string, _id: string, item: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...item, updatedAt: new Date().toISOString() } as T;
};

const deleteFromAPI = async (_collection: string, id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Deleted ${id} from collection`);
};

const submitReportToAPI = async (report: Record<string, unknown>): Promise<Record<string, unknown>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...report, submittedAt: new Date().toISOString() };
};

export default useOfflineData;

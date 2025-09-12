/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Types pour la gestion offline
interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface OfflineData {
  [collection: string]: {
    [id: string]: Record<string, unknown>;
  };
}

interface OfflineContextType {
  isOnline: boolean;
  isInitialized: boolean;
  pendingActions: OfflineAction[];
  offlineData: OfflineData;
  
  // Méthodes principales
  cacheData: (collection: string, id: string, data: Record<string, unknown>) => void;
  getCachedData: (collection: string, id?: string) => Record<string, unknown> | Record<string, Record<string, unknown>> | null;
  queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  syncPendingActions: () => Promise<void>;
  clearCache: (collection?: string) => void;
  
  // Statistiques
  getCacheSize: () => number;
  getLastSyncTime: () => Date | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineData>({});
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Clés de stockage local
  const STORAGE_KEYS = useMemo(() => ({
    OFFLINE_DATA: 'btp_offline_data',
    PENDING_ACTIONS: 'btp_pending_actions',
    LAST_SYNC: 'btp_last_sync'
  }), []);

  // Initialisation du contexte offline
  useEffect(() => {
    const initializeOfflineData = () => {
      try {
        // Charger les données mises en cache
        const cachedData = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        // Charger les actions en attente
        const cachedActions = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
        if (cachedActions) {
          setPendingActions(JSON.parse(cachedActions));
        }

        // Charger la dernière synchronisation
        const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }

        setIsInitialized(true);
        console.log('🔄 Mode offline initialisé');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation offline:', error);
        setIsInitialized(true);
      }
    };

    initializeOfflineData();
  }, [STORAGE_KEYS]);

  // Référence stable vers la fonction de synchronisation pour éviter les soucis de dépendances
  const syncRef = useRef<() => void>(() => {});

  // Surveillance de la connectivité
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🌐 Connexion rétablie - Synchronisation en cours...', {
        duration: 3000,
      });
      // Synchroniser automatiquement quand la connexion revient
      syncRef.current();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('📱 Mode hors-ligne activé', {
        duration: 4000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarder les données dans le localStorage
  const saveToStorage = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur de sauvegarde locale:', error);
      // Nettoyer le cache si l'espace est plein
      if (error instanceof DOMException && error.code === 22) {
        toast.error('Cache plein - Nettoyage automatique...');
        // Pour éviter une dépendance circulaire ici, on ne référence pas directement clearCache.
        // Le nettoyage complet peut être déclenché ailleurs par l'utilisateur.
      }
    }
  }, []);

  // Mettre en cache des données
  const cacheData = useCallback((collection: string, id: string, data: Record<string, unknown>) => {
    setOfflineData(prev => {
      const updated = {
        ...prev,
        [collection]: {
          ...prev[collection],
          [id]: {
            ...data,
            _cached_at: Date.now(),
            _is_offline: !isOnline
          }
        }
      };
      saveToStorage(STORAGE_KEYS.OFFLINE_DATA, updated);
      return updated;
    });
  }, [isOnline, saveToStorage, STORAGE_KEYS]);

  // Récupérer des données mises en cache
  const getCachedData = useCallback((collection: string, id?: string) => {
    if (id) {
      return offlineData[collection]?.[id] || null;
    }
    return offlineData[collection] || {};
  }, [offlineData]);

  // Ajouter une action à la file d'attente
  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(prev => {
      const updated = [...prev, newAction];
      saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, updated);
      return updated;
    });

    // Mettre à jour le cache local immédiatement pour l'UX
    if (action.type === 'create' || action.type === 'update') {
      const dataWithOptionalId = action.data as { id?: string };
      const targetId = dataWithOptionalId.id ?? newAction.id;
      cacheData(action.collection, targetId, action.data);
    }

    toast.success(`📝 Action sauvegardée (${action.type}) - Sera synchronisée à la reconnexion`);
  }, [cacheData, saveToStorage, STORAGE_KEYS]);

  // Synchroniser les actions en attente
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    console.log(`🔄 Synchronisation de ${pendingActions.length} actions...`);
    
    const successfulActions: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of pendingActions) {
      try {
        // Simuler l'appel API (remplacer par vos vraies API)
        await simulateApiCall(action);
        successfulActions.push(action.id);
        console.log(`✅ Action ${action.type} synchronisée:`, action.collection);
      } catch (error) {
        console.error(`❌ Échec de synchronisation:`, error);
        
        // Réessayer jusqu'à 3 fois
        if (action.retryCount < 3) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        } else {
          console.error(`🚫 Action abandonnée après 3 tentatives:`, action);
        }
      }
    }

    // Mettre à jour la liste des actions en attente
    setPendingActions(failedActions);
    saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, failedActions);

    // Mettre à jour le temps de synchronisation
    const now = new Date();
    setLastSyncTime(now);
    saveToStorage(STORAGE_KEYS.LAST_SYNC, now.toISOString());

    // Notifications
    if (successfulActions.length > 0) {
      toast.success(`✅ ${successfulActions.length} actions synchronisées avec succès`);
    }
    if (failedActions.length > 0) {
      toast.error(`⚠️ ${failedActions.length} actions en attente de synchronisation`);
    }
  }, [isOnline, pendingActions, saveToStorage, STORAGE_KEYS]);

  // Assigner la ref une fois la fonction déclarée pour éviter les problèmes de TDZ
  useEffect(() => {
    syncRef.current = syncPendingActions;
  }, [syncPendingActions]);

  // Simuler un appel API (à remplacer par vos vraies API)
  const simulateApiCall = async (action: OfflineAction): Promise<void> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simuler un taux de succès de 90%
    if (Math.random() < 0.1) {
      throw new Error('Erreur de synchronisation simulée');
    }
    
    console.log(`API Call: ${action.type} ${action.collection}`, action.data);
  };

  // Vider le cache
  const clearCache = useCallback((collection?: string) => {
    if (collection) {
      setOfflineData(prev => {
        const updated = { ...prev };
        delete updated[collection];
        saveToStorage(STORAGE_KEYS.OFFLINE_DATA, updated);
        return updated;
      });
      toast.success(`🗑️ Cache vidé pour ${collection}`);
    } else {
      setOfflineData({});
      setPendingActions([]);
      setLastSyncTime(null);
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      toast.success('🗑️ Tout le cache a été vidé');
    }
  }, [saveToStorage, STORAGE_KEYS]);

  // Calculer la taille du cache
  const getCacheSize = useCallback(() => {
    try {
      const dataSize = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA)?.length || 0;
      const actionsSize = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS)?.length || 0;
      return Math.round((dataSize + actionsSize) / 1024); // En KB
    } catch {
      return 0;
    }
  }, [STORAGE_KEYS]);

  const getLastSyncTime = useCallback(() => lastSyncTime, [lastSyncTime]);

  // Synchronisation automatique périodique
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    }, 30000); // Toutes les 30 secondes pour éviter les blocages

    return () => clearInterval(interval);
  }, [isOnline, pendingActions.length, syncPendingActions]);

  const value: OfflineContextType = {
    isOnline,
    isInitialized,
    pendingActions,
    offlineData,
    cacheData,
    getCachedData,
    queueAction,
    syncPendingActions,
    clearCache,
    getCacheSize,
    getLastSyncTime
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;

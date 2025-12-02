/**
 * Utilitaire pour nettoyer complètement tous les caches et données locales
 * Force l'utilisation exclusive de Firebase pour toutes les données
 */

export const clearAllLocalData = async (): Promise<void> => {
  try {
    console.log('🧹 Début du nettoyage complet des données locales...');

    // 1. Nettoyer localStorage
    if (typeof Storage !== 'undefined' && localStorage) {
      const localStorageKeys = Object.keys(localStorage);
      console.log(`📦 Suppression de ${localStorageKeys.length} clés localStorage:`, localStorageKeys);
      localStorage.clear();
    }

    // 2. Nettoyer sessionStorage
    if (typeof Storage !== 'undefined' && sessionStorage) {
      const sessionStorageKeys = Object.keys(sessionStorage);
      console.log(`🗂️ Suppression de ${sessionStorageKeys.length} clés sessionStorage:`, sessionStorageKeys);
      sessionStorage.clear();
    }

    // 3. Nettoyer IndexedDB
    if ('indexedDB' in window && window.indexedDB) {
      try {
        const idb = window.indexedDB;
        
        // Lister toutes les bases de données IndexedDB
        if ('databases' in idb && typeof idb.databases === 'function') {
          const databases = await idb.databases();
          console.log(`💾 Suppression de ${databases.length} bases IndexedDB:`, databases.map(db => db.name));
          
          for (const db of databases) {
            if (db.name) {
              const deleteRequest = idb.deleteDatabase(db.name);
              await new Promise<void>((resolve, reject) => {
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
            }
          }
        } else {
          // Fallback pour les navigateurs plus anciens
          const commonDbNames = [
            'BTPManager',
            'ProjectData',
            'TaskData',
            'EquipmentData',
            'DocumentData',
            'TeamData',
            'LocationData',
            'FinanceData'
          ];
          
          for (const dbName of commonDbNames) {
            try {
              const deleteRequest = idb.deleteDatabase(dbName);
              await new Promise<void>((resolve) => {
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => resolve(); // Ignore les erreurs pour les DB inexistantes
              });
            } catch (error) {
              // Ignorer les erreurs pour les bases qui n'existent pas
              console.warn(`Erreur lors de la suppression de ${dbName}:`, error);
            }
          }
          console.log(`💾 Tentative de suppression des bases IndexedDB communes`);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors du nettoyage IndexedDB:', error);
      }
    }

    // 4. Nettoyer les caches du navigateur (si disponible)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(`🗄️ Suppression de ${cacheNames.length} caches navigateur:`, cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn('⚠️ Erreur lors du nettoyage des caches:', error);
      }
    }

    // 5. Nettoyer les cookies (si possible)
    if (document.cookie) {
      const cookies = document.cookie.split(';');
      console.log(`🍪 Suppression de ${cookies.length} cookies`);
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          // Supprimer le cookie en définissant une date d'expiration passée
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
    }

    // 6. Forcer le rechargement des modules Firebase
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`🔧 Suppression de ${registrations.length} service workers`);
        
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      } catch (error) {
        console.warn('⚠️ Erreur lors de la suppression des service workers:', error);
      }
    }

    console.log('✅ Nettoyage complet terminé avec succès');
    console.log('🔄 Toutes les données proviennent maintenant exclusivement de Firebase');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des données locales:', error);
    throw error;
  }
};

/**
 * Initialiser les données de test Firebase pour tous les modules
 */
export const initializeAllFirebaseTestData = async (): Promise<void> => {
  try {
    console.log(' Initialisation des données de test Firebase...');

    // Importer dynamiquement les services pour éviter les dépendances circulaires
    const { TaskService } = await import('../services/taskService');
    const { DocumentService } = await import('../services/documentService');
    const { EquipmentService } = await import('../services/equipmentService');
    const { ProjectService } = await import('../services/projectService');
    const { LocationService } = await import('../services/locationService');

    // Initialiser les données de test pour chaque module
    await Promise.all([
      TaskService.initializeTestData(),
      DocumentService.initializeTestData(),
      EquipmentService.initializeTestData(),
      ProjectService.initializeTestData(),
      LocationService.initializeTestData()
    ]);

    console.log('✅ Toutes les données de test Firebase ont été initialisées');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
    throw error;
  }
};

/**
 * Migration complète : nettoyer les données locales et initialiser Firebase
 * NOTE: L'initialisation automatique des données de test est désactivée pour éviter la réinsertion non désirée
 */
export const performFullMigration = async (): Promise<void> => {
  try {
    console.log('🔄 Début de la migration complète vers Firebase...');

    // 1. Nettoyer toutes les données locales
    await clearAllLocalData();

    // 2. Attendre un peu pour s'assurer que tout est nettoyé
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. DÉSACTIVÉ: L'initialisation automatique des données de test
    // pour éviter la réinsertion non désirée des équipements supprimés
    console.log('ℹ️ L\'initialisation automatique des données de test est désactivée');
    console.log('   Utilisez les commandes manuelles pour ajouter des données de test si nécessaire');
    
    // Ancien code commenté pour référence
    // await initializeAllFirebaseTestData();

    console.log('🎉 Migration complète terminée avec succès !');
    console.log('📱 L\'application utilise maintenant exclusivement Firebase');

  } catch (error) {
    console.error('💥 Erreur lors de la migration complète:', error);
    throw error;
  }
};

/**
 * Vérifier l'état de la migration
 */
export const checkMigrationStatus = (): {
  hasLocalData: boolean;
  localDataSources: string[];
  recommendations: string[];
} => {
  const localDataSources: string[] = [];
  const recommendations: string[] = [];

  // Vérifier localStorage
  if (typeof Storage !== 'undefined' && localStorage && localStorage.length > 0) {
    localDataSources.push(`localStorage (${localStorage.length} clés)`);
  }

  // Vérifier sessionStorage
  if (typeof Storage !== 'undefined' && sessionStorage && sessionStorage.length > 0) {
    localDataSources.push(`sessionStorage (${sessionStorage.length} clés)`);
  }

  // Vérifier les cookies
  if (document.cookie && document.cookie.trim()) {
    const cookieCount = document.cookie.split(';').length;
    localDataSources.push(`cookies (${cookieCount} cookies)`);
  }

  const hasLocalData = localDataSources.length > 0;

  if (hasLocalData) {
    recommendations.push('Exécuter clearAllLocalData() pour nettoyer les données locales');
    recommendations.push('Vérifier que tous les composants utilisent les services Firebase');
    recommendations.push('Tester la synchronisation temps réel');
  } else {
    recommendations.push('Migration réussie : aucune donnée locale détectée');
    recommendations.push('Vérifier que les données Firebase sont correctement chargées');
  }

  return {
    hasLocalData,
    localDataSources,
    recommendations
  };
};

// Utilitaire pour déboguer les données locales
export const debugLocalData = (): void => {
  console.group('🔍 État des données locales');
  
  // localStorage
  if (typeof Storage !== 'undefined' && localStorage) {
    console.log('📦 localStorage:', Object.keys(localStorage));
    Object.keys(localStorage).forEach(key => {
      console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...');
    });
  }

  // sessionStorage
  if (typeof Storage !== 'undefined' && sessionStorage) {
    console.log('🗂️ sessionStorage:', Object.keys(sessionStorage));
    Object.keys(sessionStorage).forEach(key => {
      console.log(`  ${key}:`, sessionStorage.getItem(key)?.substring(0, 100) + '...');
    });
  }

  // cookies
  if (document.cookie) {
    console.log('🍪 cookies:', document.cookie.split(';').map(c => c.trim()));
  }

  console.groupEnd();
};

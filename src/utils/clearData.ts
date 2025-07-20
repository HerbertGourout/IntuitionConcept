import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fonction pour nettoyer complètement tous les caches locaux
 * Force l'utilisation exclusive de Firebase pour toutes les données
 */
export const clearAllLocalData = async () => {
  try {
    console.log('🧹 Migration vers Firebase - Nettoyage des caches locaux...');
    
    // 1. Nettoyer complètement le localStorage
    console.log('🗑️ Suppression complète du localStorage...');
    localStorage.clear();
    
    // 2. Nettoyer le sessionStorage
    console.log('🗑️ Suppression du sessionStorage...');
    sessionStorage.clear();
    
    // 3. Nettoyer les caches du navigateur
    console.log('🗑️ Nettoyage des caches navigateur...');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log(`🗑️ ${cacheNames.length} caches supprimés`);
    }
    
    // 4. Nettoyer IndexedDB (si utilisé)
    console.log('🗑️ Nettoyage IndexedDB...');
    if ('indexedDB' in window) {
      try {
        // Supprimer les bases de données IndexedDB communes
        const dbsToDelete = ['firebaseLocalStorageDb', 'firebase-heartbeat-database', 'firebase-installations-database'];
        for (const dbName of dbsToDelete) {
          indexedDB.deleteDatabase(dbName);
        }
      } catch (error) {
        console.warn('Erreur lors du nettoyage IndexedDB:', error);
      }
    }
    
    console.log('✅ Nettoyage des caches terminé !');
    console.log('🔥 Toutes les données sont maintenant exclusivement sur Firebase');
    
    // 5. Recharger la page pour appliquer les changements
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des caches:', error);
    throw error;
  }
};

/**
 * Fonction pour supprimer TOUTES les données Firebase (DANGER !)
 * À utiliser uniquement pour un reset complet
 */
export const clearAllFirebaseData = async () => {
  try {
    console.log('🔥 ATTENTION: Suppression de TOUTES les données Firebase...');
    
    // Supprimer toutes les collections
    const collections = ['projects', 'teamMembers', 'expenses', 'userSettings', 'userProfiles'];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`🗑️ ${snapshot.docs.length} documents supprimés de ${collectionName}`);
    }
    
    console.log('✅ Toutes les données Firebase supprimées !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression Firebase:', error);
    throw error;
  }
};

/**
 * Fonction pour forcer la migration vers Firebase
 * Supprime tous les caches locaux et force le rechargement depuis Firebase
 */
export const migrateToFirebaseOnly = () => {
  console.log('🔄 Migration vers Firebase exclusif...');
  
  // Nettoyer tous les stockages locaux
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('✅ Migration terminée - Rechargement...');
  window.location.reload();
};

/**
 * Fonction pour diagnostiquer l'état des données (debug)
 */
export const debugDataState = () => {
  console.log('🔍 État des données:');
  console.log('📦 localStorage items:', Object.keys(localStorage).length);
  console.log('📦 sessionStorage items:', Object.keys(sessionStorage).length);
  
  // Afficher le contenu du localStorage s'il y en a
  if (Object.keys(localStorage).length > 0) {
    console.log('⚠️ ATTENTION: Des données persistent en localStorage:');
    Object.keys(localStorage).forEach(key => {
      console.log(`  - ${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...');
    });
    console.log('🔄 Recommandation: Exécuter migrateToFirebaseOnly() pour nettoyer');
  } else {
    console.log('✅ Aucune donnée locale - Firebase exclusif actif');
  }
  
  console.log('🔥 Firebase collections utilisées: projects, teamMembers, expenses, userSettings, userProfiles');
};

import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fonction pour nettoyer complètement toutes les données de l'application
 * ATTENTION: Cette fonction supprime TOUTES les données !
 */
export const clearAllData = async () => {
  try {
    console.log('🧹 Nettoyage des données en cours...');
    
    // 1. Nettoyer le localStorage
    console.log('🗑️ Suppression des données localStorage...');
    localStorage.removeItem('projects');
    localStorage.removeItem('currentProjectId');
    localStorage.removeItem('user');
    localStorage.removeItem('settings');
    
    // 2. Nettoyer Firebase Firestore
    console.log('🔥 Suppression des données Firebase...');
    const projectsCollection = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsCollection);
    
    const deletePromises = projectsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Nettoyage terminé !');
    console.log(`📊 ${projectsSnapshot.docs.length} projets supprimés de Firebase`);
    
    // 3. Recharger la page pour appliquer les changements
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
};

/**
 * Fonction pour supprimer uniquement les données localStorage
 */
export const clearLocalStorage = () => {
  console.log('🗑️ Suppression des données localStorage uniquement...');
  localStorage.removeItem('projects');
  localStorage.removeItem('currentProjectId');
  localStorage.removeItem('user');
  localStorage.removeItem('settings');
  console.log('✅ localStorage nettoyé !');
  window.location.reload();
};

/**
 * Fonction pour afficher les données actuelles (debug)
 */
export const debugData = () => {
  console.log('🔍 Données actuelles:');
  console.log('localStorage projects:', localStorage.getItem('projects'));
  console.log('localStorage currentProjectId:', localStorage.getItem('currentProjectId'));
};

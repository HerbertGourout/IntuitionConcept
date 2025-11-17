/**
 * Script de nettoyage complet du localStorage
 * 
 * Ce script supprime TOUTES les données du localStorage
 * et affiche un rapport détaillé.
 */

export function cleanAllLocalStorage(): void {
  console.log('🧹 ========================================');
  console.log('🧹 NETTOYAGE COMPLET DU LOCALSTORAGE');
  console.log('🧹 ========================================\n');

  // Lister toutes les clés avant suppression
  const keys = Object.keys(localStorage);
  const totalKeys = keys.length;

  if (totalKeys === 0) {
    console.log('✅ localStorage est déjà vide\n');
    return;
  }

  console.log(`📊 ${totalKeys} clés trouvées dans localStorage:\n`);

  // Afficher chaque clé avec un aperçu de son contenu
  keys.forEach((key, index) => {
    const value = localStorage.getItem(key);
    const preview = value ? value.substring(0, 100) : '';
    const size = value ? (value.length / 1024).toFixed(2) : '0';
    
    console.log(`${index + 1}. ${key}`);
    console.log(`   Taille: ${size} KB`);
    console.log(`   Aperçu: ${preview}${value && value.length > 100 ? '...' : ''}\n`);
  });

  // Supprimer toutes les clés
  console.log('🗑️ Suppression en cours...\n');
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✓ ${key} supprimé`);
  });

  // Vérification finale
  const remainingKeys = Object.keys(localStorage);
  
  console.log('\n🧹 ========================================');
  if (remainingKeys.length === 0) {
    console.log('✅ NETTOYAGE TERMINÉ AVEC SUCCÈS');
    console.log(`✅ ${totalKeys} clés supprimées`);
    console.log('✅ localStorage est maintenant vide');
  } else {
    console.log('⚠️ ATTENTION: Certaines clés n\'ont pas pu être supprimées');
    console.log(`⚠️ Clés restantes: ${remainingKeys.join(', ')}`);
  }
  console.log('🧹 ========================================\n');
}

/**
 * Affiche un rapport sur l'utilisation actuelle du localStorage
 */
export function reportLocalStorageUsage(): void {
  console.log('📊 ========================================');
  console.log('📊 RAPPORT D\'UTILISATION DU LOCALSTORAGE');
  console.log('📊 ========================================\n');

  const keys = Object.keys(localStorage);
  
  if (keys.length === 0) {
    console.log('✅ localStorage est vide\n');
    return;
  }

  let totalSize = 0;
  const items: Array<{ key: string; size: number; preview: string }> = [];

  keys.forEach(key => {
    const value = localStorage.getItem(key) || '';
    const size = value.length;
    totalSize += size;
    
    items.push({
      key,
      size,
      preview: value.substring(0, 50)
    });
  });

  // Trier par taille décroissante
  items.sort((a, b) => b.size - a.size);

  console.log(`📊 Total: ${keys.length} clés`);
  console.log(`📊 Taille totale: ${(totalSize / 1024).toFixed(2)} KB\n`);

  console.log('📋 Détails par clé:\n');
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.key}`);
    console.log(`   Taille: ${(item.size / 1024).toFixed(2)} KB`);
    console.log(`   Aperçu: ${item.preview}${item.size > 50 ? '...' : ''}\n`);
  });

  console.log('📊 ========================================\n');
}

/**
 * Nettoie uniquement les clés spécifiques liées aux données métier
 * (garde les préférences utilisateur comme le thème)
 */
export function cleanBusinessDataFromLocalStorage(): void {
  console.log('🧹 Nettoyage des données métier du localStorage...\n');

  const businessKeys = [
    'team-members',
    'geofence-zones',
    'location-events',
    'offline-data',
    'pending-actions',
    'last-sync',
    'quoteTemplates',
    'dashboard-layouts',
    'current-layout'
  ];

  let removedCount = 0;

  businessKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`   ✓ ${key} supprimé`);
      removedCount++;
    }
  });

  console.log(`\n✅ ${removedCount} clés de données métier supprimées`);
  console.log('ℹ️ Les préférences utilisateur (thème, etc.) ont été conservées\n');
}

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
  interface WindowWithCleanup extends Window {
    cleanAllLocalStorage?: typeof cleanAllLocalStorage;
    reportLocalStorageUsage?: typeof reportLocalStorageUsage;
    cleanBusinessDataFromLocalStorage?: typeof cleanBusinessDataFromLocalStorage;
  }
  
  const w = window as WindowWithCleanup;
  w.cleanAllLocalStorage = cleanAllLocalStorage;
  w.reportLocalStorageUsage = reportLocalStorageUsage;
  w.cleanBusinessDataFromLocalStorage = cleanBusinessDataFromLocalStorage;
  
  console.log('🔧 Fonctions de nettoyage localStorage disponibles:');
  console.log('   - cleanAllLocalStorage()');
  console.log('   - reportLocalStorageUsage()');
  console.log('   - cleanBusinessDataFromLocalStorage()');
}

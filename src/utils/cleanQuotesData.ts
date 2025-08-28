/**
 * Utilitaire pour nettoyer complètement les données de devis en localStorage
 * et forcer l'utilisation exclusive de Firebase
 */

export const cleanAllQuotesData = (): void => {
  console.log('🧹 Nettoyage complet des données de devis...');
  
  try {
    // Nettoyer localStorage
    if (typeof Storage !== 'undefined' && localStorage) {
      const keysToRemove: string[] = [];
      
      // Identifier toutes les clés liées aux devis
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('quote') || 
          key.includes('devis') || 
          key === 'quotes' ||
          key === 'structuredQuotes' ||
          key.includes('Quote')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Supprimer toutes les clés identifiées
      keysToRemove.forEach(key => {
        console.log(`🗑️ Suppression localStorage: ${key}`);
        localStorage.removeItem(key);
      });
      
      console.log(`✅ ${keysToRemove.length} clés supprimées du localStorage`);
    }
    
    // Nettoyer sessionStorage
    if (typeof Storage !== 'undefined' && sessionStorage) {
      const keysToRemove: string[] = [];
      
      // Identifier toutes les clés liées aux devis
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.includes('quote') || 
          key.includes('devis') || 
          key === 'quotes' ||
          key === 'structuredQuotes' ||
          key.includes('Quote')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Supprimer toutes les clés identifiées
      keysToRemove.forEach(key => {
        console.log(`🗑️ Suppression sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      });
      
      console.log(`✅ ${keysToRemove.length} clés supprimées du sessionStorage`);
    }
    
    console.log('🎉 Nettoyage terminé - Firebase est maintenant la seule source de données');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

export const debugQuotesData = (): void => {
  console.log('🔍 État actuel des données de devis:');
  
  // Vérifier localStorage
  if (typeof Storage !== 'undefined' && localStorage) {
    const quotesKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('quote') || 
        key.includes('devis') || 
        key === 'quotes' ||
        key.includes('Quote')
      )) {
        quotesKeys.push(key);
      }
    }
    
    if (quotesKeys.length > 0) {
      console.log('⚠️ Données de devis trouvées dans localStorage:');
      quotesKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value?.substring(0, 50)}...`);
      });
    } else {
      console.log('✅ Aucune donnée de devis dans localStorage');
    }
  }
  
  // Vérifier sessionStorage
  if (typeof Storage !== 'undefined' && sessionStorage) {
    const quotesKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes('quote') || 
        key.includes('devis') || 
        key === 'quotes' ||
        key.includes('Quote')
      )) {
        quotesKeys.push(key);
      }
    }
    
    if (quotesKeys.length > 0) {
      console.log('⚠️ Données de devis trouvées dans sessionStorage:');
      quotesKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        console.log(`  - ${key}: ${value?.substring(0, 50)}...`);
      });
    } else {
      console.log('✅ Aucune donnée de devis dans sessionStorage');
    }
  }
};

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  // Exposer les fonctions globalement pour le débogage
  (window as unknown as { cleanAllQuotesData: typeof cleanAllQuotesData }).cleanAllQuotesData = cleanAllQuotesData;
  (window as unknown as { debugQuotesData: typeof debugQuotesData }).debugQuotesData = debugQuotesData;
}

// Script de débogage pour identifier les problèmes de devis
console.log('🔍 Débogage des devis - Début');

// Vérifier localStorage
console.log('📦 localStorage:');
if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage);
    console.log(`  - ${keys.length} clés trouvées`);
    
    keys.forEach(key => {
        if (key.includes('quote') || key.includes('devis')) {
            const value = localStorage.getItem(key);
            console.log(`  - ${key}: ${value?.substring(0, 100)}...`);
        }
    });
    
    // Nettoyer les anciennes données de devis
    keys.forEach(key => {
        if (key.includes('quote') || key.includes('devis') || key === 'quotes') {
            console.log(`🗑️ Suppression de: ${key}`);
            localStorage.removeItem(key);
        }
    });
} else {
    console.log('  - localStorage non disponible');
}

// Vérifier sessionStorage
console.log('📦 sessionStorage:');
if (typeof sessionStorage !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    console.log(`  - ${keys.length} clés trouvées`);
    
    keys.forEach(key => {
        if (key.includes('quote') || key.includes('devis')) {
            const value = sessionStorage.getItem(key);
            console.log(`  - ${key}: ${value?.substring(0, 100)}...`);
        }
    });
    
    // Nettoyer les anciennes données de devis
    keys.forEach(key => {
        if (key.includes('quote') || key.includes('devis') || key === 'quotes') {
            console.log(`🗑️ Suppression de: ${key}`);
            sessionStorage.removeItem(key);
        }
    });
} else {
    console.log('  - sessionStorage non disponible');
}

console.log('✅ Nettoyage terminé - Rechargez la page');

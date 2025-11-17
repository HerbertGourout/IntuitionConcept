# 🧹 Script de Nettoyage des Doublons - Console Navigateur

## 📋 Méthode Simple : Via Console Navigateur

### Étape 1 : Ouvrir la Console
1. Appuyez sur **F12** (ou Ctrl+Shift+I)
2. Cliquez sur l'onglet **Console**

### Étape 2 : Copier-Coller ce Script

```javascript
// Script de nettoyage des projets dupliqués
(async function cleanDuplicates() {
  console.log('🧹 Début du nettoyage des doublons...');
  
  try {
    // Importer Firebase
    const { collection, getDocs, deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Récupérer la référence Firestore depuis window
    const db = window.__FIREBASE_DB__;
    
    if (!db) {
      console.error('❌ Firebase non initialisé. Rechargez la page et réessayez.');
      return;
    }
    
    // Récupérer tous les projets
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    const projects = [];
    snapshot.forEach((docSnap) => {
      projects.push({
        id: docSnap.id,
        name: docSnap.data().name || '',
        createdAt: docSnap.data().createdAt || '',
        description: docSnap.data().description || ''
      });
    });
    
    console.log(`📊 Total projets trouvés: ${projects.length}`);
    
    // Grouper par nom
    const projectsByName = new Map();
    projects.forEach(project => {
      const key = project.name.toLowerCase().trim();
      if (!projectsByName.has(key)) {
        projectsByName.set(key, []);
      }
      projectsByName.get(key).push(project);
    });
    
    // Identifier et supprimer les doublons
    let deletedCount = 0;
    
    for (const [name, group] of projectsByName.entries()) {
      if (group.length > 1) {
        console.log(`\n📋 Groupe "${name}" - ${group.length} copies`);
        
        // Trier par date (plus récent en premier)
        group.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        // Garder le premier, supprimer les autres
        const toKeep = group[0];
        const toDelete = group.slice(1);
        
        console.log(`  ✅ Garder: ${toKeep.id}`);
        
        for (const project of toDelete) {
          console.log(`  ❌ Supprimer: ${project.id}`);
          await deleteDoc(doc(db, 'projects', project.id));
          deletedCount++;
        }
      }
    }
    
    console.log(`\n✅ Nettoyage terminé !`);
    console.log(`📊 ${deletedCount} doublons supprimés`);
    console.log(`📊 ${projects.length - deletedCount} projets restants`);
    console.log('\n🔄 Rechargez la page pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
```

### Étape 3 : Exécuter
1. **Collez** le script dans la console
2. **Appuyez sur Entrée**
3. **Attendez** le message de confirmation
4. **Rechargez** la page (F5)

---

## 🔧 Méthode Alternative : Suppression Manuelle Firebase

Si le script ne fonctionne pas, supprimez manuellement via Firebase Console :

### Étape 1 : Ouvrir Firebase Console
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. Cliquez sur **Firestore Database**
4. Ouvrez la collection **projects**

### Étape 2 : Identifier les Doublons

Vous avez **3 copies** de "Construction Bâtiment Intuition Concepts" :

| Nom | ID (visible dans Firebase) | Action |
|-----|---------------------------|--------|
| Construction Bâtiment Intuition Concepts | ??? | **GARDER** (le plus récent) |
| Construction Bâtiment Intuition Concepts | ??? | **SUPPRIMER** |
| Construction Bâtiment Intuition Concepts | ??? | **SUPPRIMER** |

### Étape 3 : Supprimer les Doublons

Pour chaque doublon à supprimer :
1. **Cliquez** sur le document
2. **Vérifiez** la date de création (`createdAt`)
3. **Gardez** le plus récent
4. **Supprimez** les autres :
   - Cliquez sur les **3 points** (⋮)
   - Cliquez sur **Delete document**
   - Confirmez

### Étape 4 : Vérifier
1. **Rechargez** votre application
2. **Vérifiez** qu'il ne reste qu'**1 seule copie** de chaque projet

---

## 🚨 Pourquoi les Doublons Persistent ?

Les corrections que j'ai apportées empêchent la **création de nouveaux doublons**, mais ne suppriment pas les **doublons existants**.

### Corrections Appliquées (Empêchent Nouveaux Doublons)
- ✅ Suppression du double chargement
- ✅ Simplification de `addProject`
- ✅ Un seul flux : Firebase → Abonnement → State

### Action Requise (Supprimer Doublons Existants)
- ⚠️ Les 3 copies de "Construction Bâtiment Intuition Concepts" sont **déjà dans Firebase**
- ⚠️ Elles doivent être **supprimées manuellement** ou via le script

---

## 🧪 Test Après Nettoyage

1. **Créez un nouveau projet** de test
2. **Vérifiez** qu'il apparaît **1 seule fois**
3. **Rechargez** la page
4. **Vérifiez** qu'il n'y a toujours **qu'une seule copie**

Si le test réussit, les corrections fonctionnent et seuls les doublons existants doivent être nettoyés.

---

## 📞 Besoin d'Aide ?

Si aucune méthode ne fonctionne :
1. **Faites une capture d'écran** de la console Firebase (collection projects)
2. **Notez les IDs** des 3 doublons
3. Je vous donnerai un script personnalisé avec les IDs exacts

---

**Date** : 30 octobre 2025, 00h10 UTC+01:00
**Statut** : ⚠️ Doublons existants à nettoyer manuellement

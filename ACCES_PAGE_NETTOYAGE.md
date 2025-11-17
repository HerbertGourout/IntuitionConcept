# 🧹 Accès à la Page de Nettoyage des Doublons

## 🚀 Méthode Rapide : URL Directe

### Étape 1 : Accéder à la Page
Dans votre navigateur, allez à l'URL :
```
http://localhost:5173/#/app/cleanup
```

Ou si vous utilisez un autre port :
```
http://localhost:[VOTRE_PORT]/#/app/cleanup
```

### Étape 2 : Utiliser la Page

La page affiche automatiquement :
- ✅ **Total de projets** dans Firebase
- ⚠️ **Nombre de groupes de doublons** détectés
- 🗑️ **Nombre de doublons à supprimer**

Pour chaque groupe de doublons, vous verrez :
- 🟢 **Le projet à GARDER** (le plus récent) - fond vert
- 🔴 **Les projets à SUPPRIMER** - fond rouge

### Étape 3 : Nettoyer

1. **Vérifiez** les doublons affichés
2. **Cliquez** sur le bouton rouge **"Nettoyer Maintenant"**
3. **Confirmez** dans la popup
4. **Attendez** le message de succès
5. **Rechargez** votre application (F5)

---

## 📊 Ce que Vous Devriez Voir

### Avant Nettoyage
```
Total Projets: 9
Groupes de Doublons: 3
Doublons à Supprimer: 6

📋 Construction Bâtiment Intuition Concepts (3 copies)
  ✅ À GARDER - ID: abc123 - Créé le: 29/10/2025 12:30:00
  ❌ À SUPPRIMER - ID: def456 - Créé le: 29/10/2025 12:29:58
  ❌ À SUPPRIMER - ID: ghi789 - Créé le: 29/10/2025 12:29:56
```

### Après Nettoyage
```
Total Projets: 3
Groupes de Doublons: 0
Doublons à Supprimer: 0

✅ Aucun doublon trouvé !
Tous vos projets sont uniques.
```

---

## 🔧 Méthode Alternative : Via la Console

Si la page ne charge pas, utilisez la console du navigateur :

### Étape 1 : Ouvrir la Console
1. Appuyez sur **F12**
2. Cliquez sur l'onglet **Console**

### Étape 2 : Exécuter le Script
Copiez-collez ce code dans la console :

```javascript
// Accéder à la page de nettoyage
window.location.hash = '#/app/cleanup';
```

Puis appuyez sur **Entrée**.

---

## 🎯 Vérification Après Nettoyage

### 1. Vérifier dans l'Application
1. Allez dans **Projets** (menu latéral)
2. Comptez les projets affichés
3. Vérifiez qu'il n'y a **plus de doublons**

### 2. Vérifier dans Firebase Console
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. **Firestore Database** → Collection **projects**
4. Comptez les documents
5. Le nombre doit correspondre à celui de l'application

### 3. Tester la Création
1. **Créez un nouveau projet** de test
2. **Vérifiez** qu'il apparaît **1 seule fois**
3. **Rechargez** la page (F5)
4. **Vérifiez** qu'il n'y a toujours **qu'une copie**

---

## 🚨 En Cas de Problème

### La page ne charge pas
1. Vérifiez que vous êtes bien sur `http://localhost:5173`
2. Vérifiez que l'application est démarrée (`npm run dev`)
3. Essayez de recharger avec Ctrl+F5

### Les doublons ne s'affichent pas
1. Ouvrez la console (F12)
2. Cherchez des erreurs en rouge
3. Cliquez sur **"Rescanner"** en haut à droite

### Le nettoyage échoue
1. Vérifiez votre connexion Firebase
2. Vérifiez les permissions Firestore
3. Consultez la console pour les erreurs

---

## 📸 Captures d'Écran Attendues

### Page de Nettoyage
```
┌─────────────────────────────────────────────────┐
│  🗑️ Nettoyage des Doublons                     │
│  Supprimez les projets dupliqués...             │
│                                    [🔄 Rescanner]│
├─────────────────────────────────────────────────┤
│  Total Projets    Groupes Doublons  À Supprimer│
│       9                  3                6     │
├─────────────────────────────────────────────────┤
│  ⚠️ 6 doublons détectés                         │
│  Le projet le plus récent sera conservé         │
│                        [🗑️ Nettoyer Maintenant] │
├─────────────────────────────────────────────────┤
│  📋 Construction Bâtiment Intuition Concepts    │
│  (3 copies)                                     │
│                                                 │
│  ✅ À GARDER                                    │
│  ID: abc123                                     │
│  Créé le: 29/10/2025 12:30:00                  │
│                                                 │
│  ❌ À SUPPRIMER                                 │
│  ID: def456                                     │
│  Créé le: 29/10/2025 12:29:58                  │
│                                                 │
│  ❌ À SUPPRIMER                                 │
│  ID: ghi789                                     │
│  Créé le: 29/10/2025 12:29:56                  │
└─────────────────────────────────────────────────┘
```

---

## 🎉 Après le Nettoyage

Une fois les doublons supprimés :

1. ✅ **Rechargez** l'application
2. ✅ **Vérifiez** qu'il n'y a plus de doublons
3. ✅ **Testez** la création d'un nouveau projet
4. ✅ **Supprimez** la route `/cleanup` si vous le souhaitez

Pour supprimer la route (optionnel) :
- Retirez `case 'cleanup': return <CleanupPage />;` dans `App.tsx`
- Retirez `import CleanupPage from './components/Admin/CleanupPage';`

---

**Date** : 30 octobre 2025, 00h15 UTC+01:00
**URL** : http://localhost:5173/#/app/cleanup
**Statut** : ✅ Page prête à l'emploi

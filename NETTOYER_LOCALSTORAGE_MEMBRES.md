# 🧹 Nettoyer les Membres d'Équipe du localStorage

## 🔍 Problème Identifié

Les membres "Patrick", "Herbert" et "Ndzondzi Gourout" apparaissent toujours car ils sont **stockés dans localStorage** par le `GeolocationContext`.

### Localisation du Problème

**Fichier** : `src/contexts/GeolocationContext.tsx`

```typescript
// Ligne 116-133 : Chargement depuis localStorage
const savedMembers = localStorage.getItem('team-members');
if (savedMembers) {
  try {
    setTeamMembers(JSON.parse(savedMembers));
  } catch {
    // Erreur lors du chargement des membres
  }
}

// Ligne 156-158 : Sauvegarde dans localStorage
useEffect(() => {
  localStorage.setItem('team-members', JSON.stringify(teamMembers));
}, [teamMembers]);
```

## ✅ Solution Rapide : Nettoyer le localStorage

### Méthode 1 : Via la Console du Navigateur (Recommandé)

1. **Ouvrez la console** (F12)
2. **Onglet Console**
3. **Copiez-collez ce code** :

```javascript
// Supprimer les membres d'équipe du localStorage
localStorage.removeItem('team-members');
console.log('✅ Membres d\'équipe supprimés du localStorage');

// Vérifier
console.log('📊 Contenu actuel de localStorage:');
Object.keys(localStorage).forEach(key => {
  console.log(`  - ${key}`);
});

// Recharger la page
location.reload();
```

4. **Appuyez sur Entrée**
5. La page se rechargera automatiquement

### Méthode 2 : Via les Outils de Développement

1. **F12** → **Onglet Application** (Chrome) ou **Stockage** (Firefox)
2. **Local Storage** → Sélectionnez votre domaine (`localhost:5173`)
3. **Cherchez la clé `team-members`**
4. **Clic droit** → **Supprimer**
5. **Rechargez** la page (F5)

### Méthode 3 : Nettoyer Tout le localStorage

Si vous voulez tout nettoyer (attention, cela supprime aussi le thème, etc.) :

```javascript
// ⚠️ ATTENTION : Supprime TOUT le localStorage
localStorage.clear();
console.log('✅ localStorage complètement nettoyé');
location.reload();
```

## 🔧 Solution Permanente : Modifier le Code

Pour éviter que cela se reproduise, nous devons modifier `GeolocationContext.tsx` pour charger les membres depuis **Firebase** au lieu de localStorage.

### Option A : Charger depuis Firebase

**Fichier** : `src/contexts/GeolocationContext.tsx`

```typescript
// AVANT (ligne 113-133)
useEffect(() => {
  const savedMembers = localStorage.getItem('team-members');
  if (savedMembers) {
    try {
      setTeamMembers(JSON.parse(savedMembers));
    } catch {
      // Erreur
    }
  }
}, []);

// APRÈS - Charger depuis Firebase
useEffect(() => {
  const loadTeamMembers = async () => {
    try {
      const members = await TeamService.getAllMembers();
      setTeamMembers(members.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        isOnline: false, // Par défaut
        lastSeen: new Date(),
        currentLocation: undefined,
        assignedSite: undefined
      })));
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };
  
  loadTeamMembers();
}, []);
```

### Option B : Ne Plus Utiliser localStorage pour les Membres

Commentez les lignes qui sauvegardent dans localStorage :

```typescript
// AVANT (ligne 156-158)
useEffect(() => {
  localStorage.setItem('team-members', JSON.stringify(teamMembers));
}, [teamMembers]);

// APRÈS - Désactivé
// useEffect(() => {
//   localStorage.setItem('team-members', JSON.stringify(teamMembers));
// }, [teamMembers]);
```

## 🧪 Vérification

### Étape 1 : Nettoyer le localStorage
Utilisez la **Méthode 1** ci-dessus.

### Étape 2 : Vérifier dans la Console
```javascript
// Vérifier que la clé n'existe plus
console.log('team-members:', localStorage.getItem('team-members'));
// Devrait afficher: null
```

### Étape 3 : Tester l'Application
1. **Rechargez** la page (F5)
2. **Allez dans Planning** → **Gantt** → **Nouvelle Tâche**
3. **Menu "Assigné à"** devrait afficher : **"Aucun membre disponible"**

### Étape 4 : Créer de Vrais Membres
1. **Équipe** → **"+ Nouveau Membre"**
2. Créez vos vrais membres
3. Ils apparaîtront dans le menu "Assigné à"

## 📊 Autres Clés localStorage à Vérifier

Le `GeolocationContext` utilise aussi :

```javascript
// Vérifier toutes les clés liées à la géolocalisation
console.log('geofence-zones:', localStorage.getItem('geofence-zones'));
console.log('location-events:', localStorage.getItem('location-events'));
console.log('team-members:', localStorage.getItem('team-members'));
```

Pour nettoyer toutes les clés de géolocalisation :

```javascript
localStorage.removeItem('geofence-zones');
localStorage.removeItem('location-events');
localStorage.removeItem('team-members');
console.log('✅ Toutes les données de géolocalisation supprimées');
location.reload();
```

## 🎯 Pourquoi Ce Problème ?

Le `GeolocationContext` a été conçu pour fonctionner **hors ligne** avec des données en cache dans localStorage. C'est utile pour :
- Suivre les équipes sur le terrain
- Géolocalisation en temps réel
- Zones de géofencing

Mais pour les **membres d'équipe**, il vaut mieux utiliser **Firebase** comme source unique de vérité.

## 📝 Checklist de Résolution

- [ ] **Ouvrir la console** (F12)
- [ ] **Exécuter** `localStorage.removeItem('team-members')`
- [ ] **Recharger** la page (F5)
- [ ] **Vérifier** que les membres ont disparu
- [ ] **Créer de vrais membres** dans la section Équipe
- [ ] **Tester** dans le modal de tâche

## 🚨 Important

**Ne supprimez PAS ces clés localStorage** (elles sont utiles) :
- `theme` : Votre préférence de thème (clair/sombre)
- `dashboard-layouts` : Configuration de votre dashboard
- `current-layout` : Layout actuel
- `ocr_provider` : Configuration OCR
- `offline-data` : Données hors ligne

**Supprimez UNIQUEMENT** :
- `team-members` : Membres codés en dur

---

**Date** : 30 octobre 2025, 01h05 UTC+01:00
**Statut** : ⚠️ Action requise - Nettoyer localStorage
**Action** : Exécuter `localStorage.removeItem('team-members')` dans la console

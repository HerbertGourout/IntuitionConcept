# 🔄 Guide de Migration Firebase - Compte Temporaire → Compte Définitif

## 📋 Vue d'Ensemble

Ce guide vous aide à migrer de votre compte Firebase temporaire vers votre compte définitif en préservant toutes vos données.

---

## ⚠️ Avant de Commencer

### Informations à Préparer

**Compte Temporaire (ancien):**
- [ ] Email du compte temporaire
- [ ] Project ID temporaire
- [ ] Service Account Key (pour export)

**Compte Définitif (nouveau):**
- [ ] Email du compte définitif
- [ ] Nom du nouveau projet
- [ ] Service Account Key (pour import)

---

## 🚀 Étape 1: Créer le Nouveau Projet Firebase

### 1.1 Connexion avec le Compte Définitif

1. Déconnectez-vous de Firebase Console
2. Allez sur [Firebase Console](https://console.firebase.google.com/)
3. Connectez-vous avec **votre email définitif**

### 1.2 Créer le Projet

1. Cliquez sur **"Ajouter un projet"**
2. Nom du projet: `IntuitionConcept` (ou votre nom définitif)
3. Activez Google Analytics si souhaité
4. Cliquez sur **"Créer le projet"**

### 1.3 Configurer l'Application Web

1. Cliquez sur l'icône Web `</>`
2. Nom de l'app: `IntuitionConcept Web`
3. Cochez "Firebase Hosting" si souhaité
4. **Copiez la configuration** (vous en aurez besoin !)

```javascript
// NOUVEAU compte - Sauvegardez ces valeurs !
const firebaseConfig = {
  apiKey: "NOUVELLE_API_KEY",
  authDomain: "nouveau-projet.firebaseapp.com",
  projectId: "nouveau-projet",
  storageBucket: "nouveau-projet.appspot.com",
  messagingSenderId: "NOUVEAU_SENDER_ID",
  appId: "NOUVEAU_APP_ID"
};
```

---

## 📦 Étape 2: Exporter les Données de l'Ancien Compte

### 2.1 Télécharger le Service Account (Ancien Compte)

1. Dans l'**ancien projet** Firebase Console
2. Allez dans **⚙️ Project Settings > Service Accounts**
3. Cliquez sur **"Generate new private key"**
4. Sauvegardez le fichier JSON: `ancien-compte-service-account.json`

### 2.2 Configurer le Script d'Export

Éditez `scripts/export-firebase-data.js` :

```javascript
// Remplacez par le contenu de ancien-compte-service-account.json
const serviceAccount = require('../ancien-compte-service-account.json');
```

### 2.3 Installer les Dépendances

```bash
npm install firebase-admin --save-dev
```

### 2.4 Exécuter l'Export

```bash
node scripts/export-firebase-data.js
```

**Résultat:** Vos données seront sauvegardées dans `./firebase-backup/`

---

## 🔐 Étape 3: Configurer le Nouveau Projet

### 3.1 Activer les Services Firebase

Dans le **nouveau projet** Firebase Console :

#### Authentication
1. Allez dans **Authentication**
2. Cliquez sur **"Get started"**
3. Activez **Email/Password**
4. Activez les mêmes méthodes que l'ancien projet

#### Firestore Database
1. Allez dans **Firestore Database**
2. Cliquez sur **"Create database"**
3. Mode: **Production** (recommandé)
4. Région: Choisissez la même que l'ancien projet
5. Cliquez sur **"Enable"**

#### Storage
1. Allez dans **Storage**
2. Cliquez sur **"Get started"**
3. Acceptez les règles par défaut
4. Même région que Firestore

### 3.2 Configurer les Règles de Sécurité

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3.3 Télécharger le Service Account (Nouveau Compte)

1. Dans le **nouveau projet** Firebase Console
2. **⚙️ Project Settings > Service Accounts**
3. **"Generate new private key"**
4. Sauvegardez: `nouveau-compte-service-account.json`

---

## 📥 Étape 4: Importer les Données

### 4.1 Configurer le Script d'Import

Éditez `scripts/import-firebase-data.js` :

```javascript
// Remplacez par le contenu de nouveau-compte-service-account.json
const serviceAccount = require('../nouveau-compte-service-account.json');
```

### 4.2 Exécuter l'Import

```bash
node scripts/import-firebase-data.js
```

**Résultat:** Toutes vos données seront copiées dans le nouveau projet !

---

## 🔧 Étape 5: Mettre à Jour la Configuration de l'Application

### 5.1 Mettre à Jour `.env.local`

Remplacez les anciennes valeurs par les nouvelles :

```env
# NOUVEAU compte Firebase définitif
VITE_FIREBASE_API_KEY=NOUVELLE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=nouveau-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nouveau-projet
VITE_FIREBASE_STORAGE_BUCKET=nouveau-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=NOUVEAU_SENDER_ID
VITE_FIREBASE_APP_ID=NOUVEAU_APP_ID
```

### 5.2 Mettre à Jour les Valeurs par Défaut (Optionnel)

Si vous voulez aussi changer les fallbacks dans `src/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "NOUVELLE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nouveau-projet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nouveau-projet",
  // ...
};
```

---

## 🧪 Étape 6: Tester la Migration

### 6.1 Redémarrer l'Application

```bash
# Arrêter le serveur de dev (Ctrl+C)
npm run dev
```

### 6.2 Vérifications

- [ ] L'application se connecte au nouveau Firebase
- [ ] Les utilisateurs peuvent se connecter
- [ ] Les données sont visibles (projets, devis, etc.)
- [ ] Les uploads de fichiers fonctionnent
- [ ] Pas d'erreurs dans la console

### 6.3 Test de Connexion

1. Ouvrez la console du navigateur (F12)
2. Vérifiez qu'il n'y a pas d'erreurs Firebase
3. Essayez de vous connecter avec un compte existant
4. Vérifiez que les données s'affichent correctement

---

## 👥 Étape 7: Migrer les Utilisateurs

### Option A: Les Utilisateurs se Reconnectent

**Le plus simple:**
1. Les utilisateurs créent un nouveau compte
2. Vous associez manuellement leurs données

### Option B: Migration Automatique (Avancé)

Utilisez Firebase Auth Import :

```bash
# Exporter les utilisateurs de l'ancien projet
firebase auth:export users.json --project ancien-projet-id

# Importer dans le nouveau projet
firebase auth:import users.json --project nouveau-projet-id
```

---

## 📁 Étape 8: Migrer les Fichiers Storage

### 8.1 Utiliser gsutil (Google Cloud SDK)

```bash
# Installer Google Cloud SDK si nécessaire
# https://cloud.google.com/sdk/docs/install

# Copier tous les fichiers
gsutil -m cp -r gs://ancien-projet.appspot.com/* gs://nouveau-projet.appspot.com/
```

### 8.2 Vérifier la Migration

1. Allez dans Storage du nouveau projet
2. Vérifiez que tous les fichiers sont présents

---

## 🌍 Étape 9: Mettre à Jour la Production

### 9.1 Variables d'Environnement Vercel/Netlify

Mettez à jour toutes les variables avec les nouvelles valeurs :

```bash
# Vercel
vercel env rm VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_API_KEY production
# Entrez la NOUVELLE valeur

# Répétez pour toutes les variables Firebase
```

### 9.2 Redéployer

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### 9.3 Autoriser les Domaines

Dans le nouveau projet Firebase Console :
1. **Authentication > Settings > Authorized domains**
2. Ajoutez vos domaines de production

---

## 🧹 Étape 10: Nettoyage (Optionnel)

### Une fois que tout fonctionne :

1. **Gardez l'ancien projet** pendant 1-2 semaines (sécurité)
2. Vérifiez que tout fonctionne en production
3. Supprimez l'ancien projet Firebase :
   - Firebase Console > Project Settings
   - Descendez en bas
   - "Delete project"

### Supprimer les Fichiers Temporaires

```bash
# Supprimer les backups locaux (après vérification)
rm -rf firebase-backup/
rm ancien-compte-service-account.json
rm nouveau-compte-service-account.json
```

---

## ✅ Checklist de Migration

### Préparation
- [ ] Nouveau projet Firebase créé
- [ ] Service accounts téléchargés (ancien et nouveau)
- [ ] Configuration du nouveau projet copiée

### Export
- [ ] Données Firestore exportées
- [ ] Backup vérifié dans `./firebase-backup/`

### Configuration Nouveau Projet
- [ ] Authentication activée
- [ ] Firestore Database créée
- [ ] Storage activé
- [ ] Règles de sécurité configurées

### Import
- [ ] Données Firestore importées
- [ ] Fichiers Storage copiés
- [ ] Utilisateurs migrés (si applicable)

### Application
- [ ] `.env.local` mis à jour
- [ ] Application testée localement
- [ ] Toutes les fonctionnalités vérifiées

### Production
- [ ] Variables d'environnement mises à jour
- [ ] Application redéployée
- [ ] Domaines autorisés configurés
- [ ] Tests en production réussis

### Nettoyage
- [ ] Ancien projet conservé 1-2 semaines
- [ ] Tout vérifié en production
- [ ] Ancien projet supprimé (après confirmation)

---

## 🆘 Dépannage

### Erreur: "Permission denied"

**Solution:** Vérifiez que les règles Firestore/Storage sont correctement configurées

### Les données ne s'affichent pas

**Solution:** 
1. Vérifiez que l'import s'est bien terminé
2. Consultez Firebase Console > Firestore pour voir les données
3. Vérifiez la console du navigateur pour les erreurs

### Erreur: "Unauthorized domain"

**Solution:** Ajoutez votre domaine dans Authentication > Settings > Authorized domains

### Les utilisateurs ne peuvent pas se connecter

**Solution:** 
1. Vérifiez que Authentication est activée
2. Vérifiez que les méthodes de connexion sont activées
3. Si migration des utilisateurs: vérifiez l'import

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez la [Documentation Firebase](https://firebase.google.com/docs)
2. Vérifiez les logs dans Firebase Console
3. Consultez la console du navigateur (F12)

---

## 🎉 Félicitations !

Une fois toutes les étapes complétées, votre application utilise maintenant votre compte Firebase définitif avec toutes vos données migrées !

**Temps estimé:** 1-2 heures  
**Difficulté:** Moyenne  
**Risque de perte de données:** Faible (avec backup)

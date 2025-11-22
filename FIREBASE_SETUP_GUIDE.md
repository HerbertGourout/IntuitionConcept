# 🔥 Guide de Configuration Firebase

## 📋 Changement de Compte Firebase

Ce guide vous explique comment configurer votre propre compte Firebase pour le projet IntuitionConcept.

---

## 🚀 Étape 1: Créer un Projet Firebase

### 1.1 Accéder à Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Ajouter un projet"** ou **"Create a project"**

### 1.2 Configurer le Projet

1. **Nom du projet:** `IntuitionConcept` (ou votre nom personnalisé)
2. **Google Analytics:** Activez si vous voulez des analytics (recommandé)
3. Cliquez sur **"Créer le projet"**

---

## 🔑 Étape 2: Obtenir les Credentials Firebase

### 2.1 Créer une Application Web

1. Dans votre projet Firebase, cliquez sur l'icône **Web** `</>`
2. Donnez un nom à votre app: `IntuitionConcept Web`
3. **Cochez** "Also set up Firebase Hosting" (optionnel)
4. Cliquez sur **"Enregistrer l'application"**

### 2.2 Copier la Configuration

Vous verrez un objet de configuration comme ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copiez ces valeurs**, vous en aurez besoin !

---

## ⚙️ Étape 3: Configurer le Projet

### Option A: Utiliser `.env.local` (Recommandé)

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Option B: Modifier `src/firebase.ts`

Si vous ne voulez pas utiliser de fichier `.env.local`, modifiez directement les valeurs par défaut dans `src/firebase.ts` (lignes 8-13).

---

## 🔐 Étape 4: Activer les Services Firebase

### 4.1 Authentication

1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur **"Get started"**
3. Activez les méthodes de connexion souhaitées :
   - ✅ **Email/Password** (recommandé)
   - ✅ **Google** (optionnel)
   - ✅ **Anonymous** (pour les tests)

### 4.2 Firestore Database

1. Allez dans **Firestore Database**
2. Cliquez sur **"Create database"**
3. Choisissez le mode :
   - **Production mode** (recommandé pour production)
   - **Test mode** (pour développement - expire après 30 jours)
4. Sélectionnez une région proche de vos utilisateurs
5. Cliquez sur **"Enable"**

### 4.3 Storage

1. Allez dans **Storage**
2. Cliquez sur **"Get started"**
3. Acceptez les règles par défaut
4. Sélectionnez la même région que Firestore
5. Cliquez sur **"Done"**

---

## 🛡️ Étape 5: Configurer les Règles de Sécurité

### 5.1 Règles Firestore

Allez dans **Firestore Database > Rules** et collez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs authentifiés
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Règles spécifiques par collection (à personnaliser)
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /quotes/{quoteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5.2 Règles Storage

Allez dans **Storage > Rules** et collez :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🧪 Étape 6: Tester la Configuration

### 6.1 Démarrer l'Application

```bash
npm run dev
```

### 6.2 Vérifier la Connexion

1. Ouvrez la console du navigateur (F12)
2. Vous devriez voir : `[Firebase] IndexedDB persistence enabled`
3. Pas d'erreurs de connexion Firebase

### 6.3 Tester l'Authentification

1. Essayez de créer un compte
2. Vérifiez dans Firebase Console > Authentication que l'utilisateur apparaît

---

## 🌍 Étape 7: Configuration pour Production

### 7.1 Variables d'Environnement Vercel/Netlify

Si vous déployez sur Vercel ou Netlify, ajoutez les variables d'environnement :

**Vercel:**
```bash
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

**Netlify:**
1. Site settings > Build & deploy > Environment
2. Ajoutez chaque variable manuellement

### 7.2 Domaines Autorisés

Dans Firebase Console > Authentication > Settings :

1. Allez dans **Authorized domains**
2. Ajoutez vos domaines :
   - `localhost` (déjà présent)
   - `votre-domaine.com`
   - `votre-app.vercel.app`
   - `votre-app.netlify.app`

---

## 🔧 Dépannage

### Erreur: "Firebase: Error (auth/unauthorized-domain)"

**Solution:** Ajoutez votre domaine dans Firebase Console > Authentication > Settings > Authorized domains

### Erreur: "Missing or insufficient permissions"

**Solution:** Vérifiez vos règles Firestore et assurez-vous que l'utilisateur est authentifié

### Erreur: "Failed to get document because the client is offline"

**Solution:** 
1. Vérifiez votre connexion internet
2. Vérifiez que Firestore est activé
3. Essayez de désactiver temporairement la persistence offline

### L'application ne se connecte pas à Firebase

**Vérifications:**
1. Les credentials dans `.env.local` sont corrects
2. Le fichier `.env.local` est à la racine du projet
3. Vous avez redémarré le serveur de dev après avoir modifié `.env.local`
4. Les services Firebase (Auth, Firestore, Storage) sont activés

---

## 📚 Ressources Utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com/)
- [Pricing Firebase](https://firebase.google.com/pricing)
- [Limites Gratuit Firebase](https://firebase.google.com/docs/firestore/quotas)

---

## 💰 Plan Gratuit Firebase (Spark Plan)

### Limites Gratuites

- **Firestore:**
  - 1 GB de stockage
  - 50,000 lectures/jour
  - 20,000 écritures/jour
  - 20,000 suppressions/jour

- **Storage:**
  - 5 GB de stockage
  - 1 GB de téléchargement/jour

- **Authentication:**
  - Illimité (gratuit)

### Quand Passer au Plan Payant ?

Passez au **Blaze Plan** (pay-as-you-go) si :
- Vous dépassez les limites gratuites
- Vous avez besoin de Cloud Functions
- Vous voulez des backups automatiques

---

## ✅ Checklist Finale

- [ ] Projet Firebase créé
- [ ] Application Web configurée
- [ ] Credentials copiées dans `.env.local`
- [ ] Authentication activée
- [ ] Firestore Database activée
- [ ] Storage activé
- [ ] Règles de sécurité configurées
- [ ] Application testée localement
- [ ] Domaines autorisés configurés (pour production)
- [ ] Variables d'environnement configurées (pour production)

---

**🎉 Félicitations ! Votre configuration Firebase est complète !**

Si vous rencontrez des problèmes, consultez la section Dépannage ou la documentation Firebase.

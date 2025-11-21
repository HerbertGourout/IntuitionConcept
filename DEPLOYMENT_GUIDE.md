# 🚀 Guide de Déploiement IntuitionConcept

## 📋 Prérequis

- [ ] Compte Firebase créé
- [ ] Projet Firebase configuré
- [ ] Firebase CLI installé
- [ ] Secrets GitHub configurés

---

## 🔐 Étape 1: Configuration Firebase

### 1.1 Créer le projet Firebase

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase dans le projet
firebase init
```

**Sélectionner:**
- ✅ Hosting
- ✅ Firestore
- ✅ Functions (optionnel pour l'instant)
- ✅ Storage

### 1.2 Configuration Hosting

Fichier `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 🔑 Étape 2: Secrets GitHub

### 2.1 Générer le Service Account

```bash
# Aller dans Firebase Console
# Project Settings > Service Accounts > Generate New Private Key
# Télécharger le fichier JSON
```

### 2.2 Ajouter les secrets dans GitHub

**Repository > Settings > Secrets and variables > Actions > New repository secret**

**Secrets requis:**

1. **FIREBASE_SERVICE_ACCOUNT**
   - Copier tout le contenu du fichier JSON téléchargé
   - Coller dans la valeur du secret

2. **FIREBASE_TOKEN** (pour deploy via CLI)
   ```bash
   firebase login:ci
   # Copier le token généré
   ```

3. **Variables d'environnement (optionnel)**
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - etc.

---

## 🌍 Étape 3: Environnements

### 3.1 Structure recommandée

```
Production:  main branch → Firebase Hosting (live)
Staging:     develop branch → Firebase Hosting (staging channel)
Preview:     Pull Requests → Firebase Hosting (preview URLs)
```

### 3.2 Fichiers d'environnement

**.env.production**
```env
VITE_API_URL=https://api.intuitionconcept.com
VITE_FIREBASE_PROJECT_ID=intuitionconcept-prod
VITE_ENVIRONMENT=production
```

**.env.staging**
```env
VITE_API_URL=https://api-staging.intuitionconcept.com
VITE_FIREBASE_PROJECT_ID=intuitionconcept-staging
VITE_ENVIRONMENT=staging
```

**.env.development**
```env
VITE_API_URL=http://localhost:5173
VITE_FIREBASE_PROJECT_ID=intuitionconcept-dev
VITE_ENVIRONMENT=development
```

---

## 🚀 Étape 4: Premier Déploiement

### 4.1 Déploiement manuel (test)

```bash
# Build de production
npm run build

# Déployer sur Firebase
firebase deploy --only hosting
```

### 4.2 Vérification

- ✅ Ouvrir l'URL fournie par Firebase
- ✅ Tester les fonctionnalités principales
- ✅ Vérifier les logs dans Firebase Console

---

## 🔄 Étape 5: CI/CD Automatique

### 5.1 Workflow actuel (déjà configuré)

Le fichier `.github/workflows/ci.yml` est déjà configuré pour:
- ✅ Tests automatiques
- ✅ Build multi-environnement
- ✅ Déploiement automatique sur push

### 5.2 Activer les déploiements

Une fois les secrets configurés, chaque push sur `main` déclenchera:
1. Tests & Quality Checks
2. Build (development + production)
3. Deploy to Production (Firebase Hosting)

---

## 📊 Étape 6: Monitoring & Performance

### 6.1 Firebase Performance Monitoring

```bash
npm install firebase
```

Dans `src/main.tsx`:
```typescript
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';

const app = initializeApp(firebaseConfig);
const perf = getPerformance(app);
```

### 6.2 Firebase Analytics

```typescript
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

### 6.3 Error Tracking (Sentry - optionnel)

```bash
npm install @sentry/react @sentry/vite-plugin
```

---

## 🔒 Étape 7: Sécurité

### 7.1 Firestore Rules

**firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentification requise par défaut
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Règles spécifiques par collection
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.uid == resource.data.ownerId;
    }
  }
}
```

### 7.2 Storage Rules

**storage.rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
  }
}
```

---

## 🎯 Étape 8: Domaine Personnalisé

### 8.1 Ajouter un domaine

1. Firebase Console > Hosting > Add custom domain
2. Suivre les instructions DNS
3. SSL automatique (Let's Encrypt)

### 8.2 Configuration DNS

```
Type: A
Name: @
Value: 151.101.1.195, 151.101.65.195

Type: A
Name: www
Value: 151.101.1.195, 151.101.65.195
```

---

## 📈 Étape 9: Optimisations Production

### 9.1 Build optimisé

**vite.config.ts**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/firestore'],
          'ui': ['lucide-react', 'recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 9.2 Compression

Firebase Hosting active automatiquement:
- ✅ Gzip
- ✅ Brotli
- ✅ HTTP/2

---

## 🔍 Checklist Finale

### Avant le déploiement production:
- [ ] Tous les tests passent
- [ ] Build sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Secrets GitHub ajoutés
- [ ] Firestore rules testées
- [ ] Storage rules testées
- [ ] Performance testée (Lighthouse > 90)
- [ ] SEO optimisé
- [ ] Analytics configuré
- [ ] Error tracking configuré
- [ ] Domaine personnalisé configuré (optionnel)

### Post-déploiement:
- [ ] Vérifier l'URL de production
- [ ] Tester les fonctionnalités critiques
- [ ] Vérifier les logs Firebase
- [ ] Monitorer les performances
- [ ] Configurer les alertes

---

## 📞 Support

- Firebase Console: https://console.firebase.google.com
- Documentation: https://firebase.google.com/docs/hosting
- Status: https://status.firebase.google.com


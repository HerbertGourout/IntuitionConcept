# ⚡ Déploiement Rapide - 30 Minutes

## 🎯 Actions Immédiates (dans l'ordre)

### 1️⃣ Installer Firebase CLI (2 min)

```bash
npm install -g firebase-tools
firebase --version
```

---

### 2️⃣ Se connecter à Firebase (1 min)

```bash
firebase login
```

---

### 3️⃣ Créer/Sélectionner le projet Firebase (3 min)

**Option A: Nouveau projet**
```bash
# Aller sur https://console.firebase.google.com
# Cliquer "Add project"
# Nom: IntuitionConcept
# Activer Google Analytics (optionnel)
```

**Option B: Projet existant**
```bash
firebase projects:list
firebase use intuitionconcept
```

---

### 4️⃣ Initialiser Firebase dans le projet (5 min)

```bash
cd c:/Users/Jepssen/Desktop/Patrick/IntuitionConcept
firebase init
```

**Sélections:**
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Firestore: Deploy rules and create indexes
- ❌ Functions (pas maintenant)
- ❌ Storage (pas maintenant)

**Questions:**
- Public directory? → `dist`
- Single-page app? → `Yes`
- Automatic builds with GitHub? → `No` (on a déjà GitHub Actions)
- Overwrite index.html? → `No`

---

### 5️⃣ Générer le Service Account (3 min)

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet
3. ⚙️ Project Settings (roue dentée en haut à gauche)
4. Service Accounts
5. **Generate New Private Key**
6. Télécharger le fichier JSON

---

### 6️⃣ Ajouter les Secrets GitHub (5 min)

1. Aller sur https://github.com/HerbertGourout/IntuitionConcept
2. Settings > Secrets and variables > Actions
3. **New repository secret**

**Secret 1: FIREBASE_SERVICE_ACCOUNT**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Copier TOUT le contenu du fichier JSON téléchargé à l'étape 5

**Secret 2: FIREBASE_TOKEN**
```bash
firebase login:ci
# Copier le token affiché
```
- Name: `FIREBASE_TOKEN`
- Value: Coller le token

---

### 7️⃣ Premier Déploiement Manuel (5 min)

```bash
# Build de production
npm run build

# Vérifier que dist/ existe et contient index.html
ls dist/

# Déployer
firebase deploy --only hosting
```

**Résultat attendu:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/intuitionconcept/overview
Hosting URL: https://intuitionconcept.web.app
```

---

### 8️⃣ Tester le Déploiement (2 min)

1. Ouvrir l'URL fournie
2. Vérifier que l'application charge
3. Tester la connexion Firebase
4. Vérifier les fonctionnalités de base

---

### 9️⃣ Activer le Déploiement Automatique (2 min)

```bash
# Commit et push
git add .
git commit -m "chore: configure Firebase Hosting"
git push
```

**La CI/CD va maintenant:**
1. Tester le code
2. Builder l'application
3. Déployer automatiquement sur Firebase

---

### 🔟 Vérifier le Déploiement Auto (2 min)

1. Aller sur https://github.com/HerbertGourout/IntuitionConcept/actions
2. Vérifier que le workflow passe
3. Vérifier que "Deploy to Production" est ✅

---

## ✅ Checklist Rapide

- [ ] Firebase CLI installé
- [ ] Connecté à Firebase
- [ ] Projet Firebase créé/sélectionné
- [ ] `firebase init` exécuté
- [ ] Service Account téléchargé
- [ ] Secret FIREBASE_SERVICE_ACCOUNT ajouté sur GitHub
- [ ] Secret FIREBASE_TOKEN ajouté sur GitHub
- [ ] Premier déploiement manuel réussi
- [ ] URL de production accessible
- [ ] Déploiement automatique activé
- [ ] Workflow GitHub Actions ✅

---

## 🚨 Problèmes Courants

### "Firebase command not found"
```bash
npm install -g firebase-tools
# Ou avec yarn
yarn global add firebase-tools
```

### "Permission denied"
```bash
# Windows: Exécuter PowerShell en admin
# Ou utiliser npx
npx firebase-tools deploy
```

### "Build failed"
```bash
# Vérifier les erreurs
npm run build
# Corriger les erreurs TypeScript/ESLint
npm run lint
```

### "Deploy failed - Missing secrets"
- Vérifier que les secrets sont bien ajoutés sur GitHub
- Vérifier l'orthographe exacte: `FIREBASE_SERVICE_ACCOUNT` et `FIREBASE_TOKEN`

---

## 🎯 Prochaines Étapes (Optionnel)

### Domaine Personnalisé
```bash
# Firebase Console > Hosting > Add custom domain
# Suivre les instructions DNS
```

### Monitoring
```bash
# Activer Performance Monitoring
# Firebase Console > Performance
```

### Analytics
```bash
# Activer Google Analytics
# Firebase Console > Analytics
```

---

## 📞 Aide

Si bloqué à une étape, partage-moi:
1. L'étape où tu es bloqué
2. Le message d'erreur exact
3. La commande exécutée


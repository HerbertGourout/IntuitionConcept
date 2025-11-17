# 🔥 Configuration Firebase Storage - Guide visuel

## ✅ Règles de sécurité prêtes

Le fichier `firebase-storage-rules.txt` contient les règles à copier.

---

## 🚀 Configuration en 3 minutes

### Étape 1: Ouvrir Firebase Console

1. Aller sur https://console.firebase.google.com/
2. Sélectionner votre projet "IntuitionConcept"
3. Menu latéral gauche → **Storage**

### Étape 2: Activer Storage (si pas encore fait)

**Si vous voyez "Get Started":**
1. Cliquer sur "Get Started"
2. Lire les conditions → Cliquer "Next"
3. Choisir la localisation:
   - **Recommandé:** `europe-west1` (Belgique)
   - Ou `us-central1` (USA)
4. Cliquer "Done"

**Résultat:** Bucket créé (ex: `intuitionconcept.appspot.com`)

### Étape 3: Configurer les règles de sécurité

1. Dans Storage, cliquer sur l'onglet **"Rules"** en haut
2. Vous verrez l'éditeur de règles
3. **Supprimer** tout le contenu existant
4. **Copier-coller** le contenu de `firebase-storage-rules.txt`

**Contenu à copier:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Documents d'étude structurale
    match /quotes/{quoteId}/structural-docs/{document} {
      // Lecture: utilisateurs authentifiés uniquement
      allow read: if request.auth != null;
      
      // Écriture: utilisateurs authentifiés + taille max 10MB
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024;
      
      // Suppression: utilisateurs authentifiés uniquement
      allow delete: if request.auth != null;
    }
    
    // Autres fichiers (logos, etc.)
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

5. Cliquer sur **"Publish"** (bouton bleu en haut à droite)
6. Confirmer la publication

**Résultat:** ✅ Règles publiées et actives

---

## 📁 Structure des fichiers

Vos documents seront organisés ainsi:

```
Storage Root
└── quotes/
    ├── DEVIS-123456/
    │   └── structural-docs/
    │       ├── 1730745600000_plan-structure.pdf
    │       ├── 1730745601000_note-calcul.pdf
    │       └── 1730745602000_rapport-geo.pdf
    │
    └── DEVIS-789012/
        └── structural-docs/
            ├── 1730745603000_plan.pdf
            └── 1730745604000_calcul.pdf
```

**Avantages:**
- ✅ Organisation claire par devis
- ✅ Noms de fichiers uniques (timestamp)
- ✅ Facile à retrouver
- ✅ Suppression automatique si devis supprimé

---

## 🧪 Tester l'upload

### Test 1: Upload manuel dans Firebase Console

1. Storage → Onglet "Files"
2. Créer un dossier: `quotes/TEST-001/structural-docs/`
3. Cliquer "Upload file"
4. Choisir un PDF de test
5. Vérifier qu'il apparaît dans la liste

**Résultat attendu:** ✅ Fichier uploadé avec succès

### Test 2: Upload depuis l'application

1. Lancer votre application
2. Aller dans "Devis"
3. Éditer un devis existant
4. Section "Étude Structurale" → "Documents d'étude"
5. Drag & drop un fichier PDF

**Résultat attendu:**
- ✅ Barre de progression
- ✅ Fichier apparaît dans la liste
- ✅ Visible dans Firebase Console → Storage

### Test 3: Vérifier dans Firebase Console

1. Firebase Console → Storage → Files
2. Naviguer vers `quotes/[VOTRE-DEVIS-ID]/structural-docs/`
3. Vérifier que le fichier est présent

**Résultat attendu:** ✅ Fichier visible avec timestamp

---

## 📊 Quotas et limites

### Plan Spark (Gratuit)
- **Stockage:** 5 GB
- **Téléchargements:** 1 GB/jour
- **Uploads:** 20,000/jour

### Plan Blaze (Pay as you go)
- **Stockage:** $0.026/GB/mois
- **Téléchargements:** $0.12/GB
- **Uploads:** Gratuit

**Recommandation:** Le plan gratuit est largement suffisant pour commencer.

---

## 🔒 Sécurité

### Ce qui est protégé
- ✅ Seuls les utilisateurs authentifiés peuvent lire/écrire
- ✅ Taille max 10MB par fichier
- ✅ Pas d'accès anonyme
- ✅ Chaque devis a son propre dossier

### Ce qui n'est PAS protégé
- ⚠️ Un utilisateur authentifié peut voir tous les documents
- ⚠️ Pas de restriction par rôle

### Améliorer la sécurité (Optionnel)

Pour restreindre par propriétaire:

```javascript
match /quotes/{quoteId}/structural-docs/{document} {
  allow read: if request.auth != null 
              && (request.auth.uid == resource.metadata.uploadedBy
                  || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  
  allow write: if request.auth != null;
  allow delete: if request.auth != null 
                && (request.auth.uid == resource.metadata.uploadedBy
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```

---

## 🐛 Dépannage

### Erreur: "Permission denied"
**Causes possibles:**
1. Règles pas encore publiées
2. Utilisateur non authentifié
3. Fichier trop volumineux (>10MB)

**Solutions:**
1. Vérifier que les règles sont publiées
2. Se connecter à l'application
3. Réduire la taille du fichier

### Erreur: "Storage bucket not configured"
**Solution:**
1. Vérifier que Storage est activé dans Firebase Console
2. Vérifier `firebase.ts` contient la config Storage

### Upload très lent
**Causes:**
1. Connexion internet lente
2. Fichier très volumineux
3. Serveur Firebase surchargé

**Solutions:**
1. Vérifier la connexion
2. Compresser le fichier
3. Réessayer plus tard

### Fichier n'apparaît pas
**Solutions:**
1. Rafraîchir la page
2. Vérifier la console navigateur pour erreurs
3. Vérifier Firebase Console → Storage

---

## 📱 Monitoring

### Voir l'utilisation

1. Firebase Console → Storage
2. Onglet "Usage"
3. Voir:
   - Stockage utilisé
   - Bande passante
   - Nombre d'opérations

### Alertes (Optionnel)

1. Firebase Console → Storage → Usage
2. Cliquer "Set up budget alerts"
3. Définir un seuil (ex: 80% du quota)
4. Recevoir email si dépassement

---

## ✅ Checklist de configuration

- [ ] Firebase Console ouverte
- [ ] Storage activé
- [ ] Bucket créé
- [ ] Règles de sécurité copiées depuis `firebase-storage-rules.txt`
- [ ] Règles publiées
- [ ] Test upload manuel réussi
- [ ] Test upload depuis app réussi
- [ ] Fichier visible dans Console

---

## 🎯 Prochaines étapes

1. ✅ Configurer Storage (3 min)
2. ✅ Tester upload (2 min)
3. ⏳ Utiliser dans l'application
4. ⏳ Monitorer l'utilisation

---

## 📸 Captures d'écran des étapes

### Étape 1: Menu Storage
```
Firebase Console
├── 🏠 Project Overview
├── 🔥 Firestore Database
├── 🔐 Authentication
├── 📦 Storage          ← Cliquer ici
├── 📊 Analytics
└── ⚙️ Settings
```

### Étape 2: Onglet Rules
```
Storage
├── Files
├── Rules              ← Cliquer ici
└── Usage
```

### Étape 3: Éditeur de règles
```
┌─────────────────────────────────────┐
│ rules_version = '2';                │
│ service firebase.storage {          │
│   match /b/{bucket}/o {             │
│     // Vos règles ici                │
│   }                                  │
│ }                                    │
└─────────────────────────────────────┘
        [Publish] ← Cliquer
```

---

**Firebase Storage configuré et prêt ! 🔥✅**

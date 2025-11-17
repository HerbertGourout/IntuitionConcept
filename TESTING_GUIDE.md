# 🧪 Guide de test - 4 premières fonctionnalités

## ✅ Prérequis

- [x] @emailjs/browser installé
- [ ] EmailJS configuré (voir `EMAILJS_SETUP.md`)
- [ ] Firebase Storage configuré (voir `FIREBASE_STORAGE_SETUP.md`)
- [ ] Application lancée (`npm run dev`)

---

## 1️⃣ Test Upload de documents

### Objectif
Vérifier que l'upload de documents fonctionne correctement.

### Étapes

#### A. Préparer des fichiers de test
1. Créer ou télécharger:
   - 1 fichier PDF (plan de structure)
   - 1 fichier DOC (note de calcul)
   - 1 image JPG (photo de chantier)

#### B. Accéder à l'interface
1. Lancer l'application: `npm run dev`
2. Se connecter
3. Aller dans **"Devis"**
4. Cliquer sur un devis existant (ou en créer un)
5. Scroller jusqu'à la section **"Étude Structurale"**

#### C. Tester l'upload par drag & drop
1. Localiser la section **"Documents d'étude"**
2. Vous devriez voir 5 zones d'upload:
   - 📐 Plan de structure
   - 🔢 Note de calcul
   - 🌍 Rapport géotechnique
   - 📸 Photo
   - 📄 Autre

3. **Drag & drop** le PDF dans "Plan de structure"
4. **Attendre** la barre de progression

**Résultats attendus:**
- ✅ Barre de progression apparaît
- ✅ Message "Document uploadé avec succès"
- ✅ Fichier apparaît dans la liste avec:
  - Nom du fichier
  - Taille (ex: 2.5 MB)
  - Date d'upload
  - Bouton de suppression (X)

#### D. Tester l'upload par clic
1. Cliquer sur la zone "Note de calcul"
2. Sélectionner le fichier DOC
3. Vérifier l'upload

#### E. Tester la suppression
1. Cliquer sur le bouton X d'un document
2. Confirmer la suppression
3. Vérifier que le document disparaît

#### F. Vérifier dans Firebase Console
1. Ouvrir Firebase Console → Storage
2. Naviguer vers `quotes/[DEVIS-ID]/structural-docs/`
3. Vérifier que les fichiers sont présents

### Critères de réussite
- [ ] Upload par drag & drop fonctionne
- [ ] Upload par clic fonctionne
- [ ] Fichiers apparaissent dans la liste
- [ ] Suppression fonctionne
- [ ] Fichiers visibles dans Firebase Console
- [ ] Taille et date affichées correctement

### Problèmes courants

**Erreur: "Permission denied"**
→ Vérifier que Firebase Storage est configuré (voir `FIREBASE_STORAGE_SETUP.md`)

**Upload ne démarre pas**
→ Vérifier la taille du fichier (max 10MB)

**Fichier n'apparaît pas**
→ Rafraîchir la page

---

## 2️⃣ Test Dashboard Analytics

### Objectif
Vérifier que le widget affiche les bonnes statistiques.

### Étapes

#### A. Créer des données de test
1. Créer 3 devis estimatifs:
   - Devis 1: Statut étude "none"
   - Devis 2: Statut étude "in_progress"
   - Devis 3: Statut étude "completed"

2. Créer 1 devis définitif:
   - Devis 4: Type "definitive"

#### B. Accéder au Dashboard
1. Aller sur la page **Dashboard**
2. Scroller vers le bas
3. Localiser le widget **"Études Structurales"**

#### C. Vérifier les métriques

**Vous devriez voir:**

```
┌─────────────────────────────────────────┐
│ 📊 Études Structurales                  │
│ Analytics & Suivi                       │
├─────────────────────────────────────────┤
│                                         │
│ Total devis: 4                          │
│ 3 estimatifs, 1 définitifs              │
│                                         │
│ Taux conversion: 33%                    │
│ Estimatif → Définitif                   │
│                                         │
│ Durée moyenne: 0j                       │
│ Études complétées                       │
│                                         │
│ En cours: 1                             │
│ 0 prévues                               │
│                                         │
├─────────────────────────────────────────┤
│ Études complétées: ████░░░░ 1           │
│ En cours:          ██░░░░░░ 1           │
│ Prévues:           ░░░░░░░░ 0           │
├─────────────────────────────────────────┤
│ ✓ Taux de conversion à améliorer (33%). │
│   Encouragez les clients à réaliser     │
│   les études.                            │
└─────────────────────────────────────────┘
```

#### D. Tester l'actualisation
1. Cliquer sur le bouton **"Actualiser"**
2. Vérifier que les données se rechargent

#### E. Modifier des données et vérifier
1. Changer le statut d'une étude
2. Actualiser le widget
3. Vérifier que les chiffres changent

### Critères de réussite
- [ ] Widget visible dans le Dashboard
- [ ] Total devis correct
- [ ] Taux de conversion calculé
- [ ] Barres de progression affichées
- [ ] Insights pertinents
- [ ] Bouton actualiser fonctionne

### Problèmes courants

**Widget vide**
→ Créer quelques devis de test

**Chiffres incorrects**
→ Vérifier que les devis ont bien les champs `quoteType` et `structuralStudy`

---

## 3️⃣ Test Notifications (Optionnel)

### Objectif
Vérifier que les emails sont envoyés correctement.

### Prérequis
- EmailJS configuré (voir `EMAILJS_SETUP.md`)

### Étapes

#### A. Test notification étude complétée

1. Ouvrir la console navigateur (F12)
2. Exécuter ce code:

```javascript
import StructuralNotificationService from './services/structuralNotificationService';

await StructuralNotificationService.notifyStudyCompleted(
  'DEVIS-TEST-001',
  'votre-email@example.com',  // ← Votre email
  'Votre Nom',
  'Test notification'
);
```

3. Vérifier votre boîte email

**Résultat attendu:**
- ✅ Console log: "✅ Email envoyé: étude complétée"
- ✅ Email reçu dans les 2 minutes

#### B. Test vérification études en retard

1. Créer un devis avec:
   - Statut: "in_progress"
   - Date début: Il y a 35 jours

2. Exécuter:
```javascript
await StructuralNotificationService.checkOverdueStudies();
```

3. Vérifier console logs

**Résultat attendu:**
- ✅ Console log: "⚠️ Étude en retard: [titre] ([id])"

### Critères de réussite
- [ ] Email de test reçu
- [ ] Contenu correct (titre, ID, etc.)
- [ ] Études en retard détectées
- [ ] Logs console corrects

### Problèmes courants

**Email non reçu**
→ Vérifier dossier spam
→ Vérifier configuration EmailJS

**Erreur "Service ID not found"**
→ Vérifier les IDs dans le code

---

## 4️⃣ Test Templates de provisions

### Objectif
Vérifier que les templates s'appliquent correctement.

### Étapes

#### A. Accéder à l'interface
1. Éditer un devis **estimatif**
2. Section "Étude Structurale"
3. Cliquer sur **"Appliquer un template de provisions"**

#### B. Vérifier le modal

**Vous devriez voir:**
```
┌─────────────────────────────────────────┐
│ 📄 Templates de Provisions              │
│ Sélectionnez un template pour           │
│ pré-remplir les provisions               │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Villa R+1   │ │ Villa R+2   │        │
│ │ Standard    │ │             │        │
│ │             │ │             │        │
│ │ 16M FCFA    │ │ 23.5M FCFA  │        │
│ └─────────────┘ └─────────────┘        │
│                                         │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Immeuble R+4│ │ Immeuble R+8│        │
│ │             │ │             │        │
│ │ 50M FCFA    │ │ 100M FCFA   │        │
│ └─────────────┘ └─────────────┘        │
│                                         │
│ ... 6 autres templates                  │
│                                         │
├─────────────────────────────────────────┤
│ [Annuler]    [Appliquer ce template]   │
└─────────────────────────────────────────┘
```

#### C. Sélectionner un template
1. Cliquer sur **"Villa R+1 Standard"**
2. Vérifier que:
   - Le template est surligné en violet
   - Un aperçu du disclaimer apparaît en bas
   - Le bouton "Appliquer" est activé

#### D. Voir le détail
**Pour Villa R+1, vous devriez voir:**
- Fondations: 5,000,000 FCFA
- Structure: 8,000,000 FCFA
- Ferraillage: 3,000,000 FCFA
- **Total: 16,000,000 FCFA**

#### E. Appliquer le template
1. Cliquer sur **"Appliquer ce template"**
2. Vérifier la console navigateur

**Résultat attendu:**
- ✅ Console log: "Provisions sélectionnées: {...}"
- ✅ Modal se ferme
- ✅ Toast "Template appliqué" (si implémenté)

#### F. Tester tous les templates
Répéter pour chaque template:
1. Villa R+1 Standard - 16M
2. Villa R+2 - 23.5M
3. Immeuble R+4 - 50M
4. Immeuble R+8 - 100M
5. Extension Simple - 7.5M
6. Extension Complexe - 13.5M
7. Rénovation Légère - 5M
8. Rénovation Lourde - 14M
9. Hangar Industriel - 35M
10. Bâtiment Commercial - 42M

### Critères de réussite
- [ ] Modal s'ouvre correctement
- [ ] 10 templates affichés
- [ ] Sélection fonctionne (surbrillance)
- [ ] Détails corrects (montants, descriptions)
- [ ] Aperçu disclaimer visible
- [ ] Application fonctionne
- [ ] Console log correct

### Problèmes courants

**Modal ne s'ouvre pas**
→ Vérifier que c'est un devis estimatif (pas définitif)

**Templates vides**
→ Vérifier que `provisionTemplates.ts` existe

**Montants incorrects**
→ Vérifier le fichier `provisionTemplates.ts`

---

## 📊 Tableau récapitulatif des tests

| Fonctionnalité | Test | Statut | Notes |
|----------------|------|--------|-------|
| **Upload documents** | Drag & drop | ⏳ | |
| | Upload clic | ⏳ | |
| | Suppression | ⏳ | |
| | Firebase Storage | ⏳ | |
| **Dashboard Analytics** | Affichage widget | ⏳ | |
| | Métriques correctes | ⏳ | |
| | Actualisation | ⏳ | |
| **Notifications** | Email test | ⏳ | Optionnel |
| | Études en retard | ⏳ | Optionnel |
| **Templates** | Modal ouverture | ⏳ | |
| | Sélection template | ⏳ | |
| | Application | ⏳ | |

---

## 🎯 Scénario de test complet

### Workflow réaliste (15 minutes)

1. **Créer un nouveau devis estimatif**
   - Titre: "Construction Villa R+2 - M. Dupont"
   - Client: Jean Dupont
   - Type: Preliminary

2. **Appliquer un template de provisions**
   - Ouvrir modal templates
   - Sélectionner "Villa R+2"
   - Appliquer

3. **Ajouter des documents**
   - Upload plan de structure (PDF)
   - Upload note de calcul (DOC)
   - Upload photo terrain (JPG)

4. **Changer le statut de l'étude**
   - Statut: "in_progress"
   - Ingénieur: "Ing. Martin KOUASSI"
   - Date début: Aujourd'hui

5. **Vérifier le Dashboard**
   - Aller sur Dashboard
   - Vérifier que le nouveau devis apparaît
   - Vérifier "En cours: 1"

6. **Compléter l'étude**
   - Retour sur le devis
   - Statut: "completed"
   - Date fin: Aujourd'hui

7. **Convertir en définitif**
   - Cliquer "Convertir en Devis Définitif"
   - Vérifier marge réduite à 10%

8. **Vérifier le Dashboard final**
   - Taux de conversion augmenté
   - Étude complétée +1

### Résultat attendu
✅ Workflow complet fonctionnel de bout en bout

---

## 🐛 Problèmes courants globaux

### Application ne démarre pas
```bash
# Solution
npm install
npm run dev
```

### Erreurs TypeScript
→ Normal, quelques warnings `any` sans impact

### Firebase non configuré
→ Vérifier `firebase.ts` et `.env`

### Composants non trouvés
→ Vérifier les imports et chemins

---

## ✅ Checklist finale

### Configuration
- [ ] @emailjs/browser installé
- [ ] EmailJS configuré (optionnel)
- [ ] Firebase Storage configuré
- [ ] Application lancée

### Tests fonctionnalités
- [ ] Upload documents testé
- [ ] Dashboard Analytics testé
- [ ] Notifications testées (optionnel)
- [ ] Templates provisions testés

### Vérifications
- [ ] Aucune erreur console bloquante
- [ ] Données sauvegardées dans Firestore
- [ ] Fichiers dans Firebase Storage
- [ ] Workflow complet réussi

---

## 📞 Besoin d'aide ?

### Documentation
- `EMAILJS_SETUP.md` - Configuration emails
- `FIREBASE_STORAGE_SETUP.md` - Configuration Storage
- `COMPLETE_IMPLEMENTATION.md` - Vue d'ensemble
- `QUICK_START_GUIDE.md` - Guide rapide

### Logs utiles
Ouvrir console navigateur (F12) pour voir:
- ✅ Succès: Messages verts
- ⚠️ Warnings: Messages jaunes
- ❌ Erreurs: Messages rouges

---

**Tests prêts à exécuter ! 🧪✅**

*Temps estimé: 30 minutes pour tout tester*

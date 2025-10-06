# 🔍 Vérification des Données Mockées

## Comment Identifier les Données Mockées

### Patterns à Rechercher dans le Code

#### 1. Tableaux de Données Hardcodés
```typescript
// ❌ MAUVAIS - Données mockées
const equipment = [
  { id: '1', name: 'Excavatrice', ... },
  { id: '2', name: 'Grue', ... }
];

// ✅ BON - Données depuis Firebase
const { equipment } = useProjectEquipment(currentProject?.id);
```

#### 2. Données de Test Initialisées
```typescript
// ❌ MAUVAIS
useEffect(() => {
  const testData = [/* ... */];
  setEquipment(testData);
}, []);

// ✅ BON
useEffect(() => {
  if (!projectId) return;
  loadDataFromFirebase(projectId);
}, [projectId]);
```

#### 3. Constantes Mock
```typescript
// ❌ MAUVAIS
const MOCK_TRANSACTIONS = [/* ... */];
const SAMPLE_DATA = [/* ... */];
const DUMMY_EQUIPMENT = [/* ... */];

// ✅ BON - Pas de constantes mock
```

## Checklist de Vérification par Module

### ✅ Equipment
- [ ] Pas de tableau hardcodé d'équipements
- [ ] Utilise `useProjectEquipment(projectId)`
- [ ] Affiche état vide si aucun équipement
- [ ] Filtre par projet actuel

**Commande de recherche**:
```bash
# Chercher les données mockées dans Equipment
grep -r "const.*equipment.*=.*\[" src/components/Equipment/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Equipment/
```

### ✅ Documents
- [ ] Pas de tableau hardcodé de documents
- [ ] Utilise `useProjectDocuments(projectId)`
- [ ] Affiche état vide si aucun document
- [ ] Filtre par projet actuel

**Commande de recherche**:
```bash
grep -r "const.*documents.*=.*\[" src/components/Documents/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Documents/
```

### ✅ Finances
- [ ] Pas de transactions hardcodées
- [ ] Utilise `useProjectTransactions(projectId)`
- [ ] Calculs depuis vraies données
- [ ] Pas de prévisions fictives

**Commande de recherche**:
```bash
grep -r "const.*transactions.*=.*\[" src/components/Finances/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Finances/
```

### ✅ Dashboard
- [ ] Pas de statistiques hardcodées
- [ ] Utilise `useProjectStats(projectId)`
- [ ] Widgets utilisent données réelles
- [ ] Pas d'anomalies fictives

**Commande de recherche**:
```bash
grep -r "const.*stats.*=.*{" src/components/Dashboard/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Dashboard/
```

### ✅ Devis (Quotes)
- [ ] Pas de devis hardcodés
- [ ] Utilise `useProjectQuotes(projectId)`
- [ ] Filtre par projet actuel
- [ ] Affiche état vide si aucun devis

**Commande de recherche**:
```bash
grep -r "const.*quotes.*=.*\[" src/components/Quotes/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Quotes/
```

### ✅ Bons d'Achat (Purchase Orders)
- [ ] Pas de bons hardcodés
- [ ] Utilise `useProjectPurchaseOrders(projectId)`
- [ ] Filtre par projet actuel
- [ ] Affiche état vide si aucun bon

**Commande de recherche**:
```bash
grep -r "const.*purchaseOrders.*=.*\[" src/components/PurchaseOrders/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/PurchaseOrders/
```

### ✅ Localisations
- [ ] Pas de localisations hardcodées
- [ ] Utilise `useProjectLocations(projectId)`
- [ ] Filtre par projet actuel
- [ ] Affiche état vide si aucune localisation

**Commande de recherche**:
```bash
grep -r "const.*locations.*=.*\[" src/components/Locations/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Locations/
```

### ✅ Équipe (Team)
- [ ] Pas de membres hardcodés
- [ ] Utilise `currentProject.team`
- [ ] Affiche état vide si aucun membre
- [ ] Modifications sauvegardées dans projet

**Commande de recherche**:
```bash
grep -r "const.*team.*=.*\[" src/components/Team/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Team/
```

### ✅ Rapports (Reports)
- [ ] Pas de données hardcodées
- [ ] Calculs depuis données réelles
- [ ] Graphiques basés sur vraies données
- [ ] Export reflète données réelles

**Commande de recherche**:
```bash
grep -r "const.*data.*=.*\[" src/components/Reports/
grep -r "MOCK\|SAMPLE\|DUMMY" src/components/Reports/
```

## Tests de Validation

### Test 1: Nouveau Projet Vide
1. Créer un nouveau projet
2. Ne remplir que: nom, description, dates, budget
3. Vérifier chaque module:
   - ✅ Equipment: doit être vide
   - ✅ Documents: doit être vide
   - ✅ Finances: doit être vide
   - ✅ Devis: doit être vide
   - ✅ Bons d'achat: doit être vide
   - ✅ Localisations: doit être vide
   - ✅ Équipe: doit être vide
   - ✅ Dashboard: stats à 0

### Test 2: Isolation entre Projets
1. Créer Projet A avec des données
2. Créer Projet B vide
3. Vérifier que Projet B ne contient aucune donnée de Projet A
4. Ajouter des données à Projet B
5. Vérifier que Projet A n'a pas les données de Projet B

### Test 3: Suppression de Projet
1. Créer un projet avec des données
2. Supprimer le projet
3. Créer un nouveau projet
4. Vérifier que le projet supprimé ne réapparaît pas
5. Vérifier que le nouveau projet est vide

### Test 4: Synchronisation Nom Client
1. Créer un projet avec nom client "Client A"
2. Vérifier que "Client A" apparaît dans:
   - Dashboard
   - Détails du projet
   - Devis
   - Rapports
   - Tous les composants affichant le client
3. Modifier le nom en "Client B"
4. Vérifier que "Client B" apparaît partout

## Résultats Attendus

### ✅ Projet Vide
Tous les modules doivent afficher:
- État vide élégant (EmptyState)
- Message explicatif
- Bouton d'action pour ajouter des données
- Aucune donnée mockée

### ✅ Isolation Complète
- Chaque projet a ses propres données
- Aucun partage de données entre projets
- Suppression propre sans réapparition

### ✅ Synchronisation Client
- Nom client identique partout
- Mise à jour en temps réel
- Pas de valeurs hardcodées

## Outils de Vérification Automatique

### Script PowerShell
```powershell
# Chercher toutes les données mockées
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | 
  Select-String -Pattern "MOCK|SAMPLE|DUMMY|const.*=.*\[.*{.*id:" |
  Select-Object Path, LineNumber, Line
```

### Script Bash/Linux
```bash
# Chercher toutes les données mockées
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -Hn "MOCK\|SAMPLE\|DUMMY\|const.*=.*\[.*{.*id:" {} \;
```

## Actions Correctives

### Si Données Mockées Trouvées
1. Identifier le fichier et la ligne
2. Consulter GUIDE_MIGRATION.md
3. Appliquer le pattern de migration approprié
4. Tester avec un projet vide
5. Vérifier l'isolation entre projets

### Si Bug de Synchronisation Client
1. Vérifier l'utilisation de `currentProject.client`
2. S'assurer qu'il n'y a pas de valeur hardcodée
3. Tester la modification du nom client
4. Vérifier tous les composants affichant le client

### Si Bug de Suppression
1. Vérifier que `deleteProject` supprime de l'état local d'abord
2. Vérifier que `ProjectDataService.deleteAllProjectData` est appelé
3. Vérifier que le listener Firebase ne recharge pas les projets supprimés
4. Tester avec plusieurs projets

## Rapport de Vérification

### Template de Rapport
```markdown
# Rapport de Vérification - [Date]

## Modules Vérifiés
- [ ] Equipment
- [ ] Documents
- [ ] Finances
- [ ] Dashboard
- [ ] Devis
- [ ] Bons d'Achat
- [ ] Localisations
- [ ] Équipe
- [ ] Rapports

## Tests Effectués
- [ ] Test 1: Nouveau projet vide
- [ ] Test 2: Isolation entre projets
- [ ] Test 3: Suppression de projet
- [ ] Test 4: Synchronisation nom client

## Problèmes Identifiés
1. [Module] - [Description du problème]
2. [Module] - [Description du problème]

## Actions Correctives Appliquées
1. [Module] - [Correction appliquée]
2. [Module] - [Correction appliquée]

## Résultat Final
- [ ] Aucune donnée mockée
- [ ] Isolation complète par projet
- [ ] Suppression fonctionne correctement
- [ ] Synchronisation client OK
```

---

**Note**: Utilisez ce document comme checklist pour vérifier que toutes les données mockées ont été éliminées et que l'isolation par projet fonctionne correctement.

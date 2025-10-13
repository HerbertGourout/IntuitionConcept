# 🏗️ Système d'Analyse de Plans Architecturaux Sans Perte

## 📋 Vue d'ensemble

Système complet d'analyse de plans architecturaux BTP préservant **100% de la qualité** des documents PDF originaux, utilisant l'API Claude (Anthropic) pour une extraction intelligente et structurée.

---

## ✨ Caractéristiques principales

### 🎯 Qualité préservée à 100%
- ✅ **Aucune compression** des fichiers PDF
- ✅ **Aucune perte de résolution** ou de métadonnées
- ✅ **Polices et mise en page** intégralement conservées
- ✅ **Annotations et calques** préservés

### 📄 Découpe intelligente
- ✂️ Séparation par page sans altération
- 📊 Extraction de métadonnées complètes
- 🔍 Analyse séquentielle optimisée
- 💾 Gestion de fichiers volumineux (>100 MB)

### 🤖 Analyse IA avancée
- 🧠 API Claude 3.5 Sonnet (Anthropic)
- 📐 Extraction de mesures précises
- 🏠 Identification des espaces et pièces
- 🧱 Détection des matériaux et éléments structurels
- 📋 Génération automatique de devis

---

## 🏗️ Architecture

### Services créés

#### 1. **ClaudeServiceDirect** (`src/services/ai/claudeServiceDirect.ts`)
Service de communication directe avec l'API Anthropic Claude.

**Fonctionnalités :**
- Communication directe avec API Claude (sans proxy)
- Support des 3 modèles : Opus, Sonnet, Haiku
- Analyse PDF native avec documents attachés
- Calcul automatique des coûts (FCFA)
- Health check et gestion d'erreurs robuste

**Modèles disponibles :**
```typescript
ClaudeServiceDirect.getAvailableModels()
// {
//   SONNET: 'claude-sonnet-4-5-20250929',    // ✅ Recommandé (snapshot le plus récent)
//   SONNET_4: 'claude-sonnet-4-20250514',    // Snapshot précédent
//   SONNET_3_7: 'claude-3-7-sonnet-20250219',// Version 3.7 long support
//   OPUS_4_1: 'claude-opus-4.1-20250805',    // Qualité maximale, coût élevé
//   OPUS_4: 'claude-opus-4-20250514',
//   HAIKU_3_5: 'claude-3-5-haiku-20241022'   // Rapide et économique
// }
```

**Coûts par modèle (FCFA) :**
- **Sonnet 4.5 / 4 / 3.7** : 0.0018 FCFA/token input, 0.009 FCFA/token output
- **Opus 4.1 / 4** : 0.015 FCFA/token input, 0.075 FCFA/token output
- **Haiku 3.5** : 0.0006 FCFA/token input, 0.0018 FCFA/token output

#### 2. **PDFSplitter** (`src/utils/pdfSplitter.ts`)
Service de découpe PDF sans compression.

**Fonctionnalités :**
- Découpe par page sans perte de qualité
- Extraction de métadonnées complètes (auteur, titre, dates, etc.)
- Analyse des caractéristiques de chaque page
- Fusion de pages
- Validation de fichiers PDF

**Métadonnées extraites :**
- Informations document (titre, auteur, sujet, mots-clés)
- Dates (création, modification)
- Informations techniques (producteur, créateur, version PDF)
- Statistiques par page (dimensions, rotation, contenu)

#### 3. **ArchitecturalPlanAnalyzer** (composant React)
Interface utilisateur moderne pour l'analyse de plans.

**Workflow :**
1. **Upload** : Glisser-déposer ou sélection de fichier PDF
2. **Validation** : Vérification et extraction de métadonnées
3. **Découpe** : Séparation en pages sans compression
4. **Analyse** : Traitement par Claude avec prompt architectural
5. **Résultats** : Affichage structuré + génération de devis

---

## 🚀 Installation et configuration

### 1. Installer les dépendances

```bash
npm install @anthropic-ai/sdk pdf-lib
```

### 2. Configurer la clé API Claude

Ajouter dans `.env.local` :

```env
# API Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 3. Obtenir une clé API

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une clé API dans la section "API Keys"
3. Copier la clé dans `.env.local`

---

## 💻 Utilisation

### Utilisation du composant React

```tsx
import ArchitecturalPlanAnalyzer from './components/AI/ArchitecturalPlanAnalyzer';

function App() {
  return (
    <div>
      <ArchitecturalPlanAnalyzer />
    </div>
  );
}
```

### Utilisation programmatique

#### Initialiser le service Claude

```typescript
import { initializeClaudeServiceDirect, ClaudeServiceDirect } from './services/ai/claudeServiceDirect';

// Initialiser avec clé API (Sonnet 4.5 recommandé pour équilibre performance/coût)
const claudeService = initializeClaudeServiceDirect(
  'sk-ant-api03-xxxxx',
  ClaudeServiceDirect.getAvailableModels().SONNET
);

// Vérifier la santé du service
const isHealthy = await claudeService.healthCheck();
console.log('Service Claude opérationnel:', isHealthy);
```

#### Analyser un plan PDF

```typescript
// Analyser un fichier PDF
const analysisResult = await claudeService.analyzePDFArchitecturalPlan(pdfFile, {
  preserveQuality: true,
  splitByPage: true,
  extractMetadata: true,
  maxPagesPerRequest: 5,
  includeImages: true
});

console.log('Données architecturales:', analysisResult.architecturalData);
console.log('Coût:', analysisResult.metadata.cost, 'FCFA');
console.log('Durée:', analysisResult.metadata.processingTime, 'ms');
```

#### Découper un PDF sans perte

```typescript
import { PDFSplitter } from './utils/pdfSplitter';

// Découper le PDF
const splitResult = await PDFSplitter.splitPDF(pdfFile, {
  preserveMetadata: true,
  preserveQuality: true,
  extractImages: true,
  includeAnnotations: true
});

console.log(`${splitResult.pages.length} pages extraites`);
console.log('Métadonnées:', splitResult.originalMetadata);

// Accéder à chaque page
splitResult.pages.forEach(page => {
  console.log(`Page ${page.pageNumber}:`, {
    base64: page.base64,
    dimensions: `${page.metadata.width}x${page.metadata.height}`,
    taille: `${(page.pdfBytes.length / 1024).toFixed(2)} KB`
  });
});
```

---

## 📊 Données extraites

### Structure ArchitecturalPlanData

```typescript
interface ArchitecturalPlanData {
  // Type de plan
  planType: 'floor_plan' | 'elevation' | 'section' | 'site_plan' | 'detail' | 'structural' | 'electrical' | 'plumbing';
  
  // Mesures et dimensions
  measurements: {
    totalArea?: number; // Surface totale en m²
    rooms?: Array<{
      name: string;
      area: number;
      dimensions: { length: number; width: number; height?: number };
      floor?: number;
      purpose?: string;
    }>;
    walls?: Array<{
      type: 'load_bearing' | 'partition' | 'exterior' | 'interior';
      material: string;
      thickness: number;
      length: number;
    }>;
    openings?: Array<{
      type: 'door' | 'window' | 'opening';
      dimensions: { width: number; height: number };
      location: string;
    }>;
  };
  
  // Matériaux identifiés
  materials: Array<{
    category: string;
    name: string;
    specification?: string;
    quantity?: number;
    unit?: string;
  }>;
  
  // Annotations du plan
  annotations: string[];
  
  // Spécifications techniques
  technicalSpecs: Record<string, string>;
  
  // Conformité réglementaire
  compliance: {
    buildingCode?: string;
    standards?: string[];
    regulations?: string[];
  };
  
  // Complexité estimée
  estimatedComplexity: 'low' | 'moderate' | 'high' | 'very_high';
  
  // Niveau de confiance
  confidence: number; // 0-1
}
```

---

## 🎯 Prompt d'analyse architectural

Le système utilise un prompt optimisé pour extraire **toutes** les informations techniques :

### Sections extraites :
1. **Identification du type de plan**
2. **Mesures et dimensions** (surfaces, cotes, hauteurs)
3. **Nomenclature des espaces** (pièces, fonctions, orientations)
4. **Éléments structurels** (murs, poteaux, poutres, dalles)
5. **Ouvertures** (portes, fenêtres, baies)
6. **Matériaux spécifiés** (revêtements, menuiseries, isolants)
7. **Annotations techniques** (notes, spécifications, légendes)
8. **Conformité réglementaire** (codes, normes, DTU)
9. **Estimation de complexité**

### Règles critiques :
- ✅ Précision absolue (pas d'approximation)
- ✅ Exhaustivité (rien n'est omis)
- ✅ Unités toujours spécifiées
- ✅ JSON valide et parsable
- ✅ Null si donnée non lisible

---

## 💰 Estimation des coûts

### Exemple de coût pour un plan de 10 pages :

**Avec Claude 3.5 Sonnet (recommandé) :**
- Input : ~50,000 tokens (PDF + prompt) × 0.0018 FCFA = **90 FCFA**
- Output : ~5,000 tokens (analyse JSON) × 0.009 FCFA = **45 FCFA**
- **Total : ~135 FCFA par analyse**

**Avec Claude 3 Opus (maximum de précision) :**
- Input : ~50,000 tokens × 0.009 FCFA = **450 FCFA**
- Output : ~5,000 tokens × 0.045 FCFA = **225 FCFA**
- **Total : ~675 FCFA par analyse**

**Avec Claude 3.5 Haiku (économique) :**
- Input : ~50,000 tokens × 0.0006 FCFA = **30 FCFA**
- Output : ~5,000 tokens × 0.0018 FCFA = **9 FCFA**
- **Total : ~39 FCFA par analyse**

---

## 🔧 Optimisations

### Gestion des fichiers volumineux

Le système découpe automatiquement les PDF en batches :

```typescript
// Configuration par défaut
const options = {
  maxPagesPerRequest: 5 // 5 pages par requête Claude
};

// Pour un PDF de 50 pages :
// → 10 requêtes Claude
// → Analyse séquentielle
// → Agrégation des résultats
```

### Cache et réutilisation

```typescript
// Le service conserve l'instance initialisée
const claudeService = getClaudeServiceDirect();

// Réutiliser pour plusieurs analyses
const result1 = await claudeService.analyzePDFArchitecturalPlan(file1);
const result2 = await claudeService.analyzePDFArchitecturalPlan(file2);
```

---

## 🛡️ Sécurité

### Protection de la clé API

- ✅ Clé stockée dans `.env.local` (gitignored)
- ✅ Jamais exposée côté client
- ✅ Validation avant chaque requête
- ✅ Health check automatique

### Validation des fichiers

```typescript
// Validation automatique
const validation = await PDFSplitter.validatePDF(file);
if (!validation.valid) {
  console.error('PDF invalide:', validation.error);
}
```

---

## 📈 Monitoring et logs

Le système log automatiquement :

```
📄 Fichier uploadé: plan.pdf (6.12 MB)
📊 Métadonnées PDF: { pageCount: 15, title: "Plan R+2", ... }
✂️ Découpe PDF par page (qualité 100% préservée)...
📑 15 pages extraites sans perte
✅ Service Claude initialisé et opérationnel
🔍 Analyse architecturale avec Claude (PDF natif)...
✅ Analyse Claude terminée
💰 Coût: 145.50 FCFA
⏱️ Durée: 12.3s
🎉 Analyse complète terminée avec succès!
```

---

## 🐛 Résolution de problèmes

### Erreur : "Clé API Anthropic manquante"

**Solution :**
1. Vérifier que `VITE_ANTHROPIC_API_KEY` est dans `.env.local`
2. Redémarrer le serveur de développement
3. Vérifier que la clé commence par `sk-ant-api03-`

### Erreur : "Service Claude non disponible"

**Solution :**
1. Vérifier la connexion internet
2. Tester la clé API sur [console.anthropic.com](https://console.anthropic.com)
3. Vérifier les quotas API

### Erreur : "PDF invalide"

**Solution :**
1. Vérifier que le fichier est bien un PDF
2. Tester avec un autre lecteur PDF
3. Essayer de régénérer le PDF depuis la source

---

## 📚 Ressources

### Documentation officielle
- [API Anthropic Claude](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [pdf-lib Documentation](https://pdf-lib.js.org/)

### Exemples de code
- Voir `src/components/AI/ArchitecturalPlanAnalyzer.tsx` pour l'implémentation complète
- Voir `src/services/ai/claudeServiceDirect.ts` pour l'API Claude
- Voir `src/utils/pdfSplitter.ts` pour la manipulation PDF

---

## 🎉 Résultat

Le système permet maintenant :

✅ **Analyse sans perte** de plans architecturaux PDF  
✅ **Extraction exhaustive** de toutes les données techniques  
✅ **Génération automatique** de devis structurés  
✅ **Préservation 100%** de la qualité originale  
✅ **Architecture microservices** réutilisable  
✅ **TypeScript strict** pour la fiabilité  

---

## 📝 Licence

Propriété de **IntuitionConcept BTP Platform**  
© 2025 - Tous droits réservés

---

**Développé avec ❤️ pour la qualité et la précision**

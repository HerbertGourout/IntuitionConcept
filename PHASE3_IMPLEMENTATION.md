# Phase 3 - Templates Vues Extérieures ✅

## Résumé

Phase 3 complétée : **Templates optimisés pour vues extérieures + Données mock pour tests**

## Fichiers créés

### 1. **exteriorViewTemplates.ts** (500+ lignes)
Service de templates avancés pour vues extérieures avec:
- ✅ Templates façades (principale jour/nuit, secondaire)
- ✅ Templates vues aériennes (oblique, frontale)
- ✅ Templates aménagements paysagers (jardin, piscine, terrasse)
- ✅ Prompts optimisés par type de vue
- ✅ Recommandations modèles par vue
- ✅ Calcul steps d'inférence selon qualité
- ✅ Negative prompts spécialisés

**Fonctionnalités:**
- Prompts riches intégrant analyse (matériaux, ouvertures, style)
- Camera settings par template (distance, angle, FOV)
- Quality multipliers pour ajuster les steps
- Génération automatique de toutes les vues extérieures

### 2. **mockAnalysisData.ts** (600+ lignes)
Données mock complètes pour tests avec:
- ✅ Villa moderne méditerranéenne (330m²)
- ✅ Maison traditionnelle (220m²)
- ✅ Immeuble contemporain 4 étages (740m²)

**Contenu par mock:**
- Projet (style, matériaux, palette couleurs)
- 4 façades (principale, secondaire, arrière, côté)
- 2-4 niveaux avec surfaces
- 8-10 pièces détaillées (salon, cuisine, chambres, SDB)
- Ouvertures (fenêtres, portes, escaliers)
- Aménagements paysagers (jardin, terrasse, piscine)
- Détails techniques (surfaces, dimensions, étages)

### 3. **viewSpecGenerator.ts** (mis à jour)
Intégration des templates extérieurs:
- ✅ Import `exteriorViewTemplates`
- ✅ Méthode `generateExteriorViews` utilise templates
- ✅ Association automatique pages → vues
- ✅ Version legacy conservée pour référence

## Architecture Phase 3

```
ArchitecturalAnalysis (mock ou Claude)
    ↓
viewSpecGenerator.generateViewSpecs()
    ↓
generateExteriorViews()
    ↓
exteriorViewTemplates.generateExteriorViews()
    ├─ Façades (principale, secondaire, arrière, côté)
    ├─ Vues aériennes (oblique, frontale)
    └─ Aménagements (jardin, terrasse, piscine)
    ↓
ViewSpec[] avec prompts optimisés
    ↓
batchRenderOrchestrator
    ↓
enrichedPromptBuilder (utilise templates)
    ↓
render3DService (Replicate)
```

## Templates de prompts

### Façade Principale - Jour
```
Professional architectural elevation rendering, main facade front view,
{style} architecture style, materials: {materials}, {windows} windows precisely placed,
{doors} entrance doors, accurate proportions from architectural plan,
symmetrical composition, bright daylight, clear blue sky, natural shadows,
photorealistic, 8K resolution, architectural photography, sharp details,
professional lighting, no distortion, accurate geometry
```

### Façade Principale - Nuit
```
Professional architectural elevation rendering, main facade front view at night,
{style} architecture, materials: {materials}, warm interior lighting through windows,
exterior architectural lighting, ambient illumination, night scene, dark blue sky,
subtle stars, dramatic lighting, photorealistic, 8K resolution,
professional night photography, accurate geometry, no distortion
```

### Vue Aérienne Oblique
```
Professional architectural aerial rendering, oblique birds eye view, 45-degree angle,
{style} building architecture, site context with {landscaping},
building massing showing all facades, accurate proportions, {area}m² site,
surrounding landscape, property boundaries, access roads, natural daylight,
soft shadows, realistic vegetation, photorealistic, 8K resolution,
drone photography style, clear composition, professional architectural visualization
```

### Aménagements Paysagers
```
Professional landscape architectural rendering, outdoor living spaces,
{style} architecture integration, {features: jardin/piscine/terrasse},
natural daylight, realistic vegetation, accurate scale, photorealistic,
8K resolution, landscape photography style, harmonious integration with building
```

## Modèles recommandés par type

| Type de vue | Modèle | Raison |
|------------|--------|--------|
| Façades | `flux-1.1-pro` | Fidélité géométrique maximale |
| Aériennes | `flux-pro` | Bon équilibre qualité/style |
| Paysage | `seedream-4` | Excellent pour végétation |
| Intérieurs | `imagen-4` | Photoréalisme lumière |

## Quality Multipliers

| Template | Multiplier | Steps (HD) |
|----------|-----------|-----------|
| Façade principale | 1.5x | 75 |
| Façade secondaire | 1.2x | 60 |
| Aérienne oblique | 1.3x | 65 |
| Aérienne frontale | 1.2x | 60 |
| Paysage | 1.2x | 60 |

## Utilisation des mocks

### Test rapide avec mock
```typescript
import { mockVillaModerne } from './mockAnalysisData';
import { viewSpecGenerator } from './viewSpecGenerator';

// Générer specs avec mock
const viewSpec = viewSpecGenerator.generateViewSpecs(
  mockVillaModerne,
  pageClassifications,
  selectedPages,
  {
    includeVariants: true,
    quality: 'hd',
    generateExteriors: true,
    generateInteriors: false
  }
);

// viewSpec.views contient toutes les vues extérieures optimisées
```

### Vues générées pour Villa Moderne
- Façade principale (jour + nuit)
- Façade secondaire (jour + nuit)
- Façade arrière (jour + nuit)
- Façade côté (jour + nuit)
- Vue aérienne oblique
- Vue aérienne frontale
- Aménagements paysagers (jardin, terrasse, piscine)

**Total: 11 vues extérieures**

## Exemples de prompts générés

### Villa Moderne - Façade Principale Jour
```
Professional architectural elevation rendering, main facade front view,
moderne architecture style, materials: béton blanc, verre, bois,
12 windows precisely placed, 2 entrance doors,
accurate proportions from architectural plan, symmetrical composition,
bright daylight, clear blue sky, natural shadows, photorealistic,
8K resolution, architectural photography, sharp details,
professional lighting, no distortion, accurate geometry
```

### Villa Moderne - Vue Aérienne
```
Professional architectural aerial rendering, oblique birds eye view, 45-degree angle,
moderne building architecture, site context with jardin, terrasse, piscine, acces, pergola, vegetation,
building massing showing all facades, accurate proportions, 800m² site,
surrounding landscape, property boundaries, access roads, natural daylight,
soft shadows, realistic vegetation, photorealistic, 8K resolution,
drone photography style, clear composition
```

## Intégration avec enrichedPromptBuilder

Le `enrichedPromptBuilder` utilise maintenant les templates:

```typescript
// Dans batchRenderOrchestrator
const template = exteriorViewTemplates.getTemplate(viewSpec.type);
if (template) {
  const { prompt, negativePrompt } = exteriorViewTemplates.buildEnrichedPrompt(
    template,
    analysis,
    facade
  );
  // Utiliser prompt enrichi pour génération
}
```

## Tests recommandés

### Test 1: Mock Villa Moderne
1. Utiliser `mockVillaModerne`
2. Générer toutes vues extérieures
3. Vérifier prompts riches (matériaux, ouvertures)
4. Comparer qualité vs prompts génériques

### Test 2: Mock Maison Traditionnelle
1. Utiliser `mockMaisonTraditionnelle`
2. Vérifier adaptation style (pierre, bois, tuiles)
3. Vérifier prompts spécifiques (poutres, cheminée)

### Test 3: Mock Immeuble Contemporain
1. Utiliser `mockImmeubleContemporain`
2. Vérifier échelle (4 étages, 740m²)
3. Vérifier prompts balcons, brise-soleil

## Avantages des templates

### Qualité des prompts
- ✅ Prompts spécialisés par type de vue
- ✅ Intégration automatique analyse (matériaux, ouvertures)
- ✅ Contraintes techniques explicites (proportions, géométrie)
- ✅ Negative prompts ciblés par vue

### Flexibilité
- ✅ Ajout facile de nouveaux templates
- ✅ Paramètres camera configurables
- ✅ Quality multipliers ajustables
- ✅ Modèles recommandés par type

### Maintenance
- ✅ Prompts centralisés (pas dispersés)
- ✅ Réutilisables entre projets
- ✅ Faciles à optimiser/tester
- ✅ Documentation intégrée

## Prochaines étapes (Phase 5)

### Templates intérieurs
- [ ] Templates par type de pièce (salon, cuisine, chambres, SDB)
- [ ] Vues large + détail
- [ ] Styles déco (minimaliste, cosy, luxueux)
- [ ] Modes éclairage (natural, spots, LED)

### Détection pièces
- [ ] Heuristiques OCR pour identifier pièces
- [ ] Mapping pièces → vues intérieures
- [ ] Focus points par type de pièce

### Variantes avancées
- [ ] Saisons (été/hiver) pour extérieurs
- [ ] Ambiances lumineuses pour intérieurs
- [ ] Grille de variantes automatique

## Statut Phase 3

✅ **COMPLÉTÉ**
- Templates extérieurs optimisés (façades, aériennes, paysage)
- Prompts riches intégrant analyse
- Recommandations modèles par type
- Données mock complètes pour tests
- Intégration dans viewSpecGenerator

## Prochaine action

**Option A**: Tester Phase 3 avec mocks
- Utiliser `mockVillaModerne`
- Générer vues extérieures
- Valider prompts et qualité

**Option B**: Continuer Phase 5 (Templates intérieurs)
- Créer `interiorViewTemplates.ts`
- Prompts par type de pièce
- Styles déco et éclairage

**Option C**: Implémenter cache et budget guardrail (Phase 7)
- Hash des requêtes
- Éviter recomputes
- Estimation coûts avant lancement

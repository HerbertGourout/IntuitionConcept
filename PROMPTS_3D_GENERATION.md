# 🎨 Prompts pour la Génération d'Images 3D

Documentation complète des prompts utilisés pour générer des rendus 3D architecturaux à partir de plans.

---

## 📋 Table des Matières

1. [Architecture du Système](#architecture-du-système)
2. [Prompt de Base (Simple)](#prompt-de-base-simple)
3. [Prompt Enrichi (Avancé)](#prompt-enrichi-avancé)
4. [Prompt Négatif](#prompt-négatif)
5. [Modèles IA Utilisés](#modèles-ia-utilisés)
6. [Exemples Concrets](#exemples-concrets)
7. [Personnalisation](#personnalisation)

---

## 🏗️ Architecture du Système

### Services Impliqués

```
src/services/ai/
├── render3DService.ts          # Service principal de génération
├── enrichedPromptBuilder.ts    # Constructeur de prompts enrichis
└── batchRenderOrchestrator.ts  # Orchestration batch multi-vues
```

### Flux de Génération

```
Plan Architectural (PDF/Image)
    ↓
Analyse Architecturale (Claude)
    ↓
Construction du Prompt (enrichedPromptBuilder)
    ↓
Génération 3D (Replicate API)
    ↓
Rendu 3D Photoréaliste
```

---

## 🎯 Prompt de Base (Simple)

### Fichier: `src/services/ai/render3DService.ts`

#### Méthode: `buildPrompt()`

```typescript
private buildPrompt(request: Render3DRequest): string {
  const styleDescriptions = {
    '3d-modern': 'modern contemporary architecture, clean lines, glass facades, minimalist design',
    '3d-traditional': 'traditional architecture, classic design, warm materials, cultural elements',
    '3d-industrial': 'industrial architecture, exposed materials, concrete and steel, urban design',
    '3d-minimalist': 'minimalist architecture, simple forms, neutral colors, zen aesthetic',
    '3d-african': 'West African architecture, local materials, traditional patterns, tropical climate adaptation'
  };

  const viewDescriptions = {
    'front-facade': 'front facade view, architectural elevation',
    'aerial-view': 'aerial view, birds eye perspective, top-down angle',
    '3d-perspective': '3D perspective view, three-quarter angle, depth and dimension',
    'interior': 'interior view, room perspective, indoor space'
  };

  const timeDescriptions = {
    'day': 'bright daylight, clear sky, natural lighting',
    'sunset': 'golden hour, warm sunset lighting, dramatic sky',
    'night': 'night scene, artificial lighting, ambient illumination'
  };

  let prompt = `Professional architectural rendering, ${styleDescriptions[request.style]}, `;
  prompt += `${viewDescriptions[request.viewAngle]}, `;
  
  if (request.timeOfDay) {
    prompt += `${timeDescriptions[request.timeOfDay]}, `;
  }

  if (request.materials) {
    const materials = [];
    if (request.materials.walls) materials.push(`${request.materials.walls} walls`);
    if (request.materials.roof) materials.push(`${request.materials.roof} roof`);
    if (request.materials.windows) materials.push(`${request.materials.windows} windows`);
    if (request.materials.flooring) materials.push(`${request.materials.flooring} flooring`);
    
    if (materials.length > 0) {
      prompt += `materials: ${materials.join(', ')}, `;
    }
  }

  prompt += 'photorealistic, high quality, detailed, professional photography, 8k resolution, architectural visualization';

  return prompt;
}
```

### Exemple de Prompt Généré (Simple)

```
Professional architectural rendering, modern contemporary architecture, clean lines, glass facades, minimalist design, front facade view, architectural elevation, bright daylight, clear sky, natural lighting, materials: concrete walls, metal roof, glass windows, photorealistic, high quality, detailed, professional photography, 8k resolution, architectural visualization
```

---

## 🚀 Prompt Enrichi (Avancé)

### Fichier: `src/services/ai/enrichedPromptBuilder.ts`

Le prompt enrichi utilise l'analyse architecturale complète pour créer des prompts ultra-précis.

#### Structure du Prompt Enrichi

```typescript
buildPrompt(
  viewSpec: ViewSpec,
  analysis: ArchitecturalAnalysis,
  globalSettings: GlobalRenderSettings
): string {
  let prompt = '';

  // 1. Type de vue
  prompt += this.getViewTypePrompt(viewSpec);

  // 2. Style architectural
  prompt += this.getStylePrompt(analysis.project.style);

  // 3. Matériaux et couleurs
  prompt += this.getMaterialsPrompt(
    globalSettings.projectAnchor.materials, 
    globalSettings.projectAnchor.colorPalette
  );

  // 4. Spécificités selon catégorie (extérieur/intérieur)
  if (viewSpec.category === 'exterior') {
    prompt += this.getExteriorPrompt(viewSpec, analysis);
  } else {
    prompt += this.getInteriorPrompt(viewSpec, analysis);
  }

  // 5. Ambiance (jour/nuit, saison)
  prompt += this.getAmbiancePrompt(viewSpec);

  // 6. Qualité et contraintes techniques
  prompt += this.getTechnicalPrompt(viewSpec, globalSettings);

  return prompt.trim();
}
```

### 1. Types de Vues

```typescript
const viewPrompts = {
  'facade-principale': 'Main facade architectural elevation, front view, ',
  'facade-secondaire': 'Secondary facade elevation, side view, ',
  'facade-arriere': 'Rear facade elevation, back view, ',
  'facade-cote': 'Side facade elevation, lateral view, ',
  'aerial-oblique': 'Oblique aerial view, birds eye perspective, site context, ',
  'aerial-frontal': 'Frontal aerial view, top-down perspective, building massing, ',
  'perspective-3d': '3D perspective view, three-quarter angle, volumetric rendering, ',
  'landscaping': 'Landscape architectural rendering, outdoor spaces, garden and terraces, ',
  'interior-wide': 'Interior wide shot, full room view, spatial composition, ',
  'interior-detail': 'Interior detail view, close-up composition, focused perspective, ',
  'interior-circulation': 'Interior circulation space, hallway or corridor view, '
};
```

### 2. Styles Architecturaux

```typescript
const styles = {
  'moderne': 'modern contemporary architecture, clean lines, minimalist design, ',
  'contemporain': 'contemporary architecture, innovative forms, bold design, ',
  'mediterraneen': 'Mediterranean architecture, warm tones, traditional elements, ',
  'traditionnel': 'traditional architecture, classic proportions, cultural heritage, ',
  'industriel': 'industrial architecture, exposed materials, raw aesthetic, ',
  'minimaliste': 'minimalist architecture, simple forms, essential design, ',
  'classique': 'classical architecture, symmetry, refined details, '
};
```

### 3. Matériaux et Couleurs

```typescript
// Matériaux extraits de l'analyse
materials: ['concrete', 'glass', 'steel', 'wood']
colorPalette: ['white', 'gray', 'black', 'natural wood']

// Prompt généré:
"materials: concrete, glass, steel, wood, color palette: white, gray, black, natural wood, "
```

### 4. Prompts Extérieurs

```typescript
private getExteriorPrompt(viewSpec: ViewSpec, analysis: ArchitecturalAnalysis): string {
  let prompt = '';

  // Ouvertures (fenêtres, portes)
  if (analysis.openings.windows.total > 0) {
    prompt += `${analysis.openings.windows.total} windows with accurate placement, `;
  }

  // Aménagements paysagers
  if (viewSpec.type === 'landscaping' && analysis.landscaping.features.length > 0) {
    prompt += `landscaping features: ${analysis.landscaping.features.join(', ')}, `;
  }

  // Contexte site
  prompt += 'realistic site context, accurate proportions from plan, ';

  return prompt;
}
```

### 5. Prompts Intérieurs

```typescript
// Types de pièces
const roomPrompts = {
  'salon': 'living room with comfortable seating, modern furniture',
  'cuisine': 'kitchen with functional layout, contemporary appliances',
  'salle-a-manger': 'dining room with table and chairs, elegant setting',
  'chambre': 'bedroom with bed and storage, cozy atmosphere',
  'salle-de-bain': 'bathroom with fixtures, clean modern design',
  'bureau': 'office space with desk and storage, professional setting',
  'hall': 'entrance hall, welcoming space',
  'couloir': 'corridor with good circulation, well-lit'
};

// Styles de décoration
const decorationStyles = {
  'minimaliste': 'minimalist decor, clean lines, neutral tones, uncluttered, ',
  'cosy': 'cozy atmosphere, warm textures, comfortable furnishings, inviting, ',
  'luxueux': 'luxurious finishes, high-end materials, elegant furniture, refined, ',
  'moderne': 'modern furniture, contemporary design, sleek finishes, ',
  'classique': 'classic furniture, traditional elements, timeless style, ',
  'industriel': 'industrial style, exposed elements, raw materials, '
};

// Modes d'éclairage
const lightingModes = {
  'natural': 'natural daylight, soft shadows, ambient light, ',
  'spots': 'spot lighting, focused illumination, dramatic accents, ',
  'led': 'LED lighting, modern fixtures, even illumination, ',
  'ambient': 'ambient lighting, soft glow, atmospheric, ',
  'dramatic': 'dramatic lighting, strong contrasts, mood lighting, '
};
```

### 6. Ambiance (Jour/Nuit/Saison)

```typescript
// Moment de la journée
const timePrompts = {
  'day': 'bright daylight, clear sky, natural lighting, ',
  'sunset': 'golden hour, warm sunset lighting, dramatic sky, ',
  'night': 'night scene, artificial lighting, ambient illumination, starry sky, '
};

// Saisons
const seasonPrompts = {
  'summer': 'summer season, lush vegetation, bright atmosphere, ',
  'winter': 'winter season, bare trees, soft light, ',
  'spring': 'spring season, blooming flowers, fresh greenery, ',
  'autumn': 'autumn season, warm colors, falling leaves, '
};
```

### 7. Contraintes Techniques

```typescript
private getTechnicalPrompt(viewSpec: ViewSpec, globalSettings: GlobalRenderSettings): string {
  let prompt = 'photorealistic, high quality, detailed, professional photography, ';

  // Qualité
  const qualityPrompts = {
    'draft': '512px resolution, ',
    'standard': '768px resolution, ',
    'hd': '1024px resolution, ',
    '4k': '4K resolution, ultra detailed, ',
    '8k': '8K resolution, hyper detailed, '
  };
  prompt += qualityPrompts[viewSpec.quality] || '';

  // Contraintes de fidélité
  if (globalSettings.respectDimensions) {
    prompt += 'accurate proportions from architectural plan, ';
  }

  if (globalSettings.respectOpenings) {
    prompt += 'precise window and door placement, ';
  }

  if (globalSettings.respectMaterials) {
    prompt += 'faithful material representation, ';
  }

  prompt += 'architectural visualization';

  return prompt;
}
```

### Exemple de Prompt Enrichi Complet

```
Main facade architectural elevation, front view, modern contemporary architecture, clean lines, minimalist design, materials: concrete, glass, steel, wood, color palette: white, gray, black, natural wood, 12 windows with accurate placement, realistic site context, accurate proportions from plan, bright daylight, clear sky, natural lighting, summer season, lush vegetation, bright atmosphere, photorealistic, high quality, detailed, professional photography, 1024px resolution, accurate proportions from architectural plan, precise window and door placement, faithful material representation, architectural visualization
```

---

## 🚫 Prompt Négatif

### Prompt Négatif de Base

```typescript
private buildNegativePrompt(): string {
  return 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, ' +
         'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
         'oversaturated, unrealistic, fantasy, sci-fi';
}
```

### Prompt Négatif Enrichi

```typescript
buildNegativePrompt(viewSpec: ViewSpec): string {
  const base = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, ' +
               'watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, ' +
               'oversaturated, unrealistic, fantasy, sci-fi';

  const additions: string[] = [];

  // Spécifique extérieur
  if (viewSpec.category === 'exterior') {
    additions.push('indoor', 'interior', 'furniture');
  } 
  // Spécifique intérieur
  else {
    additions.push('outdoor', 'exterior', 'sky', 'clouds');
  }

  // Spécifique jour
  if (viewSpec.timeOfDay === 'day') {
    additions.push('night', 'dark', 'moonlight');
  } 
  // Spécifique nuit
  else if (viewSpec.timeOfDay === 'night') {
    additions.push('bright daylight', 'noon', 'harsh shadows');
  }

  return [base, ...additions].join(', ');
}
```

### Exemple de Prompt Négatif

```
blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, watermark, text, signature, cartoon, sketch, draft, unfinished, amateur, oversaturated, unrealistic, fantasy, sci-fi, indoor, interior, furniture, night, dark, moonlight
```

---

## 🤖 Modèles IA Utilisés

### 1. SDXL (Stable Diffusion XL) - Par défaut

```typescript
REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
```

**Caractéristiques:**
- ✅ Rapide (20-30 secondes)
- ✅ Bonne qualité
- ✅ Coût modéré
- ✅ Polyvalent

**Paramètres:**
```typescript
{
  num_inference_steps: 30,  // standard
  guidance_scale: 7.5,
  width: 768,
  height: 768
}
```

### 2. Flux 1.1 Pro - Précision élevée

```typescript
FLUX_11_PRO_MODEL = 'black-forest-labs/flux-1.1-pro'
```

**Caractéristiques:**
- ✅ Très haute qualité
- ✅ Précision maximale
- ⚠️ Plus lent (60-90 secondes)
- ⚠️ Coût plus élevé (x1.6)

**Paramètres:**
```typescript
{
  num_inference_steps: 50,  // hd
  guidance_scale: 8.0,
  width: 1024,
  height: 1024
}
```

### 3. Flux Pro - Ultra qualité

```typescript
FLUX_PRO_MODEL = 'black-forest-labs/flux-pro'
```

### 4. Seedream-4 - Alternatif

```typescript
SEEDREAM_MODEL = 'seedream/seedream-4'
```

### 5. Imagen-4 - Google

```typescript
IMAGEN4_MODEL = 'google/imagen-4'
```

---

## 📸 Exemples Concrets

### Exemple 1: Façade Moderne Jour

**Input:**
```typescript
{
  style: '3d-modern',
  viewAngle: 'front-facade',
  timeOfDay: 'day',
  quality: 'hd',
  materials: {
    walls: 'concrete',
    roof: 'metal',
    windows: 'glass'
  }
}
```

**Prompt Généré:**
```
Professional architectural rendering, modern contemporary architecture, clean lines, glass facades, minimalist design, front facade view, architectural elevation, bright daylight, clear sky, natural lighting, materials: concrete walls, metal roof, glass windows, photorealistic, high quality, detailed, professional photography, 8k resolution, architectural visualization
```

### Exemple 2: Vue Aérienne Coucher de Soleil

**Input:**
```typescript
{
  style: '3d-african',
  viewAngle: 'aerial-view',
  timeOfDay: 'sunset',
  quality: 'hd'
}
```

**Prompt Généré:**
```
Professional architectural rendering, West African architecture, local materials, traditional patterns, tropical climate adaptation, aerial view, birds eye perspective, top-down angle, golden hour, warm sunset lighting, dramatic sky, photorealistic, high quality, detailed, professional photography, 8k resolution, architectural visualization
```

### Exemple 3: Intérieur Salon Luxueux

**Input (Enrichi):**
```typescript
{
  type: 'interior-wide',
  category: 'interior',
  roomId: 'salon-1',
  decorationStyle: 'luxueux',
  lightingMode: 'natural',
  timeOfDay: 'day',
  quality: 'hd'
}
```

**Prompt Enrichi Généré:**
```
Interior wide shot, full room view, spatial composition, modern contemporary architecture, clean lines, minimalist design, materials: marble, wood, glass, color palette: white, beige, gold, living room with comfortable seating, modern furniture, 45m² space, features: fireplace, large windows, luxurious finishes, high-end materials, elegant furniture, refined, natural daylight, soft shadows, ambient light, bright daylight, clear sky, natural lighting, photorealistic, high quality, detailed, professional photography, 1024px resolution, accurate proportions from architectural plan, precise window and door placement, faithful material representation, architectural visualization
```

---

## 🎨 Personnalisation

### Modifier les Prompts de Base

**Fichier:** `src/services/ai/render3DService.ts`

```typescript
private buildPrompt(request: Render3DRequest): string {
  // Ajouter vos propres descriptions de style
  const styleDescriptions = {
    '3d-modern': 'votre description personnalisée',
    '3d-custom': 'nouveau style personnalisé'
  };
  
  // Personnaliser les vues
  const viewDescriptions = {
    'custom-view': 'votre vue personnalisée'
  };
  
  // ...
}
```

### Modifier les Prompts Enrichis

**Fichier:** `src/services/ai/enrichedPromptBuilder.ts`

```typescript
// Ajouter de nouveaux types de pièces
private getRoomTypePrompt(roomType: string): string {
  const prompts: Record<string, string> = {
    'salon': 'living room...',
    'custom-room': 'votre type de pièce personnalisé'
  };
  return prompts[roomType] || 'interior space';
}

// Ajouter de nouveaux styles de décoration
private getDecorationPrompt(style: string): string {
  const styles: Record<string, string> = {
    'minimaliste': 'minimalist decor...',
    'custom-style': 'votre style personnalisé'
  };
  return styles[style] || '';
}
```

### Ajuster les Paramètres Techniques

```typescript
// Modifier la qualité
private getInferenceSteps(quality?: string): number {
  switch (quality) {
    case 'draft': return 15;      // plus rapide
    case 'hd': return 75;          // plus détaillé
    case 'ultra': return 100;      // qualité maximale
    default: return 30;
  }
}

// Modifier les résolutions
private getWidth(quality?: string): number {
  switch (quality) {
    case 'draft': return 512;
    case 'hd': return 1024;
    case '4k': return 2048;
    case '8k': return 4096;
    default: return 768;
  }
}
```

---

## 💡 Bonnes Pratiques

### ✅ DO

- **Être spécifique:** Plus le prompt est détaillé, meilleur est le résultat
- **Utiliser des termes techniques:** "architectural elevation", "volumetric rendering"
- **Spécifier les matériaux:** Concrete, glass, steel, wood
- **Inclure l'éclairage:** Natural lighting, golden hour, dramatic lighting
- **Préciser la qualité:** Photorealistic, high quality, 8k resolution

### ❌ DON'T

- **Être vague:** "nice building" → trop général
- **Mélanger les styles:** Modern + Traditional dans le même prompt
- **Oublier le prompt négatif:** Essentiel pour éviter les artefacts
- **Surcharger:** Trop de détails contradictoires
- **Ignorer le contexte:** Extérieur vs intérieur, jour vs nuit

---

## 📊 Coûts Estimés

| Modèle | Temps | Coût (FCFA) | Qualité |
|--------|-------|-------------|---------|
| SDXL Standard | 20-30s | 500 | ⭐⭐⭐ |
| Flux 1.1 Pro | 60-90s | 800 | ⭐⭐⭐⭐⭐ |
| Flux Pro | 90-120s | 900 | ⭐⭐⭐⭐⭐ |

---

## 🔗 Ressources

- **Documentation Replicate:** https://replicate.com/docs
- **SDXL Guide:** https://replicate.com/stability-ai/sdxl
- **Flux Pro Guide:** https://replicate.com/black-forest-labs/flux-pro
- **Prompt Engineering:** https://replicate.com/docs/guides/prompt-engineering

---

**Les prompts sont optimisés pour générer des rendus 3D photoréalistes fidèles aux plans architecturaux, avec une attention particulière aux proportions, matériaux et ambiance.**

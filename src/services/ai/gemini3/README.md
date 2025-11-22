# 🧠 Infrastructure Gemini 3

Infrastructure complète pour utiliser Gemini 3 dans IntuitionConcept.

## 📦 Contenu

### Types (`gemini3Types.ts`)
Types TypeScript complets pour l'API Gemini 3:
- `ThinkingLevel`: 'low' | 'medium' | 'high'
- `MediaResolution`: 'media_resolution_low' | 'media_resolution_medium' | 'media_resolution_high'
- `GenerateContentRequest`, `GenerateContentResponse`
- Support tools: `GoogleSearchTool`, `UrlContextTool`, `CodeExecutionTool`
- Support thought_signatures

### Configuration (`gemini3Config.ts`)
Configuration centralisée avec:
- 5 profils prédéfinis (FAST, BALANCED, PRECISE, ARCHITECTURAL, CREATIVE)
- Quotas et limites
- Pricing en FCFA
- Fonctions utilitaires (`estimateCost`, `getRecommendedProfile`)

### Client (`gemini3Client.ts`)
Client principal avec:
- Retry automatique avec backoff exponentiel
- Tracking statistiques d'utilisation
- Extraction texte, signatures, images
- Instance singleton

## 🚀 Usage

### Import
```typescript
import { Gemini3Client, getDefaultClient } from '@/services/ai/gemini3';
import type { ThinkingLevel, MediaResolution } from '@/services/ai/gemini3';
```

### Utilisation Basique
```typescript
const client = getDefaultClient();

const response = await client.generateContent({
  model: 'gemini-3-pro-preview',
  contents: {
    role: 'user',
    parts: [{ text: 'Bonjour Gemini 3!' }]
  },
  config: {
    thinking_level: 'high',
    temperature: 1.0
  }
});

const text = client.extractText(response);
console.log(text);
```

### Avec Image
```typescript
const response = await client.generateContent({
  model: 'gemini-3-pro-preview',
  contents: {
    role: 'user',
    parts: [
      { text: 'Analyse cette image' },
      {
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Image
        },
        media_resolution: { level: 'media_resolution_high' }
      }
    ]
  },
  config: {
    thinking_level: 'high'
  }
});
```

### Avec Tools
```typescript
const response = await client.generateContent({
  model: 'gemini-3-pro-preview',
  contents: {
    role: 'user',
    parts: [{ text: 'Quel est le prix du ciment à Dakar?' }]
  },
  config: {
    thinking_level: 'medium',
    tools: [
      { google_search: {} }
    ]
  }
});
```

### Avec Thought Signatures
```typescript
// Premier appel
const response1 = await client.generateContent({
  model: 'gemini-3-pro-preview',
  contents: {
    role: 'user',
    parts: [{ text: 'Analyse ce plan' }]
  },
  config: {
    thinking_level: 'high'
  }
});

const signature = client.extractThoughtSignature(response1);

// Appel suivant avec mémoire
const response2 = await client.generateContent({
  model: 'gemini-3-pro-preview',
  contents: [
    {
      role: 'model',
      parts: [{ thought_signature: signature }]
    },
    {
      role: 'user',
      parts: [{ text: 'Maintenant génère un devis' }]
    }
  ],
  config: {
    thinking_level: 'high'
  }
});
```

## 📊 Statistiques

```typescript
const stats = client.getStats();

console.log(stats.total_requests);
console.log(stats.total_cost);
console.log(stats.by_thinking_level);
console.log(stats.by_media_resolution);
```

## 💰 Coûts

```typescript
import { estimateCost } from '@/services/ai/gemini3';

const cost = estimateCost(
  100000, // input tokens
  50000,  // output tokens
  'high', // thinking level
  'media_resolution_high' // media resolution
);

console.log(`Coût estimé: ${cost} FCFA`);
```

## 🎯 Profils Recommandés

```typescript
import { getRecommendedProfile } from '@/services/ai/gemini3';

const profile = getRecommendedProfile('architectural plan analysis');

console.log(profile.thinking_level); // 'high'
console.log(profile.media_resolution); // 'media_resolution_high'
console.log(profile.temperature); // 0.1
```

## 🔧 Configuration

Variables d'environnement requises:
```env
VITE_GEMINI_3_API_KEY=your_key_here
VITE_GEMINI_3_API_VERSION=v1alpha
VITE_GEMINI_3_DEFAULT_THINKING_LEVEL=high
VITE_GEMINI_3_DEFAULT_TEMPERATURE=1.0
```

## 📚 Documentation

- [Documentation Gemini 3](https://ai.google.dev/gemini-api/docs/gemini-3?hl=fr&thinking=high)
- [Guide thinking_level](https://ai.google.dev/gemini-api/docs/gemini-3?hl=fr&thinking=high#thinking_level)
- [Guide media_resolution](https://ai.google.dev/gemini-api/docs/media-resolution?hl=fr)
- [Guide thought_signatures](https://ai.google.dev/gemini-api/docs/thought-signatures?hl=fr)

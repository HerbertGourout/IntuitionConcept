# 🔌 Guide d'Intégration - Fonctionnalités Advanced

Ce guide explique comment intégrer les services Advanced Gemini 3 dans votre application IntuitionConcept.

---

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Intégration des Composants UI](#intégration-des-composants-ui)
3. [Intégration des Services](#intégration-des-services)
4. [Exemples d'Utilisation](#exemples-dutilisation)
5. [Tests](#tests)
6. [Déploiement](#déploiement)

---

## 🔧 Configuration Initiale

### 1. Variables d'Environnement

Créer `.env.local` avec:

```env
# Gemini 3 API
VITE_GEMINI_3_API_KEY=your_gemini_3_api_key_here
VITE_GEMINI_3_API_VERSION=v1alpha
VITE_GEMINI_3_DEFAULT_THINKING_LEVEL=high
VITE_GEMINI_3_DEFAULT_TEMPERATURE=1.0

# Advanced Features
VITE_ENABLE_ADVANCED_FEATURES=true

# Replicate (pour rendus 3D)
VITE_REPLICATE_API_KEY=your_replicate_api_key_here
```

### 2. Obtenir les Clés API

**Gemini 3:**
1. Aller sur [Google AI Studio](https://aistudio.google.com/)
2. Créer un projet
3. Activer l'API Gemini
4. Générer une clé API

**Replicate (optionnel):**
1. Aller sur [Replicate](https://replicate.com/)
2. Créer un compte
3. Générer une clé API

---

## 🎨 Intégration des Composants UI

### 1. Page de Paramètres

Ajouter le panneau de configuration dans votre page de paramètres:

```tsx
// src/pages/Settings.tsx
import { AdvancedFeaturesSettings } from '@/components/Settings/AdvancedFeaturesSettings';

export const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
      {/* Autres sections de paramètres */}
      
      {/* Section Advanced */}
      <div className="mt-8">
        <AdvancedFeaturesSettings />
      </div>
    </div>
  );
};
```

### 2. Dashboard Analytics

Ajouter le dashboard dans votre page d'analytics ou dashboard principal:

```tsx
// src/pages/Dashboard.tsx
import { AdvancedAnalyticsDashboard } from '@/components/Analytics/AdvancedAnalyticsDashboard';

export const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Métriques existantes */}
      
      {/* Analytics Advanced */}
      <div className="mt-8">
        <AdvancedAnalyticsDashboard />
      </div>
    </div>
  );
};
```

### 3. Mode Selector dans les Pages de Service

Ajouter le sélecteur de mode dans chaque page utilisant les services IA:

#### Exemple: Page d'Analyse de Plans

```tsx
// src/pages/AnalysisPage.tsx
import { useState } from 'react';
import { AdvancedModeSelector, ServiceMode } from '@/components/Common/AdvancedModeSelector';
import { ClaudeServiceDirectAdvanced } from '@/services/ai/claude/claudeServiceDirectAdvanced';
import { claudeServiceDirect } from '@/services/ai/claude/claudeServiceDirect';

export const AnalysisPage = () => {
  const [mode, setMode] = useState<ServiceMode>('advanced');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (planImages: string[]) => {
    setAnalyzing(true);
    
    try {
      if (mode === 'advanced') {
        // Utiliser le service Advanced
        const service = new ClaudeServiceDirectAdvanced();
        
        // Quick scan d'abord
        const scan = await service.quickScan(planImages[0], {
          projectType: 'residential',
          location: 'Dakar'
        });
        
        console.log('Quick scan:', scan.data);
        
        // Analyse complète avec paramètres optimaux
        const analysis = await service.analyzeArchitecturalPlan(
          planImages,
          { projectType: 'residential', location: 'Dakar' },
          {
            thinking_level: scan.data.complexity.recommended_thinking_level,
            media_resolution: scan.data.complexity.recommended_media_resolution
          }
        );
        
        console.log('Analyse:', analysis.data);
        return analysis.data;
      } else {
        // Utiliser le service Standard
        const analysis = await claudeServiceDirect.analyzeArchitecturalPlan(
          planImages,
          { projectType: 'residential', location: 'Dakar' }
        );
        
        return analysis;
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analyse de Plans</h1>
      
      {/* Mode Selector */}
      <div className="mb-6">
        <AdvancedModeSelector
          currentMode={mode}
          onModeChange={setMode}
          serviceName="Analyse de Plans"
          estimatedCost={{
            standard: 3000,
            advanced: 300
          }}
          estimatedTime={{
            standard: 15,
            advanced: 5
          }}
          disabled={analyzing}
        />
      </div>
      
      {/* Interface d'analyse */}
      {/* ... */}
    </div>
  );
};
```

---

## 🚀 Intégration des Services

### 1. Service d'Analyse de Plans

```tsx
import { ClaudeServiceDirectAdvanced } from '@/services/ai/claude/claudeServiceDirectAdvanced';

const service = new ClaudeServiceDirectAdvanced();

// Quick scan pour triage
const scan = await service.quickScan(planImage, metadata);

// Analyse complète adaptative
const analysis = await service.analyzeArchitecturalPlan(
  planImages,
  metadata,
  {
    thinking_level: scan.data.complexity.recommended_thinking_level,
    media_resolution: scan.data.complexity.recommended_media_resolution
  }
);
```

### 2. Service de Génération de Devis

```tsx
import { QuoteGeneratorAdvanced } from '@/services/ai/quoteGeneratorAdvanced';

const service = new QuoteGeneratorAdvanced();

const quote = await service.generateQuote(analysis, {
  location: 'Dakar, Sénégal',
  include_market_analysis: true,
  include_alternatives: true,
  budget_constraint: 50000000
});

console.log('Total:', quote.data.total);
console.log('Économies potentielles:', quote.data.market_analysis.total_potential_savings);
```

### 3. Service de Rendus 3D

```tsx
import { Render3DServiceAdvanced } from '@/services/ai/render3D/render3DServiceAdvanced';

const service = new Render3DServiceAdvanced();

// Génération initiale
const render = await service.generateRender({
  plan_description: 'Villa moderne R+2',
  style: 'modern',
  view_angle: 'front',
  location: 'Dakar',
  weather: 'auto',
  resolution: '4K'
});

// Modification conversationnelle
const modified = await service.modifyRender(render.data, {
  original_signature: render.thought_signature!,
  modification: 'Ajoute une piscine à l\'arrière'
});
```

### 4. Service OCR

```tsx
import { SmartOcrStrategyAdvanced } from '@/services/ai/ocr/smartOcrStrategyAdvanced';

const service = new SmartOcrStrategyAdvanced();

const result = await service.extractAndValidate(documentImage, true);

console.log('Fournisseur:', result.data.vendor_name);
console.log('Validé:', result.data.validation.vendor_exists);
console.log('Prix cohérents:', result.data.validation.prices_coherent);
```

### 5. Service Copilot

```tsx
import { CopilotAdvanced } from '@/services/ai/copilot/copilotAdvanced';

const service = new CopilotAdvanced();

// Conversation
const response = await service.chat(
  userId,
  'Comment va mon projet Villa Almadies?',
  { project_id: 'proj_123' }
);

console.log(response.data.message);
```

### 6. Service de Détection d'Anomalies

```tsx
import { AnomalyDetectorAdvanced } from '@/services/ai/anomaly/anomalyDetectorAdvanced';

const service = new AnomalyDetectorAdvanced();

const result = await service.detectAnomalies(
  transactions,
  budget,
  {
    include_market_validation: true,
    sensitivity: 'high',
    check_fraud_patterns: true
  }
);

console.log('Anomalies:', result.data.total_anomalies);
console.log('Impact:', result.data.estimated_impact);
```

### 7. Service de Rapports

```tsx
import { ReportGeneratorAdvanced } from '@/services/ai/reports/reportGeneratorAdvanced';

const service = new ReportGeneratorAdvanced();

const report = await service.generateReport(projectData, {
  include_visualizations: true,
  visualization_resolution: '4K',
  focus_areas: ['financial', 'progress', 'risks'],
  language: 'fr'
});

console.log('Insights:', report.data.key_insights);
console.log('Actions:', report.data.action_items);
```

### 8. Service de Recherche

```tsx
import { SearchServiceAdvanced } from '@/services/ai/search/searchServiceAdvanced';

const service = new SearchServiceAdvanced();

const result = await service.search(
  'projets en retard avec problèmes budget',
  items,
  {
    max_results: 10,
    min_relevance: 0.5,
    types: ['project']
  }
);

console.log('Intention:', result.data.query_understanding.intent);
console.log('Résultats:', result.data.results);
```

---

## 📝 Exemples d'Utilisation Complète

### Exemple 1: Workflow Complet d'Analyse

```tsx
import { ClaudeServiceDirectAdvanced } from '@/services/ai/claude/claudeServiceDirectAdvanced';
import { QuoteGeneratorAdvanced } from '@/services/ai/quoteGeneratorAdvanced';
import { Render3DServiceAdvanced } from '@/services/ai/render3D/render3DServiceAdvanced';

async function completeAnalysisWorkflow(planImages: string[]) {
  // 1. Quick scan
  const analysisService = new ClaudeServiceDirectAdvanced();
  const scan = await analysisService.quickScan(planImages[0], {
    projectType: 'residential',
    location: 'Dakar'
  });
  
  console.log(`Complexité: ${scan.data.complexity.level}`);
  console.log(`Coût scan: ${scan.data.cost_fcfa} FCFA`);
  
  // 2. Analyse complète
  const analysis = await analysisService.analyzeArchitecturalPlan(
    planImages,
    { projectType: 'residential', location: 'Dakar' },
    {
      thinking_level: scan.data.complexity.recommended_thinking_level,
      media_resolution: scan.data.complexity.recommended_media_resolution
    }
  );
  
  console.log(`Analyse terminée: ${analysis.metadata.cost} FCFA`);
  
  // 3. Génération devis
  const quoteService = new QuoteGeneratorAdvanced();
  const quote = await quoteService.generateQuote(analysis.data, {
    location: 'Dakar, Sénégal',
    include_market_analysis: true,
    include_alternatives: true
  });
  
  console.log(`Devis: ${quote.data.total} FCFA`);
  console.log(`Économies potentielles: ${quote.data.market_analysis.total_potential_savings} FCFA`);
  
  // 4. Rendu 3D
  const renderService = new Render3DServiceAdvanced();
  const render = await renderService.generateRender({
    plan_description: analysis.data.description || 'Bâtiment résidentiel',
    style: 'modern',
    view_angle: 'front',
    location: 'Dakar',
    weather: 'auto',
    resolution: '4K'
  });
  
  console.log('Rendu 3D généré');
  
  return {
    scan,
    analysis: analysis.data,
    quote: quote.data,
    render: render.data
  };
}
```

### Exemple 2: Hook React Personnalisé

```tsx
// src/hooks/useAdvancedAnalysis.ts
import { useState } from 'react';
import { ClaudeServiceDirectAdvanced } from '@/services/ai/claude/claudeServiceDirectAdvanced';
import type { AnalysisResult } from '@/services/ai/gemini3';

export function useAdvancedAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AnalysisResult<any> | null>(null);

  const analyze = async (planImages: string[], metadata: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const service = new ClaudeServiceDirectAdvanced();
      
      // Quick scan
      const scan = await service.quickScan(planImages[0], metadata);
      
      // Analyse complète
      const analysis = await service.analyzeArchitecturalPlan(
        planImages,
        metadata,
        {
          thinking_level: scan.data.complexity.recommended_thinking_level,
          media_resolution: scan.data.complexity.recommended_media_resolution
        }
      );
      
      setResult(analysis);
      return analysis;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error, result };
}

// Utilisation dans un composant
function AnalysisComponent() {
  const { analyze, loading, result } = useAdvancedAnalysis();
  
  const handleAnalyze = async () => {
    await analyze(planImages, metadata);
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyse en cours...' : 'Analyser'}
      </button>
      {result && <div>Résultat: {JSON.stringify(result.data)}</div>}
    </div>
  );
}
```

---

## 🧪 Tests

### Tests Unitaires

```typescript
// src/services/ai/claude/__tests__/claudeServiceDirectAdvanced.test.ts
import { ClaudeServiceDirectAdvanced } from '../claudeServiceDirectAdvanced';

describe('ClaudeServiceDirectAdvanced', () => {
  let service: ClaudeServiceDirectAdvanced;

  beforeEach(() => {
    service = new ClaudeServiceDirectAdvanced();
  });

  it('should perform quick scan', async () => {
    const result = await service.quickScan(mockPlanImage, mockMetadata);
    
    expect(result.data.complexity.level).toBeDefined();
    expect(result.data.cost_fcfa).toBeGreaterThan(0);
  });

  it('should analyze architectural plan', async () => {
    const result = await service.analyzeArchitecturalPlan(
      [mockPlanImage],
      mockMetadata
    );
    
    expect(result.data.description).toBeDefined();
    expect(result.metadata.cost).toBeGreaterThan(0);
  });
});
```

### Tests d'Intégration

```typescript
// src/__tests__/integration/advanced-workflow.test.ts
import { ClaudeServiceDirectAdvanced } from '@/services/ai/claude/claudeServiceDirectAdvanced';
import { QuoteGeneratorAdvanced } from '@/services/ai/quoteGeneratorAdvanced';

describe('Advanced Workflow Integration', () => {
  it('should complete full analysis to quote workflow', async () => {
    // 1. Analyse
    const analysisService = new ClaudeServiceDirectAdvanced();
    const analysis = await analysisService.analyzeArchitecturalPlan(
      [mockPlanImage],
      mockMetadata
    );
    
    expect(analysis.data).toBeDefined();
    
    // 2. Devis
    const quoteService = new QuoteGeneratorAdvanced();
    const quote = await quoteService.generateQuote(analysis.data, {
      location: 'Dakar, Sénégal',
      include_market_analysis: true
    });
    
    expect(quote.data.total).toBeGreaterThan(0);
    expect(quote.data.market_analysis).toBeDefined();
  });
});
```

---

## 🚀 Déploiement

### 1. Variables d'Environnement Production

Configurer dans votre plateforme de déploiement (Vercel, Netlify, etc.):

```env
VITE_GEMINI_3_API_KEY=prod_key_here
VITE_ENABLE_ADVANCED_FEATURES=true
VITE_GEMINI_3_DEFAULT_THINKING_LEVEL=high
```

### 2. Build

```bash
npm run build
```

### 3. Vérifications Pré-Déploiement

- [ ] Clés API configurées
- [ ] Tests passent
- [ ] Build réussit
- [ ] Variables d'environnement définies
- [ ] Documentation à jour

### 4. Monitoring

Ajouter le monitoring des coûts et performances:

```typescript
import { getDefaultClient } from '@/services/ai/gemini3';

// Dans votre dashboard
const client = getDefaultClient();
const stats = client.getStats();

// Envoyer à votre système de monitoring
sendToMonitoring({
  total_requests: stats.total_requests,
  total_cost: stats.total_cost,
  success_rate: stats.successful_requests / stats.total_requests
});
```

---

## 📊 Métriques de Succès

Suivre ces KPIs après déploiement:

1. **Coûts**
   - Coût moyen par projet
   - Économies réalisées vs Standard
   - Budget mensuel utilisé

2. **Performance**
   - Temps de réponse moyen
   - Taux de succès
   - Taux d'erreur

3. **Qualité**
   - Satisfaction utilisateurs
   - Précision analyses
   - Retours clients

4. **Adoption**
   - % utilisation Advanced vs Standard
   - Services les plus utilisés
   - Tendances d'utilisation

---

## 🆘 Support et Troubleshooting

### Problèmes Courants

**1. Erreur "API Key manquante"**
- Vérifier `.env.local`
- Redémarrer le serveur de dev

**2. Timeout**
- Réduire `thinking_level`
- Augmenter `timeout_ms` dans config

**3. Coûts élevés**
- Activer `autoOptimize`
- Utiliser quick scan pour triage
- Réduire `media_resolution` si possible

**4. Qualité insuffisante**
- Augmenter `thinking_level` à 'high'
- Augmenter `media_resolution`
- Vérifier qualité images d'entrée

---

## 📚 Ressources

- [Documentation Gemini 3](https://ai.google.dev/gemini-api/docs/gemini-3?hl=fr&thinking=high)
- [Guide des Services](./GEMINI3_SERVICES_GUIDE.md)
- [Résumé d'Implémentation](./IMPLEMENTATION_SUMMARY.md)
- [Progression](./GEMINI3_IMPLEMENTATION_PROGRESS.md)

---

**Dernière mise à jour:** 22 novembre 2025  
**Version:** 1.0.0  
**Status:** ✅ Prêt pour intégration

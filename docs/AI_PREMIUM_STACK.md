# 🚀 Stack IA Premium - Documentation Technique

## Vue d'ensemble

Le **Stack IA Premium** d'IntuitionConcept est une architecture hybride optimisée qui combine les meilleurs services d'IA du marché pour offrir des capacités avancées spécifiquement adaptées au secteur BTP.

### 🎯 Objectifs

- **Performance maximale** : Utilisation des modèles IA les plus performants pour chaque cas d'usage
- **Optimisation des coûts** : Routage intelligent vers le service le plus économique selon la tâche
- **Fiabilité** : Mécanismes de fallback et redondance
- **Spécialisation BTP** : Prompts et workflows optimisés pour le secteur du bâtiment

## 🏗️ Architecture

### Services Intégrés

| Service | Spécialité | Cas d'usage | Coût estimé |
|---------|------------|-------------|-------------|
| **Grok** | Intelligence marché temps réel | Veille prix, chat conversationnel | €0.002/1K tokens |
| **Google Document AI** | OCR premium | Factures, contrats, plans | €0.30-1.00/page |
| **GPT-4o** | Analyse multimodale | Images chantier, plans visuels | €0.005-0.015/1K tokens |
| **Gemini 1.5 Pro** | Contexte ultra-long | Dossiers complets, conformité | €0.014/1M tokens |
| **Claude 3.5 Sonnet** | Analyse technique | Génération, raisonnement | €0.003-0.015/1K tokens |

### Orchestrateur Hybride

L'orchestrateur `PremiumHybridOrchestrator` route automatiquement les requêtes vers le service optimal :

```typescript
const request: PremiumAIRequest = {
  type: 'ocr_invoice',
  content: 'Extraire données facture',
  files: [{ base64: '...', mimeType: 'application/pdf' }],
  priority: 'high',
  costOptimization: true
};

const response = await premiumHybridOrchestrator.processRequest(request);
```

## 📋 Types de Requêtes Supportées

### 1. OCR Premium
- `ocr_invoice` : Extraction de données de factures
- `ocr_contract` : Analyse de contrats
- `ocr_plan` : Lecture de plans techniques

### 2. Analyse Visuelle
- `analyze_image` : Analyse d'images de chantier
- `analyze_plan` : Analyse de plans architecturaux
- `progress_tracking` : Suivi de progression (avant/après)

### 3. Intelligence Marché
- `market_intelligence` : Veille marché temps réel
- `cost_estimation` : Estimation de coûts avec données actuelles

### 4. Analyse Projet
- `project_analysis` : Analyse complète de dossier
- `risk_assessment` : Évaluation des risques
- `compliance_check` : Vérification de conformité

### 5. Assistant Conversationnel
- `chat_assistant` : Chat avec Grok personnalisé

## 🔧 Configuration

### Variables d'environnement

```env
# Stack IA Premium - Clés API
VITE_GROK_API_KEY=your_grok_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Services
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
VITE_GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id

# Configuration IA Premium
VITE_AI_COST_OPTIMIZATION=true
VITE_AI_QUALITY_THRESHOLD=80
VITE_AI_FALLBACK_ENABLED=true
VITE_MARKET_INTELLIGENCE_REFRESH=3600000
```

### Processeurs Google Document AI

Configurez ces processeurs dans Google Cloud Console :

1. **Invoice Processor** : `projects/{PROJECT_ID}/locations/us/processors/{INVOICE_PROCESSOR_ID}`
2. **Contract Processor** : `projects/{PROJECT_ID}/locations/us/processors/{CONTRACT_PROCESSOR_ID}`
3. **Form Processor** : `projects/{PROJECT_ID}/locations/us/processors/{FORM_PROCESSOR_ID}`

## 🎨 Composants UI

### MarketIntelligenceDashboard

Tableau de bord temps réel pour la veille marché :

```tsx
import MarketIntelligenceDashboard from '../AI/MarketIntelligenceDashboard';

<MarketIntelligenceDashboard />
```

**Fonctionnalités :**
- Prix matériaux en temps réel
- Alertes marché automatiques
- Recommandations stratégiques
- Auto-refresh configurable

### GrokChatAssistant

Assistant conversationnel intelligent :

```tsx
import GrokChatAssistant from '../AI/GrokChatAssistant';

<GrokChatAssistant />
```

**Fonctionnalités :**
- Chat contextuel avec historique
- Actions rapides prédéfinies
- Recommandations automatiques
- Suivi des coûts en temps réel

## 📊 Métriques et Monitoring

L'orchestrateur collecte automatiquement :

- **Requêtes totales** et taux de succès
- **Coût total** et par fournisseur
- **Temps de réponse** moyen
- **Utilisation par service**

```typescript
const metrics = premiumHybridOrchestrator.getMetrics();
console.log(`Coût total : ${metrics.totalCost}€`);
console.log(`Taux de succès : ${metrics.successfulRequests / metrics.totalRequests * 100}%`);
```

## 🔄 Mécanismes de Fallback

En cas d'échec d'un service principal :

1. **Retry automatique** avec backoff exponentiel
2. **Routage vers service alternatif** si disponible
3. **Dégradation gracieuse** avec service moins performant
4. **Notification d'erreur** avec contexte détaillé

## 💰 Optimisation des Coûts

### Stratégies Implémentées

1. **Routage intelligent** : Service le moins cher pour chaque tâche
2. **Cache des réponses** : Éviter les requêtes redondantes
3. **Compression des prompts** : Réduction de la taille des requêtes
4. **Seuils de qualité** : Éviter les sur-spécifications

### Estimation des Coûts

| Type de requête | Coût estimé | Service optimal |
|-----------------|-------------|-----------------|
| OCR Facture | €0.50/page | Google Document AI |
| Chat simple | €0.002/req | Grok |
| Analyse image | €0.05/image | GPT-4o |
| Analyse projet complet | €0.15/dossier | Gemini |

## 🧪 Tests et Validation

### Tests Unitaires

```bash
npm test src/services/ai/
```

### Tests d'Intégration

```bash
npm run test:integration:ai
```

### Tests de Performance

```bash
npm run test:performance:ai
```

## 🚀 Déploiement

### Prérequis

1. **Comptes API** configurés pour tous les services
2. **Google Cloud Project** avec Document AI activé
3. **Variables d'environnement** correctement définies
4. **Quotas API** suffisants pour la charge prévue

### Vérification de Santé

```typescript
const healthStatus = await premiumHybridOrchestrator.healthCheck();
console.log('Services disponibles :', healthStatus);
```

## 📈 Roadmap

### Phase 1 (Actuelle)
- ✅ Orchestrateur hybride
- ✅ Services premium intégrés
- ✅ UI dashboard et chat
- ✅ Optimisation coûts

### Phase 2 (Prochaine)
- 🔄 Cache intelligent Redis
- 🔄 Analytics avancées
- 🔄 Fine-tuning modèles
- 🔄 API publique

### Phase 3 (Future)
- 📋 Modèles propriétaires
- 📋 Edge computing
- 📋 Intégration IoT
- 📋 Prédictions ML

## 🆘 Support et Dépannage

### Problèmes Courants

**Erreur "Clé API manquante"**
```bash
# Vérifier les variables d'environnement
echo $VITE_GROK_API_KEY
```

**Timeout des requêtes**
```typescript
// Augmenter les timeouts
const request = {
  ...baseRequest,
  timeout: 30000 // 30 secondes
};
```

**Coûts élevés**
```typescript
// Activer l'optimisation
const request = {
  ...baseRequest,
  costOptimization: true,
  qualityThreshold: 70 // Réduire le seuil
};
```

### Logs et Debugging

```typescript
// Activer les logs détaillés
localStorage.setItem('AI_DEBUG', 'true');
```

## 📞 Contact

Pour toute question technique sur le Stack IA Premium :
- 📧 Email : dev@intuitionconcept.com
- 💬 Slack : #ai-premium-support
- 📖 Wiki : wiki.intuitionconcept.com/ai-stack

---

**Version :** 1.0.0  
**Dernière mise à jour :** 08/10/2025  
**Auteur :** Équipe IA IntuitionConcept

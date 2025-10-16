# 🏗️ Architecture de la pipeline d'analyse de plans

## 📋 Vue d'ensemble

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Upload    │ -> │  Découpe PDF │ -> │  Analyse IA │ -> │ Génération   │
│     PDF     │    │  sans perte  │    │   (Claude)  │    │    Devis     │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
     Step 0              Step 1              Step 2             Step 3-4
```

---

## 🔄 Pipeline détaillée

### **Step 1 : Découpe PDF sans compression**

**Service** : `PDFSplitter` (`src/utils/pdfSplitter.ts`)

```typescript
// Découper en pages individuelles SANS COMPRESSION
for (let i = 0; i < originalPdf.getPageCount(); i++) {
  const singlePagePdf = await PDFDocument.create();
  const [copiedPage] = await singlePagePdf.copyPages(originalPdf, [i]);
  singlePagePdf.addPage(copiedPage);
  
  // Sauvegarder SANS COMPRESSION
  const pdfBytes = await singlePagePdf.save({
    useObjectStreams: false,      // ❌ Désactiver compression
    addDefaultPage: false,
    objectsPerTick: Infinity
  });
  
  const base64 = PDFSplitter.uint8ArrayToBase64(pdfBytes);
  pages.push({ pageNumber: i + 1, pdfBytes, base64, metadata });
}
```

**Sortie** : Pages individuelles en base64 (qualité 100%)

---

### **Step 2 : Analyse avec Claude**

**Service** : `ClaudeServiceDirect` (`src/services/ai/claudeServiceDirect.ts`)

```typescript
// Analyser par batch (5 pages max)
for (let i = 0; i < pages.length; i += 5) {
  const batch = pages.slice(i, i + 5);
  
  // Construire le message avec PDF
  const content = [
    { type: 'text', text: prompt },
    ...batch.map(page => ({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: page.content
      }
    }))
  ];
  
  // Appeler Claude
  const response = await this.client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    temperature: 0.2,
    messages: [{ role: 'user', content }]
  });
}
```

**Sortie** : Données architecturales structurées (pièces, surfaces, complexité)

---

### **Step 3-4 : Génération du devis**

#### Niveau 1 : IA Qwen (si disponible) 🤖

```typescript
// Appeler Qwen avec prompt métreur-expert
const qwenResult = await qwenService.analyzePlan(
  base64,
  uploadedFile.type,
  `Plan ${floorsLabel} - ${totalArea} m²`,
  true  // generateDetailedQuote = true
);

// Parser le JSON (13 postes)
const detailedQuote = JSON.parse(qwenResult.content);
```

**Génère** : Devis détaillé 13 postes avec quantités calculées

#### Niveau 2 : Fallback (si Qwen indisponible) 📊

```typescript
// Calcul avec prix réalistes
const basePricePerSquareMeter = 250000; // FCFA/m²
const basePrice = totalArea * basePricePerSquareMeter;

const complexityMultiplier = {
  'low': 0.85,
  'moderate': 1.0,
  'high': 1.25,
  'very_high': 1.6
}[complexity];

const estimatedTotal = basePrice * complexityMultiplier * verticalityMultiplier;
```

**Génère** : Devis estimatif 3 phases (gros œuvre, second œuvre, finitions)

---

## 🔑 Variables d'environnement

```env
# Claude (obligatoire)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Qwen (optionnel - pour devis détaillé)
VITE_QWEN_API_KEY=sk-or-v1-...
```

---

## 💰 Coûts

### Claude (analyse)
- Input : 0.0018 FCFA/token
- Output : 0.009 FCFA/token
- **Exemple 10 pages** : ~54 FCFA

### Qwen (devis détaillé)
- Input : 4.8 FCFA/1K tokens
- Output : 7.2 FCFA/1K tokens
- **Exemple devis** : ~74 FCFA

**Total pipeline** : ~128 FCFA (~0.21 USD)

---

## 📊 Performances

| Étape | Durée |
|-------|-------|
| Découpe PDF | 2-3s |
| Analyse Claude | 8-12s |
| Génération devis | 5-8s |
| **Total** | **15-23s** |

---

## 🛡️ Garanties

- ✅ **Qualité 100%** : Aucune compression du PDF
- ✅ **Fallback automatique** : Fonctionne sans Qwen
- ✅ **Prix réalistes** : Minimum 212 500 FCFA/m²
- ✅ **Logs détaillés** : Debugging facile
- ✅ **Gestion d'erreurs** : Robuste et transparent

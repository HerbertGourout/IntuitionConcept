/**
 * Service Claude Direct - Communication directe avec l'API Anthropic
 * 
 * Objectifs:
 * - Préserver 100% de la qualité des documents PDF
 * - Analyser des PDF volumineux par découpe intelligente
 * - Extraire métadonnées complètes sans perte
 * - Architecture microservices réutilisable
 * 
 * @author IntuitionConcept BTP Platform
 * @version 2.0.0
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface PDFAnalysisOptions {
  preserveQuality: boolean; // Toujours true par défaut
  splitByPage: boolean; // Découper par page
  extractMetadata: boolean; // Extraire métadonnées complètes
  maxPagesPerRequest?: number; // Nombre de pages par requête
  includeImages: boolean; // Inclure images haute résolution
}

export interface PDFMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  creationDate?: Date;
  modificationDate?: Date;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  producer?: string;
  creator?: string;
}

export interface PDFPage {
  pageNumber: number;
  content: string; // Base64 sans compression
  width: number;
  height: number;
  rotation: number;
  hasImages: boolean;
  textContent?: string;
}

export interface ClaudeAnalysisResult {
  content: string;
  metadata: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number; // En FCFA
    processingTime: number; // En ms
  };
  confidence: number;
  structuredData?: Record<string, unknown>;
}

export interface ArchitecturalPlanData {
  planType: 'floor_plan' | 'elevation' | 'section' | 'site_plan' | 'detail' | 'structural' | 'electrical' | 'plumbing';
  measurements: {
    totalArea?: number;
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
  materials: Array<{
    category: string;
    name: string;
    specification?: string;
    quantity?: number;
    unit?: string;
  }>;
  annotations: string[];
  technicalSpecs: Record<string, string>;
  compliance: {
    buildingCode?: string;
    standards?: string[];
    regulations?: string[];
  };
  estimatedComplexity: 'low' | 'moderate' | 'high' | 'very_high';
  confidence: number;
}

// ============================================================================
// SERVICE PRINCIPAL
// ============================================================================

export class ClaudeServiceDirect {
  private client: Anthropic;
  private config: Required<ClaudeConfig>;
  
  // Modèles Claude disponibles
  private static readonly MODELS = {
    OPUS: 'claude-3-opus-20240229', // Le plus puissant
    SONNET: 'claude-3-5-sonnet-20241022', // Équilibre performance/coût
    HAIKU: 'claude-3-5-haiku-20241022' // Le plus rapide
  } as const;

  // Coûts par token (en FCFA, taux 1 USD = 600 FCFA)
  private static readonly COSTS = {
    'claude-3-opus-20240229': { input: 0.009, output: 0.045 }, // 15$/MTok input, 75$/MTok output
    'claude-3-5-sonnet-20241022': { input: 0.0018, output: 0.009 }, // 3$/MTok input, 15$/MTok output
    'claude-3-5-haiku-20241022': { input: 0.0006, output: 0.0018 } // 1$/MTok input, 3$/MTok output
  } as const;

  constructor(config: ClaudeConfig) {
    if (!config.apiKey) {
      throw new Error('❌ Clé API Anthropic requise');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true // Pour utilisation frontend
    });

    this.config = {
      apiKey: config.apiKey,
      model: config.model || ClaudeServiceDirect.MODELS.SONNET,
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.2
    };

    console.log('✅ ClaudeServiceDirect initialisé avec modèle:', this.config.model);
  }

  // ==========================================================================
  // ANALYSE PDF SANS PERTE
  // ==========================================================================

  /**
   * Analyse un PDF architectural en préservant 100% de la qualité
   * Découpe automatiquement en pages si nécessaire
   */
  async analyzePDFArchitecturalPlan(
    pdfFile: File,
    options: Partial<PDFAnalysisOptions> = {}
  ): Promise<ClaudeAnalysisResult & { architecturalData: ArchitecturalPlanData }> {
    const startTime = Date.now();

    // Options par défaut (qualité maximale)
    const opts: PDFAnalysisOptions = {
      preserveQuality: true,
      splitByPage: true,
      extractMetadata: true,
      maxPagesPerRequest: 5,
      includeImages: true,
      ...options
    };

    console.log('📄 Analyse PDF architectural sans perte:', pdfFile.name);
    console.log('⚙️ Options:', opts);

    // Étape 1: Extraire métadonnées
    const metadata = await this.extractPDFMetadata(pdfFile);
    console.log('📊 Métadonnées extraites:', metadata);

    // Étape 2: Découper le PDF par page (sans compression)
    const pages = await this.splitPDFByPage(pdfFile, opts);
    console.log(`📑 PDF découpé en ${pages.length} pages`);

    // Étape 3: Analyser chaque page avec Claude
    const pageAnalyses: ClaudeAnalysisResult[] = [];
    
    for (let i = 0; i < pages.length; i += opts.maxPagesPerRequest!) {
      const batch = pages.slice(i, i + opts.maxPagesPerRequest!);
      console.log(`🔍 Analyse batch ${i / opts.maxPagesPerRequest! + 1}/${Math.ceil(pages.length / opts.maxPagesPerRequest!)}`);
      
      const batchResult = await this.analyzePageBatch(batch, metadata);
      pageAnalyses.push(batchResult);
    }

    // Étape 4: Agréger les résultats
    const aggregatedResult = this.aggregatePageAnalyses(pageAnalyses);

    // Étape 5: Extraire données architecturales structurées
    const architecturalData = this.extractArchitecturalData(aggregatedResult.content);

    const processingTime = Date.now() - startTime;

    return {
      ...aggregatedResult,
      architecturalData,
      metadata: {
        ...aggregatedResult.metadata,
        processingTime
      }
    };
  }

  /**
   * Extrait les métadonnées complètes d'un PDF sans le modifier
   */
  private async extractPDFMetadata(file: File): Promise<PDFMetadata> {
    // Utiliser pdf-lib pour extraction sans perte
    const { PDFDocument } = await import('pdf-lib');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false // Ne pas modifier les métadonnées
    });

    const pageCount = pdfDoc.getPageCount();
    
    // Extraire métadonnées natives
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const producer = pdfDoc.getProducer();
    const creator = pdfDoc.getCreator();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();

    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      pageCount,
      title: title || undefined,
      author: author || undefined,
      subject: subject || undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      producer: producer || undefined,
      creator: creator || undefined,
      creationDate: creationDate || undefined,
      modificationDate: modificationDate || undefined
    };
  }

  /**
   * Découpe un PDF en pages individuelles SANS COMPRESSION
   */
  private async splitPDFByPage(
    file: File,
    options: PDFAnalysisOptions
  ): Promise<PDFPage[]> {
    const { PDFDocument } = await import('pdf-lib');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false
    });

    const pages: PDFPage[] = [];
    const pageCount = pdfDoc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;

      // Créer un nouveau document avec une seule page (sans compression)
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
      singlePageDoc.addPage(copiedPage);

      // Sauvegarder sans compression
      const pdfBytes = await singlePageDoc.save({
        useObjectStreams: false, // Désactiver compression
        addDefaultPage: false,
        objectsPerTick: Infinity
      });

      // Convertir en base64 (format requis par Claude)
      const base64 = this.arrayBufferToBase64(pdfBytes);

      pages.push({
        pageNumber: i + 1,
        content: base64,
        width,
        height,
        rotation,
        hasImages: options.includeImages
      });

      console.log(`📄 Page ${i + 1}/${pageCount} extraite (${(pdfBytes.length / 1024).toFixed(2)} KB)`);
    }

    return pages;
  }

  /**
   * Analyse un batch de pages avec Claude
   */
  private async analyzePageBatch(
    pages: PDFPage[],
    metadata: PDFMetadata
  ): Promise<ClaudeAnalysisResult> {
    const prompt = this.buildArchitecturalAnalysisPrompt(metadata, pages);

    // Construire les messages avec documents PDF
    const content: Anthropic.MessageParam['content'] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Ajouter chaque page comme document PDF
    for (const page of pages) {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: page.content
        }
      } as Anthropic.DocumentBlockParam);
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content
          }
        ]
      });

      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      const cost = this.calculateCost(
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      return {
        content: textContent,
        metadata: {
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          cost,
          processingTime: 0 // Sera calculé plus tard
        },
        confidence: 0.95 // Sera ajusté selon la réponse
      };

    } catch (error) {
      console.error('❌ Erreur analyse Claude:', error);
      throw new Error(`Échec analyse Claude: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Construit le prompt d'analyse architecturale
   */
  private buildArchitecturalAnalysisPrompt(
    metadata: PDFMetadata,
    pages: PDFPage[]
  ): string {
    return `# ANALYSE DE PLAN ARCHITECTURAL BTP - EXTRACTION COMPLÈTE

## CONTEXTE DU DOCUMENT
- **Nom du fichier**: ${metadata.fileName}
- **Pages à analyser**: ${pages.map(p => p.pageNumber).join(', ')}
- **Dimensions**: ${pages[0]?.width.toFixed(0)} x ${pages[0]?.height.toFixed(0)} points
${metadata.title ? `- **Titre**: ${metadata.title}` : ''}
${metadata.author ? `- **Auteur**: ${metadata.author}` : ''}

## OBJECTIF
Extraire **TOUTES** les informations techniques du plan architectural avec une précision maximale.
Ne rien omettre, ne rien approximer. Chaque mesure, chaque annotation, chaque spécification doit être capturée.

## INSTRUCTIONS D'EXTRACTION

### 1. IDENTIFICATION DU TYPE DE PLAN
Déterminer précisément le type de plan parmi:
- Plan de masse (site_plan)
- Plan d'étage (floor_plan)
- Élévation (elevation)
- Coupe (section)
- Détail technique (detail)
- Plan de structure (structural)
- Plan électrique (electrical)
- Plan de plomberie (plumbing)

### 2. MESURES ET DIMENSIONS
Extraire **TOUTES** les cotes et mesures:
- Surface totale du bâtiment/étage
- Dimensions de chaque pièce (longueur × largeur × hauteur si disponible)
- Épaisseur des murs (porteurs et cloisons)
- Dimensions des ouvertures (portes, fenêtres)
- Hauteurs sous plafond
- Niveaux et altitudes

### 3. NOMENCLATURE DES ESPACES
Pour chaque pièce/espace:
- Nom/fonction (chambre, salon, cuisine, etc.)
- Surface en m²
- Étage/niveau
- Orientation (Nord, Sud, Est, Ouest)
- Usage prévu

### 4. ÉLÉMENTS STRUCTURELS
Identifier et décrire:
- Murs porteurs (matériau, épaisseur, longueur)
- Cloisons (matériau, épaisseur)
- Poteaux et poutres (dimensions, matériau)
- Dalles et planchers (épaisseur, type)
- Fondations (si visibles)

### 5. OUVERTURES
Pour chaque porte/fenêtre:
- Type (porte simple, double, fenêtre, baie vitrée)
- Dimensions (largeur × hauteur)
- Localisation précise
- Sens d'ouverture (si indiqué)

### 6. MATÉRIAUX SPÉCIFIÉS
Lister tous les matériaux mentionnés:
- Revêtements de sol
- Revêtements muraux
- Menuiseries
- Matériaux de structure
- Isolants
- Étanchéité

### 7. ANNOTATIONS ET NOTES TECHNIQUES
Transcrire **TOUTES** les annotations:
- Notes du concepteur
- Spécifications techniques
- Références aux normes
- Légendes et symboles
- Échelle du plan

### 8. CONFORMITÉ RÉGLEMENTAIRE
Identifier les références à:
- Codes du bâtiment
- Normes techniques (DTU, Eurocodes, etc.)
- Réglementations locales
- Accessibilité PMR
- Sécurité incendie

### 9. ESTIMATION DE COMPLEXITÉ
Évaluer la complexité du projet:
- **low**: Construction simple, formes régulières
- **moderate**: Quelques éléments techniques spéciaux
- **high**: Architecture complexe, nombreux détails techniques
- **very_high**: Projet exceptionnel, défis techniques majeurs

## FORMAT DE RÉPONSE
Répondre UNIQUEMENT en JSON structuré selon ce format:

\`\`\`json
{
  "planType": "floor_plan",
  "measurements": {
    "totalArea": 150.5,
    "rooms": [
      {
        "name": "Salon",
        "area": 35.2,
        "dimensions": { "length": 5.5, "width": 6.4, "height": 2.8 },
        "floor": 0,
        "purpose": "Séjour principal"
      }
    ],
    "walls": [
      {
        "type": "load_bearing",
        "material": "Béton armé",
        "thickness": 0.20,
        "length": 8.5
      }
    ],
    "openings": [
      {
        "type": "door",
        "dimensions": { "width": 0.90, "height": 2.10 },
        "location": "Entrée principale"
      }
    ]
  },
  "materials": [
    {
      "category": "Structure",
      "name": "Béton armé",
      "specification": "C25/30",
      "quantity": 45,
      "unit": "m³"
    }
  ],
  "annotations": [
    "Hauteur sous plafond: 2.80m",
    "Échelle: 1/50"
  ],
  "technicalSpecs": {
    "scale": "1:50",
    "orientation": "Nord en haut",
    "drawingDate": "Mai 2025"
  },
  "compliance": {
    "buildingCode": "Code du bâtiment local",
    "standards": ["DTU 20.1", "Eurocode 2"],
    "regulations": ["RT 2012", "Accessibilité PMR"]
  },
  "estimatedComplexity": "moderate",
  "confidence": 0.95
}
\`\`\`

## RÈGLES CRITIQUES
1. ✅ **Précision absolue**: Toutes les mesures doivent être exactes
2. ✅ **Exhaustivité**: Ne rien omettre, même les petits détails
3. ✅ **Unités**: Toujours spécifier les unités (m, m², m³, cm, etc.)
4. ✅ **JSON valide**: Réponse strictement en JSON parsable
5. ✅ **Pas d'approximation**: Si une donnée n'est pas lisible, indiquer null

Commencer l'analyse maintenant.`;
  }

  /**
   * Agrège les analyses de plusieurs pages
   */
  private aggregatePageAnalyses(analyses: ClaudeAnalysisResult[]): ClaudeAnalysisResult {
    const totalInputTokens = analyses.reduce((sum, a) => sum + a.metadata.inputTokens, 0);
    const totalOutputTokens = analyses.reduce((sum, a) => sum + a.metadata.outputTokens, 0);
    const totalCost = analyses.reduce((sum, a) => sum + a.metadata.cost, 0);
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

    // Combiner les contenus
    const combinedContent = analyses.map((a, i) => 
      `=== PAGE ${i + 1} ===\n${a.content}`
    ).join('\n\n');

    return {
      content: combinedContent,
      metadata: {
        model: analyses[0].metadata.model,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        cost: totalCost,
        processingTime: 0
      },
      confidence: avgConfidence
    };
  }

  /**
   * Extrait les données architecturales structurées depuis le contenu JSON
   */
  private extractArchitecturalData(content: string): ArchitecturalPlanData {
    try {
      // Extraire le JSON du contenu (peut être entouré de markdown ou avoir plusieurs pages)
      let jsonStr = '';
      
      // Cas 1: JSON dans des blocs markdown
      const markdownMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        jsonStr = markdownMatch[1];
      } else {
        // Cas 2: Plusieurs pages séparées par === PAGE X ===
        // Extraire seulement le premier JSON valide
        const pageMatches = content.split(/=== PAGE \d+ ===/g);
        for (const pageContent of pageMatches) {
          const jsonMatch = pageContent.match(/\{[\s\S]*?\}(?=\s*$|\s*=== PAGE)/m);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
            break;
          }
        }
      }
      
      if (!jsonStr) {
        throw new Error('Aucun JSON trouvé dans la réponse');
      }

      const data = JSON.parse(jsonStr);

      return data as ArchitecturalPlanData;

    } catch (error) {
      console.error('❌ Erreur parsing données architecturales:', error);
      
      // Retourner structure par défaut en cas d'erreur
      return {
        planType: 'floor_plan',
        measurements: {
          rooms: [],
          walls: [],
          openings: []
        },
        materials: [],
        annotations: [],
        technicalSpecs: {},
        compliance: {},
        estimatedComplexity: 'moderate',
        confidence: 0.5
      };
    }
  }

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  /**
   * Convertit ArrayBuffer en Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Calcule le coût d'une requête Claude
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const costs = ClaudeServiceDirect.COSTS[this.config.model as keyof typeof ClaudeServiceDirect.COSTS];
    
    if (!costs) {
      console.warn('⚠️ Coûts non définis pour le modèle:', this.config.model);
      return 0;
    }

    const inputCost = (inputTokens / 1000000) * costs.input * 600; // Conversion USD → FCFA
    const outputCost = (outputTokens / 1000000) * costs.output * 600;
    
    return inputCost + outputCost;
  }

  /**
   * Health check du service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'test'
          }
        ]
      });

      return response.content.length > 0;
    } catch (error) {
      console.error('❌ Claude health check failed:', error);
      return false;
    }
  }

  /**
   * Obtenir les modèles disponibles
   */
  static getAvailableModels() {
    return ClaudeServiceDirect.MODELS;
  }

  /**
   * Obtenir les coûts par modèle
   */
  static getCosts() {
    return ClaudeServiceDirect.COSTS;
  }
}

// ============================================================================
// EXPORT INSTANCE SINGLETON
// ============================================================================

let claudeServiceDirectInstance: ClaudeServiceDirect | null = null;

export function initializeClaudeServiceDirect(apiKey: string, model?: string): ClaudeServiceDirect {
  claudeServiceDirectInstance = new ClaudeServiceDirect({
    apiKey,
    model: model || ClaudeServiceDirect.getAvailableModels().SONNET
  });
  
  return claudeServiceDirectInstance;
}

export function getClaudeServiceDirect(): ClaudeServiceDirect {
  if (!claudeServiceDirectInstance) {
    throw new Error('❌ ClaudeServiceDirect non initialisé. Appelez initializeClaudeServiceDirect() d\'abord.');
  }
  
  return claudeServiceDirectInstance;
}

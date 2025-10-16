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
import { jsonrepair } from 'jsonrepair';

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
      area?: number;
      dimensions?: { length?: number; width?: number; height?: number } | string;
      floor?: number;
      purpose?: string;
    }>;
    walls?: Array<{
      type?: 'load_bearing' | 'partition' | 'exterior' | 'interior' | string;
      material?: string;
      thickness?: number;
      length?: number;
    }>;
    openings?: Array<{
      type?: 'door' | 'window' | 'opening' | string;
      dimensions?: { width?: number; height?: number };
      location?: string;
    }>;
  };
  materials: Array<{
    category?: string;
    name?: string;
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
  
  // Modèles Claude disponibles (versions récentes uniquement)
  private static readonly MODELS = {
    SONNET: 'claude-sonnet-4-5-20250929', // Snapshot le plus récent recommandé
    SONNET_4: 'claude-sonnet-4-20250514',
    SONNET_3_7: 'claude-3-7-sonnet-20250219',
    OPUS_4_1: 'claude-opus-4.1-20250805',
    OPUS_4: 'claude-opus-4-20250514',
    HAIKU_3_5: 'claude-3-5-haiku-20241022'
  } as const;

  // Coûts par token (en FCFA, taux 1 USD = 600 FCFA)
  private static readonly COSTS = {
    // Sonnet 4.x & dérivés
    'claude-sonnet-4-5-20250929': { input: 0.0018, output: 0.009 },
    'claude-sonnet-4-20250514': { input: 0.0018, output: 0.009 },
    'claude-3-7-sonnet-20250219': { input: 0.0018, output: 0.009 },

    // Opus 4.x & legacy
    'claude-opus-4.1-20250805': { input: 0.015, output: 0.075 },
    'claude-opus-4-20250514': { input: 0.015, output: 0.075 },

    // Haiku 3.x
    'claude-3-5-haiku-20241022': { input: 0.0006, output: 0.0018 }
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
      maxTokens: config.maxTokens || 16384, // Augmenté pour plans complexes (R+2, nombreuses pièces)
      temperature: config.temperature || 0.2
    };

    console.log('✅ ClaudeServiceDirect initialisé avec modèle:', this.config.model);
  }

  // ==========================================================================
  // ANALYSE PDF SANS PERTE
  // ==========================================================================

  /**
   * Détecte la complexité du plan et ajuste max_tokens dynamiquement
   */
  private detectComplexityAndAdjustTokens(metadata: PDFMetadata): number {
    const pageCount = metadata.pageCount;
    const fileSize = metadata.fileSize;
    
    // Détection basée sur le nombre de pages et la taille du fichier
    let estimatedComplexity: 'simple' | 'medium' | 'complex' | 'very_complex';
    let maxTokens: number;
    
    if (pageCount <= 3 && fileSize < 2_000_000) {
      // R+0, R+1 : Plans simples
      estimatedComplexity = 'simple';
      maxTokens = 8192;
    } else if (pageCount <= 10 && fileSize < 5_000_000) {
      // R+2, R+3 : Plans moyens
      estimatedComplexity = 'medium';
      maxTokens = 16384;
    } else if (pageCount <= 20 && fileSize < 15_000_000) {
      // R+4 à R+7 : Plans complexes
      estimatedComplexity = 'complex';
      maxTokens = 32768;
    } else {
      // R+8+ : Plans très complexes
      estimatedComplexity = 'very_complex';
      maxTokens = 65536; // Maximum pour Claude
    }
    
    console.log(`🎯 Complexité détectée: ${estimatedComplexity} (${pageCount} pages, ${(fileSize / 1_000_000).toFixed(1)} MB)`);
    console.log(`⚙️ max_tokens ajusté: ${maxTokens.toLocaleString()}`);
    
    return maxTokens;
  }

  /**
   * Analyse un PDF architectural en préservant 100% de la qualité
   * Découpe automatiquement en pages si nécessaire
   * Ajuste dynamiquement les paramètres selon la complexité
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
    
    // Étape 1.5: Ajuster max_tokens selon la complexité détectée
    const adaptiveMaxTokens = this.detectComplexityAndAdjustTokens(metadata);
    const originalMaxTokens = this.config.maxTokens;
    this.config.maxTokens = adaptiveMaxTokens;

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
    
    // Restaurer la configuration originale
    this.config.maxTokens = originalMaxTokens;

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
      // Utiliser streaming pour éviter les timeouts sur requêtes longues (>10min)
      console.log('🔄 Démarrage analyse streaming (max_tokens:', this.config.maxTokens, ')');
      
      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: true, // CRITIQUE : Activer streaming pour requêtes longues
        messages: [
          {
            role: 'user',
            content
          }
        ]
      });

      // Accumuler le contenu streamé
      let textContent = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let modelUsed = this.config.model;

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          textContent += event.delta.text;
          // Afficher progression (optionnel)
          if (outputTokens % 100 === 0 && outputTokens > 0) {
            console.log(`📝 Tokens générés: ${outputTokens}...`);
          }
        } else if (event.type === 'message_start') {
          inputTokens = event.message.usage.input_tokens;
          modelUsed = event.message.model;
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage.output_tokens;
        }
      }

      console.log('✅ Streaming terminé - Tokens:', inputTokens, 'in /', outputTokens, 'out');

      const cost = this.calculateCost(inputTokens, outputTokens);

      return {
        content: textContent,
        metadata: {
          model: modelUsed,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
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
    return `# ANALYSE PLAN ARCHITECTURAL - EXTRACTION COMPLÈTE

**Fichier**: ${metadata.fileName} | **Pages**: ${pages.map(p => p.pageNumber).join(', ')}

## OBJECTIF
Extraire TOUTES les pièces et informations du plan. Ne rien omettre. AUCUNE EXCEPTION.

## INSTRUCTIONS ESSENTIELLES

### 1. PIÈCES/ESPACES (PRIORITÉ ABSOLUE)
Pour CHAQUE pièce/espace visible, INCLURE ABSOLUMENT :

**A. Espaces résidentiels**
- Chambres (principales, secondaires, parentales)
- Salons, séjours, salles à manger (SAM)
- Cuisines (ouvertes, fermées, kitchenettes)
- Salles de bain (SDB), salles d'eau
- Dressings, rangements, placards intégrés
- Buanderies, celliers

**B. Espaces commerciaux et professionnels**
- Boutiques, commerces, magasins
- Bureaux (individuels, open-space)
- Salles de réunion, salles de conférence
- Espaces d'accueil, réceptions
- Showrooms, espaces d'exposition
- Ateliers, zones de production

**C. Espaces sanitaires (OBLIGATOIRE)**
- WC individuels (ex: "WC Boutique 1")
- WC communs, WC PMR (handicapés)
- Salles d'eau, douches
- Vestiaires, sanitaires collectifs

**D. Espaces extérieurs (OBLIGATOIRE)**
- Balcons (même petits < 5m²)
- Terrasses (accessibles, inaccessibles)
- Loggias, vérandas, bow-windows
- Jardins privatifs, cours intérieures
- Toitures-terrasses accessibles

**E. Espaces de circulation (OBLIGATOIRE)**
- Couloirs, dégagements, passages
- Escaliers (principaux, secondaires, de service)
- Halls d'entrée, halls d'immeuble
- Paliers, sas d'entrée
- Ascenseurs (gaines techniques)

**F. Espaces techniques et annexes (OBLIGATOIRE)**
- Locaux techniques (chaufferie, ventilation)
- Caves, sous-sols, parkings souterrains
- Parkings couverts, garages
- Locaux à vélos, locaux poubelles
- Locaux de stockage, archives
- Gaines techniques (électricité, plomberie)

**G. Espaces spécialisés BTP**
- Salles serveurs, locaux informatiques
- Cuisines professionnelles, restaurants
- Salles de sport, fitness, piscines
- Salles de cinéma, auditoriums
- Bibliothèques, médiathèques
- Laboratoires, salles blanches
- Chambres froides, zones réfrigérées

**H. Espaces extérieurs avancés**
- Piscines (intérieures, extérieures, semi-olympiques)
- Jacuzzis, spas, saunas extérieurs
- Pergolas, auvents, préaux
- Abris de jardin, cabanons, remises
- Serres, vérandas bioclimatiques
- Poolhouses, bastides d'été

**I. Équipements spéciaux et confort**
- Ascenseurs privatifs, monte-charges
- Monte-plats, passe-plats
- Home cinéma, salles de jeux
- Caves à vin climatisées
- Saunas, hammams intérieurs
- Salles de sport privées équipées
- Buanderies avec équipements professionnels

**J. Aménagements extérieurs et sécurité**
- Allées, chemins, accès véhicules
- Clôtures, portails, barrières
- Éclairage extérieur (allées, façades, jardins)
- Arrosage automatique, systèmes d'irrigation
- Espaces verts, pelouses, plantations
- Portails automatiques, interphones
- Systèmes de vidéosurveillance extérieure

**K. Équipements techniques avancés**
- Panneaux solaires photovoltaïques
- Éoliennes domestiques
- Systèmes de récupération eaux de pluie
- Citernes, cuves de stockage
- Groupes électrogènes, onduleurs
- Systèmes de ventilation double flux
- Géothermie, puits canadiens
- Pompes à chaleur air/eau, eau/eau
- Domotique avancée (KNX, Z-Wave, Zigbee)
- Systèmes anti-termites, anti-humidité

**L. Éléments spécifiques Afrique de l'Ouest**
- Citernes d'eau (aériennes, enterrées)
- Châteaux d'eau, réservoirs
- Groupes électrogènes (secours, principal)
- Climatisation tropicale renforcée
- Moustiquaires (fenêtres, portes)
- Toitures anti-chaleur, isolation thermique tropicale
- Systèmes de traitement d'eau (filtration, potabilisation)
- Fosses septiques, systèmes d'assainissement autonome
- Protections solaires (brise-soleil, casquettes)

**RÈGLE CRITIQUE** : 
- Fournir la surface pour CHAQUE espace (calculer L×l si non indiquée, estimer si illisible)
- Ne PAS ignorer les petits espaces (WC < 2m², balcons < 5m², couloirs)
- Compter TOUS les espaces, même répétitifs (ex: 10 balcons identiques = 10 entrées)
- Inclure les espaces non chauffés (caves, parkings, balcons)
- Inclure TOUS les équipements visibles sur le plan (citernes, groupes électrogènes, etc.)

### 2. ÉLÉMENTS STRUCTURELS (EXHAUSTIF)
**A. Structure porteuse**
- Fondations (superficielles, profondes, pieux)
- Murs porteurs (béton, parpaing, brique, pierre)
- Poteaux, poutres (béton armé, acier, bois)
- Dalles, planchers (béton, bois, mixte)
- Voiles en béton armé
- Charpente (traditionnelle, fermettes, métallique)

**B. Éléments de cloisonnement**
- Cloisons intérieures (placo, brique, béton cellulaire)
- Cloisons techniques (gaines, doublages)
- Cloisons amovibles, verrières

**C. Toiture et couverture**
- Type de toiture (plate, pente, terrasse)
- Matériau de couverture (tuiles, ardoises, zinc, bac acier)
- Isolation toiture, étanchéité
- Chéneaux, gouttières, descentes EP

**D. Menuiseries extérieures**
- Portes d'entrée (simple, double, blindée)
- Fenêtres (simple, double, triple vitrage)
- Portes-fenêtres, baies vitrées
- Volets (roulants, battants, coulissants)
- Garde-corps, balustrades

**E. Menuiseries intérieures**
- Portes intérieures (pleines, vitrées, coulissantes)
- Portes techniques (coupe-feu, acoustiques)
- Placards intégrés, dressings

### 3. RÉSEAUX ET ÉQUIPEMENTS TECHNIQUES
**A. Électricité**
- Tableau électrique, disjoncteurs
- Prises électriques (nombre, emplacement)
- Points lumineux, interrupteurs
- Réseau informatique, fibre optique
- Domotique, alarme, vidéosurveillance

**B. Plomberie et sanitaires**
- Arrivées d'eau (froide, chaude)
- Évacuations (eaux usées, eaux vannes)
- Équipements sanitaires (lavabos, WC, douches, baignoires)
- Robinetterie

**C. Chauffage et climatisation**
- Type de chauffage (central, individuel, électrique, gaz)
- Radiateurs, plancher chauffant
- Climatisation, ventilation (VMC, VMI)
- Pompe à chaleur, chaudière

**D. Autres réseaux**
- Gaz de ville, gaz bouteille
- Réseau incendie (RIA, sprinklers)
- Ascenseurs, monte-charges
- Vide-ordures

### 4. FINITIONS ET REVÊTEMENTS
**A. Sols**
- Carrelage (type, dimensions, qualité)
- Parquet (massif, flottant, stratifié)
- Béton ciré, résine
- Moquette, vinyle, linoléum

**B. Murs**
- Peinture (type, couleur, finition)
- Papier peint, toile de verre
- Faïence, carrelage mural
- Enduits décoratifs

**C. Plafonds**
- Peinture, enduit
- Faux plafonds (placo, suspendus)
- Moulures, corniches

### 5. INFORMATIONS RÉGLEMENTAIRES BTP
**A. Normes et codes**
- Code du bâtiment local (BAEL, BPEL, Eurocodes)
- DTU applicables (liste complète)
- Normes NF, ISO
- Réglementation thermique (RT 2012, RE 2020)

**B. Accessibilité et sécurité**
- Accessibilité PMR (rampes, ascenseurs, WC adaptés)
- Sécurité incendie (issues de secours, extincteurs, désenfumage)
- Garde-corps (hauteur, résistance)
- Éclairage de sécurité

**C. Performance énergétique**
- Isolation thermique (murs, toiture, sols)
- Ponts thermiques
- Étanchéité à l'air
- Classe énergétique (DPE)

### 6. ANNOTATIONS ET SPÉCIFICATIONS TECHNIQUES
**A. Cotes et mesures**
- Toutes les dimensions (longueur, largeur, hauteur)
- Épaisseurs (murs, dalles, isolants)
- Surfaces (m²), volumes (m³)
- Niveaux, altitudes (NGF)

**B. Notes du concepteur**
- Annotations manuscrites
- Légendes, symboles
- Références aux détails
- Échelle du plan

**C. Matériaux spécifiés**
- Désignation exacte (marque, référence)
- Quantités estimées
- Spécifications techniques
- Normes de mise en œuvre

### 3. COMPLEXITÉ
- low: Simple, régulier
- moderate: Quelques détails
- high: Complexe, nombreux détails
- very_high: Très complexe

## FORMAT DE RÉPONSE
Répondre UNIQUEMENT en JSON structuré selon ce format:

**IMPORTANT** : Utiliser la structure \`floors\` pour organiser les pièces par étage.

\`\`\`json
{
  "planType": "floor_plan",
  "measurements": {
    "totalArea": 150.5,
    "floors": [
      {
        "level": 0,
        "name": "Rez-de-chaussée",
        "totalArea": 250.5,
        "rooms": [
          {
            "name": "Boutique 1",
            "area": 25.65,
            "dimensions": { "length": 5.5, "width": 4.7, "height": 3.0 },
            "floor": 0,
            "purpose": "Commerce"
          },
          {
            "name": "WC Boutique 1",
            "area": 3.25,
            "dimensions": { "length": 1.5, "width": 2.2, "height": 3.0 },
            "floor": 0,
            "purpose": "Sanitaire"
          },
          {
            "name": "Terrasse RDC",
            "area": 12.5,
            "dimensions": { "length": 5.0, "width": 2.5, "height": null },
            "floor": 0,
            "purpose": "Espace extérieur"
          }
        ]
      },
      {
        "level": 1,
        "name": "Étage 1",
        "totalArea": 320.8,
        "rooms": [
          {
            "name": "Salon et SAM - Appartement 1",
            "area": 41.7,
            "dimensions": { "length": 7.5, "width": 5.6, "height": 2.8 },
            "floor": 1,
            "purpose": "Habitation"
          },
          {
            "name": "Balcon - Appartement 1",
            "area": 4.2,
            "dimensions": { "length": 3.0, "width": 1.4, "height": null },
            "floor": 1,
            "purpose": "Espace extérieur"
          }
        ]
      }
    ],
    "rooms": [],
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
  "confidence": 0.95,
  "detailedQuote": {
    "phases": [
      {
        "name": "1. Installation de chantier",
        "description": "Préparation et sécurisation du chantier",
        "items": [
          {
            "designation": "Hangar provisoire 20m²",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 500000,
            "totalPrice": 500000
          },
          {
            "designation": "Clôture provisoire",
            "unit": "ml",
            "quantity": 50,
            "unitPrice": 8000,
            "totalPrice": 400000
          },
          {
            "designation": "Branchement eau provisoire",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 150000,
            "totalPrice": 150000
          }
        ]
      },
      {
        "name": "2. Terrassement et fondations",
        "description": "Préparation terrain et coulage fondations",
        "items": [
          {
            "designation": "Décapage terre végétale",
            "unit": "m²",
            "quantity": 150,
            "unitPrice": 2500,
            "totalPrice": 375000
          },
          {
            "designation": "Fouilles en rigole",
            "unit": "ml",
            "quantity": 60,
            "unitPrice": 15000,
            "totalPrice": 900000
          },
          {
            "designation": "Béton de propreté",
            "unit": "m³",
            "quantity": 8,
            "unitPrice": 75000,
            "totalPrice": 600000
          },
          {
            "designation": "Ferraillage semelles",
            "unit": "kg",
            "quantity": 2250,
            "unitPrice": 800,
            "totalPrice": 1800000
          },
          {
            "designation": "Béton fondations C25/30",
            "unit": "m³",
            "quantity": 23,
            "unitPrice": 120000,
            "totalPrice": 2760000
          }
        ]
      },
      {
        "name": "3. Assainissement",
        "description": "Système évacuation eaux usées",
        "items": [
          {
            "designation": "Fosse septique 3000L",
            "unit": "u",
            "quantity": 1,
            "unitPrice": 850000,
            "totalPrice": 850000
          },
          {
            "designation": "Canalisations PVC Ø110",
            "unit": "ml",
            "quantity": 30,
            "unitPrice": 8500,
            "totalPrice": 255000
          }
        ]
      },
      {
        "name": "4. Gros œuvre",
        "description": "Structure, maçonnerie, dalles",
        "items": [
          {
            "designation": "Parpaings 15x20x50",
            "unit": "u",
            "quantity": 7500,
            "unitPrice": 400,
            "totalPrice": 3000000
          },
          {
            "designation": "Ciment CPJ 45",
            "unit": "sac",
            "quantity": 1200,
            "unitPrice": 6500,
            "totalPrice": 7800000
          },
          {
            "designation": "Fer à béton HA",
            "unit": "kg",
            "quantity": 3750,
            "unitPrice": 800,
            "totalPrice": 3000000
          },
          {
            "designation": "Béton dalle C25/30",
            "unit": "m³",
            "quantity": 23,
            "unitPrice": 120000,
            "totalPrice": 2760000
          }
        ]
      },
      {
        "name": "5. Charpente et couverture",
        "description": "Structure toiture et étanchéité",
        "items": [
          {
            "designation": "Charpente bois",
            "unit": "m²",
            "quantity": 150,
            "unitPrice": 18000,
            "totalPrice": 2700000
          },
          {
            "designation": "Couverture tôles bac acier",
            "unit": "m²",
            "quantity": 150,
            "unitPrice": 12000,
            "totalPrice": 1800000
          }
        ]
      },
      {
        "name": "6. Menuiseries extérieures",
        "description": "Portes, fenêtres, volets",
        "items": [
          {
            "designation": "Porte d'entrée blindée",
            "unit": "u",
            "quantity": 1,
            "unitPrice": 450000,
            "totalPrice": 450000
          },
          {
            "designation": "Fenêtres aluminium",
            "unit": "u",
            "quantity": 12,
            "unitPrice": 85000,
            "totalPrice": 1020000
          }
        ]
      },
      {
        "name": "7. Électricité",
        "description": "Installation électrique complète",
        "items": [
          {
            "designation": "Tableau électrique",
            "unit": "u",
            "quantity": 1,
            "unitPrice": 350000,
            "totalPrice": 350000
          },
          {
            "designation": "Câblage général",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 1500000,
            "totalPrice": 1500000
          },
          {
            "designation": "Prises et interrupteurs",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 800000,
            "totalPrice": 800000
          }
        ]
      },
      {
        "name": "8. Plomberie sanitaire",
        "description": "Réseau eau et équipements",
        "items": [
          {
            "designation": "Réseau eau froide/chaude",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 1200000,
            "totalPrice": 1200000
          },
          {
            "designation": "Chauffe-eau 200L",
            "unit": "u",
            "quantity": 1,
            "unitPrice": 250000,
            "totalPrice": 250000
          },
          {
            "designation": "WC complets",
            "unit": "u",
            "quantity": 3,
            "unitPrice": 85000,
            "totalPrice": 255000
          },
          {
            "designation": "Lavabos avec robinetterie",
            "unit": "u",
            "quantity": 3,
            "unitPrice": 65000,
            "totalPrice": 195000
          }
        ]
      },
      {
        "name": "9. Carrelage et faïence",
        "description": "Revêtements sols et murs",
        "items": [
          {
            "designation": "Carrelage sols 60x60",
            "unit": "m²",
            "quantity": 150,
            "unitPrice": 12000,
            "totalPrice": 1800000
          },
          {
            "designation": "Faïence murale cuisine/SDB",
            "unit": "m²",
            "quantity": 40,
            "unitPrice": 15000,
            "totalPrice": 600000
          }
        ]
      },
      {
        "name": "10. Menuiseries intérieures",
        "description": "Portes et placards",
        "items": [
          {
            "designation": "Portes intérieures isoplane",
            "unit": "u",
            "quantity": 8,
            "unitPrice": 45000,
            "totalPrice": 360000
          },
          {
            "designation": "Placards intégrés",
            "unit": "ml",
            "quantity": 6,
            "unitPrice": 55000,
            "totalPrice": 330000
          }
        ]
      },
      {
        "name": "11. Peinture et finitions",
        "description": "Revêtements muraux et décoration",
        "items": [
          {
            "designation": "Enduit intérieur",
            "unit": "m²",
            "quantity": 400,
            "unitPrice": 3500,
            "totalPrice": 1400000
          },
          {
            "designation": "Peinture intérieure",
            "unit": "m²",
            "quantity": 400,
            "unitPrice": 4500,
            "totalPrice": 1800000
          },
          {
            "designation": "Enduit extérieur crépi",
            "unit": "m²",
            "quantity": 250,
            "unitPrice": 5000,
            "totalPrice": 1250000
          }
        ]
      },
      {
        "name": "12. Nettoyage final",
        "description": "Remise en état et finitions",
        "items": [
          {
            "designation": "Évacuation gravats",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 300000,
            "totalPrice": 300000
          },
          {
            "designation": "Nettoyage complet",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 200000,
            "totalPrice": 200000
          }
        ]
      },
      {
        "name": "13. Réception et livraison",
        "description": "Contrôles et remise des clés",
        "items": [
          {
            "designation": "Essais installations",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 150000,
            "totalPrice": 150000
          },
          {
            "designation": "Contrôle qualité",
            "unit": "forfait",
            "quantity": 1,
            "unitPrice": 100000,
            "totalPrice": 100000
          }
        ]
      }
    ]
  }
}
\`\`\`

## RÈGLES CRITIQUES
1. ✅ **Précision absolue**: Toutes les mesures doivent être exactes
2. ✅ **Exhaustivité**: Ne rien omettre, même les petits détails
3. ✅ **Unités**: Toujours spécifier les unités (m, m², m³, cm, etc.)
4. ✅ **JSON valide**: Réponse strictement en JSON parsable
5. ✅ **Surfaces obligatoires**: CHAQUE pièce DOIT avoir une surface (area) > 0
   - Calculer depuis dimensions si surface non indiquée
   - Estimer si aucune donnée disponible
   - Ne JAMAIS mettre null ou 0
6. ✅ **Pas d'approximation**: Si une donnée n'est pas lisible, indiquer null (sauf pour area)

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
    // DEBUG: Afficher le contenu brut reçu de Claude
    console.log('🔍 DEBUG - Contenu brut reçu de Claude (premiers 500 caractères):');
    console.log(content.substring(0, 500));
    console.log('🔍 DEBUG - Longueur totale du contenu:', content.length);
    
    const candidateSet = new Set<string>();

    const addCandidate = (raw?: string | null) => {
      if (raw && raw.trim()) {
        candidateSet.add(raw.trim());
      }
    };

    // Cas 1: un ou plusieurs blocs ```json ... ```
    const markdownMatches = [...content.matchAll(/```json\s*([\s\S]*?)```/g)];
    console.log('🔍 DEBUG - Blocs ```json``` trouvés:', markdownMatches.length);
    markdownMatches.forEach(match => addCandidate(match[1]));

    // Cas 2: Contenus séparés par "=== PAGE X ==="
    if (candidateSet.size === 0) {
      const pageSections = content.split(/=== PAGE \d+ ===/g);
      for (const section of pageSections) {
        addCandidate(section);
      }
    }

    // Cas 3: fallback - tout le contenu
    if (candidateSet.size === 0 && content.includes('{')) {
      addCandidate(content);
    }

    // Cas 4: Extraire tous les objets JSON équilibrés dans le contenu complet
    const balancedCandidates: string[] = [];
    let depth = 0;
    let startIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (inString) {
        if (escapeNext) {
          escapeNext = false;
        } else if (char === '\\') {
          escapeNext = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        if (depth === 0) {
          startIndex = i;
        }
        depth += 1;
      } else if (char === '}') {
        if (depth > 0) {
          depth -= 1;
          if (depth === 0 && startIndex !== -1) {
            balancedCandidates.push(content.slice(startIndex, i + 1));
            startIndex = -1;
          }
        }
      }
    }

    balancedCandidates.forEach(candidate => addCandidate(candidate));

    console.log('🔍 DEBUG - Nombre total de candidats JSON:', candidateSet.size);

    // Parcourir les candidats et retourner le premier JSON valide
    let candidateIndex = 0;
    for (const candidate of candidateSet) {
      candidateIndex++;
      console.log(`🔍 DEBUG - Test candidat ${candidateIndex}/${candidateSet.size} (longueur: ${candidate.length})`);
      
      const startIndex = candidate.indexOf('{');
      const endIndex = candidate.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        console.log(`⚠️ DEBUG - Candidat ${candidateIndex} ignoré: pas de JSON valide`);
        continue;
      }

      const core = candidate.slice(startIndex, endIndex + 1);
      const sanitized = Array.from(core)
        .filter(char => {
          const code = char.charCodeAt(0);
          // Garder tab (9), LF (10), CR (13) et tout caractère imprimable >= 32
          return code === 9 || code === 10 || code === 13 || code >= 32;
        })
        .join('')
        .trim();

      if (!sanitized) {
        console.log(`⚠️ DEBUG - Candidat ${candidateIndex} ignoré: contenu vide après sanitization`);
        continue;
      }

      console.log(`🔍 DEBUG - Candidat ${candidateIndex} - Tentative de parsing (premiers 200 chars):`, sanitized.substring(0, 200));

      try {
        const repaired = jsonrepair(sanitized);
        const data = JSON.parse(repaired);
        console.log('✅ DEBUG - JSON parsé avec succès! Clés:', Object.keys(data));
        console.log('✅ DEBUG - Nombre de pièces dans measurements.rooms:', data.measurements?.rooms?.length || 0);
        console.log('✅ DEBUG - Nombre de pièces dans functionalProgram.rooms:', data.functionalProgram?.rooms?.length || 0);
        console.log('✅ DEBUG - Nombre de drawings:', data.drawings?.length || 0);
        const normalized = this.normalizeArchitecturalData(data);
        console.log('✅ DEBUG - Après normalisation - Nombre de pièces:', normalized.measurements.rooms?.length || 0);
        return normalized;
      } catch (parseError) {
        console.error(`❌ DEBUG - Candidat ${candidateIndex} - Erreur de parsing:`, parseError);
        console.log(`❌ DEBUG - Candidat ${candidateIndex} - JSON problématique (premiers 300 chars):`, sanitized.substring(0, 300));
        try {
          // Dernier recours: essayer de parser sans réparation pour log précis
          JSON.parse(sanitized);
        } catch (rawParseError) {
          console.warn('⚠️ JSON brut invalide après tentative de réparation:', rawParseError);
        }
        // Essayer le candidat suivant
        console.warn('⚠️ JSON invalide ignoré lors du parsing architectural (après jsonrepair):', parseError);
      }
    }

    console.error('❌ Erreur parsing données architecturales: aucun JSON valide trouvé');
    console.error('❌ DEBUG - Contenu complet reçu de Claude:');
    console.error(content);

    // Retourner structure par défaut en cas d'échec
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

  private normalizeArchitecturalData(rawData: unknown): ArchitecturalPlanData {
    const asObject = (value: unknown): Record<string, unknown> | undefined => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
      return undefined;
    };

    const asArray = (value: unknown): unknown[] | undefined => {
      if (Array.isArray(value)) {
        return value;
      }
      return undefined;
    };

    const parseNumeric = (value: unknown): number | undefined => {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value
          .replace(/,/g, '.')
          .replace(/[^0-9.-]+/g, ' ')
          .trim();
        const tokens = normalized.match(/-?\d+(?:\.\d+)?/);
        if (tokens) {
          const parsed = parseFloat(tokens[0]);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
      return undefined;
    };

    const planTypes: Array<ArchitecturalPlanData['planType']> = [
      'floor_plan',
      'elevation',
      'section',
      'site_plan',
      'detail',
      'structural',
      'electrical',
      'plumbing'
    ];

    const complexityLevels: Array<ArchitecturalPlanData['estimatedComplexity']> = [
      'low',
      'moderate',
      'high',
      'very_high'
    ];

    const dataObj = asObject(rawData) ?? {};
    const planTypeValue = typeof dataObj.planType === 'string' ? dataObj.planType.trim() : '';
    const complexityValue = typeof dataObj.estimatedComplexity === 'string' ? dataObj.estimatedComplexity.trim() : '';

    const data: ArchitecturalPlanData = {
      planType: planTypes.includes(planTypeValue as ArchitecturalPlanData['planType'])
        ? (planTypeValue as ArchitecturalPlanData['planType'])
        : 'floor_plan',
      measurements: {
        totalArea: undefined,
        rooms: [],
        walls: [],
        openings: []
      },
      materials: [],
      annotations: [],
      technicalSpecs: {},
      compliance: {},
      estimatedComplexity: complexityLevels.includes(complexityValue as ArchitecturalPlanData['estimatedComplexity'])
        ? (complexityValue as ArchitecturalPlanData['estimatedComplexity'])
        : 'moderate',
      confidence: parseNumeric(dataObj.confidence) ?? 0.5
    };

    const measurementsObj = asObject(dataObj.measurements);
    if (measurementsObj) {
      const totalArea = parseNumeric(measurementsObj.totalArea);
      if (totalArea !== undefined) {
        data.measurements.totalArea = totalArea;
      }

      // Chercher les pièces dans measurements.rooms
      let roomsArray = asArray(measurementsObj.rooms);
      
      // FALLBACK 0: Chercher dans measurements.floors (structure par étage - nouveau format)
      if (!roomsArray || roomsArray.length === 0) {
        console.log('🔍 DEBUG - Aucune pièce dans measurements.rooms, recherche dans measurements.floors...');
        const floorsArray = asArray(measurementsObj.floors);
        if (floorsArray && floorsArray.length > 0) {
          console.log('🔍 DEBUG - floors trouvés:', floorsArray.length);
          const allRooms: unknown[] = [];
          
          // Parcourir tous les étages
          floorsArray.forEach((floor, index) => {
            const floorObj = asObject(floor);
            if (floorObj) {
              const floorRooms = asArray(floorObj.rooms);
              if (floorRooms && floorRooms.length > 0) {
                console.log(`🔍 DEBUG - ${floorRooms.length} pièces trouvées dans étage ${index} (${floorObj.level || floorObj.name})`);
                allRooms.push(...floorRooms);
              }
            }
          });
          
          if (allRooms.length > 0) {
            roomsArray = allRooms;
            console.log('🔍 DEBUG - Total pièces trouvées dans floors:', roomsArray.length);
          }
        }
      }

      // FALLBACK 1: Chercher dans measurements.floorsByLevel (ancien format)
      if (!roomsArray || roomsArray.length === 0) {
        console.log('🔍 DEBUG - Aucune pièce dans measurements.floors, recherche dans measurements.floorsByLevel...');
        const floorsByLevelObj = asObject(measurementsObj.floorsByLevel);
        if (floorsByLevelObj) {
          console.log('🔍 DEBUG - floorsByLevel clés:', Object.keys(floorsByLevelObj));
          const allRooms: unknown[] = [];
          
          // Parcourir tous les étages (rdc, etage1, etage2, etc.)
          Object.keys(floorsByLevelObj).forEach(floorKey => {
            const floorObj = asObject(floorsByLevelObj[floorKey]);
            if (floorObj) {
              const floorRooms = asArray(floorObj.rooms);
              if (floorRooms && floorRooms.length > 0) {
                console.log(`🔍 DEBUG - ${floorRooms.length} pièces trouvées dans ${floorKey}`);
                allRooms.push(...floorRooms);
              }
            }
          });
          
          if (allRooms.length > 0) {
            roomsArray = allRooms;
            console.log('🔍 DEBUG - Total pièces trouvées dans floorsByLevel:', roomsArray.length);
          }
        }
      }
      
      // FALLBACK 2: Chercher dans buildingConfiguration si measurements.rooms est vide
      if (!roomsArray || roomsArray.length === 0) {
        console.log('🔍 DEBUG - Aucune pièce dans measurements.floors, recherche dans buildingConfiguration...');
        const buildingConfigObj = asObject(dataObj.buildingConfiguration);
        if (buildingConfigObj) {
          console.log('🔍 DEBUG - buildingConfiguration clés:', Object.keys(buildingConfigObj));
          
          // Essayer rooms
          roomsArray = asArray(buildingConfigObj.rooms);
          console.log('🔍 DEBUG - Pièces trouvées dans buildingConfiguration.rooms:', roomsArray?.length || 0);
          
          // Essayer spaces
          if (!roomsArray || roomsArray.length === 0) {
            roomsArray = asArray(buildingConfigObj.spaces);
            console.log('🔍 DEBUG - Pièces trouvées dans buildingConfiguration.spaces:', roomsArray?.length || 0);
          }
          
          // Essayer floors (étages avec pièces)
          if (!roomsArray || roomsArray.length === 0) {
            const floorsArray = asArray(buildingConfigObj.floors);
            if (floorsArray) {
              console.log('🔍 DEBUG - Nombre d\'étages:', floorsArray.length);
              const allRooms: unknown[] = [];
              floorsArray.forEach((floor: unknown) => {
                const floorObj = asObject(floor);
                if (floorObj) {
                  const floorRooms = asArray(floorObj.rooms) || asArray(floorObj.spaces);
                  if (floorRooms) {
                    allRooms.push(...floorRooms);
                  }
                }
              });
              if (allRooms.length > 0) {
                roomsArray = allRooms;
                console.log('🔍 DEBUG - Pièces trouvées dans buildingConfiguration.floors:', roomsArray.length);
              }
            }
          }
        }
      }
      
      // FALLBACK 3: Chercher dans functionalProgram.rooms si toujours vide
      if (!roomsArray || roomsArray.length === 0) {
        console.log('🔍 DEBUG - Aucune pièce dans buildingConfiguration, recherche dans functionalProgram...');
        const functionalProgramObj = asObject(dataObj.functionalProgram);
        if (functionalProgramObj) {
          roomsArray = asArray(functionalProgramObj.rooms);
          console.log('🔍 DEBUG - Pièces trouvées dans functionalProgram.rooms:', roomsArray?.length || 0);
          
          // FALLBACK 3.1: Chercher dans functionalProgram.targets
          if (!roomsArray || roomsArray.length === 0) {
            console.log('🔍 DEBUG - Aucune pièce dans functionalProgram.rooms, recherche dans functionalProgram.targets...');
            roomsArray = asArray(functionalProgramObj.targets);
            console.log('🔍 DEBUG - Pièces trouvées dans functionalProgram.targets:', roomsArray?.length || 0);
          }
        }
      }
      
      // FALLBACK 4: Chercher dans drawings (plans d'étage)
      if (!roomsArray || roomsArray.length === 0) {
        console.log('🔍 DEBUG - Aucune pièce dans functionalProgram, recherche dans drawings...');
        const drawingsArray = asArray(dataObj.drawings);
        if (drawingsArray) {
          console.log('🔍 DEBUG - Nombre de drawings:', drawingsArray.length);
          
          // Chercher dans chaque drawing
          for (const drawing of drawingsArray) {
            const drawingObj = asObject(drawing);
            if (drawingObj) {
              console.log('🔍 DEBUG - Drawing type:', drawingObj.type, '- Clés:', Object.keys(drawingObj));
              
              // Essayer rooms
              let drawingRooms = asArray(drawingObj.rooms);
              
              // Essayer spaces si rooms est vide
              if (!drawingRooms || drawingRooms.length === 0) {
                drawingRooms = asArray(drawingObj.spaces);
              }
              
              // Essayer elements si toujours vide
              if (!drawingRooms || drawingRooms.length === 0) {
                drawingRooms = asArray(drawingObj.elements);
              }
              
              if (drawingRooms && drawingRooms.length > 0) {
                roomsArray = drawingRooms;
                console.log('🔍 DEBUG - Pièces trouvées dans drawing:', roomsArray.length);
                break;
              }
            }
          }
        }
      }
      
      // Si toujours aucune pièce trouvée, afficher le JSON complet pour debug
      if (!roomsArray || roomsArray.length === 0) {
        console.error('❌ DEBUG - Aucune pièce trouvée nulle part ! Affichage du JSON complet:');
        console.error(JSON.stringify(dataObj, null, 2));
      }
      
      if (roomsArray) {
        data.measurements.rooms = roomsArray.map((roomValue) => {
          const roomObj = asObject(roomValue) ?? {};
          const name = typeof roomObj.name === 'string' && roomObj.name.trim()
            ? roomObj.name.trim()
            : 'Espace non nommé';

          const normalizedRoom: {
            name: string;
            area?: number;
            dimensions?: string | { length?: number; width?: number; height?: number };
            floor?: number;
            purpose?: string;
          } = { name };

          const area = parseNumeric(roomObj.area);
          if (area !== undefined && area > 0) {
            normalizedRoom.area = area;
          } else if (roomObj.area === null || roomObj.area === undefined || area === 0) {
            // Si l'aire est null/0, essayer de calculer depuis dimensions
            const dimensionsObj = asObject(roomObj.dimensions);
            if (dimensionsObj) {
              const length = parseNumeric(dimensionsObj.length);
              const width = parseNumeric(dimensionsObj.width);
              if (length !== undefined && width !== undefined && length > 0 && width > 0) {
                normalizedRoom.area = length * width;
                console.log(`📐 DEBUG - Surface calculée pour "${name}": ${length} × ${width} = ${normalizedRoom.area.toFixed(2)} m²`);
              } else {
                console.warn(`⚠️ DEBUG - Impossible de calculer la surface pour "${name}" - area: ${roomObj.area}, dimensions: ${JSON.stringify(dimensionsObj)}`);
              }
            } else {
              console.warn(`⚠️ DEBUG - Aucune surface ni dimensions pour "${name}" - area: ${roomObj.area}`);
            }
          }

          if (typeof roomObj.dimensions === 'string') {
            normalizedRoom.dimensions = roomObj.dimensions;
          } else {
            const dimensionsObj = asObject(roomObj.dimensions);
            if (dimensionsObj) {
              normalizedRoom.dimensions = {
                length: parseNumeric(dimensionsObj.length),
                width: parseNumeric(dimensionsObj.width),
                height: parseNumeric(dimensionsObj.height)
              };
            }
          }

          const floor = parseNumeric(roomObj.floor);
          if (floor !== undefined) {
            normalizedRoom.floor = floor;
          }

          const purposeCandidates = [roomObj.purpose, roomObj.usage, roomObj.function].filter(
            (value): value is string => typeof value === 'string' && value.trim().length > 0
          );
          if (purposeCandidates.length > 0) {
            normalizedRoom.purpose = purposeCandidates[0].trim();
          }

          return normalizedRoom;
        });
      }

      const wallsArray = asArray(measurementsObj.walls);
      if (wallsArray) {
        data.measurements.walls = wallsArray.map((wallValue) => {
          const wallObj = asObject(wallValue) ?? {};
          return {
            type: typeof wallObj.type === 'string' && wallObj.type.trim()
              ? wallObj.type.trim()
              : 'wall',
            material: typeof wallObj.material === 'string' && wallObj.material.trim()
              ? wallObj.material.trim()
              : 'Inconnu',
            thickness: parseNumeric(wallObj.thickness),
            length: parseNumeric(wallObj.length)
          };
        });
      }

      const openingsArray = asArray(measurementsObj.openings);
      if (openingsArray) {
        data.measurements.openings = openingsArray.map((openingValue) => {
          const openingObj = asObject(openingValue) ?? {};
          const dimensionsObj = asObject(openingObj.dimensions);
          return {
            type: typeof openingObj.type === 'string' && openingObj.type.trim()
              ? openingObj.type.trim()
              : 'opening',
            dimensions: {
              width: parseNumeric(dimensionsObj?.width),
              height: parseNumeric(dimensionsObj?.height)
            },
            location: typeof openingObj.location === 'string' && openingObj.location.trim()
              ? openingObj.location.trim()
              : 'Non spécifiée'
          };
        });
      }
    }

    const materialsArray = asArray(dataObj.materials);
    if (materialsArray) {
      data.materials = materialsArray.map((materialValue) => {
        const materialObj = asObject(materialValue) ?? {};
        return {
          category: typeof materialObj.category === 'string' && materialObj.category.trim()
            ? materialObj.category.trim()
            : 'Divers',
          name: typeof materialObj.name === 'string' && materialObj.name.trim()
            ? materialObj.name.trim()
            : 'Matériau',
          specification: typeof materialObj.specification === 'string' && materialObj.specification.trim()
            ? materialObj.specification.trim()
            : undefined,
          quantity: parseNumeric(materialObj.quantity),
          unit: typeof materialObj.unit === 'string' && materialObj.unit.trim()
            ? materialObj.unit.trim()
            : undefined
        };
      });
    }

    const annotationsArray = asArray(dataObj.annotations);
    if (annotationsArray) {
      data.annotations = annotationsArray
        .filter((note): note is string => typeof note === 'string' && note.trim().length > 0)
        .map((note) => note.trim());
    }

    const technicalSpecsObj = asObject(dataObj.technicalSpecs);
    if (technicalSpecsObj) {
      const specs: Record<string, string> = {};
      Object.entries(technicalSpecsObj).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim()) {
          specs[key] = value.trim();
        }
      });
      data.technicalSpecs = specs;
    }

    const complianceObj = asObject(dataObj.compliance);
    if (complianceObj) {
      const compliance: ArchitecturalPlanData['compliance'] = {};
      if (typeof complianceObj.buildingCode === 'string' && complianceObj.buildingCode.trim()) {
        compliance.buildingCode = complianceObj.buildingCode.trim();
      }
      const standardsArray = asArray(complianceObj.standards)?.filter(
        (standard): standard is string => typeof standard === 'string' && standard.trim().length > 0
      ).map((standard) => standard.trim());
      if (standardsArray && standardsArray.length > 0) {
        compliance.standards = standardsArray;
      }
      const regulationsArray = asArray(complianceObj.regulations)?.filter(
        (regulation): regulation is string => typeof regulation === 'string' && regulation.trim().length > 0
      ).map((regulation) => regulation.trim());
      if (regulationsArray && regulationsArray.length > 0) {
        compliance.regulations = regulationsArray;
      }
      data.compliance = compliance;
    }

    return data;
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

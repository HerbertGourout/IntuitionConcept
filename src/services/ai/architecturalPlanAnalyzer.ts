import { intelligentOcrService, IntelligentOCRResult } from './intelligentOcrService';
import { quoteGenerator, QuoteGenerationRequest, GeneratedQuote } from './quoteGenerator';

export interface ArchitecturalPlanAnalysis {
  planType: 'floor_plan' | 'elevation' | 'section' | 'site_plan' | 'detail' | 'unknown';
  extractedMeasurements: {
    totalArea?: number;
    rooms?: Array<{
      name: string;
      area?: number;
      dimensions?: string;
    }>;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    scale?: string;
  };
  constructionElements: {
    walls?: Array<{
      type: string;
      length?: number;
      thickness?: string;
      material?: string;
    }>;
    openings?: Array<{
      type: 'door' | 'window';
      dimensions?: string;
      quantity?: number;
    }>;
    floors?: Array<{
      material?: string;
      area?: number;
    }>;
    roof?: {
      type?: string;
      area?: number;
      material?: string;
    };
  };
  technicalSpecs: {
    foundations?: string;
    structure?: string;
    utilities?: string[];
    accessibility?: boolean;
  };
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  confidence: number;
}

export interface PlanBasedQuoteRequest extends Omit<QuoteGenerationRequest, 'specifications'> {
  planAnalysis: ArchitecturalPlanAnalysis;
  includeDetailedBreakdown: boolean;
  considerLocalCodes: boolean;
}

// Utility type to represent a deeply partial version of a type
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

class ArchitecturalPlanAnalyzer {
  private openaiApiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  // Analyse complète d'un plan d'architecture
  async analyzePlan(planFile: File): Promise<ArchitecturalPlanAnalysis> {
    try {
      // Validation du fichier
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
      if (!supportedTypes.includes(planFile.type)) {
        throw new Error(`Format de fichier non supporté: ${planFile.type}. Veuillez utiliser une image (JPG, PNG, BMP, TIFF, WebP).`);
      }

      // Vérification de la taille
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (planFile.size > maxSize) {
        throw new Error('Fichier trop volumineux. Taille maximum: 10MB');
      }

      // Étape 1: OCR intelligent du plan
      const ocrResult = await intelligentOcrService.processDocumentIntelligently(planFile);
      
      // Vérification que du texte a été extrait
      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        throw new Error('Impossible d\'extraire du texte du plan. Vérifiez que l\'image est claire et contient du texte lisible.');
      }
      
      // Étape 2: Analyse spécialisée pour plans d'architecture
      const planAnalysis = await this.analyzeArchitecturalContent(ocrResult, planFile);
      
      return planAnalysis;
    } catch (error) {
      console.error('Erreur analyse plan architectural:', error);
      
      // Gestion spécifique des erreurs
      if (error instanceof Error) {
        if (error.message.includes('Type de fichier non supporté') || 
            error.message.includes('Format de fichier non supporté')) {
          throw new Error(error.message);
        }
        if (error.message.includes('Fichier trop volumineux')) {
          throw new Error(error.message);
        }
        if (error.message.includes('Aucun texte détecté') || 
            error.message.includes('Impossible d\'extraire du texte')) {
          throw new Error('Le plan ne contient pas de texte lisible. Assurez-vous que l\'image est de bonne qualité et contient des annotations textuelles.');
        }
      }
      
      throw new Error('Erreur lors de l\'analyse du plan d\'architecture. Vérifiez que le fichier est une image claire d\'un plan architectural.');
    }
  }

  // Génération de devis basée sur l'analyse du plan
  async generateQuoteFromPlan(
    planAnalysis: ArchitecturalPlanAnalysis,
    additionalInfo: Partial<PlanBasedQuoteRequest>
  ): Promise<GeneratedQuote> {
    try {
      // Conversion de l'analyse du plan en spécifications pour le générateur de devis
      const quoteRequest: QuoteGenerationRequest = {
        projectType: this.determineProjectType(planAnalysis),
        description: this.generateProjectDescription(planAnalysis),
        budget: additionalInfo.budget || { min: 5000000, max: 15000000, currency: 'XOF' },
        location: additionalInfo.location || 'Dakar, Sénégal',
        timeline: this.estimateTimeline(planAnalysis),
        specialRequirements: this.extractSpecialRequirements(planAnalysis),
        specifications: {
          surface: planAnalysis.extractedMeasurements.totalArea || 100,
          rooms: planAnalysis.extractedMeasurements.rooms?.length || 3,
          floors: 1, // À améliorer avec détection automatique
          materials: this.extractMaterials(planAnalysis)
        }
      };

      // Génération du devis avec contexte architectural
      const quote = await quoteGenerator.generateQuote(quoteRequest);
      
      // Enrichissement avec données spécifiques au plan
      return this.enrichQuoteWithPlanData(quote, planAnalysis);
    } catch (error) {
      console.error('Erreur génération devis depuis plan:', error);
      throw new Error('Impossible de générer le devis depuis le plan');
    }
  }

  // Analyse spécialisée du contenu architectural
  private async analyzeArchitecturalContent(
    ocrResult: IntelligentOCRResult,
    planFile: File
  ): Promise<ArchitecturalPlanAnalysis> {
    if (!this.openaiApiKey) {
      return this.getFallbackPlanAnalysis(ocrResult);
    }

    try {
      // Analyse IA avancée pour plans d'architecture
      const prompt = `
Analyse ce plan d'architecture BTP et extrais les informations techniques.

CONTRAINTES DE SORTIE: Réponds en JSON STRICT UNIQUEMENT, sans texte additionnel ni markdown.

TEXTE EXTRAIT DU PLAN:
${ocrResult.text}

TYPE DE FICHIER: ${planFile.name}

Schéma JSON attendu (exemple de structure, types indicatifs):
{
  "planType": "floor_plan|elevation|section|site_plan|detail|unknown",
  "extractedMeasurements": {
    "totalArea": 120.5,
    "rooms": [{"name": "Chambre", "area": 12.3, "dimensions": "3x4"}],
    "dimensions": {"length": 10.2, "width": 8.0, "height": 2.8},
    "scale": "1/100"
  },
  "constructionElements": {
    "walls": [{"type": "porteuse", "length": 8.5, "thickness": "20cm", "material": "béton"}],
    "openings": [{"type": "door", "dimensions": "90x210", "quantity": 3}],
    "floors": [{"material": "carrelage", "area": 60}],
    "roof": {"type": "2 pentes", "area": 120, "material": "tôle"}
  },
  "technicalSpecs": {
    "foundations": "semelles filantes",
    "structure": "voile béton",
    "utilities": ["electricite", "plomberie"],
    "accessibility": true
  },
  "estimatedComplexity": "moderate",
  "confidence": 78
}

Ne renvoie que l'objet JSON final, sans explications.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000,
          // Tente d'imposer un JSON strict si le modèle le supporte
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';

      // Parsing robuste de la réponse du modèle
      const parsed = this.parseModelJson(content);
      if (parsed) {
        return this.validateAndNormalizePlanAnalysis(parsed as DeepPartial<ArchitecturalPlanAnalysis>);
      }

      throw new Error('Format de réponse invalide (JSON non détecté)');
    } catch (error) {
      console.error('Erreur analyse IA plan:', error);
      return this.getFallbackPlanAnalysis(ocrResult);
    }
  }

  // Détermination du type de projet basé sur l'analyse
  private determineProjectType(analysis: ArchitecturalPlanAnalysis): string {
    const totalArea = analysis.extractedMeasurements.totalArea || 0;
    const roomCount = analysis.extractedMeasurements.rooms?.length || 0;
    
    if (totalArea > 300 || roomCount > 8) {
      return 'construction'; // Grande construction
    }
    
    if (analysis.constructionElements.walls?.some(w => w.material?.includes('existant'))) {
      return 'renovation'; // Rénovation détectée
    }
    
    return 'construction'; // Construction par défaut
  }

  // Génération de description de projet
  private generateProjectDescription(analysis: ArchitecturalPlanAnalysis): string {
    const area = analysis.extractedMeasurements.totalArea;
    const rooms = analysis.extractedMeasurements.rooms?.length;
    const complexity = analysis.estimatedComplexity;
    
    let description = `Projet de construction`;
    
    if (area) {
      description += ` de ${area}m²`;
    }
    
    if (rooms) {
      description += ` comprenant ${rooms} pièces`;
    }
    
    switch (complexity) {
      case 'simple':
        description += ' - Construction standard';
        break;
      case 'moderate':
        description += ' - Construction avec éléments techniques modérés';
        break;
      case 'complex':
        description += ' - Construction complexe avec spécifications techniques avancées';
        break;
      case 'very_complex':
        description += ' - Construction très complexe nécessitant expertise spécialisée';
        break;
    }
    
    return description;
  }

  // Estimation des délais basée sur la complexité
  private estimateTimeline(analysis: ArchitecturalPlanAnalysis): string {
    const area = analysis.extractedMeasurements.totalArea || 100;
    const complexity = analysis.estimatedComplexity;
    
    let baseMonths = Math.ceil(area / 50); // 50m² par mois de base
    
    switch (complexity) {
      case 'simple':
        baseMonths *= 1;
        break;
      case 'moderate':
        baseMonths *= 1.3;
        break;
      case 'complex':
        baseMonths *= 1.6;
        break;
      case 'very_complex':
        baseMonths *= 2;
        break;
    }
    
    return `${Math.max(2, Math.ceil(baseMonths))} mois`;
  }

  // Extraction des exigences spéciales
  private extractSpecialRequirements(analysis: ArchitecturalPlanAnalysis): string[] {
    const requirements: string[] = [];
    
    if (analysis.technicalSpecs.accessibility) {
      requirements.push('Accessibilité PMR');
    }
    
    if (analysis.technicalSpecs.utilities?.includes('climatisation')) {
      requirements.push('Installation climatisation');
    }
    
    if (analysis.estimatedComplexity === 'very_complex') {
      requirements.push('Supervision technique spécialisée');
    }
    
    if (analysis.extractedMeasurements.totalArea && analysis.extractedMeasurements.totalArea > 500) {
      requirements.push('Gestion de chantier grande envergure');
    }
    
    return requirements;
  }

  // Extraction des matériaux
  private extractMaterials(analysis: ArchitecturalPlanAnalysis): string[] {
    const materials: string[] = [];
    
    // Matériaux des murs
    analysis.constructionElements.walls?.forEach(wall => {
      if (wall.material) materials.push(wall.material);
    });
    
    // Matériaux des sols
    analysis.constructionElements.floors?.forEach(floor => {
      if (floor.material) materials.push(floor.material);
    });
    
    // Matériaux de toiture
    if (analysis.constructionElements.roof?.material) {
      materials.push(analysis.constructionElements.roof.material);
    }
    
    // Matériaux par défaut si rien détecté
    if (materials.length === 0) {
      materials.push('Béton', 'Briques', 'Tôles ondulées');
    }
    
    return [...new Set(materials)]; // Supprimer doublons
  }

  // Enrichissement du devis avec données du plan
  private enrichQuoteWithPlanData(
    quote: GeneratedQuote,
    analysis: ArchitecturalPlanAnalysis
  ): GeneratedQuote {
    // Ajouter des recommandations spécifiques au plan
    const planRecommendations = [
      `Plan analysé avec ${analysis.confidence}% de confiance`,
      `Complexité estimée: ${analysis.estimatedComplexity}`,
    ];
    
    if (analysis.extractedMeasurements.scale) {
      planRecommendations.push(`Échelle détectée: ${analysis.extractedMeasurements.scale}`);
    }
    
    // Ajouter des assumptions basées sur l'analyse
    const planAssumptions = [
      'Analyse basée sur le plan architectural fourni',
      'Mesures extraites automatiquement du plan',
      'Vérification sur site recommandée avant travaux'
    ];
    
    return {
      ...quote,
      recommendations: [...quote.recommendations, ...planRecommendations],
      assumptions: [...quote.assumptions, ...planAssumptions],
      confidence: Math.min(quote.confidence, analysis.confidence)
    };
  }

  // Validation et normalisation de l'analyse
  private validateAndNormalizePlanAnalysis(analysis: DeepPartial<ArchitecturalPlanAnalysis>): ArchitecturalPlanAnalysis {
    // Aides de coercition basiques
    const ensureNumber = (v: unknown): number | undefined => {
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string') {
        const n = Number(v.replace(',', '.'));
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };
    const ensureString = (v: unknown): string | undefined => typeof v === 'string' ? v : undefined;
    const ensureBool = (v: unknown): boolean => Boolean(v);
    const ensureDimensions = (d: unknown): { length?: number; width?: number; height?: number } => {
      if (!d || typeof d !== 'object') return {};
      const o = d as Record<string, unknown>;
      return {
        length: ensureNumber(o.length),
        width: ensureNumber(o.width),
        height: ensureNumber(o.height)
      };
    };
    const ensureRooms = (arr: unknown): Array<{ name: string; area?: number; dimensions?: string }> => {
      if (!Array.isArray(arr)) return [];
      return arr.map((r) => {
        const o = (r && typeof r === 'object') ? r as Record<string, unknown> : {};
        return {
          name: ensureString(o.name) || 'Pièce',
          area: ensureNumber(o.area),
          dimensions: ensureString(o.dimensions)
        };
      });
    };
    const ensureWalls = (arr: unknown): Array<{ type: string; length?: number; thickness?: string; material?: string }> => {
      if (!Array.isArray(arr)) return [];
      return arr.map((w) => {
        const o = (w && typeof w === 'object') ? w as Record<string, unknown> : {};
        return {
          type: ensureString(o.type) || 'mur',
          length: ensureNumber(o.length),
          thickness: ensureString(o.thickness),
          material: ensureString(o.material)
        };
      });
    };
    const ensureOpenings = (arr: unknown): Array<{ type: 'door' | 'window'; dimensions?: string; quantity?: number }> => {
      if (!Array.isArray(arr)) return [];
      return arr.map((op) => {
        const o = (op && typeof op === 'object') ? op as Record<string, unknown> : {};
        const typeStr = ensureString(o.type);
        const type = (typeStr === 'door' || typeStr === 'window') ? typeStr : 'door';
        return {
          type,
          dimensions: ensureString(o.dimensions),
          quantity: ensureNumber(o.quantity)
        };
      });
    };
    const ensureFloors = (arr: unknown): Array<{ material?: string; area?: number }> => {
      if (!Array.isArray(arr)) return [];
      return arr.map((fl) => {
        const o = (fl && typeof fl === 'object') ? fl as Record<string, unknown> : {};
        return {
          material: ensureString(o.material),
          area: ensureNumber(o.area)
        };
      });
    };

    return {
      planType: analysis.planType || 'unknown',
      extractedMeasurements: {
        totalArea: ensureNumber(analysis.extractedMeasurements?.totalArea),
        rooms: ensureRooms(analysis.extractedMeasurements?.rooms),
        dimensions: ensureDimensions(analysis.extractedMeasurements?.dimensions),
        scale: ensureString(analysis.extractedMeasurements?.scale)
      },
      constructionElements: {
        walls: ensureWalls(analysis.constructionElements?.walls),
        openings: ensureOpenings(analysis.constructionElements?.openings),
        floors: ensureFloors(analysis.constructionElements?.floors),
        roof: ((): { type?: string; area?: number; material?: string } => {
          const r = analysis.constructionElements?.roof as Record<string, unknown> | undefined;
          return r ? {
            type: ensureString(r.type),
            area: ensureNumber(r.area),
            material: ensureString(r.material)
          } : {};
        })()
      },
      technicalSpecs: {
        foundations: ensureString(analysis.technicalSpecs?.foundations),
        structure: ensureString(analysis.technicalSpecs?.structure),
        utilities: Array.isArray(analysis.technicalSpecs?.utilities)
          ? (analysis.technicalSpecs?.utilities as unknown[]).map(ensureString).filter(Boolean) as string[]
          : [],
        accessibility: ensureBool(analysis.technicalSpecs?.accessibility)
      },
      estimatedComplexity: analysis.estimatedComplexity || 'moderate',
      confidence: Math.max(0, Math.min(100, ensureNumber(analysis.confidence) ?? 70))
    };
  }

  // Parsing robuste des réponses modèle
  private parseModelJson(content: string): unknown | null {
    const trimmed = (content || '').trim();
    // 1) Tentative JSON direct
    try {
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed);
      }
    } catch {
      // ignore
    }
    // 2) Bloc markdown ```json ... ```
    const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch {
        // ignore
      }
    }
    // 3) Fallback: première accolade → dernière accolade
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const slice = trimmed.slice(first, last + 1);
      try {
        return JSON.parse(slice);
      } catch {
        // ignore
      }
    }
    return null;
  }

  // Analyse de fallback sans IA
  private getFallbackPlanAnalysis(ocrResult: IntelligentOCRResult): ArchitecturalPlanAnalysis {
    const text = ocrResult.text.toLowerCase();
    
    // Détection basique du type de plan
    let planType: ArchitecturalPlanAnalysis['planType'] = 'unknown';
    if (text.includes('plan') && text.includes('masse')) planType = 'site_plan';
    else if (text.includes('élévation') || text.includes('facade')) planType = 'elevation';
    else if (text.includes('coupe') || text.includes('section')) planType = 'section';
    else if (text.includes('plan') || text.includes('niveau')) planType = 'floor_plan';
    
    // Extraction basique des mesures
    const areaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*m[²2]/);
    const totalArea = areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) : undefined;
    
    return {
      planType,
      extractedMeasurements: {
        totalArea,
        rooms: [],
        dimensions: {},
        scale: undefined
      },
      constructionElements: {
        walls: [],
        openings: [],
        floors: [],
        roof: {}
      },
      technicalSpecs: {
        foundations: undefined,
        structure: undefined,
        utilities: [],
        accessibility: false
      },
      estimatedComplexity: 'moderate',
      confidence: 40 // Faible confiance sans IA
    };
  }
}

export const architecturalPlanAnalyzer = new ArchitecturalPlanAnalyzer();
export default architecturalPlanAnalyzer;

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

class ArchitecturalPlanAnalyzer {
  private openaiApiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  // Analyse complète d'un plan d'architecture
  async analyzePlan(planFile: File): Promise<ArchitecturalPlanAnalysis> {
    try {
      // Étape 1: OCR intelligent du plan
      const ocrResult = await intelligentOcrService.processDocumentIntelligently(planFile);
      
      // Étape 2: Analyse spécialisée pour plans d'architecture
      const planAnalysis = await this.analyzeArchitecturalContent(ocrResult, planFile);
      
      return planAnalysis;
    } catch (error) {
      console.error('Erreur analyse plan architectural:', error);
      throw new Error('Impossible d\'analyser le plan d\'architecture');
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
Analyse ce plan d'architecture BTP et extrais les informations techniques:

TEXTE EXTRAIT DU PLAN:
${ocrResult.text}

TYPE DE FICHIER: ${planFile.name}

Réponds au format JSON avec:
{
  "planType": "floor_plan|elevation|section|site_plan|detail|unknown",
  "extractedMeasurements": {
    "totalArea": nombre_en_m2,
    "rooms": [{"name": "nom_piece", "area": superficie_m2, "dimensions": "LxW"}],
    "dimensions": {"length": longueur, "width": largeur, "height": hauteur},
    "scale": "echelle_detectee"
  },
  "constructionElements": {
    "walls": [{"type": "type_mur", "length": longueur, "thickness": "epaisseur", "material": "materiau"}],
    "openings": [{"type": "door|window", "dimensions": "dimensions", "quantity": nombre}],
    "floors": [{"material": "materiau_sol", "area": superficie}],
    "roof": {"type": "type_toiture", "area": superficie, "material": "materiau"}
  },
  "technicalSpecs": {
    "foundations": "type_fondations",
    "structure": "type_structure",
    "utilities": ["electricite", "plomberie", "climatisation"],
    "accessibility": true_ou_false
  },
  "estimatedComplexity": "simple|moderate|complex|very_complex",
  "confidence": pourcentage_0_100
}

Concentre-toi sur:
- Mesures et dimensions précises
- Matériaux de construction identifiés
- Éléments structurels (murs, ouvertures, toiture)
- Complexité technique du projet
- Conformité aux normes BTP africaines
`;

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
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parser la réponse JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalizePlanAnalysis(analysis);
      }
      
      throw new Error('Format de réponse invalide');
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
  private validateAndNormalizePlanAnalysis(analysis: any): ArchitecturalPlanAnalysis {
    return {
      planType: analysis.planType || 'unknown',
      extractedMeasurements: {
        totalArea: analysis.extractedMeasurements?.totalArea || undefined,
        rooms: analysis.extractedMeasurements?.rooms || [],
        dimensions: analysis.extractedMeasurements?.dimensions || {},
        scale: analysis.extractedMeasurements?.scale || undefined
      },
      constructionElements: {
        walls: analysis.constructionElements?.walls || [],
        openings: analysis.constructionElements?.openings || [],
        floors: analysis.constructionElements?.floors || [],
        roof: analysis.constructionElements?.roof || {}
      },
      technicalSpecs: {
        foundations: analysis.technicalSpecs?.foundations || undefined,
        structure: analysis.technicalSpecs?.structure || undefined,
        utilities: analysis.technicalSpecs?.utilities || [],
        accessibility: analysis.technicalSpecs?.accessibility || false
      },
      estimatedComplexity: analysis.estimatedComplexity || 'moderate',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 70))
    };
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

// Service spécialisé pour génération de devis à partir de plans d'architecture
import { HybridAIService } from './hybridAIService';
import { AIRequest, AIResponse } from './aiRouter';

export interface ArchitecturalPlanAnalysis {
  surfaces: {
    total: number;
    rooms: Array<{
      name: string;
      surface: number;
      type: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'other';
    }>;
  };
  materials: {
    walls: string[];
    flooring: string[];
    roofing: string[];
    insulation: string[];
  };
  complexity: {
    level: 'simple' | 'medium' | 'complex';
    factors: string[];
    score: number; // 1-10
  };
  technical: {
    floors: number;
    openings: number; // portes/fenêtres
    specialFeatures: string[];
  };
}

// Alias de type pour rendre le code plus lisible
type RoomType = ArchitecturalPlanAnalysis['surfaces']['rooms'][number]['type'];

export interface PlanQuoteRequest {
  planImageBase64?: string;
  planText?: string; // Si déjà extrait par OCR
  projectType: 'construction' | 'renovation' | 'extension';
  location: string;
  clientBudget?: number;
  timeline?: string;
  specifications?: string[];
}

export class ArchitecturalPlanQuoteService {
  private hybridAI: HybridAIService;

  constructor() {
    this.hybridAI = new HybridAIService();
  }

  /**
   * Génération complète de devis à partir d'un plan d'architecture
   * Processus en 3 étapes avec providers optimaux
   */
  async generateQuoteFromPlan(request: PlanQuoteRequest): Promise<{
    planAnalysis: ArchitecturalPlanAnalysis;
    quote: Record<string, unknown>;
    confidence: number;
    totalCost: number; // Coût API total du processus
  }> {
    let totalCost = 0;
    let confidence = 0;

    // === ÉTAPE 1: ANALYSE DU PLAN (Google Vision) ===
    console.log('🔍 Étape 1: Analyse du plan architectural...');
    
    let planText = request.planText;
    let visionResponse: AIResponse | null = null;

    if (request.planImageBase64 && !planText) {
      const visionRequest: AIRequest = {
        type: 'ocr_task',
        content: 'Analyse plan architectural pour extraction données',
        priority: 'high',
        context: {
          imageBase64: request.planImageBase64,
          visionTask: 'plan_reading'
        }
      };

      visionResponse = await this.hybridAI.processRequest(visionRequest);
      totalCost += visionResponse.cost;
      
      // Extraction du texte depuis la réponse Vision
      const visionData = JSON.parse(visionResponse.content);
      planText = visionData.extractedText || '';
    }

    if (!planText) {
      throw new Error('Impossible d\'extraire le texte du plan');
    }

    // === ÉTAPE 2: ANALYSE STRUCTURÉE (Claude Haiku) ===
    console.log('🧠 Étape 2: Analyse technique approfondie...');
    
    const analysisRequest: AIRequest = {
      type: 'complex_analysis',
      content: planText,
      priority: 'high',
      context: {
        analysisType: 'architectural_plan',
        projectType: request.projectType,
        location: request.location,
        additionalContext: `
Analyse ce plan d'architecture et extrait:

1. SURFACES ET ESPACES:
   - Surface totale habitable
   - Détail par pièce (nom, surface, type)
   - Surfaces annexes (garage, terrasse, etc.)

2. MATÉRIAUX IDENTIFIÉS:
   - Structure (béton, bois, acier)
   - Murs (parpaing, brique, etc.)
   - Sol (carrelage, parquet, etc.)
   - Toiture (tuile, ardoise, etc.)

3. COMPLEXITÉ TECHNIQUE:
   - Nombre d'étages
   - Ouvertures (portes, fenêtres)
   - Éléments spéciaux (escalier, cheminée, etc.)
   - Score complexité 1-10

4. SPÉCIFICATIONS TECHNIQUES:
   - Dimensions principales
   - Contraintes particulières
   - Équipements intégrés

Format: JSON structuré pour génération devis.
        `
      }
    };

    const analysisResponse = await this.hybridAI.processRequest(analysisRequest);
    totalCost += analysisResponse.cost;
    confidence = analysisResponse.confidence;

    // Parse de l'analyse structurée
    const planAnalysis = this.parseArchitecturalAnalysis(analysisResponse.content);

    // === ÉTAPE 3: GÉNÉRATION DEVIS (Groq pour économie) ===
    console.log('💰 Étape 3: Génération du devis détaillé...');
    
    const quoteRequest: AIRequest = {
      type: 'quote_generation',
      content: 'Génération devis depuis analyse plan',
      priority: 'medium',
      context: {
        projectDetails: {
          type: request.projectType,
          surface: planAnalysis.surfaces.total,
          materials: [
            ...planAnalysis.materials.walls,
            ...planAnalysis.materials.flooring,
            ...planAnalysis.materials.roofing
          ],
          complexity: planAnalysis.complexity.level,
          rooms: planAnalysis.surfaces.rooms,
          floors: planAnalysis.technical.floors,
          location: request.location,
          budget: request.clientBudget,
          timeline: request.timeline
        },
        planAnalysis: planAnalysis,
        specifications: request.specifications || []
      }
    };

    const quoteResponse = await this.hybridAI.processRequest(quoteRequest);
    totalCost += quoteResponse.cost;

    // Parse du devis généré
    const quote = JSON.parse(quoteResponse.content);

    return {
      planAnalysis,
      quote,
      confidence: Math.round((confidence + quoteResponse.confidence) / 2),
      totalCost: Math.round(totalCost)
    };
  }

  /**
   * Version simplifiée pour plans simples (Groq uniquement)
   */
  async generateSimpleQuoteFromPlan(request: PlanQuoteRequest): Promise<AIResponse> {
    console.log('⚡ Génération devis simple (Groq uniquement)...');

    // Si image fournie, utiliser d'abord Google Vision
    let planContent = request.planText || '';
    let totalCost = 0;

    if (request.planImageBase64 && !planContent) {
      const visionRequest: AIRequest = {
        type: 'ocr_task',
        content: 'OCR plan simple',
        priority: 'medium',
        context: {
          imageBase64: request.planImageBase64,
          visionTask: 'plan_reading'
        }
      };

      const visionResponse = await this.hybridAI.processRequest(visionRequest);
      const visionData = JSON.parse(visionResponse.content);
      planContent = visionData.extractedText || '';
      totalCost += visionResponse.cost;
    }

    // Génération directe avec Groq (économique)
    const quoteRequest: AIRequest = {
      type: 'simple_generation',
      content: `
Génère un devis BTP à partir de ce plan:

PLAN: ${planContent}

CONTEXTE:
- Type: ${request.projectType}
- Lieu: ${request.location}
- Budget indicatif: ${request.clientBudget || 'Non spécifié'}

DEVIS REQUIS:
1. Analyse rapide surfaces et matériaux
2. Estimation coûts par poste:
   - Gros œuvre
   - Second œuvre  
   - Finitions
   - Main d'œuvre
3. Total HT/TTC
4. Délais indicatifs

Format: JSON structuré avec détails par poste.
      `,
      priority: 'low',
      context: {
        projectType: request.projectType,
        location: request.location,
        budget: request.clientBudget
      }
    };

    const response = await this.hybridAI.processRequest(quoteRequest);
    response.cost += totalCost; // Ajouter coût OCR si applicable

    return response;
  }

  /**
   * Analyse comparative de plusieurs plans
   */
  async comparePlans(plans: Array<{
    name: string;
    imageBase64?: string;
    planText?: string;
  }>): Promise<AIResponse> {
    console.log(`📊 Comparaison de ${plans.length} plans...`);

    // Extraction texte de tous les plans
    const planTexts: string[] = [];
    let totalCost = 0;

    for (const plan of plans) {
      let text = plan.planText || '';
      
      if (plan.imageBase64 && !text) {
        const visionRequest: AIRequest = {
          type: 'ocr_task',
          content: `OCR plan ${plan.name}`,
          priority: 'medium',
          context: {
            imageBase64: plan.imageBase64,
            visionTask: 'plan_reading'
          }
        };

        const visionResponse = await this.hybridAI.processRequest(visionRequest);
        const visionData = JSON.parse(visionResponse.content);
        text = visionData.extractedText || '';
        totalCost += visionResponse.cost;
      }
      
      planTexts.push(text);
    }

    // Analyse comparative avec Claude (meilleur pour comparaisons)
    const comparisonRequest: AIRequest = {
      type: 'complex_analysis',
      content: planTexts.join('\n\n--- PLAN SUIVANT ---\n\n'),
      priority: 'high',
      context: {
        analysisType: 'plan_comparison',
        planNames: plans.map(p => p.name),
        additionalContext: `
Compare ces ${plans.length} plans d'architecture:

${plans.map((plan, i) => `PLAN ${i + 1} - ${plan.name}`).join('\n')}

ANALYSE COMPARATIVE:
1. Surfaces et optimisation espace
2. Coûts estimés par plan
3. Complexité de réalisation
4. Avantages/inconvénients de chaque
5. Recommandation finale

Format: Rapport structuré avec tableau comparatif.
        `
      }
    };

    const response = await this.hybridAI.processRequest(comparisonRequest);
    response.cost += totalCost;

    return response;
  }

  /**
   * Parse l'analyse architecturale depuis la réponse Claude
   */
  private parseArchitecturalAnalysis(analysisText: string): ArchitecturalPlanAnalysis {
    try {
      // Tentative de parsing JSON direct
      const parsed = JSON.parse(analysisText);
      if (parsed.surfaces && parsed.materials) {
        return parsed;
      }
    } catch {
      // Fallback: extraction manuelle depuis texte
    }

    // Extraction manuelle des données
    
    const analysis: ArchitecturalPlanAnalysis = {
      surfaces: {
        total: this.extractTotalSurface(analysisText),
        rooms: this.extractRooms(analysisText)
      },
      materials: {
        walls: this.extractMaterials(analysisText, 'mur'),
        flooring: this.extractMaterials(analysisText, 'sol'),
        roofing: this.extractMaterials(analysisText, 'toit'),
        insulation: this.extractMaterials(analysisText, 'isolant')
      },
      complexity: {
        level: this.extractComplexity(analysisText),
        factors: this.extractComplexityFactors(analysisText),
        score: this.extractComplexityScore(analysisText)
      },
      technical: {
        floors: this.extractFloors(analysisText),
        openings: this.extractOpenings(analysisText),
        specialFeatures: this.extractSpecialFeatures(analysisText)
      }
    };

    return analysis;
  }

  // Méthodes d'extraction privées
  private extractTotalSurface(text: string): number {
    const match = text.match(/surface\s+totale[:\s]*(\d+(?:[,.]\d+)?)\s*m²?/i);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  }

  private extractRooms(text: string): Array<{ name: string; surface: number; type: RoomType }> {
    const rooms: Array<{ name: string; surface: number; type: RoomType }> = [];
    const roomPattern = /(\w+)[:\s]*(\d+(?:[,.]\d+)?)\s*m²?/gi;
    let match;
    
    while ((match = roomPattern.exec(text)) !== null) {
      const name = match[1].toLowerCase();
      const surface = parseFloat(match[2].replace(',', '.'));
      
      let type: RoomType = 'other';
      if (name.includes('chambre')) type = 'bedroom';
      else if (name.includes('salon') || name.includes('séjour')) type = 'living';
      else if (name.includes('cuisine')) type = 'kitchen';
      else if (name.includes('salle de bain') || name.includes('wc')) type = 'bathroom';
      
      rooms.push({ name: match[1], surface, type });
    }
    
    return rooms;
  }

  private extractMaterials(text: string, category: string): string[] {
    const materials: string[] = [];
    const categoryPatterns = {
      mur: ['béton', 'parpaing', 'brique', 'bois', 'placo'],
      sol: ['carrelage', 'parquet', 'béton ciré', 'lino', 'moquette'],
      toit: ['tuile', 'ardoise', 'zinc', 'bac acier', 'chaume'],
      isolant: ['laine de verre', 'laine de roche', 'polystyrène', 'ouate']
    };

    const patterns = categoryPatterns[category as keyof typeof categoryPatterns] || [];
    patterns.forEach(material => {
      if (text.toLowerCase().includes(material)) {
        materials.push(material);
      }
    });

    return materials;
  }

  private extractComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const complexityIndicators = {
      simple: ['plain-pied', 'rectangulaire', 'standard'],
      medium: ['étage', 'forme en l', 'combles'],
      complex: ['plusieurs étages', 'forme complexe', 'sous-sol', 'piscine']
    };

    const lowerText = text.toLowerCase();
    
    if (complexityIndicators.complex.some(indicator => lowerText.includes(indicator))) {
      return 'complex';
    } else if (complexityIndicators.medium.some(indicator => lowerText.includes(indicator))) {
      return 'medium';
    }
    return 'simple';
  }

  private extractComplexityFactors(text: string): string[] {
    const factors: string[] = [];
    const indicators = [
      'étages multiples', 'forme irrégulière', 'sous-sol', 'combles aménagés',
      'piscine', 'garage intégré', 'terrasse', 'balcon', 'escalier'
    ];

    const lowerText = text.toLowerCase();
    indicators.forEach(indicator => {
      if (lowerText.includes(indicator.toLowerCase())) {
        factors.push(indicator);
      }
    });

    return factors;
  }

  private extractComplexityScore(text: string): number {
    const match = text.match(/(?:score|complexité)[:\s]*(\d+)(?:\/10)?/i);
    return match ? parseInt(match[1]) : 5; // Défaut moyen
  }

  private extractFloors(text: string): number {
    const match = text.match(/(\d+)\s*étages?/i);
    return match ? parseInt(match[1]) : 1;
  }

  private extractOpenings(text: string): number {
    const doorMatch = text.match(/(\d+)\s*portes?/i);
    const windowMatch = text.match(/(\d+)\s*fenêtres?/i);
    
    const doors = doorMatch ? parseInt(doorMatch[1]) : 0;
    const windows = windowMatch ? parseInt(windowMatch[1]) : 0;
    
    return doors + windows;
  }

  private extractSpecialFeatures(text: string): string[] {
    const features: string[] = [];
    const specialElements = [
      'cheminée', 'escalier', 'mezzanine', 'véranda', 'bow-window',
      'piscine', 'jacuzzi', 'cave à vin', 'buanderie', 'dressing'
    ];

    const lowerText = text.toLowerCase();
    specialElements.forEach(element => {
      if (lowerText.includes(element)) {
        features.push(element);
      }
    });

    return features;
  }
}

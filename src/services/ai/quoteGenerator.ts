import { aiConfig } from './aiConfig';
import { ServiceService } from './ServiceService';

export interface QuoteGenerationRequest {
  projectType: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  timeline: string;
  specialRequirements: string[];
  projectPlan?: {
    phases: Array<{
      name: string;
      subTasks: Array<{
        name: string;
        tradeSkill: string;
        deliverables: string[];
        duration: string;
        risks: string[];
      }>;
      duration: string;
      risks: string[];
    }>;
  };
  specifications?: {
    surface?: number;
    rooms?: number;
    floors?: number;
    materials?: string[];
  };
}

export interface GeneratedQuotePhase {
  name: string;
  description: string;
  duration: number; // en jours
  items: GeneratedQuoteItem[];
  totalCost: number;
}

export interface GeneratedQuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: 'materials' | 'labor' | 'equipment' | 'other';
}

export interface GeneratedQuote {
  title: string;
  description: string;
  phases: GeneratedQuotePhase[];
  totalCost: number;
  totalDuration: number;
  recommendations: string[];
  assumptions: string[];
  confidence: number;
}

class QuoteGenerator {
  private config = aiConfig;

  async generateQuote(request: QuoteGenerationRequest): Promise<GeneratedQuote> {
    if (!this.config.quoteGeneration.enabled) {
      throw new Error('Génération de devis IA non activée. Configurez une clé API.');
    }

    // Utiliser Service si configuré, sinon templates
    if (aiConfig.ServiceApiKey) {
      try {
        return await this.generateWithService(request);
      } catch {
        // Erreur Service, fallback vers templates
        return this.generateFromTemplate(request);
      }
    }

    return this.generateFromTemplate(request);
  }

  private async generateFromTemplate(request: QuoteGenerationRequest): Promise<GeneratedQuote> {
    const template = this.getTemplateForProjectType(request.projectType);
    
    if (!template) {
      throw new Error(`Type de projet non supporté: ${request.projectType}`);
    }

    // Adaptation du template selon les spécifications
    const adaptedPhases = this.adaptTemplate(template, request);
    
    // Vérifier que adaptedPhases est un array valide
    if (!Array.isArray(adaptedPhases) || adaptedPhases.length === 0) {
      throw new Error('Aucune phase générée pour ce type de projet');
    }

    const totalCost = adaptedPhases.reduce((sum, phase) => sum + (phase.totalCost || 0), 0);
    const durations = adaptedPhases.map(p => p.duration || 1).filter(d => d > 0);
    const totalDuration = durations.length > 0 ? Math.max(...durations) : 1;

    return {
      title: `${request.projectType} - ${request.description}`,
      description: `Devis généré automatiquement pour ${request.description}`,
      phases: adaptedPhases,
      totalCost,
      totalDuration,
      recommendations: this.generateRecommendations(request, adaptedPhases),
      assumptions: this.generateAssumptions(request),
      confidence: this.calculateConfidence(request, template)
    };
  }

  private getTemplateForProjectType(projectType: string): QuoteTemplate | null {
    // Normaliser le type de projet
    const normalizedType = projectType?.toLowerCase().trim();
    
    if (!normalizedType) {
      // Type de projet manquant ou invalide
      return null;
    }

    const templates: Record<string, QuoteTemplate> = {
      'renovation': {
        name: 'Rénovation',
        basePhases: [
          {
            name: 'Démolition et préparation',
            baseDuration: 5,
            baseItems: [
              { description: 'Démolition cloisons', unit: 'm²', basePrice: 25000, category: 'labor' },
              { description: 'Évacuation gravats', unit: 'm³', basePrice: 15000, category: 'other' },
              { description: 'Protection sols', unit: 'm²', basePrice: 2000, category: 'materials' }
            ]
          },
          {
            name: 'Gros œuvre',
            baseDuration: 10,
            baseItems: [
              { description: 'Maçonnerie', unit: 'm²', basePrice: 45000, category: 'labor' },
              { description: 'Ciment', unit: 'sac', basePrice: 4500, category: 'materials' },
              { description: 'Briques', unit: 'u', basePrice: 250, category: 'materials' }
            ]
          },
          {
            name: 'Second œuvre',
            baseDuration: 15,
            baseItems: [
              { description: 'Électricité', unit: 'point', basePrice: 12000, category: 'labor' },
              { description: 'Plomberie', unit: 'point', basePrice: 15000, category: 'labor' },
              { description: 'Peinture', unit: 'm²', basePrice: 3500, category: 'labor' }
            ]
          },
          {
            name: 'Finitions',
            baseDuration: 8,
            baseItems: [
              { description: 'Carrelage', unit: 'm²', basePrice: 8000, category: 'materials' },
              { description: 'Pose carrelage', unit: 'm²', basePrice: 6000, category: 'labor' },
              { description: 'Menuiserie', unit: 'u', basePrice: 85000, category: 'materials' }
            ]
          }
        ]
      },
      'construction': {
        name: 'Construction neuve',
        basePhases: [
          {
            name: 'Terrassement et fondations',
            baseDuration: 12,
            baseItems: [
              { description: 'Terrassement', unit: 'm³', basePrice: 8000, category: 'labor' },
              { description: 'Béton fondations', unit: 'm³', basePrice: 85000, category: 'materials' },
              { description: 'Ferraillage', unit: 'kg', basePrice: 850, category: 'materials' }
            ]
          },
          {
            name: 'Structure',
            baseDuration: 20,
            baseItems: [
              { description: 'Murs porteurs', unit: 'm²', basePrice: 35000, category: 'labor' },
              { description: 'Charpente', unit: 'm²', basePrice: 25000, category: 'materials' },
              { description: 'Couverture', unit: 'm²', basePrice: 18000, category: 'materials' }
            ]
          },
          {
            name: 'Clos et couvert',
            baseDuration: 15,
            baseItems: [
              { description: 'Menuiseries extérieures', unit: 'u', basePrice: 125000, category: 'materials' },
              { description: 'Isolation', unit: 'm²', basePrice: 4500, category: 'materials' },
              { description: 'Étanchéité', unit: 'm²', basePrice: 6500, category: 'materials' }
            ]
          }
        ]
      }
    };

    return templates[projectType.toLowerCase()] || null;
  }

  private adaptTemplate(template: QuoteTemplate, request: QuoteGenerationRequest): GeneratedQuotePhase[] {
    // Vérifier que template et basePhases existent
    if (!template || !template.basePhases || !Array.isArray(template.basePhases)) {
      // Template invalide
      return [];
    }

    // Logique d'adaptation simplifiée
    return template.basePhases.map(phase => {
      // Vérifier que baseItems existe et est un array
      const items = phase.baseItems || [];
      const adaptedItems = Array.isArray(items) ? items.map(item => {
        const quantity = this.calculateQuantity(item, request);
        const unitPrice = this.adjustPrice(item.basePrice, request);
        
        return {
          description: item.description,
          quantity,
          unit: item.unit,
          unitPrice,
          totalPrice: quantity * unitPrice,
          category: item.category
        };
      }) : [];

      const totalCost = adaptedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      return {
        name: phase.name,
        description: `Phase ${phase.name.toLowerCase()} adaptée aux spécifications`,
        duration: this.adjustDuration(phase.baseDuration, request),
        items: adaptedItems,
        totalCost
      };
    });
  }

  private calculateQuantity(item: TemplateItem, request: QuoteGenerationRequest): number {
    const surface = request.specifications?.surface || 100; // m² par défaut
    
    switch (item.unit) {
      case 'm²':
        return Math.round(surface * this.getMultiplier(item.description));
      case 'm³':
        return Math.round(surface * 0.3); // Estimation volume
      case 'u':
        return request.specifications?.rooms || 3; // Nombre d'unités
      case 'point':
        return Math.round(surface * 0.8); // Points électriques/plomberie
      case 'sac':
        return Math.round(surface * 2); // Sacs de ciment
      case 'kg':
        return Math.round(surface * 15); // Kg de ferraillage
      default:
        return 1;
    }
  }

  private getMultiplier(description: string): number {
    const multipliers: Record<string, number> = {
      'démolition': 0.8,
      'maçonnerie': 0.6,
      'peinture': 2.5,
      'carrelage': 0.7,
      'isolation': 1.2,
      'couverture': 1.1
    };

    const key = Object.keys(multipliers).find(k => 
      description.toLowerCase().includes(k)
    );
    
    return key ? multipliers[key] : 1.0;
  }

  private adjustPrice(basePrice: number, request: QuoteGenerationRequest): number {
    let adjustedPrice = basePrice;
    
    // Ajustement selon le budget
    if (request.budget) {
      const maxBudget = request.budget.max || request.budget.min || 5000000;
      const budgetFactor = maxBudget > 5000000 ? 1.2 : 0.9;
      adjustedPrice *= budgetFactor;
    }
    
    // Ajustement selon la localisation (simulation)
    if (request.location?.toLowerCase().includes('dakar')) {
      adjustedPrice *= 1.15; // Prix plus élevés à Dakar
    }
    
    return Math.round(adjustedPrice);
  }

  private adjustDuration(baseDuration: number, request: QuoteGenerationRequest): number {
    let adjustedDuration = baseDuration;
    
    // Ajustement selon la surface
    const surface = request.specifications?.surface || 100;
    if (surface > 200) {
      adjustedDuration *= 1.3;
    } else if (surface < 50) {
      adjustedDuration *= 0.7;
    }
    
    return Math.round(adjustedDuration);
  }

  private generateRecommendations(request: QuoteGenerationRequest, phases: GeneratedQuotePhase[]): string[] {
    const recommendations: string[] = [];
    
    // Recommandations basées sur le budget
    const totalCost = phases.reduce((sum, p) => sum + p.totalCost, 0);
    if (request.budget) {
      const maxBudget = request.budget.max || request.budget.min || 0;
      if (totalCost > maxBudget * 1.1) {
        recommendations.push('Le coût estimé dépasse le budget prévu de plus de 10%. Considérez des alternatives moins coûteuses.');
      }
    }
    
    // Recommandations saisonnières
    recommendations.push('Planifiez les travaux extérieurs pendant la saison sèche (novembre-mai).');
    
    // Recommandations matériaux
    if (request.specifications?.surface && request.specifications.surface > 150) {
      recommendations.push('Pour les grandes surfaces, négociez des prix de gros avec les fournisseurs.');
    }
    
    return recommendations;
  }

  private generateAssumptions(request: QuoteGenerationRequest): string[] {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void request;
    return [
      'Prix basés sur les tarifs actuels du marché sénégalais',
      'Accès normal au chantier supposé',
      'Pas de complications techniques majeures',
      'Main d\'œuvre qualifiée disponible',
      'Matériaux disponibles localement',
      'Conditions météorologiques normales'
    ];
  }

  private async generateWithService(request: QuoteGenerationRequest): Promise<GeneratedQuote> {
    // ServiceService.generateQuote expects (projectData, requirements). Provide an empty requirements object
    // and cast request to a broad object type compatible with the service signature.
    const aiQuoteRaw = await ServiceService.generateQuote(request as unknown as Record<string, unknown>, {});

    // Runtime narrowing because ServiceService returns Record<string, unknown>
    const title = typeof (aiQuoteRaw as Record<string, unknown>).title === 'string'
      ? (aiQuoteRaw as Record<string, unknown>).title as string
      : `${request.projectType} - ${request.description}`;

    const description = typeof (aiQuoteRaw as Record<string, unknown>).description === 'string'
      ? (aiQuoteRaw as Record<string, unknown>).description as string
      : `Devis généré automatiquement pour ${request.description}`;

    const totalCost = typeof (aiQuoteRaw as Record<string, unknown>).totalCost === 'number'
      ? (aiQuoteRaw as Record<string, unknown>).totalCost as number
      : 0;

    const totalDuration = typeof (aiQuoteRaw as Record<string, unknown>).totalDuration === 'number'
      ? (aiQuoteRaw as Record<string, unknown>).totalDuration as number
      : 1;

    const recommendations = Array.isArray((aiQuoteRaw as Record<string, unknown>).recommendations)
      ? (aiQuoteRaw as { recommendations: unknown }).recommendations as string[]
      : this.generateRecommendations(request, []);

    const assumptions = Array.isArray((aiQuoteRaw as Record<string, unknown>).assumptions)
      ? (aiQuoteRaw as { assumptions: unknown }).assumptions as string[]
      : this.generateAssumptions(request);

    const confidenceVal = (aiQuoteRaw as Record<string, unknown>).confidence;
    const confidence = typeof confidenceVal === 'number' ? confidenceVal : 85;

    // Phases: try to trust the shape, else fallback to empty array
    const phasesUnknown = (aiQuoteRaw as Record<string, unknown>).phases;
    const phases = Array.isArray(phasesUnknown)
      ? (phasesUnknown as unknown as GeneratedQuotePhase[])
      : [];

    return {
      title,
      description,
      phases,
      totalCost,
      totalDuration,
      recommendations,
      assumptions,
      confidence
    };
  }

  private calculateConfidence(request: QuoteGenerationRequest, _template: QuoteTemplate): number {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void _template;
    let confidence = 70; // Base
    
    // Plus de détails = plus de confiance
    if (request.specifications?.surface) confidence += 10;
    if (request.budget) confidence += 5;
    if (request.location) confidence += 5;
    if (request.specialRequirements && request.specialRequirements.length > 0) confidence += 10;
    
    return Math.min(confidence, 95);
  }
}

interface QuoteTemplate {
  name: string;
  basePhases: TemplatePhase[];
}

interface TemplatePhase {
  name: string;
  baseDuration: number;
  baseItems: TemplateItem[];
}

interface TemplateItem {
  description: string;
  unit: string;
  basePrice: number;
  category: 'materials' | 'labor' | 'equipment' | 'other';
}

export const quoteGenerator = new QuoteGenerator();

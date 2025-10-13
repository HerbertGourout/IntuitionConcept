// Service GPT-4o - Analyse multimodale (texte + images) pour BTP
import { aiBackendClient } from './aiBackendClient';
export interface GPT4oResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

export interface ImageAnalysisResult {
  description: string;
  detectedElements: string[];
  technicalAssessment: string;
  recommendations: string[];
  riskFactors: string[];
  confidence: number;
}

export interface PlanAnalysisResult {
  planType: string;
  rooms: Array<{
    name: string;
    estimatedArea: number;
    features: string[];
  }>;
  structuralElements: string[];
  materials: string[];
  compliance: {
    accessibility: boolean;
    safety: boolean;
    building_codes: boolean;
  };
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  confidence: number;
}

export interface SiteAnalysisResult {
  siteConditions: string[];
  accessibilityIssues: string[];
  safetyHazards: string[];
  equipmentNeeded: string[];
  weatherConsiderations: string[];
  recommendations: string[];
  confidence: number;
}

export class GPT4oService {
  private readonly model = 'gpt-4o';

  /**
   * Analyse d'image de chantier avec contexte BTP
   */
  async analyzeSiteImage(base64Image: string, context?: string): Promise<GPT4oResponse> {
    const prompt = `
Analyse cette image de chantier BTP et fournis une évaluation technique détaillée.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "description": "Description détaillée de ce qui est visible",
  "detectedElements": ["élément1", "élément2"],
  "technicalAssessment": "Évaluation technique professionnelle",
  "recommendations": ["recommandation1", "recommandation2"],
  "riskFactors": ["risque1", "risque2"],
  "confidence": 85
}

Focus sur : sécurité, qualité, conformité, avancement des travaux.
`;

    try {
      const response = await this.callOpenAIChat({
        operation: 'image_analysis',
        payload: {
          image: {
            data: base64Image,
            mimeType: 'image/jpeg'
          },
          context: prompt
        }
      });

      return this.mapToResponse(response);

    } catch (error) {
      console.error('Erreur analyse image GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse de plan architectural avec vision
   */
  async analyzePlan(base64Image: string, planType?: string, mimeType: string = 'image/jpeg'): Promise<GPT4oResponse> {
    const prompt = `
Analyse ce plan architectural BTP et extrais toutes les informations techniques.

${planType ? `TYPE DE PLAN : ${planType}` : ''}

Format de réponse JSON :
{
  "planType": "floor_plan|elevation|section|site_plan",
  "rooms": [
    {
      "name": "Salon",
      "estimatedArea": 25,
      "features": ["baie vitrée", "cheminée"]
    }
  ],
  "structuralElements": ["murs porteurs", "poutres", "colonnes"],
  "materials": ["béton", "brique", "bois"],
  "compliance": {
    "accessibility": true,
    "safety": true,
    "building_codes": true
  },
  "estimatedCost": {
    "min": 150000,
    "max": 200000,
    "currency": "EUR"
  },
  "confidence": 90
}

Analyse technique approfondie avec estimation de coûts réaliste.
`;

    try {
      const response = await this.callOpenAIChat({
        operation: 'plan_analysis',
        payload: {
          file: {
            data: base64Image,
            mimeType
          },
          planType,
          context: prompt
        }
      });

      return this.mapToResponse(response);

    } catch (error) {
      console.error('Erreur analyse plan GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse comparative de photos avant/après
   */
  async compareProgress(beforeImage: string, afterImage: string, context?: string): Promise<GPT4oResponse> {
    const prompt = `
Compare ces deux images de chantier (avant/après) et analyse l'avancement des travaux.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "progressAnalysis": "Analyse détaillée de l'avancement",
  "completedTasks": ["tâche1", "tâche2"],
  "qualityAssessment": "Évaluation de la qualité des travaux",
  "issuesIdentified": ["problème1", "problème2"],
  "nextSteps": ["étape1", "étape2"],
  "progressPercentage": 75,
  "confidence": 88
}

Focus sur : qualité, conformité, respect du planning, problèmes potentiels.
`;

    try {
      const response = await this.callOpenAIChat({
        operation: 'progress_comparison',
        payload: {
          beforeImage: {
            data: beforeImage,
            mimeType: 'image/jpeg'
          },
          afterImage: {
            data: afterImage,
            mimeType: 'image/jpeg'
          },
          context: prompt
        }
      });

      return this.mapToResponse(response);

    } catch (error) {
      console.error('Erreur comparaison images GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Génération de rapport avec images
   */
  async generateVisualReport(images: string[], reportType: string, context?: Record<string, unknown>): Promise<GPT4oResponse> {
    const prompt = `
Génère un rapport ${reportType} professionnel basé sur ces images de chantier.

${context ? `CONTEXTE : ${JSON.stringify(context)}` : ''}

Format de réponse :
{
  "reportTitle": "Titre du rapport",
  "executiveSummary": "Résumé exécutif",
  "detailedFindings": [
    {
      "section": "Nom de section",
      "findings": "Observations détaillées",
      "recommendations": "Recommandations"
    }
  ],
  "riskAssessment": "Évaluation des risques",
  "actionItems": [
    {
      "priority": "high|medium|low",
      "task": "Description de la tâche",
      "deadline": "Date limite suggérée"
    }
  ],
  "conclusion": "Conclusion et prochaines étapes"
}

Rapport professionnel et actionnable.
`;

    try {
      const response = await this.callOpenAIChat({
        operation: 'visual_report',
        payload: {
          images: images.map((image) => ({
            data: image,
            mimeType: 'image/jpeg'
          })),
          reportType,
          context: {
            prompt,
            ...context
          }
        }
      });

      return this.mapToResponse(response);

    } catch (error) {
      console.error('Erreur génération rapport GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse de conformité sécurité
   */
  async analyzeSafetyCompliance(base64Image: string, regulations?: string[]): Promise<GPT4oResponse> {
    const prompt = `
Analyse cette image de chantier pour la conformité sécurité et réglementaire.

${regulations ? `RÉGLEMENTATIONS À VÉRIFIER : ${regulations.join(', ')}` : ''}

Format de réponse JSON :
{
  "overallCompliance": "conforme|non_conforme|partiellement_conforme",
  "safetyIssues": [
    {
      "issue": "Description du problème",
      "severity": "critique|élevé|moyen|faible",
      "regulation": "Réglementation concernée",
      "solution": "Solution recommandée"
    }
  ],
  "positivePoints": ["point1", "point2"],
  "requiredActions": [
    {
      "action": "Action à entreprendre",
      "urgency": "immédiate|sous_48h|sous_semaine",
      "cost_estimate": 500
    }
  ],
  "complianceScore": 75,
  "confidence": 90
}

Focus sur : EPI, signalisation, protection collective, accès, stockage.
`;

    try {
      const response = await this.callOpenAIChat({
        operation: 'safety_compliance',
        payload: {
          image: {
            data: base64Image,
            mimeType: 'image/jpeg'
          },
          regulations,
          context: prompt
        }
      });

      return this.mapToResponse(response);

    } catch (error) {
      console.error('Erreur analyse sécurité GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Calcul du coût GPT-4o
   */
  private calculateCost(promptTokens: number, completionTokens: number): number {
    // Prix GPT-4o : $2.50/1M tokens input, $10.00/1M tokens output
    const inputCost = (promptTokens / 1000000) * 2.50;
    const outputCost = (completionTokens / 1000000) * 10.00;
    return inputCost + outputCost;
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await aiBackendClient.generate({
        type: 'simple_generation',
        content: 'Test de connexion IA',
        priority: 'low'
      });

      return Boolean(response?.content);
    } catch {
      return false;
    }
  }

  private async callOpenAIChat({
    operation,
    payload
  }: {
    operation:
      | 'image_analysis'
      | 'plan_analysis'
      | 'progress_comparison'
      | 'visual_report'
      | 'safety_compliance';
    payload: Record<string, unknown>;
  }): Promise<OpenAIChatResponse> {
    const response = await aiBackendClient.proxy<OpenAIChatResponse>({
      provider: 'openai',
      operation,
      payload
    });

    return response.data;
  }

  private mapToResponse(data: OpenAIChatResponse): GPT4oResponse {
    const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || this.model,
      usage,
      cost: this.calculateCost(usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0)
    };
  }
}

export const gpt4oService = new GPT4oService();
export default gpt4oService;

interface OpenAIChatChoice {
  message?: {
    content?: string;
  };
}

interface OpenAIChatUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAIChatResponse {
  model?: string;
  choices?: OpenAIChatChoice[];
  usage?: OpenAIChatUsage;
}

// Service GPT-4o - Analyse multimodale (texte + images) pour BTP
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
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4o';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    // Debug: Vérification de la clé
    console.log('🔍 Debug OpenAI:', {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length || 0,
      keyStart: this.apiKey?.substring(0, 10) || 'undefined'
    });
    
    if (!this.apiKey) {
      console.warn('⚠️ Clé API OpenAI manquante - GPT-4o indisponible');
    } else {
      console.log('✅ GPT-4o: Service configuré et prêt');
    }
  }

  /**
   * Analyse d'image de chantier avec contexte BTP
   */
  async analyzeSiteImage(base64Image: string, context?: string): Promise<GPT4oResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI requise');
    }

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur analyse image GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse de plan architectural avec vision
   */
  async analyzePlan(base64Image: string, planType?: string, mimeType: string = 'image/jpeg'): Promise<GPT4oResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI requise');
    }

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }],
          max_tokens: 3000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Erreur API OpenAI: ${response.status}${errText ? ` - ${errText}` : ''}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur analyse plan GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse comparative de photos avant/après
   */
  async compareProgress(beforeImage: string, afterImage: string, context?: string): Promise<GPT4oResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI requise');
    }

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${beforeImage}`,
                  detail: 'high'
                }
              },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${afterImage}`,
                  detail: 'high'
                }
              }
            ]
          }],
          max_tokens: 2500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur comparaison images GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Génération de rapport avec images
   */
  async generateVisualReport(images: string[], reportType: string, context?: Record<string, unknown>): Promise<GPT4oResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI requise');
    }

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

    const content = [
      { type: 'text', text: prompt },
      ...images.map(img => ({
        type: 'image_url' as const,
        image_url: { 
          url: `data:image/jpeg;base64,${img}`,
          detail: 'high' as const
        }
      }))
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content }],
          max_tokens: 4000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur génération rapport GPT-4o:', error);
      throw error;
    }
  }

  /**
   * Analyse de conformité sécurité
   */
  async analyzeSafetyCompliance(base64Image: string, regulations?: string[]): Promise<GPT4oResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI requise');
    }

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }],
          max_tokens: 3000,
          temperature: 0.1 // Très précis pour la sécurité
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

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
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Test de connexion' }],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const gpt4oService = new GPT4oService();
export default gpt4oService;

// Service Gemini 1.5 Pro - Contexte ultra-long pour analyse de gros dossiers BTP
export interface GeminiResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

export interface ProjectAnalysisResult {
  projectOverview: string;
  riskAssessment: {
    technical: string[];
    financial: string[];
    regulatory: string[];
    timeline: string[];
  };
  recommendations: Array<{
    category: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    recommendation: string;
    impact: string;
    cost_estimate: number;
  }>;
  compliance: {
    building_codes: boolean;
    environmental: boolean;
    safety: boolean;
    accessibility: boolean;
  };
  timeline_analysis: {
    estimated_duration: number;
    critical_path: string[];
    potential_delays: string[];
  };
  budget_analysis: {
    total_estimate: number;
    breakdown: Record<string, number>;
    contingency_recommended: number;
  };
  confidence: number;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private model = 'gemini-1.5-pro';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Gemini manquante - Fonctionnalités limitées');
    }
  }

  /**
   * Analyse complète de dossier projet avec contexte ultra-long
   */
  async analyzeCompleteProject(documents: Array<{
    type: string;
    content: string;
    filename?: string;
  }>): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Gemini requise');
    }

    // Construire le contexte complet (jusqu'à 2M tokens)
    const fullContext = documents.map(doc => 
      `=== DOCUMENT: ${doc.filename || doc.type} ===\n${doc.content}\n\n`
    ).join('');

    const prompt = `
Analyse ce dossier BTP complet et fournis une évaluation technique exhaustive.

DOSSIER COMPLET :
${fullContext}

Format de réponse JSON :
{
  "projectOverview": "Vue d'ensemble du projet avec enjeux principaux",
  "riskAssessment": {
    "technical": ["risque technique 1", "risque technique 2"],
    "financial": ["risque financier 1", "risque financier 2"],
    "regulatory": ["risque réglementaire 1", "risque réglementaire 2"],
    "timeline": ["risque planning 1", "risque planning 2"]
  },
  "recommendations": [
    {
      "category": "technique|financier|réglementaire|planning",
      "priority": "critical|high|medium|low",
      "recommendation": "Recommandation détaillée",
      "impact": "Impact sur le projet",
      "cost_estimate": 15000
    }
  ],
  "compliance": {
    "building_codes": true,
    "environmental": true,
    "safety": true,
    "accessibility": true
  },
  "timeline_analysis": {
    "estimated_duration": 180,
    "critical_path": ["étape1", "étape2"],
    "potential_delays": ["cause1", "cause2"]
  },
  "budget_analysis": {
    "total_estimate": 500000,
    "breakdown": {
      "materials": 200000,
      "labor": 150000,
      "equipment": 50000,
      "other": 100000
    },
    "contingency_recommended": 50000
  },
  "confidence": 85
}

Analyse exhaustive et professionnelle avec recommandations actionables.
`;

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8000,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Estimation des tokens (approximative)
      const estimatedTokens = Math.ceil((prompt.length + content.length) / 4);
      
      return {
        content,
        model: this.model,
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: estimatedTokens
        },
        cost: this.calculateCost(estimatedTokens)
      };

    } catch (error) {
      console.error('Erreur analyse projet Gemini:', error);
      throw error;
    }
  }

  /**
   * Analyse de conformité réglementaire exhaustive
   */
  async analyzeRegulatory(projectDocuments: string[], regulations: string[]): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Gemini requise');
    }

    const documentsContext = projectDocuments.join('\n\n=== DOCUMENT SUIVANT ===\n\n');
    const regulationsContext = regulations.join('\n- ');

    const prompt = `
Analyse la conformité réglementaire de ce projet BTP par rapport aux réglementations françaises.

DOCUMENTS PROJET :
${documentsContext}

RÉGLEMENTATIONS À VÉRIFIER :
- ${regulationsContext}

Format de réponse JSON :
{
  "compliance_overview": "Vue d'ensemble de la conformité",
  "detailed_analysis": [
    {
      "regulation": "Nom de la réglementation",
      "status": "conforme|non_conforme|partiellement_conforme|à_vérifier",
      "details": "Analyse détaillée",
      "required_actions": ["action1", "action2"],
      "deadline": "Date limite si applicable",
      "cost_impact": 5000
    }
  ],
  "critical_issues": [
    {
      "issue": "Problème critique",
      "regulation": "Réglementation concernée",
      "consequences": "Conséquences potentielles",
      "solution": "Solution recommandée",
      "urgency": "immediate|urgent|normal"
    }
  ],
  "recommendations": [
    {
      "action": "Action recommandée",
      "priority": "critical|high|medium|low",
      "timeline": "Délai recommandé",
      "cost": 3000
    }
  ],
  "overall_compliance_score": 75,
  "confidence": 90
}

Analyse exhaustive avec focus sur les risques juridiques et financiers.
`;

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1, // Très précis pour la conformité
            maxOutputTokens: 6000,
            topP: 0.9,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const estimatedTokens = Math.ceil((prompt.length + content.length) / 4);
      
      return {
        content,
        model: this.model,
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: estimatedTokens
        },
        cost: this.calculateCost(estimatedTokens)
      };

    } catch (error) {
      console.error('Erreur analyse réglementaire Gemini:', error);
      throw error;
    }
  }

  /**
   * Analyse de risques multi-documents
   */
  async analyzeProjectRisks(projectData: {
    plans: string[];
    contracts: string[];
    specifications: string[];
    reports: string[];
  }): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Gemini requise');
    }

    const fullContext = `
=== PLANS ===
${projectData.plans.join('\n\n')}

=== CONTRATS ===
${projectData.contracts.join('\n\n')}

=== SPÉCIFICATIONS ===
${projectData.specifications.join('\n\n')}

=== RAPPORTS ===
${projectData.reports.join('\n\n')}
`;

    const prompt = `
Analyse tous les risques de ce projet BTP basé sur l'ensemble de la documentation.

DOCUMENTATION COMPLÈTE :
${fullContext}

Format de réponse JSON :
{
  "risk_summary": "Résumé des risques principaux",
  "risk_categories": {
    "technical": [
      {
        "risk": "Description du risque",
        "probability": "low|medium|high",
        "impact": "low|medium|high|critical",
        "mitigation": "Stratégie d'atténuation",
        "cost": 10000
      }
    ],
    "financial": [...],
    "regulatory": [...],
    "environmental": [...],
    "timeline": [...]
  },
  "risk_matrix": [
    {
      "risk_id": "RISK_001",
      "category": "technical",
      "description": "Description",
      "probability_score": 3,
      "impact_score": 4,
      "risk_score": 12,
      "priority": "high"
    }
  ],
  "mitigation_plan": [
    {
      "risk_id": "RISK_001",
      "actions": ["action1", "action2"],
      "responsible": "Qui est responsable",
      "deadline": "Date limite",
      "budget": 5000
    }
  ],
  "overall_risk_level": "medium",
  "confidence": 88
}

Analyse de risques exhaustive avec plan de mitigation actionnable.
`;

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8000,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const estimatedTokens = Math.ceil((prompt.length + content.length) / 4);
      
      return {
        content,
        model: this.model,
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: estimatedTokens
        },
        cost: this.calculateCost(estimatedTokens)
      };

    } catch (error) {
      console.error('Erreur analyse risques Gemini:', error);
      throw error;
    }
  }

  /**
   * Génération de rapport de synthèse multi-sources
   */
  async generateExecutiveSummary(allProjectData: string[]): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Gemini requise');
    }

    const consolidatedData = allProjectData.join('\n\n=== SECTION SUIVANTE ===\n\n');

    const prompt = `
Génère un rapport de synthèse exécutif pour ce projet BTP basé sur toute la documentation.

DONNÉES COMPLÈTES DU PROJET :
${consolidatedData}

Format de réponse JSON :
{
  "executive_summary": "Résumé exécutif pour la direction",
  "key_findings": [
    {
      "category": "Catégorie",
      "finding": "Constatation principale",
      "impact": "Impact sur le projet",
      "recommendation": "Recommandation"
    }
  ],
  "project_health": {
    "overall_status": "green|yellow|red",
    "budget_status": "on_track|at_risk|over_budget",
    "timeline_status": "on_schedule|delayed|ahead",
    "quality_status": "excellent|good|concerns|poor"
  },
  "critical_decisions": [
    {
      "decision": "Décision requise",
      "deadline": "Date limite",
      "options": ["option1", "option2"],
      "recommendation": "Option recommandée",
      "rationale": "Justification"
    }
  ],
  "next_steps": [
    {
      "action": "Action à entreprendre",
      "owner": "Responsable",
      "deadline": "Date limite",
      "priority": "critical|high|medium|low"
    }
  ],
  "budget_summary": {
    "total_budget": 500000,
    "spent_to_date": 200000,
    "committed": 150000,
    "remaining": 150000,
    "forecast_variance": 25000
  },
  "confidence": 92
}

Rapport de direction professionnel et actionnable.
`;

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 6000,
            topP: 0.9,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const estimatedTokens = Math.ceil((prompt.length + content.length) / 4);
      
      return {
        content,
        model: this.model,
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: estimatedTokens
        },
        cost: this.calculateCost(estimatedTokens)
      };

    } catch (error) {
      console.error('Erreur génération synthèse Gemini:', error);
      throw error;
    }
  }

  /**
   * Calcul du coût Gemini (gratuit jusqu'à 15 req/min)
   */
  private calculateCost(totalTokens: number): number {
    // Gemini 1.5 Pro est gratuit jusqu'à 15 requêtes/minute
    // Au-delà : $7/1M tokens input, $21/1M tokens output (estimation moyenne)
    return (totalTokens / 1000000) * 14; // Prix moyen estimé
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Test de connexion' }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;

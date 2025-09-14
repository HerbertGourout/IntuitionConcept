// Adaptateur pour migrer les services existants vers le système hybride
import { HybridAIOrchestrator, HybridAIRequest, AIUsageMetrics } from './hybridAIOrchestrator';

// Instance globale de l'orchestrateur
const orchestrator = new HybridAIOrchestrator();

/**
 * Adaptateur pour le service de génération de devis existant
 */
export class QuoteGeneratorAdapter {
  /**
   * Génération de devis avec le système hybride
   */
  static async generateQuote(projectData: {
    type: string;
    budget: number;
    phases: Array<{
      name: string;
      description: string;
      estimatedCost: number;
    }>;
    location?: string;
    timeline?: string;
  }): Promise<{
    success: boolean;
    quote?: {
      phases: Array<{
        name: string;
        tasks: Array<{
          name: string;
          description: string;
          estimatedCost: number;
          duration: string;
        }>;
        totalCost: number;
      }>;
      totalCost: number;
      timeline: string;
      recommendations: string[];
    };
    error?: string;
    provider?: string;
    cost?: number;
  }> {
    try {
      const response = await orchestrator.generateQuote(projectData);
      
      if (response.content) {
        return {
          success: true,
          quote: JSON.parse(response.content),
          provider: response.providersUsed.join(' → '),
          cost: response.cost
        };
      } else {
        return {
          success: false,
          error: 'Aucun contenu généré'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erreur génération devis: ${error}`
      };
    }
  }
}

/**
 * Adaptateur pour le service OCR intelligent existant
 */
export class IntelligentOCRAdapter {
  /**
   * Traitement OCR avec analyse hybride
   */
  static async processDocument(file: File, documentType: 'invoice' | 'contract' | 'plan' = 'invoice'): Promise<{
    success: boolean;
    data?: {
      rawText: string;
      structuredData: Record<string, unknown>;
      confidence: number;
      documentType: string;
      suggestions: string[];
    };
    error?: string;
    provider?: string;
    cost?: number;
  }> {
    try {
      const response = await orchestrator.analyzeDocument(file, documentType);
      
      if (response.content) {
        // Parse the response content
        const parsedData = JSON.parse(response.content);
        
        // Adapter le format pour compatibilité avec l'existant
        const adaptedData = {
          rawText: parsedData.rawText || parsedData.extractedText || '',
          structuredData: parsedData.structuredData || {},
          confidence: parsedData.confidence || response.confidence || 85,
          documentType,
          suggestions: this.generateSuggestions(parsedData, documentType)
        };

        return {
          success: true,
          data: adaptedData,
          provider: response.providersUsed.join(' → '),
          cost: response.cost
        };
      } else {
        return {
          success: false,
          error: 'Aucun contenu généré lors de l\'analyse du document'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erreur traitement OCR: ${error}`
      };
    }
  }

  /**
   * Génération de suggestions basées sur l'analyse
   */
  private static generateSuggestions(data: Record<string, unknown>, documentType: string): string[] {
    const suggestions: string[] = [];

    if (documentType === 'invoice') {
      const structuredData = data.structuredData as Record<string, unknown>;
      if (structuredData?.supplier) {
        suggestions.push(`Fournisseur identifié: ${structuredData.supplier}`);
      }
      if (structuredData?.amount) {
        suggestions.push(`Montant détecté: ${structuredData.amount} FCFA`);
      }
      if (structuredData?.items && Array.isArray(structuredData.items)) {
        suggestions.push(`${structuredData.items.length} article(s) détecté(s)`);
      }
    } else if (documentType === 'plan') {
      const technicalSpecs = data.technicalSpecs as Record<string, unknown>;
      if (technicalSpecs?.dimensions && Array.isArray(technicalSpecs.dimensions)) {
        suggestions.push(`${technicalSpecs.dimensions.length} dimension(s) extraite(s)`);
      }
      if (technicalSpecs?.rooms && Array.isArray(technicalSpecs.rooms)) {
        suggestions.push(`Pièces identifiées: ${(technicalSpecs.rooms as string[]).join(', ')}`);
      }
      if (technicalSpecs?.materials && Array.isArray(technicalSpecs.materials)) {
        suggestions.push(`Matériaux détectés: ${(technicalSpecs.materials as string[]).join(', ')}`);
      }
    }

    return suggestions;
  }
}

/**
 * Adaptateur pour l'assistant IA existant (Copilot)
 */
export class AICopilotAdapter {
  /**
   * Chat avec l'assistant hybride
   */
  static async chat(message: string, context?: {
    projectId?: string;
    userId?: string;
    sessionId?: string;
    previousMessages?: Array<{ role: string; content: string; }>;
  }): Promise<{
    success: boolean;
    response?: string;
    suggestions?: string[];
    confidence?: number;
    provider?: string;
    cost?: number;
  }> {
    try {
      const response = await orchestrator.chatAssistant(message, context);
      
      if (response.content) {
        const parsedData = JSON.parse(response.content);
        return {
          success: true,
          response: parsedData.response || parsedData.content || response.content,
          suggestions: parsedData.suggestions || [],
          confidence: parsedData.confidence || response.confidence || 90,
          provider: response.providersUsed.join(' → '),
          cost: response.cost
        };
      } else {
        return {
          success: false
        };
      }
    } catch (error) {
      console.error('Erreur chat assistant:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Analyse de sentiment et intention
   */
  static async analyzeIntent(message: string): Promise<{
    intent: string;
    confidence: number;
    entities: Array<{ type: string; value: string; }>;
  }> {
    const request: HybridAIRequest = {
      type: 'classification',
      content: message,
      priority: 'low',
      preferredProvider: 'groq', // Rapide pour l'analyse d'intention
      context: { analysisType: 'intent_recognition' }
    };

    try {
      const response = await orchestrator.processRequest(request);
      
      if (response.content) {
        const parsedData = JSON.parse(response.content);
        return {
          intent: parsedData.intent || 'unknown',
          confidence: parsedData.confidence || response.confidence || 50,
          entities: parsedData.entities || []
        };
      }
    } catch (error) {
      console.error('Erreur analyse intention:', error);
    }

    // Fallback vers analyse basique
    return this.basicIntentAnalysis(message);
  }

  /**
   * Analyse d'intention basique (fallback)
   */
  private static basicIntentAnalysis(message: string): {
    intent: string;
    confidence: number;
    entities: Array<{ type: string; value: string; }>;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Patterns d'intention simples
    if (lowerMessage.includes('devis') || lowerMessage.includes('quote')) {
      return { intent: 'quote_request', confidence: 80, entities: [] };
    }
    if (lowerMessage.includes('budget') || lowerMessage.includes('coût')) {
      return { intent: 'budget_inquiry', confidence: 75, entities: [] };
    }
    if (lowerMessage.includes('projet') || lowerMessage.includes('project')) {
      return { intent: 'project_management', confidence: 70, entities: [] };
    }
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return { intent: 'help_request', confidence: 85, entities: [] };
    }

    return { intent: 'general_inquiry', confidence: 50, entities: [] };
  }
}

/**
 * Adaptateur pour la détection d'anomalies
 */
export class AnomalyDetectionAdapter {
  /**
   * Détection d'anomalies budgétaires
   */
  static async detectBudgetAnomalies(projectData: {
    budget: number;
    expenses: Array<{
      amount: number;
      category: string;
      date: string;
      description: string;
    }>;
    timeline: {
      startDate: string;
      endDate: string;
      currentPhase: string;
    };
  }): Promise<{
    anomalies: Array<{
      type: 'budget_overrun' | 'unusual_expense' | 'timeline_deviation' | 'cost_spike';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
      confidence: number;
    }>;
    summary: {
      totalAnomalies: number;
      criticalCount: number;
      estimatedImpact: number;
    };
    provider?: string;
    cost?: number;
  }> {
    try {
      const response = await orchestrator.detectBudgetAnomalies(projectData);
      
      if (response.content) {
        const parsedData = JSON.parse(response.content);
        if (parsedData.anomalies) {
          return {
            anomalies: parsedData.anomalies,
            summary: parsedData.summary || {
              totalAnomalies: parsedData.anomalies.length,
              criticalCount: parsedData.anomalies.filter((a: { severity: string }) => a.severity === 'critical').length,
              estimatedImpact: 0
            },
            provider: response.providersUsed.join(' → '),
            cost: response.cost
          };
        }
      }
    } catch (error) {
      console.error('Erreur détection anomalies:', error);
    }

    // Fallback vers détection basique
    return this.basicAnomalyDetection(projectData);
  }

  /**
   * Détection d'anomalies basique (fallback)
   */
  private static basicAnomalyDetection(projectData: {
    budget: number;
    expenses: Array<{
      amount: number;
      category: string;
      date: string;
      description: string;
    }>;
  }): {
    anomalies: Array<{
      type: 'budget_overrun' | 'unusual_expense' | 'timeline_deviation' | 'cost_spike';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
      confidence: number;
    }>;
    summary: {
      totalAnomalies: number;
      criticalCount: number;
      estimatedImpact: number;
    };
  } {
    const anomalies = [];
    const totalExpenses = projectData.expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);
    
    // Dépassement budgétaire
    if (totalExpenses > projectData.budget * 1.1) {
      anomalies.push({
        type: 'budget_overrun' as const,
        severity: totalExpenses > projectData.budget * 1.3 ? 'critical' as const : 'high' as const,
        description: `Dépassement budgétaire détecté: ${totalExpenses} FCFA vs ${projectData.budget} FCFA`,
        recommendation: 'Réviser le budget ou optimiser les dépenses',
        confidence: 95
      });
    }

    // Dépenses inhabituelles
    const avgExpense = totalExpenses / projectData.expenses.length;
    const unusualExpenses = projectData.expenses.filter((exp: { amount: number }) => exp.amount > avgExpense * 3);
    
    unusualExpenses.forEach((exp: { amount: number; description: string }) => {
      anomalies.push({
        type: 'unusual_expense' as const,
        severity: 'medium' as const,
        description: `Dépense inhabituelle: ${exp.amount} FCFA pour ${exp.description}`,
        recommendation: 'Vérifier la justification de cette dépense',
        confidence: 80
      });
    });

    return {
      anomalies,
      summary: {
        totalAnomalies: anomalies.length,
        criticalCount: anomalies.filter(a => a.severity === 'critical').length,
        estimatedImpact: totalExpenses - projectData.budget
      }
    };
  }
}

/**
 * Gestionnaire global pour l'orchestrateur hybride
 */
export class HybridAIManager {
  /**
   * Obtenir l'instance de l'orchestrateur
   */
  static getOrchestrator(): HybridAIOrchestrator {
    return orchestrator;
  }

  /**
   * Vérification de santé de tous les services
   */
  static async healthCheck(): Promise<{
    overall: boolean;
    services: Record<string, boolean>;
    metrics: AIUsageMetrics;
  }> {
    const services = await orchestrator.healthCheck();
    const metrics = orchestrator.getUsageMetrics();
    
    const overall = Object.values(services).some(status => status); // Au moins un service disponible
    
    return {
      overall,
      services,
      metrics
    };
  }

  /**
   * Réinitialiser les métriques
   */
  static resetMetrics(): void {
    orchestrator.resetMetrics();
  }
}

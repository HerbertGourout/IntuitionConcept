import { premiumHybridOrchestrator, PremiumAIRequest } from './premiumHybridOrchestrator';
import { ClaudeService } from './claudeService';

// Interface pour l'analyse de plan architectural
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
  };
  confidence: number;
  extractedText?: string;
  materials?: string[]; // Matériaux détectés dans le plan
}

export interface GeneratedQuote {
  id: string;
  clientName: string;
  projectName: string;
  location: string;
  totalAmount: number;
  items: Array<{
    id: string;
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
  }>;
  validityDays: number;
  createdAt: Date;
  metadata?: {
    source: string;
    confidence?: number;
    provider?: string;
    cost?: number;
    planAnalysis?: ArchitecturalPlanAnalysis;
  };
}

export class ArchitecturalPlanAnalyzer {
  private claudeService: ClaudeService;

  constructor() {
    // Utilise Claude pour l'analyse PDF native
    this.claudeService = new ClaudeService();
  }

  /**
   * Analyse un plan architectural avec Claude (PDF natif)
   */
  async analyzePlan(planFile: File): Promise<ArchitecturalPlanAnalysis> {
    try {
      console.log('🏗️ Analyse plan avec Claude PDF natif:', planFile.name);

      // Vérifier si Claude est disponible
      const isClaudeAvailable = await this.claudeService.healthCheck();

      if (isClaudeAvailable) {
        console.log('📄 Utilisation de Claude pour analyse PDF native');
        return await this.analyzeWithClaude(planFile);
      }

      // Si Claude n'est pas disponible, lever une erreur claire
      throw new Error('Claude PDF natif requis. Vérifiez la configuration de la clé API.');

    } catch (error) {
      console.error('❌ Erreur analyse plan:', error);
      throw new Error('Impossible d\'analyser le plan architectural.');
    }
  }

  /**
   * Analyse avec Claude (PDF natif)
   */
  private async analyzeWithClaude(planFile: File): Promise<ArchitecturalPlanAnalysis> {
    try {
      // Convertir le fichier en base64
      const base64 = await this.fileToBase64(planFile);

      // Analyser avec Claude
      const claudeResponse = await this.claudeService.analyzePlanPDF(base64);

      // Parser la réponse JSON
      const analysisData = JSON.parse(claudeResponse.content);

      console.log('✅ Claude analyse terminée:', analysisData);

      return {
        planType: analysisData.planType || 'floor_plan',
        extractedMeasurements: {
          totalArea: analysisData.dimensions?.totalArea || 100,
          rooms: analysisData.rooms || [],
          dimensions: analysisData.dimensions || {}
        },
        confidence: analysisData.confidence || 90,
        extractedText: claudeResponse.content,
        materials: analysisData.materials || []
      };

    } catch (error) {
      console.error('❌ Erreur Claude:', error);
      throw new Error('Échec de l\'analyse avec Claude');
    }
  }

  /**
   * Convertit un fichier en base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Génère un devis détaillé à partir d'une analyse de plan
   */
  async generateQuoteFromPlan(
    planAnalysis: ArchitecturalPlanAnalysis,
    projectDetails: {
      clientName: string;
      projectName: string;
      location: string;
      budget?: number;
    }
  ): Promise<GeneratedQuote> {
    try {
      // Utiliser le Stack IA Premium pour générer le devis
      const aiRequest: PremiumAIRequest = {
        type: 'plan',
        context: {
          planAnalysis,
          projectDetails,
          extractedData: {
            totalArea: planAnalysis.extractedMeasurements.totalArea || 100,
            rooms: planAnalysis.extractedMeasurements.rooms?.length || 3
          }
        }
      };

      const aiResponse = await premiumHybridOrchestrator.processRequest(aiRequest);

      if (!aiResponse.success) {
        throw new Error(`Erreur IA: ${aiResponse.content}`);
      }

      // Parser la réponse IA et créer le devis
      const aiQuoteData = JSON.parse(aiResponse.content);

      const quote: GeneratedQuote = {
        id: `quote-${Date.now()}`,
        clientName: projectDetails.clientName,
        projectName: projectDetails.projectName,
        location: projectDetails.location,
        totalAmount: aiQuoteData.total_estimate || projectDetails.budget || 100000,
        items: aiQuoteData.breakdown ? Object.entries(aiQuoteData.breakdown).map(([category, amount]) => ({
          id: `item-${category}`,
          category,
          description: `${category} - Estimation basée sur analyse IA du plan`,
          quantity: 1,
          unitPrice: amount as number,
          totalPrice: amount as number,
          unit: 'forfait'
        })) : [],
        validityDays: 30,
        createdAt: new Date(),
        metadata: {
          source: 'ai_premium_analysis',
          confidence: aiResponse.confidence,
          provider: aiResponse.provider,
          cost: aiResponse.cost,
          planAnalysis: planAnalysis
        }
      };

      return quote;
    } catch (error) {
      console.error('Erreur génération devis depuis plan:', error);
      throw new Error('Impossible de générer le devis depuis le plan');
    }
  }
}

// Export de l'instance
export const architecturalPlanAnalyzer = new ArchitecturalPlanAnalyzer();

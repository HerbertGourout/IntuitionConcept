// Service d'analyse d'appels d'offres avec Modèle AI

import { 
  Tender, 
  TenderRequirement, 
  EvaluationCriteria, 
  TenderComplexity,
  RequirementType 
} from '../../types/tender';
import { pdfConverter } from '../pdfConverter';
import { ocrService } from '../ocrService';

interface TenderAnalysisResult {
  tender: Tender;
  confidence: number;
  processingTime: number;
}

class TenderAnalyzerService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    // Utiliser le proxy Vite en développement pour éviter CORS
    this.baseUrl = import.meta.env.DEV 
      ? '/api/anthropic/v1' 
      : 'https://api.anthropic.com/v1';
  }

  
  private fallbackAnalysis(text: string): any {
    // Extraction basique par regex
    const lines = text.split('\n').filter(l => l.trim());
    
    // Titre (première ligne significative)
    const title = lines.find(l => l.length > 20 && l.length < 200) || 'Appel d\'offres';
    
    // Référence
    const refMatch = text.match(/(?:ref|référence|n°)[:\s]*([A-Z0-9\-\/]+)/i);
    const reference = refMatch ? refMatch[1] : `REF-${Date.now()}`;
    
    // Client
    const clientMatch = text.match(/(?:maître d'ouvrage|client|commanditaire)[:\s]*([^\n]{10,100})/i);
    const client = clientMatch ? clientMatch[1].trim() : 'Client non identifié';
    
    // Budget
    const budgetMatch = text.match(/(?:budget|montant)[:\s]*([0-9\s.]+)/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/\s/g, '')) : undefined;
    
    // Date limite
    const deadlineMatch = text.match(/(?:date limite|deadline)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    const deadline = deadlineMatch ? deadlineMatch[1] : undefined;
    
    return {
      title,
      reference,
      client,
      description: lines.slice(0, 5).join(' ').substring(0, 300),
      budget,
      currency: 'FCFA',
      deadline,
      location: 'Non spécifié',
      requirements: [
        {
          type: 'technical',
          description: 'Exigences techniques à définir',
          mandatory: true
        }
      ],
      evaluationCriteria: [
        {
          name: 'Prix',
          weight: 40,
          description: 'Évaluation du prix'
        },
        {
          name: 'Technique',
          weight: 40,
          description: 'Qualité technique'
        },
        {
          name: 'Délai',
          weight: 20,
          description: 'Respect des délais'
        }
      ],
      confidence: 60
    };
  }

  /**
   * Évalue la complexité de l'appel d'offres
   */
  private assessComplexity(analysis: any): TenderComplexity {
    let score = 0;
    
    // Budget
    if (analysis.budget > 100000000) score += 3; // > 100M FCFA
    else if (analysis.budget > 50000000) score += 2;
    else score += 1;
    
    // Nombre d'exigences
    const reqCount = analysis.requirements?.length || 0;
    if (reqCount > 20) score += 3;
    else if (reqCount > 10) score += 2;
    else score += 1;
    
    // Durée
    if (analysis.duration > 365) score += 3;
    else if (analysis.duration > 180) score += 2;
    else score += 1;
    
    if (score >= 7) return 'complex';
    if (score >= 5) return 'medium';
    return 'simple';
  }

  /**
   * Parse les exigences
   */
  private parseRequirements(requirements: any[]): TenderRequirement[] {
    return requirements.map((req, index) => ({
      id: `req-${index + 1}`,
      type: req.type as RequirementType,
      description: req.description,
      mandatory: req.mandatory !== false,
      status: 'not_met',
      notes: ''
    }));
  }

  /**
   * Parse les critères d'évaluation
   */
  private parseEvaluationCriteria(criteria: any[]): EvaluationCriteria[] {
    return criteria.map((crit, index) => ({
      id: `crit-${index + 1}`,
      name: crit.name,
      weight: crit.weight || 0,
      description: crit.description || '',
      ourScore: undefined
    }));
  }
}

// Instance singleton
export const tenderAnalyzer = new TenderAnalyzerService();

export default TenderAnalyzerService;

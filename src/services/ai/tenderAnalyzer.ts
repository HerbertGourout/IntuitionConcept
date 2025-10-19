// Service d'analyse d'appels d'offres avec Claude AI

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
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  }

  /**
   * Analyse complète d'un appel d'offres
   */
  async analyzeTender(file: File, userId: string): Promise<TenderAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('📄 Analyse de l\'appel d\'offres:', file.name);
      
      // 1. Extraire le texte du document
      const extractedText = await this.extractText(file);
      console.log(`✅ Texte extrait: ${extractedText.length} caractères`);
      
      // 2. Analyser avec Claude
      const analysis = await this.analyzeWithClaude(extractedText);
      console.log('✅ Analyse Claude terminée');
      
      // 3. Construire l'objet Tender
      const tender: Tender = {
        id: `tender-${Date.now()}`,
        title: analysis.title || 'Appel d\'offres sans titre',
        reference: analysis.reference || `REF-${Date.now()}`,
        client: analysis.client || 'Client non spécifié',
        description: analysis.description || '',
        
        budget: analysis.budget,
        currency: analysis.currency || 'FCFA',
        deadline: analysis.deadline ? new Date(analysis.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: analysis.startDate ? new Date(analysis.startDate) : undefined,
        duration: analysis.duration,
        location: analysis.location || 'Non spécifié',
        
        complexity: this.assessComplexity(analysis),
        requirements: this.parseRequirements(analysis.requirements || []),
        evaluationCriteria: this.parseEvaluationCriteria(analysis.evaluationCriteria || []),
        
        extractedText,
        status: 'analyzed',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      };
      
      const processingTime = Date.now() - startTime;
      
      return {
        tender,
        confidence: analysis.confidence || 85,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse appel d\'offres:', error);
      throw new Error(`Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Extrait le texte du document (PDF ou image)
   */
  private async extractText(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      // Extraction native PDF
      const result = await pdfConverter.extractTextFromPDF(file);
      return result.text;
    } else {
      // OCR pour les images
      const result = await ocrService.processImage(file);
      return result.text;
    }
  }

  /**
   * Analyse le texte avec Claude AI
   */
  private async analyzeWithClaude(text: string): Promise<any> {
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Claude manquante, utilisation du fallback');
      return this.fallbackAnalysis(text);
    }

    try {
      const prompt = `Tu es un expert en analyse d'appels d'offres BTP. Analyse ce document et extrais les informations clés.

DOCUMENT:
${text}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "title": "Titre de l'appel d'offres",
  "reference": "Numéro de référence",
  "client": "Nom du client/maître d'ouvrage",
  "description": "Description détaillée du projet (2-3 phrases)",
  "budget": 1000000,
  "currency": "FCFA",
  "deadline": "2024-12-31",
  "startDate": "2024-06-01",
  "duration": 180,
  "location": "Ville, Pays",
  "requirements": [
    {
      "type": "technical",
      "description": "Description de l'exigence",
      "mandatory": true
    }
  ],
  "evaluationCriteria": [
    {
      "name": "Prix",
      "weight": 40,
      "description": "Évaluation du prix proposé"
    }
  ],
  "confidence": 90
}

Types de requirements: "technical", "financial", "legal", "experience", "administrative"
Assure-toi que tous les champs numériques sont des nombres, pas des strings.`;

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Claude: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parser le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Réponse Claude invalide');
      }
      
      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error('❌ Erreur Claude API:', error);
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * Analyse de fallback sans IA
   */
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

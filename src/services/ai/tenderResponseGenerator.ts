// Service de génération de réponses aux appels d'offres avec Modèle AI

import {
  Tender,
  TenderResponse,
  CompanyProfile,
  ResponseGenerationConfig,
  TechnicalProposal,
  FinancialProposal,
  ProjectSchedule,
  TeamMember
} from '../../types/tender';

interface GenerationResult {
  response: TenderResponse;
  cost: number; // En FCFA
  processingTime: number;
}

class TenderResponseGeneratorService {
  private apiKey: string;
  private baseUrl: string;
  
  // Coûts par token (en FCFA)
  private readonly PRICING = {
    'Modèle-haiku': {
      input: 0.00025 / 1000,  // 0.25 FCFA / 1M tokens
      output: 0.00125 / 1000  // 1.25 FCFA / 1M tokens
    },
    'Modèle-sonnet': {
      input: 0.003 / 1000,    // 3 FCFA / 1M tokens
      output: 0.015 / 1000    // 15 FCFA / 1M tokens
    }
  };

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    // Utiliser le proxy Vite en développement pour éviter CORS
    this.baseUrl = import.meta.env.DEV
      ? '/api/anthropic/v1'
      : 'https://api.anthropic.com/v1';
  }

  /**
   * Génère une réponse complète à l'appel d'offres
   */
  async generateResponse(
    tender: Tender,
    companyProfile: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(' Génération de la réponse à l\'appel d\'offres...');
      
      // 1. Générer la lettre de motivation
      const coverLetter = await this.generateCoverLetter(tender, companyProfile, config);
      console.log('✅ Lettre de motivation générée');
      
      // 2. Générer la présentation de l'entreprise
      const companyPresentation = await this.generateCompanyPresentation(companyProfile, config);
      console.log('✅ Présentation entreprise générée');
      
      // 3. Générer la proposition technique
      const technicalProposal = await this.generateTechnicalProposal(tender, companyProfile, config);
      console.log('✅ Proposition technique générée');
      
      // 4. Générer la proposition financière
      const financialProposal = await this.generateFinancialProposal(tender, companyProfile, config);
      console.log('✅ Proposition financière générée');
      
      // 5. Générer le planning
      const schedule = await this.generateSchedule(tender, config);
      console.log('✅ Planning généré');
      
      // 6. Composer l'équipe
      const team = await this.composeTeam(tender, companyProfile, config);
      console.log('✅ Équipe composée');
      
      // 7. Sélectionner les références
      const references = this.selectReferences(tender, companyProfile);
      console.log('✅ Références sélectionnées');
      
      // 8. Calculer les scores
      const scores = this.calculateScores(tender, financialProposal);
      
      const response: TenderResponse = {
        id: `response-${Date.now()}`,
        tenderId: tender.id,
        
        coverLetter,
        companyPresentation,
        technicalProposal,
        financialProposal,
        schedule,
        team,
        references,
        
        administrativeDocuments: this.prepareAdministrativeDocuments(tender, companyProfile),
        
        completenessScore: scores.completeness,
        competitivenessScore: scores.competitiveness,
        winProbability: scores.winProbability,
        suggestions: scores.suggestions,
        
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const processingTime = Date.now() - startTime;
      const cost = this.estimateCost(config.aiModel, tender);
      
      console.log(`✅ Réponse générée en ${processingTime}ms pour ${cost.toFixed(2)} FCFA`);
      
      return {
        response,
        cost,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Erreur génération réponse:', error);
      throw new Error(`Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Génère la lettre de motivation
   */
  private async generateCoverLetter(
    tender: Tender,
    company: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<string> {
    if (!config.useAI || !this.apiKey) {
      return this.generateCoverLetterTemplate(tender, company);
    }

    const prompt = `Tu es un expert en rédaction de lettres de motivation pour des appels d'offres BTP.

APPEL D'OFFRES:
- Titre: ${tender.title}
- Client: ${tender.client}
- Référence: ${tender.reference}
- Description: ${tender.description}

NOTRE ENTREPRISE:
- Nom: ${company.name}
- Expérience: ${new Date().getFullYear() - company.yearFounded} ans
- Employés: ${company.employeeCount}
- Projets complétés: ${company.completedProjects}
- Spécialisations: ${company.specializations.join(', ')}

Rédige une lettre de motivation professionnelle et convaincante (300-400 mots) qui:
1. Exprime notre intérêt pour le projet
2. Met en avant notre expérience pertinente
3. Souligne notre compréhension des enjeux
4. Affirme notre engagement à respecter les exigences
5. Conclut avec confiance

Ton: ${config.tone === 'formal' ? 'Très formel et protocolaire' : 'Professionnel mais accessible'}
Langue: Français`;

    const response = await this.callModèle(prompt, config.aiModel);
    return response;
  }

  /**
   * Génère la présentation de l'entreprise
   */
  private async generateCompanyPresentation(
    company: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<string> {
    if (!config.useAI || !this.apiKey) {
      return this.generateCompanyPresentationTemplate(company);
    }

    const prompt = `Rédige une présentation professionnelle de notre entreprise BTP (400-500 mots):

INFORMATIONS:
- Nom: ${company.name}
- Forme juridique: ${company.legalForm}
- Année de création: ${company.yearFounded}
- Effectif: ${company.employeeCount} employés
- Chiffre d'affaires: ${company.annualRevenue.toLocaleString()} FCFA
- Certifications: ${company.certifications.join(', ')}
- Spécialisations: ${company.specializations.join(', ')}
- Projets complétés: ${company.completedProjects}
- Valeur totale des projets: ${company.totalProjectValue.toLocaleString()} FCFA

Structure:
1. Introduction et historique
2. Domaines d'expertise
3. Moyens humains et matériels
4. Certifications et qualifications
5. Réalisations marquantes
6. Engagement qualité et sécurité

Ton: Professionnel et crédible
Langue: Français`;

    const response = await this.callModèle(prompt, config.aiModel);
    return response;
  }

  /**
   * Génère la proposition technique
   */
  private async generateTechnicalProposal(
    tender: Tender,
    company: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<TechnicalProposal> {
    if (!config.useAI || !this.apiKey) {
      return this.generateTechnicalProposalTemplate(tender, company);
    }

    const prompt = `Tu es un ingénieur BTP expert. Génère une proposition technique détaillée.

PROJET:
${tender.description}

EXIGENCES TECHNIQUES:
${tender.requirements.filter(r => r.type === 'technical').map(r => `- ${r.description}`).join('\n')}

NOS MOYENS:
- Équipements: ${company.equipment.map(e => `${e.name} (${e.quantity})`).join(', ')}
- Spécialisations: ${company.specializations.join(', ')}

Réponds en JSON avec cette structure:
{
  "methodology": "Description de la méthodologie (200 mots)",
  "approach": "Approche technique détaillée (300 mots)",
  "qualityAssurance": "Plan d'assurance qualité (150 mots)",
  "riskManagement": "Gestion des risques (150 mots)",
  "innovations": ["Innovation 1", "Innovation 2", "Innovation 3"],
  "equipment": [
    {
      "name": "Nom de l'équipement",
      "quantity": 2,
      "specification": "Spécifications"
    }
  ]
}`;

    const response = await this.callModèle(prompt, config.aiModel);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return this.generateTechnicalProposalTemplate(tender, company);
  }

  /**
   * Génère la proposition financière
   */
  private async generateFinancialProposal(
    tender: Tender,
    company: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<FinancialProposal> {
    // Estimation basée sur le budget du tender
    const estimatedBudget = tender.budget || 50000000;
    const adjustmentFactor = config.competitivePricing ? 0.95 : 1.0;
    const totalAmount = Math.round(estimatedBudget * adjustmentFactor);

    // Décomposition standard
    const breakdown = [
      {
        category: 'Main d\'œuvre',
        description: 'Personnel qualifié et encadrement',
        quantity: 1,
        unitPrice: Math.round(totalAmount * 0.35),
        totalPrice: Math.round(totalAmount * 0.35)
      },
      {
        category: 'Matériaux',
        description: 'Fourniture de tous les matériaux',
        quantity: 1,
        unitPrice: Math.round(totalAmount * 0.40),
        totalPrice: Math.round(totalAmount * 0.40)
      },
      {
        category: 'Équipements',
        description: 'Location et utilisation d\'équipements',
        quantity: 1,
        unitPrice: Math.round(totalAmount * 0.15),
        totalPrice: Math.round(totalAmount * 0.15)
      },
      {
        category: 'Frais généraux',
        description: 'Gestion, assurances, garanties',
        quantity: 1,
        unitPrice: Math.round(totalAmount * 0.10),
        totalPrice: Math.round(totalAmount * 0.10)
      }
    ];

    return {
      totalAmount,
      currency: tender.currency,
      breakdown,
      paymentTerms: '30% à la commande, 40% à mi-parcours, 30% à la réception',
      validityPeriod: 90,
      warranty: 'Garantie décennale conformément à la réglementation'
    };
  }

  /**
   * Génère le planning
   */
  private async generateSchedule(
    tender: Tender,
    config: ResponseGenerationConfig
  ): Promise<ProjectSchedule> {
    const duration = tender.duration || 180;
    const startDate = tender.startDate || new Date();
    
    // Phases standards
    const phases = [
      {
        id: 'phase-1',
        name: 'Préparation et installation de chantier',
        description: 'Mise en place des installations de chantier',
        startDate: new Date(startDate),
        endDate: new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        duration: 15,
        dependencies: [],
        milestones: [
          {
            name: 'Installation complète',
            date: new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000),
            deliverable: 'Chantier opérationnel'
          }
        ]
      },
      {
        id: 'phase-2',
        name: 'Travaux de gros œuvre',
        description: 'Réalisation des fondations et structure',
        startDate: new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(startDate.getTime() + (duration * 0.5) * 24 * 60 * 60 * 1000),
        duration: Math.round(duration * 0.35),
        dependencies: ['phase-1'],
        milestones: [
          {
            name: 'Structure achevée',
            date: new Date(startDate.getTime() + (duration * 0.5) * 24 * 60 * 60 * 1000),
            deliverable: 'Gros œuvre terminé'
          }
        ]
      },
      {
        id: 'phase-3',
        name: 'Second œuvre',
        description: 'Finitions et équipements',
        startDate: new Date(startDate.getTime() + (duration * 0.5) * 24 * 60 * 60 * 1000),
        endDate: new Date(startDate.getTime() + (duration * 0.9) * 24 * 60 * 60 * 1000),
        duration: Math.round(duration * 0.4),
        dependencies: ['phase-2'],
        milestones: [
          {
            name: 'Finitions achevées',
            date: new Date(startDate.getTime() + (duration * 0.9) * 24 * 60 * 60 * 1000),
            deliverable: 'Second œuvre terminé'
          }
        ]
      },
      {
        id: 'phase-4',
        name: 'Réception et livraison',
        description: 'Tests, corrections et réception',
        startDate: new Date(startDate.getTime() + (duration * 0.9) * 24 * 60 * 60 * 1000),
        endDate: new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000),
        duration: Math.round(duration * 0.1),
        dependencies: ['phase-3'],
        milestones: [
          {
            name: 'Réception définitive',
            date: new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000),
            deliverable: 'Projet livré'
          }
        ]
      }
    ];

    return {
      phases,
      totalDuration: duration,
      criticalPath: ['phase-1', 'phase-2', 'phase-3', 'phase-4']
    };
  }

  /**
   * Compose l'équipe
   */
  private async composeTeam(
    tender: Tender,
    company: CompanyProfile,
    config: ResponseGenerationConfig
  ): Promise<TeamMember[]> {
    // Équipe type selon la complexité
    const baseTeam: TeamMember[] = [
      {
        id: 'member-1',
        name: 'Chef de Projet',
        role: 'Directeur de Projet',
        experience: 15,
        qualifications: ['Ingénieur Civil', 'PMP'],
        availability: 100
      },
      {
        id: 'member-2',
        name: 'Ingénieur Principal',
        role: 'Ingénieur en Chef',
        experience: 12,
        qualifications: ['Ingénieur BTP', 'Expert Structures'],
        availability: 100
      },
      {
        id: 'member-3',
        name: 'Conducteur de Travaux',
        role: 'Supervision Chantier',
        experience: 10,
        qualifications: ['Conducteur de Travaux', 'Sécurité Chantier'],
        availability: 100
      }
    ];

    if (tender.complexity === 'complex') {
      baseTeam.push(
        {
          id: 'member-4',
          name: 'Ingénieur Qualité',
          role: 'Contrôle Qualité',
          experience: 8,
          qualifications: ['Ingénieur Qualité', 'ISO 9001'],
          availability: 50
        },
        {
          id: 'member-5',
          name: 'Responsable HSE',
          role: 'Hygiène Sécurité Environnement',
          experience: 7,
          qualifications: ['HSE', 'Prévention des Risques'],
          availability: 50
        }
      );
    }

    return baseTeam;
  }

  /**
   * Sélectionne les références pertinentes
   */
  private selectReferences(tender: Tender, company: CompanyProfile): any[] {
    // Pour le MVP, retourner des références fictives
    // TODO: Intégrer avec la base de données de projets réels
    return [
      {
        projectId: 'proj-1',
        projectName: 'Construction Immeuble R+5',
        client: 'Société Immobilière ABC',
        value: 150000000,
        duration: 240,
        completionDate: new Date('2023-06-30'),
        description: 'Construction d\'un immeuble résidentiel de 5 étages'
      },
      {
        projectId: 'proj-2',
        projectName: 'Réhabilitation École Primaire',
        client: 'Ministère de l\'Éducation',
        value: 45000000,
        duration: 120,
        completionDate: new Date('2023-12-15'),
        description: 'Rénovation complète d\'une école de 12 classes'
      }
    ];
  }

  /**
   * Prépare les documents administratifs
   */
  private prepareAdministrativeDocuments(tender: Tender, company: CompanyProfile): any[] {
    return [
      {
        name: 'Registre de Commerce',
        type: 'legal',
        status: 'pending'
      },
      {
        name: 'Attestation Fiscale',
        type: 'fiscal',
        status: 'pending'
      },
      {
        name: 'Assurance Responsabilité Civile',
        type: 'insurance',
        status: 'pending'
      },
      {
        name: 'Certificat de Qualification',
        type: 'certification',
        status: 'pending'
      }
    ];
  }

  /**
   * Calcule les scores de la réponse
   */
  private calculateScores(tender: Tender, financial: FinancialProposal): any {
    // Complétude: % des exigences couvertes
    const completeness = 85; // TODO: Calculer réellement
    
    // Compétitivité: Position prix vs budget
    const competitiveness = tender.budget 
      ? Math.min(100, (tender.budget / financial.totalAmount) * 100)
      : 75;
    
    // Probabilité de gagner
    const winProbability = (completeness * 0.6 + competitiveness * 0.4);
    
    const suggestions = [];
    if (completeness < 90) {
      suggestions.push('Ajouter plus de détails techniques pour améliorer la complétude');
    }
    if (competitiveness < 80) {
      suggestions.push('Considérer une optimisation des coûts pour être plus compétitif');
    }
    if (winProbability > 80) {
      suggestions.push('Excellente proposition ! Vérifier les derniers détails avant soumission');
    }
    
    return {
      completeness,
      competitiveness,
      winProbability,
      suggestions
    };
  }

  /**
   * Appelle l'API Modèle
   */
  private async callModèle(prompt: string, model: 'Modèle-haiku' | 'Modèle-sonnet'): Promise<string> {
    const modelName = model === 'Modèle-haiku' 
      ? 'Modèle-3-haiku-20240307'
      : 'Modèle-3-sonnet-20240229';

    // En développement, le proxy Vite gère les headers automatiquement
    const headers: HeadersInit = {
      'content-type': 'application/json'
    };

    // En production, ajouter les headers d'authentification
    if (!import.meta.env.DEV) {
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Modèle (ResponseGenerator):', response.status, errorText);
      throw new Error(`Erreur API Modèle: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Estime le coût de génération
   */
  private estimateCost(model: 'Modèle-haiku' | 'Modèle-sonnet', tender: Tender): number {
    // Estimation grossière: ~10k tokens input, ~5k tokens output
    const pricing = this.PRICING[model];
    const inputTokens = 10000;
    const outputTokens = 5000;
    
    return (inputTokens * pricing.input + outputTokens * pricing.output) * 655; // Conversion USD -> FCFA
  }

  // Templates de fallback
  private generateCoverLetterTemplate(tender: Tender, company: CompanyProfile): string {
    return `Objet : Réponse à l'appel d'offres ${tender.reference}

Madame, Monsieur,

Nous avons l'honneur de vous soumettre notre offre pour le projet "${tender.title}".

${company.name}, forte de ${new Date().getFullYear() - company.yearFounded} années d'expérience dans le secteur du BTP, a réalisé avec succès ${company.completedProjects} projets pour une valeur totale de ${company.totalProjectValue.toLocaleString()} FCFA.

Notre expertise dans ${company.specializations.join(', ')} nous permet d'appréhender pleinement les enjeux de ce projet et de vous proposer une solution technique et financière optimale.

Nous nous engageons à respecter scrupuleusement le cahier des charges et à livrer un ouvrage de qualité dans les délais impartis.

Restant à votre disposition pour tout complément d'information, nous vous prions d'agréer, Madame, Monsieur, l'expression de notre considération distinguée.`;
  }

  private generateCompanyPresentationTemplate(company: CompanyProfile): string {
    return `PRÉSENTATION DE L'ENTREPRISE

${company.name} est une entreprise ${company.legalForm} créée en ${company.yearFounded}, spécialisée dans ${company.specializations.join(', ')}.

MOYENS HUMAINS
Effectif : ${company.employeeCount} collaborateurs qualifiés

MOYENS MATÉRIELS
${company.equipment.map(e => `- ${e.name} : ${e.quantity} unité(s)`).join('\n')}

CERTIFICATIONS
${company.certifications.join(', ')}

RÉALISATIONS
${company.completedProjects} projets réalisés pour un montant total de ${company.totalProjectValue.toLocaleString()} FCFA.`;
  }

  private generateTechnicalProposalTemplate(tender: Tender, company: CompanyProfile): TechnicalProposal {
    return {
      methodology: 'Nous proposons une approche méthodique en phases successives, avec un contrôle qualité à chaque étape.',
      approach: 'Notre approche technique s\'appuie sur notre expérience et nos moyens matériels pour garantir la qualité et le respect des délais.',
      qualityAssurance: 'Mise en place d\'un plan qualité avec contrôles réguliers et traçabilité complète.',
      riskManagement: 'Identification et mitigation proactive des risques tout au long du projet.',
      innovations: [
        'Utilisation de techniques modernes de construction',
        'Optimisation des délais par planification avancée',
        'Suivi digital du chantier'
      ],
      equipment: company.equipment.map(e => ({
        name: e.name,
        quantity: e.quantity,
        specification: `${e.condition} état`
      }))
    };
  }
}

// Instance singleton
export const tenderResponseGenerator = new TenderResponseGeneratorService();

export default TenderResponseGeneratorService;

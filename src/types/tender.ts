// Types pour le système de réponse aux appels d'offres

export type TenderComplexity = 'simple' | 'medium' | 'complex';
export type TenderStatus = 'draft' | 'analyzing' | 'analyzed' | 'generating' | 'generated' | 'submitted';
export type RequirementType = 'technical' | 'financial' | 'legal' | 'experience' | 'administrative';
export type RequirementStatus = 'met' | 'partial' | 'not_met' | 'not_applicable';

/**
 * Exigence d'un appel d'offres
 */
export interface TenderRequirement {
  id: string;
  type: RequirementType;
  description: string;
  mandatory: boolean;
  status: RequirementStatus;
  evidence?: string; // Référence au document/projet qui prouve la conformité
  notes?: string;
}

/**
 * Critère d'évaluation
 */
export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number; // Pourcentage (0-100)
  description: string;
  ourScore?: number; // Score estimé (0-100)
}

/**
 * Appel d'offres analysé
 */
export interface Tender {
  id: string;
  title: string;
  reference: string;
  client: string;
  description: string;
  
  // Informations extraites
  budget?: number;
  currency: string;
  deadline: Date;
  startDate?: Date;
  duration?: number; // En jours
  location: string;
  
  // Analyse
  complexity: TenderComplexity;
  requirements: TenderRequirement[];
  evaluationCriteria: EvaluationCriteria[];
  
  // Documents
  originalDocument?: File;
  extractedText: string;
  
  // Métadonnées
  status: TenderStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Composition de l'équipe proposée
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: number; // Années
  qualifications: string[];
  availability: number; // Pourcentage
  cvUrl?: string;
}

/**
 * Planning proposé
 */
export interface ProjectSchedule {
  phases: Array<{
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    duration: number; // Jours
    dependencies: string[]; // IDs des phases précédentes
    milestones: Array<{
      name: string;
      date: Date;
      deliverable: string;
    }>;
  }>;
  totalDuration: number;
  criticalPath: string[];
}

/**
 * Proposition technique
 */
export interface TechnicalProposal {
  methodology: string;
  approach: string;
  qualityAssurance: string;
  riskManagement: string;
  innovations: string[];
  equipment: Array<{
    name: string;
    quantity: number;
    specification: string;
  }>;
}

/**
 * Proposition financière
 */
export interface FinancialProposal {
  totalAmount: number;
  currency: string;
  breakdown: Array<{
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentTerms: string;
  validityPeriod: number; // Jours
  warranty: string;
}

/**
 * Réponse complète à l'appel d'offres
 */
export interface TenderResponse {
  id: string;
  tenderId: string;
  
  // Sections de la réponse
  coverLetter: string;
  companyPresentation: string;
  technicalProposal: TechnicalProposal;
  financialProposal: FinancialProposal;
  schedule: ProjectSchedule;
  team: TeamMember[];
  references: Array<{
    projectId: string;
    projectName: string;
    client: string;
    value: number;
    duration: number;
    completionDate: Date;
    description: string;
  }>;
  
  // Documents administratifs
  administrativeDocuments: Array<{
    name: string;
    type: string;
    url?: string;
    status: 'pending' | 'uploaded' | 'validated';
  }>;
  
  // Scoring
  completenessScore: number; // 0-100
  competitivenessScore: number; // 0-100
  winProbability: number; // 0-100
  suggestions: string[];
  
  // Métadonnées
  status: TenderStatus;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

/**
 * Profil de l'entreprise pour les réponses
 */
export interface CompanyProfile {
  id: string;
  name: string;
  legalForm: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  
  // Capacités
  yearFounded: number;
  employeeCount: number;
  annualRevenue: number;
  certifications: string[];
  specializations: string[];
  
  // Équipement
  equipment: Array<{
    name: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair';
  }>;
  
  // Références
  completedProjects: number;
  totalProjectValue: number;
  
  // Documents standards
  standardDocuments: Array<{
    type: string;
    name: string;
    url: string;
    expiryDate?: Date;
  }>;
}

/**
 * Configuration de génération de réponse
 */
export interface ResponseGenerationConfig {
  useAI: boolean;
  aiModel: 'Modèle-haiku' | 'Modèle-sonnet';
  tone: 'formal' | 'professional' | 'friendly';
  language: 'fr' | 'en';
  includeInnovations: boolean;
  emphasizeExperience: boolean;
  competitivePricing: boolean; // Ajuster les prix pour être compétitif
  maxBudget?: number;
}

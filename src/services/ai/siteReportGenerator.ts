

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SiteReportData {
  // Informations projet
  projectId: string;
  projectName: string;
  projectAddress: string;
  reportDate: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  
  // Avancement
  overallProgress: number; // Pourcentage global
  phaseProgress: {
    phaseName: string;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  }[];
  
  // Équipe
  teamPresence: {
    totalWorkers: number;
    present: number;
    absent: number;
    absentees: {
      name: string;
      role: string;
      reason?: string;
    }[];
  };
  
  // Travaux réalisés
  completedTasks: {
    taskName: string;
    description: string;
    progress: number;
    assignedTo: string;
    photos?: string[];
  }[];
  
  // Matériaux
  materialsUsed: {
    materialName: string;
    quantity: number;
    unit: string;
    supplier?: string;
  }[];
  
  materialsDelivered: {
    materialName: string;
    quantity: number;
    unit: string;
    supplier: string;
    deliveryTime: string;
    receivedBy: string;
  }[];
  
  // Équipements
  equipmentUsed: {
    equipmentName: string;
    hoursUsed: number;
    operator?: string;
    condition: 'good' | 'fair' | 'needs_maintenance';
  }[];
  
  // Incidents & Problèmes
  incidents: {
    type: 'safety' | 'quality' | 'delay' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    time: string;
    actionTaken?: string;
    photos?: string[];
  }[];
  
  // Météo
  weather: {
    condition: string; // Ensoleillé, Pluvieux, Nuageux, etc.
    temperature: number;
    humidity?: number;
    windSpeed?: number;
    impact: 'none' | 'minor' | 'moderate' | 'severe';
    workStoppages?: number; // Heures d'arrêt
  };
  
  // Observations & Notes
  observations: string[];
  
  // Prévisions demain
  nextDayPlan: {
    plannedTasks: string[];
    expectedDeliveries: string[];
    requiredWorkers: number;
    specialNotes?: string;
  };
  
  // Photos du jour
  photos: {
    url: string;
    caption: string;
    timestamp: string;
    location?: string;
  }[];
  
  // Auteur du rapport
  reportedBy: {
    name: string;
    role: string;
    signature?: string;
  };
}

export interface GeneratedReport {
  reportId: string;
  projectId: string;
  reportDate: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  
  // Contenu Généré automatiquement
  executiveSummary: string;
  detailedSections: {
    title: string;
    content: string;
    subsections?: {
      subtitle: string;
      content: string;
    }[];
  }[];
  
  // Statistiques
  statistics: {
    progressChange: string; // "+3% vs hier"
    workersProductivity: string;
    materialsConsumption: string;
    budgetStatus: string;
  };
  
  // Alertes & Recommandations
  alerts: {
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  recommendations: string[];
  
  // Métadonnées
  generatedAt: string;
  generatedBy: 'AI';
  aiModel: string;
  
  // Contenu brut pour export
  rawData: SiteReportData;
}

// ============================================================================
// SERVICE DE GÉNÉRATION DE RAPPORTS
// ============================================================================

export class SiteReportGeneratorService {
  private anthropic: Anthropic;
  private model: string = 'Modèle-sonnet-4-20250514';
  
  constructor(apiKey?: string) {
    const key = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Clé API Anthropic manquante');
    }
    this.anthropic = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  
  
  async generateReport(data: SiteReportData): Promise<GeneratedReport> {
    try {
      console.log(' Génération du rapport de chantier avec IA...');
      
      // Construire le prompt pour Modèle
      const prompt = this.buildReportPrompt(data);
      
      // Appeler Modèle pour générer le rapport
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      // Extraire le contenu généré
      const generatedContent = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Parser le contenu généré
      const parsedReport = this.parseGeneratedReport(generatedContent, data);
      
      console.log('✅ Rapport généré avec succès');
      return parsedReport;
      
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw new Error(`Échec génération rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  
  generateQuickReport(data: SiteReportData): GeneratedReport {
    return {
      reportId: `REPORT-${Date.now()}`,
      projectId: data.projectId,
      reportDate: data.reportDate,
      reportType: data.reportType,
      executiveSummary: `Rapport ${data.reportType} pour ${data.projectName}. Avancement: ${data.overallProgress}%. ${data.teamPresence.present} ouvriers présents. ${data.completedTasks.length} tâches réalisées.`,
      detailedSections: [
        {
          title: 'Travaux Réalisés',
          content: data.completedTasks.map(t => `${t.taskName}: ${t.description}`).join('\n')
        },
        {
          title: 'Ressources',
          content: `Équipe: ${data.teamPresence.present}/${data.teamPresence.totalWorkers}\nMatériaux: ${data.materialsUsed.length} utilisés\nÉquipements: ${data.equipmentUsed.length} utilisés`
        }
      ],
      statistics: {
        progressChange: `${data.overallProgress}%`,
        workersProductivity: 'Bonne',
        materialsConsumption: 'Normale',
        budgetStatus: 'Conforme'
      },
      alerts: data.incidents.map(i => ({
        type: i.severity === 'critical' ? 'error' : 'warning' as 'warning' | 'error',
        message: `${i.type}: ${i.description}`,
        priority: i.severity === 'critical' ? 'high' : 'medium' as 'high' | 'medium'
      })),
      recommendations: [
        'Continuer le bon travail',
        'Surveiller l\'avancement des phases en retard'
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI',
      aiModel: 'quick-generation',
      rawData: data
    };
  }
}

// Instance singleton
let siteReportGeneratorInstance: SiteReportGeneratorService | null = null;

export const initializeSiteReportGenerator = (apiKey?: string): SiteReportGeneratorService => {
  if (!siteReportGeneratorInstance) {
    siteReportGeneratorInstance = new SiteReportGeneratorService(apiKey);
  }
  return siteReportGeneratorInstance;
};

export const getSiteReportGenerator = (): SiteReportGeneratorService => {
  if (!siteReportGeneratorInstance) {
    return initializeSiteReportGenerator();
  }
  return siteReportGeneratorInstance;
};

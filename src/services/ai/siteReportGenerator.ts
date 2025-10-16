/**
 * Service de Génération Automatique de Rapports de Chantier
 * 
 * Fonctionnalités:
 * - Collecte automatique des données (photos, pointages, livraisons, météo)
 * - Génération de rapports professionnels avec IA
 * - Export PDF avec mise en page professionnelle
 * - Envoi automatique par email
 * 
 * @author IntuitionConcept BTP Platform
 * @version 1.0.0
 */

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
  
  // Contenu généré par IA
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
  private model: string = 'claude-sonnet-4-20250514';
  
  constructor(apiKey?: string) {
    const key = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Clé API Anthropic manquante');
    }
    this.anthropic = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  
  /**
   * Génère un rapport de chantier complet avec IA
   */
  async generateReport(data: SiteReportData): Promise<GeneratedReport> {
    try {
      console.log('🤖 Génération du rapport de chantier avec IA...');
      
      // Construire le prompt pour Claude
      const prompt = this.buildReportPrompt(data);
      
      // Appeler Claude pour générer le rapport
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
  
  /**
   * Construit le prompt pour Claude
   */
  private buildReportPrompt(data: SiteReportData): string {
    const reportTypeLabel = {
      daily: 'Rapport Journalier',
      weekly: 'Rapport Hebdomadaire',
      monthly: 'Rapport Mensuel'
    }[data.reportType];
    
    return `Tu es un expert en gestion de chantiers BTP. Génère un rapport de chantier professionnel et détaillé.

# INFORMATIONS DU CHANTIER

**Projet:** ${data.projectName}
**Adresse:** ${data.projectAddress}
**Date:** ${new Date(data.reportDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Type de rapport:** ${reportTypeLabel}

# AVANCEMENT GLOBAL

**Progression:** ${data.overallProgress}%

**Phases:**
${data.phaseProgress.map(p => `- ${p.phaseName}: ${p.progress}% (${p.status})`).join('\n')}

# ÉQUIPE PRÉSENTE

**Effectif:** ${data.teamPresence.present}/${data.teamPresence.totalWorkers} ouvriers présents
${data.teamPresence.absentees.length > 0 ? `\n**Absents:**\n${data.teamPresence.absentees.map(a => `- ${a.name} (${a.role})${a.reason ? `: ${a.reason}` : ''}`).join('\n')}` : ''}

# TRAVAUX RÉALISÉS

${data.completedTasks.map(t => `- **${t.taskName}** (${t.progress}%): ${t.description} - Réalisé par ${t.assignedTo}`).join('\n')}

# MATÉRIAUX

**Utilisés:**
${data.materialsUsed.map(m => `- ${m.materialName}: ${m.quantity} ${m.unit}`).join('\n')}

${data.materialsDelivered.length > 0 ? `\n**Livrés:**\n${data.materialsDelivered.map(m => `- ${m.materialName}: ${m.quantity} ${m.unit} (Fournisseur: ${m.supplier}, Heure: ${m.deliveryTime})`).join('\n')}` : ''}

# ÉQUIPEMENTS

${data.equipmentUsed.map(e => `- ${e.equipmentName}: ${e.hoursUsed}h d'utilisation (État: ${e.condition})`).join('\n')}

# MÉTÉO

**Conditions:** ${data.weather.condition}
**Température:** ${data.weather.temperature}°C
**Impact sur les travaux:** ${data.weather.impact}
${data.weather.workStoppages ? `**Arrêts de travail:** ${data.weather.workStoppages}h` : ''}

${data.incidents.length > 0 ? `\n# INCIDENTS\n\n${data.incidents.map(i => `- **[${i.severity.toUpperCase()}] ${i.type}** (${i.time}): ${i.description}${i.actionTaken ? `\n  Action prise: ${i.actionTaken}` : ''}`).join('\n')}` : ''}

${data.observations.length > 0 ? `\n# OBSERVATIONS\n\n${data.observations.map(o => `- ${o}`).join('\n')}` : ''}

# PRÉVISIONS DEMAIN

**Tâches prévues:**
${data.nextDayPlan.plannedTasks.map(t => `- ${t}`).join('\n')}

${data.nextDayPlan.expectedDeliveries.length > 0 ? `\n**Livraisons attendues:**\n${data.nextDayPlan.expectedDeliveries.map(d => `- ${d}`).join('\n')}` : ''}

**Effectif requis:** ${data.nextDayPlan.requiredWorkers} ouvriers

${data.nextDayPlan.specialNotes ? `\n**Notes spéciales:** ${data.nextDayPlan.specialNotes}` : ''}

---

**INSTRUCTIONS:**

Génère un rapport professionnel structuré avec:

1. **RÉSUMÉ EXÉCUTIF** (3-4 phrases) : Vue d'ensemble de la journée, points clés, avancement global

2. **TRAVAUX RÉALISÉS** : Détail des travaux avec analyse de la progression

3. **RESSOURCES** : Analyse de l'utilisation des équipes, matériaux et équipements

4. **MÉTÉO & IMPACT** : Impact des conditions météo sur les travaux

5. **INCIDENTS & PROBLÈMES** : Analyse des incidents et actions correctives

6. **STATISTIQUES** : Analyse comparative (vs hier/semaine dernière)

7. **ALERTES** : Points d'attention importants (délais, budget, qualité, sécurité)

8. **RECOMMANDATIONS** : Actions à prendre pour optimiser le chantier

9. **PRÉVISIONS** : Plan pour demain avec points d'attention

Utilise un ton professionnel, factuel et constructif. Mets en évidence les réussites et les points d'amélioration.

Formate ta réponse en JSON avec cette structure:
{
  "executiveSummary": "...",
  "sections": [
    {
      "title": "Travaux Réalisés",
      "content": "...",
      "subsections": [
        {"subtitle": "...", "content": "..."}
      ]
    }
  ],
  "statistics": {
    "progressChange": "+3% vs hier",
    "workersProductivity": "Excellente (9.2/10)",
    "materialsConsumption": "Conforme aux prévisions",
    "budgetStatus": "Dans les clous"
  },
  "alerts": [
    {"type": "warning", "message": "...", "priority": "high"}
  ],
  "recommendations": ["...", "..."]
}`;
  }
  
  /**
   * Parse le rapport généré par Claude
   */
  private parseGeneratedReport(content: string, data: SiteReportData): GeneratedReport {
    try {
      // Extraire le JSON du contenu
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format JSON non trouvé dans la réponse');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        reportId: `REPORT-${Date.now()}`,
        projectId: data.projectId,
        reportDate: data.reportDate,
        reportType: data.reportType,
        executiveSummary: parsed.executiveSummary || '',
        detailedSections: parsed.sections || [],
        statistics: parsed.statistics || {},
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || [],
        generatedAt: new Date().toISOString(),
        generatedBy: 'AI',
        aiModel: this.model,
        rawData: data
      };
      
    } catch (error) {
      console.error('❌ Erreur parsing rapport:', error);
      
      // Fallback: créer un rapport basique
      return this.createFallbackReport(content, data);
    }
  }
  
  /**
   * Crée un rapport de secours si le parsing échoue
   */
  private createFallbackReport(content: string, data: SiteReportData): GeneratedReport {
    return {
      reportId: `REPORT-${Date.now()}`,
      projectId: data.projectId,
      reportDate: data.reportDate,
      reportType: data.reportType,
      executiveSummary: `Rapport de chantier pour ${data.projectName} - ${new Date(data.reportDate).toLocaleDateString('fr-FR')}. Avancement global: ${data.overallProgress}%.`,
      detailedSections: [
        {
          title: 'Contenu du Rapport',
          content: content
        }
      ],
      statistics: {
        progressChange: `${data.overallProgress}%`,
        workersProductivity: `${data.teamPresence.present}/${data.teamPresence.totalWorkers} ouvriers`,
        materialsConsumption: `${data.materialsUsed.length} matériaux utilisés`,
        budgetStatus: 'À vérifier'
      },
      alerts: [],
      recommendations: [],
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI',
      aiModel: this.model,
      rawData: data
    };
  }
  
  /**
   * Génère un rapport rapide (sans IA) pour tests
   */
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

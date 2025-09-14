import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Anomaly {
  id?: string;
  type: 'budget_overrun' | 'timeline_delay' | 'cost_spike' | 'resource_conflict' | 'quality_issue' | 'weather_impact';
  severity: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  phaseId?: string;
  taskId?: string;
  title: string;
  description: string;
  detectedAt: Date;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  deviationPercentage: number;
  impact: {
    financial: number;
    timeline: number; // jours de retard
    quality: number; // score 0-100
  };
  recommendations: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'ignored';
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface AnomalyRule {
  id: string;
  name: string;
  type: Anomaly['type'];
  enabled: boolean;
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'deviation_from_average';
  metric: string;
  description: string;
}

export interface ProjectMetrics {
  projectId: string;
  timestamp: Date;
  budgetSpent: number;
  budgetAllocated: number;
  tasksCompleted: number;
  tasksTotal: number;
  daysElapsed: number;
  daysPlanned: number;
  averageCostPerDay: number;
  resourceUtilization: number;
  qualityScore: number;
}

class AnomalyDetectionService {
  private rules: AnomalyRule[] = [
    {
      id: 'budget_overrun_20',
      name: 'Dépassement budgétaire 20%',
      type: 'budget_overrun',
      enabled: true,
      threshold: 20,
      condition: 'greater_than',
      metric: 'budget_deviation_percentage',
      description: 'Alerte si le budget dépasse de plus de 20% le prévisionnel'
    },
    {
      id: 'timeline_delay_15',
      name: 'Retard planning 15%',
      type: 'timeline_delay',
      enabled: true,
      threshold: 15,
      condition: 'greater_than',
      metric: 'timeline_deviation_percentage',
      description: 'Alerte si le planning accuse un retard de plus de 15%'
    },
    {
      id: 'cost_spike_50',
      name: 'Pic de coût 50%',
      type: 'cost_spike',
      enabled: true,
      threshold: 50,
      condition: 'greater_than',
      metric: 'daily_cost_deviation_percentage',
      description: 'Alerte si le coût journalier dépasse de 50% la moyenne'
    },
    {
      id: 'quality_drop_70',
      name: 'Chute qualité <70%',
      type: 'quality_issue',
      enabled: true,
      threshold: 70,
      condition: 'less_than',
      metric: 'quality_score',
      description: 'Alerte si le score qualité tombe sous 70%'
    }
  ];

  // Analyser les métriques d'un projet pour détecter des anomalies
  async analyzeProject(projectId: string): Promise<Anomaly[]> {
    try {
      const metrics = await this.getProjectMetrics(projectId);
      if (!metrics) {
        return [];
      }

      const anomalies: Anomaly[] = [];

      // Analyser chaque règle activée
      for (const rule of this.rules.filter(r => r.enabled)) {
        const anomaly = await this.checkRule(rule, metrics);
        if (anomaly) {
          anomalies.push(anomaly);
        }
      }

      // Sauvegarder les nouvelles anomalies
      for (const anomaly of anomalies) {
        await this.saveAnomaly(anomaly);
      }

      return anomalies;
    } catch (error) {
      console.error('Erreur analyse anomalies:', error);
      return [];
    }
  }

  // Vérifier une règle spécifique
  private async checkRule(rule: AnomalyRule, metrics: ProjectMetrics): Promise<Anomaly | null> {
    const value = this.extractMetricValue(rule.metric, metrics);
    if (value === null) return null;

    let isAnomaly = false;
    let expectedValue = 0;

    switch (rule.condition) {
      case 'greater_than':
        isAnomaly = value > rule.threshold;
        expectedValue = rule.threshold;
        break;
      case 'less_than':
        isAnomaly = value < rule.threshold;
        expectedValue = rule.threshold;
        break;
      case 'deviation_from_average': {
        const average = await this.getHistoricalAverage(rule.metric, metrics.projectId);
        const deviation = Math.abs(value - average);
        const deviationPercentage = (deviation / average) * 100;
        isAnomaly = deviationPercentage > rule.threshold;
        expectedValue = average;
        break;
      }
    }

    if (!isAnomaly) return null;

    const deviation = Math.abs(value - expectedValue);
    const deviationPercentage = expectedValue > 0 ? (deviation / expectedValue) * 100 : 0;

    return {
      type: rule.type,
      severity: this.calculateSeverity(deviationPercentage),
      projectId: metrics.projectId,
      title: this.generateAnomalyTitle(rule.type, value, expectedValue),
      description: this.generateAnomalyDescription(rule, value, expectedValue),
      detectedAt: new Date(),
      expectedValue,
      actualValue: value,
      deviation,
      deviationPercentage,
      impact: this.calculateImpact(rule.type, deviation, deviationPercentage),
      recommendations: this.generateRecommendations(rule.type, deviationPercentage),
      status: 'active'
    };
  }

  // Extraire la valeur d'une métrique
  private extractMetricValue(metric: string, metrics: ProjectMetrics): number | null {
    switch (metric) {
      case 'budget_deviation_percentage':
        return metrics.budgetAllocated > 0 ? 
          ((metrics.budgetSpent - metrics.budgetAllocated) / metrics.budgetAllocated) * 100 : 0;
      
      case 'timeline_deviation_percentage':
        return metrics.daysPlanned > 0 ? 
          ((metrics.daysElapsed - metrics.daysPlanned) / metrics.daysPlanned) * 100 : 0;
      
      case 'daily_cost_deviation_percentage': {
        const expectedDailyCost = metrics.budgetAllocated / metrics.daysPlanned;
        return expectedDailyCost > 0 ? 
          ((metrics.averageCostPerDay - expectedDailyCost) / expectedDailyCost) * 100 : 0;
      }
      
      case 'quality_score':
        return metrics.qualityScore;
      
      case 'resource_utilization':
        return metrics.resourceUtilization;
      
      default:
        return null;
    }
  }

  // Calculer la sévérité basée sur le pourcentage de déviation
  private calculateSeverity(deviationPercentage: number): Anomaly['severity'] {
    if (deviationPercentage >= 100) return 'critical';
    if (deviationPercentage >= 50) return 'high';
    if (deviationPercentage >= 25) return 'medium';
    return 'low';
  }

  // Calculer l'impact de l'anomalie
  private calculateImpact(type: Anomaly['type'], deviation: number, deviationPercentage: number): Anomaly['impact'] {
    const baseImpact = {
      financial: 0,
      timeline: 0,
      quality: 0
    };

    switch (type) {
      case 'budget_overrun':
        baseImpact.financial = deviation;
        baseImpact.timeline = Math.floor(deviationPercentage / 10); // 1 jour par 10% de dépassement
        break;
      
      case 'timeline_delay':
        baseImpact.timeline = deviation;
        baseImpact.financial = deviation * 50000; // 50k XOF par jour de retard
        break;
      
      case 'cost_spike':
        baseImpact.financial = deviation;
        baseImpact.quality = Math.min(deviationPercentage / 2, 30); // Impact qualité limité
        break;
      
      case 'quality_issue':
        baseImpact.quality = 100 - deviation; // Score qualité inversé
        baseImpact.financial = (100 - deviation) * 1000; // Coût de reprise
        break;
    }

    return baseImpact;
  }

  // Générer des recommandations
  private generateRecommendations(type: Anomaly['type'], deviationPercentage: number): string[] {
    const recommendations: Record<Anomaly['type'], string[]> = {
      budget_overrun: [
        'Réviser le budget prévisionnel et identifier les postes de dépassement',
        'Négocier avec les fournisseurs pour réduire les coûts',
        'Optimiser les ressources et éliminer les gaspillages',
        'Envisager des alternatives moins coûteuses pour les matériaux'
      ],
      timeline_delay: [
        'Réorganiser le planning et prioriser les tâches critiques',
        'Augmenter temporairement les effectifs sur les tâches en retard',
        'Identifier et résoudre les blocages opérationnels',
        'Communiquer le nouveau planning au client'
      ],
      cost_spike: [
        'Analyser les causes du pic de coût (matériaux, main d\'œuvre, équipement)',
        'Vérifier les factures et détecter d\'éventuelles erreurs',
        'Mettre en place un contrôle budgétaire quotidien',
        'Renégocier les contrats si nécessaire'
      ],
      resource_conflict: [
        'Réaffecter les ressources selon les priorités',
        'Planifier l\'utilisation des équipements partagés',
        'Former du personnel supplémentaire si nécessaire'
      ],
      quality_issue: [
        'Effectuer un contrôle qualité approfondi',
        'Former les équipes aux bonnes pratiques',
        'Renforcer la supervision sur site',
        'Prévoir des reprises si nécessaire'
      ],
      weather_impact: [
        'Adapter le planning aux conditions météorologiques',
        'Prévoir des activités alternatives en intérieur',
        'Protéger les matériaux et équipements'
      ]
    };

    let recs = recommendations[type] || [];
    
    // Ajouter des recommandations spécifiques selon la sévérité
    if (deviationPercentage > 50) {
      recs = [
        'URGENT: Arrêter les travaux et analyser la situation',
        'Convoquer une réunion de crise avec toutes les parties prenantes',
        ...recs
      ];
    }

    return recs;
  }

  // Générer le titre de l'anomalie
  private generateAnomalyTitle(type: Anomaly['type'], actual: number, expected: number): string {
    const titles: Record<Anomaly['type'], string> = {
      budget_overrun: `Dépassement budgétaire: ${Math.round(actual)}% vs ${Math.round(expected)}% prévu`,
      timeline_delay: `Retard planning: ${Math.round(actual)} jours vs ${Math.round(expected)} jours prévus`,
      cost_spike: `Pic de coût: ${Math.round(actual)}% au-dessus de la moyenne`,
      resource_conflict: `Conflit de ressources détecté`,
      quality_issue: `Chute qualité: ${Math.round(actual)}% vs ${Math.round(expected)}% requis`,
      weather_impact: `Impact météorologique sur le planning`
    };

    return titles[type];
  }

  // Générer la description de l'anomalie
  private generateAnomalyDescription(rule: AnomalyRule, actual: number, expected: number): string {
    const deviation = Math.abs(actual - expected);
    const direction = actual > expected ? 'supérieur' : 'inférieur';
    
    return `${rule.description}. Valeur détectée: ${Math.round(actual * 100) / 100}, ` +
           `valeur attendue: ${Math.round(expected * 100) / 100}. ` +
           `Écart de ${Math.round(deviation * 100) / 100} (${direction} à la normale).`;
  }

  // Obtenir les métriques d'un projet (simulation)
  private async getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    // En production, ceci récupérerait les vraies métriques depuis Firebase
    // Pour la démo, on simule des métriques
    return {
      projectId,
      timestamp: new Date(),
      budgetSpent: 1850000, // 1.85M XOF dépensés
      budgetAllocated: 1500000, // 1.5M XOF alloués (dépassement!)
      tasksCompleted: 12,
      tasksTotal: 20,
      daysElapsed: 45,
      daysPlanned: 40, // Retard de 5 jours
      averageCostPerDay: 41111, // 1.85M / 45 jours
      resourceUtilization: 85,
      qualityScore: 65 // Score qualité faible
    };
  }

  // Obtenir la moyenne historique d'une métrique
  private async getHistoricalAverage(metric: string, _projectId: string): Promise<number> {
    // prevent unused parameter lint warning
    void _projectId;
    // Simulation - en production, calculer depuis l'historique
    const averages: Record<string, number> = {
      'budget_deviation_percentage': 5, // 5% de dépassement moyen
      'timeline_deviation_percentage': 8, // 8% de retard moyen
      'daily_cost_deviation_percentage': 15, // 15% de variation quotidienne
      'quality_score': 85, // Score qualité moyen de 85%
      'resource_utilization': 75 // Utilisation moyenne de 75%
    };

    return averages[metric] || 0;
  }

  // Sauvegarder une anomalie
  private async saveAnomaly(anomaly: Omit<Anomaly, 'id'>): Promise<string> {
    try {
      // Vérifier si l'anomalie existe déjà
      const existing = await this.findExistingAnomaly(anomaly);
      if (existing) {
        return existing.id!;
      }

      const docRef = await addDoc(collection(db, 'anomalies'), anomaly);
      return docRef.id;
    } catch (error) {
      console.error('Erreur sauvegarde anomalie:', error);
      throw error;
    }
  }

  // Vérifier si une anomalie similaire existe déjà
  private async findExistingAnomaly(anomaly: Omit<Anomaly, 'id'>): Promise<Anomaly | null> {
    try {
      const q = query(
        collection(db, 'anomalies'),
        where('projectId', '==', anomaly.projectId),
        where('type', '==', anomaly.type),
        where('status', '==', 'active'),
        orderBy('detectedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const existing = { id: doc.id, ...doc.data() } as Anomaly;

      // Vérifier si l'anomalie est récente (moins de 24h)
      const hoursSinceDetection = (Date.now() - existing.detectedAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceDetection < 24 ? existing : null;
    } catch (error) {
      console.error('Erreur recherche anomalie existante:', error);
      return null;
    }
  }

  // Obtenir toutes les anomalies d'un projet
  async getProjectAnomalies(projectId: string, status?: Anomaly['status']): Promise<Anomaly[]> {
    try {
      const baseQuery = query(
        collection(db, 'anomalies'),
        where('projectId', '==', projectId),
        orderBy('detectedAt', 'desc')
      );

      const finalQuery = status
        ? query(baseQuery, where('status', '==', status))
        : baseQuery;

      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Anomaly[];
    } catch (error) {
      console.error('Erreur récupération anomalies:', error);
      return [];
    }
  }

  // Analyser tous les projets actifs
  async analyzeAllActiveProjects(): Promise<{ projectId: string; anomalies: Anomaly[] }[]> {
    // Simulation - en production, récupérer tous les projets actifs
    const activeProjects = ['project_1', 'project_2', 'project_3'];
    
    const results = [];
    for (const projectId of activeProjects) {
      const anomalies = await this.analyzeProject(projectId);
      if (anomalies.length > 0) {
        results.push({ projectId, anomalies });
      }
    }

    return results;
  }

  // Obtenir les règles de détection
  getRules(): AnomalyRule[] {
    return this.rules;
  }

  // Mettre à jour une règle
  updateRule(ruleId: string, updates: Partial<AnomalyRule>): void {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService;

import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Anomaly {
  id?: string;
  type: 'budget_overrun' | 'timeline_delay' | 'cost_spike' | 'resource_conflict' | 'quality_issue' | 'weather_impact' | 'duplicate_transaction' | 'price_spike' | 'unusual_expense' | 'vendor_anomaly';
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
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  ignoredAt?: Date;
  ignoredBy?: string;
  ignoreReason?: string;
  resolution?: string;
  metadata?: Record<string, unknown>;
}

// Type étendu pour les anomalies financières avec informations supplémentaires
export interface FinancialAnomaly extends Anomaly {
  currency: string;
  amount: number;
  confidence: number;
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
      ],
      duplicate_transaction: [
        'Vérifier les factures pour confirmer le doublon',
        'Contacter le fournisseur pour clarification',
        'Supprimer la transaction en double',
        'Mettre en place un système de détection automatique'
      ],
      price_spike: [
        'Comparer avec d\'autres fournisseurs',
        'Vérifier la facture pour détecter des erreurs',
        'Négocier le prix avec le fournisseur',
        'Analyser les causes de l\'augmentation'
      ],
      unusual_expense: [
        'Vérifier la légitimité de la dépense',
        'Demander des justificatifs supplémentaires',
        'Analyser l\'impact sur le budget global',
        'Mettre en place des contrôles préventifs'
      ],
      vendor_anomaly: [
        'Évaluer la fiabilité du fournisseur',
        'Vérifier l\'historique des transactions',
        'Considérer des fournisseurs alternatifs',
        'Renforcer les contrôles sur ce fournisseur'
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
      weather_impact: `Impact météorologique sur le planning`,
      duplicate_transaction: `Transaction dupliquée détectée`,
      price_spike: `Pic de prix: +${Math.round(actual)}%`,
      unusual_expense: `Dépense inhabituelle: ${Math.round(actual)}`,
      vendor_anomaly: `Anomalie fournisseur détectée`
    };

    return titles[type] || 'Anomalie détectée';
  }

  // Générer la description de l'anomalie
  private generateAnomalyDescription(rule: AnomalyRule, actual: number, expected: number): string {
    const deviation = Math.abs(actual - expected);
    const direction = actual > expected ? 'supérieur' : 'inférieur';
    
    return `${rule.description}. Valeur détectée: ${Math.round(actual * 100) / 100}, ` +
           `valeur attendue: ${Math.round(expected * 100) / 100}. ` +
           `Écart de ${Math.round(deviation * 100) / 100} (${direction} à la normale).`;
  }

  // Obtenir les métriques d'un projet depuis Firebase
  private async getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    try {
      // 1. Récupérer le projet
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        console.warn(`Projet ${projectId} non trouvé`);
        return null;
      }
      
      const project = projectDoc.data();
      
      // 2. Récupérer les transactions pour calculer le budget dépensé
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('projectId', '==', projectId)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      const transactions = transactionsSnap.docs.map(d => d.data());
      
      const budgetSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const budgetAllocated = project.budget || 0;
      
      // 3. Récupérer les tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const tasksSnap = await getDocs(tasksQuery);
      const tasks = tasksSnap.docs.map(d => d.data());
      
      const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
      const tasksTotal = tasks.length;
      
      // 4. Calculer les jours écoulés et planifiés
      const startDate = project.startDate?.toDate ? project.startDate.toDate() : new Date(project.startDate);
      const endDate = project.endDate?.toDate ? project.endDate.toDate() : new Date(project.endDate);
      const today = new Date();
      
      const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const daysPlanned = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      const averageCostPerDay = daysElapsed > 0 ? budgetSpent / daysElapsed : 0;
      
      // 5. Calculer le score qualité
      const qualityScore = this.calculateQualityScore(project, tasks);
      
      // 6. Calculer l'utilisation des ressources
      const resourceUtilization = this.calculateResourceUtilization(project, tasks);
      
      return {
        projectId,
        timestamp: new Date(),
        budgetSpent,
        budgetAllocated,
        tasksCompleted,
        tasksTotal,
        daysElapsed,
        daysPlanned,
        averageCostPerDay,
        resourceUtilization,
        qualityScore
      };
    } catch (error) {
      console.error('Erreur récupération métriques projet:', error);
      return null;
    }
  }

  // Calculer le score qualité d'un projet
  private calculateQualityScore(project: any, tasks: any[]): number {
    let score = 100;
    
    // 1. Pénalité pour tâches en retard
    const today = new Date();
    const lateTasks = tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.dueDate) return false;
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < today;
    });
    score -= lateTasks.length * 5; // -5 points par tâche en retard
    
    // 2. Pénalité pour dépassement budgétaire
    if (project.spent && project.budget && project.spent > project.budget) {
      const overrun = ((project.spent - project.budget) / project.budget) * 100;
      score -= Math.min(overrun, 30); // Max -30 points
    }
    
    // 3. Bonus pour progression dans les temps
    if (project.progress > 0) {
      const expectedProgress = this.calculateExpectedProgress(project);
      if (project.progress >= expectedProgress) {
        score += 10; // +10 points si dans les temps
      } else {
        score -= Math.min((expectedProgress - project.progress) / 2, 20); // Pénalité si retard
      }
    }
    
    // 4. Pénalité pour incidents
    const incidents = project.incidents || 0;
    score -= incidents * 3; // -3 points par incident
    
    return Math.max(0, Math.min(100, score));
  }

  // Calculer la progression attendue d'un projet
  private calculateExpectedProgress(project: any): number {
    try {
      const startDate = project.startDate?.toDate ? project.startDate.toDate() : new Date(project.startDate);
      const endDate = project.endDate?.toDate ? project.endDate.toDate() : new Date(project.endDate);
      const today = new Date();
      
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (totalDays <= 0) return 0;
      return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    } catch {
      return 0;
    }
  }

  // Calculer l'utilisation des ressources
  private calculateResourceUtilization(project: any, tasks: any[]): number {
    if (tasks.length === 0) return 0;
    
    // Calculer le nombre de ressources uniques assignées
    const assignedResources = new Set(
      tasks.flatMap(t => t.assignedTo || [])
    ).size;
    
    // Utiliser la taille de l'équipe du projet ou le nombre de ressources assignées
    const totalResources = project.teamSize || assignedResources || 1;
    
    if (totalResources === 0) return 0;
    
    const utilization = (assignedResources / totalResources) * 100;
    
    return Math.min(100, utilization);
  }

  // Obtenir la moyenne historique d'une métrique depuis Firebase
  private async getHistoricalAverage(metric: string, projectId: string): Promise<number> {
    try {
      // Récupérer les métriques des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const metricsQuery = query(
        collection(db, 'project_metrics'),
        where('projectId', '==', projectId),
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      
      const metricsSnap = await getDocs(metricsQuery);
      
      if (metricsSnap.empty) {
        // Fallback : moyennes de l'industrie BTP
        return this.getIndustryAverage(metric);
      }
      
      const metrics = metricsSnap.docs.map(d => d.data() as ProjectMetrics);
      
      // Calculer la moyenne
      const values = metrics
        .map(m => this.extractMetricValue(metric, m))
        .filter(v => v !== null) as number[];
      
      if (values.length === 0) {
        return this.getIndustryAverage(metric);
      }
      
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      return average;
    } catch (error) {
      console.error('Erreur calcul moyenne historique:', error);
      return this.getIndustryAverage(metric);
    }
  }

  // Obtenir les moyennes de l'industrie (fallback)
  private getIndustryAverage(metric: string): number {
    const averages: Record<string, number> = {
      'budget_deviation_percentage': 5,
      'timeline_deviation_percentage': 8,
      'daily_cost_deviation_percentage': 15,
      'quality_score': 85,
      'resource_utilization': 75
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

  // Analyser tous les projets actifs depuis Firebase
  async analyzeAllActiveProjects(): Promise<{ projectId: string; anomalies: Anomaly[] }[]> {
    try {
      // Récupérer tous les projets actifs
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', 'in', ['active', 'in_progress', 'on_hold'])
      );
      
      const projectsSnap = await getDocs(projectsQuery);
      const activeProjects = projectsSnap.docs.map(d => d.id);
      
      // Analyser chaque projet
      const results = [];
      for (const projectId of activeProjects) {
        const anomalies = await this.analyzeProject(projectId);
        if (anomalies.length > 0) {
          results.push({ projectId, anomalies });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erreur analyse projets actifs:', error);
      return [];
    }
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

  // Détecter les anomalies financières (transactions, duplicatas, pics de prix)
  async detectAnomalies(
    projects: any[],
    transactions: any[],
    historical: any[]
  ): Promise<FinancialAnomaly[]> {
    const anomalies: FinancialAnomaly[] = [];
    
    for (const project of projects) {
      // 1. Détecter dépassements budgétaires
      if (project.spent > project.budget * 1.2) {
        const deviation = project.spent - project.budget;
        const deviationPercentage = (deviation / project.budget) * 100;
        
        anomalies.push({
          id: `budget_${project.id}_${Date.now()}`,
          type: 'budget_overrun',
          severity: deviationPercentage > 50 ? 'critical' : deviationPercentage > 30 ? 'high' : 'medium',
          projectId: project.id,
          title: `Dépassement budgétaire : +${deviationPercentage.toFixed(1)}%`,
          description: `Le projet "${project.name}" a dépassé son budget de ${deviationPercentage.toFixed(1)}%`,
          detectedAt: new Date(),
          expectedValue: project.budget,
          actualValue: project.spent,
          deviation,
          deviationPercentage,
          impact: {
            financial: deviation,
            timeline: Math.floor(deviationPercentage / 10),
            quality: 0
          },
          recommendations: [
            'Réviser le budget prévisionnel',
            'Identifier les postes de dépassement',
            'Négocier avec les fournisseurs'
          ],
          status: 'active',
          currency: project.currency || 'XAF',
          amount: deviation,
          confidence: 95
        });
      }
      
      // 2. Détecter transactions dupliquées
      const projectTransactions = transactions.filter(t => t.projectId === project.id);
      for (let i = 0; i < projectTransactions.length; i++) {
        for (let j = i + 1; j < projectTransactions.length; j++) {
          const t1 = projectTransactions[i];
          const t2 = projectTransactions[j];
          
          if (t1.amount === t2.amount &&
              t1.vendorName === t2.vendorName &&
              t1.date === t2.date &&
              t1.description === t2.description) {
            anomalies.push({
              id: `duplicate_${t1.id}_${t2.id}`,
              type: 'duplicate_transaction',
              severity: 'medium',
              projectId: project.id,
              title: 'Transaction dupliquée détectée',
              description: `Transaction identique trouvée : ${t1.description}`,
              detectedAt: new Date(),
              expectedValue: t1.amount,
              actualValue: t1.amount * 2,
              deviation: t1.amount,
              deviationPercentage: 100,
              impact: {
                financial: t1.amount,
                timeline: 0,
                quality: 0
              },
              recommendations: [
                'Vérifier les factures',
                'Contacter le fournisseur',
                'Supprimer le doublon'
              ],
              status: 'active',
              currency: t1.currency || 'XAF',
              amount: t1.amount,
              confidence: 90
            });
          }
        }
      }
      
      // 3. Détecter pics de prix
      for (const transaction of projectTransactions) {
        const similarHistorical = historical.filter(h => 
          h.vendorName === transaction.vendorName &&
          h.category === transaction.category
        );
        
        if (similarHistorical.length > 0) {
          const avgHistorical = similarHistorical.reduce((sum, h) => sum + h.amount, 0) / similarHistorical.length;
          const deviation = transaction.amount - avgHistorical;
          const deviationPercentage = (deviation / avgHistorical) * 100;
          
          if (deviationPercentage > 50) {
            anomalies.push({
              id: `price_spike_${transaction.id}`,
              type: 'price_spike',
              severity: deviationPercentage > 100 ? 'high' : 'medium',
              projectId: project.id,
              title: `Pic de prix : +${deviationPercentage.toFixed(0)}%`,
              description: `Le prix de "${transaction.description}" est ${deviationPercentage.toFixed(0)}% plus élevé que la moyenne historique`,
              detectedAt: new Date(),
              expectedValue: avgHistorical,
              actualValue: transaction.amount,
              deviation,
              deviationPercentage,
              impact: {
                financial: deviation,
                timeline: 0,
                quality: 0
              },
              recommendations: [
                'Vérifier la facture',
                'Comparer avec d\'autres fournisseurs',
                'Négocier le prix'
              ],
              status: 'active',
              currency: transaction.currency || 'XAF',
              amount: deviation,
              confidence: 85
            });
          }
        }
      }
    }
    
    return anomalies;
  }

  // Reconnaître une anomalie
  async acknowledgeAnomaly(anomalyId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'anomalies', anomalyId), {
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur reconnaissance anomalie:', error);
      throw error;
    }
  }

  // Résoudre une anomalie
  async resolveAnomaly(anomalyId: string, userId: string, resolution: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'anomalies', anomalyId), {
        status: 'resolved',
        resolvedBy: userId,
        resolvedAt: Timestamp.now(),
        resolution
      });
    } catch (error) {
      console.error('Erreur résolution anomalie:', error);
      throw error;
    }
  }

  // Ignorer une anomalie
  async ignoreAnomaly(anomalyId: string, userId: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'anomalies', anomalyId), {
        status: 'ignored',
        ignoredBy: userId,
        ignoredAt: Timestamp.now(),
        ignoreReason: reason
      });
    } catch (error) {
      console.error('Erreur ignorance anomalie:', error);
      throw error;
    }
  }

  // Sauvegarder les métriques d'un projet pour l'historique
  async saveProjectMetrics(projectId: string): Promise<void> {
    try {
      const metrics = await this.getProjectMetrics(projectId);
      if (!metrics) return;
      
      await addDoc(collection(db, 'project_metrics'), {
        ...metrics,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur sauvegarde métriques:', error);
    }
  }

  // Sauvegarder les métriques de tous les projets actifs
  async saveAllProjectMetrics(): Promise<void> {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', 'in', ['active', 'in_progress'])
      );
      
      const projectsSnap = await getDocs(projectsQuery);
      
      for (const doc of projectsSnap.docs) {
        await this.saveProjectMetrics(doc.id);
      }
    } catch (error) {
      console.error('Erreur sauvegarde toutes métriques:', error);
    }
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService;

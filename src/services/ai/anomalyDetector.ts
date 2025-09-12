// AI configuration removed as it's not currently used in anomaly detection

export interface AnomalyMetadata {
  // Budget overrun metadata
  budgetOriginal?: number;
  spent?: number;
  overrunPercentage?: number;
  
  // Unusual expense metadata
  categoryAverage?: number;
  multiplier?: number;
  category?: string;
  
  // Duplicate transaction metadata
  transaction1Id?: string;
  transaction2Id?: string;
  timeDifference?: number;
  
  // Price spike metadata
  historicalAverage?: number;
  priceIncrease?: number;
  historicalDataPoints?: number;
  
  // Vendor anomaly metadata
  currentSpending?: number;
  historicalSpending?: number;
  variation?: number;
}

export interface FinancialAnomaly {
  id: string;
  type: 'budget_overrun' | 'unusual_expense' | 'duplicate_transaction' | 'price_spike' | 'vendor_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount: number;
  currency: string;
  projectId?: string;
  quoteId?: string;
  transactionId?: string;
  vendorName?: string;
  detectedAt: string;
  confidence: number;
  suggestedActions: string[];
  metadata: AnomalyMetadata;
}

export interface AnomalyDetectionConfig {
  budgetOverrunThreshold: number; // Pourcentage (ex: 10 = 10%)
  unusualExpenseMultiplier: number; // Facteur par rapport à la moyenne (ex: 2.5)
  duplicateTransactionWindow: number; // Heures
  priceSpikeTolerance: number; // Pourcentage
  vendorAnomalyThreshold: number; // Pourcentage de variation
}

export interface ProjectData {
  id: string;
  name: string;
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  vendorName: string;
  projectId?: string;
  quoteId?: string;
  date: string;
  category: string;
}

class AnomalyDetector {
  private detectionConfig: AnomalyDetectionConfig = {
    budgetOverrunThreshold: 10, // 10%
    unusualExpenseMultiplier: 2.5,
    duplicateTransactionWindow: 24, // 24 heures
    priceSpikeTolerance: 30, // 30%
    vendorAnomalyThreshold: 50 // 50%
  };

  async detectAnomalies(
    projects: ProjectData[],
    transactions: TransactionData[],
    historicalData?: TransactionData[]
  ): Promise<FinancialAnomaly[]> {
    const anomalies: FinancialAnomaly[] = [];

    // 1. Détection des dépassements de budget
    const budgetAnomalies = this.detectBudgetOverruns(projects);
    anomalies.push(...budgetAnomalies);

    // 2. Détection des dépenses inhabituelles
    const expenseAnomalies = this.detectUnusualExpenses(transactions, historicalData);
    anomalies.push(...expenseAnomalies);

    // 3. Détection des transactions dupliquées
    const duplicateAnomalies = this.detectDuplicateTransactions(transactions);
    anomalies.push(...duplicateAnomalies);

    // 4. Détection des pics de prix
    const priceSpikeAnomalies = this.detectPriceSpikes(transactions, historicalData);
    anomalies.push(...priceSpikeAnomalies);

    // 5. Détection des anomalies fournisseurs
    const vendorAnomalies = this.detectVendorAnomalies(transactions, historicalData);
    anomalies.push(...vendorAnomalies);

    // Trier par sévérité et confiance
    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }

  private detectBudgetOverruns(projects: ProjectData[]): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];

    projects.forEach(project => {
      const overrunPercentage = ((project.spent - project.budget) / project.budget) * 100;
      
      if (overrunPercentage > this.detectionConfig.budgetOverrunThreshold) {
        const severity = this.calculateBudgetOverrunSeverity(overrunPercentage);
        const overrunAmount = project.spent - project.budget;
        
        anomalies.push({
          id: `budget_overrun_${project.id}_${Date.now()}`,
          type: 'budget_overrun',
          severity,
          title: `Dépassement de budget détecté`,
          description: `Le projet "${project.name}" a dépassé son budget de ${overrunPercentage.toFixed(1)}% (${overrunAmount.toLocaleString()} ${project.currency})`,
          amount: overrunAmount,
          currency: project.currency,
          projectId: project.id,
          detectedAt: new Date().toISOString(),
          confidence: Math.min(95, 70 + overrunPercentage),
          suggestedActions: [
            'Réviser le budget du projet',
            'Analyser les causes du dépassement',
            'Mettre en place des contrôles supplémentaires',
            'Informer les parties prenantes'
          ],
          metadata: {
            budgetOriginal: project.budget,
            spent: project.spent,
            overrunPercentage
          }
        });
      }
    });

    return anomalies;
  }

  private detectUnusualExpenses(
    transactions: TransactionData[],
    historicalData?: TransactionData[]
  ): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];
    
    if (!historicalData || historicalData.length === 0) return anomalies;

    // Calculer les moyennes par catégorie
    const categoryAverages = this.calculateCategoryAverages(historicalData);

    transactions.forEach(transaction => {
      const categoryAvg = categoryAverages[transaction.category];
      if (!categoryAvg) return;

      const multiplier = transaction.amount / categoryAvg;
      
      if (multiplier > this.detectionConfig.unusualExpenseMultiplier) {
        const severity = this.calculateUnusualExpenseSeverity(multiplier);
        
        anomalies.push({
          id: `unusual_expense_${transaction.id}_${Date.now()}`,
          type: 'unusual_expense',
          severity,
          title: `Dépense inhabituelle détectée`,
          description: `Transaction de ${transaction.amount.toLocaleString()} ${transaction.currency} pour "${transaction.description}" est ${multiplier.toFixed(1)}x supérieure à la moyenne`,
          amount: transaction.amount,
          currency: transaction.currency,
          projectId: transaction.projectId,
          transactionId: transaction.id,
          vendorName: transaction.vendorName,
          detectedAt: new Date().toISOString(),
          confidence: Math.min(90, 50 + (multiplier * 10)),
          suggestedActions: [
            'Vérifier la justification de cette dépense',
            'Contacter le fournisseur pour confirmation',
            'Examiner les documents justificatifs',
            'Approuver ou rejeter la transaction'
          ],
          metadata: {
            categoryAverage: categoryAvg,
            multiplier,
            category: transaction.category
          }
        });
      }
    });

    return anomalies;
  }

  private detectDuplicateTransactions(transactions: TransactionData[]): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];
    const windowMs = this.detectionConfig.duplicateTransactionWindow * 60 * 60 * 1000;

    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        const t1 = transactions[i];
        const t2 = transactions[j];

        // Vérifier si les transactions sont similaires
        if (
          Math.abs(t1.amount - t2.amount) < 0.01 &&
          t1.vendorName === t2.vendorName &&
          t1.currency === t2.currency &&
          Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime()) < windowMs
        ) {
          anomalies.push({
            id: `duplicate_${t1.id}_${t2.id}_${Date.now()}`,
            type: 'duplicate_transaction',
            severity: 'medium',
            title: `Transaction potentiellement dupliquée`,
            description: `Deux transactions identiques de ${t1.amount.toLocaleString()} ${t1.currency} chez ${t1.vendorName}`,
            amount: t1.amount,
            currency: t1.currency,
            projectId: t1.projectId,
            vendorName: t1.vendorName,
            detectedAt: new Date().toISOString(),
            confidence: 85,
            suggestedActions: [
              'Vérifier les deux transactions',
              'Supprimer le doublon si confirmé',
              'Contacter le fournisseur',
              'Mettre à jour les contrôles de saisie'
            ],
            metadata: {
              transaction1Id: t1.id,
              transaction2Id: t2.id,
              timeDifference: Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime())
            }
          });
        }
      }
    }

    return anomalies;
  }

  private detectPriceSpikes(
    transactions: TransactionData[],
    historicalData?: TransactionData[]
  ): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];
    
    if (!historicalData || historicalData.length === 0) return anomalies;

    // Grouper par fournisseur et catégorie
    const vendorCategoryPrices = this.groupPricesByVendorCategory(historicalData);

    transactions.forEach(transaction => {
      const key = `${transaction.vendorName}_${transaction.category}`;
      const historicalPrices = vendorCategoryPrices[key];
      
      if (!historicalPrices || historicalPrices.length < 3) return;

      const avgPrice = historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length;
      const priceIncrease = ((transaction.amount - avgPrice) / avgPrice) * 100;

      if (priceIncrease > this.detectionConfig.priceSpikeTolerance) {
        const severity = this.calculatePriceSpikeSeverity(priceIncrease);
        
        anomalies.push({
          id: `price_spike_${transaction.id}_${Date.now()}`,
          type: 'price_spike',
          severity,
          title: `Pic de prix détecté`,
          description: `Prix chez ${transaction.vendorName} a augmenté de ${priceIncrease.toFixed(1)}% par rapport à la moyenne historique`,
          amount: transaction.amount,
          currency: transaction.currency,
          projectId: transaction.projectId,
          transactionId: transaction.id,
          vendorName: transaction.vendorName,
          detectedAt: new Date().toISOString(),
          confidence: Math.min(85, 60 + (priceIncrease / 2)),
          suggestedActions: [
            'Négocier avec le fournisseur',
            'Chercher des fournisseurs alternatifs',
            'Vérifier les conditions du marché',
            'Revoir les contrats fournisseurs'
          ],
          metadata: {
            historicalAverage: avgPrice,
            priceIncrease,
            category: transaction.category,
            historicalDataPoints: historicalPrices.length
          }
        });
      }
    });

    return anomalies;
  }

  private detectVendorAnomalies(
    transactions: TransactionData[],
    historicalData?: TransactionData[]
  ): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];
    
    if (!historicalData || historicalData.length === 0) return anomalies;

    // Analyser les patterns de dépenses par fournisseur
    const vendorSpending = this.calculateVendorSpending(transactions);
    const historicalVendorSpending = this.calculateVendorSpending(historicalData);

    Object.entries(vendorSpending).forEach(([vendorName, currentSpending]) => {
      const historicalSpending = historicalVendorSpending[vendorName];
      if (!historicalSpending) return;

      const variation = ((currentSpending - historicalSpending) / historicalSpending) * 100;
      
      if (Math.abs(variation) > this.detectionConfig.vendorAnomalyThreshold) {
        const severity = variation > 0 ? 'medium' : 'low';
        const type = variation > 0 ? 'Augmentation' : 'Diminution';
        
        anomalies.push({
          id: `vendor_anomaly_${vendorName}_${Date.now()}`,
          type: 'vendor_anomaly',
          severity,
          title: `${type} inhabituelle des dépenses fournisseur`,
          description: `Les dépenses chez ${vendorName} ont ${variation > 0 ? 'augmenté' : 'diminué'} de ${Math.abs(variation).toFixed(1)}%`,
          amount: currentSpending,
          currency: 'XAF', // Devise par défaut
          vendorName,
          detectedAt: new Date().toISOString(),
          confidence: Math.min(80, 50 + Math.abs(variation) / 2),
          suggestedActions: [
            'Analyser les causes de la variation',
            'Vérifier les contrats fournisseurs',
            'Examiner les volumes commandés',
            'Contacter le fournisseur pour clarification'
          ],
          metadata: {
            currentSpending,
            historicalSpending,
            variation
          }
        });
      }
    });

    return anomalies;
  }

  // Méthodes utilitaires
  private calculateBudgetOverrunSeverity(overrunPercentage: number): FinancialAnomaly['severity'] {
    if (overrunPercentage > 50) return 'critical';
    if (overrunPercentage > 25) return 'high';
    if (overrunPercentage > 15) return 'medium';
    return 'low';
  }

  private calculateUnusualExpenseSeverity(multiplier: number): FinancialAnomaly['severity'] {
    if (multiplier > 10) return 'critical';
    if (multiplier > 5) return 'high';
    if (multiplier > 3) return 'medium';
    return 'low';
  }

  private calculatePriceSpikeSeverity(priceIncrease: number): FinancialAnomaly['severity'] {
    if (priceIncrease > 100) return 'critical';
    if (priceIncrease > 75) return 'high';
    if (priceIncrease > 50) return 'medium';
    return 'low';
  }

  private calculateCategoryAverages(transactions: TransactionData[]): Record<string, number> {
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { sum: 0, count: 0 };
      }
      categoryTotals[transaction.category].sum += transaction.amount;
      categoryTotals[transaction.category].count += 1;
    });

    const averages: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, data]) => {
      averages[category] = data.sum / data.count;
    });

    return averages;
  }

  private groupPricesByVendorCategory(transactions: TransactionData[]): Record<string, number[]> {
    const groups: Record<string, number[]> = {};
    
    transactions.forEach(transaction => {
      const key = `${transaction.vendorName}_${transaction.category}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction.amount);
    });

    return groups;
  }

  private calculateVendorSpending(transactions: TransactionData[]): Record<string, number> {
    const spending: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (!spending[transaction.vendorName]) {
        spending[transaction.vendorName] = 0;
      }
      spending[transaction.vendorName] += transaction.amount;
    });

    return spending;
  }

  // Configuration
  updateConfig(newConfig: Partial<AnomalyDetectionConfig>): void {
    this.detectionConfig = { ...this.detectionConfig, ...newConfig };
  }

  getConfig(): AnomalyDetectionConfig {
    return { ...this.detectionConfig };
  }
}

export const anomalyDetector = new AnomalyDetector();

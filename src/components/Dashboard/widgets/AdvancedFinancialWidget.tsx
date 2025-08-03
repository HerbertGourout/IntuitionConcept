import React, { useState, useEffect } from 'react';
import { Euro, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import { useCurrency } from '../../../hooks/useCurrency';

interface FinancialData {
  pendingPurchaseOrders: number;
  totalCommitted: number;
  actualSpent: number;
  predictedSpent: number;
  budgetHealth: 'good' | 'warning' | 'critical';
  nextPayments: Array<{
    id: string;
    amount: number;
    dueDate: string;
    supplier: string;
  }>;
  monthlyTrend: 'up' | 'down' | 'stable';
}

const AdvancedFinancialWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const { formatAmount } = useCurrency();
  const [financialData, setFinancialData] = useState<FinancialData>({
    pendingPurchaseOrders: 0,
    totalCommitted: 0,
    actualSpent: 0,
    predictedSpent: 0,
    budgetHealth: 'good',
    nextPayments: [],
    monthlyTrend: 'stable'
  });

  useEffect(() => {
    if (!currentProject) return;

    // Calculs basés sur les vraies données du projet
    const budget = currentProject.budget || 0;
    const spent = currentProject.spent || 0;
    
    // Calculs réels basés sur les phases et tâches
    const totalTasksBudget = (currentProject.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, task) => tSum + (task.budget || 0), 0),
      0
    );
    
    const totalTasksSpent = (currentProject.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, task) => tSum + (task.spent || 0), 0),
      0
    );

    // Données réelles du projet
    const pendingPurchaseOrders = 0; // Pas de système de bons d'achat implémenté
    const totalCommitted = totalTasksBudget; // Budget alloué aux tâches
    const actualSpent = totalTasksSpent; // Dépenses réelles des tâches
    const predictedSpent = totalTasksBudget; // Prédiction basée sur le budget alloué
    
    // Calcul de la santé budgétaire basé sur les vraies données
    const spentPercentage = budget > 0 ? (actualSpent / budget) * 100 : 0;
    let budgetHealth: 'good' | 'warning' | 'critical' = 'good';
    if (spentPercentage > 90) budgetHealth = 'critical';
    else if (spentPercentage > 75) budgetHealth = 'warning';

    // Prochains paiements basés sur les tâches en cours
    const upcomingTasks = (currentProject.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => 
        task.status === 'in_progress' && task.budget && task.budget > (task.spent || 0)
      )
    );
    
    const nextPayments = upcomingTasks.slice(0, 2).map((task, index) => ({
      id: task.id,
      amount: (task.budget || 0) - (task.spent || 0),
      dueDate: task.dueDate || new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: `Tâche: ${task.name || task.id}`
    }));

    setFinancialData({
      pendingPurchaseOrders,
      totalCommitted,
      actualSpent,
      predictedSpent,
      budgetHealth,
      nextPayments,
      monthlyTrend: actualSpent > spent ? 'up' : 'stable'
    });
  }, [currentProject]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Finances Avancées</h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(financialData.budgetHealth)}`}>
          {getHealthIcon(financialData.budgetHealth)}
          <span className="ml-1 capitalize">{financialData.budgetHealth}</span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Engagé</span>
            <Euro className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatAmount(financialData.totalCommitted)}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Dépensé</span>
            <div className="flex items-center">
              {financialData.monthlyTrend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatAmount(financialData.actualSpent)}
          </div>
        </div>
      </div>

      {/* Bons d'achat en attente */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bons d'achat en attente</span>
          <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
            {financialData.pendingPurchaseOrders}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((financialData.pendingPurchaseOrders / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Prochains paiements */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Prochains paiements</h4>
        <div className="space-y-2">
          {financialData.nextPayments.slice(0, 2).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {payment.supplier}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {formatAmount(payment.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prédiction */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Prédiction fin projet</span>
          <span className={`font-medium ${
            financialData.predictedSpent > (currentProject?.budget || 0) 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {formatAmount(financialData.predictedSpent)}
          </span>
        </div>
      </div>
    </div>
  );
};

export { AdvancedFinancialWidget };

export default AdvancedFinancialWidget;

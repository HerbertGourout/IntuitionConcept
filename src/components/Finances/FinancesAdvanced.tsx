import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calculator,
  BarChart3,
  AlertTriangle,
  Wrench,
  FileText,
  Target,
  Activity,
  Users,
  Building,
  ArrowUp,
  ArrowDown,
  Percent,
  LineChart
} from 'lucide-react';
import { Transaction } from '../../types/finance';
import { useProjectContext } from '../../contexts/ProjectContext';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
import { CurrencyService } from '../../services/currencyService';
import { transactionService } from '../../services/transactionService';
import { financialService } from '../../services/financialService';
import ProgressBar from '../UI/ProgressBar';

interface FinancialSummary {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  budgetUtilization: number;
  equipmentCosts: number;
  laborCosts: number;
  materialCosts: number;
  pendingPayments: number;
  roi: number; // Return on Investment
  cashFlow: number;
  profitMargin: number;
  costPerPhase: { [key: string]: number };
  monthlyTrend: { month: string; income: number; expenses: number; }[];
  riskLevel: 'low' | 'medium' | 'high';
  forecastedCompletion: number;
  varianceFromBudget: number;
}

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

const FinancesAdvanced: React.FC = () => {
  const projectContext = useProjectContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'budget' | 'forecast'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [monthlyTrends, setMonthlyTrends] = useState<{ month: string; income: number; expenses: number; }[]>([]);
  
  // État pour la monnaie
  const [currency, setCurrency] = useState({ symbol: 'FCFA', position: 'after' as 'before' | 'after' });
  
  const currentProject = projectContext.currentProject;
  
  // Charger la monnaie par défaut et les transactions
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const defaultCurrency = await CurrencyService.getDefaultCurrency();
        setCurrency({ symbol: defaultCurrency.symbol, position: defaultCurrency.position });
      } catch (error) {
        console.warn('Erreur lors du chargement de la monnaie:', error);
      }
    };
    loadCurrency();
  }, []);

  // Charger les transactions et tendances mensuelles du projet actuel
  useEffect(() => {
    if (!currentProject?.id) {
      setTransactions([]);
      setMonthlyTrends([]);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Chargement des données financières...');
        
        // Charger les transactions
        const projectTransactions = await transactionService.getTransactionsByProject(currentProject.id);
        setTransactions(projectTransactions);
        
        // Charger les tendances mensuelles réelles depuis Firebase
        const realTrends = await financialService.calculateMonthlyTrends(currentProject.id, 6);
        setMonthlyTrends(realTrends);
        
        console.log('✅ Données financières chargées:', {
          transactions: projectTransactions.length,
          trends: realTrends.length
        });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données financières:', error);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };

    loadData();

    // Écouter les changements en temps réel
    const unsubscribe = transactionService.subscribeToTransactions(
      currentProject.id,
      (updatedTransactions) => {
        setTransactions(updatedTransactions);
        // Recharger les tendances quand les transactions changent
        financialService.calculateMonthlyTrends(currentProject.id, 6)
          .then((realTrends: { month: string; income: number; expenses: number; }[]) => setMonthlyTrends(realTrends))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => console.error('Erreur rechargement tendances:', error));
      }
    );

    return () => unsubscribe();
  }, [currentProject?.id]);
  
  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('fr-FR');
    return currency.position === 'before' 
      ? `${currency.symbol} ${formatted}`
      : `${formatted} ${currency.symbol}`;
  };

  // Calculs financiers avancés
  const financialSummary: FinancialSummary = useMemo(() => {
    if (!currentProject) {
      return {
        totalBudget: 0, totalSpent: 0, totalIncome: 0, totalExpenses: 0,
        netProfit: 0, budgetUtilization: 0, equipmentCosts: 0,
        laborCosts: 0, materialCosts: 0, pendingPayments: 0,
        roi: 0, cashFlow: 0, profitMargin: 0, costPerPhase: {},
        monthlyTrend: [], riskLevel: 'low' as const, forecastedCompletion: 0,
        varianceFromBudget: 0
      };
    }

    const totalBudget = currentProject.budget || 0;
    const totalSpent = currentProject.spent || 0;
    
    let equipmentCosts = 0;
    let laborCosts = 0;
    let materialCosts = 0;

    // Calcul sécurisé des coûts
    try {
      if (currentProject.phases && Array.isArray(currentProject.phases)) {
        currentProject.phases.forEach(phase => {
          if (phase.tasks && Array.isArray(phase.tasks)) {
            phase.tasks.forEach(task => {
              if (task.costItems && Array.isArray(task.costItems)) {
                task.costItems.forEach(item => {
                  const actualCost = item.actualTotal || (item.estimatedQuantity * item.estimatedUnitPrice) || 0;
                  switch (item.type) {
                    case 'equipment':
                      equipmentCosts += actualCost;
                      break;
                    case 'labor':
                      laborCosts += actualCost;
                      break;
                    case 'material':
                      materialCosts += actualCost;
                      break;
                  }
                });
              }
            });
          }
        });
      }

      // Coûts des équipements
      if (currentProject.equipment && Array.isArray(currentProject.equipment)) {
        const projectDays = Math.max(1, Math.ceil(
          (new Date(currentProject.endDate).getTime() - new Date(currentProject.startDate).getTime()) 
          / (1000 * 60 * 60 * 24)
        ));
        
        currentProject.equipment.forEach(eq => {
          if (eq.dailyRate && typeof eq.dailyRate === 'number') {
            equipmentCosts += eq.dailyRate * projectDays;
          }
        });
      }
    } catch (error) {
      console.warn('Erreur lors du calcul des coûts:', error);
    }

    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netProfit = totalIncome - totalExpenses;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const pendingPayments = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculs avancés
    const roi = totalBudget > 0 ? ((netProfit / totalBudget) * 100) : 0;
    const cashFlow = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
    const varianceFromBudget = totalSpent - totalBudget;
    
    // Coûts par phase
    const costPerPhase: { [key: string]: number } = {};
    if (currentProject.phases && Array.isArray(currentProject.phases)) {
      currentProject.phases.forEach(phase => {
        let phaseCost = 0;
        if (phase.tasks && Array.isArray(phase.tasks)) {
          phase.tasks.forEach(task => {
            if (task.costItems && Array.isArray(task.costItems)) {
              task.costItems.forEach(item => {
                phaseCost += item.actualTotal || (item.estimatedQuantity * item.estimatedUnitPrice) || 0;
              });
            }
          });
        }
        costPerPhase[phase.name] = phaseCost;
      });
    }
    
    // Tendances mensuelles réelles depuis Firebase
    const monthlyTrend = monthlyTrends.length > 0 ? monthlyTrends : [
      { month: 'Jan', income: 0, expenses: 0 },
      { month: 'Fév', income: 0, expenses: 0 },
      { month: 'Mar', income: 0, expenses: 0 },
      { month: 'Avr', income: 0, expenses: 0 },
      { month: 'Mai', income: 0, expenses: 0 },
      { month: 'Jun', income: 0, expenses: 0 }
    ];
    
    // Niveau de risque
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (budgetUtilization > 90 || cashFlow < 0) riskLevel = 'high';
    else if (budgetUtilization > 75 || profitMargin < 10) riskLevel = 'medium';
    
    // Prévision d'achèvement
    const forecastedCompletion = totalBudget > 0 ? 
      totalBudget + (varianceFromBudget * (100 / Math.max(budgetUtilization, 1))) : totalBudget;

    return {
      totalBudget,
      totalSpent,
      totalIncome,
      totalExpenses,
      netProfit,
      budgetUtilization,
      equipmentCosts,
      laborCosts,
      materialCosts,
      pendingPayments,
      roi,
      cashFlow,
      profitMargin,
      costPerPhase,
      monthlyTrend,
      riskLevel,
      forecastedCompletion,
      varianceFromBudget
    };
  }, [currentProject, transactions, monthlyTrends]);

  // Métriques financières pour l'affichage
  const financialMetrics: FinancialMetric[] = [
    {
      label: 'Budget Total',
      value: formatAmount(financialSummary.totalBudget),
      change: 0,
      icon: Target,
      color: 'blue',
      trend: 'stable'
    },
    {
      label: 'Dépensé',
      value: formatAmount(financialSummary.totalSpent),
      change: financialSummary.budgetUtilization,
      icon: TrendingDown,
      color: 'red',
      trend: financialSummary.budgetUtilization > 75 ? 'up' : 'stable'
    },
    {
      label: 'Restant',
      value: formatAmount(financialSummary.totalBudget - financialSummary.totalSpent),
      change: 100 - financialSummary.budgetUtilization,
      icon: TrendingUp,
      color: 'green',
      trend: 'down'
    },
    {
      label: 'ROI',
      value: `${financialSummary.roi.toFixed(1)}%`,
      change: financialSummary.roi,
      icon: Percent,
      color: financialSummary.roi > 0 ? 'green' : 'red',
      trend: financialSummary.roi > 0 ? 'up' : 'down'
    },
    {
      label: 'Cash Flow',
      value: formatAmount(financialSummary.cashFlow),
      change: financialSummary.profitMargin,
      icon: Activity,
      color: financialSummary.cashFlow > 0 ? 'green' : 'red',
      trend: financialSummary.cashFlow > 0 ? 'up' : 'down'
    },
    {
      label: 'Marge Bénéficiaire',
      value: `${financialSummary.profitMargin.toFixed(1)}%`,
      change: financialSummary.profitMargin,
      icon: LineChart,
      color: financialSummary.profitMargin > 15 ? 'green' : financialSummary.profitMargin > 5 ? 'yellow' : 'red',
      trend: financialSummary.profitMargin > 10 ? 'up' : 'down'
    }
  ];

  // Handlers CRUD
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditing(tx);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }

    try {
      setIsLoading(true);
      await transactionService.deleteTransaction(id);
      // Les transactions seront automatiquement mises à jour via l'abonnement temps réel
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: Omit<Transaction, 'id'>) => {
    try {
      setIsLoading(true);
      
      if (editing) {
        await transactionService.updateTransaction(editing.id, data);
      } else {
        await transactionService.createTransaction({
          ...data,
          projectId: currentProject?.id || data.projectId
        });
      }
      
      // Les transactions seront automatiquement mises à jour via l'abonnement temps réel
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 rounded-xl text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet sélectionné</h2>
            <p className="text-gray-600">Sélectionnez un projet pour voir ses informations financières.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec indicateur de risque */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyse Financière</h1>
              <p className="text-gray-600">
                {currentProject ? `Projet: ${currentProject.name}` : 'Aucun projet sélectionné'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              financialSummary.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
              financialSummary.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              <AlertTriangle size={16} className="inline mr-2" />
              Risque {financialSummary.riskLevel === 'high' ? 'Élevé' : 
                      financialSummary.riskLevel === 'medium' ? 'Modéré' : 'Faible'}
            </div>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex space-x-1 mb-6 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/20">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'analytics', label: 'Analyses', icon: BarChart3 },
            { id: 'budget', label: 'Budget', icon: Calculator },
            { id: 'forecast', label: 'Prévisions', icon: TrendingUp }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'analytics' | 'budget' | 'forecast')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <IconComponent size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">{loadingMessage || 'Chargement...'}</span>
                </div>
              </div>
            )}
            
            {/* Métriques financières principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {financialMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent size={20} className={`text-${metric.color}-600`} />
                      {metric.trend === 'up' && <ArrowUp size={16} className="text-green-500" />}
                      {metric.trend === 'down' && <ArrowDown size={16} className="text-red-500" />}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-xs text-gray-600">{metric.label}</div>
                    {metric.change !== 0 && (
                      <div className={`text-xs mt-1 ${
                        metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progression budgétaire */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression Budgétaire</h3>
              {(() => {
                const tone: 'red' | 'orange' | 'green' = financialSummary.budgetUtilization > 90 ? 'red' : financialSummary.budgetUtilization > 75 ? 'orange' : 'green';
                return <ProgressBar value={Math.min(financialSummary.budgetUtilization, 100)} tone={tone} />;
              })()}
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0 {currency.symbol}</span>
                <span>{formatAmount(financialSummary.totalBudget)}</span>
              </div>
            </div>

            {/* Répartition des coûts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Coûts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wrench size={16} className="text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Équipements</span>
                    </div>
                    <span className="font-medium">{formatAmount(financialSummary.equipmentCosts)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users size={16} className="text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Main d'œuvre</span>
                    </div>
                    <span className="font-medium">{formatAmount(financialSummary.laborCosts)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building size={16} className="text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Matériaux</span>
                    </div>
                    <span className="font-medium">{formatAmount(financialSummary.materialCosts)}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs Clés</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Variance Budget</span>
                    <span className={`font-medium ${
                      financialSummary.varianceFromBudget > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {financialSummary.varianceFromBudget > 0 ? '+' : ''}{formatAmount(financialSummary.varianceFromBudget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prévision Finale</span>
                    <span className="font-medium">{formatAmount(financialSummary.forecastedCompletion)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Paiements en Attente</span>
                    <span className="font-medium text-orange-600">{formatAmount(financialSummary.pendingPayments)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Nouvelle Transaction
              </button>
            </div>
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </div>
        )}

        {/* Autres onglets */}
        {(activeTab === 'analytics' || activeTab === 'budget' || activeTab === 'forecast') && (
          <div className="glass-card p-8 rounded-xl text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'analytics' && 'Analyses Avancées'}
              {activeTab === 'budget' && 'Gestion Budgétaire'}
              {activeTab === 'forecast' && 'Prévisions Financières'}
            </h3>
            <p className="text-gray-600 mb-6">Cette fonctionnalité avancée sera disponible prochainement.</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Activer la fonctionnalité
            </button>
          </div>
        )}

        {/* Modal */}
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          initialData={editing || undefined}
        />
      </div>
    </div>
  );
};

export default FinancesAdvanced;

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Calculator,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Wrench,
  FileText,
  Target,
  Activity,
  Users,
  Building,
  Layers,
  ArrowUp,
  ArrowDown,
  Percent,
  LineChart
} from 'lucide-react';
import { Transaction } from '../../types/finance';
import { useProjectContext } from '../../contexts/ProjectContext';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
import { useCurrency } from '../../hooks/useCurrency';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';
import { BudgetIntegrationService } from '../../services/budgetIntegrationService';
import { v4 as uuidv4 } from 'uuid';

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
  icon: React.ComponentType<{ size?: number; className?: string; }>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface IntegratedMetrics {
  totalPurchaseOrders: number;
  totalPurchaseOrderAmount: number;
  approvedPurchaseOrders: number;
  pendingPurchaseOrders: number;
  totalPlannedExpenses: number;
  totalActualExpenses: number;
  purchaseOrdersBySupplierType: Record<string, { amount: number; count: number }>;
}

const FinancesAdvanced: React.FC = () => {
  const projectContext = useProjectContext();
  const [transactions, setTransactions] = useState<Transaction[]>([
    // Données de test pour démonstration
    {
      id: 'test-1',
      category: 'materials',
      amount: 15000,
      description: 'Achat de matériaux de construction',
      date: '2024-01-15'
    },
    {
      id: 'test-2',
      category: 'equipment',
      amount: 8500,
      description: 'Location d\'équipements lourds',
      date: '2024-01-20'
    },
    {
      id: 'test-3',
      category: 'client_payment',
      amount: 45000,
      description: 'Paiement client - Phase 1',
      date: '2024-01-25'
    },
    {
      id: 'test-4',
      category: 'labor',
      amount: 12000,
      description: 'Salaires équipe construction',
      date: '2024-02-01'
    },
    {
      id: 'test-5',
      category: 'permits',
      amount: 2500,
      description: 'Permis de construire et autorisations',
      date: '2024-02-05'
    }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'budget' | 'forecast'>('overview');
  
  const currentProject = projectContext.currentProject;
  const { formatAmount } = useCurrency();
  const { purchaseOrders, deliveryNotes } = usePurchaseOrderContext();
  
  // État pour les métriques intégrées
  const [integratedMetrics, setIntegratedMetrics] = useState<IntegratedMetrics | null>(null);

  // Charger les métriques intégrées
  useEffect(() => {
    const loadIntegratedMetrics = async () => {
      if (currentProject?.id) {
        try {
          const metrics = await BudgetIntegrationService.getIntegratedProjectFinancials(currentProject.id);
          setIntegratedMetrics(metrics);
        } catch (error) {
          console.error('Erreur lors du chargement des métriques intégrées:', error);
        }
      }
    };
    
    loadIntegratedMetrics();
  }, [currentProject?.id, purchaseOrders, deliveryNotes]);

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
    
    // Tendance mensuelle (simulation)
    const monthlyTrend = [
      { month: 'Jan', income: totalIncome * 0.1, expenses: totalExpenses * 0.08 },
      { month: 'Fév', income: totalIncome * 0.15, expenses: totalExpenses * 0.12 },
      { month: 'Mar', income: totalIncome * 0.2, expenses: totalExpenses * 0.18 },
      { month: 'Avr', income: totalIncome * 0.25, expenses: totalExpenses * 0.22 },
      { month: 'Mai', income: totalIncome * 0.3, expenses: totalExpenses * 0.4 }
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
  }, [currentProject, transactions]);

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

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = (data: Omit<Transaction, 'id'>) => {
    if (editing) {
      setTransactions(prev => prev.map(t => t.id === editing.id ? { ...data, id: editing.id } : t));
    } else {
      const newTransaction: Transaction = { ...data, id: uuidv4() };
      setTransactions(prev => [...prev, newTransaction]);
    }
    setModalOpen(false);
    setEditing(null);
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
            {/* Métriques financières principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {financialMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <div key={metric.label} className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-200">
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

            {/* Métriques des bons d'achat intégrées */}
            {integratedMetrics && (
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Bons d'Achat & Intégration Budget
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{integratedMetrics.totalPurchaseOrders}</div>
                    <div className="text-sm text-blue-700">Bons d'achat total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{formatAmount(integratedMetrics.totalPurchaseOrderAmount)}</div>
                    <div className="text-sm text-green-700">Montant total</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{integratedMetrics.approvedPurchaseOrders}</div>
                    <div className="text-sm text-orange-700">Approuvés</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{integratedMetrics.pendingPurchaseOrders}</div>
                    <div className="text-sm text-purple-700">En attente</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Dépenses Planifiées vs Réelles</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Planifiées:</span>
                        <span className="font-medium text-blue-600">{formatAmount(integratedMetrics.totalPlannedExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Réelles:</span>
                        <span className="font-medium text-green-600">{formatAmount(integratedMetrics.totalActualExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium text-gray-900">Écart:</span>
                        <span className={`font-medium ${
                          integratedMetrics.totalActualExpenses > integratedMetrics.totalPlannedExpenses 
                            ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatAmount(Math.abs(integratedMetrics.totalActualExpenses - integratedMetrics.totalPlannedExpenses))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Répartition par Type de Fournisseur</h4>
                    <div className="space-y-2">
                      {Object.entries(integratedMetrics.purchaseOrdersBySupplierType || {}).map(([type, data]) => {
                        const supplierData = data as { amount: number; count: number } | undefined;
                        return (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 capitalize">{type}:</span>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{formatAmount(supplierData?.amount || 0)}</div>
                              <div className="text-xs text-gray-500">{supplierData?.count || 0} commande(s)</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progression budgétaire */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression Budgétaire</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    financialSummary.budgetUtilization > 90 ? 'bg-red-500' :
                    financialSummary.budgetUtilization > 75 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(financialSummary.budgetUtilization, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatAmount(0)}</span>
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

        {/* Onglet Analyses */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Tendances mensuelles */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances Mensuelles</h3>
              <div className="grid grid-cols-5 gap-4">
                {financialSummary.monthlyTrend.map((month) => (
                  <div key={month.month} className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{month.month}</div>
                    <div className="space-y-2">
                      <div className="bg-green-100 rounded-lg p-2">
                        <div className="text-xs text-green-700">Revenus</div>
                        <div className="font-medium text-green-800">{formatAmount(month.income)}</div>
                      </div>
                      <div className="bg-red-100 rounded-lg p-2">
                        <div className="text-xs text-red-700">Dépenses</div>
                        <div className="font-medium text-red-800">{formatAmount(month.expenses)}</div>
                      </div>
                    </div>
                    <div className="mt-2 h-20 bg-gray-100 rounded relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 w-1/2 bg-green-400 transition-all duration-500"
                        style={{ height: `${Math.min((month.income / Math.max(...financialSummary.monthlyTrend.map(m => m.income))) * 100, 100)}%` }}
                      ></div>
                      <div 
                        className="absolute bottom-0 right-0 w-1/2 bg-red-400 transition-all duration-500"
                        style={{ height: `${Math.min((month.expenses / Math.max(...financialSummary.monthlyTrend.map(m => m.expenses))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse par phase */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coûts par Phase</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(financialSummary.costPerPhase).map(([phaseName, cost]) => (
                  <div key={phaseName} className="bg-white/50 p-4 rounded-lg border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{phaseName}</span>
                      <Layers size={16} className="text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{formatAmount(cost)}</div>
                    <div className="text-xs text-gray-500">
                      {financialSummary.totalSpent > 0 ? 
                        `${((cost / financialSummary.totalSpent) * 100).toFixed(1)}% du total` : 
                        '0% du total'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateurs de performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Financière</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficacité Budgétaire</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            financialSummary.budgetUtilization <= 80 ? 'bg-green-500' :
                            financialSummary.budgetUtilization <= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(financialSummary.budgetUtilization, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{financialSummary.budgetUtilization.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rentabilité (ROI)</span>
                    <span className={`text-sm font-medium ${
                      financialSummary.roi > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialSummary.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Marge Bénéficiaire</span>
                    <span className={`text-sm font-medium ${
                      financialSummary.profitMargin > 15 ? 'text-green-600' :
                      financialSummary.profitMargin > 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {financialSummary.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes et Recommandations</h3>
                <div className="space-y-3">
                  {financialSummary.riskLevel === 'high' && (
                    <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-800">Risque Élevé</div>
                        <div className="text-xs text-red-600">Budget dépassé ou flux de trésorerie négatif</div>
                      </div>
                    </div>
                  )}
                  {financialSummary.budgetUtilization > 90 && (
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle size={16} className="text-orange-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-orange-800">Budget Critique</div>
                        <div className="text-xs text-orange-600">Plus de 90% du budget utilisé</div>
                      </div>
                    </div>
                  )}
                  {financialSummary.cashFlow > 0 && financialSummary.roi > 10 && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-800">Performance Excellente</div>
                        <div className="text-xs text-green-600">Cash flow positif et ROI supérieur à 10%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Budget */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Répartition budgétaire */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Budgétaire Détaillée</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wrench size={20} className="text-blue-600" />
                      <span className="font-medium">Équipements</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-800">{formatAmount(financialSummary.equipmentCosts)}</div>
                      <div className="text-xs text-blue-600">
                        {financialSummary.totalSpent > 0 ? 
                          `${((financialSummary.equipmentCosts / financialSummary.totalSpent) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users size={20} className="text-green-600" />
                      <span className="font-medium">Main d'œuvre</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-800">{formatAmount(financialSummary.laborCosts)}</div>
                      <div className="text-xs text-green-600">
                        {financialSummary.totalSpent > 0 ? 
                          `${((financialSummary.laborCosts / financialSummary.totalSpent) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building size={20} className="text-purple-600" />
                      <span className="font-medium">Matériaux</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-800">{formatAmount(financialSummary.materialCosts)}</div>
                      <div className="text-xs text-purple-600">
                        {financialSummary.totalSpent > 0 ? 
                          `${((financialSummary.materialCosts / financialSummary.totalSpent) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    {/* Graphique circulaire simple */}
                    <div className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{formatAmount(financialSummary.totalSpent)}</div>
                          <div className="text-xs text-gray-600">Total Dépensé</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contrôle budgétaire */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrôle Budgétaire</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatAmount(financialSummary.totalBudget)}</div>
                  <div className="text-sm text-gray-600">Budget Alloué</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{formatAmount(financialSummary.totalSpent)}</div>
                  <div className="text-sm text-gray-600">Montant Dépensé</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    financialSummary.totalBudget - financialSummary.totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(financialSummary.totalBudget - financialSummary.totalSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Solde Restant</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Prévisions */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            {/* Prévisions d'achèvement */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévisions d'Achèvement</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Coût Final Prévu</span>
                      <Target size={16} className="text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{formatAmount(financialSummary.forecastedCompletion)}</div>
                    <div className="text-xs text-blue-600">
                      {financialSummary.forecastedCompletion > financialSummary.totalBudget ? 
                        `Dépassement de ${formatAmount(financialSummary.forecastedCompletion - financialSummary.totalBudget)}` :
                        `Économie de ${formatAmount(financialSummary.totalBudget - financialSummary.forecastedCompletion)}`
                      }
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Variance Budgétaire</span>
                      <ArrowUp size={16} className={financialSummary.varianceFromBudget > 0 ? 'text-red-600' : 'text-green-600'} />
                    </div>
                    <div className={`text-2xl font-bold ${
                      financialSummary.varianceFromBudget > 0 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {financialSummary.varianceFromBudget > 0 ? '+' : ''}{formatAmount(financialSummary.varianceFromBudget)}
                    </div>
                    <div className={`text-xs ${
                      financialSummary.varianceFromBudget > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {financialSummary.varianceFromBudget > 0 ? 'Dépassement' : 'Sous le budget'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {financialSummary.budgetUtilization.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Progression Actuelle</div>
                    <div className="w-24 h-24 mx-auto relative">
                      <div className="w-full h-full rounded-full border-4 border-gray-200 relative">
                        <div 
                          className={`absolute inset-0 rounded-full border-4 border-transparent ${
                            financialSummary.budgetUtilization > 90 ? 'border-t-red-500' :
                            financialSummary.budgetUtilization > 75 ? 'border-t-yellow-500' :
                            'border-t-green-500'
                          }`}
                          style={{ 
                            transform: `rotate(${(financialSummary.budgetUtilization / 100) * 360}deg)`,
                            transition: 'transform 1s ease-in-out'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations Stratégiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financialSummary.budgetUtilization > 85 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={16} className="text-orange-600 mt-1" />
                      <div>
                        <div className="font-medium text-orange-800">Surveillance Renforcée</div>
                        <div className="text-sm text-orange-600 mt-1">
                          Le budget approche de sa limite. Surveillez de près les dépenses restantes.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {financialSummary.cashFlow < 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={16} className="text-red-600 mt-1" />
                      <div>
                        <div className="font-medium text-red-800">Attention Trésorerie</div>
                        <div className="text-sm text-red-600 mt-1">
                          Flux de trésorerie négatif. Envisagez des mesures correctives.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {financialSummary.roi > 15 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle size={16} className="text-green-600 mt-1" />
                      <div>
                        <div className="font-medium text-green-800">Excellent ROI</div>
                        <div className="text-sm text-green-600 mt-1">
                          Rentabilité excellente. Projet très performant financièrement.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {financialSummary.budgetUtilization < 70 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle size={16} className="text-blue-600 mt-1" />
                      <div>
                        <div className="font-medium text-blue-800">Marge Confortable</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Budget bien maîtrisé. Possibilité d'optimisations supplémentaires.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

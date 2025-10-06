import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus, BarChart3, PieChart, Activity } from 'lucide-react';
import { useProjectTransactions } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';
import EmptyState from '../UI/EmptyState';
import NoProjectSelected from '../UI/NoProjectSelected';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
import type { FinancialRecord } from '../../types';
import PageContainer from '../Layout/PageContainer';

const Finances: React.FC = () => {
  const { currentProject } = useProjects();
  const { transactions, loading, addTransaction } = useProjectTransactions(currentProject?.id || null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'equipment' | 'phases'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialRecord | null>(null);

  // Si aucun projet n'est sélectionné
  if (!currentProject) {
    return (
      <PageContainer>
        <NoProjectSelected />
      </PageContainer>
    );
  }

  // Calculer les statistiques depuis les vraies données
  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const budgetUsed = currentProject.budget > 0 ? (totalExpenses / currentProject.budget) * 100 : 0;
    
    // Répartition par catégorie
    const categories = {
      materials: expenses.filter(t => t.category === 'materials').reduce((sum, t) => sum + t.amount, 0),
      labor: expenses.filter(t => t.category === 'labor').reduce((sum, t) => sum + t.amount, 0),
      equipment: expenses.filter(t => t.category === 'equipment').reduce((sum, t) => sum + t.amount, 0),
      permits: expenses.filter(t => t.category === 'permits').reduce((sum, t) => sum + t.amount, 0),
      other: expenses.filter(t => t.category === 'other').reduce((sum, t) => sum + t.amount, 0),
    };

    return {
      totalExpenses,
      totalIncome,
      balance,
      budgetUsed,
      transactionCount: transactions.length,
      categories,
      pendingPayments: expenses.filter(t => t.status === 'pending').length,
    };
  }, [transactions, currentProject.budget]);

  const handleAddTransaction = async (transactionData: Omit<FinancialRecord, 'id'>) => {
    try {
      await addTransaction(transactionData);
      setShowTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      alert('Erreur lors de l\'ajout de la transaction');
    }
  };

  const handleEditTransaction = (transaction: FinancialRecord) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const getBudgetAlertLevel = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'warning';
    if (percentage >= 75) return 'caution';
    return 'safe';
  };

  const budgetAlert = getBudgetAlertLevel(stats.budgetUsed);

  return (
    <PageContainer>
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm border border-white/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Finances
              </h1>
              <p className="text-gray-600 mt-1">
                Projet: {currentProject.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Transaction
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="glass-card p-2 rounded-xl mb-6">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'transactions', label: 'Transactions', icon: Activity },
            { id: 'budget', label: 'Budget & Analyse', icon: PieChart },
            { id: 'equipment', label: 'Équipements', icon: TrendingUp },
            { id: 'phases', label: 'Par Phase', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-blue-600">
                  {currentProject.budget.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Budget Total</h3>
            </div>

            <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-3xl font-bold text-red-600">
                  {stats.totalExpenses.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Dépenses</h3>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-800 ${
                    budgetAlert === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    budgetAlert === 'warning' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    budgetAlert === 'caution' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(stats.budgetUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.budgetUsed.toFixed(1)}% du budget</p>
            </div>

            <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-green-600">
                  {stats.totalIncome.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Revenus</h3>
            </div>

            <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`w-6 h-6 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <span className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.balance.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Solde</h3>
            </div>
          </div>

          {/* Alertes budgétaires */}
          {budgetAlert !== 'safe' && (
            <div className={`glass-card p-4 rounded-xl border-l-4 ${
              budgetAlert === 'danger' ? 'border-red-500 bg-red-50/50' :
              budgetAlert === 'warning' ? 'border-orange-500 bg-orange-50/50' :
              'border-yellow-500 bg-yellow-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${
                  budgetAlert === 'danger' ? 'text-red-600' :
                  budgetAlert === 'warning' ? 'text-orange-600' :
                  'text-yellow-600'
                }`} />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {budgetAlert === 'danger' ? 'Budget dépassé !' :
                     budgetAlert === 'warning' ? 'Attention au budget' :
                     'Budget à surveiller'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {budgetAlert === 'danger' ? 
                      `Vous avez dépassé le budget de ${(stats.budgetUsed - 100).toFixed(1)}%` :
                      `Vous avez utilisé ${stats.budgetUsed.toFixed(1)}% du budget total`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Répartition des coûts */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Répartition des Coûts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(stats.categories).map(([category, amount]) => {
                const percentage = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
                const colors = {
                  materials: 'from-blue-500 to-cyan-500',
                  labor: 'from-green-500 to-emerald-500',
                  equipment: 'from-orange-500 to-red-500',
                  permits: 'from-purple-500 to-pink-500',
                  other: 'from-gray-500 to-slate-500',
                };
                
                const labels = {
                  materials: 'Matériaux',
                  labor: 'Main d\'œuvre',
                  equipment: 'Équipements',
                  permits: 'Permis',
                  other: 'Autres',
                };

                return (
                  <div key={category} className="bg-white/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {labels[category as keyof typeof labels]}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`bg-gradient-to-r ${colors[category as keyof typeof colors]} h-2 rounded-full transition-all duration-800`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {amount.toLocaleString()} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Chargement des transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Aucune transaction"
              description={`Commencez par ajouter votre première transaction au projet "${currentProject.name}"`}
              actionLabel="Ajouter une transaction"
              onAction={() => setShowTransactionModal(true)}
            />
          ) : (
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Transactions ({transactions.length})
                </h3>
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              <TransactionTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={async (id) => {
                  // Implémenter la suppression
                  console.log('Supprimer transaction:', id);
                }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Analyse Budgétaire
          </h3>
          <p className="text-gray-600">Analyse budgétaire détaillée en cours de développement...</p>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Coûts des Équipements
          </h3>
          <p className="text-gray-600">Analyse des coûts d'équipement en cours de développement...</p>
        </div>
      )}

      {activeTab === 'phases' && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            Finances par Phase
          </h3>
          <p className="text-gray-600">Analyse financière par phase en cours de développement...</p>
        </div>
      )}

      {/* Modal de transaction */}
      {showTransactionModal && (
        <TransactionModal
          transaction={selectedTransaction}
          onSave={handleAddTransaction}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </PageContainer>
  );
};

export default Finances;

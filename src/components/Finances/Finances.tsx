import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Euro,
  Plus,
  Calculator,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  FileText,
  Target
} from 'lucide-react';
import { Transaction } from '../../types/finance';
import { useProjectContext } from '../../contexts/ProjectContext';
import TransactionTable from './TransactionTable';
import TransactionModal from './TransactionModal';
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
}

const Finances: React.FC = () => {
  const projectContext = useProjectContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'equipment' | 'phases'>('overview');

  const currentProject = projectContext.currentProject;

  // Calculs financiers simplifiés et sécurisés
  const financialSummary: FinancialSummary = useMemo(() => {
    if (!currentProject) {
      return {
        totalBudget: 0, totalSpent: 0, totalIncome: 0, totalExpenses: 0,
        netProfit: 0, budgetUtilization: 0, equipmentCosts: 0,
        laborCosts: 0, materialCosts: 0, pendingPayments: 0
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
      pendingPayments
    };
  }, [currentProject, transactions]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Euro className="w-8 h-8 mr-3 text-green-600" />
                Finances
              </h1>
              <p className="text-gray-600 mt-2">Gestion financière du projet {currentProject.name}</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Transaction
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-card p-2 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: DollarSign },
              { id: 'budget', label: 'Budget', icon: Calculator },
              { id: 'equipment', label: 'Équipements', icon: Wrench },
              { id: 'phases', label: 'Par Phase', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200">
                <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {financialSummary.totalBudget.toLocaleString('fr-FR')} €
                </div>
                <div className="text-sm text-gray-600">Budget Total</div>
              </div>

              <div className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200">
                <TrendingDown className="w-8 h-8 mx-auto mb-3 text-red-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {financialSummary.totalSpent.toLocaleString('fr-FR')} €
                </div>
                <div className="text-sm text-gray-600">Dépensé</div>
              </div>

              <div className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {(financialSummary.totalBudget - financialSummary.totalSpent).toLocaleString('fr-FR')} €
                </div>
                <div className="text-sm text-gray-600">Restant</div>
              </div>

              <div className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-all duration-200">
                <Calculator className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {financialSummary.budgetUtilization.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Utilisation</div>
              </div>
            </div>

            {/* Budget Progress */}
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
                <span>0 €</span>
                <span>{financialSummary.totalBudget.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="glass-card p-6 rounded-xl">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </div>
        )}

        {/* Autres onglets simplifiés */}
        {(activeTab === 'budget' || activeTab === 'equipment' || activeTab === 'phases') && (
          <div className="glass-card p-8 rounded-xl text-center">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'budget' && 'Analyse Budgétaire'}
              {activeTab === 'equipment' && 'Coûts des Équipements'}
              {activeTab === 'phases' && 'Finances par Phase'}
            </h3>
            <p className="text-gray-600 mb-6">Cette fonctionnalité sera disponible prochainement.</p>
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

export default Finances;

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

  // Calculs financiers avancés
  const financialSummary: FinancialSummary = useMemo(() => {
    if (!currentProject) {
      return {
        totalBudget: 0, totalSpent: 0, totalIncome: 0, totalExpenses: 0,
        netProfit: 0, budgetUtilization: 0, equipmentCosts: 0,
        laborCosts: 0, materialCosts: 0, pendingPayments: 0
      };
    }

    // Budget total du projet
    const totalBudget = currentProject.budget || 0;
    const totalSpent = currentProject.spent || 0;

    // Calculs des coûts par catégorie depuis les tâches
    let equipmentCosts = 0;
    let laborCosts = 0;
    let materialCosts = 0;

    // Vérifier que phases existe et est un tableau
    if (currentProject.phases && Array.isArray(currentProject.phases)) {
      currentProject.phases.forEach(phase => {
        if (phase.tasks && Array.isArray(phase.tasks)) {
          phase.tasks.forEach(task => {
            if (task.costItems && Array.isArray(task.costItems)) {
              task.costItems.forEach(item => {
                const actualCost = item.actualTotal || (item.estimatedQuantity * item.estimatedUnitPrice);
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

    // Coûts des équipements assignés
    if (currentProject.equipment && Array.isArray(currentProject.equipment)) {
      currentProject.equipment.forEach(eq => {
        // Vérifier que dailyRate existe et que l'équipement est assigné au projet
        if (eq.dailyRate && typeof eq.dailyRate === 'number') {
          // Estimation basée sur la durée du projet
          const projectDays = Math.ceil(
            (new Date(currentProject.endDate).getTime() - new Date(currentProject.startDate).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          equipmentCosts += eq.dailyRate * projectDays;
        }
      });
    }

    // Transactions
    const projectTransactions = transactions.filter(t => 
      // Associer les transactions au projet actuel (à implémenter selon votre logique)
      true
    );
    
    const totalIncome = projectTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(projectTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netProfit = totalIncome - totalExpenses;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Paiements en attente (simulation)
    const pendingPayments = totalBudget * 0.3; // 30% du budget en attente

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

  // CRUD handlers
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
      setTransactions(prev => prev.map(t => t.id === editing.id ? { ...t, ...data } : t));
    } else {
      setTransactions(prev => [
        ...prev,
        { ...data, id: uuidv4() }
      ]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet sélectionné</h3>
          <p className="text-gray-600">Sélectionnez un projet pour voir ses finances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finances</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestion financière du projet: <span className="font-semibold text-orange-600">{currentProject.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAdd} 
            className="morph-card hover-lift flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1 rounded-xl">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'budget', label: 'Budget & Analyse', icon: Calculator },
            { id: 'equipment', label: 'Équipements', icon: Wrench },
            { id: 'phases', label: 'Par Phase', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Synthèse financière principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Budget Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {financialSummary.totalBudget.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Dépensé</p>
                  <p className="text-2xl font-bold text-red-600">
                    {financialSummary.totalSpent.toLocaleString('fr-FR')} €
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(financialSummary.budgetUtilization, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {financialSummary.budgetUtilization.toFixed(1)}% du budget
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Revenus</p>
                  <p className="text-2xl font-bold text-green-600">
                    {financialSummary.totalIncome.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Bénéfice Net</p>
                  <p className={`text-2xl font-bold ${
                    financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialSummary.netProfit.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <Euro className={`w-8 h-8 ${
                  financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Répartition des coûts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-orange-600" />
                Répartition des Coûts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Matériaux</span>
                  </div>
                  <span className="font-semibold">
                    {financialSummary.materialCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Main d'œuvre</span>
                  </div>
                  <span className="font-semibold">
                    {financialSummary.laborCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Équipements</span>
                  </div>
                  <span className="font-semibold">
                    {financialSummary.equipmentCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                Paiements en Attente
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-2">
                  {financialSummary.pendingPayments.toLocaleString('fr-FR')} €
                </p>
                <p className="text-sm text-gray-600">
                  Factures en attente de règlement
                </p>
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700">
                    💡 Conseil: Relancez les paiements en retard pour améliorer votre trésorerie
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes et indicateurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Alertes Budgétaires
              </h3>
              <div className="space-y-3">
                {financialSummary.budgetUtilization > 90 && (
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">
                      Budget presque épuisé ({financialSummary.budgetUtilization.toFixed(1)}%)
                    </span>
                  </div>
                )}
                {financialSummary.budgetUtilization > 75 && financialSummary.budgetUtilization <= 90 && (
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-700">
                      Attention: {financialSummary.budgetUtilization.toFixed(1)}% du budget utilisé
                    </span>
                  </div>
                )}
                {financialSummary.budgetUtilization <= 75 && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      Budget sous contrôle ({financialSummary.budgetUtilization.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Performance Financière
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Marge bénéficiaire</span>
                  <span className={`font-semibold ${
                    financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialSummary.totalIncome > 0 
                      ? ((financialSummary.netProfit / financialSummary.totalIncome) * 100).toFixed(1)
                      : '0'
                    }%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Efficacité budgétaire</span>
                  <span className={`font-semibold ${
                    financialSummary.budgetUtilization <= 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialSummary.budgetUtilization <= 100 ? 'Bonne' : 'Dépassement'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Vue d'ensemble budgétaire */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Analyse Budgétaire Détaillée
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Budget Planifié</p>
                <p className="text-2xl font-bold text-blue-700">
                  {financialSummary.totalBudget.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Coût Réalisé</p>
                <p className="text-2xl font-bold text-red-700">
                  {financialSummary.totalSpent.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Écart</p>
                <p className={`text-2xl font-bold ${
                  (financialSummary.totalBudget - financialSummary.totalSpent) >= 0 
                    ? 'text-green-700' : 'text-red-700'
                }`}>
                  {(financialSummary.totalBudget - financialSummary.totalSpent).toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>

            {/* Analyse par catégorie */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Analyse par Catégorie</h4>
              
              {/* Matériaux */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Matériaux</span>
                  <span className="text-sm text-gray-500">
                    {financialSummary.materialCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((financialSummary.materialCosts / financialSummary.totalBudget) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((financialSummary.materialCosts / financialSummary.totalBudget) * 100).toFixed(1)}% du budget total
                </p>
              </div>

              {/* Main d'œuvre */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Main d'œuvre</span>
                  <span className="text-sm text-gray-500">
                    {financialSummary.laborCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((financialSummary.laborCosts / financialSummary.totalBudget) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((financialSummary.laborCosts / financialSummary.totalBudget) * 100).toFixed(1)}% du budget total
                </p>
              </div>

              {/* Équipements */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Équipements</span>
                  <span className="text-sm text-gray-500">
                    {financialSummary.equipmentCosts.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((financialSummary.equipmentCosts / financialSummary.totalBudget) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((financialSummary.equipmentCosts / financialSummary.totalBudget) * 100).toFixed(1)}% du budget total
                </p>
              </div>
            </div>
          </div>

          {/* Prévisions et tendances */}
          <div className="glass-card p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Prévisions Budgétaires
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taux de consommation actuel</span>
                  <span className="font-semibold">{financialSummary.budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget restant</span>
                  <span className={`font-semibold ${
                    (financialSummary.totalBudget - financialSummary.totalSpent) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(financialSummary.totalBudget - financialSummary.totalSpent).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projection fin de projet</span>
                  <span className={`font-semibold ${
                    financialSummary.budgetUtilization <= 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialSummary.budgetUtilization <= 100 ? 'Dans les temps' : 'Dépassement prévu'}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-800 mb-2">💡 Recommandations</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  {financialSummary.budgetUtilization > 90 && (
                    <li>• Réviser les coûts restants</li>
                  )}
                  {financialSummary.budgetUtilization > 75 && (
                    <li>• Surveiller de près les dépenses</li>
                  )}
                  {financialSummary.budgetUtilization <= 75 && (
                    <li>• Budget bien maîtrisé</li>
                  )}
                  <li>• Planifier les achats importants</li>
                  <li>• Négocier avec les fournisseurs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {/* Vue d'ensemble des équipements */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-orange-600" />
              Coûts des Équipements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Équipements Actifs</p>
                <p className="text-2xl font-bold text-orange-700">
                  {(currentProject?.equipment || []).length}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Coût Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {financialSummary.equipmentCosts.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Coût Moyen/Jour</p>
                <p className="text-2xl font-bold text-green-700">
                  {((currentProject?.equipment || []).reduce((sum, eq) => sum + (eq.dailyRate || 0), 0)).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">% du Budget</p>
                <p className="text-2xl font-bold text-purple-700">
                  {((financialSummary.equipmentCosts / financialSummary.totalBudget) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Liste détaillée des équipements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Détail par Équipement</h4>
              
              {(currentProject?.equipment || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun équipement assigné au projet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(currentProject?.equipment || []).map((equipment, index) => {
                    const projectDays = Math.ceil(
                      (new Date(currentProject.endDate).getTime() - new Date(currentProject.startDate).getTime()) 
                      / (1000 * 60 * 60 * 24)
                    );
                    const totalCost = (equipment.dailyRate || 0) * projectDays;
                    
                    return (
                      <div key={equipment.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-gray-800">{equipment.name}</h5>
                            <p className="text-sm text-gray-500">{equipment.type || 'Type non spécifié'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{totalCost.toLocaleString('fr-FR')} €</p>
                            <p className="text-sm text-gray-500">Coût total estimé</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Tarif journalier</p>
                            <p className="font-medium">{(equipment.dailyRate || 0).toLocaleString('fr-FR')} €/jour</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Durée projet</p>
                            <p className="font-medium">{projectDays} jours</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Statut</p>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              equipment.status === 'available' ? 'bg-green-100 text-green-800' :
                              equipment.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                              equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {equipment.status === 'available' ? 'Disponible' :
                               equipment.status === 'in-use' ? 'En cours' :
                               equipment.status === 'maintenance' ? 'Maintenance' :
                               'Inconnu'}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-500">% du budget équip.</p>
                            <p className="font-medium">
                              {financialSummary.equipmentCosts > 0 
                                ? ((totalCost / financialSummary.equipmentCosts) * 100).toFixed(1) 
                                : '0'
                              }%
                            </p>
                          </div>
                        </div>
                        
                        {/* Barre de progression du coût */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min((totalCost / financialSummary.equipmentCosts) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Analyse des coûts d'équipement */}
          <div className="glass-card p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              Analyse des Coûts
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Répartition par Type</h5>
                {/* Simulation de types d'équipement */}
                {[
                  { type: 'Engins de terrassement', count: (currentProject?.equipment || []).filter(e => e.type?.includes('terrassement') || e.name?.toLowerCase().includes('pelleteuse')).length || 1, color: 'bg-blue-500' },
                  { type: 'Outils de construction', count: (currentProject?.equipment || []).filter(e => e.type?.includes('outil') || e.name?.toLowerCase().includes('outil')).length || 1, color: 'bg-green-500' },
                  { type: 'Véhicules', count: (currentProject?.equipment || []).filter(e => e.type?.includes('véhicule') || e.name?.toLowerCase().includes('camion')).length || 1, color: 'bg-orange-500' },
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded ${category.color} mr-3`}></div>
                      <span className="text-sm font-medium">{category.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.count}</p>
                      <p className="text-xs text-gray-500">équipement(s)</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-3">📊 Optimisations Possibles</h5>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Mutualiser les équipements entre phases</li>
                  <li>• Négocier des tarifs dégressifs</li>
                  <li>• Planifier la maintenance préventive</li>
                  <li>• Évaluer l'achat vs location</li>
                  <li>• Optimiser les temps d'utilisation</li>
                </ul>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-blue-600 font-medium">Potentiel d'économie</p>
                  <p className="text-lg font-bold text-blue-800">
                    {(financialSummary.equipmentCosts * 0.15).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-blue-600">Estimation 15% d'optimisation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'phases' && (
        <div className="space-y-6">
          {/* Vue d'ensemble des phases */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Finances par Phase
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Phases Actives</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(currentProject?.phases || []).length}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Budget Réparti</p>
                <p className="text-2xl font-bold text-blue-700">
                  {financialSummary.totalBudget.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Dépensé</p>
                <p className="text-2xl font-bold text-green-700">
                  {financialSummary.totalSpent.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Phases Terminées</p>
                <p className="text-2xl font-bold text-orange-700">
                  {(currentProject?.phases || []).filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>

            {/* Liste détaillée des phases */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Détail par Phase</h4>
              
              {(currentProject?.phases || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune phase définie pour ce projet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(currentProject?.phases || []).map((phase, index) => {
                    // Calcul des coûts de la phase
                    let phaseCosts = {
                      materials: 0,
                      labor: 0,
                      equipment: 0,
                      total: 0
                    };
                    
                    if (phase.tasks && Array.isArray(phase.tasks)) {
                      phase.tasks.forEach(task => {
                        if (task.costItems && Array.isArray(task.costItems)) {
                          task.costItems.forEach(item => {
                            const cost = item.actualTotal || (item.estimatedQuantity * item.estimatedUnitPrice);
                            switch (item.type) {
                              case 'material':
                                phaseCosts.materials += cost;
                                break;
                              case 'labor':
                                phaseCosts.labor += cost;
                                break;
                              case 'equipment':
                                phaseCosts.equipment += cost;
                                break;
                            }
                            phaseCosts.total += cost;
                          });
                        }
                      });
                    }
                    
                    const budgetAllocated = financialSummary.totalBudget / (currentProject?.phases || []).length;
                    const budgetUtilization = budgetAllocated > 0 ? (phaseCosts.total / budgetAllocated) * 100 : 0;
                    
                    return (
                      <div key={phase.id || index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="font-semibold text-lg text-gray-800">{phase.name}</h5>
                            <p className="text-sm text-gray-500 mt-1">{phase.description || 'Aucune description'}</p>
                            <div className="flex items-center mt-2">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                phase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {phase.status === 'completed' ? 'Terminée' :
                                 phase.status === 'in_progress' ? 'En cours' :
                                 phase.status === 'pending' ? 'En attente' :
                                 'Non défini'}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {(phase.tasks || []).length} tâche(s)
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl">{phaseCosts.total.toLocaleString('fr-FR')} €</p>
                            <p className="text-sm text-gray-500">Coût réalisé</p>
                            <p className="text-xs text-gray-400">Budget: {budgetAllocated.toLocaleString('fr-FR')} €</p>
                          </div>
                        </div>
                        
                        {/* Barre de progression budgétaire */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilisation du budget</span>
                            <span className={`font-medium ${
                              budgetUtilization > 100 ? 'text-red-600' :
                              budgetUtilization > 80 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {budgetUtilization.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                budgetUtilization > 100 ? 'bg-red-500' :
                                budgetUtilization > 80 ? 'bg-orange-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Répartition des coûts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Matériaux</p>
                            <p className="font-semibold text-blue-700">
                              {phaseCosts.materials.toLocaleString('fr-FR')} €
                            </p>
                            <p className="text-xs text-blue-500">
                              {phaseCosts.total > 0 ? ((phaseCosts.materials / phaseCosts.total) * 100).toFixed(1) : '0'}%
                            </p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-medium">Main d'œuvre</p>
                            <p className="font-semibold text-green-700">
                              {phaseCosts.labor.toLocaleString('fr-FR')} €
                            </p>
                            <p className="text-xs text-green-500">
                              {phaseCosts.total > 0 ? ((phaseCosts.labor / phaseCosts.total) * 100).toFixed(1) : '0'}%
                            </p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-600 font-medium">Équipements</p>
                            <p className="font-semibold text-orange-700">
                              {phaseCosts.equipment.toLocaleString('fr-FR')} €
                            </p>
                            <p className="text-xs text-orange-500">
                              {phaseCosts.total > 0 ? ((phaseCosts.equipment / phaseCosts.total) * 100).toFixed(1) : '0'}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Alertes de phase */}
                        {budgetUtilization > 90 && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                              <span className="text-sm text-red-700 font-medium">
                                Attention: Budget de phase dépassé ou proche de la limite
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Analyse comparative des phases */}
          <div className="glass-card p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="w-4 h-4 mr-2 text-purple-600" />
              Analyse Comparative
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Performance par Phase</h5>
                {(currentProject?.phases || []).map((phase, index) => {
                  const phaseTasks = phase.tasks || [];
                  const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
                  const progress = phaseTasks.length > 0 ? (completedTasks / phaseTasks.length) * 100 : 0;
                  
                  return (
                    <div key={phase.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{phase.name}</p>
                          <p className="text-xs text-gray-500">{progress.toFixed(0)}% complété</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{phaseTasks.length}</p>
                        <p className="text-xs text-gray-500">tâches</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800 mb-3">📊 Insights Financiers</h5>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Phase la plus coûteuse</span>
                    <span className="font-semibold">
                      {(currentProject?.phases || []).length > 0 
                        ? (currentProject?.phases || [])[0]?.name || 'N/A'
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Budget moyen/phase</span>
                    <span className="font-semibold">
                      {(currentProject?.phases || []).length > 0 
                        ? (financialSummary.totalBudget / (currentProject?.phases || []).length).toLocaleString('fr-FR')
                        : '0'
                      } €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Efficacité globale</span>
                    <span className={`font-semibold ${
                      financialSummary.budgetUtilization <= 100 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialSummary.budgetUtilization <= 100 ? 'Bonne' : 'Améliorer'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-purple-600 font-medium">Recommandation</p>
                  <p className="text-sm text-purple-800 mt-1">
                    {financialSummary.budgetUtilization > 90 
                      ? 'Réviser la planification des phases restantes'
                      : 'Maintenir le rythme actuel de dépenses'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal transaction */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initialData={editing || undefined}
      />
    </div>
  );
};

export default Finances;
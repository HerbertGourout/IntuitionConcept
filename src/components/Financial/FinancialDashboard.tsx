import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Receipt, AlertCircle, CheckCircle } from 'lucide-react';
import { financialService, BudgetSummary, PurchaseOrder, Expense } from '../../services/financialService';

interface FinancialDashboardProps {
  projectId: string;
  phaseId?: string;
  taskId?: string;
  level: 'project' | 'phase' | 'task';
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  projectId,
  phaseId,
  taskId
}) => {
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger le résumé budgétaire
      const summary = await financialService.getBudgetSummary(projectId, phaseId, taskId);
      setBudgetSummary(summary);

      // Charger les bons de commande
      const orders = await financialService.getPurchaseOrdersByProject(projectId);
      const filteredOrders = orders.filter(order => {
        if (taskId) return order.taskId === taskId;
        if (phaseId) return order.phaseId === phaseId;
        return true;
      });
      setPurchaseOrders(filteredOrders);

      // Charger les dépenses
      const allExpenses = await financialService.getExpensesByProject(projectId);
      const filteredExpenses = allExpenses.filter(expense => {
        if (taskId) return expense.taskId === taskId;
        if (phaseId) return expense.phaseId === phaseId;
        return true;
      });
      setExpenses(filteredExpenses);

    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, phaseId, taskId]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getVarianceColor = (variance: number): string => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!budgetSummary) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Aucune donnée financière disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé budgétaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Estimé</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetSummary.estimatedBudget)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépensé</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetSummary.spentAmount)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagements</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(budgetSummary.commitments)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restant</p>
              <p className={`text-2xl font-bold ${budgetSummary.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetSummary.remainingBudget)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${budgetSummary.remainingBudget >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-pink-500'} text-white`}>
              {budgetSummary.remainingBudget >= 0 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </div>

      {/* Écart budgétaire */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Analyse Budgétaire</h3>
          <div className={`flex items-center gap-2 ${getVarianceColor(budgetSummary.variance)}`}>
            {getVarianceIcon(budgetSummary.variance)}
            <span className="font-medium">
              {budgetSummary.variance > 0 ? '+' : ''}{formatCurrency(budgetSummary.variance)}
              ({budgetSummary.variancePercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`h-4 rounded-full ${budgetSummary.projectedTotal <= budgetSummary.estimatedBudget ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
            style={{ width: `${Math.min((budgetSummary.projectedTotal / budgetSummary.estimatedBudget) * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Projeté:</span>
            <span className="font-medium ml-2">{formatCurrency(budgetSummary.projectedTotal)}</span>
          </div>
          <div>
            <span className="text-gray-600">Utilisation:</span>
            <span className="font-medium ml-2">
              {((budgetSummary.projectedTotal / budgetSummary.estimatedBudget) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bons de commande récents */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bons de Commande Récents</h3>
          <ShoppingCart className="w-5 h-5 text-gray-600" />
        </div>
        
        {purchaseOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Aucun bon de commande</p>
        ) : (
          <div className="space-y-3">
            {purchaseOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'approved' ? 'bg-green-100 text-green-800' :
                    order.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'received' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dépenses récentes */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dépenses Récentes</h3>
          <Receipt className="w-5 h-5 text-gray-600" />
        </div>
        
        {expenses.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Aucune dépense enregistrée</p>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-600">{expense.category} • {new Date(expense.expenseDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    expense.status === 'paid' ? 'bg-green-100 text-green-800' :
                    expense.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;

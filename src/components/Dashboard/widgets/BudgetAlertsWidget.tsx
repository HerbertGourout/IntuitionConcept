import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Zap,
  Bell,
  X
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  amount: number;
  percentage: number;
  projectId: string;
  projectName: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface BudgetAlertsWidgetProps {
  className?: string;
  projectId?: string;
  projectName?: string;
  budget?: number;
  totalActualExpenses?: number;
  totalPlannedExpenses?: number;
}

const BudgetAlertsWidget: React.FC<BudgetAlertsWidgetProps> = ({ className = '', projectId, projectName, budget = 0, totalActualExpenses = 0, totalPlannedExpenses = 0 }) => {
  const { resolvedTheme } = useTheme();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('unread');

  // Génération d'alertes à partir des métriques financières reçues
  useEffect(() => {
    const list: BudgetAlert[] = [];
    const name = projectName || 'Projet en cours';
    const id = projectId || 'current-project';

    if (budget > 0) {
      const usedPct = Math.round((totalActualExpenses / budget) * 100);
      if (usedPct >= 95) {
        list.push({
          id: `${id}-critical-usage`,
          type: 'danger',
          title: 'Dépassement budgétaire critique',
          message: `${name} a dépassé 95% de son budget alloué`,
          amount: totalActualExpenses,
          percentage: usedPct,
          projectId: id,
          projectName: name,
          timestamp: new Date(),
          isRead: false,
          priority: 'critical',
        });
      } else if (usedPct >= 80) {
        list.push({
          id: `${id}-warning-usage`,
          type: 'warning',
          title: 'Seuil d\'alerte atteint',
          message: `${name} a dépassé ${usedPct}% du budget`,
          amount: totalActualExpenses,
          percentage: usedPct,
          projectId: id,
          projectName: name,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
        });
      } else {
        list.push({
          id: `${id}-info-usage`,
          type: 'info',
          title: 'Prévision budgétaire',
          message: `${name} est à ${usedPct}% du budget`,
          amount: totalActualExpenses,
          percentage: usedPct,
          projectId: id,
          projectName: name,
          timestamp: new Date(),
          isRead: true,
          priority: 'low',
        });
      }
    }

    // Écart Planned vs Actual
    if (totalPlannedExpenses > 0) {
      const variance = totalActualExpenses - totalPlannedExpenses;
      const variancePct = Math.round((Math.abs(variance) / totalPlannedExpenses) * 100);
      if (variance > 0 && variancePct >= 10) {
        list.push({
          id: `${id}-overrun`,
          type: 'danger',
          title: 'Dépenses réelles supérieures au plan',
          message: `${name}: +${variancePct}% vs planifié`,
          amount: variance,
          percentagncePct,
          projectId: id,
          projectName: name,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
        });
      } else if (variance < 0 && variancePct >= 10) {
        list.push({
          id: `${id}-savings`,
          type: 'success',
          title: 'Économie réalisée',
          message: `${name}: -${variancePct}% vs planifié`,
          amount: variance,
          percentagncePct,
          projectId: id,
          projectName: name,
          timestamp: new Date(),
          isRead: true,
          priority: 'medium',
        });
      }
    }

    setAlerts(list);
  }, [projectId, projectName, budget, totalActualExpenses, totalPlannedExpenses]);

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'info': return <Target className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'danger': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityBadge = (priority: BudgetAlert['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${(absAmount / 1000).toFixed(0)}K FCFA`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread': return !alert.isRead;
      case 'critical': return alert.priority === 'critical' || alert.priority === 'high';
      default: return true;
    }
  });

  const displayedAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, 3);

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.priority === 'critical' || a.priority === 'high').length,
  };

  return (
    <div className={`h-full ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Alertes Budgétaires
          </h3>
          <div className="flex items-center gap-2">
            <motion.div
              className="relative"
              animate={{ 
                scale: stats.critical > 0 ? [1, 1.1, 1] : 1 
              }}
              transition={{ 
                duration: 2, 
                repeat: stats.critical > 0 ? Infinity : 0 
              }}
            >
              <Bell className={`w-4 h-4 ${stats.unread > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              {stats.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
              filter === 'all'
                ? resolvedTheme === 'dark'
                  ? 'bg-blue-900 border-blue-700'
                  : 'bg-blue-50 border-blue-200'
                : resolvedTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilter('all')}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bell className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {stats.total}
            </p>
          </motion.div>

          <motion.div
            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
              filter === 'unread'
                ? resolvedTheme === 'dark'
                  ? 'bg-orange-900 border-orange-700'
                  : 'bg-orange-50 border-orange-200'
                : resolvedTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilter('unread')}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium">Non lues</span>
            </div>
            <p className="text-lg font-bold text-orange-600">
              {stats.unread}
            </p>
          </motion.div>

          <motion.div
            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
              filter === 'critical'
                ? resolvedTheme === 'dark'
                  ? 'bg-red-900 border-red-700'
                  : 'bg-red-50 border-red-200'
                : resolvedTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilter('critical')}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium">Critiques</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              {stats.critical}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {displayedAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                getAlertColor(alert.type)
              } ${!alert.isRead ? 'ring-1 ring-current' : 'opacity-75'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 2 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {alert.title}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mb-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title="Ignorer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {alert.projectName}
                  </span>
                  <span className="flex items-center gap-1">
                    {alert.amount >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-red-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-green-500" />
                    )}
                    {formatAmount(alert.amount)}
                  </span>
                  <span className="opacity-70">
                    {alert.percentage}% du budget
                  </span>
                </div>
                <span className="opacity-70">
                  {formatTimeAgo(alert.timestamp)}
                </span>
              </div>

              {/* Barre de progression du budget */}
              <div className="mt-2">
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      alert.percentage >= 95 ? 'bg-red-500' :
                      alert.percentage >= 80 ? 'bg-yellow-500' :
                      alert.percentage >= 60 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(alert.percentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className={`p-6 text-center rounded-lg border-2 border-dashed ${
            resolvedTheme === 'dark'
              ? 'border-gray-600 text-gray-400'
              : 'border-gray-300 text-gray-500'
          }`}>
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter === 'unread' ? 'Aucune alerte non lue' :
               filter === 'critical' ? 'Aucune alerte critique' :
               'Aucune alerte budgétaire'}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Tous vos budgets sont sous contrôle
            </p>
          </div>
        )}

        {filteredAlerts.length > 3 && !showAll && (
          <motion.button
            onClick={() => setShowAll(true)}
            className={`w-full p-2 text-sm rounded-lg border-2 border-dashed transition-colors ${
              resolvedTheme === 'dark'
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            Voir toutes les alertes ({filteredAlerts.length - 3} de plus)
          </motion.button>
        )}

        {showAll && filteredAlerts.length > 3 && (
          <motion.button
            onClick={() => setShowAll(false)}
            className={`w-full p-2 text-sm rounded-lg border-2 border-dashed transition-colors ${
              resolvedTheme === 'dark'
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            Réduire la liste
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default BudgetAlertsWidget;

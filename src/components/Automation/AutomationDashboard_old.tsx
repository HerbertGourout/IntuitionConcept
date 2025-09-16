import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Settings, 
  Plus,
  TrendingUp
} from 'lucide-react';
import { automationService, WorkflowExecution } from '../../services/automationService';
import ProgressBar from '../UI/ProgressBar';
import { AUTOMATION_SUMMARY } from '../../config/automationWorkflows';

interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  timeSavedThisWeek: number;
  recentExecutions: WorkflowExecution[];
}

export const AutomationDashboard: React.FC = () => {
  const [stats, setStats] = useState<AutomationStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    timeSavedThisWeek: 0,
    recentExecutions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const workflows = automationService.getWorkflows();
      const allExecutions: WorkflowExecution[] = [];
      
      workflows.forEach(workflow => {
        const executions = automationService.getWorkflowExecutions(workflow.id);
        allExecutions.push(...executions);
      });

      const recentExecutions = allExecutions
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 10);

      const completedExecutions = allExecutions.filter(e => e.status === 'completed');
      const successRate = allExecutions.length > 0 
        ? Math.round((completedExecutions.length / allExecutions.length) * 100)
        : 0;

      // Calcul approximatif du temps économisé (basé sur les exécutions réussies)
      const timeSavedThisWeek = completedExecutions.length * 0.5; // 30min par exécution réussie

      setStats({
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalExecutions: allExecutions.length,
        successRate,
        timeSavedThisWeek,
        recentExecutions
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 animate-spin" />;
      case 'completed': return <Play className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard Automatisations</h1>
            <p className="text-blue-100">
              Surveillez et gérez vos workflows n8n en temps réel
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Workflows */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalWorkflows}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Workflows Total</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Tous les workflows configurés</p>
        </div>

        {/* Active Workflows */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Play className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeWorkflows}</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Workflows Actifs</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">En cours d'exécution</p>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.successRate}%</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Taux de Réussite</h3>
          <div className="mt-2">
            <ProgressBar 
              percentage={stats.successRate} 
              color="bg-purple-500"
              height="h-2"
            />
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.timeSavedThisWeek}h</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Temps Économisé</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Cette semaine</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button className="btn-base btn-gradient-accent group hover-lift p-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Nouveau Workflow</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Créer une automatisation</p>
            </div>
          </div>
        </button>
        
        <button className="btn-base btn-secondary group hover-lift p-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Gérer Workflows</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Configurer les existants</p>
            </div>
          </div>
        </button>
        
        <button className="btn-base btn-secondary group hover-lift p-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Templates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Utiliser des modèles</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Executions */}
      <div className="p-6">
        {stats.recentExecutions.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune exécution récente</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les exécutions de vos workflows apparaîtront ici une fois qu'ils seront actifs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentExecutions.slice(0, 5).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    execution.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    execution.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {execution.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {execution.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {execution.status === 'running' && <Activity className="w-4 h-4 text-blue-600 animate-spin" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Workflow #{execution.workflowId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(execution.startedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    execution.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {execution.status === 'completed' ? 'Réussi' :
                     execution.status === 'failed' ? 'Échoué' :
                     'En cours'}
                  </span>
                  {execution.completedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Durée: {Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
            <p className="text-sm text-gray-600 mt-1">Créer une nouvelle automatisation</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Templates BTP</h3>
            <p className="text-sm text-gray-600 mt-1">Utiliser un template prédéfini</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Configuration n8n</h3>
            <p className="text-sm text-gray-600 mt-1">Configurer la connexion n8n</p>
          </button>
        </div>
      </div>
    </div>
  );
};

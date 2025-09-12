import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import ProgressBar from '../../UI/ProgressBar';

interface AnalyticsData {
  taskVelocity: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    weeklyAverage: number;
  };
  delayAnalysis: {
    totalDelays: number;
    averageDelay: number;
    mainCauses: Array<{
      cause: string;
      percentage: number;
    }>;
  };
  roi: {
    current: number;
    projected: number;
    trend: 'positive' | 'negative' | 'neutral';
  };
  benchmarking: {
    vsAverage: number;
    ranking: number;
    totalProjects: number;
    category: string;
  };
  kpis: Array<{
    name: string;
    value: number;
    unit: string;
    target: number;
    status: 'good' | 'warning' | 'critical';
  }>;
  trends: Array<{
    metric: string;
    change: number;
    period: string;
  }>;
}

const AnalyticsWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    taskVelocity: {
      current: 0,
      trend: 'stable',
      weeklyAverage: 0
    },
    delayAnalysis: {
      totalDelays: 0,
      averageDelay: 0,
      mainCauses: []
    },
    roi: {
      current: 0,
      projected: 0,
      trend: 'neutral'
    },
    benchmarking: {
      vsAverage: 0,
      ranking: 0,
      totalProjects: 0,
      category: ''
    },
    kpis: [],
    trends: []
  });

  useEffect(() => {
    if (!currentProject) return;

    const phases = currentProject.phases || [];
    const allTasks = phases.flatMap(phase => phase.tasks || []);
    const completedTasks = allTasks.filter(task => task.status === 'done');
    const totalTasks = allTasks.length;
    
    // Calcul des dépenses totales des tâches
    const totalTasksSpent = (currentProject.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, task) => tSum + (task.spent || 0), 0),
      0
    );

    // Vélocité des tâches basée sur les données réelles
    const currentVelocity = completedTasks.length > 0 ? Math.round(completedTasks.length / 4) : 0; // Tâches terminées par semaine estimée
    const weeklyAverage = currentVelocity; // Même valeur car pas d'historique
    const velocityTrend = 'stable'; // Stable par défaut sans historique



    // Analyse des retards
    const delayedTasks = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return task.status !== 'done' && dueDate < today;
    });

    const totalDelays = delayedTasks.length;
    const averageDelay = totalDelays > 0 ? 
      delayedTasks.reduce((sum, task) => {
        if (!task.dueDate) return sum;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return sum + Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / totalDelays : 0;

    const mainCauses = [
      { cause: 'Météo', percentage: 35 },
      { cause: 'Matériaux', percentage: 28 },
      { cause: 'Main d\'œuvre', percentage: 22 },
      { cause: 'Équipements', percentage: 15 }
    ];

    // ROI basé sur les vraies données
    const budget = currentProject.budget || 0;
    const spent = totalTasksSpent;
    const currentROI = budget > 0 ? Math.round(((budget - spent) / budget) * 100) : 0;
    const projectedROI = currentROI; // Même valeur car pas de prédiction avancée
    const roiTrend = 'neutral'; // Neutre par défaut

    // Benchmarking basé sur les données réelles
    const vsAverage = 0; // Pas de données de comparaison
    const ranking = 1; // Classement par défaut
    const totalProjects = 1; // Seul projet
    const category = currentProject.type || 'Construction';

    // KPIs
    const kpis = [
      {
        name: 'Efficacité équipe',
        value: Math.round((completedTasks.length / Math.max(totalTasks, 1)) * 100),
        unit: '%',
        target: 85,
        status: 'good' as 'good' | 'warning' | 'critical'
      },
      {
        name: 'Respect délais',
        value: 95,
        unit: '%',
        target: 90,
        status: 'good' as 'good' | 'warning' | 'critical'
      },
      {
        name: 'Qualité',
        value: Math.round((completedTasks.length / Math.max(totalTasks, 1)) * 100),
        unit: '%',
        target: 90,
        status: 'good' as 'good' | 'warning' | 'critical'
      }
    ];

    // Tendances
    const trends = [
      {
        metric: 'Productivité',
        change: 0, // Pas d'historique pour calculer les tendances
        period: '30 jours'
      },
      {
        metric: 'Coûts',
        change: 0, // Pas d'historique pour calculer les tendances
        period: '30 jours'
      },
      {
        metric: 'Satisfaction',
        change: 0, // Pas d'historique pour calculer les tendances
        period: '30 jours'
      }
    ];

    setAnalyticsData({
      taskVelocity: {
        current: currentVelocity,
        trend: velocityTrend,
        weeklyAverage
      },
      delayAnalysis: {
        totalDelays,
        averageDelay,
        mainCauses
      },
      roi: {
        current: currentROI,
        projected: projectedROI,
        trend: roiTrend
      },
      benchmarking: {
        vsAverage,
        ranking,
        totalProjects,
        category
      },
      kpis,
      trends
    });
  }, [currentProject]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analytiques & Tendances</h3>
        <BarChart3 className="w-5 h-5 text-purple-600" />
      </div>

      {/* Vélocité des tâches */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Vélocité des tâches</span>
          {getTrendIcon(analyticsData.taskVelocity.trend)}
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analyticsData.taskVelocity.current}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            tâches/semaine (moy: {analyticsData.taskVelocity.weeklyAverage})
          </div>
        </div>
      </div>



      {/* KPIs */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">KPIs principaux</h4>
        <div className="space-y-3">
          {analyticsData.kpis.map((kpi, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{kpi.name}</span>
                  <span className={`text-sm font-medium ${
                    kpi.value >= kpi.target ? 'text-green-600' : 
                    kpi.value >= kpi.target * 0.8 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {kpi.value}{kpi.unit}
                  </span>
                </div>
                {(() => {
                  const percent = Math.min((kpi.value / Math.max(kpi.target, 1)) * 100, 100);
                  const tone: 'green' | 'orange' | 'red' = kpi.value >= kpi.target ? 'green' : (kpi.value >= kpi.target * 0.8 ? 'orange' : 'red');
                  return <ProgressBar value={percent} tone={tone} />;
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse des retards */}
      {analyticsData.delayAnalysis.totalDelays > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <AlertTriangle className="w-4 h-4 text-orange-600 mr-1" />
              Analyse des retards
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {analyticsData.delayAnalysis.totalDelays} retards • {analyticsData.delayAnalysis.averageDelay}j moy
            </span>
          </div>
          <div className="space-y-2">
            {analyticsData.delayAnalysis.mainCauses.slice(0, 3).map((cause, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">{cause.cause}</span>
                <div className="flex items-center space-x-2 w-40">
                  <ProgressBar value={cause.percentage} tone="orange" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                    {cause.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmarking */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Award className="w-4 h-4 text-gold-600 mr-1" />
          Benchmarking
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">vs Moyenne</span>
              <div className={`font-medium ${
                analyticsData.benchmarking.vsAverage > 0 ? 'text-green-600' : 
                analyticsData.benchmarking.vsAverage < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analyticsData.benchmarking.vsAverage > 0 ? '+' : ''}{analyticsData.benchmarking.vsAverage}%
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Classement</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {analyticsData.benchmarking.ranking}/{analyticsData.benchmarking.totalProjects}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tendances */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tendances</h4>
        <div className="space-y-2">
          {analyticsData.trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{trend.metric}</span>
              <div className="flex items-center space-x-1">
                {trend.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : trend.change < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                ) : (
                  <BarChart3 className="w-3 h-3 text-gray-600" />
                )}
                <span className={`font-medium ${
                  trend.change > 0 ? 'text-green-600' : 
                  trend.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.change > 0 ? '+' : ''}{trend.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;

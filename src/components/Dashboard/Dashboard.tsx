import React, { useMemo, useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useProjectStats } from '../../hooks/useProjectData';
import { AlertTriangle, Zap, Scan, Target, Users, Euro, Calendar } from 'lucide-react';
import PageContainer from '../Layout/PageContainer';

// Import des widgets essentiels
import ProjectsOverviewWidget from './widgets/ProjectsOverviewWidget';
import TeamProductivityWidget from './widgets/TeamProductivityWidget';
import BudgetAlertsWidget from './widgets/BudgetAlertsWidget';
import ActivityTimelineWidget from './widgets/ActivityTimelineWidget';
import RealTimeChartWidget from './widgets/RealTimeChartWidget';
import CircularProgressWidget from './widgets/CircularProgressWidget';

// Import des widgets avancés
import EquipmentMaintenanceWidget from './widgets/EquipmentMaintenanceWidget';
import EquipmentScannerWidget from './widgets/EquipmentScannerWidget';
import WeatherWidget from './widgets/WeatherWidget';
import OfflineStatusWidget from './widgets/OfflineStatusWidget';

// Import des widgets IA uniques (pas de doublons avec sidebar)
import HybridAIMonitoringWidget from './HybridAIMonitoringWidget';
import VocalCopilot from '../AI/VocalCopilot';
import HybridAITestPanel from '../AI/HybridAITestPanel';

// Import du Stack IA Premium
import MarketIntelligenceDashboard from '../AI/MarketIntelligenceDashboard';
import GrokChatAssistant from '../AI/GrokChatAssistant';

// Note: AnomalyDetectionDashboard, AIServicesDashboard, AutomationDashboard 
// sont disponibles via le sidebar - pas besoin de les dupliquer ici

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentProject } = useProjects();
  const { stats, loading: statsLoading } = useProjectStats(currentProject?.id || null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const defaultPrefs: {
    showProjectsOverview: boolean;
    showTeamProductivity: boolean;
    showBudgetAlerts: boolean;
    showActivityTimeline: boolean;
    showRealTimeChart: boolean;
    showCircularProgress: boolean;
    density: 'normal' | 'compact';
    firstRowOrder: Array<'projectsOverview' | 'teamProductivity' | 'budgetAlerts'>;
    sizeProjectsOverview: 'small' | 'medium' | 'large';
    sizeTeamProductivity: 'small' | 'medium' | 'large';
    sizeBudgetAlerts: 'small' | 'medium' | 'large';
    secondRowOrder: Array<'activityTimeline' | 'realTimeChart'>;
    sizeActivityTimeline: 'small' | 'medium' | 'large';
    sizeRealTimeChart: 'small' | 'medium' | 'large';
    thirdRowOrder: Array<'circularProgress' | 'quickActions'>;
    sizeCircularProgress: 'small' | 'medium' | 'large';
    sizeQuickActions: 'small' | 'medium' | 'large';
  } = {
    showProjectsOverview: true,
    showTeamProductivity: true,
    showBudgetAlerts: true,
    showActivityTimeline: true,
    showRealTimeChart: true,
    showCircularProgress: true,
    density: 'compact',
    firstRowOrder: ['projectsOverview', 'teamProductivity', 'budgetAlerts'],
    sizeProjectsOverview: 'medium',
    sizeTeamProductivity: 'small',
    sizeBudgetAlerts: 'small',
    secondRowOrder: ['activityTimeline', 'realTimeChart'],
    sizeActivityTimeline: 'medium',
    sizeRealTimeChart: 'medium',
    thirdRowOrder: ['circularProgress', 'quickActions'],
    sizeCircularProgress: 'medium',
    sizeQuickActions: 'large',
  };
  const [prefs] = useState<typeof defaultPrefs>(defaultPrefs);

  // Calculer les statistiques réelles du projet
  const projectStats = useMemo(() => {
    if (!currentProject || statsLoading) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        totalEquipment: 0,
        availableEquipment: 0,
        inUseEquipment: 0,
        maintenanceEquipment: 0,
        totalDocuments: 0,
        totalTransactions: 0,
        totalBudget: 0,
        spentBudget: 0,
        budgetUsed: 0,
        teamMembers: 0,
        progress: 0,
      };
    }
    const totalTasks = currentProject.phases?.reduce((sum, phase) => sum + (phase.tasks?.length || 0), 0) || 0;
    const completedTasks = currentProject.phases?.reduce((sum, phase) => 
      sum + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0;
    const inProgressTasks = currentProject.phases?.reduce((sum, phase) => 
      sum + (phase.tasks?.filter(task => task.status === 'in_progress').length || 0), 0) || 0;
    const pendingTasks = totalTasks - completedTasks - inProgressTasks;


    const totalBudget = Number(currentProject.budget) || 0;
    const spentBudget = Number(currentProject.spent) || 0;
    const totalEquipment = stats.equipmentCount || 0;
    const availableEquipment = totalEquipment; // Approximation: tout est disponible si pas de données d'utilisation
    const inUseEquipment = Math.max(0, totalEquipment - availableEquipment);
    const maintenanceEquipment = 0; // Valeur par défaut faute de métrique dédiée

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalEquipment,
      availableEquipment, // Approximation
      inUseEquipment,
      maintenanceEquipment,
      totalDocuments: stats.documentCount,
      totalTransactions: stats.transactionCount,
      totalBudget,
      spentBudget,
      budgetUsed: totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0,
      teamMembers: currentProject.team?.length || 0,
      progress: currentProject.progress || 0,
    };
  }, [currentProject, stats, statsLoading]);

  // Si aucun projet n'est sélectionné
  if (!currentProject) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">Aucun projet sélectionné</h2>
          <p className="text-gray-500 mt-2">Veuillez sélectionner un projet pour voir le dashboard</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header du Dashboard */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex-shrink-0">
              <Target className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                <span className="font-medium">{currentProject.name}</span>
                {currentProject.client && (
                  <span className="hidden sm:inline"> • Client: {currentProject.client}</span>
                )}
              </p>
              {currentProject.client && (
                <p className="text-sm text-gray-500 sm:hidden">
                  Client: {currentProject.client}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Vue Avancée</span>
              <span className="sm:hidden">Avancé</span>
            </button>
            
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <Target className="w-4 h-4 flex-shrink-0" />
              <span>Personnaliser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques du Projet Actuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{projectStats.totalTasks}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Tâches Totales</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-800"
              style={{ width: `${projectStats.totalTasks > 0 ? (projectStats.completedTasks / projectStats.totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">{projectStats.teamMembers}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Membres Équipe</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Euro className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-orange-600">{(projectStats.budgetUsed || 0).toFixed(1)}%</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Budget Utilisé</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-800 ${
                (projectStats.budgetUsed || 0) >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                (projectStats.budgetUsed || 0) >= 90 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                (projectStats.budgetUsed || 0) >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(projectStats.budgetUsed || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">{projectStats.progress}%</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Progression</h3>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-800"
              style={{ width: `${projectStats.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alertes Budgétaires */}
      {(projectStats.budgetUsed || 0) >= 75 && (
        <div className={`glass-card p-4 rounded-xl border-l-4 mb-6 ${
          (projectStats.budgetUsed || 0) >= 100 ? 'border-red-500 bg-red-50/50' :
          (projectStats.budgetUsed || 0) >= 90 ? 'border-orange-500 bg-orange-50/50' :
          'border-yellow-500 bg-yellow-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              (projectStats.budgetUsed || 0) >= 100 ? 'text-red-600' :
              (projectStats.budgetUsed || 0) >= 90 ? 'text-orange-600' :
              'text-yellow-600'
            }`} />
            <div>
              <h4 className="font-semibold text-gray-900">
                {(projectStats.budgetUsed || 0) >= 100 ? 'Budget dépassé !' :
                 (projectStats.budgetUsed || 0) >= 90 ? 'Attention au budget' :
                 'Budget à surveiller'}
              </h4>
              <p className="text-sm text-gray-600">
                {(projectStats.budgetUsed || 0) >= 100 ? 
                  `Le budget a été dépassé de ${((projectStats.budgetUsed || 0) - 100).toFixed(1)}%` :
                  `${(projectStats.budgetUsed || 0).toFixed(1)}% du budget a été utilisé`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Widgets du Dashboard */}
      <div className="space-y-6">
        {/* Première rangée */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {prefs.firstRowOrder.map((widgetKey) => {
            switch (widgetKey) {
              case 'projectsOverview':
                return prefs.showProjectsOverview ? (
                  <ProjectsOverviewWidget 
                    key="projectsOverview" 
                    currentProject={currentProject}
                    stats={projectStats}
                  />
                ) : null;
              case 'teamProductivity':
                return prefs.showTeamProductivity ? (
                  <TeamProductivityWidget 
                    key="teamProductivity"
                  />
                ) : null;
              case 'budgetAlerts':
                return prefs.showBudgetAlerts ? (
                  <BudgetAlertsWidget 
                    key="budgetAlerts"
                    projectId={currentProject.id}
                    projectName={currentProject.name}
                    budget={currentProject.budget || 0}
                    totalActualExpenses={projectStats.spentBudget}
                    totalPlannedExpenses={projectStats.totalBudget}
                  />
                ) : null;
              default:
                return null;
            }
          })}
        </div>

        {/* Deuxième rangée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prefs.secondRowOrder.map((widgetKey) => {
            switch (widgetKey) {
              case 'activityTimeline':
                return prefs.showActivityTimeline ? (
                  <ActivityTimelineWidget 
                    key="activityTimeline"
                  />
                ) : null;
              case 'realTimeChart':
                return prefs.showRealTimeChart ? (
                  <RealTimeChartWidget 
                    key="realTimeChart"
                  />
                ) : null;
              default:
                return null;
            }
          })}
        </div>

        {/* Troisième rangée */}
        {prefs.showCircularProgress && (
          <CircularProgressWidget 
            title="Progression du projet"
            percentage={projectStats.progress || 0}
            value={`${projectStats.progress || 0}%`}
            color="#3B82F6"
            subtitle={`${projectStats.completedTasks}/${projectStats.totalTasks} tâches terminées`}
          />
        )}

        {/* Vue Avancée */}
        {showAdvanced && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EquipmentMaintenanceWidget />
              <WeatherWidget />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EquipmentScannerWidget />
              <OfflineStatusWidget />
              <HybridAIMonitoringWidget />
            </div>
            
            {/* Section IA Premium */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-500" />
                  Intelligence Artificielle Premium
                </h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full">
                  Stack Hybride
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Veille Marché Temps Réel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                  <MarketIntelligenceDashboard />
                </div>
                
                {/* Chat Assistant Grok */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px]">
                  <GrokChatAssistant />
                </div>
              </div>
            </div>

            {/* Navigation Cards vers les pages dédiées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Carte Anomalies */}
              <div 
                className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-red-200/20"
                onClick={() => onNavigate?.('anomaly-detection')}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold">Détection d'Anomalies</h3>
                </div>
                <p className="text-gray-600 mb-4">Analyse IA des anomalies projet</p>
                <button className="text-red-500 font-medium hover:text-red-600">
                  Accéder au module →
                </button>
              </div>

              {/* Carte Automatisations */}
              <div 
                className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-yellow-200/20"
                onClick={() => onNavigate?.('automation-hub')}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Automatisations</h3>
                </div>
                <p className="text-gray-600 mb-4">Hub complet d'automatisation et workflows</p>
                <button className="text-yellow-500 font-medium hover:text-yellow-600">
                  Gérer les workflows →
                </button>
              </div>

              {/* Carte Scanner OCR */}
              <div 
                className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-purple-200/20"
                onClick={() => onNavigate?.('ocr-scanner')}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Scan className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold">Scanner OCR IA</h3>
                </div>
                <p className="text-gray-600 mb-4">Reconnaissance optique intelligente</p>
                <button className="text-purple-500 font-medium hover:text-purple-600">
                  Ouvrir le scanner →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copilot Vocal */}
      <VocalCopilot />
      
      {/* Panel de Test IA */}
      <HybridAITestPanel />
    </PageContainer>
  );
};

export default Dashboard;

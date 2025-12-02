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
import StructuralStudyAnalyticsWidget from './widgets/StructuralStudyAnalyticsWidget';

import HybridAIMonitoringWidget from './HybridAIMonitoringWidget';
import VocalCopilot from '../AI/VocalCopilot';
import HybridAITestPanel from '../AI/HybridAITestPanel';

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
      {/* En-tête du Dashboard */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard - {currentProject.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble du projet
        </p>
      </div>

      {/* Widgets principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {prefs.showProjectsOverview && (
          <ProjectsOverviewWidget />
        )}
        {prefs.showTeamProductivity && (
          <TeamProductivityWidget />
        )}
        {prefs.showBudgetAlerts && (
          <BudgetAlertsWidget />
        )}
      </div>

      {/* Deuxième rangée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {prefs.showActivityTimeline && (
          <ActivityTimelineWidget />
        )}
        {prefs.showRealTimeChart && (
          <RealTimeChartWidget />
        )}
      </div>

      {/* Troisième rangée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {prefs.showCircularProgress && (
          <CircularProgressWidget 
            value={projectStats.progress} 
            label="Progression globale"
          />
        )}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiques du projet</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tâches totales</p>
              <p className="text-2xl font-bold">{projectStats.totalTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-600">{projectStats.pendingTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section IA et Automatisations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            Système automatisé Premium
          </h2>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full">
            Stack Hybride
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Copilot Vocal */}
      <VocalCopilot />
      
      {/* Panel de test IA */}
      <HybridAITestPanel />
    </PageContainer>
  );
};

export default Dashboard;

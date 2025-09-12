import React, { useMemo } from 'react';
import {
  FileText, Download, BarChart3, PieChart,
  TrendingUp, DollarSign, CheckCircle,
  Target
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { motion } from 'framer-motion';
import ReportService from '../../services/reportService';
import ProgressBar from '../UI/ProgressBar';

interface ReportData {
  id: string;
  name: string;
  type: string;
  progress: number;
  budget: number;
  spent: number;
  tasks: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'delayed' | 'on_hold';
}

interface ReportStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalTasks: number;
  completedTasks: number;
  averageProgress: number;
}

const Reports: React.FC = () => {
  const { projects } = useProjectContext();

  // Calcul des données de rapport
  const reportData: ReportData[] = useMemo(() => {
    return projects.map(project => {
      const totalTasks = project.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0;
      const completedTasks = project.phases?.reduce((acc, phase) => 
        acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Déterminer le statut du projet
      let status: ReportData['status'] = 'active';
      if (progress === 100) status = 'completed';
      else if (progress < 30) status = 'delayed';
      else if (project.status === 'on_hold') status = 'on_hold';

      return {
        id: project.id,
        name: project.name,
        type: project.type || 'Construction',
        progress,
        budget: project.budget,
        spent: project.spent || 0,
        tasks: totalTasks,
        completedTasks,
        startDate: project.startDate,
        endDate: project.endDate,
        status
      };
    });
  }, [projects]);

  // Calcul des statistiques globales
  const stats: ReportStats = useMemo(() => {
    const totalProjects = reportData.length;
    const activeProjects = reportData.filter(p => p.status === 'active').length;
    const completedProjects = reportData.filter(p => p.status === 'completed').length;
    const totalBudget = reportData.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = reportData.reduce((sum, p) => sum + p.spent, 0);
    const totalTasks = reportData.reduce((sum, p) => sum + p.tasks, 0);
    const completedTasks = reportData.reduce((sum, p) => sum + p.completedTasks, 0);
    const averageProgress = totalProjects > 0 ? Math.round(reportData.reduce((sum, p) => sum + p.progress, 0) / totalProjects) : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      totalTasks,
      completedTasks,
      averageProgress
    };
  }, [reportData]);

  // (simplified) No filtering UI; this page shows a compact overview only

  const generateReport = (type: string) => {
    try {
      switch (type) {
        case 'global':
          ReportService.generateGlobalReport(projects);
          break;
        case 'financial':
          ReportService.generateFinancialReport(projects);
          break;
        case 'performance':
          ReportService.generatePerformanceReport(projects);
          break;
        default:
          if (type.startsWith('project-')) {
            const projectId = type.replace('project-', '');
            const project = projects.find(p => p.id === projectId);
            if (project) {
              ReportService.generateProjectReport(project);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    }
  };

  const exportData = (format: string) => {
    try {
      if (format === 'Excel' || format.startsWith('project-')) {
        ReportService.exportToExcel(projects, format === 'Excel' ? 'export-global' : format);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  // Composant pour les statistiques KPI
  const StatsCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    subtitle?: string;
  }) => (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="glass-card p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  // (remplacé) Utilise le composant ProgressBar partagé

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="glass-card w-full">
        <div className="flex items-center justify-between p-4 px-3 md:px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Rapports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble compacte des performances clés</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => exportData('Excel')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => generateReport('global')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FileText className="h-5 w-5" />
              <span>Rapport PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 w-full">
        <StatsCard title="Total Projets" value={stats.totalProjects} icon={Target} color="bg-blue-500" subtitle={`${stats.activeProjects} actifs`} />
        <StatsCard title="Budget Total" value={`${stats.totalBudget.toLocaleString()} FCFA`} icon={DollarSign} color="bg-green-500" subtitle={`${stats.totalSpent.toLocaleString()} FCFA dépensés`} />
        <StatsCard title="Tâches" value={`${stats.completedTasks}/${stats.totalTasks}`} icon={CheckCircle} color="bg-purple-500" subtitle={`${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}% terminées`} />
        <StatsCard title="Progression Moyenne" value={`${stats.averageProgress}%`} icon={TrendingUp} color="bg-orange-500" subtitle={`${stats.completedProjects} projets terminés`} />
      </div>

      {/* Vue d'ensemble simplifiée */}
      <div className="glass-card w-full">
        <div className="p-3 md:p-4 lg:p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-5 w-full">
              {/* Répartition des projets par statut */}
              <div className="glass-card p-3 md:p-4 lg:p-5 w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                  Répartition par Statut
                </h3>
                <div className="space-y-3">
                  {[
                    { status: 'active', label: 'En cours', count: stats.activeProjects, color: 'bg-blue-500' },
                    { status: 'completed', label: 'Terminés', count: stats.completedProjects, color: 'bg-green-500' },
                    { status: 'delayed', label: 'En retard', count: reportData.filter(p => p.status === 'delayed').length, color: 'bg-red-500' },
                    { status: 'on_hold', label: 'En pause', count: reportData.filter(p => p.status === 'on_hold').length, color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progression budgétaire */}
              <div className="glass-card p-3 md:p-4 lg:p-5 w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Progression Budgétaire
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Budget utilisé</span>
                      <span>{Math.round((stats.totalSpent / Math.max(stats.totalBudget, 1)) * 100)}%</span>
                    </div>
                    <ProgressBar value={(stats.totalSpent / Math.max(stats.totalBudget, 1)) * 100} tone="green" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-bold text-green-600 break-words">{stats.totalSpent.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">Dépensé</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-bold text-gray-800 break-words">{(stats.totalBudget - stats.totalSpent).toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">Restant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendances récentes (résumé) */}
            <div className="glass-card p-3 md:p-4 lg:p-5 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Tendances Récentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-lg font-bold text-blue-600">+15%</span>
                  <p className="text-sm text-gray-600">Productivité ce mois</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <span className="text-lg font-bold text-green-600">98%</span>
                  <p className="text-sm text-gray-600">Taux de satisfaction</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-lg font-bold text-purple-600">-8%</span>
                  <p className="text-sm text-gray-600">Délais de livraison</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

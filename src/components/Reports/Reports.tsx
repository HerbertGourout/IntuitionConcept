import React, { useState, useMemo } from 'react';
import {
  FileText, Download, BarChart3, PieChart,
  TrendingUp, DollarSign, Clock, CheckCircle,
  Search, Eye,
  Target, Activity, Zap, Award
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { motion } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  // Données filtrées
  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reportData, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'En cours';
      case 'delayed': return 'En retard';
      case 'on_hold': return 'En pause';
      default: return 'Inconnu';
    }
  };

  const generateReport = (type: string) => {
    console.log(`Génération du rapport: ${type}`);
    // Ici, vous ajouteriez la logique de génération de rapport PDF
    alert(`Génération du rapport ${type} en cours... (Fonctionnalité à implémenter)`);
  };

  const exportData = (format: string) => {
    console.log(`Export des données au format: ${format}`);
    alert(`Export ${format} en cours... (Fonctionnalité à implémenter)`);
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

  // Composant pour la barre de progression
  const ProgressBar = ({ percentage, color = 'bg-blue-500' }: { percentage: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-800 ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );

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
              <p className="text-gray-600 mt-1">
                Analysez les performances et générez des rapports détaillés
              </p>
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
        <StatsCard
          title="Total Projets"
          value={stats.totalProjects}
          icon={Target}
          color="bg-blue-500"
          subtitle={`${stats.activeProjects} actifs`}
        />
        <StatsCard
          title="Budget Total"
          value={`${stats.totalBudget.toLocaleString()} FCFA`}
          icon={DollarSign}
          color="bg-green-500"
          subtitle={`${stats.totalSpent.toLocaleString()} FCFA dépensés`}
        />
        <StatsCard
          title="Tâches"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon={CheckCircle}
          color="bg-purple-500"
          subtitle={`${Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}% terminées`}
        />
        <StatsCard
          title="Progression Moyenne"
          value={`${stats.averageProgress}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle={`${stats.completedProjects} projets terminés`}
        />
      </div>

      {/* Navigation par onglets */}
      <div className="glass-card w-full">
        <div className="border-b border-white/20">
          <nav className="flex space-x-4 md:space-x-6 lg:space-x-8 px-3 md:px-4 lg:px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
              { id: 'projects', label: 'Projets', icon: Target },
              { id: 'financial', label: 'Financier', icon: DollarSign },
              { id: 'performance', label: 'Performance', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 md:p-4 lg:p-5">
          {activeTab === 'overview' && (
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
                    ].map(item => (
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
                      <ProgressBar 
                        percentage={(stats.totalSpent / Math.max(stats.totalBudget, 1)) * 100}
                        color="bg-green-500"
                      />
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

              {/* Tendances récentes */}
              <div className="glass-card p-3 md:p-4 lg:p-5 w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Tendances Récentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-blue-600">+15%</p>
                    <p className="text-sm text-gray-600">Productivité ce mois</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-600">98%</p>
                    <p className="text-sm text-gray-600">Taux de satisfaction</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-purple-600">-8%</p>
                    <p className="text-sm text-gray-600">Délais de livraison</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">En cours</option>
                  <option value="completed">Terminés</option>
                  <option value="delayed">En retard</option>
                  <option value="on_hold">En pause</option>
                </select>
              </div>

              {/* Liste des projets */}
              <div className="space-y-4">
                {filteredData.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ y: -2 }}
                    className="glass-card p-3 md:p-4 lg:p-5 w-full hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">{project.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4 text-sm w-full">
                          <div>
                            <p className="text-gray-500">Progression</p>
                            <div className="flex items-center space-x-2">
                              <ProgressBar percentage={project.progress} />
                              <span className="font-semibold">{project.progress}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className="font-semibold text-green-600">{project.budget.toLocaleString()} FCFA</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Dépensé</p>
                            <p className="font-semibold text-red-600">{project.spent.toLocaleString()} FCFA</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tâches</p>
                            <p className="font-semibold">{project.completedTasks}/{project.tasks}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-3">
                        <button
                          onClick={() => generateReport(`project-${project.id}`)}
                          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => exportData(`project-${project.id}`)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-4 w-full">
              <div className="text-center py-8 px-3 md:px-4 lg:px-6 w-full">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Rapport Financier Détaillé</h3>
                <p className="text-gray-600 mb-6">Analyse approfondie des coûts, revenus et rentabilité</p>
                <button
                  onClick={() => generateReport('financial')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Générer le rapport financier
                </button>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4 w-full">
              <div className="text-center py-8 px-3 md:px-4 lg:px-6 w-full">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyse de Performance</h3>
                <p className="text-gray-600 mb-6">Métriques de productivité, qualité et efficacité</p>
                <button
                  onClick={() => generateReport('performance')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Générer l'analyse de performance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

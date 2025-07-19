import React, { useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { FolderOpen, Euro, AlertTriangle, Clock, AlertCircle, Users, Calendar, Target, Zap } from 'lucide-react';
import WeatherWidget from './widgets/WeatherWidget';
import CircularProgressWidget from './widgets/CircularProgressWidget';
import ActivityTimelineWidget from './widgets/ActivityTimelineWidget';
import AnimatedStatsCard from './widgets/AnimatedStatsCard';
import RealTimeChartWidget from './widgets/RealTimeChartWidget';
import { AnimatedBackground, GlassCard, AnimatedCounter } from '../UI/VisualEffects';

const Dashboard: React.FC = () => {
  const { currentProject, projects } = useProjects();
  
  // Vérifie que le projet sélectionné existe vraiment dans la liste
  const validProject = projects.find(p => p.id === currentProject?.id);
  // Convertir le projet actuel au format attendu par les composants enfants
  const currentProjectData = useMemo(() => {
    if (!validProject) return null;
    
    // Calculer le pourcentage d'avancement global basé sur les tâches
    const allTasks = (validProject.phases || []).flatMap(phase => (phase.tasks || []));
    const completedTasks = allTasks.filter(task => task && task.status === 'done').length;
    const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
    
    return {
      ...validProject,
      progress,
      tasks: allTasks,
      completedTasks,
    };
  }, [validProject]);
  
  // Calcul des statistiques basées sur le projet sélectionné
  const stats = useMemo(() => {
    if (!currentProjectData) {
      return {
        activeTasks: 0,
        availableEquipment: 0,
        equipmentInUse: 0,
        equipmentMaintenance: 0,
        totalEquipment: 0,
        teamMembers: 0,
        teamEfficiency: 0,
        budget: 0,
        budgetSpent: 0,
        budgetRemaining: 0,
        budgetPercentage: 0,
        delayedTasks: 0
      };
    }

    // Calculer le nombre de tâches actives
    const activeTasks = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => task && task.status === 'in_progress')
    ).length;
    
    const delayedTasks = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => 
        task && task.status !== 'done' && 
        task.dueDate && new Date(task.dueDate) < new Date()
      )
    ).length;
    
    const budget = currentProjectData.budget || 0;
    // TODO: Implement proper budget tracking with spent amounts per phase
    // Calcul dynamique du budget utilisé
    const budgetSpent = (currentProjectData.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, t) => tSum + (t.spent || 0), 0),
      0
    );
    const budgetRemaining = Math.max(0, budget - budgetSpent);
    const budgetPercentage = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
    
    // Statistiques d'équipement réelles
    const equipment = currentProjectData.equipment || [];
    const availableEquipment = equipment.filter(eq => eq.status === 'available').length;
    const equipmentInUse = equipment.filter(eq => eq.status === 'in-use').length;
    const equipmentMaintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const totalEquipment = equipment.length;
    
    // Calcul de l'efficacité de l'équipe basée sur les tâches terminées vs en retard
    const allTasksWithDates = (currentProjectData.phases || []).flatMap(phase => 
      (phase.tasks || []).filter(task => task && task.dueDate)
    );
    const completedTasksCount = allTasksWithDates.filter(task => task.status === 'done').length;
    const teamEfficiency = allTasksWithDates.length > 0 
      ? Math.round((completedTasksCount / allTasksWithDates.length) * 100)
      : 85; // Valeur par défaut si pas de données
    
    const teamMembers = currentProjectData.team?.length || 0;

    return {
      activeTasks,
      availableEquipment,
      equipmentInUse,
      equipmentMaintenance,
      totalEquipment,
      teamMembers,
      teamEfficiency,
      budget,
      budgetSpent,
      budgetRemaining,
      budgetPercentage,
      delayedTasks
    };
  }, [currentProjectData]);

  // Vérifier si nous avons des données de projet
  if (!currentProjectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-orange-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun projet sélectionné
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sélectionnez un projet dans le menu latéral pour accéder au tableau de bord interactif.
            </p>
            <div className="flex justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Créer un nouveau projet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground variant="particles">
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 dark:from-gray-900/80 dark:to-gray-800/80 p-6">
        {/* Header Hero Section */}
        <div className="mb-8 fade-in-up">
          <GlassCard className="p-8 hover-lift">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-glow"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Projet Actif</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-gradient">
                  {currentProjectData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {currentProjectData.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Animated Stats Cards */}
          <div className="lg:col-span-8 slide-in-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bounce-in" style={{animationDelay: '0.1s'}}>
                <AnimatedStatsCard
                  title="Tâches Actives"
                  value={stats.activeTasks}
                  previousValue={stats.activeTasks - 2}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="text-white"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                />
              </div>
              <div className="bounce-in" style={{animationDelay: '0.2s'}}>
                <AnimatedStatsCard
                  title="Budget Utilisé"
                  value={stats.budgetSpent}
                  previousValue={stats.budgetSpent - 50000}
                  format="currency"
                  icon={<Euro className="w-6 h-6 text-white" />}
                  color="text-white"
                  gradientFrom="from-green-500"
                  gradientTo="to-green-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bounce-in" style={{animationDelay: '0.3s'}}>
                <AnimatedStatsCard
                  title="Progression Globale"
                  value={currentProjectData.progress}
                  previousValue={currentProjectData.progress - 5}
                  format="percentage"
                  icon={<Target className="w-6 h-6 text-white" />}
                  color="text-white"
                  gradientFrom="from-orange-500"
                  gradientTo="to-orange-600"
                />
              </div>
              <div className="bounce-in" style={{animationDelay: '0.4s'}}>
                <AnimatedStatsCard
                  title="Équipe Active"
                  value={stats.teamMembers || 12}
                  previousValue={10}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="text-white"
                  gradientFrom="from-purple-500"
                  gradientTo="to-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="lg:col-span-4 slide-in-right">
            <div className="float-animation">
              <WeatherWidget location={currentProjectData.location} />
            </div>
          </div>
        </div>

      {/* Progress and Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <CircularProgressWidget
          title="Avancement Global"
          percentage={currentProjectData.progress}
          value={`${currentProjectData.progress}%`}
          color="#f97316"
          icon={<Target className="w-5 h-5" />}
          subtitle={`${currentProjectData.completedTasks} / ${currentProjectData.tasks?.length || 0} tâches`}
        />
        
        <CircularProgressWidget
          title="Budget Consommé"
          percentage={stats.budgetPercentage}
          value={`${stats.budgetPercentage}%`}
          color={stats.budgetPercentage > 80 ? '#ef4444' : '#10b981'}
          icon={<Euro className="w-5 h-5" />}
          subtitle={`${(stats.budgetSpent / 1000000).toFixed(1)}M / ${(stats.budget / 1000000).toFixed(1)}M FCFA`}
        />
        
        <CircularProgressWidget
          title="Efficacité Équipe"
          percentage={stats.teamEfficiency}
          value={`${stats.teamEfficiency}%`}
          color="#8b5cf6"
          icon={<Zap className="w-5 h-5" />}
          subtitle={`${stats.teamMembers} membres actifs`}
        />
      </div>

      {/* Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimelineWidget />
        <RealTimeChartWidget />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <FolderOpen className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Nouveau Projet</p>
            </button>
            
            <button className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Calendar className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Planning</p>
            </button>
            
            <button className="group p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <AlertTriangle className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Alertes</p>
            </button>
            
            <button className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Euro className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Budget</p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </AnimatedBackground>
  );
};

export default Dashboard;
import React, { useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { FolderOpen, Euro, AlertTriangle, Clock, AlertCircle, Users, Calendar, Target, Zap } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentProject, projects } = useProjects();
  const { formatAmount } = useCurrency();
  
  // Debug logs pour vérifier les changements de projet
  console.log('🔍 Dashboard - Projet actuel:', currentProject?.name || 'Aucun');
  console.log('🔍 Dashboard - ID du projet:', currentProject?.id || 'Aucun');
  console.log('🔍 Dashboard - Nombre de projets disponibles:', projects.length);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header Hero Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Projet Actif</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tâches Actives</p>
              <p className="text-3xl font-bold">{stats.activeTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Budget Utilisé</p>
              <p className="text-3xl font-bold">{formatAmount(stats.budgetSpent)}</p>
            </div>
            <Euro className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Progression</p>
              <p className="text-3xl font-bold">{currentProjectData.progress}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Équipe Active</p>
              <p className="text-3xl font-bold">{stats.teamMembers || 12}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avancement Global</h3>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${currentProjectData.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {currentProjectData.completedTasks} / {currentProjectData.tasks?.length || 0} tâches
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Consommé</h3>
            <Euro className="w-5 h-5 text-green-500" />
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${stats.budgetPercentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(stats.budgetPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {formatAmount(stats.budgetSpent)} / {formatAmount(stats.budget)}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Efficacité Équipe</h3>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.teamEfficiency}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {stats.teamMembers} membres actifs
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => onNavigate?.('projects')}
              className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <FolderOpen className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Nouveau Projet</p>
            </button>
            
            <button 
              onClick={() => onNavigate?.('planning')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Calendar className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Planning</p>
            </button>
            
            <button 
              onClick={() => {
                // Scroll vers les alertes ou afficher une notification
                const alertsSection = document.querySelector('[data-alerts]');
                if (alertsSection) {
                  alertsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Afficher les tâches en retard comme alertes
                  if (stats.delayedTasks > 0) {
                    alert(`Attention: ${stats.delayedTasks} tâche(s) en retard nécessitent votre attention.`);
                  } else {
                    alert('Aucune alerte pour le moment. Tout va bien!');
                  }
                }
              }}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <AlertTriangle className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Alertes</p>
              {stats.delayedTasks > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {stats.delayedTasks}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => onNavigate?.('purchase-orders')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Euro className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">Budget</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
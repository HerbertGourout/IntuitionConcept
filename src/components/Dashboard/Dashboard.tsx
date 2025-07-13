import React, { useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import StatCard from './StatsCards';
import { FolderOpen, Euro, AlertTriangle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import ProjectProgressCard from './ProjectProgressCard';
import TaskSummaryCard from './TaskSummaryCard';
import ProjectChart from './ProjectChart';
import { clearAllData, debugData } from '../../utils/clearData';

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
  }, [currentProject]);
  
  // Calcul des statistiques basées sur le projet sélectionné
  const stats = useMemo(() => {
    if (!currentProjectData) {
      return {
        activeTasks: 0,
        availableEquipment: 0,
        teamMembers: 0,
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
    const budgetSpent = 0; // Placeholder until budget tracking is implemented
    const budgetRemaining = Math.max(0, budget - budgetSpent);
    const budgetPercentage = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
    
    // Valeurs factices pour l'équipement et l'équipe
    const availableEquipment = 12; // À remplacer par des données réelles
    const teamMembers = currentProjectData.team?.length || 0;

    return {
      activeTasks,
      availableEquipment,
      teamMembers,
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
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Aucun projet n'est actuellement sélectionné. Veuillez en sélectionner un dans le menu latéral.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header modernisé */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {currentProjectData.name}
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            {`Vue d'ensemble du projet - ${currentProjectData.location}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bouton temporaire pour nettoyer les données */}
          <button
            onClick={() => {
              debugData();
              if (window.confirm('⚠️ ATTENTION: Ceci va supprimer TOUTES les données (localStorage + Firebase). Continuer ?')) {
                clearAllData();
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Nettoyer toutes les données
          </button>
          <span className="text-sm text-gray-500">Dernière mise à jour :</span>
          <span className="text-base font-semibold text-gray-900">
            {new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Contenu principal épuré */}
      <div className="space-y-8">
        {/* Statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Tâches actives"
            value={stats.activeTasks.toString()}
            change={0}
            changeType="neutral"
            icon={<Clock className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard 
            title="Équipements disponibles"
            value={stats.availableEquipment.toString()}
            change={0}
            changeType="neutral"
            icon={<FolderOpen className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard 
            title="Budget utilisé"
            value={`${stats.budgetPercentage}%`}
            change={0}
            changeType={stats.budgetPercentage > 80 ? 'decrease' : 'neutral'}
            icon={<Euro className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            description={`${(stats.budgetSpent / 1000000).toFixed(1)}M / ${(stats.budget / 1000000).toFixed(1)}M FCFA`}
          />
          <StatCard 
            title="Tâches en retard"
            value={stats.delayedTasks.toString()}
            change={0}
            changeType={stats.delayedTasks > 0 ? 'decrease' : 'neutral'}
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            color="bg-red-500"
          />
        </div>

        {/* Avancement & synthèse des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <ProjectProgressCard project={currentProjectData} />
          <TaskSummaryCard />
        </div>

        {/* Actions rapides modernisées */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Actions Rapides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <button 
              onClick={() => {}}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
            >
              <FolderOpen className="w-7 h-7 text-orange-600" />
              <span className="text-base font-medium text-gray-700">Nouveau Projet</span>
            </button>
            <button 
              onClick={() => {}}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Clock className="w-7 h-7 text-blue-600" />
              <span className="text-base font-medium text-gray-700">Planning</span>
            </button>
            <button 
              onClick={() => {}}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <AlertTriangle className="w-7 h-7 text-green-600" />
              <span className="text-base font-medium text-gray-700">Alertes</span>
            </button>
            <button 
              onClick={() => {}}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <Euro className="w-7 h-7 text-purple-600" />
              <span className="text-base font-medium text-gray-700">Budget</span>
            </button>
          </div>
        </div>

        {/* Graphique d'avancement modernisé */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Graphique d'avancement</h3>
          <ProjectChart project={currentProjectData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
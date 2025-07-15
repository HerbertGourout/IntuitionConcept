import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Share2, Settings, Pencil, Plus, BarChart3, Clock, CheckCircle, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, Project, ProjectPhase } from '../../contexts/projectTypes';
import GanttChart from './GanttChart';
import { Task } from '../../types';
import PhaseModal from './PhaseModal';

const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'calendar' | 'list';
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [phaseError, setPhaseError] = useState('');

  useEffect(() => {
    if (projectContext.currentProject) {
      const allTasks: ProjectTask[] = [];
      
      // Parcourir toutes les phases du projet
      (projectContext.currentProject.phases || []).forEach((phase: ProjectPhase) => {
        if (phase.tasks) {
          phase.tasks.forEach((task: ProjectTask) => {
            allTasks.push(task);
          });
        }
      });
      
      setTasks(allTasks);
    }
  }, [projectContext.currentProject]);

  const handleTaskUpdate = (taskId: string, updates: Partial<ProjectTask>) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    // Trouver la phase contenant la tâche
    const phaseId = projectContext.currentProject.phases.find(phase => 
      phase.tasks.some(task => task.id === taskId)
    )?.id;

    if (phaseId) {
      projectContext.updateTask(projectContext.currentProject.id, phaseId, taskId, updates);
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  };

  const handleTaskCreate = (taskData: Omit<ProjectTask, 'id' | 'costItems' | 'spent'>) => {
    if (!projectContext || !projectContext.currentProject) return;
    const phases = projectContext.currentProject.phases || [];
    if (phases.length === 0) {
      alert("Veuillez d'abord créer une phase avant d'ajouter une tâche.");
      return;
    }
    // Ajouter la tâche à la première phase disponible
    const phaseId = phases[0].id;
    projectContext.addTask(projectContext.currentProject.id, phaseId, taskData);
    // Rafraîchir les tâches
    const allTasks: ProjectTask[] = [];
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        allTasks.push(task);
      });
    });
    setTasks(allTasks);
  };

  // Filtrer les tâches en fonction du projet sélectionné
  // Note: Comme les tâches sont déjà filtrées par projet via le contexte,
  // cette fonctionnalité est moins pertinente mais conservée pour compatibilité future
  const filteredTasks = tasks;

  const getProjectStats = () => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = filteredTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks };
  };

  const stats = getProjectStats();



  // Convertir les tâches ProjectTask en Task pour l'affichage Gantt
  const ganttTasks: Task[] = filteredTasks.map(task => ({
    id: task.id,
    title: task.name, // Mapping name → title
    description: task.description || '',
    status: task.status, // Utilise directement TaskStatus
    priority: 'medium', // Valeur par défaut
    assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo[0] || '' : '', // Prendre le premier assigné si c'est un tableau
    projectId: projectContext?.currentProject?.id || '',
    startDate: task.startDate || new Date().toISOString(),
    dueDate: task.dueDate || new Date().toISOString(), // Toujours une string, valeur par défaut si undefined
    progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
    dependencies: [], // Dependencies not implemented in ProjectTask yet
    estimatedHours: 0, // Valeur par défaut
    actualHours: 0 // Valeur par défaut
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Planning
              </h1>
              <p className="text-gray-600 mt-2">Gérez et visualisez vos tâches de projet</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all duration-200">
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all duration-200">
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-4 py-2 glass-card rounded-lg hover:shadow-md transition-all duration-200">
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
            </div>
          </div>
        </div>

        {/* Stats avec design glassmorphism moderne */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTasks}</div>
            <div className="text-sm text-gray-600 font-medium mb-3">Total tâches</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full transition-all duration-800" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.completedTasks}</div>
            <div className="text-sm text-gray-600 font-medium mb-3">Terminées</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-800" 
                   style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.inProgressTasks}</div>
            <div className="text-sm text-gray-600 font-medium mb-3">En cours</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-800" 
                   style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.overdueTasks}</div>
            <div className="text-sm text-gray-600 font-medium mb-3">En retard</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-800" 
                   style={{ width: `${stats.totalTasks > 0 ? (stats.overdueTasks / stats.totalTasks) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Cartes des phases */}
        {projectContext?.currentProject?.phases && projectContext.currentProject.phases.length > 0 && (
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Phases du projet</h2>
              <button 
                onClick={() => {
                  setPhaseModalMode('create');
                  setEditingPhase(null);
                  setIsPhaseModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Nouvelle Phase
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectContext.currentProject.phases.map((phase) => {
                const phaseTaskCount = phase.tasks?.length || 0;
                const completedTasks = phase.tasks?.filter(task => task.status === 'done').length || 0;
                const progressPercentage = phaseTaskCount > 0 ? Math.round((completedTasks / phaseTaskCount) * 100) : 0;
                
                // Calculer la durée de la phase
                const startDate = new Date(phase.startDate);
                const endDate = new Date(phase.endDate);
                const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={phase.id} className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{phase.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(phase.startDate).toLocaleDateString('fr-FR')} → {new Date(phase.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{durationDays} jour{durationDays > 1 ? 's' : ''}</p>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      title="Éditer la phase"
                      onClick={() => {
                        setEditingPhase(phase);
                        setPhaseModalMode('edit');
                        setIsPhaseModalOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium text-gray-900">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Statistiques des tâches */}
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">{phaseTaskCount}</span> tâche{phaseTaskCount > 1 ? 's' : ''}
                    </div>
                    <div className="text-green-600">
                      <span className="font-medium">{completedTasks}</span> terminée{completedTasks > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Filters and View Controls */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <select
                  className="px-4 py-2 glass-card border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:shadow-md transition-all duration-200"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!projectContext?.projects || projectContext.projects.length <= 1}
                >
                  <option value="all">Tous les projets</option>
                  {projectContext?.projects?.map((project: Project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
          </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center glass-card rounded-lg p-1 gap-1">
                {[
                  { id: 'gantt', label: 'Gantt', icon: Calendar },
                  { id: 'calendar', label: 'Calendrier', icon: Calendar },
                  { id: 'list', label: 'Liste', icon: Filter }
                ].map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => setViewType(view.id as ViewType)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        viewType === view.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {view.label}
                    </button>
                  );
                })}
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => {
                  setPhaseModalMode('create');
                  setEditingPhase(null);
                  setIsPhaseModalOpen(true);
                }}
                type="button"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Tâche
              </button>
            </div>
        </div>
      </div>

        {/* Main Content */}
        {viewType === 'gantt' && (
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Diagramme de Gantt
            </h3>
            <div className="gantt-container bg-white rounded-lg p-4">
          <GanttChart 
            tasks={ganttTasks} 
            onTaskUpdate={(taskId, updates) => {
              // Adapter les mises à jour pour la compatibilité avec ProjectTask
              const projectTaskUpdates: Partial<ProjectTask> = {};
              
              if (updates.title) projectTaskUpdates.name = updates.title;
              if (updates.startDate) projectTaskUpdates.startDate = updates.startDate;
              if (updates.dueDate) projectTaskUpdates.dueDate = updates.dueDate;
              if (updates.progress !== undefined) {
                // Convertir la progression en statut
                if (updates.progress === 100) projectTaskUpdates.status = 'done';
                else if (updates.progress >= 50) projectTaskUpdates.status = 'in_progress';
                else projectTaskUpdates.status = 'todo';
              }
              
              handleTaskUpdate(taskId, projectTaskUpdates);
            }} 
            onTaskCreate={(taskData) => {
              // Adapter la création pour la compatibilité avec ProjectTask
              const projectTaskData: Omit<ProjectTask, 'id' | 'costItems' | 'spent'> = {
                name: taskData.title || 'Nouvelle tâche',
                description: taskData.description || '',
                status: 'todo',
                startDate: taskData.startDate || new Date().toISOString(),
                dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                // projectId n'est pas nécessaire dans ProjectTask
                assignedTo: [] // Tableau vide pour correspondre au type ProjectTask.assignedTo: string[]
              };
              
              handleTaskCreate(projectTaskData);
            }} 
            />
            </div>
          </div>
        )}

        {viewType === 'calendar' && (
          <div className="glass-card p-8 rounded-xl text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vue Calendrier</h3>
            <p className="text-gray-600">La vue calendrier sera disponible prochainement.</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Activer la vue calendrier
              </button>
            </div>
          </div>
        )}

        {viewType === 'list' && (
          <div className="glass-card p-8 rounded-xl text-center">
            <Filter className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vue Liste</h3>
            <p className="text-gray-600">La vue liste sera disponible prochainement.</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Activer la vue liste
              </button>
            </div>
          </div>
        )}

      {/* Phase Modal */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => {
          setIsPhaseModalOpen(false);
          setPhaseModalMode('create');
          setEditingPhase(null);
          setPhaseError('');
        }}
        mode={phaseModalMode}
        initialPhase={editingPhase}
        onSave={(phaseData) => {
          if (!projectContext?.currentProject) return;
          
          try {
            if (phaseModalMode === 'create') {
              projectContext.addPhase(projectContext.currentProject.id, phaseData);
            } else if (phaseModalMode === 'edit' && editingPhase) {
              projectContext.updatePhase(projectContext.currentProject.id, editingPhase.id, phaseData);
            }
            
            setIsPhaseModalOpen(false);
            setPhaseModalMode('create');
            setEditingPhase(null);
            setPhaseError('');
          } catch (error) {
            console.error('Erreur lors de la sauvegarde de la phase:', error);
            setPhaseError('Erreur lors de la sauvegarde de la phase');
          }
        }}
        onDelete={phaseModalMode === 'edit' && editingPhase ? async () => {
          if (!projectContext?.currentProject || !editingPhase) return;
          
          try {
            await projectContext.deletePhase(projectContext.currentProject.id, editingPhase.id);
            setIsPhaseModalOpen(false);
            setPhaseModalMode('create');
            setEditingPhase(null);
            setPhaseError('');
          } catch (error) {
            console.error('Erreur lors de la suppression de la phase:', error);
            setPhaseError('Erreur lors de la suppression de la phase');
          }
        } : undefined}
      />
      </div>
    </div>
  );
};

export default Planning;
import React, { useState, useContext, useEffect } from 'react';
import { Calendar, Filter, Download, Share2, Settings, Pencil } from 'lucide-react';
import ProjectContext from '../../contexts/ProjectContext';
import { ProjectTask, Project, ProjectPhase } from '../../contexts/projectTypes';
import GanttChart from './GanttChart';
import { Task } from '../../types';
import PhaseModal from './PhaseModal';

const Planning: React.FC = () => {
  const projectContext = useContext(ProjectContext);
  type ViewType = 'gantt' | 'calendar' | 'list';
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [phaseError, setPhaseError] = useState('');

  useEffect(() => {
    // Vérifier si le contexte est défini
    if (!projectContext) {
      return;
    }
    if (projectContext?.currentProject) {
      const allTasks: ProjectTask[] = [];
      
      // Parcourir toutes les phases du projet
      projectContext.currentProject.phases.forEach(phase => {
        if (phase.tasks) {
          phase.tasks.forEach(task => {
            allTasks.push(task);
          });
        }
      });
      
      setTasks(allTasks);
    }
  }, [projectContext, projectContext?.currentProject]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
          <p className="text-gray-600 mt-1">Gérez et visualisez vos tâches de projet</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Partager
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
          <div className="text-sm text-gray-600">Total tâches</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
          <div className="text-sm text-gray-600">Terminées</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
          <div className="text-sm text-gray-600">En retard</div>
        </div>
      </div>

      {/* Cartes des phases */}
      {projectContext?.currentProject?.phases && projectContext.currentProject.phases.length > 0 && (
        <div className="mt-6">
          <div className="text-lg font-semibold mb-4">Phases du projet</div>
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
                <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-2">
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
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewType === view.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
            <button
              className="ml-2 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              onClick={() => {
                setPhaseModalMode('create');
                setEditingPhase(null);
                setIsPhaseModalOpen(true);
              }}
              type="button"
            >
              + Nouvelle phase
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewType === 'gantt' && (
        <div className="gantt-container">
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
      )}

      {viewType === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vue Calendrier</h3>
          <p className="text-gray-600">La vue calendrier sera disponible prochainement.</p>
        </div>
      )}

      {viewType === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vue Liste</h3>
          <p className="text-gray-600">La vue liste sera disponible prochainement.</p>
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
  );
};

export default Planning;
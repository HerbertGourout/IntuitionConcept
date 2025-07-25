import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, CheckCircle, Clock, AlertTriangle, Users, Calendar, Target, BarChart3, Filter, Grid3X3 } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask } from '../../contexts/projectTypes';
import { TaskService, Task } from '../../services/taskService';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const Tasks: React.FC = () => {
  const projectContext = useProjectContext();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const project = projectContext?.currentProject;
  const phases = useMemo(() => project?.phases || [], [project?.phases]);
  const selectedPhase = phases.find(phase => phase.id === selectedPhaseId);
  
  // Fonction pour charger les tâches depuis les phases du projet
  const loadTasksFromProject = useCallback(() => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des tâches depuis les phases du projet...');
      
      if (!project || !project.phases) {
        console.log('⚠️ Aucun projet ou phases disponibles');
        setTasks([]);
        return;
      }

      // Extraire toutes les tâches de toutes les phases et les convertir au format Task
      const allProjectTasks: Task[] = project.phases.flatMap(phase => 
        (phase.tasks || []).map(task => ({
          id: task.id,
          name: task.name || 'Tâche sans nom',
          description: task.description || '',
          status: task.status === 'planned' || task.status === 'on_hold' || task.status === 'cancelled' 
            ? 'todo' as const 
            : task.status as 'todo' | 'in_progress' | 'done',
          priority: task.priority === 'urgent' ? 'high' as const : task.priority as 'low' | 'medium' | 'high',
          assignedTo: task.assignedTo || [],
          dueDate: task.endDate ? (typeof task.endDate === 'string' ? new Date(task.endDate) : new Date(task.endDate)) : undefined,
          startDate: task.startDate ? (typeof task.startDate === 'string' ? new Date(task.startDate) : new Date(task.startDate)) : undefined,
          estimatedHours: task.budget ? Math.round(task.budget / 50) : undefined,
          actualHours: 0,
          tags: [],
          dependencies: task.dependencies || [],
          phaseId: phase.id,
          projectId: project.id,
          subtasks: [],
          attachments: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      console.log('✅ Tâches chargées depuis le projet:', {
        count: allProjectTasks.length,
        tasks: allProjectTasks.map(t => ({ 
          id: t.id, 
          name: t.name, 
          phaseId: t.phaseId, 
          projectId: t.projectId, 
          status: t.status 
        }))
      });
      
      setTasks(allProjectTasks);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des tâches depuis le projet:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [project]);

  // Filtrer les tâches par phase sélectionnée
  const phaseTasks = tasks.filter(task => {
    const matches = task.phaseId === selectedPhaseId;
    if (!matches) {
      console.log('Tâche filtrée:', {
        taskName: task.name,
        taskPhaseId: task.phaseId,
        selectedPhaseId,
        taskProjectId: task.projectId,
        currentProjectId: project?.id
      });
    }
    return matches;
  });
  
  console.log('📋 Tâches pour la phase sélectionnée:', {
    selectedPhaseId,
    totalTasks: tasks.length,
    phaseTasks: phaseTasks.length,
    phaseTasksDetails: phaseTasks.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status
    }))
  });

  // Convertir Task[] vers ProjectTask[] pour le TaskModal
  const convertTaskToProjectTask = (task: Task): ProjectTask => {
    return {
      id: task.id,
      name: task.name || 'Tâche sans nom',
      description: task.description || '',
      status: task.status,
      assignedTo: typeof task.assignedTo === 'string'
        ? [task.assignedTo]
        : Array.isArray(task.assignedTo)
          ? task.assignedTo
          : [],
      endDate: task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString()) : undefined,
      startDate: task.startDate ? (typeof task.startDate === 'string' ? task.startDate : task.startDate.toISOString()) : undefined,
      priority: task.priority === 'urgent' ? 'urgent' : task.priority as 'low' | 'medium' | 'high',
      budget: task.estimatedHours ? task.estimatedHours * 50 : undefined,
      spent: 0
    };
  };

  // Charger les tâches depuis les phases du projet
  useEffect(() => {
    loadTasksFromProject();
  }, [loadTasksFromProject]);

  // Sélectionner automatiquement la première phase si aucune n'est sélectionnée
  useEffect(() => {
    if (phases.length > 0 && !selectedPhaseId) {
      setSelectedPhaseId(phases[0].id);
    }
  }, [phases, selectedPhaseId]);

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    const projectTask = convertTaskToProjectTask(task);
    setCurrentTask(projectTask);
    setIsModalVisible(true);
  };

  const handleSaveTask = async (taskData: Partial<ProjectTask>) => {
    if (!selectedPhase || !project) return;

    try {
      if (currentTask) {
        // Édition - Convertir ProjectTask vers Task
        const taskForUpdate: Partial<Task> = {
          name: taskData.name,
          description: taskData.description,
          status: taskData.status as 'todo' | 'in_progress' | 'done',
          priority: taskData.priority as 'low' | 'medium' | 'high' | 'urgent',
          assignedTo: taskData.assignedTo || [],
          dueDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
          startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
          estimatedHours: taskData.budget ? Math.round(taskData.budget / 50) : undefined
        };
        await TaskService.updateTask(currentTask.id, taskForUpdate);
        console.log('Tâche mise à jour avec succès');
      } else {
        // Création - Convertir ProjectTask vers Task
        const newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
          name: taskData.name || 'Nouvelle tâche',
          description: taskData.description || '',
          phaseId: selectedPhase.id,
          projectId: project.id,
          status: taskData.status === 'done' ? 'done' : (taskData.status as 'todo' | 'in_progress' | 'done') || 'todo',
          priority: (taskData.priority === 'urgent' ? 'high' : taskData.priority) as 'low' | 'medium' | 'high' || 'medium',
          assignedTo: taskData.assignedTo || [],
          dueDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
          startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
          estimatedHours: taskData.budget ? Math.round(taskData.budget / 50) : undefined,
          actualHours: 0,
          tags: [],
          dependencies: [],
          subtasks: [],
          attachments: [],
          comments: []
        };
        
        await TaskService.addTask(newTaskData);
        console.log('Tâche créée avec succès');
      }
      
      // Recharger les tâches après sauvegarde pour mettre à jour l'affichage
      loadTasksFromProject();
      
      setIsModalVisible(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      console.log('Tâche supprimée avec succès');
      loadTasksFromProject();
      setIsModalVisible(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusColor = (status: Task['status']): string => {
    switch (status) {
      case 'done': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200';
      case 'todo': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'todo': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: Task['status']): string => {
    switch (status) {
      case 'done': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'Non commencée';
      default: return 'Inconnue';
    }
  };

  const renderTaskCard = (task: Task, index: number) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0;

    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="glass-card rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20"
          >
            {/* En-tête de la tâche */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {getStatusLabel(task.status)}
                  </span>
                  {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      <Users className="w-3 h-3" />
                      {task.assignedTo.join(', ')}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{task.name}</h4>
                {task.description && (
                  <p className="text-gray-600 mb-3">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {hasSubtasks && (
                  <button
                    onClick={() => toggleTaskExpansion(task.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => handleEditTask(task)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedPhase || !project) return;
    // Logique de drag and drop ici si nécessaire
  };

  if (!projectContext || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet sélectionné</h3>
          <p className="text-gray-600">Veuillez sélectionner un projet pour voir les tâches.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Tâches - {selectedPhase?.name || 'Aucune phase sélectionnée'}
              </h2>
              <p className="text-gray-600 text-sm">
                Organisez et suivez l'avancement de vos tâches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Tâche
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{phaseTasks.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{phaseTasks.filter(t => t.status === 'done').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-blue-600">{phaseTasks.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">À Faire</p>
              <p className="text-2xl font-bold text-gray-600">{phaseTasks.filter(t => t.status === 'todo').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur de phase */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtrer par phase</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhaseId(phase.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedPhaseId === phase.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200'
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="glass-card rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <Grid3X3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Tâches de la phase ({phaseTasks.length})
          </h3>
        </div>

        {phaseTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white inline-flex mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche dans cette phase</h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer une nouvelle tâche pour organiser votre travail.
            </p>
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              Créer une tâche
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {phaseTasks.map((task, index) => renderTaskCard(task, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Modal de tâche */}
      {isModalVisible && (
        <TaskModal
          isOpen={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setCurrentTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          task={currentTask}
          teamMembers={[]}
        />
      )}
    </div>
  );
};

export default Tasks;

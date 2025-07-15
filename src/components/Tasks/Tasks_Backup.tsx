import React, { useState, useEffect } from 'react';
import ProjectAccessGuard from '../Projects/ProjectAccessGuard';
import { ChevronDown, ChevronUp, Plus, CheckCircle, Clock, AlertTriangle, Users, Calendar, Target, BarChart3, Filter, Grid3X3, Settings } from 'lucide-react';
import { ProjectTask, TaskStatus } from '../../contexts/projectTypes';
import { useProjectContext } from '../../contexts/ProjectContext';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { message } from 'antd';

const Tasks: React.FC = () => {
  const projectContext = useProjectContext();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const project = projectContext?.currentProject;
  const phases = project?.phases || [];
  const selectedPhase = phases.find(phase => phase.id === selectedPhaseId);

  // Sélectionner automatiquement la première phase si aucune n'est sélectionnée
  React.useEffect(() => {
    if (phases.length > 0 && !selectedPhaseId) {
      setSelectedPhaseId(phases[0].id);
    }
  }, [phases, selectedPhaseId]);

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalVisible(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setCurrentTask(task);
    setIsModalVisible(true);
  };

  const handleSaveTask = async (taskData: Partial<ProjectTask>) => {
    if (!selectedPhase || !project) return;

    try {
      if (currentTask) {
        // Édition
        await projectContext?.updateTask(project.id, selectedPhase.id, currentTask.id, taskData);
        message.success('Tâche mise à jour avec succès');
      } else {
        // Création
        await projectContext?.addTask(project.id, selectedPhase.id, taskData as Omit<ProjectTask, 'id'>);
        message.success('Tâche créée avec succès');
      }
      setIsModalVisible(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      message.error('Erreur lors de la sauvegarde de la tâche');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedPhase || !project) return;

    try {
      await projectContext?.deleteTask(project.id, selectedPhase.id, taskId);
      message.success('Tâche supprimée avec succès');
      setIsModalVisible(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      message.error('Erreur lors de la suppression de la tâche');
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

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'done': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200';
      case 'todo': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'todo': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case 'done': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'Non commencée';
      default: return 'Inconnue';
    }
  };

  const renderTaskCard = (task: ProjectTask, index: number) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

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
                  {task.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.name}</h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                )}
              </div>
            </div>

            {/* Informations de la tâche */}
            <div className="flex flex-wrap gap-3 mb-4">
              {task.assignedTo && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">{task.assignedTo}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">
                    {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>

            {/* Actions et expansion */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
              
              {hasSubtasks && (
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-lg hover:from-gray-200 hover:to-slate-200 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium border border-gray-200"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {isExpanded ? 'Masquer' : 'Voir'} les sous-tâches ({task.subtasks?.length || 0})
                </button>
              )}
            </div>

            {/* Sous-tâches */}
            {hasSubtasks && isExpanded && (
              <div className="mt-6 pl-4 border-l-2 border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Sous-tâches</h4>
                <div className="space-y-3">
                  {task.subtasks?.map((subtask, subIndex) => (
                    <div key={subtask.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                              {getStatusIcon(subtask.status)}
                              {getStatusLabel(subtask.status)}
                            </span>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-1">{subtask.name}</h5>
                          {subtask.description && (
                            <p className="text-gray-600 text-sm">{subtask.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const renderTaskWithSubtasks = (task: ProjectTask, depth: number, index: number) => {
    return renderTaskCard(task, index);
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case 'done': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'Non commencée';
      default: return 'Inconnue';
    }
  };
  
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-4 transition-all duration-300"
        >
          <div className="glass-card rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-move p-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
                  >
                    <Grid3X3 className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{task.name}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-200/50">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">{task.assignedTo.join(', ')}</span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-2 bg-orange-50/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-200/50">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-700 font-medium">{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    title="Éditer la tâche"
                    onClick={e => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    title="Supprimer la tâche"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(task.id, parentTask);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {showDetails && task.description && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-gray-800 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={toggleDetails}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-blue-700 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200 font-medium"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Moins de détails
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Plus de détails
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const Tasks: React.FC = () => {
  const projectContext = useProjectContext();
  const phases = projectContext?.currentProject?.phases || [];
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phases[0]?.id || '');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [parentTask, setParentTask] = useState<ProjectTask | null>(null);

  // Mettre à jour selectedPhaseId si phases changent
  React.useEffect(() => {
    if (phases.length && !phases.find(ph => ph.id === selectedPhaseId)) {
      setSelectedPhaseId(phases[0].id);
    }
  }, [phases, selectedPhaseId]);

  const selectedPhase = phases.find(ph => ph.id === selectedPhaseId);

  // Créer une nouvelle tâche
  const handleCreateTask = () => {
    if (!phases.length) {
      message.warning("Veuillez d'abord créer une phase avant d'ajouter une tâche.");
      return;
    }
    setCurrentTask(null);
    setParentTask(null);
    setIsModalVisible(true);
  };

  // Créer une nouvelle sous-tâche
  const handleCreateSubTask = (parent: ProjectTask) => {
    setCurrentTask(null);
    setParentTask(parent);
    setIsModalVisible(true);
  };

  // Éditer une tâche
  const handleEditTask = (task: ProjectTask) => {
    setCurrentTask(task);
    setParentTask(null);
    setIsModalVisible(true);
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: string) => {
    if (!projectContext || !projectContext.currentProject || !selectedPhase) return;
    try {
      if (parentTask) {
        await projectContext.removeSubTask(
          projectContext.currentProject.id,
          selectedPhase.id,
          taskId
        );
      } else {
        await projectContext.removeTask(
          projectContext.currentProject.id,
          selectedPhase.id,
          taskId
        );
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  // Sauvegarder une tâche
  const handleSaveTask = async (taskData: Partial<ProjectTask>) => {
    if (!projectContext || !projectContext.currentProject || !selectedPhase) return;
    try {
      if (parentTask) {
        // Création d'une sous-tâche
        await projectContext.addSubTask(
          projectContext.currentProject.id,
          selectedPhase.id,
          parentTask.id,
          {
            name: taskData.name || '',
            description: taskData.description || '',
            status: (taskData.status as TaskStatus) || 'todo',
            assignedTo: taskData.assignedTo || [],
            dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
            startDate: taskData.startDate || '',
            endDate: taskData.endDate || '',
            budget: taskData.budget || 0,
            spent: typeof taskData.spent === 'number' ? taskData.spent : 0,
            priority: (taskData.priority as any) || 'medium',
            dependencies: taskData.dependencies || [],
            costItems: taskData.costItems || [],
          }
        );
      } else if (currentTask) {
        // Édition d'une tâche existante
        await projectContext.updateTask(
          projectContext.currentProject.id,
          selectedPhase.id,
          currentTask.id,
          taskData
        );
      } else {
        // Création d'une nouvelle tâche principale
        await projectContext.addTask(
          projectContext.currentProject.id,
          selectedPhase.id,
          {
            name: taskData.name || '',
            description: taskData.description || '',
            status: (taskData.status as TaskStatus) || 'todo',
            assignedTo: taskData.assignedTo || [],
            dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
            startDate: taskData.startDate || '',
            endDate: taskData.endDate || '',
            budget: taskData.budget || 0,
            spent: typeof taskData.spent === 'number' ? taskData.spent : 0,
            priority: (taskData.priority as any) || 'medium',
            dependencies: taskData.dependencies || [],
            costItems: taskData.costItems || [],
          }
        );
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
    }
  };

  // Sélecteur d'onglets pour les phases
  const renderPhaseTabs = () => (
    <div className="glass-card rounded-2xl p-2">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phases du Projet</h3>
      </div>
      <div className="flex gap-2 flex-wrap">
        {phases.map(phase => {
          const isSelected = selectedPhaseId === phase.id;
          const taskCount = phase.tasks?.length || 0;
          return (
            <button
              key={phase.id}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200/50 hover:border-blue-300/50'
              }`}
              onClick={() => setSelectedPhaseId(phase.id)}
            >
              <div className="flex items-center gap-2">
                <span>{phase.name}</span>
                {taskCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {taskCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Fonction pour rendre une tâche avec ses sous-tâches de manière récursive
  const renderTaskWithSubtasks = (task: ProjectTask, depth: number, index: number): React.ReactNode => {
    return (
      <div key={task.id} style={{ marginLeft: `${depth * 20}px` }}>
        <Draggable draggableId={task.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{task.name}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'done' ? 'Terminé' :
                       task.status === 'in_progress' ? 'En cours' : 'À faire'}
                    </span>
                    {task.dueDate && <span>Echéance: {task.dueDate}</span>}
                    {task.budget && task.budget > 0 && <span>Budget: {task.budget}€</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateSubTask(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Sous-tâche
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Éditer
                  </button>
                </div>
              </div>
            </div>
          )}
        </Draggable>
        
        {/* Sous-tâches */}
        {task.subtasks && task.subtasks.length > 0 && (
          <Droppable droppableId={`subtasks-${task.id}`} type="SUBTASK">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="ml-4 space-y-2"
              >
                {task.subtasks?.map((subtask, subIndex) => 
                  renderTaskWithSubtasks(subtask, depth + 1, subIndex)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    );
  };

  if (!projectContext?.currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun projet sélectionné</h2>
            <p className="text-gray-600">Veuillez sélectionner un projet pour gérer les tâches.</p>
          </div>
        </div>
      </div>
    );
  }
  if (!phases.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucune phase créée</h2>
            <p className="text-gray-600 mb-6">Créez des phases dans la planification pour organiser vos tâches.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <Plus className="w-5 h-5" />
              Créer une phase
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProjectAccessGuard project={projectContext.currentProject}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
                  <p className="text-gray-600 mt-1">Organisez et suivez l'avancement de vos tâches</p>
                </div>
              </div>
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Tâche
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPhase?.tasks?.length || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Tâches</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-800"
                  style={{ width: selectedPhase?.tasks?.length ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPhase?.tasks?.filter(task => task.status === 'done').length || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Terminées</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-800"
                  style={{ 
                    width: selectedPhase?.tasks?.length 
                      ? `${((selectedPhase.tasks.filter(task => task.status === 'done').length / selectedPhase.tasks.length) * 100)}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPhase?.tasks?.filter(task => task.status === 'in_progress').length || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">En Cours</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-800"
                  style={{ 
                    width: selectedPhase?.tasks?.length 
                      ? `${((selectedPhase.tasks.filter(task => task.status === 'in_progress').length / selectedPhase.tasks.length) * 100)}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPhase?.tasks?.filter(task => task.status === 'todo').length || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">À Faire</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-800"
                  style={{ 
                    width: selectedPhase?.tasks?.length 
                      ? `${((selectedPhase.tasks.filter(task => task.status === 'todo').length / selectedPhase.tasks.length) * 100)}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

        {renderPhaseTabs()}
        
        {/* Liste des tâches principales de la phase sélectionnée */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Tâches - {selectedPhase?.name}
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedPhase?.tasks?.length || 0} tâche{(selectedPhase?.tasks?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          
          {selectedPhase?.tasks && selectedPhase.tasks.length > 0 ? (
            <DragDropContext
              onDragEnd={async (result) => {
                const { destination, source, draggableId } = result;
                if (!destination || destination.index === source.index) return;
                if (!selectedPhase || !projectContext?.currentProject) return;
                try {
                  // Drag & drop sur tâches principales
                  if (source.droppableId === "main-tasks" && destination.droppableId === "main-tasks") {
                    await projectContext.reorderTasks(
                      projectContext.currentProject.id,
                      selectedPhase.id,
                      draggableId,
                      destination.index
                    );
                  } else if (
                    source.droppableId.startsWith("subtasks-") &&
                    destination.droppableId.startsWith("subtasks-") &&
                    source.droppableId === destination.droppableId
                  ) {
                    // Drag & drop sur sous-tâches du même parent
                    const parentTaskId = source.droppableId.replace("subtasks-", "");
                    await projectContext.reorderSubTasks(
                      projectContext.currentProject.id,
                      selectedPhase.id,
                      parentTaskId,
                      draggableId,
                      destination.index
                    );
                  }
                  // (Optionnel) : gestion du drag cross-parent à ajouter si besoin
                } catch (error) {
                  console.error('Erreur lors du déplacement de la tâche/sous-tâche :', error);
                }
              }}
            >
              <Droppable droppableId="main-tasks" type="TASK">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {selectedPhase.tasks.map((task, index) => (
                      <React.Fragment key={task.id}>
                        {renderTaskWithSubtasks(task, 0, index)}
                      </React.Fragment>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune tâche dans cette phase</h3>
              <p className="text-gray-600 mb-6">Commencez par créer votre première tâche pour organiser votre travail.</p>
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Créer une tâche
              </button>
            </div>
          )}
        </div>

        {/* Modal pour créer/éditer une tâche */}
        <TaskModal
          isOpen={isModalVisible}
          task={currentTask}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveTask}
          onDelete={currentTask ? handleDeleteTask : undefined}
          teamMembers={(projectContext?.currentProject?.team || []).map(email => ({ id: email, name: email }))}
          allTasks={selectedPhase?.tasks || []}
        />
        </div>
      </div>
    </ProjectAccessGuard>
  );
}

export default Tasks;

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
                  {task.assignedTo && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      <Users className="w-3 h-3" />
                      {task.assignedTo}
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

            {/* Sous-tâches */}
            {hasSubtasks && isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Sous-tâches ({task.subtasks?.length})</h5>
                <div className="space-y-3 pl-4 border-l-2 border-blue-200">
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

  const onDragEnd = (result: any) => {
    if (!result.destination || !selectedPhase || !project) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Réorganiser les tâches
    const tasks = Array.from(selectedPhase.tasks || []);
    const [reorderedTask] = tasks.splice(sourceIndex, 1);
    tasks.splice(destinationIndex, 0, reorderedTask);

    // Mettre à jour le contexte
    projectContext?.updatePhase(project.id, selectedPhase.id, {
      ...selectedPhase,
      tasks
    });
  };

  // Vérifier si un projet est sélectionné
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun projet sélectionné</h2>
            <p className="text-gray-600 mb-6">Sélectionnez un projet pour gérer ses tâches.</p>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier s'il y a des phases
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

          {/* Sélecteur de phases */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Phases du Projet</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {phases.map(phase => {
                const taskCount = phase.tasks?.length || 0;
                const isSelected = selectedPhaseId === phase.id;
                return (
                  <button
                    key={phase.id}
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                        : 'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/30 hover:bg-white/90 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPhaseId(phase.id)}
                  >
                    {phase.name}
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {taskCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Liste des tâches */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Grid3X3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Tâches - {selectedPhase?.name}
              </h2>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {selectedPhase?.tasks?.length || 0} tâche{(selectedPhase?.tasks?.length || 0) > 1 ? 's' : ''}
              </span>
            </div>

            {selectedPhase?.tasks && selectedPhase.tasks.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {selectedPhase.tasks.map((task, index) => 
                        renderTaskCard(task, index)
                      )}
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
};

export default Tasks;

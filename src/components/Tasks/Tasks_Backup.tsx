import React, { useState } from 'react';
import ProjectAccessGuard from '../Projects/ProjectAccessGuard';
import { ChevronDown, ChevronUp, Plus, CheckCircle, Clock, AlertTriangle, Users, Calendar, Target, BarChart3, Filter, Grid3X3, Settings } from 'lucide-react';
import { ProjectTask, TaskStatus } from '../../contexts/projectTypes';
import { useProjectContext } from '../../contexts/ProjectContext';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { message } from 'antd';

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
                    {task.budget && task.budget > 0 && <span>Budget: {task.budget} FCFA</span>}
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
        {task.subTasks && task.subTasks.length > 0 && (
          <Droppable droppableId={`subtasks-${task.id}`} type="SUBTASK">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="ml-4 space-y-2"
              >
                {task.subTasks?.map((subtask, subIndex) => 
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

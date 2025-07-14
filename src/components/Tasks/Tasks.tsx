import React, { useState } from 'react';
import ProjectAccessGuard from '../Projects/ProjectAccessGuard';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { ProjectTask, TaskStatus } from '../../contexts/projectTypes';
import { useProjectContext } from '../../contexts/ProjectContext';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Composant pour afficher une tâche simple
const SimpleTaskCard: React.FC<{
  task: ProjectTask;
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string, parentTask?: ProjectTask | null) => void;
  index: number;
  parentTask?: ProjectTask | null;
}> = ({ task, onEdit, onDelete, index, parentTask }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-move p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <span>Assigné à: {task.assignedTo.join(', ')}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="text-sm text-gray-500 mt-1">
                        Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Éditer la tâche"
                    onClick={e => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer la tâche"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(task.id, parentTask);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {showDetails && task.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700">{task.description}</p>
                </div>
              )}
              
              <div className="mt-2 flex justify-end">
                <button
                  onClick={toggleDetails}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Moins de détails
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
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
    <div className="flex gap-2 mb-6">
      {phases.map(phase => (
        <button
          key={phase.id}
          className={`px-4 py-2 rounded-t ${
            selectedPhaseId === phase.id 
              ? 'bg-blue-600 text-white font-semibold' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setSelectedPhaseId(phase.id)}
        >
          {phase.name}
        </button>
      ))}
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
    return <div className="p-8 text-center text-gray-600">Aucun projet sélectionné.</div>;
  }
  if (!phases.length) {
    return <div className="p-8 text-center text-gray-600">Aucune phase n'a été créée pour ce projet.</div>;
  }

  return (
    <ProjectAccessGuard project={projectContext.currentProject}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
            <button
              onClick={handleCreateTask}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Nouvelle tâche</span>
            </button>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            Nouvelle Tâche
          </Button>
        </div>
        {renderPhaseTabs()}
        {/* Liste des tâches principales de la phase sélectionnée */}
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
        {selectedPhase?.tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            {renderTaskWithSubtasks(task, 0, index)}
          </React.Fragment>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>

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
    </ProjectAccessGuard>
  );
}

export default Tasks;

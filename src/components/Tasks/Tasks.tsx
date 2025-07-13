import React, { useState } from 'react';
import ProjectAccessGuard from '../Projects/ProjectAccessGuard';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { ProjectTask, TaskStatus } from '../../contexts/projectTypes';
import { useProjectContext } from '../../contexts/ProjectContext';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Composant pour afficher une tâche simple
const SimpleTaskCard: React.FC<{
  task: ProjectTask;
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  index: number;
}> = ({ task, onEdit, onDelete, index }) => {
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
                      if (window.confirm('Supprimer cette tâche ?')) {
                        onDelete(task.id);
                      }
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
  // Récupérer le contexte du projet
  const projectContext = useProjectContext();

  // États pour la gestion du modal et de la tâche courante
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Créer une nouvelle tâche
  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalVisible(true);
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: string) => {
    if (!projectContext || !projectContext.currentProject) return;

    try {
      // Pour l'instant, on simule la suppression en fermant le modal
      // TODO: Implémenter la vraie suppression quand la méthode sera disponible
      console.log('Suppression de la tâche:', taskId);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  // Sauvegarder une tâche (création ou édition)
  const handleSaveTask = async (
    taskData: Partial<ProjectTask>
  ) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    try {
      const phases = projectContext.currentProject.phases || [];
      if (phases.length === 0) return;
      
      const phaseId = phases[0].id;
      
      if (taskData.id) {
        // Mise à jour d'une tâche existante
        await projectContext.updateTask(
          projectContext.currentProject.id,
          phaseId,
          taskData.id,
          taskData
        );
      } else {
        // Création d'une nouvelle tâche
        await projectContext.addTask(
          projectContext.currentProject.id,
          phaseId,
          {
            id: `task-${Date.now()}`,
            name: taskData.name || '',
            description: taskData.description || '',
            status: (taskData.status as TaskStatus) || 'todo',
            assignedTo: taskData.assignedTo || [],
            dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
            subtasks: [],
            ...taskData
          }
        );
      }
      
      setIsModalVisible(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
    }
  };

  if (!projectContext?.currentProject) {
    return <div className="p-8 text-center text-gray-600">Aucun projet sélectionné.</div>;
  }

  return (
    <ProjectAccessGuard project={projectContext.currentProject}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Tâches</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            Nouvelle Tâche
          </Button>
        </div>

        {/* Liste des tâches principales */}
        <DragDropContext onDragEnd={() => { /* TODO: gérer le déplacement si besoin */ }}>
          <Droppable droppableId="main-tasks">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {projectContext?.currentProject?.phases?.[0]?.tasks?.map((task: ProjectTask, index: number) => (
                  <SimpleTaskCard
                    key={task.id}
                    task={task}
                    onEdit={(task: ProjectTask) => { setCurrentTask(task); setIsModalVisible(true); }}
                    onDelete={handleDeleteTask}
                    index={index}
                  />
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
          teamMembers={[]} // Tableau vide pour satisfaire l'interface
          allTasks={projectContext?.currentProject?.phases?.[0]?.tasks || []}
        />
      </div>
    </ProjectAccessGuard>
  );
};

export default Tasks;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, CheckCircle, Clock, AlertTriangle, Users, Calendar, Target, Filter, Grid3X3, DollarSign, TrendingUp } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask } from '../../contexts/projectTypes';
import TeamService from '../../services/teamService';
import { TeamMember } from '../../types/team';
import { transactionService } from '../../services/transactionService';
import TaskModal from './TaskModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Badge, { statusToBadge } from '../UI/Badge';
import ProgressBar from '../UI/ProgressBar';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';

const Tasks: React.FC = () => {
  const projectContext = useProjectContext();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [taskExpenses, setTaskExpenses] = useState<Record<string, { totalSpent: number; transactionCount: number }>>({});

  const project = projectContext?.currentProject;
  const phases = useMemo(() => project?.phases || [], [project?.phases]);
  const selectedPhase = phases.find(phase => phase.id === selectedPhaseId);

  // Fonction pour formater les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };
  
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

      // Extraire toutes les tâches de toutes les phases directement au format ProjectTask
      const allProjectTasks: ProjectTask[] = project.phases.flatMap(phase => 
        (phase.tasks || []).map(task => ({
          ...task,
          phaseId: phase.id
        }))
      );

      console.log('✅ Tâches chargées depuis le projet:', {
        count: allProjectTasks.length,
        tasks: allProjectTasks.map(t => ({ 
          id: t.id, 
          name: t.name, 
          phaseId: t.phaseId, 
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

  // Charger les membres d'équipe (scopés par projet)
  const loadTeamMembers = useCallback(async () => {
    try {
      if (!project?.id) {
        setTeamMembers([]);
        return;
      }
      const members = await TeamService.getMembersByProject(project.id);
      const unique = members.filter((m, i, self) => i === self.findIndex(x => x.id === m.id || x.email === m.email));
      setTeamMembers(unique);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des membres d\'équipe:', error);
      setTeamMembers([]);
    }
  }, [project?.id]);

  // Fonction utilitaire robuste pour convertir les IDs en noms
  const getTeamMemberNames = (memberIds: string[] = [], members: TeamMember[] = []): string => {
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return 'Non assigné';
    }
    
    const names = memberIds.map(id => {
      // Essayer d'abord avec les membres Firebase
      const member = members.find(m => m.id === id);
      if (member) {
        return member.name;
      }
      
      // Essayer avec les membres du projet (project.team)
      if (project?.team && Array.isArray(project.team)) {
        const projectMemberIndex = project.team.findIndex((_, index) => `member-${index}` === id);
        if (projectMemberIndex !== -1) {
          return project.team[projectMemberIndex];
        }
      }
      
      // Essayer de matcher par nom si l'ID est un nom
      if (project?.team && Array.isArray(project.team)) {
        const matchingName = project.team.find(name => name === id);
        if (matchingName) {
          return matchingName;
        }
      }
      
      // Fallback avec noms génériques basés sur l'index
      const memberIndex = memberIds.indexOf(id);
      const fallbackNames = ['Chef de projet', 'Responsable technique', 'Développeur', 'Designer', 'Testeur'];
      if (memberIndex < fallbackNames.length) {
        return fallbackNames[memberIndex];
      }
      
      // Dernier recours : afficher un nom court au lieu de l'ID complet
      return id.length > 10 ? `Membre ${id.substring(0, 8)}...` : `Membre ${id}`;
    });
    
    return names.join(', ');
  };

  // Charger les tâches quand le projet ou ses phases changent
  useEffect(() => {
    if (project) {
      console.log('🔄 Projet changé, rechargement des tâches...');
      loadTasksFromProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.phases]); // Dépendre uniquement de project.phases pour détecter les changements de tâches

  // Charger les membres d'équipe quand le projet change
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Charger les dépenses réelles des tâches depuis Firebase
  useEffect(() => {
    const loadTaskExpenses = async () => {
      if (!project?.id || tasks.length === 0) return;

      try {
        const expensesMap: Record<string, { totalSpent: number; transactionCount: number }> = {};
        
        for (const task of tasks) {
          const expenses = await transactionService.calculateTaskExpenses(project.id, task.id);
          expensesMap[task.id] = {
            totalSpent: expenses.totalSpent,
            transactionCount: expenses.transactionCount
          };
        }
        
        setTaskExpenses(expensesMap);
      } catch (error) {
        console.error('Erreur lors du chargement des dépenses des tâches:', error);
      }
    };

    loadTaskExpenses();
  }, [project?.id, tasks]);

  // Filtrer les tâches par phase sélectionnée
  const phaseTasks = tasks.filter(task => {
    const matches = task.phaseId === selectedPhaseId;
    if (!matches) {
      console.log('Tâche filtrée:', {
        taskName: task.name,
        taskPhaseId: task.phaseId,
        selectedPhaseId,

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

  // Fonction pour éditer une tâche
  const handleEditTask = (task: ProjectTask) => {
    setCurrentTask(task);
    setIsModalVisible(true);
  };

  // Charger les tâches au montage et quand le projet change
  useEffect(() => {
    loadTasksFromProject();
  }, [loadTasksFromProject]);

  // Charger les membres d'équipe au montage
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

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

  const handleSaveTask = async (taskData: Partial<ProjectTask>) => {
    if (!selectedPhase || !project) {
      console.error('❌ Impossible de sauvegarder: phase ou projet manquant', { selectedPhase, project });
      return;
    }

    console.log('💾 Début sauvegarde tâche:', {
      currentTask: currentTask?.id,
      taskData: {
        name: taskData.name,
        status: taskData.status,
        priority: taskData.priority
      },
      projectId: project.id,
      phaseId: selectedPhase.id
    });

    try {
      if (currentTask) {
        // Édition - Utiliser ProjectContext pour mettre à jour la tâche
        console.log('🔄 Mise à jour tâche existante:', currentTask.id);
        await projectContext.updateTask(project.id, selectedPhase.id, currentTask.id, {
          name: taskData.name || '',
          description: taskData.description || '',
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          assignedTo: taskData.assignedTo || [],
          startDate: taskData.startDate || '',
          endDate: taskData.endDate || '',
          budget: taskData.budget || 0,
          spent: taskData.spent || 0,
          dependencies: taskData.dependencies || [],
          costItems: taskData.costItems || [],
          precision: taskData.precision
        });
        console.log('✅ Tâche mise à jour avec succès');
      } else {
        // Création - Utiliser ProjectContext pour ajouter la tâche
        console.log('➕ Création nouvelle tâche');
        const newTaskData = {
          name: taskData.name || 'Nouvelle tâche',
          description: taskData.description || '',
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          assignedTo: taskData.assignedTo || [],
          startDate: taskData.startDate || '',
          endDate: taskData.endDate || '',
          budget: taskData.budget || 0,
          spent: taskData.spent || 0,
          phaseId: selectedPhase.id,
          dependencies: taskData.dependencies || [],
          costItems: taskData.costItems || [],
          precision: taskData.precision || 3,
          subTasks: []
        };
        console.log('📝 Données nouvelle tâche:', newTaskData);
        
        await projectContext.addTask(project.id, selectedPhase.id, newTaskData);
        console.log('✅ Tâche créée avec succès');
      }
      
      // Fermer le modal immédiatement - useEffect se charge du rechargement automatique
      setIsModalVisible(false);
      setCurrentTask(null);
      
      console.log('✅ Opération terminée - useEffect va recharger les tâches automatiquement');
      
      console.log('✅ Opération terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la tâche:', error);
      alert('Erreur lors de la sauvegarde de la tâche. Veuillez réessayer.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project || !selectedPhase) {
      console.error('❌ Impossible de supprimer: projet ou phase manquant');
      return;
    }
    
    console.log('🗑️ Début suppression tâche:', taskId);
    
    try {
      // Fermer le modal immédiatement pour une meilleure UX
      setIsModalVisible(false);
      setCurrentTask(null);
      
      // Supprimer de Firebase - le useEffect se chargera de recharger automatiquement
      await projectContext.removeTask(project.id, selectedPhase.id, taskId);
      console.log('✅ Tâche supprimée avec succès de Firebase');
      
      console.log('✅ Suppression terminée avec succès - useEffect va recharger les tâches');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la tâche:', error);
      alert('Erreur lors de la suppression de la tâche. Veuillez réessayer.');
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

  const getStatusIcon = (status: ProjectTask['status']) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'todo': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const renderTaskCard = (task: ProjectTask, index: number) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subTasks && Array.isArray(task.subTasks) && task.subTasks.length > 0;

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
                  {(() => {
                    const { tone, label } = statusToBadge('task', task.status as unknown as string);
                    return (
                      <Badge tone={tone} size="md">
                        <span className="inline-flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          {label}
                        </span>
                      </Badge>
                    );
                  })()}
                  {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      <Users className="w-3 h-3" />
                      {getTeamMemberNames(task.assignedTo, teamMembers)}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {task.name && typeof task.name === 'string' ? task.name : 'Tâche sans nom'}
                </h4>
                {task.description && (
                  <p className="text-gray-600 mb-3">{task.description}</p>
                )}
              
                {/* Informations financières */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Informations financières</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-600 font-semibold">
                      {formatCurrency(task.budget || 0)}
                    </div>
                    <div className="text-gray-500 text-xs">Budget alloué</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${
                      (taskExpenses[task.id]?.totalSpent || 0) > (task.budget || 0) ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(taskExpenses[task.id]?.totalSpent || 0)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Dépensé réel ({taskExpenses[task.id]?.transactionCount || 0} transactions)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${
                      ((task.budget || 0) - (taskExpenses[task.id]?.totalSpent || 0)) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency((task.budget || 0) - (taskExpenses[task.id]?.totalSpent || 0))}
                    </div>
                    <div className="text-gray-500 text-xs">Restant</div>
                  </div>
                </div>
                
                {/* Barre de progression budgétaire */}
                <div className="mt-3">
                  {(() => {
                    const percent = Math.min(100, (task.budget || 0) > 0 ? ((taskExpenses[task.id]?.totalSpent || 0) / (task.budget || 1)) * 100 : 0);
                    const tone: 'red' | 'orange' | 'green' = (taskExpenses[task.id]?.totalSpent || 0) > (task.budget || 0)
                      ? 'red'
                      : percent > 80
                      ? 'orange'
                      : 'green';
                    return (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Utilisation du budget</span>
                          <span className="text-xs font-medium text-gray-700">{Math.round(percent)}%</span>
                        </div>
                        <ProgressBar value={percent} tone={tone} />
                      </>
                    );
                  })()}
                </div>
              </div>
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
                <button
                  onClick={() => {
                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?\n\nCette action est irréversible.`)) {
                      handleDeleteTask(task.id);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
                >
                  Supprimer
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
  <PageContainer className="space-y-6">
    {/* Header avec design moderne */}
    <div className="card-gradient p-6 rounded-xl animate-slideInUp">
      <SectionHeader
        icon={<Target className="w-8 h-8 text-glow" />}
        title={(
          <span className="heading-2 text-shimmer flex items-center gap-2">
            Tâches
            <TrendingUp className="w-6 h-6 text-success animate-pulse" />
          </span>
        )}
        subtitle="Gérez et suivez toutes vos tâches de projet"
        actions={(
          <button
            title="Créer une nouvelle tâche"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg ring-1 ring-blue-500/30"
            onClick={() => {
              setCurrentTask(null);
              setIsModalVisible(true);
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle Tâche</span>
          </button>
        )}
      />
    </div>

    {/* Sélecteur de phase avec design moderne */}
    <div className="card-glass p-6 rounded-xl animate-slideInUp" style={{animationDelay: '0.1s'}}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-glow" />
        <h3 className="heading-4 text-shimmer">Filtrer par phase</h3>
      </div>
      
      <select
        value={selectedPhaseId || ''}
        onChange={(e) => setSelectedPhaseId(e.target.value || null)}
        className="form-select form-input-gradient w-full px-4 py-3"
      >
        <option value="">Toutes les phases</option>
        {phases.map(phase => (
          <option key={phase.id} value={phase.id}>
            {phase.name} ({phase.tasks?.length || 0} tâches)
          </option>
        ))}
      </select>
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
          teamMembers={teamMembers}
        />
      )}
    </PageContainer>
  );
};

export default Tasks;

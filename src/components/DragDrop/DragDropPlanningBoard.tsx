import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Space, Tag, Avatar, Tooltip, Button, Modal, Form, Input, Select, DatePicker, Pagination, Switch } from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProjectContext } from '../../contexts/ProjectContext';
import type { ProjectTask } from '../../contexts/projectTypes';
import SectionHeader from '../UI/SectionHeader';
import TeamService from '../../services/teamService';
import { TeamMember } from '../../types/team';

const { Option } = Select;

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  projectId?: string;
  phaseId?: string;
}

interface Column {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
  tasks: Task[];
}

const ItemTypes = {
  TASK: 'task'
};

// Composant Task draggable
const DraggableTask: React.FC<{ 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}> = ({ task, onEdit, onDelete, compact = false }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: '#52c41a',
      medium: '#faad14', 
      high: '#ff7a45',
      urgent: '#ff4d4f'
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠', 
      urgent: '🔴'
    };
    return icons[priority];
  };

  return (
    <div
      ref={drag}
      className={`
        cursor-move transition-all duration-200 transform
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-102'}
      `}
    >
      <Card
        size="small"
        className={`
          shadow-sm hover:shadow-md transition-all duration-200 border-l-4
          ${isDragging ? 'shadow-lg' : ''}
          ${compact ? 'mb-1' : 'mb-2'}
        `}
        style={{ borderLeftColor: getPriorityColor(task.priority) }}
        bodyStyle={{ padding: compact ? '6px 8px' : '8px 12px' }}
      >
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: 4 }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              {task.description}
            </div>
          )}
          {(task.startDate || task.dueDate) && (
            <div style={{ fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClockCircleOutlined />
              <span>
                {task.startDate ? dayjs(task.startDate).format('DD/MM/YYYY') : ''}
                {task.startDate && task.dueDate ? ' → ' : ''}
                {task.dueDate ? dayjs(task.dueDate).format('DD/MM/YYYY') : ''}
              </span>
            </div>
          )}
        </div>

        <Space size="small" wrap>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{getPriorityIcon(task.priority)}</span>
              {task.assignee && (
                <Tooltip title={`Assigné à ${task.assignee}`}>
                  <Avatar size={16} icon={<UserOutlined />} />
                </Tooltip>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {task.estimatedHours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#999' }}>
                  <ClockCircleOutlined />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
              {!compact && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    style={{ padding: '2px 4px', height: 'auto' }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    danger
                    style={{ padding: '2px 4px', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          </div>
          {task.estimatedHours && (
            <Tag color="purple" style={{ fontSize: '10px' }}>
              {task.estimatedHours}h
            </Tag>
          )}
        </Space>

        {task.tags && task.tags.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {task.tags.map(tag => (
              <Tag key={tag} style={{ fontSize: '10px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Composant DroppableColumn avec gestion du drop et pagination
const DroppableColumn: React.FC<{
  column: Column;
  onTaskDrop: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: Task['status']) => void;
  paginatedData: {
    tasks: Task[];
    totalTasks: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange: (page: number) => void;
  compactView: boolean;
}> = ({ column, onTaskDrop, onEdit, onDelete, onAddTask, paginatedData, onPageChange, compactView }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      onTaskDrop(item.id, column.status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        bg-gray-50 dark:bg-gray-800 rounded-lg p-3 md:p-4 transition-all duration-200 flex flex-col
        ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600' : ''}
        ${compactView ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-150px)]'}
      `}
    >
      {/* En-tête de colonne */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base">
            {column.title}
          </h3>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
            {paginatedData.totalTasks}
          </span>
        </div>
        <Button
          type="text"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => onAddTask(column.status)}
          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        />
      </div>

      {/* Liste des tâches avec scroll fixe */}
      <div className={`flex-1 overflow-y-auto space-y-2`}>
        {paginatedData.tasks.map(task => (
          <DraggableTask
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            compact={compactView}
          />
        ))}
        
        {/* Zone de drop vide */}
        {paginatedData.tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 md:p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            {paginatedData.totalTasks > 0 ? 'Aucune tâche avec ces filtres' : 'Glissez une tâche ici ou cliquez sur "Ajouter"'}
          </div>
        )}
      </div>

      {/* Pagination en bas de colonne */}
      {paginatedData.totalPages > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            current={paginatedData.currentPage}
            total={paginatedData.totalTasks}
            pageSize={Math.ceil(paginatedData.totalTasks / paginatedData.totalPages)}
            onChange={onPageChange}
            size="small"
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total}`}
            className="text-center"
          />
        </div>
      )}
    </div>
  );
};

// Composant principal
const DragDropPlanningBoard: React.FC = () => {
  const { projects, currentProject, updateTask } = useProjectContext();
  const [columns, setColumns] = useState<Column[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('todo');
  const [form] = Form.useForm();
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);
  
  // États pour l'optimisation d'affichage
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [compactView, setCompactView] = useState(false);
  const [tasksPerColumn, setTasksPerColumn] = useState(10);
  const [columnPages, setColumnPages] = useState<{[key: string]: number}>({
    todo: 1,
    in_progress: 1,
    review: 1,
    done: 1
  });

  // Fonction pour mapper les statuts des tâches
  const mapTaskStatus = (status: string): Task['status'] => {
    switch (status) {
      case 'todo':
      case 'planned':
        return 'todo';
      case 'in_progress':
        return 'in_progress';
      case 'done':
        return 'done';
      case 'blocked':
      case 'on_hold':
        return 'review';
      default:
        return 'todo';
    }
  };

  // Fonction pour filtrer les tâches
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee;
      
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  // Fonction pour paginer les tâches d'une colonne
  const paginateTasks = (tasks: Task[], columnId: string) => {
    const filteredTasks = filterTasks(tasks);
    const currentPage = columnPages[columnId] || 1;
    const startIndex = (currentPage - 1) * tasksPerColumn;
    const endIndex = startIndex + tasksPerColumn;
    
    return {
      tasks: filteredTasks.slice(startIndex, endIndex),
      totalTasks: filteredTasks.length,
      totalPages: Math.ceil(filteredTasks.length / tasksPerColumn),
      currentPage
    };
  };

  // Charger les tâches réelles depuis le projet actuel
  useEffect(() => {
    console.log('🔄 Kanban - Rechargement des tâches depuis currentProject');
    console.log('📊 Kanban - Projet actuel:', currentProject?.name);
    console.log('📊 Kanban - currentProject existe?', !!currentProject);
    console.log('📊 Kanban - Nombre de phases:', currentProject?.phases?.length || 0);
    
    if (currentProject && currentProject.phases && currentProject.phases.length > 0) {
      // Extraire toutes les tâches de toutes les phases
      const allTasks: Task[] = [];
      
      currentProject.phases.forEach((phase, phaseIndex) => {
        console.log(`📋 Kanban - Phase ${phaseIndex + 1}: "${phase.name}" - ${phase.tasks?.length || 0} tâches`);
        
        // Debug: Afficher la structure complète de la première phase
        if (phaseIndex === 0) {
          console.log('🔍 DEBUG - Structure de la phase 1:', {
            id: phase.id,
            name: phase.name,
            tasks: phase.tasks,
            hasTasksProperty: 'tasks' in phase,
            tasksType: typeof phase.tasks,
            tasksIsArray: Array.isArray(phase.tasks)
          });
        }
        
        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach((task, taskIndex) => {
            console.log(`  ✓ Tâche ${taskIndex + 1}: "${task.name}" - Statut: ${task.status}`);
            
            // Mapper les tâches du projet vers le format du drag & drop
            const mappedTask: Task = {
              id: task.id,
              title: task.name,
              description: task.description,
              assignee: task.assignedTo?.[0] || undefined,
              priority: task.priority || 'medium',
              status: mapTaskStatus(task.status),
              startDate: task.startDate,
              dueDate: task.endDate || task.dueDate,
              estimatedHours: task.budget ? Math.round(task.budget / 50) : undefined,
              tags: [phase.name],
              projectId: currentProject.id,
              phaseId: phase.id
            };
            allTasks.push(mappedTask);
          });
        }
      });

      console.log('✅ Kanban - Total tâches extraites:', allTasks.length);
      console.log('📊 Kanban - Répartition par statut:');
      console.log('  - todo:', allTasks.filter(t => t.status === 'todo').length);
      console.log('  - in_progress:', allTasks.filter(t => t.status === 'in_progress').length);
      console.log('  - review:', allTasks.filter(t => t.status === 'review').length);
      console.log('  - done:', allTasks.filter(t => t.status === 'done').length);

      // Organiser les tâches par colonnes
      const initialColumns: Column[] = [
        {
          id: 'todo',
          title: 'À faire',
          status: 'todo',
          color: '#faad14',
          tasks: allTasks.filter(t => t.status === 'todo')
        },
        {
          id: 'in_progress',
          title: 'En cours',
          status: 'in_progress', 
          color: '#1890ff',
          tasks: allTasks.filter(t => t.status === 'in_progress')
        },
        {
          id: 'review',
          title: 'En révision',
          status: 'review',
          color: '#722ed1',
          tasks: allTasks.filter(t => t.status === 'review')
        },
        {
          id: 'done',
          title: 'Terminé',
          status: 'done',
          color: '#52c41a',
          tasks: allTasks.filter(t => t.status === 'done')
        }
      ];

      setColumns(initialColumns);
    } else {
      console.log('⚠️ Kanban - Aucun projet ou aucune phase, utilisation des colonnes vides');
      
      // Créer des colonnes vides si pas de projet
      const emptyColumns: Column[] = [
        {
          id: 'todo',
          title: 'À faire',
          status: 'todo',
          color: '#faad14',
          tasks: []
        },
        {
          id: 'in_progress',
          title: 'En cours',
          status: 'in_progress', 
          color: '#1890ff',
          tasks: []
        },
        {
          id: 'review',
          title: 'En révision',
          status: 'review',
          color: '#722ed1',
          tasks: []
        },
        {
          id: 'done',
          title: 'Terminé',
          status: 'done',
          color: '#52c41a',
          tasks: []
        }
      ];
      
      setColumns(emptyColumns);
    }
  }, [currentProject, currentProject?.phases, projects]); // ✅ Ajout de currentProject.phases dans les dépendances

  // Charger les membres du projet pour alimenter le Select d'assignation
  useEffect(() => {
    const loadMembers = async () => {
      try {
        if (!currentProject?.id) {
          setProjectMembers([]);
          return;
        }
        const members = await TeamService.getMembersByProject(currentProject.id);
        const unique = members.filter((m, i, self) => i === self.findIndex(x => x.id === m.id || x.email === m.email));
        setProjectMembers(unique);
      } catch (e) {
        console.error('Kanban - Erreur chargement membres projet:', e);
        setProjectMembers([]);
      }
    };
    loadMembers();
  }, [currentProject?.id]);

  const handleTaskDrop = (taskId: string, newStatus: Task['status']) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Trouver et retirer la tâche de son ancienne colonne
      let movedTask: Task | null = null;
      newColumns.forEach(column => {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
          movedTask = { ...column.tasks[taskIndex], status: newStatus };
          column.tasks.splice(taskIndex, 1);
        }
      });

      // Ajouter la tâche à sa nouvelle colonne
      if (movedTask) {
        const targetColumn = newColumns.find(c => c.status === newStatus);
        if (targetColumn) {
          targetColumn.tasks.push(movedTask);
        }

        // Synchroniser avec Firebase si c'est une tâche réelle
        const taskWithIds = movedTask as Task & { projectId?: string; phaseId?: string };
        if (currentProject && taskWithIds.projectId && taskWithIds.phaseId) {
          const mappedStatus = mapDragDropStatusToProjectStatus(newStatus);
          try {
            updateTask(taskWithIds.projectId, taskWithIds.phaseId, taskWithIds.id, {
              status: mappedStatus
            } as Partial<ProjectTask>);
          } catch (error) {
            console.error('Erreur lors de la mise à jour de la tâche:', error);
          }
        }
      }

      return newColumns;
    });
  };

  // Mapper les statuts drag & drop vers les statuts du projet
  const mapDragDropStatusToProjectStatus = (status: Task['status']): 'todo' | 'planned' | 'in_progress' | 'done' | 'on_hold' | 'cancelled' | 'blocked' => {
    switch (status) {
      case 'todo':
        return 'todo';
      case 'in_progress':
        return 'in_progress';
      case 'review':
        return 'blocked';
      case 'done':
        return 'done';
      default:
        return 'todo';
    }
  };

  const handleAddTask = (status: Task['status']) => {
    setEditingTask(null);
    setNewTaskStatus(status);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null
    });
    setModalVisible(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(t => t.id !== taskId)
      }));
    });
  };

  const handleSaveTask = (values: {
    title: string;
    description?: string;
    assignee?: string;
    priority: Task['priority'];
    dueDate?: dayjs.Dayjs;
    estimatedHours?: number;
    tags?: string[];
  }) => {
    const taskData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      status: editingTask ? editingTask.status : newTaskStatus
    };

    if (editingTask) {
      // Modifier une tâche existante
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        newColumns.forEach(column => {
          const taskIndex = column.tasks.findIndex(t => t.id === editingTask.id);
          if (taskIndex >= 0) {
            column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...taskData };
          }
        });
        return newColumns;
      });
    } else {
      // Ajouter une nouvelle tâche
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        const targetColumn = newColumns.find(c => c.status === newTaskStatus);
        if (targetColumn) {
          targetColumn.tasks.push(taskData as Task);
        }
        return newColumns;
      });
    }

    setModalVisible(false);
    form.resetFields();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-2 md:p-4">
        {/* Header harmonisé */}
        <div className="glass-card p-4 md:p-6 rounded-xl mb-4">
          <SectionHeader
            icon={<ClockCircleOutlined className="text-blue-600" />}
            title="Planning Interactif"
            subtitle="Glissez-déposez les tâches entre les colonnes"
          />
        </div>

        {/* Barre de contrôles et filtres */}
        <div className="mb-4 space-y-3">
          {/* Ligne 1: Recherche et vue compacte */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex-1">
              <Input.Search
                placeholder="Rechercher une tâche, assigné, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                allowClear
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Vue compacte</span>
              <Switch
                checked={compactView}
                onChange={setCompactView}
                size="small"
              />
            </div>
          </div>

          {/* Ligne 2: Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              placeholder="Toutes les priorités"
              value={selectedPriority}
              onChange={setSelectedPriority}
              className="w-full"
            >
              <Option value="all">Toutes les priorités</Option>
              <Option value="low">🟢 Basse</Option>
              <Option value="medium">🟡 Moyenne</Option>
              <Option value="high">🟠 Haute</Option>
              <Option value="urgent">🔴 Urgente</Option>
            </Select>

            <Select
              placeholder="Tous les assignés"
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              className="w-full"
            >
              <Option value="all">Tous les assignés</Option>
              <Option value="Jean Dupont">Jean Dupont</Option>
              <Option value="Marie Martin">Marie Martin</Option>
              <Option value="Pierre Dubois">Pierre Dubois</Option>
              <Option value="Paul Électricien">Paul Électricien</Option>
            </Select>

            <Select
              placeholder="Tâches par colonne"
              value={tasksPerColumn}
              onChange={setTasksPerColumn}
              className="w-full"
            >
              <Option value={5}>5 tâches</Option>
              <Option value={10}>10 tâches</Option>
              <Option value={20}>20 tâches</Option>
              <Option value={50}>50 tâches</Option>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedPriority('all');
                setSelectedAssignee('all');
                setColumnPages({ todo: 1, in_progress: 1, review: 1, done: 1 });
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {columns.map(column => {
            const paginatedData = paginateTasks(column.tasks, column.id);
            return (
              <DroppableColumn
                key={column.id}
                column={column}
                onTaskDrop={handleTaskDrop}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddTask={handleAddTask}
                paginatedData={paginatedData}
                onPageChange={(page) => setColumnPages(prev => ({ ...prev, [column.id]: page }))}
                compactView={compactView}
              />
            );
          })}
        </div>

        {/* Modal de création/édition de tâche */}
        <Modal
          title={editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={window.innerWidth < 768 ? '95%' : 600}
          style={{ top: window.innerWidth < 768 ? 20 : undefined }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveTask}
          >
            <Form.Item
              name="title"
              label="Titre"
              rules={[{ required: true, message: 'Titre requis' }]}
            >
              <Input placeholder="Ex: Coulage des fondations" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Description détaillée de la tâche..."
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="assignee"
                label="Assigné à"
              >
                <Select placeholder="Sélectionner une personne" allowClear>
                  {projectMembers.map(m => (
                    <Option key={m.id} value={m.name}>{m.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="priority"
                label="Priorité"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="low">🟢 Basse</Option>
                  <Option value="medium">🟡 Moyenne</Option>
                  <Option value="high">🟠 Haute</Option>
                  <Option value="urgent">🔴 Urgente</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="dueDate"
                label="Date d'échéance"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="estimatedHours"
                label="Heures estimées"
              >
                <Input type="number" suffix="heures" />
              </Form.Item>
            </div>

            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Ajouter des tags..."
                options={[
                  { value: 'gros-oeuvre', label: 'Gros œuvre' },
                  { value: 'second-oeuvre', label: 'Second œuvre' },
                  { value: 'finitions', label: 'Finitions' },
                  { value: 'électricité', label: 'Électricité' },
                  { value: 'plomberie', label: 'Plomberie' },
                  { value: 'maçonnerie', label: 'Maçonnerie' }
                ]}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingTask ? 'Modifier' : 'Créer'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Annuler
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default DragDropPlanningBoard;

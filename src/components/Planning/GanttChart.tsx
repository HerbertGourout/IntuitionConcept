import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import GanttTask from './GanttTask';
import GanttTimeline from './GanttTimeline';

interface GanttChartProps {
  tasks: ProjectTask[];
  onTaskUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
  onTaskCreate: (task: Omit<ProjectTask, 'id'>) => void;
  projectId?: string;
  phases?: any[]; // Ajouter les phases en props
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskCreate,
  projectId,
  phases = [] // Ajouter phases avec valeur par défaut
}) => {
  type ViewMode = 'days' | 'weeks' | 'months';
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const ganttRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on phases and tasks
const getDateRange = () => {
  // Use phases passed as props
  const projectPhases = phases || [];

  // If phases exist, use their start/end dates
  if (projectPhases.length > 0) {
    const phaseDates = projectPhases.flatMap((phase: any) => [
      new Date(phase.startDate),
      new Date(phase.endDate)
    ]);
    const start = new Date(Math.min(...phaseDates.map((d: Date) => d.getTime())));
    const end = new Date(Math.max(...phaseDates.map((d: Date) => d.getTime())));
    // Ajouter une marge pour voir les dates historiques
    start.setDate(start.getDate() - 30); // 30 jours avant
    end.setDate(end.getDate() + 30); // 30 jours après
    return { start, end };
  }

  // If no phases, use tasks as fallback
  if (tasks.length === 0) {
    // Au lieu de commencer à aujourd'hui, commencer il y a 2 ans
    const start = new Date();
    start.setFullYear(start.getFullYear() - 2); // 2 ans dans le passé
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1); // 1 an dans le futur
    return { start, end };
  }
  
  // Utiliser toutes les dates des tâches (historiques et futures)
  const dates = tasks.flatMap(task => {
    const taskDates: Date[] = [];
    
    // Ajouter startDate si elle existe
    if (task.startDate) {
      taskDates.push(new Date(task.startDate));
    }
    
    // Ajouter dueDate si elle existe
    if (task.dueDate) {
      taskDates.push(new Date(task.dueDate));
    }
    
    // Ajouter endDate si elle existe
    if (task.endDate) {
      taskDates.push(new Date(task.endDate));
    }
    
    return taskDates;
  }).filter(date => !isNaN(date.getTime())); // Filtrer les dates invalides
  
  // Si aucune date valide n'est trouvée, utiliser une plage par défaut
  if (dates.length === 0) {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    start.setDate(start.getDate() - 30);
    end.setDate(end.getDate() + 90);
    return { start, end };
  }
  
  const start = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
  const end = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
  // Ajouter une marge généreuse pour voir l'historique
  start.setDate(start.getDate() - 30);
  end.setDate(end.getDate() + 30);
  return { start, end };
};

  const { start: startDate, end: endDate } = getDateRange();

  // Generate timeline columns
  const generateTimelineColumns = () => {
    const columns = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      columns.push(new Date(current));
      
      switch (viewMode) {
        case 'days':
          current.setDate(current.getDate() + 1);
          break;
        case 'weeks':
          current.setDate(current.getDate() + 7);
          break;
        case 'months':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return columns;
  };

  const timelineColumns = generateTimelineColumns();

  // Calculate column width based on view mode
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'days': return 40;
      case 'weeks': return 100;
      case 'months': return 120;
      default: return 100;
    }
  };

  const columnWidth = getColumnWidth();

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  // Handle task drag
  const handleTaskDragStart = (taskId: string, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedTask(taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  // Handle task resize
  const handleTaskResize = (taskId: string, newStartDate: Date, newEndDate: Date) => {
    onTaskUpdate(taskId, {
      startDate: newStartDate.toISOString().split('T')[0],
      dueDate: newEndDate.toISOString().split('T')[0]
    });
  };

  // Handle task move
  const handleTaskMove = (taskId: string, newStartDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.startDate || !task.dueDate) return;

    const duration = new Date(task.dueDate).getTime() - new Date(task.startDate).getTime();
    const newEndDate = new Date(newStartDate.getTime() + duration);

    onTaskUpdate(taskId, {
      startDate: newStartDate.toISOString().split('T')[0],
      dueDate: newEndDate.toISOString().split('T')[0]
    });
  };

  // Calculate task position and width
  const getTaskPosition = (task: ProjectTask) => {
    const taskStart = task.startDate ? new Date(task.startDate) : new Date();
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date();
    
    const startOffset = Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    
    let left, width;
    
    switch (viewMode) {
      case 'days':
        left = startOffset * columnWidth;
        width = Math.max(duration * columnWidth, 20);
        break;
      case 'weeks':
        left = (startOffset / 7) * columnWidth;
        width = Math.max((duration / 7) * columnWidth, 20);
        break;
      case 'months':
        left = (startOffset / 30) * columnWidth;
        width = Math.max((duration / 30) * columnWidth, 20);
        break;
      default:
        left = 0;
        width = 100;
    }
    
    return { left, width };
  };

  // Handle scroll synchronization
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Planning Gantt</h3>
            <p className="text-gray-600 mt-1">Visualisez et gérez vos tâches</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {(['days', 'weeks', 'months'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'days' ? 'Jours' : mode === 'weeks' ? 'Semaines' : 'Mois'}
                </button>
              ))}
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="review">En révision</option>
              <option value="completed">Terminé</option>
            </select>

            {/* Add Task */}

          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="relative">
        {/* Timeline Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
          <div className="flex">
            {/* Task Names Column */}
            <div className="w-80 p-4 border-r border-gray-200 bg-white">
              <h4 className="text-sm font-medium text-gray-700">Tâches</h4>
            </div>
            
            {/* Timeline */}
            <div 
              ref={timelineRef}
              className="flex-1 overflow-x-auto scrollbar-hide"
            >
              <GanttTimeline
                columns={timelineColumns}
                columnWidth={columnWidth}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div 
          ref={ganttRef}
          className="flex max-h-96 overflow-y-auto"
          onScroll={handleScroll}
        >
          {/* Task Names */}
          <div className="w-80 border-r border-gray-200 bg-white">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' :
                    task.status === 'blocked' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.assignedTo.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gantt Bars */}
          <div className="flex-1 relative bg-gray-50">
            <div 
              className="relative h-full"
              style={{ width: timelineColumns.length * columnWidth }}
            >
              {/* Grid Lines */}
              {timelineColumns.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-r border-gray-200"
                  style={{ left: index * columnWidth }}
                />
              ))}

              {/* Task Bars */}
              {filteredTasks.map((task, index) => {
                const position = getTaskPosition(task);
                return (
                  <GanttTask
                    key={task.id}
                    task={task}
                    position={position}
                    rowIndex={index}
                    rowHeight={73}
                    isDragged={draggedTask === task.id}
                    onDragStart={(e) => handleTaskDragStart(task.id, e)}
                    onDragEnd={handleTaskDragEnd}
                    onResize={(startDate, endDate) => handleTaskResize(task.id, startDate, endDate)}
                    onMove={(startDate) => handleTaskMove(task.id, startDate)}
                    // onClick retiré : sélection de tâche désactivée dans le GanttChart
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune tâche à afficher
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer une nouvelle tâche pour voir votre planning.
            </p>

          </div>
        )}
      </div>


    </div>
  );
};

export default GanttChart;
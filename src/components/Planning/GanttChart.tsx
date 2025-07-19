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

  // Fonction pour formater les dates dans la timeline
  const formatDate = (date: Date): string => {
    switch (viewMode) {
      case 'days':
        return date.getDate().toString();
      case 'weeks': {
        const getWeekNumber = (date: Date) => {
          const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        };
        return `S${getWeekNumber(date)}`;
      }
      case 'months':
        return date.toLocaleDateString('fr-FR', { month: 'short' });
      default:
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Calculate fixed date range for Gantt timeline - independent of phases
  const getFixedDateRange = () => {
    const today = new Date();
    
    // Timeline fixe et raisonnable selon le mode de vue
    switch (viewMode) {
      case 'days':
        // 2 mois : 1 mois passé + 1 mois futur
        const dayStart = new Date(today);
        dayStart.setDate(dayStart.getDate() - 30);
        const dayEnd = new Date(today);
        dayEnd.setDate(dayEnd.getDate() + 30);
        return { start: dayStart, end: dayEnd };
        
      case 'weeks':
        // 6 mois : 3 mois passé + 3 mois futur
        const weekStart = new Date(today);
        weekStart.setMonth(weekStart.getMonth() - 3);
        const weekEnd = new Date(today);
        weekEnd.setMonth(weekEnd.getMonth() + 3);
        return { start: weekStart, end: weekEnd };
        
      case 'months':
        // 2 ans : 1 an passé + 1 an futur
        const monthStart = new Date(today);
        monthStart.setFullYear(monthStart.getFullYear() - 1);
        const monthEnd = new Date(today);
        monthEnd.setFullYear(monthEnd.getFullYear() + 1);
        return { start: monthStart, end: monthEnd };
        
      default:
        // Par défaut : 6 mois
        const defaultStart = new Date(today);
        defaultStart.setMonth(defaultStart.getMonth() - 3);
        const defaultEnd = new Date(today);
        defaultEnd.setMonth(defaultEnd.getMonth() + 3);
        return { start: defaultStart, end: defaultEnd };
    }
  };

  const { start: startDate, end: endDate } = getFixedDateRange();

  // Generate timeline columns with fixed limits - no dependency on phases
  const generateTimelineColumns = () => {
    const columns = [];
    const current = new Date(startDate);
    
    // Colonnes fixes selon le mode de vue
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

  // Calculate column width based on view mode - responsive
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'days': return 35; // Réduit pour éviter le scroll excessif
      case 'weeks': return 80; // Réduit pour éviter le scroll excessif
      case 'months': return 100; // Réduit pour éviter le scroll excessif
      default: return 80;
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

  // Handle scroll synchronization between timeline and gantt bars
  const handleGanttScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = event.currentTarget.scrollLeft;
    if (timelineRef.current && timelineRef.current.scrollLeft !== scrollLeft) {
      timelineRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleTimelineScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = event.currentTarget.scrollLeft;
    if (ganttRef.current) {
      const ganttBarsContainer = ganttRef.current.querySelector('.gantt-bars-container') as HTMLElement;
      if (ganttBarsContainer && ganttBarsContainer.scrollLeft !== scrollLeft) {
        ganttBarsContainer.scrollLeft = scrollLeft;
      }
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

      {/* Timeline Header */}
      <div 
        ref={timelineRef}
        className="timeline-header bg-gray-50 border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        onScroll={handleTimelineScroll}
      >
        <div className="flex" style={{ width: `${48 * 4 + timelineColumns.length * columnWidth}px` }}>
          {/* Task names column */}
          <div className="w-48 flex-shrink-0 p-3 bg-gray-100 border-r border-gray-200">
            <div className="text-sm font-semibold text-gray-700">Tâches</div>
          </div>
          
          {/* Timeline columns */}
          <div className="flex flex-shrink-0">
            {timelineColumns.map((date, index) => (
              <div key={index} className="timeline-column border-r border-gray-200 p-2 text-center" style={{ minWidth: `${columnWidth}px`, width: `${columnWidth}px` }}>
                <div className="text-xs font-medium text-gray-600">
                  {formatDate(date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Bars */}
      <div 
        ref={ganttRef}
        className="gantt-bars overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ maxHeight: '300px' }}
        onScroll={handleGanttScroll}
      >
        <div className="flex" style={{ width: `${48 * 4 + timelineColumns.length * columnWidth}px` }}>
          {/* Task names column */}
          <div className="w-48 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {filteredTasks.map((task, index) => (
              <div key={task.id || index} className="p-3 border-b border-gray-100 h-12 flex items-center">
                <span className="text-sm text-gray-700 truncate" title={task.name}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Task bars container */}
          <div 
            className="relative flex-shrink-0" 
            style={{ 
              width: Math.min(timelineColumns.length * columnWidth, 2000),
              minWidth: '600px'
            }}
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
                  rowHeight={48}
                  isDragged={draggedTask === task.id}
                  onDragStart={(e) => handleTaskDragStart(task.id, e)}
                  onDragEnd={handleTaskDragEnd}
                  onResize={(startDate, endDate) => handleTaskResize(task.id, startDate, endDate)}
                  onMove={(startDate) => handleTaskMove(task.id, startDate)}
                />
              );
            })}
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
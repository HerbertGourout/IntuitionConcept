import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import GanttTask from './GanttTask';

interface GanttViewProps {
  tasks: ProjectTask[];
  onTaskUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
  teamMembers?: TeamMember[];
}

const GanttView: React.FC<GanttViewProps> = ({ 
  tasks, 
  onTaskUpdate,
  teamMembers = []
}) => {
  type ViewMode = 'days' | 'weeks' | 'months';
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const ganttRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const getTeamMemberNames = (memberIds: string[] | undefined): string => {
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return 'Non assigné';
    }
    
    const names = memberIds.map(id => {
      const member = teamMembers.find(m => m.id === id);
      return member ? member.name : `ID:${id}`;
    });
    
    return names.join(', ');
  };

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

  const getFixedDateRange = () => {
    const today = new Date();
    switch (viewMode) {
      case 'days': {
        const dayStart = new Date(today);
        dayStart.setDate(dayStart.getDate() - 30);
        const dayEnd = new Date(today);
        dayEnd.setDate(dayEnd.getDate() + 30);
        return { start: dayStart, end: dayEnd };
      }
      case 'weeks': {
        const weekStart = new Date(today);
        weekStart.setMonth(weekStart.getMonth() - 3);
        const weekEnd = new Date(today);
        weekEnd.setMonth(weekEnd.getMonth() + 3);
        return { start: weekStart, end: weekEnd };
      }
      case 'months': {
        const monthStart = new Date(today);
        monthStart.setFullYear(monthStart.getFullYear() - 1);
        const monthEnd = new Date(today);
        monthEnd.setFullYear(monthEnd.getFullYear() + 1);
        return { start: monthStart, end: monthEnd };
      }
      default: {
        const defaultStart = new Date(today);
        defaultStart.setMonth(defaultStart.getMonth() - 3);
        const defaultEnd = new Date(today);
        defaultEnd.setMonth(defaultEnd.getMonth() + 3);
        return { start: defaultStart, end: defaultEnd };
      }
    }
  };

  const { start: startDate, end: endDate } = getFixedDateRange();

  const generateTimelineColumns = () => {
    const columns = [];
    const current = new Date(startDate);
    switch (viewMode) {
      case 'days':
        while (current <= endDate) {
          columns.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        break;
      case 'weeks':
        while (current <= endDate) {
          columns.push(new Date(current));
          current.setDate(current.getDate() + 7);
        }
        break;
      case 'months':
        while (current <= endDate) {
          columns.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
        }
        break;
    }
    return columns;
  };

  const timelineColumns = generateTimelineColumns();

  const getColumnWidth = () => {
    switch (viewMode) {
      case 'days': return 40;
      case 'weeks': return 80;
      case 'months': return 120;
      default: return 60;
    }
  };

  const columnWidth = getColumnWidth();

  const filteredTasks = tasks.filter(task => 
    filterStatus === 'all' || task.status === filterStatus
  );

  const handleTaskDragStart = (taskId: string, e: React.DragEvent) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  const handleTaskResize = (taskId: string, newStartDate: Date, newEndDate: Date) => {
    onTaskUpdate(taskId, {
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    });
  };

  const handleTaskMove = (taskId: string, newStartDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.startDate && task.endDate) {
      const duration = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      onTaskUpdate(taskId, {
        startDate: newStartDate.toISOString(),
        endDate: newEndDate.toISOString(),
      });
    }
  };

  const getTaskPosition = (task: ProjectTask) => {
    if (!task.startDate || !task.endDate) {
      return { left: 0, width: 0 };
    }
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const ganttStartDate = new Date(startDate);
    const startOffset = (taskStart.getTime() - ganttStartDate.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);
    let left = 0;
    let width = 0;
    switch (viewMode) {
      case 'days':
        left = startOffset * columnWidth;
        width = duration * columnWidth;
        break;
      case 'weeks':
        left = (startOffset / 7) * columnWidth;
        width = (duration / 7) * columnWidth;
        break;
      case 'months':
        left = (startOffset / 30.44) * columnWidth;
        width = (duration / 30.44) * columnWidth;
        break;
    }
    return { left, width };
  };

  const handleGanttScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  const handleTimelineScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (ganttRef.current) {
      ganttRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="gantt-chart-container bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <div className="flex justify-end items-center mb-4 space-x-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-md text-sm bg-white/80 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les tâches</option>
            <option value="planned">Planifiées</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminées</option>
            <option value="on_hold">En attente</option>
          </select>
          <div className="flex items-center bg-gray-100/70 rounded-md p-1">
            <button onClick={() => setViewMode('days')} className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'days' ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200'}`}>Jours</button>
            <button onClick={() => setViewMode('weeks')} className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'weeks' ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200'}`}>Semaines</button>
            <button onClick={() => setViewMode('months')} className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'months' ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200'}`}>Mois</button>
          </div>
        </div>

      <div 
        ref={timelineRef}
        className="timeline-header bg-gray-50/50 border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        onScroll={handleTimelineScroll}
      >
        <div className="flex" style={{ width: `${200 + timelineColumns.length * columnWidth}px` }}>
          <div className="w-48 flex-shrink-0 p-3 bg-gray-100/80 border-r border-gray-200 sticky left-0 z-10">
            <div className="text-sm font-semibold text-gray-700">Tâches</div>
          </div>
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

      <div 
        ref={ganttRef}
        className="gantt-bars overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ maxHeight: '60vh' }}
        onScroll={handleGanttScroll}
      >
        <div className="relative" style={{ width: `${200 + timelineColumns.length * columnWidth}px`, height: `${filteredTasks.length * 48}px` }}>
          <div className="w-48 flex-shrink-0 bg-gray-50/50 border-r border-gray-200 absolute top-0 bottom-0 left-0">
            {filteredTasks.map((task, index) => (
              <div key={task.id || index} className="p-3 border-b border-gray-100 h-12 flex items-center">
                <span className="text-sm text-gray-700 truncate" title={task.name}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="absolute top-0 bottom-0" style={{left: '192px'}}>
            {timelineColumns.map((_, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 border-r border-gray-200"
                style={{ left: index * columnWidth, width: columnWidth }}
              />
            ))}
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
                  getTeamMemberNames={getTeamMemberNames}
                  viewMode={viewMode}
                  columnWidth={columnWidth}
                />
              );
            })}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune tâche à afficher
            </h3>
            <p className="text-gray-600 mb-4">
              Filtrez par un autre statut ou créez une nouvelle tâche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttView;

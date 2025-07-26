import React from 'react';
import { useState, useRef } from 'react';
import { ProjectTask } from '../../contexts/projectTypes';

interface GanttTaskProps {
  task: ProjectTask;
  position: { left: number; width: number };
  rowIndex: number;
  rowHeight: number;
  isDragged: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onResize: (startDate: Date, endDate: Date) => void;
  onMove: (startDate: Date) => void;
  onClick?: () => void;
}

const GanttTask: React.FC<GanttTaskProps> = ({
  task,
  position,
  rowIndex,
  rowHeight,
  isDragged,
  onDragStart,
  onDragEnd,
  onResize,
  onMove,
  onClick
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startLeft = useRef(0);
  const startWidth = useRef(0);

  const getStatusColor = () => {
    switch (task.status) {
      case 'done':
        return 'bg-green-500 border-green-600';
      case 'in_progress':
        return 'bg-blue-500 border-blue-600';
      case 'cancelled':
        return 'bg-red-500 border-red-600';
      case 'on_hold':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const getPriorityIndicator = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-orange-500';
      case 'low':
        return 'border-l-4 border-l-yellow-500';
      default:
        return '';
    }
  };

  const handleMouseDown = (event: React.MouseEvent | React.DragEvent, action: 'drag' | 'resize-left' | 'resize-right') => {
    event.preventDefault();
    event.stopPropagation();
    
    const clientX = 'clientX' in event ? event.clientX : 0;
    startX.current = clientX;
    startLeft.current = position.left;
    startWidth.current = position.width;

    if (action === 'drag') {
      setIsDragging(true);
      if (event.nativeEvent instanceof DragEvent) {
        onDragStart(event as React.DragEvent);
      }
    } else {
      // La logique de redimensionnement est gérée directement dans handleMouseMove
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;
      
      if (action === 'drag') {
        // Calculate new start date based on position
        const dayWidth = 40; // Assuming day view for simplicity
        const daysDelta = Math.round(deltaX / dayWidth);
        const newStartDate = new Date(task.startDate || new Date());
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        onMove(newStartDate);
      } else if (action === 'resize-left') {
        // Resize from left (change start date)
        const dayWidth = 40;
        const daysDelta = Math.round(deltaX / dayWidth);
        const newStartDate = new Date(task.startDate || new Date());
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        onResize(newStartDate, new Date(task.dueDate || task.endDate || new Date()));
      } else if (action === 'resize-right') {
        // Resize from right (change end date)
        const dayWidth = 40;
        const daysDelta = Math.round(deltaX / dayWidth);
        const newEndDate = new Date(task.dueDate || task.endDate || new Date());
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        onResize(new Date(task.startDate || new Date()), newEndDate);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Nettoyage après le redimensionnement
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatDuration = () => {
    const start = new Date(task.startDate || new Date());
    const end = new Date(task.dueDate || task.endDate || new Date());
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days}j`;
  };

  // Get progress value (default to 0 if not available)
  const getProgress = () => {
    if (task.status === 'done') return 100;
    if (task.status === 'in_progress') return 50;
    return 0;
  };

  return (
    <div
      ref={taskRef}
      className={`absolute flex items-center group cursor-pointer transition-all duration-200 ${
        isDragged || isDragging ? 'z-20 shadow-lg' : 'z-10'
      }`}
      style={{
        left: position.left,
        top: rowIndex * rowHeight + 16,
        width: position.width,
        height: 40
      }}
      onClick={onClick}
    >
      {/* Resize Handle Left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-gray-600 rounded-l"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
      />

      {/* Task Bar */}
      <div
        className={`flex-1 h-full rounded-lg border-2 ${getStatusColor()} ${getPriorityIndicator()} 
          hover:shadow-md transition-all duration-200 relative overflow-hidden`}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        {/* Progress Bar */}
        <div
          className="absolute top-0 left-0 h-full bg-white bg-opacity-30 transition-all duration-300"
          style={{ width: `${getProgress()}%` }}
        />

        {/* Task Content */}
        <div className="relative z-10 px-3 py-2 h-full flex items-center justify-between text-white">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {task.name}
            </p>
            {position.width > 120 && (
              <p className="text-xs opacity-90 truncate">
                {formatDuration()} • {getProgress()}%
              </p>
            )}
          </div>
          
          {position.width > 80 && (
            <div className="text-xs opacity-90">
              {getProgress()}%
            </div>
          )}
        </div>

        {/* Dependency Lines */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="absolute -left-2 top-1/2 w-2 h-0.5 bg-gray-400" />
        )}
      </div>

      {/* Resize Handle Right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-gray-600 rounded-r"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
        <div className="font-medium">{task.name}</div>
        <div className="text-gray-300">
          {new Date(task.startDate || new Date()).toLocaleDateString('fr-FR')} - {new Date(task.dueDate || task.endDate || new Date()).toLocaleDateString('fr-FR')}
        </div>
        <div className="text-gray-300">
          Assigné à: {Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo || 'Non assigné'}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export default GanttTask;
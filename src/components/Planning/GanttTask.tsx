import React from 'react';
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
  getTeamMemberNames: (memberIds: string[] | undefined) => string;
  viewMode: 'days' | 'weeks' | 'months';
  columnWidth: number;
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
  getTeamMemberNames,
  viewMode,
  columnWidth,
}) => {

  const getStatusColor = () => {
    switch (task.status) {
      case 'done':
        return 'bg-green-500 border-green-600';
      case 'in_progress':
        return 'bg-blue-500 border-blue-600';
      case 'on_hold':
        return 'bg-amber-500 border-amber-600';
      case 'planned':
        return 'bg-gray-400 border-gray-500';
      default:
        return 'bg-slate-400 border-slate-500';
    }
  };

  const getProgress = () => {
    if (task.status === 'done') return 100;
    // A more realistic progress could be calculated if the task object had a 'progress' property
    if (task.status === 'in_progress') return 50; 
    return 0;
  };

  const handleMouseDown = (event: React.MouseEvent, action: 'drag' | 'resize-left' | 'resize-right') => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const originalStartDate = new Date(task.startDate || Date.now());
    const originalEndDate = new Date(task.endDate || Date.now());

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      let daysDelta = 0;

      switch (viewMode) {
        case 'days':
          daysDelta = deltaX / columnWidth;
          break;
        case 'weeks':
          daysDelta = (deltaX / columnWidth) * 7;
          break;
        case 'months':
          daysDelta = (deltaX / columnWidth) * 30.44; // Average days in a month
          break;
      }

      if (action === 'drag') {
        const newStartDate = new Date(originalStartDate.getTime() + daysDelta * 24 * 60 * 60 * 1000);
        onMove(newStartDate);
      } else if (action === 'resize-right') {
        const newEndDate = new Date(originalEndDate.getTime() + daysDelta * 24 * 60 * 60 * 1000);
        if (newEndDate > originalStartDate) {
          onResize(originalStartDate, newEndDate);
        }
      } else if (action === 'resize-left') {
        const newStartDate = new Date(originalStartDate.getTime() + daysDelta * 24 * 60 * 60 * 1000);
        if (newStartDate < originalEndDate) {
          onResize(newStartDate, originalEndDate);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute flex items-center group transition-all duration-200 ease-in-out ${isDragged ? 'z-20 shadow-xl scale-105' : 'z-10'}`}
      style={{
        left: position.left,
        top: rowIndex * rowHeight + (rowHeight - 40) / 2, // Center the task in the row
        width: Math.max(position.width, 10), // Ensure a minimum width
        height: 40,
      }}
      onDragStart={onDragStart}
      draggable
    >
      {/* Main Task Bar */}
      <div
        className={`w-full h-full rounded-lg border-2 ${getStatusColor()} flex items-center relative overflow-hidden shadow-md hover:shadow-lg transition-shadow`}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        {/* Progress Overlay */}
        <div
          className="absolute top-0 left-0 h-full bg-white/25 backdrop-blur-sm transition-all duration-500"
          style={{ width: `${getProgress()}%` }}
        />
        
        {/* Content */}
        <div className="relative z-10 px-3 py-1 w-full flex items-center justify-between text-white font-sans">
          <span className="text-sm font-medium truncate" title={task.name}>
            {task.name}
          </span>
          {position.width > 80 && (
            <span className="text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded">
              {getProgress()}%
            </span>
          )}
        </div>
      </div>

      {/* Resize Handles */}
      <div
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full bg-slate-600/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
      />
      <div
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full bg-slate-600/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
      />

      {/* Tooltip */}
       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-30">
        <p className="font-bold text-base">{task.name}</p>
        <p className="text-gray-300">
          {new Date(task.startDate || '').toLocaleDateString('fr-FR')} - {new Date(task.endDate || '').toLocaleDateString('fr-FR')}
        </p>
        <p className="text-gray-300">Assigné à: {getTeamMemberNames(task.assignedTo)}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800/90" />
      </div>
    </div>
  );
};

export default GanttTask;
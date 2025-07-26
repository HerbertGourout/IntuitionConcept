import React, { useState, useMemo } from 'react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import { GanttChartSquare, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Users, CalendarDays, Hash } from 'lucide-react';
import GanttView from './GanttView';
import { AnimatePresence, motion } from 'framer-motion';

// Props for the main component
interface PlanningViewsProps {
  tasks: ProjectTask[];
  teamMembers?: TeamMember[];
  onTaskUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
}

// Utility to get member names from IDs
const getTeamMemberNames = (memberIds: string[] | undefined, teamMembers: TeamMember[]): string => {
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return 'Non assigné';
  }
  const names = memberIds.map(id => {
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : `ID:${id}`;
  });
  return names.join(', ');
};

// --- Calendar View Component ---
const CalendarView: React.FC<{ tasks: ProjectTask[], teamMembers: TeamMember[] }> = ({ tasks, teamMembers }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const endOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

  const daysInMonth = useMemo(() => {
    const days = [];
    const day = new Date(startOfMonth);
    // Adjust to start the week on Monday
    const startingDay = (day.getDay() + 6) % 7;
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    while (day.getMonth() === startOfMonth.getMonth()) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [startOfMonth]);

  const tasksByDate = useMemo(() => {
    const mappedTasks: { [key: string]: ProjectTask[] } = {};
    console.log('CalendarView - Tasks received:', tasks);
    tasks.forEach(task => {
      console.log('CalendarView - Processing task:', task.name, 'startDate:', task.startDate, 'dueDate:', task.dueDate);
      if (task.name.includes('topographique')) {
        console.log('🎯 FOUND TARGET TASK:', task.name, 'startDate:', task.startDate, 'dueDate:', task.dueDate);
      }
      if (task.startDate) {
        // Use yyyy-mm-dd format for reliable matching
        const date = new Date(task.startDate).toISOString().slice(0, 10);
        console.log('CalendarView - Mapped date:', date);
        if (!mappedTasks[date]) {
          mappedTasks[date] = [];
        }
        mappedTasks[date].push(task);
      } else if (task.dueDate) {
        // Fallback to dueDate if no startDate
        const date = new Date(task.dueDate).toISOString().slice(0, 10);
        console.log('CalendarView - Mapped dueDate:', date);
        if (!mappedTasks[date]) {
          mappedTasks[date] = [];
        }
        mappedTasks[date].push(task);
      }
    });
    console.log('CalendarView - Final mappedTasks:', mappedTasks);
    return mappedTasks;
  }, [tasks]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 transition"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-gray-700">{currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 transition"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-500">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {daysInMonth.map((day, index) => (
          <div key={index} className={`h-32 rounded-lg border p-2 flex flex-col ${day ? 'bg-white' : 'bg-gray-50'}`}>
            {day && (
              <>
                <span className="font-bold">{day.getDate()}</span>
                <div className="mt-1 overflow-y-auto scrollbar-thin">
                  {tasksByDate[day.toISOString().slice(0,10)]?.map(task => (
                    <div key={task.id} className="text-xs bg-blue-100 text-blue-800 rounded px-1 mb-1 truncate" title={task.name}>
                      {task.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- List View Component ---
const ListView: React.FC<{ tasks: ProjectTask[], teamMembers: TeamMember[] }> = ({ tasks, teamMembers }) => {
  const getStatusChip = (status: ProjectTask['status']) => {
    const styles = {
      planned: 'bg-gray-200 text-gray-800',
      in_progress: 'bg-blue-200 text-blue-800',
      on_hold: 'bg-yellow-200 text-yellow-800',
      todo: 'bg-gray-100 text-gray-600',
      done: 'bg-green-300 text-green-900',
      cancelled: 'bg-red-200 text-red-800',
    };
    const text = {
      planned: 'Planifié',
      in_progress: 'En cours',
      on_hold: 'En attente',
      todo: 'À faire',
      done: 'Terminé',
      cancelled: 'Annulée',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.planned}`}>{text[status] || 'Planifié'}</span>;
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigné à</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.name}</div>
                <div className="text-xs text-gray-500">{task.phaseId ? `Phase #${task.phaseId.substring(0, 5)}` : 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getTeamMemberNames(task.assignedTo, teamMembers)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {task.startDate ? new Date(task.startDate).toLocaleDateString('fr-FR') : 'N/D'} - {task.endDate ? new Date(task.endDate).toLocaleDateString('fr-FR') : 'N/D'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(task.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
            <List className="mx-auto h-12 w-12 text-gray-400"/>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune tâche</h3>
            <p className="mt-1 text-sm text-gray-500">Il n'y a aucune tâche à afficher pour le moment.</p>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const GanttChart: React.FC<PlanningViewsProps> = ({ tasks, onTaskUpdate, teamMembers = [] }) => {
  type View = 'gantt' | 'calendar' | 'list';
  const [activeView, setActiveView] = useState<View>('gantt');

  const viewComponents: { [key in View]: React.ReactNode } = {
    gantt: <GanttView tasks={tasks} onTaskUpdate={onTaskUpdate} teamMembers={teamMembers} />,
    calendar: <CalendarView tasks={tasks} teamMembers={teamMembers} />,
    list: <ListView tasks={tasks} teamMembers={teamMembers} />,
  };

  const viewIcons = {
      gantt: GanttChartSquare,
      calendar: CalendarDays,
      list: List
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 bg-gray-100/70 backdrop-blur-sm rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <GanttChartSquare className="mr-2 text-blue-600"/>
            Planification Visuelle
        </h2>
        <div className="flex items-center bg-white shadow-sm rounded-lg p-1 space-x-1">
          {(['gantt', 'calendar', 'list'] as View[]).map(view => {
            const Icon = viewIcons[view];
            return (
              <button 
                key={view} 
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-all duration-300 ${activeView === view ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}>
                <Icon className="mr-2 h-5 w-5"/>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          {viewComponents[activeView]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GanttChart;
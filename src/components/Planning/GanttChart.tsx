import React, { useState, useMemo } from 'react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import { GanttChartSquare, CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react';
import GanttView from './GanttView';
import TaskListView from './TaskListView';
import { AnimatePresence, motion } from 'framer-motion';

// Props du composant principal
interface PlanningViewsProps {
  tasks: ProjectTask[];
  teamMembers?: TeamMember[];
  onTaskUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
}

// Utilitaire pour obtenir les noms des membres à partir de leurs IDs
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

// --- Vue Calendrier ---
const CalendarView: React.FC<{ tasks: ProjectTask[]; teamMembers: TeamMember[] }> = ({ tasks, teamMembers }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const startOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);

  // Génère tous les jours du mois (avec décalage pour commencer lundi)
  const daysInMonth = useMemo(() => {
    const days: (Date | null)[] = [];
    const day = new Date(startOfMonth);
    const startingDay = (day.getDay() + 6) % 7;
    for (let i = 0; i < startingDay; i++) days.push(null);
    while (day.getMonth() === startOfMonth.getMonth()) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [startOfMonth]);

  // Regroupe les tâches par date - affiche sur toute la plage (startDate à dueDate)
  const tasksByDate = useMemo(() => {
    const mapped: Record<string, ProjectTask[]> = {};
    tasks.forEach(task => {
      if (task.startDate && task.dueDate) {
        // Tâche avec plage de dates - afficher sur tous les jours entre startDate et dueDate
        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);
        const current = new Date(start);
        
        while (current <= end) {
          const dateStr = current.toISOString().slice(0, 10);
          if (!mapped[dateStr]) mapped[dateStr] = [];
          mapped[dateStr].push(task);
          current.setDate(current.getDate() + 1);
        }
      } else if (task.startDate) {
        // Seulement date de début
        const dateStr = new Date(task.startDate).toISOString().slice(0, 10);
        if (!mapped[dateStr]) mapped[dateStr] = [];
        mapped[dateStr].push(task);
      } else if (task.dueDate) {
        // Seulement date de fin
        const dateStr = new Date(task.dueDate).toISOString().slice(0, 10);
        if (!mapped[dateStr]) mapped[dateStr] = [];
        mapped[dateStr].push(task);
      }
    });
    return mapped;
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
                  {tasksByDate[day.toISOString().slice(0,10)]?.map(task => {
                    const assignedNames = getTeamMemberNames(task.assignedTo, teamMembers);
                    return (
                      <div key={task.id} className="text-xs bg-blue-100 text-blue-800 rounded px-1 mb-1 truncate" title={`${task.name} - ${assignedNames}`}>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-xs opacity-75">{assignedNames}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Vue Liste ---
const ListView: React.FC<{ tasks: ProjectTask[]; teamMembers: TeamMember[] }> = ({ tasks, teamMembers }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <TaskListView tasks={tasks} teamMembers={teamMembers} />
    </div>
  );
};

// --- Composant Principal ---
const GanttChart: React.FC<PlanningViewsProps> = ({ tasks, onTaskUpdate, teamMembers = [] }) => {
  type View = 'gantt' | 'calendar' | 'list';
  const [activeView, setActiveView] = useState<View>('gantt');

  const viewComponents: Record<View, React.ReactNode> = {
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
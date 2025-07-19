import React, { useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';

interface SimpleGanttChartProps {
  tasks: ProjectTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
}

const SimpleGanttChart: React.FC<SimpleGanttChartProps> = ({ tasks, onTaskUpdate }) => {
  const [viewMode, setViewMode] = useState<'weeks' | 'months'>('weeks');

  // Générer une timeline dynamique basée sur les dates des tâches
  const generateTimeline = () => {
    const today = new Date();
    
    // Collecter toutes les dates des tâches
    const taskDates: Date[] = [];
    tasks.forEach(task => {
      if (task.startDate) taskDates.push(new Date(task.startDate));
      if (task.dueDate) taskDates.push(new Date(task.dueDate));
      if (task.endDate) taskDates.push(new Date(task.endDate));
    });
    
    let startDate: Date, endDate: Date;
    
    if (taskDates.length > 0) {
      // Utiliser les dates des tâches avec une marge
      const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));
      
      startDate = new Date(minDate);
      endDate = new Date(maxDate);
      
      // Ajouter une marge
      if (viewMode === 'weeks') {
        startDate.setDate(startDate.getDate() - 14); // 2 semaines avant
        endDate.setDate(endDate.getDate() + 14); // 2 semaines après
      } else {
        startDate.setMonth(startDate.getMonth() - 1); // 1 mois avant
        endDate.setMonth(endDate.getMonth() + 1); // 1 mois après
      }
    } else {
      // Timeline par défaut si pas de dates
      startDate = new Date(today);
      endDate = new Date(today);
      
      if (viewMode === 'weeks') {
        startDate.setDate(startDate.getDate() - 42); // 6 semaines
        endDate.setDate(endDate.getDate() + 42);
      } else {
        startDate.setMonth(startDate.getMonth() - 6); // 6 mois
        endDate.setMonth(endDate.getMonth() + 6);
      }
    }
    
    const timeline = [];
    const current = new Date(startDate);
    
    while (current <= endDate && timeline.length < 20) { // Limite à 20 colonnes max
      timeline.push({
        date: new Date(current),
        label: viewMode === 'weeks' 
          ? `S${Math.ceil(current.getDate() / 7)}/${current.getMonth() + 1}`
          : current.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      });
      
      if (viewMode === 'weeks') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return timeline;
  };

  const timeline = generateTimeline();

  // Calculer la position d'une tâche
  const getTaskPosition = (task: ProjectTask) => {
    // Utiliser les propriétés correctes de ProjectTask
    const startDate = task.startDate;
    const endDate = task.dueDate || task.endDate;
    
    if (!startDate || !endDate) {
      // Si pas de dates, retourner null pour ne pas afficher de barre
      return null;
    }

    const taskStart = new Date(startDate);
    const taskEnd = new Date(endDate);
    const timelineStart = timeline[0].date;
    const timelineEnd = timeline[timeline.length - 1].date;

    // Si la tâche est complètement en dehors de la timeline visible
    if (taskEnd < timelineStart || taskStart > timelineEnd) {
      return null;
    }

    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const taskStartOffset = Math.max(0, taskStart.getTime() - timelineStart.getTime());
    const taskDuration = taskEnd.getTime() - Math.max(taskStart.getTime(), timelineStart.getTime());

    const leftPercent = (taskStartOffset / totalDuration) * 100;
    const widthPercent = Math.min((taskDuration / totalDuration) * 100, 100 - leftPercent);

    return {
      left: `${Math.max(leftPercent, 0)}%`,
      width: `${Math.max(widthPercent, 3)}%` // Minimum 3% de largeur pour visibilité
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête avec sélecteur de vue */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Planning Simplifié</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'weeks' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setViewMode('weeks')}
          >
            Semaines
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'months' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setViewMode('months')}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-3 p-3 border-r border-gray-200 bg-gray-100">
            <div className="text-sm font-semibold text-gray-700">Tâches</div>
          </div>
          <div className="col-span-9 grid grid-cols-12 gap-0">
            {timeline.map((item, index) => (
              <div key={index} className="p-2 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-xs font-medium text-gray-600">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tâches */}
      <div className="max-h-80 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune tâche à afficher
            </h3>
            <p className="text-gray-600">
              Créez des tâches pour voir votre planning.
            </p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const position = getTaskPosition(task);
            
            return (
              <div key={task.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-0 min-h-[60px]">
                  {/* Nom de la tâche */}
                  <div className="col-span-3 p-3 border-r border-gray-200 flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </span>
                      </div>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{task.assignedTo.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Barre de Gantt */}
                  <div className="col-span-9 relative p-2 flex items-center">
                    <div className="w-full h-6 bg-gray-100 rounded relative overflow-hidden">
                      {/* Toujours afficher une barre, même sans position calculée */}
                      <div
                        className={`absolute top-0 h-full rounded shadow-sm cursor-pointer hover:shadow-md transition-all ${getStatusColor(task.status)} opacity-80`}
                        style={{
                          left: position?.left || '10%',
                          width: position?.width || '25%'
                        }}
                        onClick={() => onTaskUpdate && onTaskUpdate(task.id, task)}
                        title={`${task.name} - Du ${task.startDate ? new Date(task.startDate).toLocaleDateString('fr-FR') : 'Non définie'} au ${(task.dueDate || task.endDate) ? new Date(task.dueDate || task.endDate!).toLocaleDateString('fr-FR') : 'Non définie'}`}
                      >
                        {/* Barre de progression */}
                        <div 
                          className="h-full bg-white/30 transition-all duration-300"
                          style={{ width: `${(task as any).progress || Math.floor(Math.random() * 60) + 20}%` }}
                        />
                        
                        {/* Contenu de la barre */}
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs text-white font-medium truncate">
                            {task.name}
                          </span>
                          <span className="text-xs text-white/80 ml-auto">
                            {(task as any).progress || Math.floor(Math.random() * 60) + 20}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Ligne aujourd'hui */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: '50%' }}
                        title="Aujourd'hui"
                      >
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Légende */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-600">En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">Bloqué</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;

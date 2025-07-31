import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
} from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';

// Types pour le composant
type ColorBy = 'status' | 'priority' | 'assignee';

// Interface des props du composant
interface AdvancedGanttChartProps {
  tasks: ProjectTask[];
  teamMembers: TeamMember[];
  visibleStartDate: Date;
  setVisibleStartDate: (date: Date) => void;
  daysToShow: number;
}



const AdvancedGanttChart: React.FC<AdvancedGanttChartProps> = ({
  tasks,
  teamMembers,
  visibleStartDate,
  setVisibleStartDate,
  daysToShow
}) => {
  // Debug - afficher les vraies données des tâches
  useEffect(() => {
    console.log('🔍 Debug Gantt - Tasks reçues:', tasks);
    tasks.forEach((task, index) => {
      const taskEndDate = task.dueDate || task.endDate;
      console.log(`📋 Tâche ${index + 1} - ANALYSE DÉTAILLÉE:`, {
        name: task.name,
        startDate: task.startDate,
        dueDate: task.dueDate,
        endDate: task.endDate,
        taskEndDate: taskEndDate,
        startDateType: typeof task.startDate,
        endDateType: typeof taskEndDate,
        startDateParsed: task.startDate ? new Date(task.startDate) : null,
        endDateParsed: taskEndDate ? new Date(taskEndDate) : null,
        startDateValid: task.startDate ? !isNaN(new Date(task.startDate).getTime()) : false,
        endDateValid: taskEndDate ? !isNaN(new Date(taskEndDate).getTime()) : false,
        rawTask: task
      });
      
      // Test de parsing des dates
      if (task.startDate && taskEndDate) {
        const start = new Date(task.startDate);
        const end = new Date(taskEndDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`📅 Calcul durée tâche "${task.name}":`, {
          startFormatted: start.toLocaleDateString('fr-FR'),
          endFormatted: end.toLocaleDateString('fr-FR'),
          durationDays: diffDays,
          startISO: start.toISOString(),
          endISO: end.toISOString()
        });
      }
    });
  }, [tasks]);

  // Calcul de la date de fin visible
  const visibleEndDate = useMemo(() => {
    const d = new Date(visibleStartDate);
    d.setDate(d.getDate() + daysToShow - 1);
    return d;
  }, [visibleStartDate, daysToShow]);

  // Générer la timeline sur la période visible
  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(visibleStartDate);
      date.setDate(visibleStartDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [visibleStartDate, daysToShow]);

  // Navigation
  const goPrev = () => {
    const d = new Date(visibleStartDate);
    d.setDate(d.getDate() - daysToShow);
    setVisibleStartDate(d);
  };

  const goNext = () => {
    const d = new Date(visibleStartDate);
    d.setDate(d.getDate() + daysToShow);
    setVisibleStartDate(d);
  };

  const goToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setVisibleStartDate(d);
  };

  // Fonction pour ajuster la vue aux tâches
  const fitToTasks = () => {
    if (tasks.length === 0) return;
    
    const taskDates = tasks
      .filter(task => task.startDate && (task.dueDate || task.endDate))
      .map(task => {
        const endDate = task.dueDate || task.endDate;
        return {
          start: new Date(task.startDate!),
          end: new Date(endDate!)
        };
      }); 
    
    if (taskDates.length === 0) return;
    
    const minDate = new Date(Math.min(...taskDates.map(d => d.start.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.end.getTime())));
    
    // Ajouter une marge de 2 jours avant et après
    minDate.setDate(minDate.getDate() - 2);
    minDate.setHours(0, 0, 0, 0);
    
    console.log('📅 Ajustement vue aux tâches:', {
      minDate: minDate.toLocaleDateString('fr-FR'),
      maxDate: maxDate.toLocaleDateString('fr-FR'),
      tasksCount: tasks.length
    });
    
    setVisibleStartDate(minDate);
  };

  // Calcul de la position et largeur des barres de tâches
  const getTaskBar = (task: ProjectTask) => {
    // Accepter soit dueDate soit endDate comme date de fin
    const taskEndDate = task.dueDate || task.endDate;
    
    if (!task.startDate || !taskEndDate) {
      console.log('❌ Tâche sans dates:', {
        name: task.name,
        startDate: task.startDate,
        dueDate: task.dueDate,
        endDate: task.endDate
      });
      return null;
    }
    
    const start = new Date(task.startDate);
    const end = new Date(taskEndDate);
    
    console.log('🔍 Analyse tâche:', {
      name: task.name,
      start: start.toLocaleDateString('fr-FR'),
      end: end.toLocaleDateString('fr-FR'),
      visibleStart: visibleStartDate.toLocaleDateString('fr-FR'),
      visibleEnd: visibleEndDate.toLocaleDateString('fr-FR')
    });
    
    // Vérifier si la tâche intersecte avec la période visible
    if (end < visibleStartDate || start > visibleEndDate) {
      console.log('❌ Tâche hors période visible:', task.name);
      return null;
    }
    
    // Calculer la position et largeur RÉELLES de la tâche (pas coupées)
    // Position : nombre de jours entre le début de la fenêtre et le début de la tâche
    const leftDays = (start.getTime() - visibleStartDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Largeur : durée totale de la tâche en jours
    const totalDurationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Indicateurs pour les débordements
    const startsBeforeWindow = start < visibleStartDate;
    const endsAfterWindow = end > visibleEndDate;
    
    console.log('🔍 Calcul barre CORRIGÉ:', {
      taskName: task.name,
      realStartDate: start.toLocaleDateString('fr-FR'),
      realEndDate: end.toLocaleDateString('fr-FR'),
      windowStart: visibleStartDate.toLocaleDateString('fr-FR'),
      windowEnd: visibleEndDate.toLocaleDateString('fr-FR'),
      leftDays: leftDays,
      totalDurationDays: totalDurationDays,
      startsBeforeWindow,
      endsAfterWindow
    });
    
    console.log('✅ Barre calculée:', {
      name: task.name,
      leftDays,
      widthDays: totalDurationDays,
      leftPx: leftDays * 40,
      widthPx: totalDurationDays * 40,
      startsBeforeWindow,
      endsAfterWindow
    });
    
    return { 
      left: Math.round(leftDays), 
      width: Math.round(totalDurationDays),
      startsBeforeWindow,
      endsAfterWindow
    };
  };
  // États du composant
  const [colorBy] = useState<ColorBy>('status');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fonction pour formater les dates
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };



  // Fonction pour obtenir la couleur d'une tâche selon le critère sélectionné
  const getTaskColor = (task: ProjectTask): string => {
    switch (colorBy) {
      case 'status':
        switch (task.status) {
          case 'todo': return 'bg-gray-400';
          case 'in_progress': return 'bg-blue-500';
          case 'done': return 'bg-green-500';
          default: return 'bg-gray-400';
        }
      case 'priority':
        switch (task.priority) {
          case 'low': return 'bg-green-400';
          case 'medium': return 'bg-yellow-500';
          case 'high': return 'bg-orange-500';
          case 'urgent': return 'bg-red-500';
          default: return 'bg-gray-400';
        }
      case 'assignee': {
        if (!task.assignedTo) return 'bg-gray-400';
        const assigneeId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        const index = teamMembers.findIndex(m => m.id === assigneeId);
        return colors[index % colors.length] || 'bg-gray-400';
      }
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête avec contrôles */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <BarChart3 className="mr-2" />
            Gantt Avancé
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <span>-</span>
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <span>+</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goPrev}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToday}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goNext}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            →
          </button>
          <button
            onClick={fitToTasks}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs"
            title="Ajuster la vue pour afficher toutes les tâches"
          >
            Ajuster aux tâches
          </button>
        </div>
      </div>
      
      {/* Informations de debug */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="text-sm text-yellow-800">
          <strong>🔍 Debug Info:</strong>
          <div>Tâches: {tasks.length} | Période: {visibleStartDate.toLocaleDateString('fr-FR')} - {visibleEndDate.toLocaleDateString('fr-FR')}</div>
          <div>Tâches avec dates: {tasks.filter(t => t.startDate && t.dueDate).length}</div>
          {tasks.length > 0 && (
            <div className="mt-2">
              <strong>Détail des tâches:</strong>
              {tasks.map(task => (
                <div key={task.id} className="ml-2 text-xs">
                  {task.name}: {task.startDate ? new Date(task.startDate).toLocaleDateString('fr-FR') : 'Pas de début'} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Pas de fin'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline et barres de tâches */}
      <div className="overflow-x-auto">
        <div className="relative min-w-[700px]">
          {/* Timeline (dates) */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {timelineDates.map((date, idx) => (
              <div
                key={idx}
                className={`flex-1 text-xs text-center py-1 border-r border-gray-100 ${
                  date.toDateString() === new Date().toDateString() 
                    ? 'bg-blue-100 text-blue-700 font-semibold' 
                    : 'text-gray-600'
                }`}
                style={{ minWidth: 40 }}
              >
                {formatDate(date)}
              </div>
            ))}
          </div>
          
          {/* Barres de tâches */}
          <div className="relative bg-gray-50" style={{ height: Math.max(tasks.length * 32, 100) }}>
            {tasks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Aucune tâche à afficher
              </div>
            ) : (
              tasks.map((task, idx) => {
                const bar = getTaskBar(task);
                if (!bar) {
                  return (
                    <div
                      key={task.id}
                      className="absolute h-6 bg-red-200 border border-red-400 flex items-center text-red-800 text-xs px-2 rounded"
                      style={{
                        left: 0,
                        width: '200px',
                        top: idx * 32 + 4,
                      }}
                      title={`Tâche hors période: ${task.name}`}
                    >
                      🙅 {task.name} (hors période)
                    </div>
                  );
                }
                return (
                  <div
                    key={task.id}
                    className={`absolute h-6 rounded ${getTaskColor(task)} flex items-center text-white text-xs px-2 shadow-md border-2 border-white`}
                    style={{
                      left: `${bar.left * 40}px`,
                      width: `${Math.max(bar.width * 40, 80)}px`,
                      top: idx * 32 + 4,
                      zIndex: 10,
                    }}
                    title={`${task.name} (${bar.left}j, ${bar.width}j)`}
                  >
                    ✅ {task.name}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Légende */}
      <div className="bg-gray-50 p-4 border-t">
        <h4 className="font-semibold text-gray-700 mb-2">
          Légende - Coloration par {colorBy === 'status' ? 'statut' : colorBy === 'priority' ? 'priorité' : 'assigné'}
        </h4>
        <div className="flex flex-wrap gap-4">
          {colorBy === 'status' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-600">À faire</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">En cours</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Terminé</span>
              </div>
            </>
          )}
          {colorBy === 'priority' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-sm text-gray-600">Faible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Moyenne</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Élevée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Urgente</span>
              </div>
            </>
          )}
          {colorBy === 'assignee' && (
            <>
              {teamMembers.slice(0, 5).map((member, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                return (
                  <div key={member.id} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${colors[index]} rounded`}></div>
                    <span className="text-sm text-gray-600">{member.name}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedGanttChart;

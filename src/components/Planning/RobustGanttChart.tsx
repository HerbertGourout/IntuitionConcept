import React, { useMemo } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';

// Interface robuste avec validation
interface RobustGanttChartProps {
  tasks: ProjectTask[];
  teamMembers: TeamMember[];
  visibleStartDate: Date;
  setVisibleStartDate: (date: Date) => void;
  daysToShow: number;
}

// Utilitaires de dates robustes
class DateUtils {
  static parseDate(dateInput: string | Date | undefined): Date | null {
    if (!dateInput) return null;
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      
      // Normaliser à minuit UTC pour éviter les problèmes de fuseau
      date.setUTCHours(0, 0, 0, 0);
      return date;
    } catch {
      return null;
    }
  }
  
  static formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short' 
    });
  }
  
  static daysBetween(start: Date, end: Date): number {
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// Classe pour gérer les tâches avec validation
class TaskProcessor {
  static validateTask(task: ProjectTask): {
    isValid: boolean;
    startDate: Date | null;
    endDate: Date | null;
    duration: number;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Priorité : dueDate > endDate pour compatibilité
    const endDateValue = task.dueDate || task.endDate;
    
    const startDate = DateUtils.parseDate(task.startDate);
    const endDate = DateUtils.parseDate(endDateValue);
    
    if (!startDate) errors.push('Date de début invalide');
    if (!endDate) errors.push('Date de fin invalide');
    
    let duration = 0;
    if (startDate && endDate) {
      duration = DateUtils.daysBetween(startDate, endDate) + 1;
      if (duration <= 0) errors.push('La date de fin doit être après la date de début');
    }
    
    return {
      isValid: errors.length === 0,
      startDate,
      endDate,
      duration,
      errors
    };
  }
  
  static getTaskColor(task: ProjectTask): string {
    switch (task.status) {
      case 'todo': return 'bg-gray-400';
      case 'planned': return 'bg-purple-500';
      case 'in_progress': return 'bg-blue-500';
      case 'done': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  }
}

// Classe pour calculer les positions des barres
class BarCalculator {
  static calculateBar(
    task: ProjectTask,
    visibleStart: Date,
    visibleEnd: Date,
    dayWidth: number = 40
  ): {
    left: number;
    width: number;
    isVisible: boolean;
    startsBeforeWindow: boolean;
    endsAfterWindow: boolean;
    clippedLeft: number;
    clippedWidth: number;
  } | null {
    
    const validation = TaskProcessor.validateTask(task);
    if (!validation.isValid || !validation.startDate || !validation.endDate) {
      console.warn(`❌ Tâche "${task.name}" invalide:`, validation.errors);
      return null;
    }

    // Normalisation UTC minuit
    const norm = (d: Date) => { const n = new Date(d); n.setUTCHours(0,0,0,0); return n; };
    const start = norm(validation.startDate);
    const end = norm(validation.endDate);
    const windowStart = norm(visibleStart);
    const windowEnd = norm(visibleEnd);

    // Vérifier si la tâche intersecte avec la fenêtre visible
    const isVisible = !(end < windowStart || start > windowEnd);
    if (!isVisible) {
      return null;
    }

    // Clipping effectif
    const clippedStart = start < windowStart ? windowStart : start;
    const clippedEnd = end > windowEnd ? windowEnd : end;
    
    // Décalage à gauche (jours depuis début de fenêtre)
    const leftDays = DateUtils.daysBetween(windowStart, clippedStart);
    const durationDays = DateUtils.daysBetween(clippedStart, clippedEnd) + 1;
    
    // Position et largeur clippées
    const clippedLeft = leftDays * dayWidth;
    const clippedWidth = durationDays * dayWidth;
    
    const startsBeforeWindow = start < windowStart;
    const endsAfterWindow = end > windowEnd;
    
    console.log('🟦 CLIP DEBUG', {
      name: task.name,
      start, end, windowStart, windowEnd,
      clippedStart, clippedEnd,
      leftDays, durationDays, clippedLeft, clippedWidth
    });
    
    const left = leftDays * dayWidth;
    const width = durationDays * dayWidth;
    
    return {
      left,
      width,
      isVisible,
      startsBeforeWindow,
      endsAfterWindow,
      clippedLeft,
      clippedWidth
    };
  }
}

const RobustGanttChart: React.FC<RobustGanttChartProps> = ({
  tasks,
  teamMembers,
  visibleStartDate,
  setVisibleStartDate,
  daysToShow
}) => {
  const [debug, setDebug] = React.useState(false);
  const dayWidth = 40;

  const processedTasks = useMemo(() => {
    return tasks.map(task => {
      const validation = TaskProcessor.validateTask(task);
      return {
        ...task,
        validation,
        color: TaskProcessor.getTaskColor(task)
      };
    }).filter(task => task.validation.isValid);
  }, [tasks]);

  const visibleEndDate = useMemo(() => {
    return DateUtils.addDays(visibleStartDate, daysToShow - 1);
  }, [visibleStartDate, daysToShow]);

  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      dates.push(DateUtils.addDays(visibleStartDate, i));
    }
    return dates;
  }, [visibleStartDate, daysToShow]);

  const taskBars = useMemo(() => {
    return processedTasks.map(task => ({
      task,
      bar: BarCalculator.calculateBar(task, visibleStartDate, visibleEndDate, dayWidth)
    })).filter(item => item.bar !== null);
  }, [processedTasks, visibleStartDate, visibleEndDate, dayWidth]);

  // Navigation
  const goPrev = () => {
    setVisibleStartDate(DateUtils.addDays(visibleStartDate, -daysToShow));
  };

  const goNext = () => {
    setVisibleStartDate(DateUtils.addDays(visibleStartDate, daysToShow));
  };

  const goToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setVisibleStartDate(DateUtils.addDays(today, -Math.floor(daysToShow / 2)));
  };

  const fitToTasks = () => {
    if (processedTasks.length === 0) return;
    
    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;
    
    processedTasks.forEach(task => {
      if (task.validation.startDate && task.validation.endDate) {
        if (!earliestStart || task.validation.startDate < earliestStart) {
          earliestStart = task.validation.startDate;
        }
        if (!latestEnd || task.validation.endDate > latestEnd) {
          latestEnd = task.validation.endDate;
        }
      }
    });
    
    if (earliestStart) {
      setVisibleStartDate(DateUtils.addDays(earliestStart, -2));
    }
  };

  // Fonction pour obtenir les noms des membres assignés
  const getAssignedMemberNames = (assignedTo: string[] = []): string => {
    if (!assignedTo || assignedTo.length === 0) return 'Non assigné';
    
    const names = assignedTo.map(id => {
      const member = teamMembers.find(m => m.id === id);
      return member ? member.name : `ID:${id}`;
    });
    
    return names.join(', ');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header avec contrôles */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Gantt Avancé Robuste</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Période précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToday}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Aujourd'hui
            </button>
            
            <button
              onClick={goNext}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Période suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={fitToTasks}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Target className="w-4 h-4" />
              Ajuster aux tâches
            </button>
            
            {/* Switch debug visuel */}
            <label className="flex items-center gap-1 ml-3 cursor-pointer select-none">
              <input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} />
              <span className="text-xs">Debug visuel</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Informations de debug */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <strong>Tâches valides:</strong> {processedTasks.length}/{tasks.length}
          </div>
          <div>
            <strong>Période visible:</strong> {DateUtils.formatDate(visibleStartDate)} - {DateUtils.formatDate(visibleEndDate)}
          </div>
          <div>
            <strong>Barres affichées:</strong> {taskBars.length}
          </div>
          <div>
            <strong>Largeur jour:</strong> {dayWidth}px
          </div>
        </div>
        {debug && (
          <div className="mt-2 text-xs text-red-700">
            <strong>MODE DEBUG VISUEL ACTIVÉ</strong> : surlignage, overlays, alertes. Vérifiez les valeurs left/width et la synchronisation timeline/barres.
          </div>
        )}
      </div>

      {/* Timeline et barres */}
      <div className="overflow-x-auto">
        <div className="relative w-full flex justify-center">
          <div className="relative" style={{ width: daysToShow * dayWidth, minWidth: daysToShow * dayWidth, maxWidth: daysToShow * dayWidth }}>
            {/* Timeline (dates) */}
            <div className="flex border-b border-gray-200 bg-gray-50 relative" style={{ width: daysToShow * dayWidth, minWidth: daysToShow * dayWidth, maxWidth: daysToShow * dayWidth }}>
            {timelineDates.map((date, idx) => {
              return (
                <div
                  key={idx}
                  className={`text-xs text-center py-2 border-r border-gray-100 ${
                    date.toDateString() === new Date().toDateString()
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600'
                  } ${debug ? 'relative' : ''}`}
                  style={{
                    width: `${dayWidth}px`,
                    minWidth: `${dayWidth}px`,
                    maxWidth: `${dayWidth}px`,
                    flex: 'none',
                    borderTop: debug ? '2px solid red' : undefined
                  }}
                >
                  {DateUtils.formatDate(date)}
                  {debug && (
                    <div className="absolute left-0 top-0 w-full text-[10px] text-red-600 bg-white/80 border-t border-red-400">
                      #{idx} | {date.toISOString().slice(0, 10)} | {idx * dayWidth}px
                    </div>
                  )}
                </div>
              );
            })}
            {debug && (
              <div className="absolute inset-0 pointer-events-none border-2 border-red-500 rounded-xl z-40"></div>
            )}
          </div>

          {/* Barres de tâches */}
          <div
            className="relative bg-gray-50"
            style={{
              height: processedTasks.length > 0 ? processedTasks.length * 40 + 8 : 60,
              width: daysToShow * dayWidth,
              minWidth: daysToShow * dayWidth,
              maxWidth: daysToShow * dayWidth
            }}
          >
            {processedTasks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Aucune tâche valide à afficher
              </div>
            ) : (
              taskBars.map(({ task, bar }, idx) => {
                return (
                  <div key={task.id} className="relative">
                    {/* Barre de tâche */}
                    <div
                      className={`absolute h-8 rounded ${task.color} flex items-center text-white text-xs px-2 shadow-md border-2 border-white overflow-hidden ${debug ? 'ring-2 ring-red-400' : ''}`}
                      style={{
                        left: `${bar!.clippedLeft}px`,
                        width: `${bar!.clippedWidth}px`,
                        top: idx * 40 + 4,
                        zIndex: 10
                      }}
                      title={`${task.name} | ${getAssignedMemberNames(task.assignedTo)} | ${task.validation.duration} jours`}
                    >
                      {debug && (
                        <div className="absolute left-0 top-0 text-[10px] bg-white text-red-700 border border-red-300 px-1 z-50 pointer-events-none">
                          left: {bar!.clippedLeft}px
                          <br />
                          width: {bar!.clippedWidth}px
                        </div>
                      )}
                      {/* Indicateur de débordement à gauche */}
                      {bar!.startsBeforeWindow && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />
                      )}
                      <span className="truncate flex-1">
                        {task.name}
                      </span>
                      {/* Indicateur de débordement à droite */}
                      {bar!.endsAfterWindow && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />
                      )}
                    </div>
                    {/* Ligne de tâche (fond) */}
                    <div
                      className="absolute h-8 bg-gray-100 border border-gray-200"
                      style={{
                        left: 0,
                        width: `${daysToShow * dayWidth}px`,
                        top: idx * 40 + 4,
                        zIndex: 1
                      }}
                    />
                    {debug && (!bar || bar.clippedWidth <= 0) && (
                      <div className="absolute left-0 top-0 text-xs text-red-700 bg-white px-2 rounded shadow z-50">
                        ⚠️ Tâche hors fenêtre ou largeur nulle !
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {/* Ligne "aujourd'hui" */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayOffset = DateUtils.daysBetween(visibleStartDate, today);
              
              if (todayOffset >= 0 && todayOffset < daysToShow) {
                // Calculer la position en pixels
                const positionPx = todayOffset * dayWidth + dayWidth / 2;
                
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${positionPx}px` }}
                    title="Aujourd'hui"
                  />
                );
              }
              return null;
            })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Légende */}
      <div className="bg-gray-50 p-4 border-t">
        <h4 className="font-semibold text-gray-700 mb-2">Légende - Statuts des tâches</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>À faire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Planifié</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Bloqué</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>En attente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobustGanttChart;

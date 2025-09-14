import React, { useMemo } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import SectionHeader from '../UI/SectionHeader';

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
      
      // Normaliser à minuit LOCAL pour rester cohérent avec l'UI et éviter les décalages
      date.setHours(0, 0, 0, 0);
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
    // Les dates étant normalisées à minuit local, un floor est plus sûr pour éviter les +1 accidentels
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
    // Autoriser les tâches avec seulement une date de début: fallback sur startDate pour créer une barre d'1 jour
    const endDateValue = task.dueDate || task.endDate || task.startDate;
    
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

// Classe pour calculer les positions des barres avec pourcentages
class BarCalculator {
  static calculateBar(
    task: ProjectTask,
    visibleStart: Date,
    visibleEnd: Date,
    daysToShow: number
  ): {
    leftPercent: number;
    widthPercent: number;
    isVisible: boolean;
    startsBeforeWindow: boolean;
    endsAfterWindow: boolean;
  } | null {
    
    const validation = TaskProcessor.validateTask(task);
    if (!validation.isValid || !validation.startDate || !validation.endDate) {
      console.warn(`❌ Tâche "${task.name}" invalide:`, validation.errors);
      return null;
    }

    // Normalisation à minuit LOCAL (cohérente avec DateUtils)
    const norm = (d: Date) => { const n = new Date(d); n.setHours(0,0,0,0); return n; };
    const start = norm(validation.startDate);
    const end = norm(validation.endDate);
    const windowStart = norm(visibleStart);
    const windowEnd = norm(visibleEnd);

    // Vérifier si la tâche intersecte avec la fenêtre visible
    const isVisible = !(end < windowStart || start > windowEnd);
    if (!isVisible) {
      return null;
    }

    // Calcul des indicateurs de débordement
    const startsBeforeWindow = start < windowStart;
    const endsAfterWindow = end > windowEnd;
    
    // Clipping effectif
    const clippedStart = start < windowStart ? windowStart : start;
    const clippedEnd = end > windowEnd ? windowEnd : end;
    
    // Calcul en jours depuis le début de la fenêtre
    const leftDays = DateUtils.daysBetween(windowStart, clippedStart);
    const durationDays = DateUtils.daysBetween(clippedStart, clippedEnd) + 1;
    
    // Vérifications de sécurité
    if (durationDays <= 0) {
      console.warn(`⚠️ Durée nulle pour "${task.name}"`);
      return null;
    }
    
    // Calcul en pourcentage pour s'adapter à la largeur disponible
    const leftPercent = Math.max(0, (leftDays / daysToShow) * 100);
    const widthPercent = Math.min((durationDays / daysToShow) * 100, ((daysToShow - leftDays) / daysToShow) * 100);
    
    // Debug logs removed for production
    
    return {
      leftPercent,
      widthPercent,
      isVisible,
      startsBeforeWindow,
      endsAfterWindow
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
  // Debug mode removed for production
  const rowHeight = 44; // Hauteur de ligne compacte

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

  // Calcul des barres avec clipping en pourcentages
  const taskBars = useMemo(() => {
    return processedTasks.map(task => {
      const bar = BarCalculator.calculateBar(task, visibleStartDate, visibleEndDate, daysToShow);
      return { task: { ...task, color: TaskProcessor.getTaskColor(task) }, bar };
    }).filter(item => item.bar !== null);
  }, [processedTasks, visibleStartDate, visibleEndDate, daysToShow]);

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
      {/* Header harmonisé */}
      <div className="glass-card p-4">
        <SectionHeader
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          title="Gantt Avancé Robuste"
          actions={(
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Période précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={goNext}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Période suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={fitToTasks}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Target className="w-4 h-4" />
                Ajuster aux tâches
              </button>
              {/* Debug mode removed for production */}
            </div>
          )}
        />
      </div>
      
      {/* Informations de debug */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <strong>Tâches valides:</strong> {processedTasks.length}/{tasks.length}
          </div>
          <div>
            <strong>Période visible:</strong> {DateUtils.formatDate(visibleStartDate)} - {DateUtils.formatDate(visibleEndDate)}
          </div>
          <div>
            <strong>Barres affichées:</strong> {taskBars.length}
          </div>
        </div>
        {/* Debug mode removed for production */}
      </div>

      {/* Timeline et barres */}
      <div className="overflow-x-auto">
        <div className="relative w-full">
          <div className="relative w-full">
            {/* Timeline (dates) - sticky header */}
            <div className="flex border-b border-gray-200 bg-gray-50 w-full sticky top-0 z-30">
              {timelineDates.map((date, idx) => (
                <div
                  key={idx}
                  className={`text-xs font-medium text-gray-600 text-center border-r border-gray-200 last:border-r-0 py-2 px-1 flex-1 ${date.toDateString() === new Date().toDateString()
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {DateUtils.formatDate(date)}
                </div>
              ))}
            </div>
            {/* Barres de tâches - conteneur scrollable */}
            <div
              className="relative bg-white w-full max-h-[480px] overflow-y-auto"
              style={{ height: Math.max(processedTasks.length * rowHeight + 24, 120) }}
            >
              {processedTasks.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Aucune tâche valide à afficher
                </div>
              ) : (
                taskBars.map(({ task, bar }, idx) => (
                  <div key={task.id} className="relative">
                    {/* Barre de tâche */}
                    <div
                      className={`absolute h-9 rounded-lg ${task.color} flex items-center text-white text-sm px-3 shadow-md border border-white/30 overflow-hidden`}
                      style={{
                        left: `${bar!.leftPercent}%`,
                        width: `${bar!.widthPercent}%`,
                        top: idx * rowHeight + 10,
                        zIndex: 10
                      }}
                      title={`${task.name} | ${getAssignedMemberNames(task.assignedTo)} | ${task.validation.duration} jours`}
                    >
                      {/* Indicateurs de clipping gauche/droite */}
                      {bar!.startsBeforeWindow && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/30 to-transparent"
                          aria-hidden
                          title="Commence avant la fenêtre visible"
                        />
                      )}
                      {bar!.endsAfterWindow && (
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/30 to-transparent"
                          aria-hidden
                          title="Se termine après la fenêtre visible"
                        />
                      )}
                      <span className="truncate">{task.name}</span>
                    </div>
                    {/* Ligne de tâche (fond) */}
                    <div
                      className="absolute h-9 bg-gray-50 border border-gray-200 rounded-md w-full"
                      style={{
                        left: 0,
                        top: idx * rowHeight + 10,
                        zIndex: 1
                      }}
                    />
                  </div>
                ))
              )}
              {/* Ligne verticale pour aujourd'hui */}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayOffset = DateUtils.daysBetween(visibleStartDate, today);
                if (todayOffset >= 0 && todayOffset < daysToShow) {
                  const positionPercent = (todayOffset + 0.5) / daysToShow * 100;
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                      style={{ left: `${positionPercent}%` }}
                      title="Aujourd'hui"
                    />
                  );
                }
                return null;
              })()}
            </div>
            {/* Fin barres de tâches */}
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

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
    
    const { startDate, endDate, duration } = validation;
    
    // Vérifier si la tâche intersecte avec la fenêtre visible
    const isVisible = !(endDate < visibleStart || startDate > visibleEnd);
    if (!isVisible) {
      return null;
    }
    
    // Calculs de position RÉELS (non clippés)
    const leftDays = DateUtils.daysBetween(visibleStart, startDate);
    const left = leftDays * dayWidth;
    const width = duration * dayWidth;
    
    // Indicateurs de débordement
    const startsBeforeWindow = startDate < visibleStart;
    const endsAfterWindow = endDate > visibleEnd;
    
    // Calculs clippés pour l'affichage - CORRECTION DÉFINITIVE
    const clippedStartDate = startDate < visibleStart ? visibleStart : startDate;
    const clippedEndDate = endDate > visibleEnd ? visibleEnd : endDate;
    
    const clippedLeftDays = DateUtils.daysBetween(visibleStart, clippedStartDate);
    const clippedDuration = DateUtils.daysBetween(clippedStartDate, clippedEndDate) + 1;
    
    // CORRECTION DÉFINITIVE: Clipper VRAIMENT la largeur à la fenêtre visible
    const clippedLeft = Math.max(0, clippedLeftDays * dayWidth);
    const clippedWidth = Math.max(dayWidth, clippedDuration * dayWidth); // Largeur RÉELLEMENT clippée
    
    console.log(`📊 Barre calculée pour "${task.name}":`, {
      realLeft: left,
      realWidth: width,
      clippedLeft,
      clippedWidth,
      duration,
      startsBeforeWindow,
      endsAfterWindow
    });
    
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
  // Couleur par statut (logique intégrée dans TaskProcessor.getTaskColor)
  const dayWidth = 40;
  
  // Validation et traitement des tâches
  const processedTasks = useMemo(() => {
    console.log('🔄 Traitement des tâches:', tasks.length);
    
    return tasks.map(task => {
      const validation = TaskProcessor.validateTask(task);
      return {
        ...task,
        validation,
        color: TaskProcessor.getTaskColor(task)
      };
    }).filter(task => task.validation.isValid);
  }, [tasks]);
  
  // Calcul de la date de fin visible
  const visibleEndDate = useMemo(() => {
    return DateUtils.addDays(visibleStartDate, daysToShow - 1);
  }, [visibleStartDate, daysToShow]);
  
  // Génération de la timeline (fenêtre glissante de 14 jours)
  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      dates.push(DateUtils.addDays(visibleStartDate, i));
    }
    return dates;
  }, [visibleStartDate, daysToShow]);
  
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
    setVisibleStartDate(today);
  };
  
  const fitToTasks = () => {
    if (processedTasks.length === 0) return;
    
    const validDates = processedTasks
      .filter(task => task.validation.startDate && task.validation.endDate)
      .flatMap(task => [task.validation.startDate!, task.validation.endDate!]);
    
    if (validDates.length === 0) return;
    
    const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
    
    // Ajouter une marge
    const startWithMargin = DateUtils.addDays(minDate, -2);
    setVisibleStartDate(startWithMargin);
    
    console.log('📅 Vue ajustée aux tâches:', {
      minDate: DateUtils.formatDate(minDate),
      maxDate: DateUtils.formatDate(maxDate),
      tasksCount: processedTasks.length
    });
  };
  
  // Calcul de la largeur pour fenêtre de 14 jours (utiliser largeur disponible)
  const optimalWidth = useMemo(() => {
    // Utiliser une largeur plus grande pour étendre les colonnes
    // Au lieu de 560px (14*40), utiliser au moins 800px pour étendre les colonnes
    const minWidth = daysToShow * dayWidth; // 560px
    const expandedWidth = Math.max(minWidth, 800); // Au moins 800px pour étendre
    
    console.log('📀 Largeur fenêtre étendue:', {
      daysToShow,
      dayWidth,
      minWidth,
      expandedWidth,
      columnWidth: expandedWidth / daysToShow
    });
    
    return expandedWidth;
  }, [daysToShow, dayWidth]);
  
  // Calcul des barres pour toutes les tâches avec colonnes flexibles
  const taskBars = useMemo(() => {
    // Avec flex-1, chaque colonne prend la largeur disponible / nombre de colonnes
    // Nous utilisons une largeur de référence plus large pour que les barres s'étendent
    const flexColumnWidth = Math.max(dayWidth, 60); // Au moins 60px par colonne pour étendre
    
    console.log('📀 Calcul barres avec colonnes flexibles:', {
      dayWidth,
      flexColumnWidth,
      daysToShow
    });
    
    return processedTasks.map(task => ({
      task,
      bar: BarCalculator.calculateBar(task, visibleStartDate, visibleEndDate, flexColumnWidth)
    })).filter(item => item.bar !== null);
  }, [processedTasks, visibleStartDate, visibleEndDate, dayWidth, daysToShow]);
  
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
      </div>
      
      {/* Timeline et barres */}
      <div className="overflow-x-auto">
        <div className="relative w-full" style={{ minWidth: Math.max(optimalWidth, daysToShow * dayWidth) }}>
          {/* Timeline (dates) */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {timelineDates.map((date, idx) => {
              return (
                <div
                  key={idx}
                  className={`flex-1 text-xs text-center py-2 border-r border-gray-100 ${
                    date.toDateString() === new Date().toDateString() 
                      ? 'bg-blue-100 text-blue-700 font-semibold' 
                      : 'text-gray-600'
                  }`}
                  style={{ 
                    minWidth: `${dayWidth}px` // Largeur minimale pour éviter que les colonnes soient trop petites
                  }}
                >
                  {DateUtils.formatDate(date)}
                </div>
              );
            })}
          </div>
          
          {/* Barres de tâches */}
          <div 
            className="relative bg-gray-50" 
            style={{ 
              height: processedTasks.length > 0 ? processedTasks.length * 40 + 8 : 60,
              width: optimalWidth 
            }}
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
                    className={`absolute h-8 rounded ${task.color} flex items-center text-white text-xs px-2 shadow-md border-2 border-white overflow-hidden`}
                    style={{
                      left: `${bar!.clippedLeft}px`,
                      width: `${bar!.clippedWidth}px`,
                      top: idx * 40 + 4,
                      zIndex: 10,
                    }}
                    title={`${task.name} | ${getAssignedMemberNames(task.assignedTo)} | ${task.validation.duration} jours`}
                  >
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
                      width: `${optimalWidth}px`,
                      top: idx * 40 + 4,
                      zIndex: 1,
                    }}
                  />
                </div>
              ))
            )}
            
            {/* Ligne "aujourd'hui" */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayOffset = DateUtils.daysBetween(visibleStartDate, today);
              
              if (todayOffset >= 0 && todayOffset < daysToShow) {
                // Avec les colonnes flexibles, calculer la position en pourcentage
                const positionPercent = ((todayOffset + 0.5) / daysToShow) * 100;
                
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

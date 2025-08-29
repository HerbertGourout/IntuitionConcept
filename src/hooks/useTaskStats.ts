import { useMemo, useContext } from 'react';
import ProjectContext from '../contexts/ProjectContext';
import { ProjectPhase, ProjectTask } from '../contexts/projectTypes';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  completionPercentage: number;
  byPhase: Record<string, {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    completionPercentage: number;
  }>;
}

export const useTaskStats = (): TaskStats => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useTaskStats must be used within a ProjectProvider');
  }
  
  const { currentProject } = context;
  
  return useMemo(() => {
    if (!currentProject) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        blocked: 0,
        completionPercentage: 0,
        byPhase: {}
      };
    }

    const defaultStats = { 
      total: 0, 
      completed: 0, 
      inProgress: 0, 
      pending: 0, 
      blocked: 0,
      completionPercentage: 0,
      byPhase: {}
    };

    if (!currentProject?.phases) return defaultStats;

    const stats = { ...defaultStats };
    const phaseStats: Record<string, {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      blocked: number;
      completionPercentage: number;
    }> = {};

    // Initialiser les statistiques par phase
    currentProject.phases.forEach((phase: ProjectPhase) => {
      phaseStats[phase.id] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        blocked: 0,
        completionPercentage: 0
      };
    });

    // Compter les tâches par statut
    const countTask = (task: ProjectTask, phaseId?: string) => {
      const status = task.status || 'todo';
      
      // Mise à jour des statistiques globales
      stats.total++;
      if (status === 'done') stats.completed++;
      else if (status === 'in_progress') stats.inProgress++;
      else if (status === 'blocked') stats.blocked++;
      else stats.pending++;

      // Mise à jour des statistiques par phase
      if (phaseId) {
        phaseStats[phaseId].total++;
        if (status === 'done') phaseStats[phaseId].completed++;
        else if (status === 'in_progress') phaseStats[phaseId].inProgress++;
        else if (status === 'blocked') phaseStats[phaseId].blocked++;
        else phaseStats[phaseId].pending++;
      }

      // Compter les sous-tâches récursivement
      if (task.subTasks?.length) {
        task.subTasks.forEach((subTask: ProjectTask) => countTask(subTask, phaseId));
      }
    };

    // Parcourir toutes les phases et leurs tâches
    currentProject.phases.forEach((phase: ProjectPhase) => {
      if (phase.tasks) {
        phase.tasks.forEach(task => countTask(task, phase.id));
      }
    });

    // Calculer les pourcentages
    stats.completionPercentage = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;

    // Calculer les pourcentages par phase
    Object.keys(phaseStats).forEach(phaseId => {
      const phase = phaseStats[phaseId];
      phase.completionPercentage = phase.total > 0
        ? Math.round((phase.completed / phase.total) * 100)
        : 0;
    });

    return {
      ...stats,
      byPhase: phaseStats
    };
  }, [currentProject]);
};

export default useTaskStats;

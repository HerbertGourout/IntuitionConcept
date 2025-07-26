import type { ProjectPhase, ProjectTask } from './projectTypes';

// --- AGGREGATION AUTOMATIQUE DES DEPENSES ---
export function aggregatePhaseSpent(tasks: ProjectTask[]): number {
  return (tasks || []).reduce((sum: number, t: ProjectTask) => sum + (t.spent || 0), 0);
}

export function aggregateProjectSpent(phases: ProjectPhase[]): number {
  return (phases || []).reduce((sum: number, ph: ProjectPhase) => sum + aggregatePhaseSpent(ph.tasks || []), 0);
}

// --- Nettoyage de l'historique ---
export function cleanHistory(historyArr: Array<{date?: string, action?: string, user?: string, details?: string}>): {date: string, action: string, user: string, details: string}[] {
  return historyArr.map(entry => ({
    date: entry.date || new Date().toISOString(),
    action: entry.action || '',
    user: entry.user || 'Développeur',
    details: entry.details || ''
  }));
}

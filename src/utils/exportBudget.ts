import { Project } from '../contexts/projectTypes';

export function exportProjectBudgetToCSV(project: Project) {
  const lines = [];
  lines.push(['Phase', 'Tâche', 'Budget', 'Dépensé', 'Reste', 'Pourcentage'].join(','));
  (project.phases || []).forEach(phase => {
    (phase.tasks || []).forEach(task => {
      const taskBudget = task.budget ?? 0;
      const taskSpent = task.spent ?? 0;
      const reste = taskBudget - taskSpent;
      const pct = taskBudget > 0 ? (taskSpent / taskBudget) * 100 : 0;
      lines.push([
        phase.name,
        task.name,
        taskBudget,
        taskSpent,
        reste,
        pct.toFixed(1) + '%'
      ].join(','));
    });
  });
  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `budget_${project.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

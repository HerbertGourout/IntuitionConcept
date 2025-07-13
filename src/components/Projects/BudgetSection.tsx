import React from 'react';
import { BudgetOverview } from '../Costs/BudgetOverview';
import ProjectBudgetChart from './ProjectBudgetChart';
import PhaseBudgetChart from './PhaseBudgetChart';
import TaskBudgetChart from './TaskBudgetChart';
import { exportProjectBudgetToCSV } from '../../utils/exportBudget';

import type { Project } from '../../types/project';

interface BudgetSectionProps {
  project: Project;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ project }) => {
  // Adaptation des données pour BudgetOverview (si besoin)
  const overviewData = {
    name: project.name,
    budget: project.budget,
    actualSpent: project.spent,
    phases: (project.phases || []).map((ph) => ({
      id: ph.id,
      name: ph.name,
      estimatedCost: ph.budget,
      actualCost: ph.spent,
      completion: 0 // À adapter si suivi d'avancement
    }))
  };

  // Récupération des tâches avec nom de phase
  const allTasks = (project.phases || []).flatMap(phase =>
    (phase.tasks || []).map(task => ({
      id: task.id,
      name: task.title,
      budget: (task as { budget?: number }).budget ?? 0,
      spent: task.spent ?? 0,
      phaseName: phase.name
    }))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Synthèse budget</h2>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          onClick={() => exportProjectBudgetToCSV(project)}
        >
          Exporter CSV
        </button>
      </div>
      <BudgetOverview project={overviewData} />
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <ProjectBudgetChart budget={project.budget} spent={project.spent} />
        <PhaseBudgetChart phases={project.phases.map(ph => ({
          id: ph.id,
          name: ph.name,
          budget: ph.budget,
          spent: ph.spent
        }))} />
      </div>
      <TaskBudgetChart tasks={allTasks} />
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Détail des tâches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Phase</th>
                <th className="px-2 py-1 border">Tâche</th>
                <th className="px-2 py-1 border">Budget</th>
                <th className="px-2 py-1 border">Dépensé</th>
                <th className="px-2 py-1 border">Reste</th>
                <th className="px-2 py-1 border">%</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.map(task => {
                const reste = (task.budget ?? 0) - (task.spent ?? 0);
                const pct = task.budget > 0 ? (task.spent / task.budget) * 100 : 0;
                return (
                  <tr key={task.id}>
                    <td className="px-2 py-1 border">{task.phaseName}</td>
                    <td className="px-2 py-1 border">{task.name}</td>
                    <td className="px-2 py-1 border">{(task.budget ?? 0).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-2 py-1 border">{(task.spent ?? 0).toLocaleString('fr-FR')} FCFA</td>
                    <td className={`px-2 py-1 border ${reste < 0 ? 'text-red-600' : 'text-green-700'}`}>{reste.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-2 py-1 border">{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetSection;

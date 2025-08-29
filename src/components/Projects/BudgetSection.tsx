import React, { useState } from 'react';
import { BudgetOverview } from '../Costs/BudgetOverview';
import ExpenseList from '../Budget/ExpenseList';
import ExpenseForm from '../Budget/ExpenseForm';
import { useProjectContext } from '../../contexts/ProjectContext';
import type { FinancialRecord } from '../../types';
import ProjectBudgetChart from './ProjectBudgetChart';
import PhaseBudgetChart from './PhaseBudgetChart';
import { exportProjectBudgetToCSV } from '../../utils/exportBudget';

import type { Project } from '../../contexts/projectTypes';
// Removed unused MATERIALS_EQUIPMENTS and MaterialOrEquipment imports

interface BudgetSectionProps {
  project: Project;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ project }) => {
  const { expenses, addExpense, editExpense, deleteExpense } = useProjectContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinancialRecord | null>(null);

  // Filtrer les dépenses du projet courant
  const projectExpenses = expenses.filter(e => e.projectId === project.id);

  const handleAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };
  const handleEdit = (expense: FinancialRecord) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };
  const handleDelete = async (expenseId: string) => {
    await deleteExpense(expenseId);
  };
  const handleSubmit = async (data: Omit<FinancialRecord, 'id'>) => {
    if (editingExpense) {
      await editExpense(editingExpense.id, data);
    } else {
      await addExpense(data);
    }
    setModalOpen(false);
    setEditingExpense(null);
  };
  // Removed unused overviewData computed structure

  // Removed unused allTasks computation

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
      <BudgetOverview />
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <ProjectBudgetChart budget={project.budget} spent={project.spent} />
        <PhaseBudgetChart phases={(project.phases || []).map(ph => {
          // Calculer le budget et les dépenses de la phase à partir des tâches
          const phaseBudget = ph.tasks.reduce((sum, task) => sum + (task.budget || 0), 0);
          const phaseSpent = ph.tasks.reduce((sum, task) => sum + (task.spent || 0), 0);
          return {
            id: ph.id,
            name: ph.name,
            budget: phaseBudget,
            spent: phaseSpent
          };
        })} />
      </div>
      {/* TaskBudgetChart temporairement commenté pour debug */}
      {/* <TaskBudgetChart tasks={allTasks} /> */}
      
      {/* Tableau des tâches temporairement commenté pour debug */}
      {/* <div className="mt-8">
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
              {allTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">Aucune tâche définie pour ce projet</td>
                </tr>
              ) : (
                allTasks.map(task => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div> */}


      {/* Dépenses réelles */}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Dépenses réelles</h3>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={handleAdd}
          >
            + Ajouter une dépense
          </button>
        </div>
        <ExpenseList
          expenses={projectExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <ExpenseForm
                initialValues={editingExpense || undefined}
                onSubmit={handleSubmit}
                onCancel={() => { setModalOpen(false); setEditingExpense(null); }}
                projectId={project.id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSection;

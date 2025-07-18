import React, { useState } from 'react';
import { BudgetOverview } from '../Costs/BudgetOverview';
import ExpenseList from '../Budget/ExpenseList';
import ExpenseForm from '../Budget/ExpenseForm';
import { useProjectContext } from '../../contexts/ProjectContext';
import type { FinancialRecord } from '../../types';
import ProjectBudgetChart from './ProjectBudgetChart';
import PhaseBudgetChart from './PhaseBudgetChart';
import TaskBudgetChart from './TaskBudgetChart';
import { exportProjectBudgetToCSV } from '../../utils/exportBudget';

import type { Project } from '../../contexts/projectTypes';
import { MATERIALS_EQUIPMENTS, MaterialOrEquipment } from '../../data/materials';

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
  // Adaptation des données pour BudgetOverview (si besoin)
  const overviewData = {
    name: project.name,
    budget: project.budget,
    actualSpent: project.spent,
    phases: (project.phases || []).map((ph) => {
      // Calculer le budget et les dépenses de la phase à partir des tâches
      const phaseBudget = ph.tasks.reduce((sum, task) => sum + (task.budget || 0), 0);
      const phaseSpent = ph.tasks.reduce((sum, task) => sum + (task.spent || 0), 0);
      return {
        id: ph.id,
        name: ph.name,
        estimatedCost: phaseBudget,
        actualCost: phaseSpent,
        completion: phaseBudget > 0 ? (phaseSpent / phaseBudget) * 100 : 0
      };
    })
  };

  // Récupération des tâches avec nom de phase
  const allTasks = (project.phases || []).flatMap(phase =>
    (phase.tasks || []).map(task => ({
      id: task.id,
      name: task.name,
      budget: task.budget ?? 0,
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
      {/* Matériaux & équipements prévisionnels */}
      <div className="mt-12">
        <div style={{ color: 'blue', fontWeight: 'bold', marginBottom: '10px' }}>🔧 BLOC MATÉRIAUX - TEST AFFICHAGE</div>
        <h3 className="text-lg font-semibold mb-2">Matériaux & équipements prévisionnels</h3>
        <MaterialSelectionBlock />
      </div>

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

// Bloc interactif de sélection multi-matériaux
const MaterialSelectionBlock: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<{
    material?: MaterialOrEquipment;
    quantity: number;
    unitPrice: number;
  }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Liste des catégories uniques
  const categories = Array.from(new Set(MATERIALS_EQUIPMENTS.map(m => m.category)));

  // Liste filtrée selon catégorie et recherche
  const filteredMaterials = MATERIALS_EQUIPMENTS.filter(m =>
    (!categoryFilter || m.category === categoryFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Ajoute une nouvelle ligne vide
  const handleAddRow = () => {
    setSelectedRows([...selectedRows, { material: undefined, quantity: 1, unitPrice: 0 }]);
  };

  // Met à jour une ligne
  const handleRowChange = (idx: number, field: string, value: any) => {
    setSelectedRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      if (field === 'material') {
        const mat = MATERIALS_EQUIPMENTS.find(m => m.name === value);
        return {
          ...row,
          material: mat,
          unitPrice: mat ? mat.priceMin : 0
        };
      }
      return { ...row, [field]: value };
    }));
  };

  // Supprime une ligne
  const handleDeleteRow = (idx: number) => {
    setSelectedRows(rows => rows.filter((_, i) => i !== idx));
  };

  // Calcul du total
  const total = selectedRows.reduce((sum, row) => {
    if (!row.material) return sum;
    return sum + (row.quantity * row.unitPrice);
  }, 0);

  return (

    <div className="glass-card p-4 rounded-xl border border-white/20 bg-white/70 backdrop-blur-sm mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="border rounded px-2 py-1 mr-2"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Rechercher un matériau ou équipement..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleAddRow}
        >
          + Ajouter une ligne
        </button>
      </div>
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1 border">Matériau/Équipement</th>
            <th className="px-2 py-1 border">Catégorie</th>
            <th className="px-2 py-1 border">Unité</th>
            <th className="px-2 py-1 border">Quantité</th>
            <th className="px-2 py-1 border">Prix unitaire (FCFA)</th>
            <th className="px-2 py-1 border">Total (FCFA)</th>
            <th className="px-2 py-1 border"></th>
          </tr>
        </thead>
        <tbody>
          {selectedRows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">Aucun matériau/équipement sélectionné</td>
            </tr>
          )}
          {selectedRows.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={row.material?.name || ''}
                  onChange={e => handleRowChange(idx, 'material', e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {filteredMaterials.map(mat => (
                    <option key={mat.name} value={mat.name}>{mat.name}</option>
                  ))}
                </select>
              </td>
              <td className="border px-2 py-1">{row.material?.category || '-'}</td>
              <td className="border px-2 py-1">{row.material?.unit || '-'}</td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min={1}
                  className="border rounded px-2 py-1 w-20"
                  value={row.quantity}
                  onChange={e => handleRowChange(idx, 'quantity', Number(e.target.value))}
                  disabled={!row.material}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min={0}
                  className="border rounded px-2 py-1 w-28"
                  value={row.unitPrice}
                  onChange={e => handleRowChange(idx, 'unitPrice', Number(e.target.value))}
                  disabled={!row.material}
                />
              </td>
              <td className="border px-2 py-1 font-semibold">
                {row.material ? (row.quantity * row.unitPrice).toLocaleString('fr-FR') : '-'}
              </td>
              <td className="border px-2 py-1 text-center">
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteRow(idx)}
                  title="Supprimer cette ligne"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan={5} className="text-right pr-4">Total prévisionnel</td>
            <td className="border px-2 py-1">{total.toLocaleString('fr-FR')} FCFA</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div style={{ color: 'red', fontWeight: 'bold' }}>TEST FIN DE PAGE</div>
    </div>
  );
};

export default BudgetSection;

import React from 'react';
import type { FinancialRecord } from '../../types';

interface ExpenseListProps {
  expenses: FinancialRecord[];
  onEdit?: (expense: FinancialRecord) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Date</th>
            <th className="px-2 py-1 border">Catégorie</th>
            <th className="px-2 py-1 border">Montant</th>
            <th className="px-2 py-1 border">Description</th>
            <th className="px-2 py-1 border">Fournisseur</th>
            <th className="px-2 py-1 border">Facture</th>
            <th className="px-2 py-1 border">Approuvé</th>
            {(onEdit || onDelete) && <th className="px-2 py-1 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td className="px-2 py-1 border">{exp.date}</td>
              <td className="px-2 py-1 border">{exp.category}</td>
              <td className="px-2 py-1 border">{exp.amount.toLocaleString('fr-FR')} FCFA</td>
              <td className="px-2 py-1 border">{exp.description}</td>
              <td className="px-2 py-1 border">{exp.vendor || '-'}</td>
              <td className="px-2 py-1 border">{exp.invoiceNumber || '-'}</td>
              <td className="px-2 py-1 border text-center">{exp.approved ? '✔️' : ''}</td>
              {(onEdit || onDelete) && (
                <td className="px-2 py-1 border flex gap-2 justify-center">
                  {onEdit && <button className="text-blue-600 underline" onClick={() => onEdit(exp)}>Modifier</button>}
                  {onDelete && <button className="text-red-600 underline" onClick={() => onDelete(exp.id)}>Supprimer</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {expenses.length === 0 && <div className="text-gray-500 text-center py-4">Aucune dépense enregistrée.</div>}
    </div>
  );
};

export default ExpenseList;

import React, { useState } from 'react';
import type { FinancialRecord } from '../../types';

interface ExpenseFormProps {
  initialValues?: FinancialRecord | undefined;
  onSubmit: (expense: Omit<FinancialRecord, 'id'>) => Promise<void>;
  onCancel?: () => void;
  projectId: string;
}

const defaultExpense: Omit<FinancialRecord, 'id'> = {
  type: 'expense',
  category: 'other',
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 10),
  projectId: '',
  approved: false,
  status: 'planned'
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialValues, onSubmit, onCancel, projectId }) => {
  const [form, setForm] = useState<Omit<FinancialRecord, 'id'>>({
    ...defaultExpense,
    projectId,
    ...(initialValues ? {
      type: initialValues.type,
      category: initialValues.category,
      amount: initialValues.amount,
      description: initialValues.description,
      date: initialValues.date,
      approved: initialValues.approved,
      status: initialValues.status
    } : {})
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) {
      setError('Le montant doit être positif.');
      return;
    }
    if (!form.category) {
      setError('Veuillez choisir une catégorie.');
      return;
    }
    setError(null);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la dépense:', error);
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium">Catégorie</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        >
          <option value="materials">Matériaux</option>
          <option value="labor">Main d'œuvre</option>
          <option value="equipment">Équipement</option>
          <option value="permits">Permis</option>
          <option value="other">Autre</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Montant (FCFA)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          min={1}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="approved"
          checked={form.approved}
          onChange={e => setForm(prev => ({ ...prev, approved: e.target.checked }))}
        />
        <label className="text-sm">Approuvé</label>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>Annuler</button>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
      </div>
    </form>
  );
};

export default ExpenseForm;

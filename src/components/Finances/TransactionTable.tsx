import React from 'react';
import { Transaction, TransactionCategory } from '../../types/finance';
import { Pencil, Trash, Plus } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const categoryColors: Record<TransactionCategory, string> = {
  'materials': 'bg-blue-100 text-blue-700',
  'labor': 'bg-orange-100 text-orange-700',
  'equipment': 'bg-purple-100 text-purple-700',
  'permits': 'bg-green-100 text-green-700',
  'utilities': 'bg-yellow-100 text-yellow-700',
  'insurance': 'bg-red-100 text-red-700',
  'subcontractor': 'bg-indigo-100 text-indigo-700',
  'transport': 'bg-pink-100 text-pink-700',
  'maintenance': 'bg-teal-100 text-teal-700',
  'other': 'bg-gray-100 text-gray-700',
  'income': 'bg-green-100 text-green-700',
  'client_payment': 'bg-emerald-100 text-emerald-700',
};

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onEdit, onDelete, onAdd }) => {
  return (
    <div className="glass-card p-4 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Transactions financières</h2>
        <button onClick={onAdd} className="morph-card hover-lift flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant (€)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pièce jointe</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">Aucune transaction enregistrée</td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <td className="px-4 py-2 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{tx.description}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryColors[tx.category]}`}>{tx.category}</span>
                </td>
                <td className="px-4 py-2 font-mono font-bold">{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-2">{tx.supplier || '-'}</td>
                <td className="px-4 py-2">
                  {tx.attachmentUrl ? (
                    <a href={tx.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Voir</a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <button onClick={() => onEdit(tx)} className="hover:text-orange-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(tx.id)} className="hover:text-red-600"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;

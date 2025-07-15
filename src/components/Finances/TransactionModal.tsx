import React, { useState, useEffect } from 'react';
import { X, Link, FileText } from 'lucide-react';
import { Transaction, TransactionCategory, PaymentMethod, TransactionStatus } from '../../types/finance';
import { useProjectContext } from '../../contexts/ProjectContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const projectContext = useProjectContext();
  const currentProject = projectContext.currentProject;
  
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'other' as TransactionCategory,
    projectId: currentProject?.id,
    status: 'completed' as TransactionStatus,
    paymentMethod: 'bank_transfer' as PaymentMethod
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        description: initialData.description,
        amount: initialData.amount,
        category: initialData.category,
        projectId: initialData.projectId || currentProject?.id,
        phaseId: initialData.phaseId,
        taskId: initialData.taskId,
        equipmentId: initialData.equipmentId,
        invoiceNumber: initialData.invoiceNumber,
        vendor: initialData.vendor,
        paymentMethod: initialData.paymentMethod || 'bank_transfer',
        status: initialData.status || 'completed',
        notes: initialData.notes
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'other' as TransactionCategory,
        projectId: currentProject?.id,
        status: 'completed' as TransactionStatus,
        paymentMethod: 'bank_transfer' as PaymentMethod
      });
    }
  }, [initialData, isOpen, currentProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories: { value: TransactionCategory; label: string }[] = [
    { value: 'materials', label: 'Matériaux' },
    { value: 'labor', label: 'Main d\'\u0153uvre' },
    { value: 'equipment', label: 'Équipement' },
    { value: 'subcontractor', label: 'Sous-traitance' },
    { value: 'permits', label: 'Permis' },
    { value: 'utilities', label: 'Services publics' },
    { value: 'insurance', label: 'Assurance' },
    { value: 'transport', label: 'Transport' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'income', label: 'Revenus' },
    { value: 'client_payment', label: 'Paiement client' },
    { value: 'other', label: 'Autre' }
  ];

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'cash', label: 'Espèces' },
    { value: 'credit_card', label: 'Carte de crédit' },
    { value: 'debit_card', label: 'Carte de débit' }
  ];

  const statuses: { value: TransactionStatus; label: string }[] = [
    { value: 'completed', label: 'Terminée' },
    { value: 'pending', label: 'En attente' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'refunded', label: 'Remboursée' }
  ];

  // Récupérer les phases et tâches du projet actuel
  const phases = currentProject?.phases || [];
  const selectedPhase = phases.find(p => p.id === formData.phaseId);
  const tasks = selectedPhase?.tasks || [];
  const equipment = currentProject?.equipment || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Modifier' : 'Nouvelle'} Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Description de la transaction"
              required
            />
          </div>

          {/* Catégorie et montant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Liaison avec le projet */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Liaison avec le projet
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phase
                </label>
                <select
                  value={formData.phaseId || ''}
                  onChange={(e) => setFormData({ ...formData, phaseId: e.target.value || undefined, taskId: undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Aucune phase</option>
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tâche
                </label>
                <select
                  value={formData.taskId || ''}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={!formData.phaseId}
                >
                  <option value="">Aucune tâche</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Équipement
              </label>
              <select
                value={formData.equipmentId || ''}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Aucun équipement</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Informations de paiement
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  N° Facture
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="F2024-001"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nom du fournisseur"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {initialData ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;

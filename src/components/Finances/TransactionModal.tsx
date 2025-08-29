import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag, 
  AlertTriangle, 
  Link, 
  CreditCard, 
  User,
  Building,
  Receipt
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { Transaction, TransactionCategory, PaymentMethod, TransactionStatus } from '../../types/finance';

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

  const categories = [
    { value: 'materials', label: '🧱 Matériaux', emoji: '🧱' },
    { value: 'labor', label: '👷 Main d\'œuvre', emoji: '👷' },
    { value: 'equipment', label: '🚜 Équipement', emoji: '🚜' },
    { value: 'transport', label: '🚛 Transport', emoji: '🚛' },
    { value: 'permits', label: '📋 Permis', emoji: '📋' },
    { value: 'utilities', label: '⚡ Services publics', emoji: '⚡' },
    { value: 'insurance', label: '🛡️ Assurance', emoji: '🛡️' },
    { value: 'consulting', label: '💼 Conseil', emoji: '💼' },
    { value: 'maintenance', label: '🔧 Maintenance', emoji: '🔧' },
    { value: 'safety', label: '🦺 Sécurité', emoji: '🦺' },
    { value: 'administrative', label: '📄 Administratif', emoji: '📄' },
    { value: 'revenue', label: '💰 Revenus', emoji: '💰' },
    { value: 'other', label: '📦 Autre', emoji: '📦' }
  ];

  const statuses = [
    { value: 'pending', label: '⏳ En attente', emoji: '⏳' },
    { value: 'completed', label: '✅ Terminé', emoji: '✅' },
    { value: 'cancelled', label: '❌ Annulé', emoji: '❌' }
  ];

  const paymentMethods = [
    { value: 'cash', label: '💵 Espèces' },
    { value: 'check', label: '📝 Chèque' },
    { value: 'bank_transfer', label: '🏦 Virement bancaire' },
    { value: 'credit_card', label: '💳 Carte de crédit' },
    { value: 'debit_card', label: '💳 Carte de débit' }
  ];

  const phases = currentProject?.phases || [];
  // Tasks are nested within phases, so we need to flatten them
  const tasks = phases.flatMap(phase => phase.tasks || []);
  const equipment = currentProject?.equipment || [];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-white/20 shadow-2xl">
          
          {/* Header moderne */}
          <div className="relative bg-gradient-to-r from-green-600/90 to-blue-600/90 backdrop-blur-xl p-6 rounded-t-xl border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    {initialData ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
                  </h2>
                  <p className="text-green-100/80 text-sm">
                    Gérez vos transactions financières
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Section Informations de base */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Montant (FCFA) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.amount === 0 ? '' : formData.amount.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, amount: value === '' ? 0 : parseFloat(value) || 0 });
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 placeholder-gray-400 text-right"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 placeholder-gray-400"
                  placeholder="Description de la transaction"
                  required
                />
              </div>
            </div>

            {/* Section Catégorisation */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Catégorisation</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section Associations */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Link className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Associations</h3>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  Phase
                </label>
                <select
                  value={formData.phaseId || ''}
                  onChange={(e) => setFormData({ ...formData, phaseId: e.target.value || undefined, taskId: undefined })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
                >
                  <option value="">Aucune phase</option>
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Tâche
                </label>
                <select
                  value={formData.taskId || ''}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.phaseId}
                >
                  <option value="">Aucune tâche</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-600" />
                Équipement
              </label>
              <select
                value={formData.equipmentId || ''}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
              >
                <option value="">Aucun équipement</option>
                {equipment && equipment.length > 0 ? (
                  equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))
                ) : (
                  <option value="" disabled className="text-gray-400">Aucun équipement disponible</option>
                )}
              </select>
            </div>
            </div>

            {/* Section Informations de paiement */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informations de paiement</h3>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Mode de paiement
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  N° Facture
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 placeholder-gray-400"
                  placeholder="F2024-001"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 placeholder-gray-400"
                placeholder="Nom du fournisseur"
              />
            </div>
            </div>

            {/* Section Notes */}
            <div className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 transition-all duration-300 placeholder-gray-400 resize-none"
                rows={4}
                placeholder="Notes additionnelles..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50/70 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                {initialData ? 'Modifier la Transaction' : 'Ajouter la Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;

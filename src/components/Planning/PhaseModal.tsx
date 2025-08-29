import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import { ProjectPhase } from '../../contexts/projectTypes';

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phaseData: { name: string; startDate: string; endDate: string; estimatedBudget?: number }) => void;
  onDelete?: () => void;
  initialPhase?: ProjectPhase | null;
  mode?: 'create' | 'edit';
}

const PhaseModal: React.FC<PhaseModalProps> = ({ isOpen, onClose, onSave, onDelete, initialPhase, mode = 'create' }) => {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    estimatedBudget: ''
  });
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialPhase) {
      setForm({
        name: initialPhase.name || '',
        startDate: initialPhase.startDate || '',
        endDate: initialPhase.endDate || '',
        estimatedBudget: initialPhase.estimatedBudget !== undefined ? initialPhase.estimatedBudget.toString() : ''
      });
    } else {
      setForm({ name: '', startDate: '', endDate: '', estimatedBudget: '' });
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [initialPhase, isOpen]);

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleBudgetChange = (value: string) => {
    // Autorise uniquement les nombres >= 0
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setForm(f => ({ ...f, estimatedBudget: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Le nom de la phase est requis');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Les dates de début et de fin sont requises');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('La date de début doit précéder la date de fin');
      return;
    }
    if (form.estimatedBudget && isNaN(Number(form.estimatedBudget))) {
      setError('Le budget estimé doit être un nombre valide');
      return;
    }
    if (form.estimatedBudget && Number(form.estimatedBudget) < 0) {
      setError('Le budget estimé doit être positif');
      return;
    }
    onSave({ ...form, estimatedBudget: form.estimatedBudget ? Number(form.estimatedBudget) : undefined });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Éditer la phase' : 'Créer une nouvelle phase'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom de la phase</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Ex: Gros œuvre"
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Début</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={form.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Fin</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={form.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 flex items-center gap-2">
            <span>Budget estimé (FCFA)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
            value={form.estimatedBudget}
            onChange={e => handleBudgetChange(e.target.value)}
            placeholder="Ex: 15000"
            inputMode="decimal"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        
        {/* Confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 mb-3">Êtes-vous sûr de vouloir supprimer cette phase ?</p>
            <p className="text-sm text-red-600 mb-4">Cette action est irréversible et supprimera également toutes les tâches associées.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          {/* Bouton de suppression (seulement en mode édition) */}
          {mode === 'edit' && onDelete && !showDeleteConfirm && (
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
              onClick={handleDeleteClick}
            >
              Supprimer la phase
            </button>
          )}
          
          {/* Boutons d'action principaux */}
          <div className={`flex gap-2 ${mode === 'edit' && onDelete && !showDeleteConfirm ? '' : 'ml-auto'}`}>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              disabled={showDeleteConfirm}
            >
              {mode === 'edit' ? 'Enregistrer' : 'Créer la phase'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PhaseModal;

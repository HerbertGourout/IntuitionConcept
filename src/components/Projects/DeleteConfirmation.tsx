import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Project } from '../../contexts/projectTypes';

interface DeleteConfirmationProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ project, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Confirmer la suppression</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Supprimer définitivement ce projet ?</h3>
              <p className="text-gray-600 mt-1">
                Vous êtes sur le point de supprimer le projet <strong>{project.name}</strong>. Cette action est irréversible.
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              Toutes les données associées à ce projet seront définitivement supprimées, y compris les tâches, les phases, les budgets et les documents.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;

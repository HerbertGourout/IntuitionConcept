import React from 'react';
import type { Equipment } from '../../types';
import { X } from 'lucide-react';

import MaintenanceHistorySection from './MaintenanceHistorySection';
import EquipmentForm from './EquipmentForm';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
  onUpdateMaintenance?: (equipment: Equipment) => void;
}

const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ equipment, onClose, onEdit, onDelete, onUpdateMaintenance }) => {
  const [editMode, setEditMode] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [form, setForm] = React.useState<Equipment | null>(equipment);

  React.useEffect(() => {
    setForm(equipment);
    setEditMode(false);
    setConfirmDelete(false);
  }, [equipment]);

  if (!equipment) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form && onEdit) onEdit(form);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-800" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <div className="absolute top-4 left-4 flex gap-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Annuler' : 'Éditer'}
          </button>
          <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">{equipment.name}</h2>

        {editMode && form ? (
          <EquipmentForm
            initialValues={form}
            mode="edit"
            onCancel={() => setEditMode(false)}
            onSubmit={(values) => {
              if (onEdit) onEdit(values);
              setEditMode(false);
            }}
          />
        ) : (
          <div>
            <div className="mb-2 text-gray-700"><b>Type :</b> {equipment.type}</div>
            <div className="mb-2 text-gray-700"><b>Modèle :</b> {equipment.model}</div>
            <div className="mb-2 text-gray-700"><b>Numéro de série :</b> {equipment.serialNumber}</div>
            <div className="mb-2 text-gray-700"><b>Statut :</b> {equipment.status}</div>
            <div className="mb-2 text-gray-700"><b>Localisation :</b> {equipment.location}</div>
            
            <div className="mb-2 text-gray-700"><b>Opérateur :</b> {equipment.operator}</div>
            <div className="mb-2 text-gray-700"><b>Dernière maintenance :</b> {equipment.lastMaintenance}</div>
            <div className="mb-2 text-gray-700"><b>Prochaine maintenance :</b> {equipment.nextMaintenance}</div>
            {equipment.coordinates && (
              <div className="mb-2 text-gray-700"><b>Coordonnées :</b> {equipment.coordinates.lat}, {equipment.coordinates.lng}</div>
            )}
            {equipment.assignedProject && (
              <div className="mb-2 text-gray-700"><b>Projet assigné :</b> {equipment.assignedProject}</div>
            )}
          </div>
        )}

        {/* Section Historique des maintenances */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Historique des maintenances</h3>
          <MaintenanceHistorySection
            equipment={equipment}
            onUpdate={onUpdateMaintenance}
          />
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
              <div className="mb-4 text-center text-gray-700">Confirmer la suppression de <b>{equipment.name}</b> ?</div>
              <div className="flex gap-3 justify-center">
                <button className="px-4 py-2 bg-gray-100 rounded" onClick={() => setConfirmDelete(false)}>Annuler</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => onDelete && onDelete(equipment)}>Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetailModal;

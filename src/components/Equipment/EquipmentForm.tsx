import React, { useState } from 'react';
import type { Equipment } from '../../types';

export interface EquipmentFormProps {
  initialValues: Partial<Equipment>;
  onSubmit: (values: Equipment) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
}

const defaultEquipment: Equipment = {
  id: '',
  name: '',
  type: 'other',
  model: '',
  serialNumber: '',
  status: 'available',
  location: '',
  lastMaintenance: '',
  nextMaintenance: '',
  assignedProject: '',
  operator: '',
  coordinates: undefined,
};

const typeOptions = [
  { value: 'excavator', label: 'Pelleteuse' },
  { value: 'crane', label: 'Grue' },
  { value: 'truck', label: 'Camion' },
  { value: 'concrete-mixer', label: 'Toupie béton' },
  { value: 'bulldozer', label: 'Bulldozer' },
  { value: 'other', label: 'Autre' }
];

const statusOptions = [
  { value: 'available', label: 'Disponible' },
  { value: 'in-use', label: 'En service' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'out-of-service', label: 'Hors service' }
];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ initialValues, onSubmit, onCancel, mode = 'add' }) => {
  const [values, setValues] = useState<Equipment>({ ...defaultEquipment, ...initialValues });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation simple
    const newErrors: { [key: string]: string } = {};
    if (!values.name) newErrors.name = 'Nom requis';
    if (!values.type) newErrors.type = 'Type requis';
    if (!values.model) newErrors.model = 'Modèle requis';
    if (!values.serialNumber) newErrors.serialNumber = 'Numéro de série requis';
    if (!values.location) newErrors.location = 'Localisation requise';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700">Nom</label>
        <input
          className="w-full border px-3 py-2 rounded"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
        />
        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
      </div>
      <div>
        <label className="block text-gray-700">Type</label>
        <select
          className="w-full border px-3 py-2 rounded"
          name="type"
          value={values.type}
          onChange={handleChange}
          required
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
      </div>
      <div>
        <label className="block text-gray-700">Modèle</label>
        <input
          className="w-full border px-3 py-2 rounded"
          name="model"
          value={values.model}
          onChange={handleChange}
          required
        />
        {errors.model && <div className="text-red-500 text-sm">{errors.model}</div>}
      </div>
      <div>
        <label className="block text-gray-700">Numéro de série</label>
        <input
          className="w-full border px-3 py-2 rounded"
          name="serialNumber"
          value={values.serialNumber}
          onChange={handleChange}
          required
        />
        {errors.serialNumber && <div className="text-red-500 text-sm">{errors.serialNumber}</div>}
      </div>
      <div>
        <label className="block text-gray-700">Localisation</label>
        <input
          className="w-full border px-3 py-2 rounded"
          name="location"
          value={values.location}
          onChange={handleChange}
          required
        />
        {errors.location && <div className="text-red-500 text-sm">{errors.location}</div>}
      </div>
      <div>
        <label className="block text-gray-700">Opérateur</label>
        <input
          className="w-full border px-3 py-2 rounded"
          name="operator"
          value={values.operator}
          onChange={handleChange}
          placeholder="Nom de l'opérateur"
        />
      </div>
      <div>
        <label className="block text-gray-700">Statut</label>
        <select
          className="w-full border px-3 py-2 rounded"
          name="status"
          value={values.status}
          onChange={handleChange}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
          {mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;

import React, { useState, useContext } from 'react';
import { Settings, Truck, AlertTriangle, MapPin, User, Wrench } from 'lucide-react';
import type { Equipment } from '../../types';
import ProjectContext from '../../contexts/ProjectContext';

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
  { value: 'excavator', label: '🚜 Pelleteuse' },
  { value: 'crane', label: '🏗️ Grue' },
  { value: 'truck', label: '🚛 Camion' },
  { value: 'concrete-mixer', label: '🚚 Toupie béton' },
  { value: 'bulldozer', label: '🚜 Bulldozer' },
  { value: 'other', label: '⚙️ Autre' }
];

const statusOptions = [
  { value: 'available', label: '✅ Disponible' },
  { value: 'in-use', label: '🔧 En service' },
  { value: 'maintenance', label: '⚠️ Maintenance' },
  { value: 'out-of-service', label: '❌ Hors service' }
];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ initialValues, onSubmit, onCancel, mode = 'add' }) => {
  const [values, setValues] = useState<Equipment>({ ...defaultEquipment, ...initialValues });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const projectContext = useContext(ProjectContext);
  
  // Récupérer les membres de l'équipe du projet actuel
  const teamMembers = projectContext?.currentProject?.team || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Si le statut change vers "available", effacer l'opérateur
    if (name === 'status' && value === 'available') {
      setValues(prev => ({ ...prev, operator: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation améliorée
    const newErrors: { [key: string]: string } = {};
    if (!values.name.trim()) newErrors.name = 'Le nom de l\'équipement est requis';
    if (!values.type) newErrors.type = 'Le type d\'équipement est requis';
    if (!values.model.trim()) newErrors.model = 'Le modèle est requis';
    if (!values.serialNumber.trim()) newErrors.serialNumber = 'Le numéro de série est requis';
    if (!values.location.trim()) newErrors.location = 'La localisation est requise';
    
    // Validation de l'opérateur selon le statut
    if ((values.status === 'in-use' || values.status === 'maintenance') && (!values.operator || !values.operator.trim())) {
      newErrors.operator = values.status === 'maintenance' 
        ? 'Un technicien responsable est requis pour la maintenance'
        : 'Un opérateur est requis quand l\'équipement est en service';
    }
    
    // Validation du numéro de série (format basique)
    if (values.serialNumber && values.serialNumber.length < 3) {
      newErrors.serialNumber = 'Le numéro de série doit contenir au moins 3 caractères';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    // Générer un ID si c'est un nouvel équipement
    const finalValues = {
      ...values,
      id: values.id || `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    onSubmit(finalValues);
  };

  return (
    <div className="glass-card p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          {mode === 'edit' ? 'Modifier l\'Équipement' : 'Nouvel Équipement'}
        </h2>
        <p className="text-gray-600">
          {mode === 'edit' ? 'Modifiez les informations de l\'équipement' : 'Ajoutez un nouvel équipement au parc'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-600" />
              Nom de l'équipement *
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 ${
                  errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
                }`}
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Ex: Pelleteuse CAT 1"
                required
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Type d'équipement *
            </label>
            <div className="relative">
              <select
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ${
                  errors.type ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
                }`}
                name="type"
                value={values.type}
                onChange={handleChange}
                required
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.type && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                {errors.type}
              </p>
            )}
          </div>
        </div>

        {/* Détails techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-600" />
              Modèle *
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 ${
                  errors.model ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
                }`}
                name="model"
                value={values.model}
                onChange={handleChange}
                placeholder="Ex: CAT 320D"
                required
              />
              {errors.model && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.model && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                {errors.model}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-600" />
              Numéro de série *
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 ${
                  errors.serialNumber ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
                }`}
                name="serialNumber"
                value={values.serialNumber}
                onChange={handleChange}
                placeholder="Ex: ABC123456"
                required
              />
              {errors.serialNumber && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.serialNumber && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                {errors.serialNumber}
              </p>
            )}
          </div>
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Localisation *
          </label>
          <div className="relative">
            <input
              className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 ${
                errors.location ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
              }`}
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="Ex: Chantier Douala, Dépôt principal"
              required
            />
            {errors.location && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              {errors.location}
            </p>
          )}
        </div>

        {/* Statut et Opérateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Statut *
            </label>
            <select
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-300"
              name="status"
              value={values.status}
              onChange={handleChange}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Opérateur - Affiché selon le statut */}
          {(values.status === 'in-use' || values.status === 'maintenance') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                {values.status === 'maintenance' ? 'Technicien responsable *' : 'Opérateur assigné *'}
              </label>
              <select
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ${
                  errors.operator ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-orange-300'
                }`}
                name="operator"
                value={values.operator}
                onChange={handleChange}
                required
              >
                <option value="">
                  {values.status === 'maintenance' 
                    ? 'Sélectionner un technicien' 
                    : 'Sélectionner un opérateur'
                  }
                </option>
                {teamMembers.map((memberName, index) => (
                  <option key={`member-${index}`} value={memberName}>
                    {memberName}
                  </option>
                ))}
              </select>
              {errors.operator && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.operator}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50/70 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            {mode === 'edit' ? 'Enregistrer' : 'Ajouter l\'Équipement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;

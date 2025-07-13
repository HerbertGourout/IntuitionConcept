import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, AlertTriangle } from 'lucide-react';
import Modal from '../UI/Modal';
import type { Project } from '../../contexts/projectTypes';

export interface CreateProjectModalProps {
  onCancel: () => void;
  onCreate: (projectData: Omit<Project, 'id' | 'phases' | 'spent'> & { createdAt: string; updatedAt: string }) => void;
  isOpen: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onCancel, onCreate, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'planning' as const,
    client: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom du projet est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.location.trim()) newErrors.location = 'La localisation est requise';
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (!formData.endDate) newErrors.endDate = 'La date de fin est requise';
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      const newProjectData: Omit<Project, 'id' | 'phases' | 'spent'> = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        startDate: new Date(formData.startDate).toISOString().split('T')[0],
        endDate: new Date(formData.endDate).toISOString().split('T')[0],
        status: formData.status,
        budget: parseFloat(formData.budget),
        manager: '', // À définir ultérieurement
        client: formData.client,
        progress: 0, // Nouveau projet commence à 0%
        priority: 'medium', // Priorité par défaut
        team: [] // Équipe vide au début
      };
      
      // Ajoute createdAt et updatedAt
    const now = new Date().toISOString();
    onCreate({
      ...newProjectData,
      createdAt: now,
      updatedAt: now
    });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        budget: '',
        status: 'planning',
        client: ''
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Reset form when component mounts
  useEffect(() => {
    setFormData({
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      budget: '',
      status: 'planning',
      client: ''
    });
    setErrors({});
  }, []);

  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Créer un Nouveau Projet" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Projet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Nom du projet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nom du client (optionnel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Localisation *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ville, Région"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Description détaillée du projet..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as Project['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="planning">En planification</option>
            <option value="in_progress">En cours</option>
            <option value="on_hold">En attente</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        {/* Dates and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de Début *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de Fin *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="font-mono">FCFA</span>
              Budget *
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.budget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="1000"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Créer le Projet
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
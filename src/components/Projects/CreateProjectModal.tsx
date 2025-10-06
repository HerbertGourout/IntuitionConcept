import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, AlertTriangle, Building2, User, DollarSign, Target, Sparkles } from 'lucide-react';
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
    if (!formData.budget || isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Le budget doit être un nombre valide';
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
      const newProjectData: Omit<Project, 'id' | 'phases' | 'spent' | 'createdAt' | 'updatedAt'> = {
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
    <Modal isOpen={isOpen} onClose={onCancel} title="" size="lg">
      <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Header avec effet glassmorphism */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Créer un Nouveau Projet
          </h2>
          <p className="text-gray-600">Configurez les détails de votre projet BTP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations de base */}
          <div className="glass-card p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Nom du Projet *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 ${
                      errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="Ex: Construction Villa Moderne"
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
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Client
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-300 placeholder-gray-400"
                  placeholder="Nom du client (optionnel)"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Localisation *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 ${
                      errors.location ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="Ville, Région"
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
            </div>
          </div>

          {/* Section Description */}
          <div className="glass-card p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Description du projet
            </h3>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Description détaillée *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 resize-none ${
                    errors.description ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  placeholder="Décrivez les détails, objectifs et spécificités de votre projet BTP..."
                />
                {errors.description && (
                  <div className="absolute top-3 right-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Statut */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Statut initial
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Project['status'])}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-300"
              >
                <option value="planning">En planification</option>
                <option value="in_progress">En cours</option>
                <option value="on_hold">En attente</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Section Planning et Budget */}
          <div className="glass-card p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Planning et Budget
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Date de Début *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.startDate ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  />
                  {errors.startDate && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Date de Fin *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.endDate ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  />
                  {errors.endDate && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  Budget (FCFA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 ${
                      errors.budget ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="Ex: 50000000"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  {errors.budget && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.budget && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.budget}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions avec design moderne */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50/70 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Créer le Projet
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
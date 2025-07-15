import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, AlertTriangle, Flag } from 'lucide-react';
import Modal from '../UI/Modal';
import { ProjectTask } from '../../contexts/projectTypes';
import { TaskStatus } from '../../contexts/projectTypes';

interface TaskFormData {
  name: string;
  description: string;
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (task: Omit<ProjectTask, 'id'>) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
  selectedTask?: ProjectTask;
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onTaskCreate, onTaskUpdate, selectedTask, projectId }) => {
  // projectId sera utilisé pour des fonctionnalités futures (validation, logging, etc.)
  console.debug('TaskModal opened for project:', projectId);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    assignedTo: [],
    priority: 'medium',
    status: 'todo',
    startDate: '',
    dueDate: '',
    estimatedHours: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const priorities = [
    { value: 'low', label: 'Basse', color: 'text-green-600' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
    { value: 'high', label: 'Haute', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ];

  const statuses = [
    { value: 'todo', label: 'À faire' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'blocked', label: 'Bloquée' },
    { value: 'done', label: 'Terminé' }
  ];

  const teamMembers = [
    'Jean Martin',
    'Marie Leroy',
    'Paul Durand',
    'Anne Petit',
    'Luc Moreau',
    'Sophie Bernard'
  ];

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        name: selectedTask.name,
        description: selectedTask.description || '',
        assignedTo: selectedTask.assignedTo,
        priority: selectedTask.priority || 'medium',
        status: selectedTask.status,
        startDate: selectedTask.startDate || '',
        dueDate: selectedTask.dueDate || '',
        estimatedHours: 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        assignedTo: [],
        priority: 'medium',
        status: 'todo',
        startDate: '',
        dueDate: '',
        estimatedHours: 0
      });
    }
    setErrors({});
  }, [selectedTask, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.assignedTo) newErrors.assignedTo = 'L\'assignation est requise';
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (!formData.dueDate) newErrors.dueDate = 'La date de fin est requise';
    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Les heures estimées doivent être supérieures à 0';
    }

    if (formData.startDate && formData.dueDate && formData.startDate >= formData.dueDate) {
      newErrors.dueDate = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (selectedTask) {
        // Mode édition
        onTaskUpdate?.(selectedTask.id, formData);
      } else {
        // Mode création
        onTaskCreate(formData);
      }
      onClose();
    }
  };

  const handleInputChange = <K extends keyof TaskFormData>(
    field: K,
    value: string | number
  ) => {
    // Convertir la valeur en fonction du type attendu par le champ
    let processedValue: TaskFormData[K];
    
    if (field === 'estimatedHours') {
      // Pour estimatedHours, on s'assure d'avoir un nombre
      processedValue = (value === '' ? 0 : Number(value)) as TaskFormData[K];
    } else if (field === 'priority' || field === 'status') {
      // Pour les champs avec des valeurs spécifiques, on utilise directement la valeur
      processedValue = value as TaskFormData[K];
    } else {
      // Pour les autres champs texte, on s'assure d'avoir une chaîne
      processedValue = String(value) as unknown as TaskFormData[K];
    }
    
    // Mise à jour de l'état du formulaire
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Effacer l'erreur si elle existe
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={selectedTask ? 'Modifier la Tâche' : 'Créer une Nouvelle Tâche'} 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la Tâche *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Installation des fondations"
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
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Description détaillée de la tâche..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Assignment and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigné à *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.assignedTo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner une personne</option>
              {teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status and Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Heures Estimées *
            </label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="0.5"
            />
            {errors.estimatedHours && (
              <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            {selectedTask ? 'Modifier' : 'Créer'} la Tâche
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
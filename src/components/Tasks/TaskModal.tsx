import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X, Calendar, AlertTriangle, Clock, CheckCircle, ChevronDown,
  Target, Users, DollarSign, FileText, Flag, Zap, Play,
  Layers, ArrowUp, ArrowDown
} from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import CostManagement from '../../components/Tasks/CostManagement';
import { TaskStatus } from '../../contexts/projectTypes';

type TaskPriority = 'low' | 'medium' | 'high';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTask | null;
  onSave: (taskData: Partial<ProjectTask>, isSubTask?: boolean, parentTaskId?: string) => void;
  onDelete?: (taskId: string) => void;
  teamMembers: Array<{ id: string; name: string; role?: string }>;
}

import { useProjectContext } from '../../contexts/ProjectContext';

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete, teamMembers }) => {
  const { currentProject } = useProjectContext();
  const phases = currentProject?.phases || [];
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectTask> & {
    status: TaskStatus;
    priority: TaskPriority;
    spent: number;
    precision?: number;
    phaseId?: string;
  }>({
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    assignedTo: [],
    startDate: '',
    endDate: '',
    budget: 0,
    spent: 0,
    dependencies: [],
    costItems: [],
    precision: 3,
    subtasks: [],
    phaseId: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubTask, setIsSubTask] = useState<boolean>(!!task?.parentId);
  const [parentTaskId, setParentTaskId] = useState<string | undefined>(task?.parentId);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        status: task.status || 'not_started',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || [],
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        budget: task.budget || 0,
        spent: typeof task.spent === 'number' ? task.spent : 0,
        phaseId: task.phaseId || '',
        dependencies: task.dependencies || [],
        costItems: task.costItems || [],
        precision: typeof task.precision === 'number' ? task.precision : 3,
        subtasks: task.subtasks || []
      });
      setIsSubTask(!!task.parentId);
      setParentTaskId(task.parentId);
    } else {
      const defaultStartDate = new Date().toISOString().split('T')[0];
      const defaultEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        assignedTo: [],
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        budget: 0,
        spent: 0,
        phaseId: '',
        dependencies: [],
        costItems: [],
        precision: 3,
        subtasks: []
      });
      setIsSubTask(false);
      setParentTaskId(undefined);
    }
  }, [task, isOpen]);

  const handleInputChange = <K extends keyof ProjectTask>(field: K, value: ProjectTask[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleAssigned = (memberId: string) => {
    setFormData((prev) => {
      const newAssignedTo = prev.assignedTo?.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
        : [...(prev.assignedTo || []), memberId];
      return {
        ...prev,
        assignedTo: newAssignedTo
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Le nom de la tâche est obligatoire.';
    }
    if (!formData.startDate) {
      errors.startDate = 'La date de début est obligatoire.';
    }
    if (!formData.endDate) {
      errors.endDate = 'La date de fin est obligatoire.';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.dates = 'La date de début doit être antérieure à la date de fin.';
    }
    if (formData.budget !== undefined && formData.budget < 0) {
      errors.budget = 'Le budget ne peut pas être négatif.';
    }
    if (formData.spent !== undefined && formData.spent < 0) {
      errors.spent = 'La dépense réelle ne peut pas être négative.';
    }

    // Validation stricte du budget par rapport à la phase sélectionnée
    if (formData.phaseId) {
      const phase = phases.find(p => p.id === formData.phaseId);
      if (phase) {
        const budgetTotal = phase.estimatedBudget || 0;
        const isEdit = !!(task && task.id);
        const totalBudgetTasks = (phase.tasks || [])
          .filter(t => !isEdit || t.id !== task?.id)
          .reduce((sum, t) => sum + (t.budget || 0), 0);
        const budgetCourant = typeof formData.budget === 'number' ? formData.budget : 0;
        const totalBudgetAvecCourant = totalBudgetTasks + budgetCourant;
        if (totalBudgetAvecCourant > budgetTotal) {
          errors.budget = `Le budget total des tâches (${totalBudgetAvecCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}) dépasse le budget de la phase (${budgetTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}).`;
        }
      }
    }

    // Validation stricte de l'assignation
    if (!formData.assignedTo || formData.assignedTo.length === 0) {
      errors.assignedTo = "Au moins une personne doit être assignée à la tâche.";
    }
    // Validation stricte du statut
    if (!formData.status) {
      errors.status = "Le statut de la tâche est obligatoire.";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSave({ ...formData }, isSubTask, parentTaskId);
      onClose();
    } else {
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(`task-${firstErrorField}`);
      if (el) el.focus();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'blocked':
        return 'Bloqué';
      default:
        return 'Non commencé';
    }
  };

  const statusOptions = [
    { value: 'not_started', label: 'Non commencé', icon: <Clock className="w-4 h-4" /> },
    { value: 'in_progress', label: 'En cours', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'completed', label: 'Terminé', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'blocked', label: 'Bloqué', icon: <X className="w-4 h-4" /> }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'text-green-600' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
    { value: 'high', label: 'Haute', color: 'text-red-600' }
  ];

  return isOpen ? ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-white/20 shadow-2xl z-10">
        <div className="glass-card border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {task ? 'Modifiez les détails de cette tâche' : 'Créez une nouvelle tâche pour votre projet'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="glass-card p-6 space-y-6">
            {/* Sélection de la phase */}
            <div className="space-y-2">
              <label htmlFor="task-phase" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Flag className="w-4 h-4 text-purple-500" />
                <span>Phase du projet</span>
              </label>
              <select
                id="task-phase"
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 border-white/30"
                value={formData.phaseId || ''}
                onChange={e => setFormData(prev => ({ ...prev, phaseId: e.target.value }))}
                required
              >
                <option value="" disabled>Sélectionnez une phase...</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
              {formErrors.phaseId && (
                <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-red-600 text-sm">{formErrors.phaseId}</p>
                </div>
              )}
            </div>

            {/* Synthèse budgétaire dynamique de la phase sélectionnée */}
            {formData.phaseId && (() => {
              const phase = phases.find(p => p.id === formData.phaseId);
              if (!phase) return null;
              // Calculs
              const budgetTotal = phase.estimatedBudget || 0;
              // Exclure la tâche en cours si édition (pour éviter double comptage)
              const isEdit = !!(task && task.id);
              const totalBudgetTasks = (phase.tasks || [])
                .filter(t => !isEdit || t.id !== task?.id)
                .reduce((sum, t) => sum + (t.budget || 0), 0);
              const totalSpentTasks = (phase.tasks || [])
                .reduce((sum, t) => sum + (t.spent || 0), 0);
              // Ajout du budget de la tâche en cours (si renseigné)
              const budgetCourant = typeof formData.budget === 'number' ? formData.budget : 0;
              const totalBudgetAvecCourant = totalBudgetTasks + budgetCourant;
              const resteAllouer = budgetTotal - totalBudgetAvecCourant;
              return (
                <div className="glass-card p-4 mb-2 border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white/60 rounded-xl">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-purple-700">Budget phase</span>
                      <span className="text-lg font-bold">{budgetTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-orange-700">Budgété (avec cette tâche)</span>
                      <span className="text-lg font-bold">{totalBudgetAvecCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-green-700">Dépensé</span>
                      <span className="text-lg font-bold">{totalSpentTasks.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className={resteAllouer < 0 ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>Reste à allouer</span>
                      <span className={resteAllouer < 0 ? 'text-lg font-bold text-red-600' : 'text-lg font-bold text-emerald-600'}>{resteAllouer.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>
                  {/* Progression budgétaire */}
                  <div className="mt-4">
                    <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${totalBudgetAvecCourant <= budgetTotal ? 'bg-gradient-to-r from-orange-400 to-purple-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, (totalBudgetAvecCourant / budgetTotal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Budget estimé et dépense réelle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="task-budget" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Budget estimé pour cette tâche (€)</span>
                </label>
                <input
                  id="task-budget"
                  type="number"
                  min={0}
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${formErrors.budget ? 'border-red-500' : 'border-white/30'}`}
                  value={formData.budget ?? ''}
                  onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  required
                />
                {formErrors.budget && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 text-sm">{formErrors.budget}</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="task-spent" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span>Dépense réelle (optionnel)</span>
                </label>
                <input
                  id="task-spent"
                  type="number"
                  min={0}
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${formErrors.spent ? 'border-red-500' : 'border-white/30'}`}
                  value={formData.spent ?? ''}
                  onChange={e => setFormData(prev => ({ ...prev, spent: e.target.value === '' ? 0 : Number(e.target.value) }))}
                />
                {formErrors.spent && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 text-sm">{formErrors.spent}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
  <FileText className="w-5 h-5 text-blue-600" />
  <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
</div>

{/* Statut de la tâche */}
<div className="space-y-2">
  <label htmlFor="task-status" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
    <Flag className="w-4 h-4 text-purple-500" />
    <span>Statut *</span>
  </label>
  <select
    id="task-status"
    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${formErrors.status ? 'border-red-500' : 'border-white/30'}`}
    value={formData.status}
    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
    required
  >
    <option value="not_started">Non commencé</option>
    <option value="in_progress">En cours</option>
    <option value="blocked">Bloqué</option>
    <option value="completed">Terminé</option>
  </select>
  {formErrors.status && (
    <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <p className="text-red-600 text-sm">{formErrors.status}</p>
    </div>
  )}
</div>

{/* Délais (dates) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <label htmlFor="task-start" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <Calendar className="w-4 h-4 text-blue-500" />
      <span>Date de début *</span>
    </label>
    <input
      id="task-start"
      type="date"
      className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${formErrors.startDate ? 'border-red-500' : 'border-white/30'}`}
      value={formData.startDate}
      onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
      required
    />
    {formErrors.startDate && (
      <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <p className="text-red-600 text-sm">{formErrors.startDate}</p>
      </div>
    )}
  </div>
  <div className="space-y-2">
    <label htmlFor="task-end" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
      <Calendar className="w-4 h-4 text-blue-700" />
      <span>Date de fin *</span>
    </label>
    <input
      id="task-end"
      type="date"
      className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${formErrors.endDate ? 'border-red-500' : 'border-white/30'}`}
      value={formData.endDate}
      onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
      required
    />
    {formErrors.endDate && (
      <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <p className="text-red-600 text-sm">{formErrors.endDate}</p>
      </div>
    )}
  </div>
</div>

{/* Assignation d'une personne */}
<div className="space-y-2">
  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
    <Users className="w-4 h-4 text-blue-500" />
    <span>Assigné à *</span>
  </label>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {teamMembers.map(member => (
      <label key={member.id} className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
        <input
          type="checkbox"
          checked={formData.assignedTo?.includes(member.id)}
          onChange={() => {
            setFormData(prev => {
              const assigned = prev.assignedTo || [];
              return {
                ...prev,
                assignedTo: assigned.includes(member.id)
                  ? assigned.filter(id => id !== member.id)
                  : [...assigned, member.id]
              };
            });
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span>{member.name}</span>
      </label>
    ))}
  </div>
  {formErrors.assignedTo && (
    <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <p className="text-red-600 text-sm">{formErrors.assignedTo}</p>
    </div>
  )}
</div>

            <div className="space-y-2">
              <label htmlFor="task-name" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Target className="w-4 h-4 text-orange-500" />
                <span>Nom de la tâche</span>
              </label>
              <input
                id="task-name"
                type="text"
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                  formErrors.name ? 'border-red-500' : 'border-white/30'
                }`}
                value={formData.name}
                onChange={e => {
                  handleInputChange('name', e.target.value);
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                autoFocus
              />
              {formErrors.name && (
                <div className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-red-600 text-sm">{formErrors.name}</p>
                </div>
              )}
            </div>
            {!task && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Flag className="w-4 h-4 text-purple-500" />
                  <span>Type de tâche</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
                    <input
                      type="radio"
                      checked={!isSubTask}
                      onChange={() => setIsSubTask(false)}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span>Tâche principale</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
                    <input
                      type="radio"
                      checked={isSubTask}
                      onChange={() => setIsSubTask(true)}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span>Sous-tâche</span>
                  </label>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="taskDescription" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Description</span>
              </label>
              <textarea
                id="taskDescription"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl"
              />
            </div>
          </div>

          {/* Section Hiérarchie des Tâches */}
          {(task?.parentId || (task?.subtasks && task.subtasks.length > 0)) && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Hiérarchie des Tâches</h3>
              </div>
              {task?.parentId && (
                <div className="glass-card p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">
                      🔗 Cette tâche est une sous-tâche rattachée à une tâche parente
                    </p>
                  </div>
                </div>
              )}
              {task?.subtasks && task.subtasks.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <ArrowDown className="w-4 h-4 text-indigo-500" />
                    <span>Sous-tâches ({task.subtasks.length})</span>
                  </label>
                  <div className="glass-card p-4 max-h-48 overflow-y-auto space-y-2">
                    {task.subtasks.map((subTask) => (
                      <div key={subTask.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <div>
                            <p>{subTask.name}</p>
                            <p className="text-xs">{getStatusLabel(subTask.status)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subTask.status)}`}>
                          {subTask.status === 'completed' ? '✅ 100%' : subTask.status === 'in_progress' ? '⏳ 50%' : '⏸️ 0%'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Actions */}
          <div className="glass-card p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold rounded-xl"
                >
                  {task ? 'Mettre à jour' : 'Créer la tâche'}
                </button>
              </div>
              {task && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="w-full px-6 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold rounded-xl"
                >
                  Supprimer la tâche
                </button>
              )}
            </div>
          </div>

          {/* Modal de suppression */}
          {showConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="glass-card w-full max-w-md mx-4 p-6 border border-white/20 shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Confirmer la suppression</h3>
                  <p className="text-center text-gray-600">Voulez-vous vraiment supprimer cette tâche ?</p>
                  <div className="flex w-full space-x-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30"
                      onClick={() => setShowConfirm(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 bg-red-500 text-white"
                      onClick={() => {
                        if (task?.id && onDelete) onDelete(task.id);
                        setShowConfirm(false);
                        onClose();
                      }}
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};

export default TaskModal;
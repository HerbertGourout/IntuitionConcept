import { useState, useEffect } from 'react';

import ReactDOM from 'react-dom';
import {
  X, Calendar, AlertTriangle,
  Target, Users, DollarSign, FileText, Flag,
  Layers, ArrowUp, ArrowDown, Receipt, TrendingDown
} from 'lucide-react';
import { ProjectTask, TaskStatus, TaskPriority } from '../../contexts/projectTypes';
import { useProjectContext } from '../../contexts/ProjectContext';
import TeamService from '../../services/teamService';
import { TeamMember } from '../../types/team';
import transactionService from '../../services/transactionService';

// TaskPriority is now imported from projectTypes

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTask | null;
  onSave: (taskData: Partial<ProjectTask>, isSubTask?: boolean, parentTaskId?: string) => void;
  onDelete?: (taskId: string) => void;
  teamMembers: Array<{ id: string; name: string; role?: string }>;
  allTasks?: ProjectTask[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete, teamMembers }) => {
  const { currentProject } = useProjectContext();
  const phases = currentProject?.phases || [];
  const [showConfirm, setShowConfirm] = useState(false);
  const [firebaseTeamMembers, setFirebaseTeamMembers] = useState<TeamMember[]>([]);
  const [realExpenses, setRealExpenses] = useState<{
    totalSpent: number;
    transactionCount: number;
    lastExpenseDate?: string;
  }>({ totalSpent: 0, transactionCount: 0 });
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectTask> & {
    status: TaskStatus;
    priority: TaskPriority;
    spent: number | undefined;
    precision?: number;
    phaseId?: string;
  }>({
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: [],
    startDate: '',
    endDate: '',
    budget: 0,
    spent: undefined,
    dependencies: [],
    costItems: [],
    precision: 3,
    subTasks: [],
    phaseId: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubTask, setIsSubTask] = useState<boolean>(!!task?.parentId);
  const [parentTaskId, setParentTaskId] = useState<string | undefined>(task?.parentId);

  // Charger les membres d'équipe depuis Firebase, filtrés par projet courant
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        if (!isOpen) return;
        if (!currentProject?.id) {
          console.warn('👥 TaskModal - Aucun projet sélectionné, pas de membres chargés');
          setFirebaseTeamMembers([]);
          return;
        }
        const members = await TeamService.getMembersByProject(currentProject.id);
        console.log(`👥 TaskModal - Membres chargés pour projet ${currentProject.id}:`, members.length);
        // Dédupliquer par id/email
        const uniqueMembers = members.filter((member, index, self) =>
          index === self.findIndex(m => m.id === member.id || m.email === member.email)
        );
        setFirebaseTeamMembers(uniqueMembers);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        setFirebaseTeamMembers([]);
      }
    };

    loadTeamMembers();
  }, [isOpen, currentProject?.id]);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || [],
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        budget: task.budget || 0,
        spent: typeof task.spent === 'number' ? task.spent : undefined,
        phaseId: task.phaseId || '',
        dependencies: task.dependencies || [],
        costItems: task.costItems || [],
        precision: typeof task.precision === 'number' ? task.precision : 3,
        subTasks: task.subTasks || []
      });
      setIsSubTask(!!task.parentId);
      setParentTaskId(task.parentId);
    } else {
      const defaultStartDate = new Date().toISOString().split('T')[0];
      const defaultEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        name: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedTo: [],
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        budget: 0,
        spent: undefined,
        phaseId: '',
        dependencies: [],
        costItems: [],
        precision: 3,
        subTasks: []
      });
      setIsSubTask(false);
      setParentTaskId(undefined);
    }
  }, [task, isOpen]);

  // Charger les dépenses réelles depuis les transactions Firebase
  useEffect(() => {
    const loadRealExpenses = async () => {
      if (task?.id && currentProject?.id) {
        setLoadingExpenses(true);
        try {
          const expenses = await transactionService.calculateTaskExpenses(currentProject.id, task.id);
          setRealExpenses(expenses);
        } catch (error) {
          console.error('❌ Erreur lors du chargement des dépenses réelles:', error);
          setRealExpenses({ totalSpent: 0, transactionCount: 0 });
        } finally {
          setLoadingExpenses(false);
        }
      } else {
        setRealExpenses({ totalSpent: 0, transactionCount: 0 });
      }
    };

    if (isOpen) {
      loadRealExpenses();
    }
  }, [task?.id, currentProject?.id, isOpen]);

  const handleInputChange = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Validation nom obligatoire
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Le nom de la tâche est obligatoire (minimum 2 caractères).';
    }
    
    // Validation dates obligatoires
    if (!formData.startDate) {
      errors.startDate = 'La date de début est obligatoire.';
    }
    if (!formData.endDate) {
      errors.endDate = 'La date de fin est obligatoire.';
    }
    
    // Validation cohérence des dates
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.dates = 'La date de début doit être antérieure à la date de fin.';
    }
    
    // Validation dates dans les limites de la phase
    if (formData.phaseId && currentProject) {
      const phase = phases.find(p => p.id === formData.phaseId);
      if (phase) {
        if (phase.startDate && formData.startDate && formData.startDate < phase.startDate) {
          errors.startDate = `La date de début de la tâche ne peut pas être antérieure à celle de la phase (${new Date(phase.startDate).toLocaleDateString('fr-FR')}).`;
        }
        if (phase.endDate && formData.endDate && formData.endDate > phase.endDate) {
          errors.endDate = `La date de fin de la tâche ne peut pas être postérieure à celle de la phase (${new Date(phase.endDate).toLocaleDateString('fr-FR')}).`;
        }
      }
    }
    
    // Validation cohérence statut/dates
    if (formData.status === 'in_progress') {
      if (formData.startDate && formData.startDate > today) {
        errors.status = 'Une tâche "En cours" ne peut pas avoir une date de début future.';
      }
    }
    if (formData.status === 'done') {
      if (formData.endDate && formData.endDate > today) {
        errors.status = 'Une tâche "Terminée" ne peut pas avoir une date de fin future.';
      }
    }
    
    // Validation assignation obligatoire
    if (!formData.assignedTo || formData.assignedTo.length === 0) {
      errors.assignedTo = "Au moins une personne doit être assignée à la tâche.";
    }
    
    if (formData.budget !== undefined && formData.budget < 0) {
      errors.budget = 'Le budget ne peut pas être négatif.';
    }
    if (formData.spent !== undefined && formData.spent < 0) {
      errors.spent = 'La dépense réelle ne peut pas être négative.';
    }

    // Validation stricte du budget par rapport à la phase sélectionnée
    if (formData.phaseId && currentProject) {
      const phase = phases.find(p => p.id === formData.phaseId);
      if (phase) {
        const budgetTotal = phase.estimatedBudget || 0;
        const budgetCourant = typeof formData.budget === 'number' ? formData.budget : 0;
        
        // Calculer le budget utilisé en sommant les budgets des tâches existantes
        const budgetUtilise = (phase.tasks || [])
          .filter(t => !task || t.id !== task.id) // Exclure la tâche en cours d'édition
          .reduce((sum, t) => sum + (t.budget || 0), 0);
        
        const budgetRestant = budgetTotal - budgetUtilise;
        
        if (budgetCourant > budgetRestant) {
          errors.budget = `Le budget de cette tâche (${budgetCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}) dépasse le budget restant de la phase (${budgetRestant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}).`;
        }
        
        console.log('Validation budget:', {
          phaseId: formData.phaseId,
          budgetTotal,
          budgetUtilise,
          budgetRestant,
          budgetCourant,
          isValid: budgetCourant <= budgetRestant
        });
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
      case 'done':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'on_hold':
        return 'Bloqué';
      default:
        return 'Non commencé';
    }
  };

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
            {/* Sélection de la phase - Toujours modifiable */}
            <div className="space-y-2">
              <label htmlFor="task-phase" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Flag className="w-4 h-4 text-purple-500" />
                <span>Phase du projet *</span>
                {task && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Modification de phase autorisée
                  </span>
                )}
              </label>
              <select
                id="task-phase"
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 border-white/30"
                value={formData.phaseId || ''}
                onChange={e => {
                  const newPhaseId = e.target.value;
                  setFormData(prev => ({ ...prev, phaseId: newPhaseId }));
                  // Réinitialiser les erreurs de budget car la phase a changé
                  setFormErrors(prev => ({ ...prev, budget: '', spent: '' }));
                }}
                required
              >
                <option value="" disabled>Sélectionnez une phase...</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name} - Budget: {(phase.estimatedBudget || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                  </option>
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
              
              // Calculs basés sur les vraies tâches de la phase
              const budgetTotal = phase.estimatedBudget || 0;
              const isEdit = !!(task && task.id);
              
              // Calculer le budget déjà alloué aux tâches existantes de cette phase
              const existingTasks = (phase.tasks || [])
                .filter(t => !isEdit || t.id !== task?.id); // Exclure la tâche en cours d'édition
              
              const totalBudgetTasks = existingTasks
                .reduce((sum, t) => sum + (t.budget || 0), 0);
              
              const totalSpentTasks = existingTasks
                .reduce((sum, t) => sum + (t.spent || 0), 0);
              
              // Ajout du budget de la tâche en cours (si renseigné)
              const budgetCourant = typeof formData.budget === 'number' ? formData.budget : 0;
              const spentCourant = typeof formData.spent === 'number' ? formData.spent : 0;
              const totalBudgetAvecCourant = totalBudgetTasks + budgetCourant;
              const totalSpentAvecCourant = totalSpentTasks + spentCourant;
              const resteAllouer = budgetTotal - totalBudgetAvecCourant;
              
              // Détection des dépassements
              const depassementBudget = totalBudgetAvecCourant > budgetTotal;
              const depassementSpent = totalSpentAvecCourant > budgetTotal;
              const depassementSpentVsBudget = totalSpentAvecCourant > totalBudgetAvecCourant;
              
              console.log('Calcul budget phase:', {
                phaseId: formData.phaseId,
                budgetTotal,
                existingTasksCount: existingTasks.length,
                totalBudgetTasks,
                totalSpentTasks,
                budgetCourant,
                spentCourant,
                totalBudgetAvecCourant,
                totalSpentAvecCourant,
                resteAllouer,
                depassementBudget,
                depassementSpent,
                depassementSpentVsBudget
              });
              
              return (
                <div className={`glass-card p-4 mb-2 border rounded-xl ${
                  depassementBudget || depassementSpent 
                    ? 'border-red-300 bg-gradient-to-br from-red-50/60 to-white/60' 
                    : 'border-purple-200 bg-gradient-to-br from-purple-50/60 to-white/60'
                }`}>
                  {/* Alertes de dépassement */}
                  {(depassementBudget || depassementSpent) && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-800">⚠️ Dépassement budgétaire détecté</p>
                          {depassementBudget && (
                            <p className="text-red-700">• Le budget alloué dépasse le budget total de la phase</p>
                          )}
                          {depassementSpent && (
                            <p className="text-red-700">• Les dépenses dépassent le budget total de la phase</p>
                          )}
                          {depassementSpentVsBudget && (
                            <p className="text-red-700">• Les dépenses dépassent le budget alloué</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-purple-700">Budget phase</span>
                      <span className="text-lg font-bold">{budgetTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className={`font-semibold ${depassementBudget ? 'text-red-700' : 'text-orange-700'}`}>Budgété (avec cette tâche)</span>
                      <span className={`text-lg font-bold ${depassementBudget ? 'text-red-600' : ''}`}>{totalBudgetAvecCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className={`font-semibold ${depassementSpent ? 'text-red-700' : 'text-green-700'}`}>Dépensé (avec cette tâche)</span>
                      <span className={`text-lg font-bold ${depassementSpent ? 'text-red-600' : ''}`}>{totalSpentAvecCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className={resteAllouer < 0 ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>Reste à allouer</span>
                      <span className={resteAllouer < 0 ? 'text-lg font-bold text-red-600' : 'text-lg font-bold text-emerald-600'}>{resteAllouer.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                  </div>
                  
                  {/* Progression budgétaire */}
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-gray-600">Progression budgétaire</div>
                    <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${totalBudgetAvecCourant <= budgetTotal ? 'bg-gradient-to-r from-orange-400 to-purple-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, (totalBudgetAvecCourant / budgetTotal) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">Progression des dépenses</div>
                    <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${totalSpentAvecCourant <= budgetTotal ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, (totalSpentAvecCourant / budgetTotal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Section des dépenses réelles depuis les transactions */}
            {task?.id && (
              <div className="glass-card p-4 border rounded-xl border-blue-200 bg-gradient-to-br from-blue-50/60 to-white/60">
                <div className="flex items-center space-x-2 mb-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-800">Dépenses réelles (Transactions Firebase)</h4>
                  {loadingExpenses && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Montant dépensé</div>
                    <div className="text-lg font-bold text-blue-700">
                      {realExpenses.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Nombre de transactions</div>
                    <div className="text-lg font-bold text-blue-700">
                      {realExpenses.transactionCount}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Dernière dépense</div>
                    <div className="text-sm font-medium text-blue-700">
                      {realExpenses.lastExpenseDate 
                        ? new Date(realExpenses.lastExpenseDate).toLocaleDateString('fr-FR')
                        : 'Aucune'
                      }
                    </div>
                  </div>
                </div>
                
                {realExpenses.totalSpent > 0 && formData.budget && realExpenses.totalSpent > formData.budget && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-orange-700">
                        Les dépenses réelles ({realExpenses.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}) 
                        dépassent le budget estimé ({formData.budget.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Budget estimé et dépense réelle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="task-budget" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Budget estimé pour cette tâche (FCFA)</span>
                </label>
                <input
                  id="task-budget"
                  type="number"
                  min={0}
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${formErrors.budget ? 'border-red-500' : 'border-white/30'}`}
                  value={formData.budget ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, budget: undefined }));
                      setFormErrors(prev => ({ ...prev, budget: '' }));
                    } else {
                      const numValue = Number(value);
                      // Validation stricte : limiter à 100 millions pour éviter les valeurs aberrantes
                      if (isNaN(numValue) || numValue < 0) {
                        setFormErrors(prev => ({ ...prev, budget: 'Le budget doit être un nombre positif' }));
                      } else if (numValue > 100000000) {
                        setFormErrors(prev => ({ ...prev, budget: 'Le budget ne peut pas dépasser 100 millions FCFA' }));
                      } else {
                        setFormData(prev => ({ ...prev, budget: numValue }));
                        setFormErrors(prev => ({ ...prev, budget: '' }));
                      }
                    }
                  }}
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
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, spent: undefined }));
                      setFormErrors(prev => ({ ...prev, spent: '' }));
                    } else {
                      const numValue = Number(value);
                      // Validation stricte : limiter à 100 millions pour éviter les valeurs aberrantes
                      if (isNaN(numValue) || numValue < 0) {
                        setFormErrors(prev => ({ ...prev, spent: 'La dépense doit être un nombre positif' }));
                      } else if (numValue > 100000000) {
                        setFormErrors(prev => ({ ...prev, spent: 'La dépense ne peut pas dépasser 100 millions FCFA' }));
                      } else {
                        // Validation par rapport au budget de la phase
                        if (formData.phaseId && currentProject) {
                          const phase = phases.find(p => p.id === formData.phaseId);
                          if (phase) {
                            const budgetTotal = phase.estimatedBudget || 0;
                            const existingTasks = (phase.tasks || [])
                              .filter(t => !task || t.id !== task.id); // Exclure la tâche en cours d'édition
                            const totalSpentTasks = existingTasks
                              .reduce((sum, t) => sum + (t.spent || 0), 0);
                            const totalSpentAvecCourant = totalSpentTasks + numValue;
                            
                            if (totalSpentAvecCourant > budgetTotal) {
                              setFormErrors(prev => ({ 
                                ...prev, 
                                spent: `Cette dépense (${numValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}) ferait dépasser le budget total de la phase (${budgetTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}). Dépense totale résultante : ${totalSpentAvecCourant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}.` 
                              }));
                            } else {
                              setFormData(prev => ({ ...prev, spent: numValue }));
                              setFormErrors(prev => ({ ...prev, spent: '' }));
                            }
                          } else {
                            setFormData(prev => ({ ...prev, spent: numValue }));
                            setFormErrors(prev => ({ ...prev, spent: '' }));
                          }
                        } else {
                          setFormData(prev => ({ ...prev, spent: numValue }));
                          setFormErrors(prev => ({ ...prev, spent: '' }));
                        }
                      }
                    }
                  }}
                  placeholder="Montant dépensé (optionnel)"
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
                <option value="todo">Non commencé</option>
                <option value="in_progress">En cours</option>
                <option value="on_hold">En attente</option>
                <option value="done">Terminé</option>
                <option value="cancelled">Annulé</option>
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
                {(() => {
                  // Utiliser Firebase members en priorité, sinon fallback vers teamMembers
                  const membersToUse = firebaseTeamMembers.length > 0 ? firebaseTeamMembers : teamMembers;
                  
                  // Dédupliquer encore une fois et garantir des clés uniques
                  const uniqueMembers = membersToUse.filter((member, index, self) => {
                    // Vérifier que l'ID existe et est unique
                    if (!member.id) return false;
                    return index === self.findIndex(m => m.id === member.id);
                  });
                  
                  return uniqueMembers.map((member, index) => {
                    // Utiliser une clé composée pour garantir l'unicité
                    const memberEmail = 'email' in member ? member.email : 'no-email';
                    const uniqueKey = `${member.id}-${index}-${memberEmail || 'no-email'}`;
                    
                    return (
                      <label key={uniqueKey} className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-200">
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
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{member.name}</span>
                          {member.role && (
                            <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                          )}
                        </div>
                      </label>
                    );
                  });
                })()}
              </div>
              {(firebaseTeamMembers.length === 0 && teamMembers.length === 0) && (
                <div className="text-center p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">Aucun membre d'équipe disponible. Ajoutez des membres dans la section Équipe.</p>
                </div>
              )}
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
          {(task?.parentId || (task?.subTasks && task.subTasks.length > 0)) && (
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
              {task?.subTasks && task.subTasks.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <ArrowDown className="w-4 h-4 text-indigo-500" />
                    <span>Sous-tâches ({task.subTasks.length})</span>
                  </label>
                  <div className="glass-card p-4 max-h-48 overflow-y-auto space-y-2">
                    {task.subTasks.map((subTask) => (
                      <div key={subTask.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <div>
                            <p>{subTask.name}</p>
                            <p className="text-xs">{getStatusLabel(subTask.status)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subTask.status)}`}>
                          {subTask.status === 'done' ? '✅ 100%' : subTask.status === 'in_progress' ? '⏳ 50%' : '⏸️ 0%'}
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
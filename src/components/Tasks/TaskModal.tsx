import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, AlertTriangle, Clock, CheckCircle, ChevronDown, Info,
  Target, User, Users, DollarSign, FileText, Flag, Zap, Play, Pause,
  Layers, ArrowUp, ArrowDown
} from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import CostManagement from '../../components/Tasks/CostManagement';

// Utiliser le type centralisé
import { TaskStatus } from '../../contexts/projectTypes';
type TaskPriority = 'low' | 'medium' | 'high';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: ProjectTask | null;
    onSave: (taskData: Partial<ProjectTask>, isSubTask?: boolean, parentTaskId?: string) => void;
    onDelete?: (taskId: string) => void;
    projectPhases?: Array<{ id: string; name: string }>;
    teamMembers: Array<{ id: string; name: string; role?: string }>;
    allTasks?: ProjectTask[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete, teamMembers }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState<Partial<ProjectTask> & {
        status: TaskStatus;
        priority: TaskPriority;
        spent: number;
        precision?: number;
    }>({
        name: '',
        description: '',
        status: 'not_started' as const,
        priority: 'medium' as const,
        assignedTo: [],
        startDate: '',
        endDate: '',
        budget: 0,
        spent: 0,
        dependencies: [],
        costItems: [],
        precision: 3,
        subtasks: []
    });

    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubTask, setIsSubTask] = useState<boolean>(!!task?.parentId);
    const [parentTaskId, setParentTaskId] = useState<string | undefined>(task?.parentId);
    const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);

    // Fonction de validation et soumission du formulaire
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
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            // Focus sur le premier champ en erreur si besoin
            const firstErrorField = Object.keys(errors)[0];
            const el = document.getElementById(`task-${firstErrorField}`);
            if (el) el.focus();
            return;
        }
        if (typeof onSave === 'function') {
            onSave({ ...formData }, isSubTask, parentTaskId);
        }
        onClose();
    };

    // Réinitialiser le formulaire lorsque le modal s'ouvre/se ferme ou que la tâche change
    useEffect(() => {
        if (task) {
            setFormData({
                name: task.name || '',
                description: task.description || '',
                status: task.status || 'not_started',
                priority: task.priority || 'medium',
                assignedTo: task.assignedTo || '',
                startDate: task.startDate || '',
                endDate: task.endDate || '',
                budget: task.budget || 0,
                spent: typeof task.spent === 'number' ? task.spent : 0
            });

            setIsSubTask(!!task.parentId);
            setParentTaskId(task.parentId);
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'not_started',
                priority: 'medium',
                assignedTo: [],
                startDate: new Date().toISOString().split('T')[0],
                spent: 0,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                budget: 0
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

    if (!isOpen) return null;

    const statusOptions: { value: TaskStatus; label: string; icon: JSX.Element }[] = [
        { value: 'not_started', label: 'Non commencé', icon: <Clock className="w-4 h-4" /> },
        { value: 'in_progress', label: 'En cours', icon: <AlertTriangle className="w-4 h-4" /> },
        { value: 'completed', label: 'Terminé', icon: <CheckCircle className="w-4 h-4" /> },
        { value: 'blocked', label: 'Bloqué', icon: <X className="w-4 h-4" /> }
    ];

    const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
        { value: 'low', label: 'Basse', color: 'text-green-600' },
        { value: 'medium', label: 'Moyenne', color: 'text-yellow-600' },
        { value: 'high', label: 'Haute', color: 'text-red-600' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'blocked':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'not_started':
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
            case 'not_started':
            default:
                return 'Non commencé';
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-white/20 shadow-2xl">
                    {/* Header moderne avec glassmorphism */}
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
                                className="p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 focus:ring-4 focus:ring-orange-500/20"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Section Informations de base */}
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                            </div>
                            
                            {/* Champ nom de la tâche */}
                            <div className="space-y-2">
                                <label htmlFor="task-name" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <Target className="w-4 h-4 text-orange-500" />
                                    <span>Nom de la tâche <span className="text-red-500">*</span></span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="task-name"
                                        type="text"
                                        className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 ${
                                            formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/30'
                                        }`}
                                        value={formData.name}
                                        onChange={e => {
                                            handleInputChange('name', e.target.value);
                                            if (formErrors.name) {
                                                setFormErrors(prev => ({ ...prev, name: '' }));
                                            }
                                        }}
                                        placeholder="Ex: Installation électrique bureau principal"
                                        autoFocus
                                    />
                                    {formErrors.name && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.name && (
                                    <div className="flex items-center space-x-2 p-3 bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-lg">
                                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <p className="text-red-600 text-sm">{formErrors.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Type de tâche (principale ou sous-tâche) */}
                            {!task && (
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Flag className="w-4 h-4 text-purple-500" />
                                        <span>Type de tâche</span>
                                    </label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={!isSubTask}
                                                onChange={() => setIsSubTask(false)}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                                            />
                                            <span className="text-gray-700 font-medium">🎢 Tâche principale</span>
                                        </label>
                                        <label className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={isSubTask}
                                                onChange={() => setIsSubTask(true)}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                                            />
                                            <span className="text-gray-700 font-medium">🔗 Sous-tâche</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Champ description */}
                            <div className="space-y-2">
                                <label htmlFor="taskDescription" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span>Description détaillée</span>
                                </label>
                                <textarea
                                    id="taskDescription"
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    placeholder="Décrivez précisément la tâche, les objectifs, méthodes, matériaux nécessaires..."
                                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 resize-none"
                                />
                            </div>
                        </div>

                        {/* Section Planning & Assignation */}
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Zap className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Planning & Assignation</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Statut */}
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Play className="w-4 h-4 text-green-500" />
                                        <span>Statut</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(isDropdownOpen === 'status' ? null : 'status')}
                                            className={`w-full flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 hover:border-green-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 ${getStatusColor(formData.status || 'not_started')}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {statusOptions.find(opt => opt.value === formData.status)?.icon}
                                                <span className="font-medium">{statusOptions.find(opt => opt.value === formData.status)?.label}</span>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </button>

                                        {isDropdownOpen === 'status' && (
                                            <div className="absolute z-20 mt-2 w-full glass-card border border-white/20 shadow-2xl rounded-xl overflow-hidden">
                                                {statusOptions.map((status) => (
                                                    <button
                                                        key={status.value}
                                                        type="button"
                                                        onClick={() => {
                                                            handleInputChange('status', status.value as TaskStatus);
                                                            setIsDropdownOpen(null);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/20 transition-all duration-200 flex items-center gap-3 border-b border-white/10 last:border-b-0"
                                                    >
                                                        {status.icon}
                                                        <span className="font-medium">{status.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Priorité */}
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Flag className="w-4 h-4 text-red-500" />
                                        <span>Priorité</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(isDropdownOpen === 'priority' ? null : 'priority')}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
                                        >
                                            <span className={`font-medium ${priorityOptions.find(p => p.value === formData.priority)?.color}`}>
                                                🚩 {priorityOptions.find(p => p.value === formData.priority)?.label}
                                            </span>
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </button>
                                        {isDropdownOpen === 'priority' && (
                                            <div className="absolute z-20 mt-2 w-full glass-card border border-white/20 shadow-2xl rounded-xl overflow-hidden">
                                                {priorityOptions.map((priority) => (
                                                    <button
                                                        key={priority.value}
                                                        type="button"
                                                        onClick={() => {
                                                            handleInputChange('priority', priority.value as TaskPriority);
                                                            setIsDropdownOpen(null);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-b-0 ${priority.color} font-medium`}
                                                    >
                                                        🚩 {priority.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Section Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date de début */}
                                <div className="space-y-2">
                                    <label htmlFor="task-startDate" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span>Date de début</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="task-startDate"
                                            type="date"
                                            value={formData.startDate || ''}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 ${(formErrors.startDate || formErrors.dates) ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                        />
                                        {(formErrors.startDate || formErrors.dates) && (
                                            <div className="flex items-center space-x-2 mt-2 text-red-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <p className="text-sm font-medium">{formErrors.startDate || formErrors.dates}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date de fin */}
                                <div className="space-y-2">
                                    <label htmlFor="task-endDate" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4 text-purple-500" />
                                        <span>Date de fin</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="task-endDate"
                                            type="date"
                                            value={formData.endDate || ''}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 ${(formErrors.endDate || formErrors.dates) ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                        />
                                        {(formErrors.endDate || formErrors.dates) && (
                                            <div className="flex items-center space-x-2 mt-2 text-red-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <p className="text-sm font-medium">{formErrors.endDate || formErrors.dates}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Budget & Assignation */}
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Budget & Assignation</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Budget */}
                                <div className="space-y-2">
                                    <label htmlFor="task-budget" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span>Budget (FCFA) <span className="text-red-500">*</span></span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="task-budget"
                                            type="number"
                                            value={formData.budget || 0}
                                            onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                                            className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 ${formErrors.budget ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            min="0"
                                            step="1000"
                                            placeholder="Ex: 50000"
                                        />
                                        {formErrors.budget && (
                                            <div className="flex items-center space-x-2 mt-2 text-red-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <p className="text-sm font-medium">{formErrors.budget}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Assignation */}
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span>Assigné à</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            multiple
                                            value={formData.assignedTo || []}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'assignedTo',
                                                    Array.from(e.target.selectedOptions, (option) => option.value)
                                                )
                                            }
                                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 appearance-none"
                                        >
                                            <option value="">👤 Sélectionner un membre</option>
                                            {teamMembers.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    👨‍💼 {member.name} - {member.role}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Estimation & Coûts */}
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Target className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Estimation & Coûts</h3>
                            </div>
                            
                            {/* Niveau de précision */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Target className="w-4 h-4 text-orange-500" />
                                        <span>Niveau de précision</span>
                                    </span>
                                    <div className="relative group">
                                        <Info className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg p-3 w-64 shadow-xl border border-white/10">
                                            <p className="font-medium mb-1">🎯 Niveau de précision de l'estimation</p>
                                            <p>1-2: Estimation approximative</p>
                                            <p>3-4: Estimation détaillée</p>
                                            <p>5: Estimation très précise</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleInputChange('precision', level)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all duration-300 hover:scale-110 ${
                                                formData.precision === level 
                                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg ring-4 ring-orange-500/20' 
                                                    : 'bg-white/70 backdrop-blur-sm border-2 border-white/30 text-gray-600 hover:border-orange-300'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gestion des coûts détaillés */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span>Gestion des coûts détaillés</span>
                                </label>
                                <div className="glass-card p-4 border border-white/20">
                                    <CostManagement
                                        costItems={formData.costItems || []}
                                        onCostItemsChange={(items) => {
                                            setFormData(prev => ({ ...prev, costItems: items }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Informations Complémentaires */}
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
                                                <div key={subTask.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/70 transition-all duration-200">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{subTask.name}</p>
                                                            <p className="text-xs text-gray-600">{getStatusLabel(subTask.status as TaskStatus)}</p>
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

                        {/* Section Équipe */}
                        <div className="glass-card p-6 space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Équipe Assignée</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <span>Membres de l'équipe</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/70 transition-all duration-200">
                                            <input
                                                type="checkbox"
                                                id={`member-${member.id}`}
                                                checked={formData.assignedTo?.includes(member.id) || false}
                                                onChange={() => handleToggleAssigned(member.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                                            />
                                            <label htmlFor={`member-${member.id}`} className="flex items-center space-x-2 text-sm font-medium text-gray-900 cursor-pointer">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-xs text-gray-600">{member.role}</p>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section Actions */}
                        <div className="glass-card p-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl text-gray-700 font-medium hover:bg-white/90 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 hover:scale-105"
                                    >
                                        ❌ Annuler
                                </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300"
                                    >
                                        ✨ {task ? 'Mettre à jour' : 'Créer la tâche'}
                                    </button>
                                </div>
                                
                                {/* Bouton de suppression */}
                                {task && onDelete && (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(true)}
                                        className="w-full px-6 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300"
                                    >
                                        🗑️ Supprimer la tâche
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Modal de confirmation de suppression */}
                        {showConfirm && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="glass-card w-full max-w-md mx-4 p-6 border border-white/20 shadow-2xl">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                Voulez-vous vraiment supprimer cette tâche ?
                                                <br />
                                                <span className='font-bold text-red-600'>Cette action est irréversible.</span>
                                            </p>
                                        </div>
                                        <div className="flex w-full space-x-3 pt-2">
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl text-gray-700 font-medium hover:bg-white/90 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300"
                                                onClick={() => setShowConfirm(false)}
                                            >
                                                ❌ Annuler
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300"
                                                onClick={() => {
                                                    if (task?.id && onDelete) {
                                                        onDelete(task.id);
                                                    }
                                                    setShowConfirm(false);
                                                    onClose();
                                                }}
                                            >
                                                🗑️ Confirmer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;

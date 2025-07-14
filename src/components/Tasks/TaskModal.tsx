import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Clock, CheckCircle, ChevronDown, Info } from 'lucide-react';
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
    teamMembers: Array<{ id: string; name: string }>;
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
                assignedTo: task.assignedTo || [],
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Champ nom de la tâche */}
                            <div className="mb-4">
                                <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom de la tâche <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="task-name"
                                    type="text"
                                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    autoFocus
                                />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>

                            {/* Type de tâche (principale ou sous-tâche) */}
                            {!task && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de tâche
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                checked={!isSubTask}
                                                onChange={() => setIsSubTask(false)}
                                                className="form-radio h-4 w-4 text-orange-600"
                                            />
                                            <span className="ml-2">Tâche principale</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                checked={isSubTask}
                                                onChange={() => setIsSubTask(true)}
                                                className="form-radio h-4 w-4 text-orange-600"
                                            />
                                            <span className="ml-2">Sous-tâche</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Champ description */}
                            <div>
                                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description détaillée
                                </label>
                                <textarea
                                    id="taskDescription"
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={3}
                                    placeholder="Décrivez précisément la tâche, les objectifs, méthodes, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Statut
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(isDropdownOpen === 'status' ? null : 'status')}
                                        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-left ${getStatusColor(formData.status || 'not_started')}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {statusOptions.find(opt => opt.value === formData.status)?.icon}
                                            <span>{statusOptions.find(opt => opt.value === formData.status)?.label}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {isDropdownOpen === 'status' && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                                            {statusOptions.map((status) => (
                                                <button
                                                    key={status.value}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('status', status.value as TaskStatus);
                                                        setIsDropdownOpen(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                    {status.icon}
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priorité
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(isDropdownOpen === 'priority' ? null : 'priority')}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-left"
                                    >
                                        <span className={priorityOptions.find(p => p.value === formData.priority)?.color}>
                                            {priorityOptions.find(p => p.value === formData.priority)?.label}
                                        </span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {isDropdownOpen === 'priority' && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                                            {priorityOptions.map((priority) => (
                                                <button
                                                    key={priority.value}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('priority', priority.value as TaskPriority);
                                                        setIsDropdownOpen(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${priority.color}`}
                                                >
                                                    {priority.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de début
                                </label>
                                <div className="relative">
                                    <input
                                        id="task-startDate"
                                        type="date"
                                        value={formData.startDate || ''}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${(formErrors.startDate || formErrors.dates) ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {(formErrors.startDate || formErrors.dates) && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.startDate || formErrors.dates}</p>
                                    )}
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de fin
                                </label>
                                <div className="relative">
                                    <input
                                        id="task-endDate"
                                        type="date"
                                        value={formData.endDate || ''}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${(formErrors.endDate || formErrors.dates) ? 'border-red-400' : 'border-gray-300'}`}
                                    />
                                    {(formErrors.endDate || formErrors.dates) && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.endDate || formErrors.dates}</p>
                                    )}
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Budget (FCFA)
                            </label>
                            <input
                                id="task-budget"
                                type="number"
                                value={formData.budget || 0}
                                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${(formErrors.budget) ? 'border-red-400' : 'border-gray-300'}`}
                                min="0"
                                step="1000"
                            />
                            {formErrors.budget && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.budget}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">Niveau de précision</span>
                                <div className="relative group ml-2">
                                    <Info className="w-4 h-4 text-gray-400" />
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                                        Niveau de précision de l'estimation (1-5). Plus le niveau est élevé, plus l'estimation est précise.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => handleInputChange('precision', level)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.precision === level ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gestion des coûts détaillés
                            </label>
                            <CostManagement
                                costItems={formData.costItems || []}
                                onCostItemsChange={(items) => {
                                    // Synchronise dynamiquement les costItems avec le formData du TaskModal
                                    setFormData(prev => ({ ...prev, costItems: items }));
                                }}
                            />
                        </div>

                        {task?.parentId && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    Cette tâche est une sous-tâche. Elle appartient à une tâche parente.
                                </p>
                            </div>
                        )}

                        {task?.subtasks && task.subtasks.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sous-tâches ({task.subtasks.length})
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                                    {task.subtasks.map((subTask) => (
                                        <div key={subTask.id} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{subTask.name}</p>
                                                <p className="text-xs text-gray-500">{getStatusLabel(subTask.status as TaskStatus)}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(subTask.status)}`}>
                                                {subTask.status === 'completed' ? '100%' : subTask.status === 'in_progress' ? '50%' : '0%'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Membres assignés
                            </label>
                            <div className="space-y-2">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`member-${member.id}`}
                                            checked={formData.assignedTo?.includes(member.id) || false}
                                            onChange={() => handleToggleAssigned(member.id)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`member-${member.id}`} className="ml-2 block text-sm text-gray-900">
                                            {member.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2 pt-4">
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Enregistrer
                                </button>
                            </div>
                            {task && onDelete && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(true)}
                                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                    {showConfirm && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                                                <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
                                                <h3 className="text-lg font-semibold mb-2 text-gray-900">Confirmer la suppression</h3>
                                                <p className="text-gray-700 mb-4 text-center">Voulez-vous vraiment supprimer cette tâche ? Cette action est <span className='font-bold text-red-600'>irréversible</span>.</p>
                                                <div className="flex w-full space-x-2">
                                                    <button
                                                        type="button"
                                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200"
                                                        onClick={() => setShowConfirm(false)}
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                                        onClick={() => {
                                                            if (task?.id) {
                                                                onDelete(task.id);
                                                            }
                                                            setShowConfirm(false);
                                                            onClose();
                                                        }}
                                                    >
                                                        Confirmer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default TaskModal;

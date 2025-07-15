import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Plus, BarChart3, Clock, CheckCircle, AlertTriangle, Target, Settings } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, ProjectPhase } from '../../contexts/projectTypes';
import { GlassCard, AnimatedCounter } from '../UI/VisualEffects';
import GanttChart from './GanttChart';
import PhaseModal from './PhaseModal';



interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  onPhaseUpdate: (phase: ProjectPhase) => void;
  onError: (error: string) => void;
}

export const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'calendar' | 'list';
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [phaseError, setPhaseError] = useState('');

  useEffect(() => {
    if (projectContext.currentProject) {
      const allTasks: ProjectTask[] = [];
      
      // Parcourir toutes les phases du projet
      (projectContext.currentProject.phases || []).forEach((phase: ProjectPhase) => {
        if (phase.tasks) {
          phase.tasks.forEach((task: ProjectTask) => {
            allTasks.push(task);
          });
        }
      });
      
      setTasks(allTasks);
    }
  }, [projectContext.currentProject]);

  // Les tâches sont déjà au format ProjectTask, pas besoin de conversion
  // Le GanttChart accepte directement les ProjectTask

  const handleTaskCreate = (task: Omit<ProjectTask, 'id'>) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    const newTask: ProjectTask = {
      ...task,
      id: crypto.randomUUID(),
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo || '']
    };
    
    // Ajouter à la première phase disponible ou créer une phase par défaut
    const phases = projectContext.currentProject.phases || [];
    if (phases.length > 0) {
      const firstPhase = phases[0];
      projectContext.addTask(projectContext.currentProject.id, firstPhase.id, newTask);
    }
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<ProjectTask>) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    // Trouver la phase contenant la tâche
    const phaseId = projectContext.currentProject.phases.find(phase => 
      phase.tasks.some(task => task.id === taskId)
    )?.id;

    if (phaseId) {
      // Convertir les updates en ProjectTask
      const projectUpdates: Partial<ProjectTask> = {
        ...updates,
        assignedTo: updates.assignedTo ? (updates.assignedTo as string[]) : undefined
      };
      
      projectContext.updateTask(projectContext.currentProject.id, phaseId, taskId, projectUpdates);
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...projectUpdates } : task
      ));
    }
  };

  const handlePhaseUpdate = (phase: ProjectPhase) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    if (phaseModalMode === 'create') {
      projectContext.addPhase(projectContext.currentProject.id, phase);
    } else if (phaseModalMode === 'edit' && editingPhase) {
      projectContext.updatePhase(projectContext.currentProject.id, editingPhase.id, phase);
    }
    setIsPhaseModalOpen(false);
    setPhaseModalMode('create');
    setEditingPhase(null);
    setPhaseError('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <GlassCard className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Target className="text-orange-500 w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Planning</h1>
              <p className="text-gray-500">Gestion des phases et tâches</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPhaseModalOpen(true)} 
              className="glass-card hover:scale-105 transition-all duration-200 px-4 py-2 flex items-center gap-2"
            >
              <Plus className="text-orange-500" />
              <span className="font-medium">Nouvelle Phase</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-500 w-6 h-6" />
                <span className="text-gray-600">Total Tâches</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-blue-500/20 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500 w-6 h-6" />
                <span className="text-gray-600">Terminées</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'done').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-emerald-500/20 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500 w-6 h-6" />
                <span className="text-gray-600">En Cours</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'in_progress').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-blue-500/20 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
                <span className="text-gray-600">À Faire</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'todo').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-orange-500/20 rounded-full">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'todo').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filtres */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="text-purple-500 w-6 h-6" />
            <span className="text-gray-600">Filtres</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Projet</span>
              <select className="glass-card px-3 py-1 border-2 border-white/20 backdrop-blur-sm">
                <option value="all">Tous les projets</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Phase</span>
              <select className="glass-card px-3 py-1 border-2 border-white/20 backdrop-blur-sm">
                <option value="all">Toutes les phases</option>
              </select>
            </div>
            <button 
              className="glass-card hover:scale-105 transition-all duration-200 px-4 py-2 flex items-center gap-2"
            >
              <Settings className="text-purple-500" />
              <span className="font-medium">Appliquer</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Vue */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Settings className="text-purple-500 w-6 h-6" />
            <span className="text-gray-600">Vue</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'gantt' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('gantt')}
            >
              <span className="font-medium">Gantt</span>
            </button>
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'calendar' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('calendar')}
            >
              <span className="font-medium">Calendrier</span>
            </button>
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'list' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('list')}
            >
              <span className="font-medium">Liste</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {viewType === 'gantt' && (
            <GanttChart 
              tasks={tasks} 
              onTaskUpdate={handleTaskUpdate} 
              onTaskCreate={handleTaskCreate}
            />
          )}
        </div>
      </GlassCard>

      {/* Modal Phase */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        mode={phaseModalMode}
        onPhaseUpdate={handlePhaseUpdate}
        onError={setPhaseError}
      />
    </div>
  );

const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'calendar' | 'list';
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [phaseError, setPhaseError] = useState('');

  useEffect(() => {
    if (projectContext.currentProject) {
      const allTasks: ProjectTask[] = [];
      
      // Parcourir toutes les phases du projet
      (projectContext.currentProject.phases || []).forEach((phase: ProjectPhase) => {
        if (phase.tasks) {
          phase.tasks.forEach((task: ProjectTask) => {
            allTasks.push(task);
          });
        }
      });
      
      setTasks(allTasks);
    }
  }, [projectContext.currentProject]);

  const handleTaskUpdate = (taskId: string, updates: Partial<ProjectTask>) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    // Trouver la phase contenant la tâche
    const phaseId = projectContext.currentProject.phases.find(phase => 
      phase.tasks.some(task => task.id === taskId)
    )?.id;

    if (phaseId) {
      projectContext.updateTask(projectContext.currentProject.id, phaseId, taskId, updates);
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  };

  const handleTaskCreate = (taskData: Omit<ProjectTask, 'id' | 'costItems' | 'spent'>) => {
    if (!projectContext || !projectContext.currentProject) return;
    const phases = projectContext.currentProject.phases || [];
    if (phases.length === 0) {
      alert("Veuillez d'abord créer une phase avant d'ajouter une tâche.");
      return;
    }
    // Ajouter la tâche à la première phase disponible
    const phaseId = phases[0].id;
    projectContext.addTask(projectContext.currentProject.id, phaseId, taskData);
    // Rafraîchir les tâches
    const allTasks: ProjectTask[] = [];
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        allTasks.push(task);
      });
    });
    setTasks(allTasks);
  };

  const handlePhaseUpdate = (phase: ProjectPhase) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    if (phaseModalMode === 'create') {
      projectContext.addPhase(projectContext.currentProject.id, phase);
    } else if (phaseModalMode === 'edit' && editingPhase) {
      projectContext.updatePhase(projectContext.currentProject.id, editingPhase.id, phase);
    }
    setIsPhaseModalOpen(false);
    setPhaseModalMode('create');
    setEditingPhase(null);
    setPhaseError('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <GlassCard className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Target className="text-orange-500 w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Planning</h1>
              <p className="text-gray-500">Gestion des phases et tâches</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPhaseModalOpen(true)} 
              className="glass-card hover:scale-105 transition-all duration-200 px-4 py-2 flex items-center gap-2"
            >
              <Plus className="text-orange-500" />
              <span className="font-medium">Nouvelle Phase</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-500 w-6 h-6" />
                <span className="text-gray-600">Total Tâches</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-blue-500/20 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500 w-6 h-6" />
                <span className="text-gray-600">Terminées</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'done').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-emerald-500/20 rounded-full">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500 w-6 h-6" />
                <span className="text-gray-600">En Cours</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'in_progress').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-blue-500/20 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
                <span className="text-gray-600">À Faire</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'todo').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-orange-500/20 rounded-full">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(tasks.filter(t => t.status === 'todo').length / tasks.length) * 100}%` }}></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filtres */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="text-purple-500 w-6 h-6" />
            <span className="text-gray-600">Filtres</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Projet</span>
              <select className="glass-card px-3 py-1 border-2 border-white/20 backdrop-blur-sm">
                <option value="all">Tous les projets</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Phase</span>
              <select className="glass-card px-3 py-1 border-2 border-white/20 backdrop-blur-sm">
                <option value="all">Toutes les phases</option>
              </select>
            </div>
            <button 
              className="glass-card hover:scale-105 transition-all duration-200 px-4 py-2 flex items-center gap-2"
            >
              <Settings className="text-purple-500" />
              <span className="font-medium">Appliquer</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Vue */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Settings className="text-purple-500 w-6 h-6" />
            <span className="text-gray-600">Vue</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'gantt' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('gantt')}
            >
              <span className="font-medium">Gantt</span>
            </button>
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'calendar' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('calendar')}
            >
              <span className="font-medium">Calendrier</span>
            </button>
            <button
              className={`glass-card hover:scale-105 transition-all duration-200 px-4 py-2 ${viewType === 'list' ? 'bg-blue-600/20' : ''}`}
              onClick={() => setViewType('list')}
            >
              <span className="font-medium">Liste</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {viewType === 'gantt' && (
            <GanttChart tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          )}
        </div>
      </GlassCard>

      {/* Modal Phase */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        mode={phaseModalMode}
        onPhaseUpdate={handlePhaseUpdate}
        onError={setPhaseError}
      />
    </div>
  );
};

export default Planning;
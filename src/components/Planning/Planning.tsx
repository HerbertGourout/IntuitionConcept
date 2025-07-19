import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Plus, BarChart3, Clock, CheckCircle, AlertTriangle, Target, Settings } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, ProjectPhase } from '../../contexts/projectTypes';
import { GlassCard, AnimatedCounter } from '../UI/VisualEffects';
import SimpleGanttChart from './SimpleGanttChart';
import PhaseModal from './PhaseModal';

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
      assignedTo: task.assignedTo || ''
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
    const phases = projectContext.currentProject.phases || [];
    const phaseId = phases.find(phase => 
      (phase.tasks || []).some(task => task.id === taskId)
    )?.id;

    if (phaseId) {
      // Convertir les updates en ProjectTask
      const projectUpdates: Partial<ProjectTask> = {
        ...updates,
        assignedTo: updates.assignedTo || undefined
      };
      
      projectContext.updateTask(projectContext.currentProject.id, phaseId, taskId, projectUpdates);
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...projectUpdates } : task
      ));
    }
  };

  const handlePhaseSave = (phaseData: { name: string; startDate: string; endDate: string; estimatedBudget?: number }) => {
    if (!projectContext || !projectContext.currentProject) return;
    
    const phase: ProjectPhase = {
      id: phaseModalMode === 'edit' && editingPhase ? editingPhase.id : crypto.randomUUID(),
      name: phaseData.name,
      startDate: phaseData.startDate,
      endDate: phaseData.endDate,
      tasks: phaseModalMode === 'edit' && editingPhase ? editingPhase.tasks : [],
      status: phaseModalMode === 'edit' && editingPhase ? editingPhase.status : 'planned',
      estimatedBudget: phaseData.estimatedBudget !== undefined ? phaseData.estimatedBudget : undefined
    };
    
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

  const handlePhaseDelete = () => {
    if (!projectContext || !projectContext.currentProject || !editingPhase) return;
    
    projectContext.deletePhase(projectContext.currentProject.id, editingPhase.id);
    setIsPhaseModalOpen(false);
    setPhaseModalMode('create');
    setEditingPhase(null);
    setPhaseError('');
  };

  if (!projectContext.currentProject) {
    return (
      <div className="p-6">
        <GlassCard className="text-center py-12">
          <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet sélectionné</h3>
          <p className="text-gray-500">Sélectionnez un projet pour voir le planning</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Planning
              </h1>
              <p className="text-gray-600 mt-1">Gestion des tâches et phases du projet</p>
            </div>
          </div>
          <button
            onClick={() => setIsPhaseModalOpen(true)}
            className="btn-glass bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 transition-all duration-200 px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Phase
          </button>
        </div>
      </GlassCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-500 w-6 h-6" />
                <span className="text-gray-600">Total</span>
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
                <CheckCircle className="text-green-500 w-6 h-6" />
                <span className="text-gray-600">Terminées</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">
                <AnimatedCounter value={tasks.filter(t => t.status === 'done').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-green-500/20 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-800" 
                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}%` }}
              ></div>
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
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-800" 
                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 : 0}%` }}
              ></div>
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
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-800" 
                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'todo').length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Liste des phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(projectContext.currentProject.phases || []).length === 0 ? (
          <GlassCard className="text-center py-10 flex flex-col items-center justify-center">
            <Target className="w-10 h-10 text-orange-400 mb-2" />
            <div className="text-gray-700 font-semibold mb-1">Aucune phase créée</div>
            <button
              className="btn-glass bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg mt-2 hover:scale-105 transition"
              onClick={() => {
                setPhaseModalMode('create');
                setEditingPhase(null);
                setIsPhaseModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Nouvelle phase
            </button>
          </GlassCard>
        ) : (
          (projectContext.currentProject.phases || []).map((phase) => (
            <GlassCard
              key={phase.id}
              className="relative p-5 flex flex-col gap-2 glass-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    {phase.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {phase.startDate} — {phase.endDate}
                  </div>
                  <div className="text-xs text-gray-600">
                    {phase.tasks?.length || 0} tâche{(phase.tasks?.length || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    title="Éditer la phase"
                    onClick={() => {
                      setEditingPhase(phase);
                      setPhaseModalMode('edit');
                      setIsPhaseModalOpen(true);
                    }}
                  >
                    <span className="sr-only">Éditer</span>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2.828-2.828a2.828 2.828 0 114 4L7 21H3v-4l12.828-12.828z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-lg bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Supprimer la phase"
                    onClick={() => {
                      setEditingPhase(phase);
                      setPhaseModalMode('edit');
                      setIsPhaseModalOpen(true);
                    }}
                  >
                    <span className="sr-only">Supprimer</span>
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                    </svg>
                  </button>
                </div>
                {/* Budget et finances de la phase */}
                {typeof phase.estimatedBudget === 'number' && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700">
                        <BarChart3 className="w-4 h-4 text-orange-500" /> Budget estimé&nbsp;:
                        <span className="font-bold">{phase.estimatedBudget.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                      </span>
                    </div>
                    {/* Calcul du coût réel des tâches */}
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700">
                        <Clock className="w-4 h-4 text-blue-500" /> Dépensé&nbsp;:
                        <span className="font-bold">
                          {(() => {
                            const spent = (phase.tasks||[]).reduce((sum, t) => typeof t.spent === 'number' ? sum + t.spent : sum, 0);
                            return spent.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()} €
                        </span>
                      </span>
                      {/* Badge d'alerte */}
                      {(() => {
                        const spent = (phase.tasks||[]).reduce((sum, t) => typeof t.spent === 'number' ? sum + t.spent : sum, 0);
                        if (phase.estimatedBudget === 0) return null;
                        const ratio = spent / phase.estimatedBudget;
                        if (ratio > 1) {
                          return <span className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold animate-pulse">Dépassement !</span>;
                        } else if (ratio > 0.9) {
                          return <span className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-orange-400 to-yellow-300 text-orange-900 font-bold">Alerte &gt;90%</span>;
                        }
                        return null;
                      })()}
                    </div>
                    {/* Barre de progression budgétaire */}
                    <div className="w-full h-2 bg-orange-100 rounded-full mt-2 relative overflow-hidden">
                      {(() => {
                        const spent = (phase.tasks||[]).reduce((sum, t) => typeof t.spent === 'number' ? sum + t.spent : sum, 0);
                        const ratio = phase.estimatedBudget ? Math.min(spent / phase.estimatedBudget, 1.2) : 0;
                        let color = 'bg-gradient-to-r from-orange-400 to-orange-600';
                        if (ratio > 1) color = 'bg-gradient-to-r from-red-500 to-orange-500';
                        else if (ratio > 0.9) color = 'bg-gradient-to-r from-orange-400 to-yellow-300';
                        return <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(ratio * 100, 120)}%` }}></div>;
                      })()}
                      {/* Marqueur 100% */}
                      <div className="absolute left-[100%] top-0 h-full w-0.5 bg-red-400 opacity-70" style={{height:'100%'}}></div>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
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

      {/* Section Diagramme de Gantt - Pleine Largeur */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Diagramme de Gantt</h3>
              <p className="text-gray-600">Planification visuelle des tâches du projet</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPhaseModalMode('create');
                setEditingPhase(null);
                setIsPhaseModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Nouvelle Phase</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewType === 'gantt' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setViewType('gantt')}
              >
                Gantt
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewType === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setViewType('calendar')}
              >
                Calendrier
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewType === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setViewType('list')}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/50 rounded-xl p-4">
          {viewType === 'gantt' && (
            <div className="w-full">
              <SimpleGanttChart 
                tasks={tasks} 
                onTaskUpdate={handleTaskUpdate}
              />
            </div>
          )}
          {viewType === 'calendar' && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Vue calendrier en développement</p>
            </div>
          )}
          {viewType === 'list' && (
            <div className="text-center py-12">
              <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Vue liste en développement</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Modal Phase */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSave={handlePhaseSave}
        onDelete={phaseModalMode === 'edit' ? handlePhaseDelete : undefined}
        initialPhase={editingPhase}
        mode={phaseModalMode}
      />
    </div>
  );
};

export default Planning;

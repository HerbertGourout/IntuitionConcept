import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Filter,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Settings,
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, ProjectPhase } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import { TeamService } from '../../services/teamService';
import RobustGanttChart from './RobustGanttChart';
import PhaseModal from './PhaseModal';
import { GlassCard, AnimatedCounter } from '../UI/VisualEffects';

export const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'calendar' | 'list';
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Récupérer les phases du projet actuel
  const phases = projectContext.currentProject?.phases || [];
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  
  // États pour le Gantt
  const [visibleStartDate, setVisibleStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const daysToShow = 14;

  // Charger les membres d'équipe
  const loadTeamMembers = useCallback(async () => {
    try {
      const members = await TeamService.getAllMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Erreur lors du chargement des membres d’équipe :', error);
    }
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Charger les tâches à partir des phases du projet
  useEffect(() => {
    if (!projectContext.currentProject) return;
    
    console.log('🔍 DEBUG Planning - Projet actuel:', projectContext.currentProject);
    console.log('🔍 DEBUG Planning - Phases du projet:', projectContext.currentProject.phases);
    
    const allTasks: ProjectTask[] = [];

    (projectContext.currentProject.phases || []).forEach((phase: ProjectPhase, phaseIndex) => {
      console.log(`📁 Phase ${phaseIndex + 1}:`, {
        name: phase.name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        tasks: phase.tasks,
        rawPhase: phase
      });
      
      if (phase.tasks) {
        phase.tasks.forEach((task: ProjectTask, taskIndex) => {
          console.log(`  📋 Tâche ${taskIndex + 1} de la phase "${phase.name}":`, {
            name: task.name,
            startDate: task.startDate,
            dueDate: task.dueDate,
            endDate: task.endDate,
            status: task.status,
            rawTask: task
          });
          allTasks.push(task);
        });
      } else {
        console.log(`  ⚠️ Phase "${phase.name}" n'a pas de tâches`);
      }
    });

    console.log('📊 Total tâches extraites:', allTasks.length);
    setTasks(allTasks);
  }, [projectContext.currentProject]);

  // Générer un ID unique de manière sécurisée
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substr(2, 9);
  };

  // Gestion de la sauvegarde d'une phase
  const handlePhaseSave = (phaseData: {
    name: string;
    startDate: string;
    endDate: string;
    estimatedBudget?: number;
  }) => {
    if (!projectContext.currentProject) return;

    const phase: ProjectPhase = {
      id: phaseModalMode === 'edit' && editingPhase ? editingPhase.id : generateId(),
      name: phaseData.name,
      startDate: phaseData.startDate,
      endDate: phaseData.endDate,
      tasks: phaseModalMode === 'edit' && editingPhase ? editingPhase.tasks : [],
      status: phaseModalMode === 'edit' && editingPhase ? editingPhase.status : 'planned',
      estimatedBudget: phaseData.estimatedBudget,
    };

    if (phaseModalMode === 'create') {
      projectContext.addPhase(projectContext.currentProject.id, phase);
    } else if (editingPhase) {
      projectContext.updatePhase(projectContext.currentProject.id, editingPhase.id, phase);
    }

    setIsPhaseModalOpen(false);
    setPhaseModalMode('create');
    setEditingPhase(null);
  };

  // Gestion de la suppression d'une phase
  const handlePhaseDelete = () => {
    if (!projectContext.currentProject || !editingPhase) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la phase "${editingPhase.name}" ? Cette action est irréversible.`)) {
      projectContext.deletePhase(projectContext.currentProject.id, editingPhase.id);
      setIsPhaseModalOpen(false);
      setPhaseModalMode('create');
      setEditingPhase(null);
    }
  };

  // Gestion de la mise à jour d'une tâche
  const handleTaskUpdate = (taskId: string, updates: Partial<ProjectTask>) => {
    if (!projectContext.currentProject) return;
    
    // Trouver la phase contenant la tâche
    const phases = projectContext.currentProject.phases || [];
    const phaseId = phases.find(phase => 
      (phase.tasks || []).some(task => task.id === taskId)
    )?.id;

    if (phaseId) {
      // Mettre à jour la tâche dans le contexte
      projectContext.updateTask(projectContext.currentProject.id, phaseId, taskId, updates);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
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
            onClick={() => {
              setPhaseModalMode('create');
              setEditingPhase(null);
              setIsPhaseModalOpen(true);
            }}
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
                <AnimatedCounter value={tasks.filter((t) => t.status === 'done').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-green-500/20 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-800"
                style={{ width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === 'done').length / tasks.length) * 100 : 0}%` }}
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
                <AnimatedCounter value={tasks.filter((t) => t.status === 'in_progress').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-blue-500/20 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-800"
                style={{ width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === 'in_progress').length / tasks.length) * 100 : 0}%` }}
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
                <AnimatedCounter value={tasks.filter((t) => t.status === 'todo').length} duration={1} />
              </h3>
            </div>
            <div className="w-1/2 h-1 bg-orange-500/20 rounded-full">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-800"
                style={{ width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === 'todo').length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Liste des phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {projectContext.currentProject.phases?.length === 0 ? (
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
          projectContext.currentProject.phases?.map((phase) => (
            <GlassCard key={phase.id} className="relative p-5 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
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
                <div className="flex gap-2">
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
                      handlePhaseDelete(); // ✅ Appelle directement la suppression avec confirmation
                    }}
                  >
                    <span className="sr-only">Supprimer</span>
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Budget */}
              {typeof phase.estimatedBudget === 'number' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700">
                      <BarChart3 className="w-4 h-4 text-orange-500" /> Budget estimé :
                      <span className="font-bold">
                        {phase.estimatedBudget.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700">
                      <Clock className="w-4 h-4 text-blue-500" /> Dépensé :
                      <span className="font-bold">
                        {(() => {
                          const spent = (phase.tasks || []).reduce((sum, t) => (typeof t.spent === 'number' ? sum + t.spent : sum), 0);
                          return spent.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()} FCFA
                      </span>
                    </span>
                  </div>

                  {/* Barre de progression budgétaire */}
                  <div className="w-full h-2 bg-orange-100 rounded-full mt-2 relative overflow-hidden">
                    {(() => {
                      const spent = (phase.tasks || []).reduce((sum, t) => (typeof t.spent === 'number' ? sum + t.spent : sum), 0);
                      const ratio = phase.estimatedBudget ? Math.min(spent / phase.estimatedBudget, 1.2) : 0;
                      let color = 'bg-gradient-to-r from-orange-400 to-orange-600';
                      if (ratio > 1) color = 'bg-gradient-to-r from-red-500 to-orange-500';
                      else if (ratio > 0.9) color = 'bg-gradient-to-r from-orange-400 to-yellow-300';

                      return <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(ratio * 100, 120)}%` }}></div>;
                    })()}
                    <div className="absolute left-[100%] top-0 h-full w-0.5 bg-red-400 opacity-70"></div>
                  </div>
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>

      {/* Filtres (placeholder) */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-2">
          <Filter className="text-purple-500 w-6 h-6" />
          <span className="text-gray-600">Filtres</span>
          <div className="flex-1"></div>
          <button className="glass-card px-4 py-2 flex items-center gap-2 hover:scale-105 transition">
            <Settings className="text-purple-500" />
            <span className="font-medium">Appliquer</span>
          </button>
        </div>
      </GlassCard>

      {/* Gantt Chart */}
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
              {(['gantt', 'calendar', 'list'] as const).map((view) => (
                <button
                  key={view}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewType === view ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setViewType(view)}
                >
                  {view === 'gantt' ? 'Gantt' : view === 'calendar' ? 'Calendrier' : 'Liste'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/50 rounded-xl p-4">
          {viewType === 'gantt' && (
            <RobustGanttChart 
              tasks={tasks} 
              teamMembers={teamMembers}
              visibleStartDate={visibleStartDate}
              setVisibleStartDate={setVisibleStartDate}
              daysToShow={daysToShow}
            />
          )}
          {viewType === 'calendar' && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Vue calendrier - En cours de développement</p>
            </div>
          )}
          {viewType === 'list' && (
            <div className="text-center py-12">
              <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Vue liste - En cours de développement</p>
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
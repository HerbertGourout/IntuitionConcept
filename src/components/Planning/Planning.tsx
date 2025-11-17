import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  Filter,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  X,
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, ProjectPhase } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';
import { TeamService } from '../../services/teamService';
import RobustGanttChart from './RobustGanttChart';
import PhaseModal from './PhaseModal';
import { GlassCard, AnimatedCounter } from '../UI/VisualEffects';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';
import ProgressBar from '../UI/ProgressBar';
import Badge from '../UI/Badge';
import DragDropPlanningBoard from '../DragDrop/DragDropPlanningBoard';
import StudyGanttChart from './StudyGanttChart';

export const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'kanban' | 'studies';
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  
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

  // Charger les membres d'équipe (scopés par projet)
  const loadTeamMembers = useCallback(async () => {
    try {
      if (!projectContext.currentProject?.id) {
        setTeamMembers([]);
        return;
      }
      const members = await TeamService.getMembersByProject(projectContext.currentProject.id);
      const unique = members.filter((m: TeamMember, i: number, self: TeamMember[]) => 
        i === self.findIndex((x: TeamMember) => x.id === m.id || x.email === m.email)
      );
      setTeamMembers(unique);
    } catch (error) {
      console.error('Erreur lors du chargement des membres d\'équipe :', error);
      setTeamMembers([]);
    }
  }, [projectContext.currentProject?.id]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Sélectionner automatiquement la première phase une seule fois (au chargement initial)
  const hasAutoSelectedRef = useRef(false);
  useEffect(() => {
    const phases = projectContext.currentProject?.phases || [];
    if (!hasAutoSelectedRef.current && phases.length > 0 && !selectedPhaseId) {
      setSelectedPhaseId(phases[0].id);
      hasAutoSelectedRef.current = true; // Empêche de réappliquer après interaction utilisateur
    }
  }, [projectContext.currentProject, selectedPhaseId]);

  // Charger les tâches à partir des phases du projet avec filtrage
  useEffect(() => {
    if (!projectContext.currentProject) return;
    
    // Debug logs removed for production
    
    const allTasks: ProjectTask[] = [];

    (projectContext.currentProject.phases || []).forEach((phase: ProjectPhase) => {
      // Filtrer par phase si une phase est sélectionnée
      if (selectedPhaseId && phase.id !== selectedPhaseId) {
        return; // Ignorer cette phase
      }
      
      // Debug logs removed for production
      
      if (phase.tasks) {
        phase.tasks.forEach((task: ProjectTask) => {
          // Debug logs removed for production
          allTasks.push(task);
        });
      }
    });

    // Debug logs removed for production
    setTasks(allTasks);
  }, [projectContext.currentProject, selectedPhaseId]);

  // Ajuster automatiquement la fenêtre du Gantt sur la phase sélectionnée
  useEffect(() => {
    if (!selectedPhaseId || tasks.length === 0) return;

    let earliest: Date | null = null;
    let latest: Date | null = null;
    for (const t of tasks) {
      // Aligner avec la logique du Gantt: fallback de la fin sur startDate si due/end absents
      if (!t.startDate) continue;
      const s = new Date(t.startDate as unknown as string);
      const endSource = (t.dueDate as unknown as string) || (t.endDate as unknown as string) || (t.startDate as unknown as string);
      const e = new Date(endSource);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) continue;
      s.setHours(0,0,0,0);
      e.setHours(0,0,0,0);
      if (!earliest || s < earliest) earliest = s;
      if (!latest || e > latest) latest = e;
    }
    if (earliest) {
      const start = new Date(earliest);
      start.setDate(start.getDate() - 2); // petite marge avant
      start.setHours(0,0,0,0);
      setVisibleStartDate(start);
    }
  }, [selectedPhaseId, tasks]);

  // Phases à afficher dans le Gantt, synchronisées avec le filtre
  const phasesToShow = React.useMemo(() => {
    const phases = projectContext.currentProject?.phases || [];
    return selectedPhaseId ? phases.filter((p: ProjectPhase) => p.id === selectedPhaseId) : phases;
  }, [projectContext.currentProject, selectedPhaseId]);

  // Générer un ID unique de manière sécurisée
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substr(2, 9);
  };

  // (note) phase status aggregation helper removed because unused

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
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <SectionHeader
          icon={<Calendar className="w-8 h-8 text-blue-600" />}
          title="Planning"
          subtitle="Gestion des tâches et phases du projet"
          actions={(
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
          )}
        />
      </GlassCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10">
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
            <div className="w-1/2">
              <ProgressBar value={100} tone="blue" />
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
            <div className="w-1/2">
              <ProgressBar value={tasks.length > 0 ? (tasks.filter((t) => t.status === 'done').length / tasks.length) * 100 : 0} tone="green" />
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
            <div className="w-1/2">
              <ProgressBar value={tasks.length > 0 ? (tasks.filter((t) => t.status === 'in_progress').length / tasks.length) * 100 : 0} tone="blue" />
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
            <div className="w-1/2">
              <ProgressBar value={tasks.length > 0 ? (tasks.filter((t) => t.status === 'todo').length / tasks.length) * 100 : 0} tone="orange" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Liste des phases */}
      <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(360px,1fr))] xl:[grid-template-columns:repeat(auto-fit,minmax(400px,1fr))] gap-8 xl:gap-10 mt-10">
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
          projectContext.currentProject.phases?.map((phase: ProjectPhase) => (
            <GlassCard key={phase.id} className="relative p-5 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    {phase.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>
                      {new Date(phase.startDate as unknown as string).toLocaleDateString('fr-FR')} 
                      &nbsp;→&nbsp; 
                      {new Date(phase.endDate as unknown as string).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs text-gray-600">
                      {(phase.tasks?.length || 0)} tâche{(phase.tasks?.length || 0) > 1 ? 's' : ''}
                    </div>
                    {(() => {
                      const invalidCount = (phase.tasks || []).filter((t) => {
                        if (!t?.startDate) return true;
                        const s = new Date((t.startDate as unknown as string));
                        const endSource = (t.dueDate as unknown as string) || (t.endDate as unknown as string) || (t.startDate as unknown as string);
                        const e = new Date(endSource);
                        if (isNaN(s.getTime()) || isNaN(e.getTime())) return true;
                        s.setHours(0, 0, 0, 0);
                        e.setHours(0, 0, 0, 0);
                        const durationDays = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return durationDays <= 0;
                      }).length;
                      return invalidCount > 0 ? (
                        <Badge tone="red" size="sm">
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {invalidCount} tâche{invalidCount > 1 ? 's' : ''} invalide{invalidCount > 1 ? 's' : ''}
                          </span>
                        </Badge>
                      ) : null;
                    })()}
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
                  <div className="mt-2">
                    {(() => {
                      const spent = (phase.tasks || []).reduce((sum, t) => (typeof t.spent === 'number' ? sum + t.spent : sum), 0);
                      const percent = phase.estimatedBudget && phase.estimatedBudget > 0 ? Math.min((spent / phase.estimatedBudget) * 100, 120) : 0;
                      const tone: 'orange' | 'red' = percent > 100 ? 'red' : 'orange';
                      return (
                        <ProgressBar value={percent} tone={tone} />
                      );
                    })()}
                  </div>
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>

      {/* Filtrage par phase */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-4">
          <Filter className="text-purple-500 w-6 h-6" />
          <span className="text-gray-600 font-medium">Filtrer par phase :</span>
          <select
            value={selectedPhaseId || ''}
            onChange={(e) => setSelectedPhaseId(e.target.value || null)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 min-w-[200px]"
          >
            <option value="">Toutes les phases</option>
            {projectContext.currentProject?.phases?.map((phase: ProjectPhase) => (
              <option key={phase.id} value={phase.id}>
                {phase.name} ({phase.tasks?.length || 0} tâche{(phase.tasks?.length || 0) !== 1 ? 's' : ''})
              </option>
            ))}
          </select>
          <div className="flex-1"></div>
          {selectedPhaseId && (
            <button 
              onClick={() => setSelectedPhaseId(null)}
              className="glass-card px-4 py-2 flex items-center gap-2 hover:scale-105 transition bg-red-50 border-red-200 text-red-700"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Réinitialiser</span>
            </button>
          )}
        </div>
      </GlassCard>

      {/* Planning unifié avec vues multiples */}
      <GlassCard className="!p-0 !m-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Planning</h3>
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
              {(['gantt', 'kanban', 'studies'] as const).map((view: ViewType) => (
                <button
                  key={view}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewType === view ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setViewType(view)}
                >
                  {view === 'gantt' ? 'Gantt' : view === 'kanban' ? 'Kanban' : 'Études'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/50 rounded-xl">
          {viewType === 'gantt' && (
            <RobustGanttChart 
              tasks={tasks}
              phases={phasesToShow}
              teamMembers={teamMembers}
              visibleStartDate={visibleStartDate}
              setVisibleStartDate={setVisibleStartDate}
              daysToShow={daysToShow}
            />
          )}
          {viewType === 'kanban' && (
            <div className="p-4">
              <DragDropPlanningBoard />
            </div>
          )}
          {viewType === 'studies' && (
            <div className="p-4">
              <StudyGanttChart />
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
    </PageContainer>
  );
};

export default Planning;
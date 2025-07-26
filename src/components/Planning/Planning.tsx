import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Filter, Plus, BarChart3, Clock, CheckCircle, AlertTriangle, Target, Settings, Users } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ProjectTask, ProjectPhase } from '../../contexts/projectTypes';
import { GlassCard, AnimatedCounter } from '../UI/VisualEffects';
import SimpleGanttChart from './SimpleGanttChart';
import PhaseModal from './PhaseModal';
import TeamService from '../../services/teamService';
import { TeamMember } from '../../types/team';

export const Planning: React.FC = () => {
  const projectContext = useProjectContext();
  type ViewType = 'gantt' | 'calendar' | 'list';
  
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [viewType, setViewType] = useState<ViewType>('gantt');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState<'create' | 'edit'>('create');
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [listFilter, setListFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [listSort, setListSort] = useState<'dueDate' | 'priority' | 'name' | 'status'>('dueDate');

  // Fonction pour charger les membres d'équipe
  const loadTeamMembers = useCallback(async () => {
    try {
      const members = await TeamService.getAllMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Erreur lors du chargement des membres d\'équipe:', error);
    }
  }, []);

  // Charger les membres d'équipe au montage du composant
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Fonctions utilitaires pour le calendrier
  const getCalendarDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Obtenir le premier lundi de la semaine contenant le 1er du mois
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    // Générer 42 jours (6 semaines)
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getTasksForDay = (date: Date, allTasks: ProjectTask[]): ProjectTask[] => {
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Fonction de filtrage et tri pour la vue liste
  const getFilteredAndSortedTasks = (): ProjectTask[] => {
    let filteredTasks = tasks;
    
    // Filtrage par statut
    if (listFilter !== 'all') {
      filteredTasks = tasks.filter(task => task.status === listFilter);
    }
    
    // Tri
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      switch (listSort) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return bPriority - aPriority;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status': {
          const statusOrder = { todo: 1, in_progress: 2, done: 3 };
          const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 0;
          const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 0;
          return aStatus - bStatus;
        }
        default:
          return 0;
      }
    });
    
    return sortedTasks;
  };

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

  };

  const handlePhaseDelete = () => {
    if (!projectContext || !projectContext.currentProject || !editingPhase) return;
    
    projectContext.deletePhase(projectContext.currentProject.id, editingPhase.id);
    setIsPhaseModalOpen(false);
    setPhaseModalMode('create');
    setEditingPhase(null);

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
                        <span className="font-bold">{phase.estimatedBudget.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</span>
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
                          })()} FCFA
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
                teamMembers={teamMembers}
              />
            </div>
          )}
          {viewType === 'calendar' && (
            <div className="space-y-4">
              {/* En-tête du calendrier */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                      setCurrentDate(prevMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button 
                    onClick={() => {
                      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                      setCurrentDate(nextMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {/* En-têtes des jours */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                    {day}
                  </div>
                ))}
                
                {/* Jours du calendrier */}
                {getCalendarDays(currentDate).map((day, index) => {
                  const dayTasks = getTasksForDay(day, tasks);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                        isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600' : ''}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                              task.status === 'done' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                            title={task.name}
                          >
                            {task.name}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayTasks.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span className="text-sm text-gray-600">À faire</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span className="text-sm text-gray-600">En cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-sm text-gray-600">Terminé</span>
                </div>
              </div>
            </div>
          )}
          {viewType === 'list' && (
            <div className="space-y-4">
              {/* Filtres et tri */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select 
                    value={listFilter}
                    onChange={(e) => setListFilter(e.target.value as 'all' | 'todo' | 'in_progress' | 'done')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes les tâches</option>
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminées</option>
                  </select>
                  <select 
                    value={listSort}
                    onChange={(e) => setListSort(e.target.value as 'dueDate' | 'priority' | 'name' | 'status')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dueDate">Trier par date</option>
                    <option value="priority">Trier par priorité</option>
                    <option value="name">Trier par nom</option>
                    <option value="status">Trier par statut</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {getFilteredAndSortedTasks().length} tâche(s)
                </div>
              </div>

              {/* Liste des tâches */}
              {getFilteredAndSortedTasks().length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune tâche ne correspond aux filtres sélectionnés</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAndSortedTasks().map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                    const daysUntilDue = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return (
                      <div 
                        key={task.id}
                        className={`bg-white/70 backdrop-blur-sm border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
                          isOverdue ? 'border-red-200 bg-red-50/50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{task.name}</h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                task.status === 'done' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status === 'done' ? 'Terminé' :
                                 task.status === 'in_progress' ? 'En cours' : 'À faire'}
                              </div>
                              {task.priority && (
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority === 'high' ? 'Haute' :
                                   task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                </div>
                              )}
                              {isOverdue && (
                                <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  En retard
                                </div>
                              )}
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              {task.assignedTo && (
                                <div className="flex items-center gap-1">
                                  <Users size={14} />
                                  <span>{task.assignedTo}</span>
                                </div>
                              )}
                              {task.dueDate && (
                                <div className={`flex items-center gap-1 ${
                                  isOverdue ? 'text-red-600' : daysUntilDue && daysUntilDue <= 3 ? 'text-orange-600' : ''
                                }`}>
                                  <Calendar size={14} />
                                  <span>
                                    {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                    {daysUntilDue !== null && (
                                      <span className="ml-1">
                                        ({daysUntilDue > 0 ? `dans ${daysUntilDue}j` : 
                                          daysUntilDue === 0 ? "aujourd'hui" : 
                                          `retard de ${Math.abs(daysUntilDue)}j`})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              {/* Estimation d'heures non disponible dans ProjectTask */}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                const newStatus = task.status === 'done' ? 'todo' : 
                                                task.status === 'todo' ? 'in_progress' : 'done';
                                handleTaskUpdate(task.id, { status: newStatus });
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                task.status === 'done' ? 'bg-green-100 text-green-600 hover:bg-green-200' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' :
                                'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title="Changer le statut"
                            >
                              {task.status === 'done' ? <CheckCircle size={16} /> :
                               task.status === 'in_progress' ? <Clock size={16} /> :
                               <Target size={16} />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Sous-tâches non disponibles dans ProjectTask */}
                      </div>
                    );
                  })}
                </div>
              )}
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

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { addSubTaskRecursive, removeSubTaskRecursive, reorderSubTasksRecursive } from '../utils/taskUtils';
import { ProjectService, Project as FirebaseProject } from '../services/projectService';
import type { Project, ProjectPhase, ProjectTask, ProjectContextType } from './projectTypes';
import type { FinancialRecord } from '../types';
import { sumTaskBudgets } from './projectUtils';
import { onSnapshot, collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';




// Expense déplacé dans projectTypes.ts

// interface ProjectContextType déplacée dans projectTypes.ts

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// --- AGGREGATION AUTOMATIQUE DES DEPENSES ---
function aggregatePhaseSpent(tasks: ProjectTask[]): number {
  return (tasks || []).reduce((sum, t) => sum + (t.spent || 0), 0);
}
function aggregateProjectSpent(phases: ProjectPhase[]): number {
  return (phases || []).reduce((sum, ph) => sum + aggregatePhaseSpent(ph.tasks || []), 0);
}

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Dépenses réelles (FinancialRecord) ---
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  // Charger les projets depuis Firebase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const firebaseProjects = await ProjectService.getAllProjects();
        
        // Convertir les projets Firebase vers le format du contexte
        const convertedProjects: Project[] = firebaseProjects.map(fbProject => ({
          id: fbProject.id,
          name: fbProject.name,
          location: fbProject.location,
          description: fbProject.description,
          startDate: fbProject.startDate,
          endDate: fbProject.endDate,
          status: fbProject.status === 'active' ? 'in_progress' : fbProject.status,
          budget: fbProject.budget,
          createdAt: fbProject.createdAt.toISOString(),
          updatedAt: fbProject.updatedAt.toISOString(),
          spent: fbProject.actualCost,
          phases: fbProject.phases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task => ({
              ...task,
              assignedTo: task.assignedTo || [],
              status: task.status as any, // Type conversion
              priority: task.priority || 'medium',
              updatedAt: task.updatedAt?.toISOString()
            }))
          })),
          progress: fbProject.progress,
          priority: 'medium', // Valeur par défaut
          manager: 'Non assigné', // Firebase n'a pas de manager
          client: fbProject.client,
          team: fbProject.team
        }));
        
        setProjects(convertedProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();

    // Écouter les changements en temps réel
    const unsubscribe = ProjectService.subscribeToProjects((firebaseProjects) => {
      const convertedProjects: Project[] = firebaseProjects.map(fbProject => ({
        id: fbProject.id,
        name: fbProject.name,
        location: fbProject.location,
        description: fbProject.description,
        startDate: fbProject.startDate,
        endDate: fbProject.endDate,
        status: fbProject.status === 'active' ? 'in_progress' : fbProject.status,
        budget: fbProject.budget,
        createdAt: fbProject.createdAt.toISOString(),
        updatedAt: fbProject.updatedAt.toISOString(),
        spent: fbProject.actualCost,
        phases: fbProject.phases.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task => ({
            ...task,
            assignedTo: task.assignedTo || [],
            status: task.status as any, // Type conversion
            priority: task.priority || 'medium',
            updatedAt: task.updatedAt?.toISOString()
          }))
        })),
        progress: fbProject.progress,
        priority: 'medium',
        manager: 'Non assigné', // Firebase n'a pas de manager
        client: fbProject.client,
        team: fbProject.team
      }));
      
      setProjects(convertedProjects);
    });

    return () => unsubscribe();
  }, []);

  // Gestion des dépenses via ProjectService
  const addExpense = async (expense: Omit<FinancialRecord, 'id'>) => {
    if (currentProjectId) {
      await ProjectService.addFinancialRecord(currentProjectId, expense);
    }
  };

  const editExpense = async (id: string, updates: Partial<FinancialRecord>) => {
    // Pour l'instant, on garde la logique existante
    // TODO: Implémenter la mise à jour des enregistrements financiers dans ProjectService
    console.warn('editExpense: Migration vers ProjectService en cours');
  };

  const deleteExpense = async (id: string) => {
    // Pour l'instant, on garde la logique existante
    // TODO: Implémenter la suppression des enregistrements financiers dans ProjectService
    console.warn('deleteExpense: Migration vers ProjectService en cours');
  };

  // Plus de persistance locale - tout est géré par Firebase

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => {
        const data = doc.data() as Partial<Project>;
        return {
          id: doc.id,
          name: typeof data.name === 'string' ? data.name : 'Nouveau Projet',
          location: typeof data.location === 'string' ? data.location : '',
          description: typeof data.description === 'string' ? data.description : '',
          startDate: typeof data.startDate === 'string' ? data.startDate : new Date().toISOString().split('T')[0],
          endDate: typeof data.endDate === 'string' ? data.endDate : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: typeof data.status === 'string' && ['planning','in_progress','on_hold','completed','cancelled'].includes(data.status) ? data.status as Project['status'] : 'planning',
          budget: typeof data.budget === 'number' ? data.budget : 0,
          createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
          updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
          spent: typeof data.spent === 'number' ? data.spent : 0,
          phases: Array.isArray(data.phases) ? data.phases : [],
          progress: typeof data.progress === 'number' ? data.progress : 0,
          priority: typeof data.priority === 'string' ? data.priority : 'medium',
          team: Array.isArray(data.team) ? data.team : [],
          manager: typeof data.manager === 'string' ? data.manager : '',
          client: typeof data.client === 'string' ? data.client : '',
          equipment: Array.isArray(data.equipment) ? data.equipment : [],
        };
      });
      // Agrégation automatique des dépenses :
      const withSpent = fetchedProjects.map(project => {
        const phases = (project.phases || []).map(phase => {
          const spent = aggregatePhaseSpent(phase.tasks || []);
          return { ...phase, spent };
        });
        const spent = aggregateProjectSpent(phases);
        return { ...project, phases, spent };
      });
      setProjects(withSpent);
      setLoadingProjects(false);
      // Plus de sauvegarde localStorage - Firebase gère tout
    });
    return () => unsubscribe();
  }, []);

  const addProject = async (project: Omit<Project, 'id' | 'phases'> | Omit<Project, 'id'> | Project) => {
    try {
      console.log('💾 [ProjectContext] addProject appelé avec:', project);
      
      // Si le projet a déjà un ID (temporaire), on l'ajoute d'abord localement
      if ('id' in project && project.id) {
        console.log('🔄 [ProjectContext] Projet avec ID temporaire, ajout local d\'abord');
        
        // Ajouter temporairement au state local pour une réactivité immédiate
        const tempProject = {
          ...project,
          phases: project.phases || [],
          spent: project.spent || 0
        };
        
        console.log('📝 [ProjectContext] Ajout temporaire au state:', tempProject);
        setProjects(prev => {
          console.log('📊 [ProjectContext] Projets avant ajout:', prev.length);
          const newProjects = [...prev, tempProject];
          console.log('📊 [ProjectContext] Projets après ajout:', newProjects.length);
          return newProjects;
        });
        
        // Puis sauvegarder dans Firebase (Firebase générera un nouvel ID)
        console.log('🔥 [ProjectContext] Sauvegarde dans Firebase...');
        const docRef = await addDoc(collection(db, 'projects'), {
          ...project,
          phases: project.phases || [],
          spent: project.spent || 0
        });
        
        console.log('✅ [ProjectContext] Sauvegarde Firebase réussie, nouvel ID:', docRef.id);
        
        // Mettre à jour l'ID temporaire avec l'ID Firebase
        setProjects(prev => prev.map(p => 
          p.id === project.id ? { ...p, id: docRef.id } : p
        ));
        
        // Mettre à jour l'ID du projet actuel si c'est celui-ci
        if (currentProjectId === project.id) {
          console.log('🎯 [ProjectContext] Mise à jour currentProjectId:', project.id, '->', docRef.id);
          setCurrentProjectId(docRef.id);
        }
      } else {
        console.log('🔥 [ProjectContext] Projet sans ID, sauvegarde directe dans Firebase');
        // Projet sans ID, comportement normal
        await addDoc(collection(db, 'projects'), {
          ...project,
          phases: [],
          spent: 0
        });
      }
    } catch (error) {
      console.error('❌ [ProjectContext] Erreur lors de l\'ajout du projet:', error);
      // En cas d'erreur, retirer le projet temporaire
      if ('id' in project && project.id) {
        setProjects(prev => prev.filter(p => p.id !== project.id));
      }
    }
  };

  // Génère une entrée d'historique
  const createHistoryEntry = (action: string, user?: string, details?: string) => ({
    date: new Date().toISOString(),
    action,
    user,
    details,
  });

  const updateProject = async (id: string, updates: Partial<Project>, historyAction?: string, user?: string, details?: string) => {
    try {
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;
      const projectData = projectSnap.data() as Project;
      const currentHistory = Array.isArray(projectData.history) ? projectData.history : [];
      let newHistory = currentHistory;
      if (historyAction) {
        newHistory = [
          createHistoryEntry(historyAction, user, details),
          ...currentHistory
        ].slice(0, 100); // Limite à 100 entrées
      }
      // Nettoyage de l'historique pour Firestore
      newHistory = cleanHistory(newHistory);
      await updateDoc(projectRef, { ...updates, history: newHistory });
      // Correction : mettre à jour le projet correspondant dans le state local immédiatement
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, history: newHistory } : p));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  // Fonction utilitaire pour nettoyer l'historique
  const cleanHistory = (historyArr: any[]) =>
    historyArr.map(entry => ({
      date: entry.date || new Date().toISOString(),
      action: entry.action || '',
      user: entry.user || 'Développeur',
      details: entry.details || ''
    }));

  const deleteProject = async (id: string, user?: string): Promise<void> => {
    try {
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data() as Project;
        const currentHistory = Array.isArray(projectData.history) ? projectData.history : [];
        const newHistory = cleanHistory([
          {
            date: new Date().toISOString(),
            action: 'Projet supprimé',
            user: user || 'Développeur',
            details: ''
          },
          ...currentHistory
        ].slice(0, 100));
        await updateDoc(projectRef, { history: newHistory });
      }
      await deleteDoc(projectRef);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  };

  const archiveProject = async (id: string, user?: string): Promise<void> => {
    try {
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;
      const projectData = projectSnap.data() as Project;
      const currentHistory = Array.isArray(projectData.history) ? projectData.history : [];
      const newHistory = cleanHistory([
        {
          date: new Date().toISOString(),
          action: 'Projet archivé',
          user: user || 'Développeur',
          details: ''
        },
        ...currentHistory
      ].slice(0, 100));
      await updateDoc(projectRef, {
        status: 'archived',
        archivedAt: new Date().toISOString(),
        history: newHistory
      });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur lors de l\'archivage du projet:', error);
      throw error;
    }
  };




  const addPhase = async (projectId: string, phase: Omit<ProjectPhase, 'id' | 'tasks'>) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const newPhase: ProjectPhase = {
      ...phase,
      id: `phase-${Date.now()}`,
      tasks: []
    };
    await updateDoc(projectRef, {
      phases: [...(projectData.phases || []), newPhase]
    });
  };

  const updatePhase = async (projectId: string, phaseId: string, updates: Partial<ProjectPhase>) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase =>
      phase.id === phaseId ? { ...phase, ...updates } : phase
    );
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const deletePhase = async (projectId: string, phaseId: string) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).filter(phase => phase.id !== phaseId);
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const addTask = async (
    projectId: string,
    phaseId: string,
    task: Omit<ProjectTask, 'id'>,
    parentTaskId?: string
  ) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        if (!parentTaskId) {
          // Ajout tâche principale
          return {
            ...phase,
            tasks: [
              ...phase.tasks,
              {
                id: `task-${Date.now()}`,
                ...task
              }
            ]
          };
        } else {
          // Ajout sous-tâche (arborescence)
          return {
            ...phase,
            tasks: addSubTaskRecursive(phase.tasks, parentTaskId, {
              ...task,
              id: `task-${Date.now()}`
            })
          };
        }
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const updateTask = async (
    projectId: string,
    phaseId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        // Utilitaire récursif à implémenter pour updateTaskRecursive
        const updateTaskRecursive = (tasks: ProjectTask[]): ProjectTask[] =>
          tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, ...updates };
            }
            if (task.subtasks) {
              // On ne modifie pas les sous-tâches ici
              return { ...task, subtasks: task.subtasks };
            }
            return task;
          });
        return {
          ...phase,
          tasks: updateTaskRecursive(phase.tasks)
        };
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const removeTask = async (projectId: string, phaseId: string, taskId: string) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: (phase.tasks || []).filter(t => t.id !== taskId)
        };
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const reorderTasks = async (projectId: string, phaseId: string, taskId: string, newIndex: number) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        const tasks = phase.tasks || [];
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx !== -1) {
          const reordered = [...tasks];
          const [removed] = reordered.splice(idx, 1);
          reordered.splice(newIndex, 0, removed);
          return { ...phase, tasks: reordered };
        }
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const addSubTask = async (projectId: string, phaseId: string, parentTaskId: string, subTask: Omit<ProjectTask, 'id'>) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: addSubTaskRecursive(phase.tasks || [], parentTaskId, {
            ...subTask,
            id: `subtask-${Date.now()}`
          })
        };
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const removeSubTask = async (projectId: string, phaseId: string, subTaskId: string) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: removeSubTaskRecursive(phase.tasks || [], subTaskId)
        };
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const reorderSubTasks = async (projectId: string, phaseId: string, parentTaskId: string, subTaskId: string, newIndex: number) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: reorderSubTasksRecursive(phase.tasks || [], parentTaskId, subTaskId, newIndex)
        };
      }
      return phase;
    });
    await updateDoc(projectRef, { phases: updatedPhases });
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || null;
  const currentProjectBudget = currentProject
    ? (currentProject.phases || []).reduce((sum, phase) => sum + sumTaskBudgets(phase.tasks || []), 0)
    : 0;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject: setCurrentProjectId,
        addProject,
        updateProject,
        deleteProject,
        archiveProject,
        addPhase,
        updatePhase,
        deletePhase,
        addTask,
        updateTask,
        removeTask,
        reorderTasks,
        addSubTask,
        removeSubTask,
        reorderSubTasks,
        currentProjectBudget,
        loadingProjects,
        // --- Dépenses réelles ---
        expenses,
        addExpense,
        editExpense,
        deleteExpense
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte du projet
export const useProjectContext = () => {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
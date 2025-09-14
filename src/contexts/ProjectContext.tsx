/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { addSubTaskRecursive, removeSubTaskRecursive, reorderSubTasksRecursive } from '../utils/taskUtils';
import { aggregateProjectSpent, cleanHistory } from './projectContextUtils';
import { ProjectService } from '../services/projectService';
import type { Project, ProjectPhase, ProjectTask, ProjectContextType } from './projectTypes';
import type { FinancialRecord } from '../types';
import { sumTaskBudgets } from './projectUtils';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Type simplifié pour les données Firebase brutes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FirebaseProjectData = Record<string, any> & {
  id: string;
  name: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses] = useState<FinancialRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  // Charger les projets depuis Firebase
  useEffect(() => {
    const loadProjects = async (): Promise<void> => {
      try {
        console.log('🔄 ProjectContext - Début du chargement des projets...');
        setLoadingProjects(true);
        const firebaseProjects = await ProjectService.getAllProjects();
        
        console.log('📊 ProjectContext - Projets récupérés depuis Firebase:', firebaseProjects.length);
        console.log('📊 ProjectContext - Données brutes:', firebaseProjects);
        
        // Convertir les projets Firebase vers le format du contexte
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const convertedProjects: Project[] = firebaseProjects.map((fbProject: any) => ({
          id: fbProject.id,
          name: fbProject.name,
          location: fbProject.location,
          description: fbProject.description,
          startDate: fbProject.startDate,
          endDate: fbProject.endDate,
          status: (fbProject.status === 'active' ? 'in_progress' : fbProject.status) as Project['status'],
          budget: fbProject.budget,
          spent: fbProject.spent || aggregateProjectSpent((fbProject.phases as ProjectPhase[]) || []),
          phases: (fbProject.phases as ProjectPhase[]) || [],
          manager: fbProject.manager || 'Non assigné',
          client: fbProject.client,
          progress: fbProject.progress,
          priority: fbProject.priority || 'medium',
          team: fbProject.team || [],
          createdAt: fbProject.createdAt instanceof Date ? fbProject.createdAt.toISOString() : (fbProject.createdAt || new Date().toISOString()),
          updatedAt: fbProject.updatedAt instanceof Date ? fbProject.updatedAt.toISOString() : (fbProject.updatedAt || new Date().toISOString()),
          history: cleanHistory((fbProject.history as Array<{date?: string, action?: string, user?: string, details?: string}>) || [])
        }));
        
        console.log('✅ ProjectContext - Projets convertis:', convertedProjects.length);
        console.log('✅ ProjectContext - Projets convertis détail:', convertedProjects);
        
        setProjects(convertedProjects);
        console.log('🎯 ProjectContext - Projets définis dans l\'état');
      } catch (error) {
        console.error('❌ ProjectContext - Erreur lors du chargement des projets:', error);
        console.error('❌ ProjectContext - Stack trace:', error);
      } finally {
        setLoadingProjects(false);
        console.log('🏁 ProjectContext - Chargement terminé');
      }
    };

    loadProjects();

    // Écouter les changements en temps réel
    const unsubscribe = ProjectService.subscribeToProjects((firebaseProjects: FirebaseProjectData[]) => {
      const convertedProjects: Project[] = firebaseProjects.map((fbProject: FirebaseProjectData) => ({
        id: fbProject.id,
        name: fbProject.name,
        location: fbProject.location,
        description: fbProject.description,
        startDate: fbProject.startDate,
        endDate: fbProject.endDate,
        status: (fbProject.status === 'active' ? 'in_progress' : fbProject.status) as Project['status'],
        budget: fbProject.budget,
        spent: fbProject.spent || aggregateProjectSpent((fbProject.phases as ProjectPhase[]) || []),
        phases: (fbProject.phases as ProjectPhase[]) || [],
        manager: fbProject.manager || 'Non assigné',
        client: fbProject.client,
        progress: fbProject.progress,
        priority: fbProject.priority || 'medium',
        team: fbProject.team || [],
        createdAt: fbProject.createdAt instanceof Date ? fbProject.createdAt.toISOString() : (fbProject.createdAt || new Date().toISOString()),
        updatedAt: fbProject.updatedAt instanceof Date ? fbProject.updatedAt.toISOString() : (fbProject.updatedAt || new Date().toISOString()),
        history: cleanHistory((fbProject.history as Array<{date?: string, action?: string, user?: string, details?: string}>) || [])
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
    try {
      if (!currentProjectId) {
        throw new Error('Aucun projet sélectionné');
      }
      
      await ProjectService.updateFinancialRecord(currentProjectId, id, updates);
      
      // Mettre à jour l'état local
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === currentProjectId) {
            return {
              ...project,
              financialRecords: (project.financialRecords || []).map((record: FinancialRecord) => 
                record.id === id ? { ...record, ...updates } : record
              )
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      if (!currentProjectId) {
        throw new Error('Aucun projet sélectionné');
      }
      
      await ProjectService.deleteFinancialRecord(currentProjectId, id);
      
      // Mettre à jour l'état local
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === currentProjectId) {
            return {
              ...project,
              financialRecords: (project.financialRecords || []).filter((record: FinancialRecord) => record.id !== id)
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      throw error;
    }
  };

  // Plus de persistance locale - tout est géré par Firebase
  // (Removed duplicate direct onSnapshot listener to 'projects' to avoid overlapping subscriptions)

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
  // Fonction utilitaire pour nettoyer l'historique
// Utils déplacés dans projectContextUtils.ts

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _parentTaskId?: string
  ) => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data() as Project;
    
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      name: typeof task.name === 'string' && task.name.trim() ? task.name : 'Tâche sans nom',
      description: typeof task.description === 'string' ? task.description : '',
      status: task.status as ProjectTask['status'] || 'todo',
      priority: task.priority as ProjectTask['priority'] || 'medium',
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
      startDate: task.startDate ? (typeof task.startDate === 'string' ? task.startDate : new Date(task.startDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      endDate: task.endDate ? (typeof task.endDate === 'string' ? task.endDate : new Date(task.endDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      budget: typeof task.budget === 'number' && !isNaN(task.budget) ? task.budget : 0,
      spent: typeof task.spent === 'number' && !isNaN(task.spent) ? task.spent : 0,
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      costItems: Array.isArray(task.costItems) ? task.costItems : [],
      precision: typeof task.precision === 'number' ? task.precision : 3,
      subTasks: Array.isArray(task.subTasks) ? task.subTasks.map(subTask => ({
        ...subTask,
        id: subTask.id || `subtask-${Date.now()}-${Math.random()}`,
        name: typeof subTask.name === 'string' && subTask.name.trim() ? subTask.name : 'Sous-tâche sans nom',
        description: typeof subTask.description === 'string' ? subTask.description : '',
        status: subTask.status as ProjectTask['status'] || 'todo',
        priority: subTask.priority as ProjectTask['priority'] || 'medium',
        assignedTo: Array.isArray(subTask.assignedTo) ? subTask.assignedTo : [],
        startDate: subTask.startDate ? (typeof subTask.startDate === 'string' ? subTask.startDate : new Date(subTask.startDate || new Date()).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        endDate: subTask.endDate ? (typeof subTask.endDate === 'string' ? subTask.endDate : new Date(subTask.endDate || new Date()).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        budget: typeof subTask.budget === 'number' && !isNaN(subTask.budget) ? subTask.budget : 0,
        spent: typeof subTask.spent === 'number' && !isNaN(subTask.spent) ? subTask.spent : 0,
        dependencies: Array.isArray(subTask.dependencies) ? subTask.dependencies : [],
        costItems: Array.isArray(subTask.costItems) ? subTask.costItems : [],
        precision: typeof subTask.precision === 'number' ? subTask.precision : 3,
        subTasks: [],
        updatedAt: new Date().toISOString()
      })) : [],
      updatedAt: new Date().toISOString()
    };

    const updatedPhases = (projectData.phases || []).map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: [...(phase.tasks || []), newTask]
        };
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
        const updateTaskRecursive = (tasks: ProjectTask[]): ProjectTask[] =>
          tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                ...updates,
                name: typeof (updates.name ?? task.name) === 'string' && (updates.name ?? task.name).trim() ? (updates.name ?? task.name) : 'Tâche sans nom',
                description: typeof (updates.description ?? task.description) === 'string' ? (updates.description ?? task.description) : '',
                status: (updates.status ?? task.status) as ProjectTask['status'] || 'todo',
                priority: (updates.priority ?? task.priority) as ProjectTask['priority'] || 'medium',
                assignedTo: Array.isArray(updates.assignedTo ?? task.assignedTo) ? (updates.assignedTo ?? task.assignedTo) : [],
                startDate: updates.startDate ? (typeof updates.startDate === 'string' ? updates.startDate : new Date(updates.startDate).toISOString().split('T')[0]) : (typeof task.startDate === 'string' ? task.startDate : task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                endDate: updates.endDate ? (typeof updates.endDate === 'string' ? updates.endDate : new Date(updates.endDate).toISOString().split('T')[0]) : (typeof task.endDate === 'string' ? task.endDate : task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                budget: (() => {
                  const budgetValue = updates.budget ?? task.budget;
                  return typeof budgetValue === 'number' && !isNaN(budgetValue) ? budgetValue : 0;
                })(),
                spent: (() => {
                  const spentValue = updates.spent ?? task.spent;
                  return typeof spentValue === 'number' && !isNaN(spentValue) ? spentValue : 0;
                })(),
                dependencies: Array.isArray(updates.dependencies ?? task.dependencies) ? (updates.dependencies ?? task.dependencies) : [],
                costItems: Array.isArray(updates.costItems ?? task.costItems) ? (updates.costItems ?? task.costItems) : [],
                precision: typeof (updates.precision ?? task.precision) === 'number' ? (updates.precision ?? task.precision) : 3,
                subTasks: Array.isArray(updates.subTasks ?? task.subTasks) ? (updates.subTasks ?? task.subTasks) : [],
                updatedAt: new Date().toISOString()
              };
            }
            if (task.subTasks) {
              return { ...task, subTasks: updateTaskRecursive(task.subTasks) };
            }
            return task;
          });
        return {
          ...phase,
          tasks: updateTaskRecursive(phase.tasks || [])
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

  // Debug logs pour vérifier les changements de projet
  console.log('🎯 ProjectContext - currentProjectId:', currentProjectId);
  console.log('🎯 ProjectContext - currentProject:', currentProject?.name || 'Aucun');
  console.log('🎯 ProjectContext - Nombre de projets:', projects.length);

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
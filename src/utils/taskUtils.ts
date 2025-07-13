import { ProjectTask } from '../contexts/projectTypes';

/**
 * Utilitaires pour la gestion des tâches et sous-tâches
 */

/**
 * Trouve une tâche par son ID dans une arborescence de tâches
 */
export const findTaskById = (tasks: ProjectTask[], taskId: string): ProjectTask | undefined => {
  for (const task of tasks) {
    if (task.id === taskId) {
      return task;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      const subTask = findTaskById(task.subtasks, taskId);
      if (subTask) {
        return subTask;
      }
    }
  }
  return undefined;
};

/**
 * Met à jour une tâche dans une arborescence de tâches
 */
export const updateTaskInArray = (tasks: ProjectTask[], updatedTask: ProjectTask): ProjectTask[] => {
  return tasks.map(task => {
    if (task.id === updatedTask.id) {
      return updatedTask;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: updateTaskInArray(task.subtasks, updatedTask)
      };
    }
    return task;
  });
};

/**
 * Supprime une tâche d'une arborescence de tâches
 */
export const removeTaskFromArray = (tasks: ProjectTask[], taskId: string): ProjectTask[] => {
  return tasks.filter(task => {
    if (task.id === taskId) {
      return false;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks = removeTaskFromArray(task.subtasks, taskId);
    }
    return true;
  });
};

/**
 * Ajoute une sous-tâche à une tâche parente dans une arborescence de tâches
 */
export const addSubTaskToParent = (tasks: ProjectTask[], parentId: string, newSubTask: ProjectTask): ProjectTask[] => {
  return tasks.map(task => {
    if (task.id === parentId) {
      return {
        ...task,
        subtasks: [...(task.subtasks || []), newSubTask]
      };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: addSubTaskToParent(task.subtasks, parentId, newSubTask)
      };
    }
    return task;
  });
};

/**
 * Fonction récursive pour ajouter une sous-tâche à une tâche par id
 */
export const addSubTaskRecursive = (tasks: ProjectTask[], parentTaskId: string, subTask: ProjectTask): ProjectTask[] => {
  return tasks.map(task => {
    if (task.id === parentTaskId) {
      return {
        ...task,
        subtasks: [...(task.subtasks || []), subTask]
      };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: addSubTaskRecursive(task.subtasks, parentTaskId, subTask)
      };
    }
    return task;
  });
};

/**
 * Fonction récursive pour supprimer une sous-tâche par id
 */
export const removeSubTaskRecursive = (tasks: ProjectTask[], subTaskId: string): ProjectTask[] => {
  return tasks.map(task => {
    if (task.subtasks) {
      return {
        ...task,
        subtasks: task.subtasks.filter((st: ProjectTask) => st.id !== subTaskId)
          .map((st: ProjectTask) => ({ ...st, subtasks: st.subtasks ? removeSubTaskRecursive(st.subtasks, subTaskId) : [] }))
      };
    }
    return task;
  });
};

/**
 * Fonction récursive pour réordonner les sous-tâches d'une tâche parente
 */
export const reorderSubTasksRecursive = (tasks: ProjectTask[], parentTaskId: string, subTaskId: string, newIndex: number): ProjectTask[] => {
  return tasks.map(task => {
    if (task.id === parentTaskId && task.subtasks) {
      const idx = task.subtasks.findIndex(st => st.id === subTaskId);
      if (idx !== -1) {
        const reordered = [...task.subtasks];
        const [removed] = reordered.splice(idx, 1);
        reordered.splice(newIndex, 0, removed);
        return { ...task, subtasks: reordered };
      }
    } else if (task.subtasks) {
      return { ...task, subtasks: reorderSubTasksRecursive(task.subtasks, parentTaskId, subTaskId, newIndex) };
    }
    return task;
  });
};

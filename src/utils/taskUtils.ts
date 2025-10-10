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
    if (task.subTasks && task.subTasks.length > 0) {
      const subTask = findTaskById(task.subTasks, taskId);
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
    if (task.subTasks && task.subTasks.length > 0) {
      return {
        ...task,
        subTasks: updateTaskInArray(task.subTasks, updatedTask)
      };
    }
    return task;
  });
};

/**
 * Supprime une tâche d'une arborescence de tâches
 */
export const removeTaskFromArray = (tasks: ProjectTask[], taskId: string): ProjectTask[] => {
  return tasks
    .filter(task => task.id !== taskId)
    .map(task => {
      if (task.subTasks && task.subTasks.length > 0) {
        return { ...task, subTasks: removeTaskFromArray(task.subTasks, taskId) };
      }
      return task;
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
        subTasks: [...(task.subTasks || []), newSubTask]
      };
    }
    if (task.subTasks && task.subTasks.length > 0) {
      return {
        ...task,
        subTasks: addSubTaskToParent(task.subTasks, parentId, newSubTask)
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
        subTasks: [...(task.subTasks || []), subTask]
      };
    }
    if (task.subTasks && task.subTasks.length > 0) {
      return {
        ...task,
        subTasks: addSubTaskRecursive(task.subTasks, parentTaskId, subTask)
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
    if (task.subTasks) {
      return {
        ...task,
        subTasks: task.subTasks
          .filter((st: ProjectTask) => st.id !== subTaskId)
          .map((st: ProjectTask) => ({
            ...st,
            subTasks: st.subTasks ? removeSubTaskRecursive(st.subTasks, subTaskId) : []
          }))
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
    if (task.id === parentTaskId && task.subTasks) {
      const idx = task.subTasks.findIndex(st => st.id === subTaskId);
      if (idx !== -1) {
        const reordered = [...task.subTasks];
        const [removed] = reordered.splice(idx, 1);
        reordered.splice(newIndex, 0, removed);
        return { ...task, subTasks: reordered };
      }
    } else if (task.subTasks) {
      return { ...task, subTasks: reorderSubTasksRecursive(task.subTasks, parentTaskId, subTaskId, newIndex) };
    }
    return task;
  });
};

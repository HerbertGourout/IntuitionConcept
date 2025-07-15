import { useProjectContext } from '../contexts/ProjectContext';

/**
 * Hook personnalisé pour accéder au contexte des projets
 */
export const useProjects = () => {
  return useProjectContext();
};

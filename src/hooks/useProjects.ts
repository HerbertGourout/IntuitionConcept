import { useContext } from 'react';
import ProjectContext from '../contexts/ProjectContext';

/**
 * Hook personnalisé pour accéder au contexte des projets
 */
export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

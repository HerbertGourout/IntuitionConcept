import React from 'react';
import type { Project } from '../../contexts/projectTypes';

interface ProjectAccessGuardProps {
  project: Project;
  children: React.ReactNode;
}

const ProjectAccessGuard: React.FC<ProjectAccessGuardProps> = ({ project, children }) => {
  // DÉVELOPPEMENT: Pas de contrôle d'accès - tous les utilisateurs ont accès
  return <>{children}</>;
};

export default ProjectAccessGuard;

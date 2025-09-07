import React from 'react';
import { ModuleProtection } from '../Auth/ModuleProtection';
import Layout from './Layout';

interface SecureLayoutProps {
  activeSection: string;
  onNavigate: (section: string, id?: string) => void;
  onCreateProject: () => void;
  currentProjectId: string | null;
  projects: any[];
  onProjectSelect: (id: string | null) => void;
  children: React.ReactNode;
}

const SecureLayout: React.FC<SecureLayoutProps> = ({
  activeSection,
  onNavigate,
  onCreateProject,
  currentProjectId,
  projects,
  onProjectSelect,
  children
}) => {
  return (
    <Layout
      activeSection={activeSection}
      onNavigate={onNavigate}
      onCreateProject={onCreateProject}
      currentProjectId={currentProjectId}
      projects={projects}
      onProjectSelect={onProjectSelect}
    >
      <ModuleProtection module={activeSection}>
        {children}
      </ModuleProtection>
    </Layout>
  );
};

export default SecureLayout;

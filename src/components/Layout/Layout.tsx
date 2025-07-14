import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import type { Project } from '../../contexts/projectTypes';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string, id?: string) => void;
  onCreateProject: () => void;
  currentProjectId: string | null;
  projects: Project[];
  onProjectSelect: (id: string | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection, 
  onNavigate, 
  onCreateProject,
  currentProjectId,
  projects,
  onProjectSelect
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onNavigate={onNavigate}
        onCreateProject={onCreateProject}
        currentProjectId={currentProjectId}
        projects={projects}
        onProjectSelect={onProjectSelect}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header 
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

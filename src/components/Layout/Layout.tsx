import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ModernHeader from './ModernHeader';
import ModernFooterCompact from './ModernFooterCompact';
import AppSubheader from './AppSubheader';
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
  const sectionTitles: Record<string, string> = {
    'dashboard': 'Tableau de Bord',
    'projects': 'Projets',
    'project-budget': 'Budget Projet',
    'equipment': 'Équipements',
    'tasks': 'Tâches',
    'planning': 'Planning',
    'drag-drop-planning': 'Planning Interactif',
    'competitive-analysis': 'Analyse Concurrentielle',
    'finances': 'Finances',
    'documents': 'Documents',
    'quotes': 'Devis',
    'quote-creator': 'Création de Devis',
    'reports': 'Rapports',
    'team': 'Équipe',
    'purchase-orders': 'Bons d\'Achat',
    'payments': 'Paiements',
    'locations': 'Localisation',
    'notifications': 'Notifications',
    'settings': 'Paramètres',
    'automation-dashboard': 'Automatisations',
    'workflow-manager': 'Gestion Workflows',
    'automation-templates': 'Templates Automatisation'
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
      {/* Header en haut, pleine largeur (fond solide en in-app pour lisibilité) */}
      <ModernHeader 
        forceSolid 
        onNavigate={(section) => onNavigate(section)} 
        currentSection={activeSection}
      />

      {/* Overlay mobile pour fermer la sidebar */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Rangée principale: Sidebar + Contenu (décalée sous le header fixe de 80px) */}
      <div className="flex flex-1 pt-20">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={(collapsed) => {
            setSidebarCollapsed(collapsed);
            if (window.innerWidth < 1024 && !collapsed) {
              setSidebarCollapsed(true);
            }
          }}
          activeSection={activeSection}
          onNavigate={onNavigate}
          currentProjectId={currentProjectId}
          projects={projects}
          onProjectSelect={onProjectSelect}
        />

        <div className="flex-1 flex flex-col transition-all duration-300">
          {/* Sous-entête sticky contextuel */}
          <AppSubheader
            title={sectionTitles[activeSection] || 'Section'}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Footer compact en bas, pleine largeur */}
      <ModernFooterCompact />
    </div>
  );
};

export default Layout;

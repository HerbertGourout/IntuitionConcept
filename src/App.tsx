import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectProvider } from './contexts/ProjectContext';
import type { Project } from './contexts/projectTypes';
import { useProjects } from './hooks/useProjects';

import Sidebar from './components/Layout/Sidebar';
import HeaderUpdated from './components/Layout/HeaderUpdated';
import Dashboard from './components/Dashboard/Dashboard';
import Projects from './components/Projects/Projects';
import Equipment from './components/Equipment/Equipment';
import Tasks from './components/Tasks/Tasks';
import Finances from './components/Finances/Finances';
import Planning from './components/Planning/Planning';
import Documents from './components/Documents/Documents';
import Reports from './components/Reports/Reports';
import Team from './components/Team/Team';
import Locations from './components/Locations/Locations';
import Settings from './components/Settings/Settings';
import CreateProjectModal from './components/Projects/CreateProjectModal';
import { ToastContainer } from './components/UI/Toast';
import type { ToastProps } from './components/UI/Toast';
import { useToast } from './hooks/useToast';
import ProjectBudget from './pages/ProjectBudget';
import { Button, Result } from 'antd';

// Appliquer les styles globaux
import './index.css';



// Composant pour gérer l'animation des pages
// Composant pour gérer l'animation des pages
const AnimatedPage: React.FC<{ children: React.ReactNode; pageKey?: string }> = ({ children, pageKey }) => {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

const AppContent: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const { toasts, success, removeToast } = useToast() as { 
    toasts: ToastProps[]; 
    success: (title: string, message?: string) => string; 
    removeToast: (id: string) => void;
  };
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    addProject 
  } = useProjects();



  const handleNavigate = (section: string, id?: string) => {
    setActiveSection(section);
    if (id) {
      console.log(`Navigate to ${section} with ID: ${id}`);
      // Mettre à jour le projet sélectionné si nécessaire
      const project = projects.find(p => p.id === id);
      if (project) {
        setCurrentProject(id);
      }
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'phases' | 'spent'>) => {
    console.log('🚀 Création du projet:', projectData);
    
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(), // Génération d'un ID temporaire
      phases: [],
      spent: 0,
      // DÉVELOPPEMENT: Valeurs par défaut simples
      manager: projectData.manager || 'Développeur',
      team: projectData.team || []
    };
    
    console.log('📝 Nouveau projet avec manager/team:', newProject);
    
    await addProject(newProject);
    console.log('✅ Projet ajouté, sélection en cours...');
    
    // Sélectionner automatiquement le nouveau projet créé
    setCurrentProject(newProject.id);
    console.log('🎯 Projet sélectionné:', newProject.id);
    
    success('Projet créé', 'Le nouveau projet a été créé avec succès');
    setIsCreateProjectOpen(false);
  };

  // Si aucun projet n'est sélectionné mais qu'il y a des projets disponibles, sélectionner le premier
  React.useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0].id);
    }
    // Si les projets sont chargés (même si vide), on arrête le loading
    setLoading(false);
  }, [projects, currentProject, setCurrentProject]);
  

  const renderContent = () => {
    // Si aucun projet n'est sélectionné, afficher un message d'erreur
    if (!currentProject) {
      return (
        <div className="app">
          <div className="no-project-selected">
            <Result
              status="warning"
              title="Aucun projet sélectionné"
              subTitle="Veuillez sélectionner un projet dans le menu de navigation."
            />
          </div>
        </div>
      );
    }

    // Afficher le contenu en fonction de la section active
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'equipment':
        return <Equipment />;
      case 'tasks':
        return <Tasks />;
      case 'finances':
        return <Finances />;
      case 'planning':
        return <Planning />;
      case 'documents':
        return <Documents />;
      case 'project-budget':
        return <ProjectBudget />;
      case 'reports':
        return <Reports />;
      case 'team':
        return <Team />;
      case 'locations':
        return <Locations />;
      case 'settings':
        return <Settings />;
      default:
        return <div>Section non trouvée</div>;
    }
  };

  // Afficher un écran de chargement tant que les projets ne sont pas chargés
  if (loading) {
    return (
      <div className="app flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <div className="text-gray-500">Chargement des projets...</div>
        </div>
      </div>
    );
  }

  // Afficher un écran de sélection de projet si aucun projet n'est disponible
  if (projects.length === 0) {
    return (
      <div className="app">
        <div className="no-projects-container">
          <Result
            status="info"
            title="Aucun projet disponible"
            subTitle="Commencez par créer un nouveau projet pour gérer votre chantier."
            extra={[
              <Button 
                type="primary" 
                key="create" 
                onClick={() => setIsCreateProjectOpen(true)}
                size="large"
              >
                Créer un nouveau projet
              </Button>,
            ]}
          />
        </div>
        {isCreateProjectOpen && (
            <CreateProjectModal 
              isOpen={isCreateProjectOpen}
              onCancel={() => setIsCreateProjectOpen(false)}
              onCreate={handleCreateProject}
            />
          )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Afficher l'interface principale avec le projet sélectionné
  return (
    <div className="app">
      <div className={`flex h-screen bg-gray-50 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <Sidebar 
          activeSection={activeSection}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCreateProject={() => setIsCreateProjectOpen(true)}
          currentProjectId={currentProject?.id || null}
          projects={projects.filter(project => {
            // DÉVELOPPEMENT: Afficher tous les projets non archivés
            return project?.status !== 'archived';
          })}
          onProjectSelect={(id) => {
            if (id) {
              setCurrentProject(id);
            } else {
              const firstProject = projects[0];
              if (firstProject) {
                setCurrentProject(firstProject.id);
              }
            }
          }}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <HeaderUpdated 
            onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            isMenuCollapsed={sidebarCollapsed}
            onNavigate={handleNavigate}
            onCreateProject={() => setIsCreateProjectOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <AnimatedPage pageKey={activeSection}>
                {renderContent()}
              </AnimatedPage>
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      {/* Modals */}
      {isCreateProjectOpen && (
        <CreateProjectModal 
          isOpen={isCreateProjectOpen}
          onCancel={() => setIsCreateProjectOpen(false)}
          onCreate={handleCreateProject}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// Composant racine de l'application qui fournit le contexte des projets
const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

// Ajout de la configuration pour les animations de page
document.body.classList.add('page-transition');

export default App;
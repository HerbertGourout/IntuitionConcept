import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from './contexts/projectTypes';
import { useProjects } from './hooks/useProjects';

import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Projects from './components/Projects/Projects';
import Equipment from './components/Equipment/Equipment';
import Tasks from './components/Tasks/Tasks';
import Finances from './components/Finances/Finances';
import Planning from './components/Planning/Planning';
import Documents from './components/Documents/Documents';
import Reports from './components/Reports/Reports';
import Team from './components/Team/Team';
import PurchaseOrders from './components/PurchaseOrders/PurchaseOrders';
import Locations from './components/Locations/Locations';
import Settings from './components/Settings/Settings';
import CreateProjectModal from './components/Projects/CreateProjectModal';
import { ToastContainer } from './components/UI/Toast';
import type { ToastProps } from './components/UI/Toast';
import { useToast } from './hooks/useToast';
import ProjectBudget from './pages/ProjectBudget';
import { Button, Result } from 'antd';
import { 
  FocusMode, 
  QuickCommand, 
  KeyboardShortcutsPanel, 
  SmartSearch,
  useKeyboardShortcuts 
} from './components/UI/InteractiveFeatures';
import { Search, Plus, Home, Settings as SettingsIcon, FileText, Users } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [showQuickCommand, setShowQuickCommand] = useState(false);

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

  // Gérer l'état de chargement
  useEffect(() => {
    // Simuler un délai de chargement puis marquer comme chargé
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Configuration des raccourcis clavier
  const keyboardShortcuts = [
    { key: 'Ctrl+D', description: 'Aller au tableau de bord', action: () => handleNavigate('dashboard') },
    { key: 'Ctrl+P', description: 'Aller aux projets', action: () => handleNavigate('projects') },
    { key: 'Ctrl+T', description: 'Aller aux tâches', action: () => handleNavigate('tasks') },
    { key: 'Ctrl+F', description: 'Aller aux finances', action: () => handleNavigate('finances') },
    { key: 'Ctrl+N', description: 'Nouveau projet', action: () => setIsCreateProjectOpen(true) },
    { key: 'Ctrl+K', description: 'Commande rapide', action: () => setShowQuickCommand(true) },
    { key: 'Ctrl+/', description: 'Afficher les raccourcis', action: () => {} }
  ];

  // Configuration des commandes rapides
  const quickCommands = [
    {
      id: 'dashboard',
      label: 'Aller au tableau de bord',
      icon: <Home className="w-4 h-4" />,
      action: () => handleNavigate('dashboard'),
      shortcut: 'Ctrl+D'
    },
    {
      id: 'new-project',
      label: 'Créer un nouveau projet',
      icon: <Plus className="w-4 h-4" />,
      action: () => setIsCreateProjectOpen(true),
      shortcut: 'Ctrl+N'
    },
    {
      id: 'projects',
      label: 'Gérer les projets',
      icon: <FileText className="w-4 h-4" />,
      action: () => handleNavigate('projects'),
      shortcut: 'Ctrl+P'
    },
    {
      id: 'team',
      label: 'Gérer l\'équipe',
      icon: <Users className="w-4 h-4" />,
      action: () => handleNavigate('team')
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <SettingsIcon className="w-4 h-4" />,
      action: () => handleNavigate('settings')
    }
  ];

  // Suggestions de recherche
  const searchSuggestions = [
    'Tableau de bord',
    'Projets',
    'Tâches',
    'Équipements',
    'Planning',
    'Finances',
    'Documents',
    'Rapports',
    'Équipe',
    'Localisation',
    'Paramètres'
  ];

  // Configuration des raccourcis clavier globaux
  useKeyboardShortcuts({
    'ctrl+d': () => handleNavigate('dashboard'),
    'ctrl+p': () => handleNavigate('projects'),
    'ctrl+t': () => handleNavigate('tasks'),
    'ctrl+f': () => handleNavigate('finances'),
    'ctrl+n': () => setIsCreateProjectOpen(true),
    'ctrl+k': () => setShowQuickCommand(true)
  });



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
        return <Dashboard onNavigate={handleNavigate} />;
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
      case 'purchase-orders':
        return <PurchaseOrders />;
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
    <FocusMode>
      <div className="app">
        <Layout
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onCreateProject={() => setIsCreateProjectOpen(true)}
          currentProjectId={currentProject?.id || null}
          projects={projects.filter(p => p.status !== 'archived')}
          onProjectSelect={(id: string | null) => id && setCurrentProject(id)}
        >
          <AnimatePresence mode="wait">
            <AnimatedPage pageKey={activeSection}>
              {renderContent()}
            </AnimatedPage>
          </AnimatePresence>
        </Layout>
        
        {/* Fonctionnalités Interactives */}
        <QuickCommand commands={quickCommands} />
        <KeyboardShortcutsPanel shortcuts={keyboardShortcuts} />
        
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
    </FocusMode>
  );
}

// Composant racine de l'application (les providers sont maintenant dans AppRouter)
const App: React.FC = () => {
  return <AppContent />;
};

// Ajout de la configuration pour les animations de page
document.body.classList.add('page-transition');

export default App;
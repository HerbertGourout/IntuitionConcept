import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from './contexts/projectTypes';
import { useProjects } from './hooks/useProjects';

// Nouveaux contextes modernes
import { ThemeProvider } from './contexts/ThemeContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { GeolocationProvider } from './contexts/GeolocationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { BrandingProvider } from './contexts/BrandingContext';

import Layout from './components/Layout/Layout';
import ModernProjectDashboard from './components/Dashboard/ModernProjectDashboard';
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
import Quotes from './pages/Quotes';
import QuoteCreatorSimple from './components/Quotes/QuoteCreatorSimple.tsx';
import { Result } from 'antd';
import { Home, Plus, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import { FocusMode, QuickCommand, KeyboardShortcutsPanel } from './components/UI/InteractiveFeatures';
import { AnimatePresence } from 'framer-motion';

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
  // Utilise l'état de chargement du ProjectContext pour éviter les flashs d'état vide
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  // État pour les fonctionnalités interactives (à implémenter)

  const { toasts, success, removeToast } = useToast() as { 
    toasts: ToastProps[]; 
    success: (title: string, message?: string) => string; 
    removeToast: (id: string) => void;
  };
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    addProject,
    loadingProjects
  } = useProjects();

  // Plus de timer local: on se base uniquement sur loadingProjects du contexte

  // Configuration des raccourcis clavier
  const keyboardShortcuts = [
    { key: 'Ctrl+D', description: 'Aller au tableau de bord', action: () => setActiveSection('dashboard') },
    { key: 'Ctrl+P', description: 'Aller aux projets', action: () => setActiveSection('projects') },
    { key: 'Ctrl+T', description: 'Aller aux tâches', action: () => setActiveSection('tasks') },
    { key: 'Ctrl+F', description: 'Aller aux finances', action: () => setActiveSection('finances') },
    { key: 'Ctrl+N', description: 'Nouveau projet', action: () => setIsCreateProjectOpen(true) },
    { key: 'Ctrl+K', description: 'Commande rapide', action: () => console.log('Commande rapide') },
    { key: 'Ctrl+/', description: 'Afficher les raccourcis', action: () => {} }
  ];

  // Configuration des commandes rapides
  const quickCommands = [
    {
      id: 'dashboard',
      label: 'Aller au tableau de bord',
      icon: <Home className="w-4 h-4" />,
      action: () => setActiveSection('dashboard'),
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
      action: () => setActiveSection('projects'),
      shortcut: 'Ctrl+P'
    },
    {
      id: 'team',
      label: 'Gérer l\'équipe',
      icon: <Users className="w-4 h-4" />,
      action: () => setActiveSection('team')
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <SettingsIcon className="w-4 h-4" />,
      action: () => setActiveSection('settings')
    }
  ];



  // Configuration des raccourcis clavier globaux
  // Removed useKeyboardShortcuts hook as it's not defined


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
    if (!loadingProjects && projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0].id);
    }
  }, [loadingProjects, projects, currentProject, setCurrentProject]);
  

  const renderContent = () => {
    // Évite d'afficher des états intermédiaires avant la fin du chargement
    if (loadingProjects) return null;
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
        return <ModernProjectDashboard onNavigate={handleNavigate} />;
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
      case 'quotes':
        return <Quotes />;
      case 'quote-creator':
        return (
          <QuoteCreatorSimple
            onClose={() => setActiveSection('quotes')}
            onQuoteCreated={() => setActiveSection('quotes')}
            editQuote={null}
          />
        );
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
  if (loadingProjects) {
    return (
      <div className="app flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <div className="text-gray-500">Chargement des projets...</div>
        </div>
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

// Composant racine de l'application avec tous les nouveaux contextes modernes
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <GeolocationProvider>
          <WidgetProvider>
            <BrandingProvider>
              <AppContent />
            </BrandingProvider>
          </WidgetProvider>
        </GeolocationProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
};

// Ajout de la configuration pour les animations de page
document.body.classList.add('page-transition');

export default App;
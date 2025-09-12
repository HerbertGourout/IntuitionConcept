import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Project } from './contexts/projectTypes';
import { useProjects } from './hooks/useProjects';
import { AICopilotWidget } from './components/Dashboard/AICopilotWidget';
import { AnomalyDetectionWidget } from './components/Dashboard/AnomalyDetectionWidget';

// Nouveaux contextes modernes
import { ThemeProvider } from './contexts/ThemeContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { GeolocationProvider } from './contexts/GeolocationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import SessionMonitor from './components/Auth/SessionMonitor';

import SecureLayout from './components/Layout/SecureLayout';
import { Dashboard, Quotes, Projects, Equipment, Tasks, Finances, Planning, Documents, ProjectBudget, Reports, Team, PurchaseOrders, PaymentDashboard, Locations, NotificationCenter, Settings, QuoteCreator } from './components/LazyLoad/LazyComponents';
import DragDropPlanningBoard from './components/DragDrop/DragDropPlanningBoard';
import CompetitiveAnalysis from './components/Analysis/CompetitiveAnalysis';
import SupportCenter from './components/Support/SupportCenter';
import SupportAgentDashboard from './components/Support/SupportAgentDashboard';
import TransactionDashboard from './components/Transactions/TransactionDashboard';
import IntelligentOCRScanner from './components/OCR/IntelligentOCRScanner';
import AuthTestPage from './components/Auth/AuthTestPage';
import EmailTestPage from './components/Email/EmailTestPage';
import CreateProjectModal from './components/Projects/CreateProjectModal';
import { ToastContainer } from './components/UI/Toast';
import type { ToastProps } from './components/UI/Toast';
import { useToast } from './hooks/useToast';
import { Result } from 'antd';
import { Home, Plus, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import Launchpad from './components/Launchpad/Launchpad';
import { FocusMode, QuickCommand, KeyboardShortcutsPanel } from './components/UI/InteractiveFeatures';
import { AnimatePresence } from 'framer-motion';
import { usingEmulators } from './firebase';
import { useLocation, useNavigate } from 'react-router-dom';

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

  // Router hooks (doivent être à l'intérieur d'un composant React)
  const location = useLocation();
  const navigate = useNavigate();

  // Synchroniser la section active avec l'URL (/app/:section)
  useEffect(() => {
    const m = location.pathname.match(/^\/app\/(\w[\w-]*)/);
    if (m && m[1] && m[1] !== activeSection) {
      setActiveSection(m[1]);
    }
  }, [location.pathname]);

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

  // Contexte pour le copilote IA basé sur le projet actuel
  const copilotContext = React.useMemo(() => ({
    currentProject: currentProject || null,
    projects: projects,
    quotes: [], // TODO: Intégrer les vrais devis depuis le contexte
    transactions: [], // TODO: Intégrer les vraies transactions
    currentUser: {
      name: 'Utilisateur', // TODO: Récupérer depuis l'authentification
      role: 'manager',
      permissions: ['read', 'write', 'admin']
    },
    activeSection: activeSection,
    userRole: 'manager' // À adapter selon l'authentification
  }), [currentProject, projects, activeSection]);

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
    // Keep URL in sync
    navigate(`/app/${section}`);
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
    // Les sections qui nécessitent un projet sélectionné
    const requiresProject = new Set([
      'dashboard', 'project-budget', 'equipment', 'tasks', 'planning', 'finances', 'documents', 'purchase-orders'
    ]);
    // Si la section requiert un projet mais qu'aucun n'est sélectionné, afficher un message d'erreur
    if (requiresProject.has(activeSection) && !currentProject) {
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
      case 'launchpad':
        return <Launchpad onOpenSection={(s) => handleNavigate(s)} />;
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
      case 'drag-drop-planning':
        return <DragDropPlanningBoard />;
      case 'competitive-analysis':
        return <CompetitiveAnalysis />;
      case 'documents':
        return <Documents />;
      case 'project-budget':
        return <ProjectBudget />;
      case 'quotes':
        return <Quotes />;
      case 'quote-creator':
        return (
          <QuoteCreator
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
      case 'payments':
        return <PaymentDashboard />;
      case 'locations':
        return <Locations />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <SupportCenter />;
      case 'support-agent':
        return <SupportAgentDashboard />;
      case 'transactions':
        return <TransactionDashboard />;
      case 'ocr-scanner':
        return <IntelligentOCRScanner />;
      case 'auth-test':
        return <AuthTestPage />;
      case 'email-test':
        return <EmailTestPage />;
      default:
        return <div>Section non trouvée</div>;
    }
  };

  // Afficher un écran de chargement tant que les projets ne sont pas chargés (évite page blanche)
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
    <AuthWrapper>
      <FocusMode>
        <div className="app">
          <SecureLayout
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
          </SecureLayout>
          
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

          {/* Session Monitor */}
          <SessionMonitor 
            warningThreshold={5 * 60 * 1000} // 5 minutes avant expiration
            autoRefresh={true}
          />

          {/* AI Copilot Widget - Assistant flottant global */}
          <AICopilotWidget 
            context={copilotContext}
            onActionRequested={(action) => {
              console.log('Action demandée par le copilote:', action);
              // Gérer les actions du copilote (navigation, création, etc.)
              if (action.type === 'navigate') {
                setActiveSection(action.params?.section || 'dashboard');
              } else if (action.type === 'create_project') {
                setIsCreateProjectOpen(true);
              }
            }}
          />

          {/* Widget d'alertes d'anomalies - Position fixe en haut à droite */}
          <div className="fixed top-20 right-4 z-40">
            <AnomalyDetectionWidget />
          </div>

          {/* Emulator Badge */}
          {usingEmulators && (
            <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg text-xs font-medium bg-orange-500/90 text-white shadow-lg border border-orange-300/50">
              Firebase Emulators
            </div>
          )}
        </div>
      </FocusMode>
    </AuthWrapper>
  );
}

// Composant racine de l'application avec les contextes (Auth & Project sont fournis par AppRouter)
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <GeolocationProvider>
          <WidgetProvider>
            <BrandingProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
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
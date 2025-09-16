import React, { useState, useEffect } from 'react';
import type { Project } from './contexts/projectTypes';
import { useProjectContext } from './contexts/ProjectContext';
import { useAuth } from './contexts/AuthContext';
import { AICopilotWidget } from './components/Dashboard/AICopilotWidget';
import { AnomalyDetectionWidget } from './components/Dashboard/AnomalyDetectionWidget';
import SessionMonitor from './components/Auth/SessionMonitor';
import VocalCopilot from './components/AI/VocalCopilot';
import { GeolocationProvider } from './contexts/GeolocationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WidgetProvider } from './contexts/WidgetContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import SecureLayout from './components/Layout/SecureLayout';

import { Dashboard, Quotes, Projects, Equipment, Tasks, Finances, Planning, Documents, ProjectBudget, Reports, Team, PurchaseOrders, PaymentDashboard, Locations, NotificationCenter, Settings, QuoteCreator } from './components/LazyLoad/LazyComponents';
import SupportCenter from './components/Support/SupportCenter';
import SupportAgentDashboard from './components/Support/SupportAgentDashboard';
import TransactionDashboard from './components/Transactions/TransactionDashboard';
import IntelligentOCRScanner from './components/OCR/IntelligentOCRScanner';
import AuthTestPage from './components/Auth/AuthTestPage';
import EmailTestPage from './components/Email/EmailTestPage';
import AnomalyDetectionDashboard from './components/AI/AnomalyDetectionDashboard';
import ArchitecturalPlanAnalyzer from './components/AI/ArchitecturalPlanAnalyzer';
import CreateProjectModal from './components/Projects/CreateProjectModal';
import { useToast } from './hooks/useToast';
import { Result } from 'antd';
import Launchpad from './components/Launchpad/Launchpad';
import { FocusMode } from './components/UI/InteractiveFeatures';
import { usingEmulators } from './firebase';
import { useLocation, useNavigate } from 'react-router-dom';

// Appliquer les styles globaux
import './index.css';




const AppContent: React.FC = () => {
  // Utilise l'état de chargement du ProjectContext pour éviter les flashs d'état vide
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [showVocalCopilot, setShowVocalCopilot] = useState(false);
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
  }, [location.pathname, activeSection]);

  const { success } = useToast() as { 
    success: (title: string, message?: string) => string; 
  };
  const {
    projects,
    currentProject,
    setCurrentProject,
    addProject,
    loadingProjects
  } = useProjectContext();

  const { user } = useAuth();

  // États pour les données du copilote
  const [quotes, setQuotes] = useState<Array<{id: string; title: string; clientName: string; totalAmount: number; status: string; createdAt: string}>>([]);
  const [transactions, setTransactions] = useState<Array<{id: string; amount: number; description: string; date: string; vendorName: string}>>([]);

  // Charger les données pour le copilote
  useEffect(() => {
    const loadCopilotData = async () => {
      if (currentProject) {
        try {
          // Utiliser des données simulées pour l'intégration copilote
          const mockQuotes = [
            {
              id: `quote-${currentProject.id}-1`,
              title: `Devis ${currentProject.name}`,
              clientName: currentProject.client || 'Client',
              totalAmount: currentProject.budget * 0.8,
              status: 'pending',
              createdAt: new Date().toISOString()
            }
          ];
          setQuotes(mockQuotes);

          const mockTransactions = [
            {
              id: `trans-${currentProject.id}-1`,
              amount: currentProject.spent || 0,
              description: 'Dépenses projet',
              date: new Date().toISOString(),
              vendorName: 'Fournisseur principal'
            }
          ];
          setTransactions(mockTransactions);
        } catch (error) {
          console.error('Erreur lors du chargement des données copilote:', error);
        }
      } else {
        setQuotes([]);
        setTransactions([]);
      }
    };

    loadCopilotData();
  }, [currentProject]);

  // Contexte pour le copilote IA basé sur le projet actuel
  const copilotContext = React.useMemo(() => ({
    currentProject: currentProject || null,
    projects: projects,
    quotes: quotes,
    transactions: transactions,
    currentUser: user ? {
      name: user.displayName || user.email || 'Utilisateur',
      role: user.role || 'worker', // Utiliser le rôle réel de l'utilisateur
      permissions: user.permissions || ['read'] // Utiliser les permissions réelles
    } : null,
    activeSection: activeSection,
    userRole: user?.role || 'worker' // Utiliser le rôle réel de l'utilisateur
  }), [currentProject, projects, activeSection, user, quotes, transactions]);

  // Plus de timer local: on se base uniquement sur loadingProjects du contexte

  // Configuration des raccourcis clavier (à activer ultérieurement)

  // Configuration des commandes rapides (à activer ultérieurement)



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

  const handleCreateProject = async (
    projectData: Omit<Project, 'id' | 'phases' | 'spent'> & { createdAt: string; updatedAt: string }
  ) => {
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
      case 'anomaly-detection':
        return <AnomalyDetectionDashboard />;
      case 'architectural-plan-analyzer':
        return <ArchitecturalPlanAnalyzer />;
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
        <SecureLayout
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onCreateProject={() => setIsCreateProjectOpen(true)}
          currentProjectId={currentProject ? currentProject.id : null}
          projects={projects}
          onProjectSelect={(id: string | null) => {
            if (typeof id === 'string') {
              setCurrentProject(id);
            }
          }}
        >
          <div className="app">

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

          {/* VocalCopilot - Bouton flottant et modal */}
          <div className="fixed bottom-20 right-4 z-50">
            <button
              onClick={() => setShowVocalCopilot(!showVocalCopilot)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Assistant Vocal IA"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          {/* VocalCopilot Modal */}
          {showVocalCopilot && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assistant Vocal IA</h2>
                  <button
                    onClick={() => setShowVocalCopilot(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <VocalCopilot />
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal en fonction de la section active */}
          {renderContent()}

            {/* Emulator Badge */}
            {usingEmulators && (
              <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg text-xs font-medium bg-orange-500/90 text-white shadow-lg border border-orange-300/50">
                Firebase Emulators
              </div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
              isOpen={isCreateProjectOpen}
              onCancel={() => setIsCreateProjectOpen(false)}
              onCreate={handleCreateProject}
            />
          </div>
        </SecureLayout>
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
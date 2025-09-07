import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Composant de chargement réutilisable
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Chargement..." }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Lazy loading des composants principaux
export const LazyDashboard = React.lazy(() => import('../Dashboard/ModernProjectDashboard'));
export const LazyProjects = React.lazy(() => import('../Projects/Projects'));
export const LazyEquipment = React.lazy(() => import('../Equipment/Equipment'));
export const LazyTasks = React.lazy(() => import('../Tasks/Tasks'));
export const LazyFinances = React.lazy(() => import('../Finances/Finances'));
export const LazyPlanning = React.lazy(() => import('../Planning/Planning'));
export const LazyDocuments = React.lazy(() => import('../Documents/Documents'));
export const LazyReports = React.lazy(() => import('../Reports/Reports'));
export const LazyTeam = React.lazy(() => import('../Team/Team'));
export const LazyLocations = React.lazy(() => import('../Locations/Locations'));
export const LazySettings = React.lazy(() => import('../Settings/Settings'));
export const LazyQuotes = React.lazy(() => import('../../pages/Quotes'));
export const LazyQuoteCreator = React.lazy(() => import('../Quotes/QuoteCreatorSimple'));
export const LazyProjectBudget = React.lazy(() => import('../../pages/ProjectBudget'));
export const LazyPurchaseOrders = React.lazy(() => import('../PurchaseOrders/PurchaseOrders'));
export const LazyPaymentDashboard = React.lazy(() => import('../payments/PaymentDashboard'));
export const LazyNotificationCenter = React.lazy(() => import('../Notifications/NotificationCenter'));

// HOC pour wrapper les composants lazy avec Suspense
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  loadingMessage?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Composants wrappés prêts à l'emploi
export const Dashboard = withLazyLoading(LazyDashboard, "Chargement du tableau de bord...");
export const Projects = withLazyLoading(LazyProjects, "Chargement des projets...");
export const Equipment = withLazyLoading(LazyEquipment, "Chargement des équipements...");
export const Tasks = withLazyLoading(LazyTasks, "Chargement des tâches...");
export const Finances = withLazyLoading(LazyFinances, "Chargement des finances...");
export const Planning = withLazyLoading(LazyPlanning, "Chargement du planning...");
export const Documents = withLazyLoading(LazyDocuments, "Chargement des documents...");
export const Reports = withLazyLoading(LazyReports, "Chargement des rapports...");
export const Team = withLazyLoading(LazyTeam, "Chargement de l'équipe...");
export const Locations = withLazyLoading(LazyLocations, "Chargement des localisations...");
export const Settings = withLazyLoading(LazySettings, "Chargement des paramètres...");
export const Quotes = withLazyLoading(LazyQuotes, "Chargement des devis...");
export const QuoteCreator = withLazyLoading(LazyQuoteCreator, "Chargement du créateur de devis...");
export const ProjectBudget = withLazyLoading(LazyProjectBudget, "Chargement du budget...");
export const PurchaseOrders = withLazyLoading(LazyPurchaseOrders, "Chargement des commandes...");
export const PaymentDashboard = withLazyLoading(LazyPaymentDashboard, "Chargement des paiements...");
export const NotificationCenter = withLazyLoading(LazyNotificationCenter, "Chargement des notifications...");

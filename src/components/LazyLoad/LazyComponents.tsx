// SUPPRESSION COMPLÈTE DU LAZY LOADING POUR NAVIGATION INSTANTANÉE
import DashboardComponent from '../Dashboard/Dashboard';
import ProjectsComponent from '../Projects/Projects';
import EquipmentComponent from '../Equipment/Equipment';
import TasksComponent from '../Tasks/Tasks';
import FinancesComponent from '../Finances/Finances';
import PlanningComponent from '../Planning/Planning';
import DocumentsComponent from '../Documents/Documents';
import ReportsComponent from '../Reports/Reports';
import TeamComponent from '../Team/Team';
import LocationsComponent from '../Locations/Locations';
import SettingsComponent from '../Settings/Settings';
import QuotesComponent from '../../pages/Quotes';
import QuoteCreatorComponent from '../Quotes/QuoteCreatorSimple';
import ProjectBudgetComponent from '../../pages/ProjectBudget';
import PurchaseOrdersComponent from '../PurchaseOrders/PurchaseOrders';
import PaymentDashboardComponent from '../payments/PaymentDashboard';
import NotificationCenterComponent from '../Notifications/NotificationCenter';

// EXPORTS DIRECTS - NAVIGATION INSTANTANÉE SANS LAZY LOADING
export const Dashboard = DashboardComponent;
export const Projects = ProjectsComponent;
export const Equipment = EquipmentComponent;
export const Tasks = TasksComponent;
export const Finances = FinancesComponent;
export const Planning = PlanningComponent;
export const Documents = DocumentsComponent;
export const Reports = ReportsComponent;
export const Team = TeamComponent;
export const Locations = LocationsComponent;
export const Settings = SettingsComponent;
export const Quotes = QuotesComponent;
export const QuoteCreator = QuoteCreatorComponent;
export const ProjectBudget = ProjectBudgetComponent;
export const PurchaseOrders = PurchaseOrdersComponent;
export const PaymentDashboard = PaymentDashboardComponent;
export const NotificationCenter = NotificationCenterComponent;

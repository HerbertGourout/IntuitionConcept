// Export all automation components
export { WorkflowManager } from './WorkflowManager';
export { WorkflowCreator } from './WorkflowCreator';
export { AutomationDashboard } from './AutomationDashboard';
export { AutomationTemplates } from './AutomationTemplates';

// Export automation services
export { automationService } from '../../services/automationService';
export { webhookService } from '../../services/webhookService';

// Export automation types
export type {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowExecution
} from '../../services/automationService';

export type {
  WebhookPayload,
  WebhookResponse
} from '../../services/webhookService';

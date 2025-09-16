import { auditLogger } from './auditLogger';

export interface WorkflowTrigger {
    id: string;
    type: 'webhook' | 'schedule' | 'event';
    config: {
        url?: string;
        cron?: string;
        event?: string;
    };
}

export interface WorkflowAction {
    id: string;
    type: 'email' | 'notification' | 'api_call' | 'data_update';
    config: Record<string, unknown>;
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed';
    startedAt: Date;
    completedAt?: Date;
    error?: string;
    data?: Record<string, unknown>;
}

class AutomationService {
    private workflows: Map<string, Workflow> = new Map();
    private executions: Map<string, WorkflowExecution> = new Map();
    private n8nBaseUrl: string;
    private n8nApiKey: string;

    constructor() {
        this.n8nBaseUrl = (import.meta.env?.VITE_N8N_BASE_URL as string) || 'http://localhost:5678';
        this.n8nApiKey = (import.meta.env?.VITE_N8N_API_KEY as string) || '';
    }

    // Configuration n8n
    configure(baseUrl: string, apiKey: string) {
        this.n8nBaseUrl = baseUrl;
        this.n8nApiKey = apiKey;
    }

    // Créer un workflow
    async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
        const id = this.generateId();
        const newWorkflow: Workflow = {
            ...workflow,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.workflows.set(id, newWorkflow);

        // Créer le workflow dans n8n
        await this.createN8nWorkflow(newWorkflow);

        auditLogger.logSensitiveAction(
            workflow.createdBy,
            'admin',
            'create_workflow',
            'workflow',
            id,
            {
                name: workflow.name,
                workflowId: id
            }
        );

        return newWorkflow;
    }

    // Obtenir tous les workflows
    getWorkflows(): Workflow[] {
        return Array.from(this.workflows.values());
    }

    // Obtenir un workflow par ID
    getWorkflow(id: string): Workflow | undefined {
        return this.workflows.get(id);
    }

    // Mettre à jour un workflow
    async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
        const workflow = this.workflows.get(id);
        if (!workflow) return null;

        const updatedWorkflow = {
            ...workflow,
            ...updates,
            updatedAt: new Date()
        };

        this.workflows.set(id, updatedWorkflow);

        // Mettre à jour dans n8n
        await this.updateN8nWorkflow(updatedWorkflow);

        auditLogger.logSensitiveAction(
            'system',
            'admin',
            'update_workflow',
            'workflow',
            id,
            {
                updates: Object.keys(updates)
            }
        );

        return updatedWorkflow;
    }

    // Supprimer un workflow
    async deleteWorkflow(id: string): Promise<boolean> {
        const workflow = this.workflows.get(id);
        if (!workflow) return false;

        this.workflows.delete(id);

        // Supprimer de n8n
        await this.deleteN8nWorkflow(id);

        auditLogger.logSensitiveAction(
            'system',
            'admin',
            'delete_workflow',
            'workflow',
            id
        );
        return true;
    }

    // Activer/désactiver un workflow
    async toggleWorkflow(id: string, isActive: boolean): Promise<boolean> {
        const workflow = this.workflows.get(id);
        if (!workflow) return false;

        workflow.isActive = isActive;
        workflow.updatedAt = new Date();

        // Activer/désactiver dans n8n
        await this.toggleN8nWorkflow(id, isActive);

        auditLogger.logSensitiveAction(
            'system',
            'admin',
            'toggle_workflow',
            'workflow',
            id,
            {
                isActive
            }
        );

        return true;
    }

    // Exécuter manuellement un workflow
    async executeWorkflow(id: string, inputData?: Record<string, unknown>): Promise<WorkflowExecution> {
        const workflow = this.workflows.get(id);
        if (!workflow) {
            throw new Error('Workflow non trouvé');
        }

        const executionId = this.generateId();
        const execution: WorkflowExecution = {
            id: executionId,
            workflowId: id,
            status: 'running',
            startedAt: new Date(),
            data: inputData
        };

        this.executions.set(executionId, execution);

        try {
            // Exécuter dans n8n
            const result = await this.executeN8nWorkflow(id, inputData);

            execution.status = 'completed';
            execution.completedAt = new Date();
            execution.data = { ...execution.data, result };

            auditLogger.logEvent({
                userId: 'system',
                userRole: 'admin',
                action: 'workflow_executed',
                resource: 'workflow',
                resourceId: id,
                details: {
                    executionId,
                    status: 'completed'
                },
                result: 'success',
                severity: 'low'
            });

        } catch (error) {
            execution.status = 'failed';
            execution.completedAt = new Date();
            execution.error = error instanceof Error ? error.message : 'Erreur inconnue';

            auditLogger.logEvent({
                userId: 'system',
                userRole: 'admin',
                action: 'workflow_execution_failed',
                resource: 'workflow',
                resourceId: id,
                details: {
                    executionId,
                    error: execution.error
                },
                result: 'failure',
                severity: 'medium'
            });
        }

        return execution;
    }

    // Obtenir les exécutions d'un workflow
    getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
        return Array.from(this.executions.values())
            .filter(exec => exec.workflowId === workflowId)
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    }

    // Gérer les webhooks entrants
    async handleWebhook(workflowId: string, data: Record<string, unknown>): Promise<void> {
        const workflow = this.workflows.get(workflowId);
        if (!workflow || !workflow.isActive) {
            throw new Error('Workflow non trouvé ou inactif');
        }

        if (workflow.trigger.type !== 'webhook') {
            throw new Error('Ce workflow n\'est pas configuré pour les webhooks');
        }

        await this.executeWorkflow(workflowId, data);
    }

    // Méthodes privées pour l'intégration n8n
    private async createN8nWorkflow(workflow: Workflow): Promise<void> {
        if (!this.n8nApiKey) return;

        try {
            const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': this.n8nApiKey
                },
                body: JSON.stringify({
                    name: workflow.name,
                    nodes: this.convertToN8nNodes(workflow),
                    active: workflow.isActive
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur n8n: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur lors de la création du workflow n8n:', error);
        }
    }

    private async updateN8nWorkflow(workflow: Workflow): Promise<void> {
        if (!this.n8nApiKey) return;

        try {
            const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${workflow.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': this.n8nApiKey
                },
                body: JSON.stringify({
                    name: workflow.name,
                    nodes: this.convertToN8nNodes(workflow),
                    active: workflow.isActive
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur n8n: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du workflow n8n:', error);
        }
    }

    private async deleteN8nWorkflow(id: string): Promise<void> {
        if (!this.n8nApiKey) return;

        try {
            const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur n8n: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du workflow n8n:', error);
        }
    }

    private async toggleN8nWorkflow(id: string, isActive: boolean): Promise<void> {
        if (!this.n8nApiKey) return;

        try {
            const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${id}/${isActive ? 'activate' : 'deactivate'}`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur n8n: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'activation/désactivation du workflow n8n:', error);
        }
    }

    private async executeN8nWorkflow(id: string, inputData?: Record<string, unknown>): Promise<unknown> {
        if (!this.n8nApiKey) {
            throw new Error('API Key n8n non configurée');
        }

        try {
            const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${id}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': this.n8nApiKey
                },
                body: JSON.stringify({ data: inputData })
            });

            if (!response.ok) {
                throw new Error(`Erreur n8n: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'exécution du workflow n8n:', error);
            throw error;
        }
    }

    private convertToN8nNodes(workflow: Workflow): unknown[] {
        // Convertir le format de workflow interne vers le format n8n
        const nodes = [];

        // Nœud de déclenchement
        nodes.push({
            id: 'trigger',
            name: 'Trigger',
            type: this.getTriggerNodeType(workflow.trigger.type),
            position: [250, 300],
            parameters: workflow.trigger.config
        });

        // Nœuds d'action
        workflow.actions.forEach((action, index) => {
            nodes.push({
                id: `action_${index}`,
                name: action.type,
                type: this.getActionNodeType(action.type),
                position: [450 + (index * 200), 300],
                parameters: action.config
            });
        });

        return nodes;
    }

    private getTriggerNodeType(type: string): string {
        switch (type) {
            case 'webhook': return 'n8n-nodes-base.webhook';
            case 'schedule': return 'n8n-nodes-base.cron';
            case 'event': return 'n8n-nodes-base.manualTrigger';
            default: return 'n8n-nodes-base.manualTrigger';
        }
    }

    private getActionNodeType(type: string): string {
        switch (type) {
            case 'email': return 'n8n-nodes-base.emailSend';
            case 'notification': return 'n8n-nodes-base.httpRequest';
            case 'api_call': return 'n8n-nodes-base.httpRequest';
            case 'data_update': return 'n8n-nodes-base.httpRequest';
            default: return 'n8n-nodes-base.httpRequest';
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

// Instance singleton
export const automationService = new AutomationService();
export default automationService;

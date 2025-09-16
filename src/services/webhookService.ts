import { automationService } from './automationService';
import { auditLogger } from './auditLogger';

export interface WebhookPayload {
  workflowId: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  executionId?: string;
  error?: string;
}

class WebhookService {
  private webhookEndpoints: Map<string, string> = new Map();

  /**
   * Enregistre un endpoint webhook pour un workflow
   */
  registerWebhook(workflowId: string, endpoint: string): void {
    this.webhookEndpoints.set(workflowId, endpoint);
    auditLogger.log('webhook_registered', {
      workflowId,
      endpoint
    });
  }

  /**
   * Supprime un endpoint webhook
   */
  unregisterWebhook(workflowId: string): void {
    this.webhookEndpoints.delete(workflowId);
    auditLogger.log('webhook_unregistered', {
      workflowId
    });
  }

  /**
   * Traite un webhook entrant
   */
  async handleIncomingWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      // Validation du payload
      if (!payload.workflowId || !payload.data) {
        return {
          success: false,
          message: 'Payload invalide: workflowId et data requis'
        };
      }

      // Vérifier que le workflow existe et est actif
      const workflow = automationService.getWorkflow(payload.workflowId);
      if (!workflow) {
        return {
          success: false,
          message: `Workflow ${payload.workflowId} non trouvé`
        };
      }

      if (!workflow.isActive) {
        return {
          success: false,
          message: `Workflow ${payload.workflowId} est inactif`
        };
      }

      // Vérifier que le workflow est configuré pour les webhooks
      if (workflow.trigger.type !== 'webhook') {
        return {
          success: false,
          message: `Workflow ${payload.workflowId} n'est pas configuré pour les webhooks`
        };
      }

      // Exécuter le workflow
      const execution = await automationService.executeWorkflow(
        payload.workflowId,
        payload.data
      );

      auditLogger.log('webhook_processed', {
        workflowId: payload.workflowId,
        executionId: execution.id,
        source: payload.source,
        timestamp: payload.timestamp
      });

      return {
        success: true,
        message: 'Webhook traité avec succès',
        executionId: execution.id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      auditLogger.log('webhook_error', {
        workflowId: payload.workflowId,
        error: errorMessage,
        source: payload.source
      });

      return {
        success: false,
        message: 'Erreur lors du traitement du webhook',
        error: errorMessage
      };
    }
  }

  /**
   * Génère une URL de webhook pour un workflow
   */
  generateWebhookUrl(workflowId: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/api/webhooks/${workflowId}`;
  }

  /**
   * Traite les webhooks BTP spécifiques
   */
  async handleBTPWebhook(type: string, data: Record<string, unknown>): Promise<WebhookResponse> {
    const btpWebhooks = {
      'quote_approved': 'workflow_quote_approved',
      'project_created': 'workflow_project_created',
      'task_completed': 'workflow_task_completed',
      'budget_exceeded': 'workflow_budget_alert',
      'equipment_maintenance': 'workflow_equipment_maintenance',
      'team_notification': 'workflow_team_notification'
    };

    const workflowId = btpWebhooks[type as keyof typeof btpWebhooks];
    if (!workflowId) {
      return {
        success: false,
        message: `Type de webhook BTP non supporté: ${type}`
      };
    }

    return this.handleIncomingWebhook({
      workflowId,
      data,
      timestamp: new Date().toISOString(),
      source: 'BTP_SYSTEM'
    });
  }

  /**
   * Traite les webhooks externes (n8n, Zapier, etc.)
   */
  async handleExternalWebhook(
    source: string,
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<WebhookResponse> {
    return this.handleIncomingWebhook({
      workflowId,
      data,
      timestamp: new Date().toISOString(),
      source: source.toUpperCase()
    });
  }

  /**
   * Obtient les statistiques des webhooks
   */
  getWebhookStats(): {
    totalEndpoints: number;
    activeEndpoints: string[];
    recentActivity: Array<{
      workflowId: string;
      timestamp: string;
      success: boolean;
    }>;
  } {
    // Cette méthode pourrait être étendue pour récupérer les stats depuis une base de données
    return {
      totalEndpoints: this.webhookEndpoints.size,
      activeEndpoints: Array.from(this.webhookEndpoints.keys()),
      recentActivity: [] // À implémenter avec un système de logs persistant
    };
  }

  /**
   * Valide la signature d'un webhook (sécurité)
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implémentation basique - à améliorer avec crypto
    try {
      // Dans un vrai système, utiliser HMAC-SHA256
      const expectedSignature = btoa(payload + secret);
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Teste un webhook
   */
  async testWebhook(workflowId: string): Promise<WebhookResponse> {
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test webhook depuis IntuitionConcept'
    };

    return this.handleIncomingWebhook({
      workflowId,
      data: testData,
      timestamp: new Date().toISOString(),
      source: 'TEST'
    });
  }
}

export const webhookService = new WebhookService();
export default webhookService;

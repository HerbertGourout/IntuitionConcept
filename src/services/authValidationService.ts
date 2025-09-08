import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { UserRole, Permission } from '../config/permissions';

export interface ValidationRequest {
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface ValidationResponse {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: Permission[];
  userRole?: UserRole;
  timestamp: string;
}

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  allowed: boolean;
  reason?: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class AuthValidationService {
  private validatePermissionFunction = httpsCallable<ValidationRequest, ValidationResponse>(
    functions,
    'validatePermission'
  );

  private logActionFunction = httpsCallable<AuditLogEntry, { success: boolean }>(
    functions,
    'logUserAction'
  );

  /**
   * Valide une permission côté serveur
   * @param request - Requête de validation
   * @returns Réponse de validation du serveur
   */
  async validatePermission(request: ValidationRequest): Promise<ValidationResponse> {
    try {
      const result = await this.validatePermissionFunction(request);
      return result.data;
    } catch (error) {
      console.error('Erreur validation permission serveur:', error);
      // Fallback sécurisé : refuser l'accès en cas d'erreur
      return {
        allowed: false,
        reason: 'Erreur de validation serveur',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enregistre une action utilisateur pour audit
   * @param entry - Entrée d'audit
   */
  async logUserAction(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      const fullEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      await this.logActionFunction(fullEntry);
    } catch (error) {
      console.error('Erreur logging action:', error);
      // Ne pas bloquer l'action si le logging échoue
    }
  }

  /**
   * Valide et log une action en une seule opération
   * @param request - Requête de validation
   * @param userId - ID de l'utilisateur
   * @returns Résultat de la validation
   */
  async validateAndLog(
    request: ValidationRequest, 
    userId: string
  ): Promise<ValidationResponse> {
    const validation = await this.validatePermission(request);

    // Logger l'action (succès ou échec)
    await this.logUserAction({
      userId,
      action: request.action,
      resource: request.resource,
      resourceId: request.resourceId,
      allowed: validation.allowed,
      reason: validation.reason,
      metadata: request.metadata
    });

    return validation;
  }

  /**
   * Récupère l'IP du client (approximative)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // En production, utilisez un service comme ipify ou récupérez l'IP côté serveur
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  /**
   * Valide plusieurs permissions en batch
   * @param requests - Liste des requêtes
   * @returns Map des résultats par action
   */
  async validateMultiplePermissions(
    requests: ValidationRequest[]
  ): Promise<Map<string, ValidationResponse>> {
    const results = new Map<string, ValidationResponse>();
    
    // Exécuter en parallèle pour de meilleures performances
    const validations = await Promise.allSettled(
      requests.map(req => this.validatePermission(req))
    );

    requests.forEach((request, index) => {
      const validation = validations[index];
      if (validation.status === 'fulfilled') {
        results.set(request.action, validation.value);
      } else {
        results.set(request.action, {
          allowed: false,
          reason: 'Erreur de validation',
          timestamp: new Date().toISOString()
        });
      }
    });

    return results;
  }
}

export const authValidationService = new AuthValidationService();
export default authValidationService;

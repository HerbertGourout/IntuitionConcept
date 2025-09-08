import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auditLogger } from '../services/auditLogger';
import { sessionManager } from '../services/sessionManager';
import { Permission } from '../config/permissions';
import { message } from 'antd';

interface SecureActionOptions {
  requiredPermissions?: Permission[];
  requireRecentAuth?: boolean;
  maxAuthAge?: number; // en millisecondes
  resource?: string;
  resourceId?: string;
  logAction?: boolean;
  onUnauthorized?: () => void;
}

interface SecureActionResult<TArgs extends readonly unknown[], TReturn> {
  execute: (...args: TArgs) => Promise<TReturn | null>;
  canExecute: boolean;
  isLoading: boolean;
}

export function useSecureAction<TArgs extends readonly unknown[], TReturn = void>(
  action: (...args: TArgs) => Promise<TReturn>,
  actionName: string,
  options: SecureActionOptions = {}
): SecureActionResult<TArgs, TReturn> {
  const { user, hasPermission } = useAuth();
  const {
    requiredPermissions = [],
    requireRecentAuth = false,
    maxAuthAge = 30 * 60 * 1000, // 30 minutes
    resource,
    resourceId,
    logAction = true,
    onUnauthorized
  } = options;

  // Vérifier si l'utilisateur peut exécuter l'action
  const canExecute = user && requiredPermissions.every(permission => hasPermission(permission));

  const execute = useCallback(async (...args: TArgs): Promise<TReturn | null> => {
    if (!user) {
      message.error('Vous devez être connecté pour effectuer cette action');
      onUnauthorized?.();
      return null;
    }

    // Vérifier les permissions
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(p => !hasPermission(p));
      
      if (logAction) {
        await auditLogger.logResourceAccess(
          user.uid,
          user.role,
          resource || 'unknown',
          resourceId || 'unknown',
          actionName,
          false,
          `Permissions manquantes: ${missingPermissions.join(', ')}`
        );
      }

      message.error('Vous n\'avez pas les permissions nécessaires pour cette action');
      onUnauthorized?.();
      return null;
    }

    // Vérifier l'authentification récente si requise
    if (requireRecentAuth) {
      const needsReauth = await sessionManager.requiresRecentAuth(maxAuthAge);
      if (needsReauth) {
        message.warning('Cette action nécessite une authentification récente. Veuillez vous reconnecter.');
        
        if (logAction) {
          await auditLogger.logResourceAccess(
            user.uid,
            user.role,
            resource || 'unknown',
            resourceId || 'unknown',
            actionName,
            false,
            'Authentification récente requise'
          );
        }
        
        onUnauthorized?.();
        return null;
      }
    }

    try {
      // Exécuter l'action
      const result = await action(...args);

      // Logger le succès
      if (logAction) {
        await auditLogger.logSensitiveAction(
          user.uid,
          user.role,
          actionName,
          resource || 'unknown',
          resourceId || 'unknown',
          { args: args.length > 0 ? args : undefined },
          true
        );
      }

      return result;
    } catch (error) {
      // Logger l'échec
      if (logAction) {
        await auditLogger.logSensitiveAction(
          user.uid,
          user.role,
          actionName,
          resource || 'unknown',
          resourceId || 'unknown',
          { 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            args: args.length > 0 ? args : undefined 
          },
          false
        );
      }

      console.error(`Erreur lors de l'exécution de ${actionName}:`, error);
      message.error('Une erreur est survenue lors de l\'exécution de l\'action');
      throw error;
    }
  }, [user, hasPermission, requiredPermissions, requireRecentAuth, maxAuthAge, resource, resourceId, actionName, logAction, onUnauthorized, action]);

  return {
    execute,
    canExecute: !!canExecute,
    isLoading: false // Peut être étendu pour gérer l'état de chargement
  };
}

export default useSecureAction;

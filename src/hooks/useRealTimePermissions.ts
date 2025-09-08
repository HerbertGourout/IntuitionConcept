import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sessionManager } from '../services/sessionManager';
import { auditLogger } from '../services/auditLogger';
import { Permission } from '../config/permissions';

interface PermissionState {
  [key: string]: boolean;
}

interface RealTimePermissionsHook {
  permissions: PermissionState;
  isSessionValid: boolean;
  sessionTimeLeft: number;
  checkPermission: (permission: Permission) => boolean;
  refreshPermissions: () => Promise<void>;
  logPermissionCheck: (permission: Permission, granted: boolean) => void;
}

export function useRealTimePermissions(
  requiredPermissions: Permission[] = []
): RealTimePermissionsHook {
  const { user, hasPermission, refreshClaims } = useAuth();
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

  // Vérifier une permission spécifique
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    const granted = hasPermission(permission);
    
    // Logger la vérification de permission si c'est une permission sensible
    const sensitivePermissions = ['admin.system', 'admin.users', 'quotes.delete', 'finances.edit'];
    if (sensitivePermissions.includes(permission)) {
      logPermissionCheck(permission, granted);
    }
    
    return granted;
  }, [user, hasPermission]);

  // Logger les vérifications de permissions
  const logPermissionCheck = useCallback(async (permission: Permission, granted: boolean) => {
    if (!user) return;
    
    try {
      await auditLogger.logResourceAccess(
        user.uid,
        user.role,
        'permission_check',
        permission,
        'check_permission',
        granted,
        granted ? undefined : `Permission ${permission} refusée`
      );
    } catch (error) {
      console.warn('Erreur lors du logging de vérification de permission:', error);
    }
  }, [user]);

  // Rafraîchir les permissions
  const refreshPermissions = useCallback(async () => {
    if (!user) return;

    try {
      // Rafraîchir les claims côté Firebase
      await refreshClaims();
      
      // Mettre à jour l'état des permissions
      const newPermissions: PermissionState = {};
      requiredPermissions.forEach(permission => {
        newPermissions[permission] = checkPermission(permission);
      });
      setPermissions(newPermissions);

      // Vérifier la validité de la session
      const sessionInfo = await sessionManager.getSessionInfo();
      setIsSessionValid(sessionInfo.isValid);
      setSessionTimeLeft(sessionInfo.timeUntilExpiry);

    } catch (error) {
      console.error('Erreur lors du rafraîchissement des permissions:', error);
    }
  }, [user, requiredPermissions, checkPermission, refreshClaims]);

  // Surveillance en temps réel des permissions
  useEffect(() => {
    if (!user) return;

    // Vérification initiale
    refreshPermissions();

    // Surveillance périodique (toutes les 30 secondes)
    const interval = setInterval(() => {
      refreshPermissions();
    }, 30 * 1000);

    // Surveillance de la session
    sessionManager.startSessionMonitoring(
      (timeLeft) => {
        setSessionTimeLeft(timeLeft);
        if (timeLeft <= 2 * 60 * 1000) { // 2 minutes avant expiration
          refreshPermissions(); // Vérifier si les permissions ont changé
        }
      },
      () => {
        setIsSessionValid(false);
        setPermissions({});
      }
    );

    return () => {
      clearInterval(interval);
      sessionManager.stopSessionMonitoring();
    };
  }, [user, refreshPermissions]);

  // Mettre à jour les permissions quand les permissions requises changent
  useEffect(() => {
    if (!user) return;

    const newPermissions: PermissionState = {};
    requiredPermissions.forEach(permission => {
      newPermissions[permission] = checkPermission(permission);
    });
    setPermissions(newPermissions);
  }, [requiredPermissions, user, checkPermission]);

  return {
    permissions,
    isSessionValid,
    sessionTimeLeft,
    checkPermission,
    refreshPermissions,
    logPermissionCheck
  };
}

export default useRealTimePermissions;

import React from 'react';
import { Alert, Spin } from 'antd';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { useRealTimePermissions } from '../../hooks/useRealTimePermissions';
import { Permission } from '../../config/permissions';

interface RealTimePermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallback?: React.ReactNode;
  showSessionWarning?: boolean;
}

const RealTimePermissionGuard: React.FC<RealTimePermissionGuardProps> = ({
  children,
  requiredPermissions,
  fallback,
  showSessionWarning = true
}) => {
  const {
    permissions,
    isSessionValid,
    sessionTimeLeft,
    checkPermission
  } = useRealTimePermissions(requiredPermissions);

  // Vérifier si toutes les permissions requises sont accordées
  const hasAllPermissions = requiredPermissions.every(permission => 
    checkPermission(permission)
  );

  // Session expirée
  if (!isSessionValid) {
    return (
      <div className="p-4">
        <Alert
          message="Session expirée"
          description="Votre session a expiré. Veuillez vous reconnecter pour continuer."
          type="error"
          showIcon
          icon={<Clock className="w-4 h-4" />}
        />
      </div>
    );
  }

  // Permissions insuffisantes
  if (!hasAllPermissions) {
    const missingPermissions = requiredPermissions.filter(p => !checkPermission(p));
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4">
        <Alert
          message="Permissions insuffisantes"
          description={
            <div>
              <p>Vous n'avez pas les permissions nécessaires pour accéder à ce contenu.</p>
              <div className="mt-2">
                <strong>Permissions manquantes :</strong>
                <ul className="list-disc list-inside mt-1">
                  {missingPermissions.map(permission => (
                    <li key={permission} className="text-sm">{permission}</li>
                  ))}
                </ul>
              </div>
            </div>
          }
          type="warning"
          showIcon
          icon={<Shield className="w-4 h-4" />}
        />
      </div>
    );
  }

  // Avertissement de session proche de l'expiration
  const showSessionAlert = showSessionWarning && 
    sessionTimeLeft > 0 && 
    sessionTimeLeft <= 5 * 60 * 1000; // 5 minutes

  return (
    <div>
      {showSessionAlert && (
        <div className="mb-4">
          <Alert
            message="Session bientôt expirée"
            description={`Votre session expire dans ${Math.ceil(sessionTimeLeft / 60000)} minutes.`}
            type="warning"
            showIcon
            icon={<AlertTriangle className="w-4 h-4" />}
            closable
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default RealTimePermissionGuard;

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessModule, hasPermission, Permission } from '../../config/permissions';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ModuleProtectionProps {
  module: string;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ModuleProtection: React.FC<ModuleProtectionProps> = ({
  module,
  requiredPermissions,
  fallback,
  children
}) => {
  const { user, firebaseUser, isLoading, resendEmailVerification, refreshClaims } = useAuth();
  const requireEmailVerified = (import.meta as any)?.env?.VITE_REQUIRE_EMAIL_VERIFIED === 'true';

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rediriger si pas connecté
  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentification requise
          </h3>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à ce module.
          </p>
        </div>
      </div>
    );
  }

  // Gate email vérifié (optionnel)
  if (requireEmailVerified && firebaseUser && !firebaseUser.emailVerified) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-4 text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vérification de l'email requise
          </h3>
          <p className="text-gray-600 mb-4">
            Votre adresse email n'est pas encore vérifiée. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={async () => { await resendEmailVerification(); }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Renvoyer l'email
            </button>
            <button
              onClick={async () => { await refreshClaims(); }}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition border"
            >
              J'ai déjà vérifié
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Email: {firebaseUser.email}</p>
        </div>
      </div>
    );
  }

  // Vérifier l'accès au module
  const role = user?.role ?? 'worker';
  const hasModuleAccess = canAccessModule(role, module);
  
  // Vérifier les permissions spécifiques si fournies
  const hasRequiredPermissions = requiredPermissions 
    ? requiredPermissions.every(permission => hasPermission(role, permission))
    : true;

  if (!hasModuleAccess || !hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à ce module.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Rôle actuel: <strong>{role}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface ActionProtectionProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ActionProtection: React.FC<ActionProtectionProps> = ({
  permission,
  fallback,
  children
}) => {
  const { user, firebaseUser } = useAuth();
  const role = user?.role ?? 'worker';

  if (!firebaseUser || !hasPermission(role, permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default ModuleProtection;

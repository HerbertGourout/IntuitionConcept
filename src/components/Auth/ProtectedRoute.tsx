import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../config/permissions';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermissions?: string[];
    requiredRoles?: UserRole[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermissions = [],
    requiredRoles = [],
    fallbackPath = '/login'
}) => {
    const { user, isLoading, hasPermission, hasRole } = useAuth();

    // Affichage du loader pendant la vérification
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-700">Vérification des permissions...</span>
                </div>
            </div>
        );
    }

    // Redirection si non connecté
    if (!user) {
        return <Navigate to={fallbackPath} replace />;
    }

    // Vérification des permissions
    const hasRequiredPermissions = requiredPermissions.length === 0 || 
        requiredPermissions.every(permission => hasPermission(permission));

    // Vérification des rôles
    const hasRequiredRoles = requiredRoles.length === 0 || 
        hasRole(requiredRoles);

    // Affichage d'erreur si permissions insuffisantes
    if (!hasRequiredPermissions || !hasRequiredRoles) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md mx-auto text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Accès Refusé
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-left">
                                <h3 className="font-medium text-yellow-800 mb-1">
                                    Permissions requises :
                                </h3>
                                {requiredPermissions.length > 0 && (
                                    <ul className="text-sm text-yellow-700 mb-2">
                                        {requiredPermissions.map(permission => (
                                            <li key={permission} className="flex items-center gap-1">
                                                • {permission}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {requiredRoles.length > 0 && (
                                    <div className="text-sm text-yellow-700">
                                        <strong>Rôles autorisés :</strong> {requiredRoles.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>Votre rôle actuel : <strong>{user.role}</strong></p>
                        <p>Contactez votre administrateur pour obtenir les permissions nécessaires.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage du contenu si tout est OK
    return <>{children}</>;
};

export default ProtectedRoute;

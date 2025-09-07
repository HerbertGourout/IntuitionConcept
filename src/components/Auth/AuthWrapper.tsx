import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import { Lock, Mail, RefreshCw } from 'lucide-react';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const { firebaseUser, isLoading, resendEmailVerification, refreshClaims } = useAuth();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const requireEmailVerified = (import.meta as any)?.env?.VITE_REQUIRE_EMAIL_VERIFIED === 'true';

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
    };

    // Afficher un loader pendant le chargement
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    // Si connecté mais email non vérifié et gate activé, afficher le panneau de vérification
    if (firebaseUser && requireEmailVerified && !firebaseUser.emailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
                <div className="glass-card max-w-md w-full p-8 text-center">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <h2 className="text-xl font-semibold mb-2">Vérification de l'email requise</h2>
                    <p className="text-gray-600 mb-4">Un email de vérification a été envoyé à:</p>
                    <p className="font-medium mb-6">{firebaseUser.email}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={async () => { await resendEmailVerification(); alert("Email de vérification renvoyé."); }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Mail className="h-4 w-4" />
                            <span>Renvoyer l'email</span>
                        </button>
                        <button
                            onClick={async () => { await refreshClaims(); }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>J'ai déjà vérifié</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si l'utilisateur Firebase est connecté (même sans profil Firestore complet), afficher l'application
    if (firebaseUser) {
        return <>{children}</>;
    }

    // Sinon, afficher le formulaire de connexion
    return (
        <LoginForm 
            onToggleMode={toggleMode}
            isRegisterMode={isRegisterMode}
        />
    );
};

export default AuthWrapper;

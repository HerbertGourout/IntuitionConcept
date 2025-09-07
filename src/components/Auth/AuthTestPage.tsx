import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, User, Mail, Lock, UserPlus, LogOut, RefreshCw } from 'lucide-react';

const AuthTestPage: React.FC = () => {
  const { user, firebaseUser, isLoading, login, logout, register, resetPassword, hasPermission, hasRole } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [displayName, setDisplayName] = useState('Test User');
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      toast.error(`Erreur de connexion: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password, displayName, 'manager');
      toast.success('Inscription réussie ! Vérifiez votre email.');
    } catch (error: any) {
      toast.error(`Erreur d'inscription: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie !');
    } catch (error: any) {
      toast.error(`Erreur de déconnexion: ${error.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Veuillez saisir un email');
      return;
    }
    try {
      await resetPassword(resetEmail);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Test Firebase Authentication
            </h1>
          </div>
          <p className="text-gray-600">
            Page de test pour vérifier l'intégration Firebase Auth et le système de permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* État de l'authentification */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              État de l'utilisateur
            </h2>
            
            {user ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">✅ Utilisateur connecté</p>
                  <div className="mt-2 space-y-1 text-sm text-green-700">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Nom:</strong> {user.displayName || 'Non défini'}</p>
                    <p><strong>Rôle:</strong> {user.role}</p>
                    <p><strong>UID:</strong> {user.uid}</p>
                    <p><strong>Actif:</strong> {user.isActive ? 'Oui' : 'Non'}</p>
                    <p><strong>Dernière connexion:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">🔐 Permissions</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    {user.permissions.map((permission, index) => (
                      <span key={index} className="inline-block bg-blue-100 px-2 py-1 rounded mr-1 mb-1">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-medium text-purple-800 mb-2">🧪 Tests de permissions</p>
                  <div className="text-sm space-y-1">
                    <p>Peut créer des projets: {hasPermission('projects.create') ? '✅' : '❌'}</p>
                    <p>Peut envoyer des devis: {hasPermission('quotes.send') ? '✅' : '❌'}</p>
                    <p>Peut voir les finances: {hasPermission('finances.view') ? '✅' : '❌'}</p>
                    <p>Est admin: {hasRole('admin') ? '✅' : '❌'}</p>
                    <p>Est manager: {hasRole('manager') ? '✅' : '❌'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full btn-glass bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-105"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">❌ Aucun utilisateur connecté</p>
              </div>
            )}
          </div>

          {/* Formulaires d'authentification */}
          <div className="space-y-6">
            {/* Connexion */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Connexion
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="password123"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full btn-glass bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Se connecter
                </button>
              </div>
            </div>

            {/* Inscription */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Inscription
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Test User"
                  />
                </div>
                <button
                  onClick={handleRegister}
                  className="w-full btn-glass bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  S'inscrire (Rôle: Manager)
                </button>
              </div>
            </div>

            {/* Réinitialisation mot de passe */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                Réinitialiser mot de passe
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  className="w-full btn-glass bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Envoyer email de réinitialisation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Informations Firebase */}
        {firebaseUser && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Informations Firebase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>UID Firebase:</strong> {firebaseUser.uid}</p>
                <p><strong>Email vérifié:</strong> {firebaseUser.emailVerified ? '✅' : '❌'}</p>
                <p><strong>Provider:</strong> {firebaseUser.providerData[0]?.providerId || 'password'}</p>
              </div>
              <div>
                <p><strong>Créé le:</strong> {firebaseUser.metadata.creationTime}</p>
                <p><strong>Dernière connexion:</strong> {firebaseUser.metadata.lastSignInTime}</p>
                <p><strong>Anonyme:</strong> {firebaseUser.isAnonymous ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTestPage;

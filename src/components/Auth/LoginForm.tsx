import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    AlertCircle,
    Building2,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FirebaseError } from 'firebase/app';

interface LoginFormProps {
    onToggleMode: () => void;
    isRegisterMode: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isRegisterMode }) => {
    const { login, register, resetPassword, isLoading, loginWithGoogle } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formateur d'erreurs pour éviter l'usage de `any`
    const formatAuthError = (err: unknown): { message: string; code?: string } => {
        if (err instanceof FirebaseError) {
            return { message: err.message, code: err.code };
        }
        if (err instanceof Error) {
            return { message: err.message };
        }
        if (typeof err === 'string') {
            return { message: err };
        }
        try {
            return { message: JSON.stringify(err) };
        } catch {
            return { message: 'Erreur inconnue' };
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        // Register mode validations
        if (isRegisterMode) {
            if (!formData.displayName.trim()) {
                newErrors.displayName = 'Le nom est requis';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Confirmez votre mot de passe';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsSubmitting(true);
        
        try {
            if (isRegisterMode) {
                await register(formData.email, formData.password, formData.displayName);
                toast.success('Compte créé avec succès ! Vérifiez votre email.');
            } else {
                await login(formData.email, formData.password);
                toast.success('Connexion réussie !');
            }
        } catch (error: unknown) {
            console.error('Erreur d\'authentification:', error);

            const { message: fallbackMessage, code } = formatAuthError(error);
            let errorMessage = fallbackMessage || 'Une erreur est survenue';

            if (code) {
                switch (code) {
                    case 'auth/user-not-found':
                        errorMessage = 'Aucun compte trouvé avec cet email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Mot de passe incorrect';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = 'Cet email est déjà utilisé';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Le mot de passe est trop faible';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Format d\'email invalide';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Trop de tentatives. Réessayez plus tard';
                        break;
                    default:
                        errorMessage = fallbackMessage || 'Erreur d\'authentification';
                }
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!formData.email.trim()) {
            toast.error('Veuillez saisir votre email');
            return;
        }

        try {
            await resetPassword(formData.email);
            toast.success('Email de réinitialisation envoyé !');
        } catch (error: unknown) {
            const { message } = formatAuthError(error);
            toast.error(message || 'Erreur lors de l\'envoi de l\'email');
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Effacer l'erreur pour ce champ
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-700">Vérification...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <Building2 className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        BTP Manager
                    </h1>
                    
                    <p className="text-gray-600">
                        {isRegisterMode ? 'Créer votre compte' : 'Connectez-vous à votre compte'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Display Name (Register only) */}
                    {isRegisterMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    errors.displayName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Votre nom complet"
                            />
                            {errors.displayName && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.displayName}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="votre@email.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Votre mot de passe"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password (Register only) */}
                    {isRegisterMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirmez votre mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isRegisterMode ? 'Création...' : 'Connexion...'}
                            </>
                        ) : (
                            <>
                                {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                {isRegisterMode ? 'Créer le compte' : 'Se connecter'}
                            </>
                        )}
                    </button>

                    {/* Forgot Password (Login only) */}
                    {!isRegisterMode && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    )}
                </form>

                {/* Social Login */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white/80 text-gray-500">ou</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await loginWithGoogle();
                                toast.success('Connexion Google réussie !');
                            } catch (e: unknown) {
                                const { message } = formatAuthError(e);
                                toast.error(message || "Échec de la connexion Google");
                            }
                        }}
                        className="mt-4 w-full bg-white text-gray-800 border-2 border-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-medium"
                    >
                        <img
                            alt="Google"
                            className="w-5 h-5"
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        />
                        Continuer avec Google
                    </button>
                </div>

                {/* Toggle Mode */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        {isRegisterMode ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                        <button
                            onClick={onToggleMode}
                            className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isRegisterMode ? 'Se connecter' : 'Créer un compte'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginForm;

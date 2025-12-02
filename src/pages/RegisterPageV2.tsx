import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  User,
  Building,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Building2,
  CheckCircle,
  Wrench,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Types pour le quiz
type ProfileType = 'artisan' | 'pme' | 'enterprise' | null;
type TeamSize = '1' | '2-10' | '11-50' | '50+' | null;

interface QuizData {
  profileType: ProfileType;
  teamSize: TeamSize;
  mainNeed: string;
}

const RegisterPageV2: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // État du formulaire multi-étapes
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  // Quiz data
  const [quizData, setQuizData] = useState<QuizData>({
    profileType: null,
    teamSize: null,
    mainNeed: '',
  });
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'Niger',
    'Guinée', 'Bénin', 'Togo', 'Cameroun', 'Gabon',
    'République centrafricaine', 'Tchad', 'RD Congo', 'République du Congo',
    'Maroc', 'Algérie', 'Tunisie', 'France', 'Autre',
  ];

  const profileOptions = [
    {
      id: 'artisan',
      title: 'Artisan / Indépendant',
      description: 'Je travaille seul ou avec quelques collaborateurs',
      icon: Wrench,
      color: 'blue',
    },
    {
      id: 'pme',
      title: 'PME du BTP',
      description: 'Je gère une équipe et plusieurs projets',
      icon: BarChart3,
      color: 'green',
    },
    {
      id: 'enterprise',
      title: 'Grande Entreprise',
      description: 'Multi-sites, équipes importantes, besoins avancés',
      icon: Shield,
      color: 'purple',
    },
  ];

  const teamSizeOptions = [
    { id: '1', label: 'Juste moi', icon: User },
    { id: '2-10', label: '2-10 personnes', icon: Users },
    { id: '11-50', label: '11-50 personnes', icon: Building },
    { id: '50+', label: 'Plus de 50', icon: Building2 },
  ];

  const needOptions = [
    'Créer des devis rapidement',
    'Suivre mes chantiers',
    'Gérer mes équipes',
    'Facturer et encaisser',
    'Tout centraliser',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    // Simulation d'inscription
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Compte créé avec succès !');
      navigate('/app/dashboard');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = quizData.profileType !== null;
  const canProceedStep2 = quizData.teamSize !== null && quizData.mainNeed !== '';

  // Rendu des étapes
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Quel est votre profil ?</h2>
        <p className="text-gray-500 mt-2">Nous adapterons votre expérience</p>
      </div>

      <div className="space-y-4">
        {profileOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = quizData.profileType === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuizData({ ...quizData, profileType: option.id as ProfileType })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {isSelected && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={nextStep}
        disabled={!canProceedStep1}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Parlez-nous de votre activité</h2>
        <p className="text-gray-500 mt-2">Pour personnaliser votre tableau de bord</p>
      </div>

      {/* Taille équipe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Taille de votre équipe
        </label>
        <div className="grid grid-cols-2 gap-3">
          {teamSizeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = quizData.teamSize === option.id;
            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setQuizData({ ...quizData, teamSize: option.id as TeamSize })}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Besoin principal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Votre besoin principal
        </label>
        <div className="space-y-2">
          {needOptions.map((need) => {
            const isSelected = quizData.mainNeed === need;
            return (
              <motion.button
                key={need}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setQuizData({ ...quizData, mainNeed: need })}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {need}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceedStep2}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          Continuer
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Créez votre compte</h2>
        <p className="text-gray-500 mt-2">Plus qu'une étape pour commencer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </motion.div>
        )}

        {/* Nom / Prénom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Prénom"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        {/* Téléphone / Pays */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+221 77..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Sélectionner</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="company"
              type="text"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom de votre entreprise"
            />
          </div>
        </div>

        {/* Mots de passe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* CGU */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-600">
            J'accepte les{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">CGU</Link>
            {' '}et la{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">politique de confidentialité</Link>
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Réassurance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-800 text-sm">
            <strong>14 jours gratuits</strong> • Sans carte bancaire • Support en français
          </p>
        </div>
      </form>

      {/* Google Sign-up */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await loginWithGoogle();
              toast.success('Inscription via Google réussie !');
              navigate('/app/dashboard');
            } catch {
              toast.error("Échec de l'inscription via Google");
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
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">IntuitionConcept</span>
          </Link>
          
          {/* Progress bar */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-blue-600' : s < step ? 'w-8 bg-blue-300' : 'w-8 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Étape {step} sur {totalSteps}</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center space-y-3"
        >
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPageV2;

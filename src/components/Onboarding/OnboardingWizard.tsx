import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userName?: string;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur IntuitionConcept !',
    description: 'Vous allez découvrir comment gérer vos chantiers plus simplement. Ce guide rapide vous montre les fonctionnalités essentielles.',
  },
  {
    id: 'dashboard',
    title: 'Votre tableau de bord',
    description: 'Retrouvez tous vos chantiers, équipes et finances en un coup d\'œil. Les alertes vous préviennent des dépassements.',
  },
  {
    id: 'quotes',
    title: 'Créez des devis en 3 clics',
    description: 'Notre IA analyse vos plans et génère des devis précis automatiquement. Vous pouvez aussi utiliser vos modèles.',
  },
  {
    id: 'teams',
    title: 'Suivez vos équipes terrain',
    description: 'Localisez vos équipes en temps réel, assignez des tâches et recevez leurs rapports photo directement.',
  },
  {
    id: 'payments',
    title: 'Paiements Mobile Money',
    description: 'Recevez les paiements via Orange Money, MTN, Wave... Vos clients paient en 2 clics depuis leur téléphone.',
  },
];

/**
 * Wizard d'onboarding pour les nouveaux utilisateurs
 * - 5 étapes simples
 * - Progression visuelle
 * - Peut être fermé et repris plus tard
 */
const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  userName = 'là'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = defaultSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Sauvegarder la progression dans localStorage
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('onboarding_step', currentStep.toString());
    }
  }, [currentStep, isOpen]);

  // Restaurer la progression
  useEffect(() => {
    const savedStep = localStorage.getItem('onboarding_step');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#1E4B6E] text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {currentStep === 0 ? `Bonjour ${userName} !` : `Étape ${currentStep + 1}/${steps.length}`}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#E5A832]"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-[200px]"
              >
                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-6">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        idx === currentStep
                          ? 'bg-[#1E4B6E]'
                          : completedSteps.has(idx)
                          ? 'bg-[#4A7C59]'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {steps[currentStep].title}
                </h3>

                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  {steps[currentStep].description}
                </p>

                {/* Visual placeholder - could be replaced with actual screenshots */}
                <div className="bg-gray-100 rounded-xl p-8 text-center mb-6">
                  <div className="w-16 h-16 bg-[#1E4B6E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">
                      {currentStep === 0 && '👋'}
                      {currentStep === 1 && '📊'}
                      {currentStep === 2 && '📝'}
                      {currentStep === 3 && '👥'}
                      {currentStep === 4 && '💰'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentStep === steps.length - 1 
                      ? 'Vous êtes prêt à commencer !'
                      : 'Illustration de la fonctionnalité'
                    }
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Passer le guide
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#1E4B6E] text-white rounded-lg font-medium hover:bg-[#163a54] flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Commencer
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingWizard;

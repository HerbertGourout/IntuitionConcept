import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Smartphone, CreditCard, AlertCircle } from 'lucide-react';
import { PaymentService } from '../services/PaymentService';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';
import MobileMoneyPayment from '../components/payments/MobileMoneyPayment';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basique',
    price: { monthly: 5000, yearly: 50000 },
    currency: 'XOF',
    features: [
      '5 projets maximum',
      '10 utilisateurs',
      'Support par email',
      'Rapports de base',
      'Stockage 1GB'
    ],
    color: 'blue'
  },
  {
    id: 'pro',
    name: 'Professionnel',
    price: { monthly: 15000, yearly: 150000 },
    currency: 'XOF',
    features: [
      '50 projets maximum',
      '100 utilisateurs',
      'Support prioritaire',
      'Rapports avancés',
      'Stockage 10GB',
      'API d\'intégration',
      'Diagrammes de Gantt'
    ],
    popular: true,
    color: 'green'
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: { monthly: 50000, yearly: 500000 },
    currency: 'XOF',
    features: [
      'Projets illimités',
      'Utilisateurs illimités',
      'Support 24/7',
      'Rapports personnalisés',
      'Stockage illimité',
      'API complète',
      'Formation équipe',
      'Gestionnaire dédié'
    ],
    color: 'purple'
  }
];

export const Subscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { createPayment, updatePaymentStatus } = usePayment();
  const navigate = useNavigate();

  // Calcul des économies pour l'abonnement annuel
  const calculateSavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return monthlyTotal - yearlyPrice;
  };

  // Sélection d'un plan
  const handlePlanSelect = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  }, []);

  // Succès du paiement
  const handlePaymentSuccess = useCallback(async (response: any) => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    
    try {
      // Mettre à jour le statut du paiement
      if (response.transaction_id) {
        // Créer l'enregistrement de paiement
        const paymentData = PaymentService.createPaymentRecord(
          user.uid,
          billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly,
          selectedPlan.currency,
          user.phoneNumber || '',
          `Abonnement ${selectedPlan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`,
          response.tx_ref
        );

        const paymentId = await createPayment(paymentData);
        await updatePaymentStatus(paymentId, 'successful', response.transaction_id);
      }

      // Rediriger vers le dashboard
      navigate('/dashboard', { 
        state: { 
          message: `Félicitations ! Votre abonnement ${selectedPlan.name} est maintenant actif.`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
    } finally {
      setIsProcessing(false);
      setShowPayment(false);
    }
  }, [selectedPlan, user, billingCycle, createPayment, updatePaymentStatus, navigate]);

  // Erreur de paiement
  const handlePaymentError = useCallback((error: any) => {
    console.error('Erreur de paiement:', error);
    setIsProcessing(false);
    // Vous pouvez afficher un message d'erreur ici
  }, []);

  // Fermeture du paiement
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    setSelectedPlan(null);
  }, []);

  if (showPayment && selectedPlan && user) {
    const amount = billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly;
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={handlePaymentClose}
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
            >
              ← Retour aux plans
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Finaliser votre abonnement
            </h2>
            <p className="text-gray-600 mt-2">
              Plan {selectedPlan.name} - {billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
            </p>
          </div>

          <MobileMoneyPayment
            amount={amount}
            currency={selectedPlan.currency}
            customerEmail={user.email || ''}
            customerPhone={user.phoneNumber || ''}
            customerName={user.displayName || user.email || ''}
            description={`Abonnement ${selectedPlan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={handlePaymentClose}
            isProduction={false} // Changez à true en production
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan d'abonnement
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gérez vos projets efficacement avec nos outils professionnels
          </p>

          {/* Sélecteur de cycle de facturation */}
          <div className="inline-flex bg-gray-200 rounded-lg p-1 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans d'abonnement */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const savings = calculateSavings(plan);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
                    <Star className="inline w-4 h-4 mr-1" />
                    Le plus populaire
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                  {/* Nom du plan */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  {/* Prix */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 ml-2">{plan.currency}</span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </div>
                    
                    {billingCycle === 'yearly' && savings > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        Économisez {savings.toLocaleString()} {plan.currency}/an
                      </p>
                    )}
                  </div>

                  {/* Fonctionnalités */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bouton d'action */}
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isProcessing}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? 'Traitement...' : 'Choisir ce plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Méthodes de paiement acceptées
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <Smartphone className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                <p className="text-sm text-gray-600">Orange Money, MTN Money, Airtel Money</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <CreditCard className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Cartes bancaires</h4>
                <p className="text-sm text-gray-600">Visa, Mastercard, cartes locales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Garantie */}
        <div className="text-center">
          <div className="inline-flex items-center bg-green-50 text-green-800 px-6 py-3 rounded-full">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Garantie satisfait ou remboursé 30 jours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

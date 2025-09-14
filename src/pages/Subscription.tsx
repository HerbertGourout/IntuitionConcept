import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Star, Smartphone, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import { PaymentService } from '../services/PaymentService';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';
import MobileMoneyPayment from '../components/payments/MobileMoneyPayment';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { PLANS, PRICING, PlanId, Currency } from '../config/pricing';

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
  const [, setSelectedCountry] = useState<Record<string, unknown> | null>(null);
  
  const { user } = useAuth();
  const { createPayment, updatePaymentStatus } = usePayment();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialiser depuis les paramètres de navigation
  useEffect(() => {
    const state = location.state as { planId?: string; country?: Record<string, unknown>; billing?: 'monthly' | 'yearly' } | null;
    if (state?.planId) {
      // Trouver le plan correspondant dans PLANS
      const plan = PLANS.find(p => p.id === state.planId);
      if (plan) {
        const currency: Currency = (state.country?.currency as Currency) || 'XOF';
        const pricing = PRICING[currency]?.[state.planId as PlanId] || 0;
        
        const subscriptionPlan: SubscriptionPlan = {
          id: plan.id,
          name: plan.name,
          price: {
            monthly: pricing,
            yearly: Math.round(pricing * 12 * 0.83)
          },
          currency: currency,
          features: plan.features.map(f => typeof f === 'string' ? f : f.name || f.toString()),
          popular: plan.popular,
          color: plan.color
        };
        
        setSelectedPlan(subscriptionPlan);
        setSelectedCountry(state.country || null);
        setBillingCycle(state.billing || 'monthly');
        setShowPayment(true);
      }
    }
  }, [location.state]);

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
  const handlePaymentSuccess = useCallback(async (response: Record<string, unknown>) => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    
    try {
      // Mettre à jour le statut du paiement
      const txId = (response as { transaction_id?: string }).transaction_id;
      const txRef = (response as { tx_ref?: string }).tx_ref;
      if (txId) {
        // Créer l'enregistrement de paiement
        const paymentData = PaymentService.createPaymentRecord(
          user.uid,
          billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly,
          selectedPlan.currency,
          user.phoneNumber || '',
          `Abonnement ${selectedPlan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`,
          txRef || ''
        );

        const paymentId = await createPayment(paymentData);
        await updatePaymentStatus(paymentId, 'successful', txId);
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

  // Fonction utilitaire (conservée pour compatibilité future)
  const _handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    setSelectedPlan(null);
  }, []);
  void _handlePaymentClose; // Éviter le warning unused

  if (showPayment && selectedPlan && user) {
    const amount = billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly;
    
    return (
      <GlobalLayout
        showHero={true}
        heroTitle="Finaliser votre abonnement"
        heroSubtitle={`Plan ${selectedPlan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`}
        heroBackground="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"
      >
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/pricing')}
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tarifs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <MobileMoneyPayment
              amount={amount}
              currency={selectedPlan.currency}
              customerEmail={user.email || ''}
              customerPhone={user.phoneNumber || ''}
              customerName={user.displayName || user.email || ''}
              description={`Abonnement ${selectedPlan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`}
              onSuccess={handlePaymentSuccess}
              onClose={() => navigate('/pricing')}
              isProduction={false}
            />
          </div>
        </div>
      </GlobalLayout>
    );
  }

  // Si aucun plan sélectionné depuis Pricing, afficher message de redirection
  if (!location.state) {
    return (
      <GlobalLayout
        showHero={true}
        heroTitle="Choisissez votre plan"
        heroSubtitle="Sélectionnez d'abord un plan depuis notre page tarifs"
        heroBackground="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun plan sélectionné
            </h2>
            <p className="text-gray-600 mb-6">
              Pour procéder au paiement, veuillez d'abord choisir un plan depuis notre page tarifs.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Voir les tarifs
            </button>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout
      showHero={true}
      heroTitle="Plans d'abonnement"
      heroSubtitle="Gérez vos projets efficacement avec nos outils professionnels"
      heroBackground="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900"
    >
      <div className="max-w-7xl mx-auto px-4">
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
      </GlobalLayout>
    );
};

export default Subscription;

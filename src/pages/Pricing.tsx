import React, { useState } from 'react';
import { message } from 'antd';
import GlobalLayout from '../components/Layout/GlobalLayout';
import PricingCalculator from '../components/Pricing/PricingCalculator';
import { Smartphone, CreditCard, ShieldCheck, ChevronRight } from 'lucide-react';
import { TerrainCheck } from '../components/BTPAfrica';
import { useNavigate } from 'react-router-dom';
import { PLANS, PRICING, CURRENCY_SYMBOLS, PlanId, Currency, getPlanIncrementalFeatures } from '../config/pricing';
import { useAuth } from '../contexts/AuthContext';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'east' | 'south' | 'maghreb';
  mobileMoneyProviders: string[];
}

export const Pricing: React.FC = () => {
  const [selectedCountry] = useState<Country | null>({
    code: 'CG',
    name: 'République du Congo',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇨🇬',
    region: 'central',
    mobileMoneyProviders: ['Airtel Money', 'MTN Money']
  });
  const [billingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showFeatureDetails] = useState<boolean>(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const currency: Currency = (selectedCountry?.currency as Currency) || 'XOF';
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const getPrice = (planId: PlanId) => {
    const base = PRICING[currency]?.[planId] || 0;
    return billingCycle === 'yearly' ? Math.round(base * 12 * 0.83) : base;
  };

  const handleSubscribe = (planId: string) => {
    if (!selectedCountry) {
      message.error('Veuillez sélectionner votre pays avant de continuer.');
      return;
    }

    if (!user) {
      navigate('/login', {
        state: {
          redirectTo: '/subscription',
          subscription: {
            planId,
            country: selectedCountry,
            billing: billingCycle
          }
        }
      });
      return;
    }
    
    navigate('/subscription', {
      state: {
        planId,
        country: selectedCountry,
        billing: billingCycle
      }
    });
  };

  return (
    <GlobalLayout
      showHero={true}
      heroTitle="Tarifs Transparents"
      heroSubtitle="Choisissez le plan parfait pour votre équipe. Paiements Mobile Money inclus pour l'Afrique francophone."
      heroBackground="bg-[#1E4B6E]"
    >
      <div className="mx-auto px-4 md:px-10 lg:px-14 max-w-[1920px]">
        {/* Calculateur de prix interactif */}
        <div className="mb-16">
          <PricingCalculator onSelectPlan={(plan) => handleSubscribe(plan)} />
        </div>

        {/* Grille des plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-14">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-[#C45C3E] transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#C45C3E] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Populaire
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {getPrice(plan.id as PlanId).toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">{currencySymbol}/{billingCycle === 'yearly' ? 'an' : 'mois'}</span>
              </div>

              <div className="border-t border-gray-200 my-7" />

              {/* Fonctionnalités principales */}
              <div className="mb-8">
                {plan.id === 'pro' && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Toutes les fonctionnalités Starter incluses
                    </p>
                  </div>
                )}
                {plan.id === 'enterprise' && (
                  <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                    <p className="text-sm text-purple-800 font-medium">
                      Toutes les fonctionnalités Pro BTP incluses
                    </p>
                  </div>
                )}
                
                {(() => {
                  const feats = getPlanIncrementalFeatures(plan.id as PlanId);
                  if (feats.length === 0) return null;
                  
                  return (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {plan.id === 'starter' ? 'Fonctionnalités incluses' : 'Nouvelles fonctionnalités'}
                      </h4>
                      <ul className="space-y-3">
                        {feats.map((feature, idx: number) => (
                          <li key={feature.id ?? idx} className="flex items-start">
                            <TerrainCheck variant="pencil" color="vegetation" size="sm" className="mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-900 font-medium text-sm">{feature.name}</span>
                              {showFeatureDetails && feature.description && (
                                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!selectedCountry}
                className={`w-full py-3.5 px-7 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-[#C45C3E] hover:bg-[#a84d33] text-white shadow-lg hover:shadow-xl'
                    : 'bg-[#1E4B6E] hover:bg-[#163a54] text-white'
                } ${!selectedCountry ? 'opacity-60 cursor-not-allowed hover:bg-inherit' : ''}`}
              >
                {plan.trialDays ? `Commencer l'essai gratuit` : 'S\'abonner'} <ChevronRight className="inline w-5 h-5 ml-2" />
              </button>
              {!selectedCountry && (
                <p className="text-gray-500 text-xs text-center mt-2">
                  Sélectionnez un pays pour continuer à l'étape de paiement.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-14">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Méthodes de paiement acceptées</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 border-2 border-[#C45C3E]/30 rounded-lg bg-[#C45C3E]/5">
              <Smartphone className="w-8 h-8 text-[#C45C3E] mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                <p className="text-sm text-gray-600">Orange Money, MTN Money, Moov Money, Airtel Money</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-2 border-[#1E4B6E]/30 rounded-lg bg-[#1E4B6E]/5">
              <CreditCard className="w-8 h-8 text-[#1E4B6E] mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Cartes bancaires</h4>
                <p className="text-sm text-gray-600">Visa, Mastercard, cartes locales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité & FAQ */}
        <div className="bg-gray-100 rounded-2xl p-10 mb-14">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-6 h-6 text-[#4A7C59] mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Sécurité & Confiance</h4>
          </div>
          <ul className="text-gray-700 space-y-2 mb-4">
            <li>Transactions sécurisées (SSL 256-bit, conformité PCI-DSS)</li>
            <li>Paiements instantanés via Mobile Money</li>
            <li>Factures et reçus disponibles pour chaque paiement</li>
            <li>Support client réactif en français</li>
          </ul>
          <div className="mt-4">
            <h5 className="font-semibold mb-2">FAQ</h5>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li><b>Quels pays sont supportés ?</b> Toute l'Afrique francophone.</li>
              <li><b>Quelles devises ?</b> Franc CFA, Dirham, Dinar (selon le pays sélectionné).</li>
              <li><b>Quels moyens de paiement ?</b> Mobile Money (Orange, MTN, etc.), cartes bancaires.</li>
              <li><b>Comment changer de plan ?</b> Rendez-vous sur votre espace abonné.</li>
              <li><b>Est-ce sécurisé ?</b> Oui, toutes les transactions sont chiffrées.</li>
            </ul>
          </div>
        </div>

        {/* Pourquoi choisir notre solution */}
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Pourquoi choisir notre plateforme ?</h3>
          <ul className="inline-block text-left text-lg text-gray-700 space-y-3">
            <li className="flex items-center gap-3">
              <TerrainCheck variant="pencil" color="laterite" size="md" />
              <span>Interface 100% française et adaptée à l'Afrique</span>
            </li>
            <li className="flex items-center gap-3">
              <TerrainCheck variant="pencil" color="laterite" size="md" />
              <span>Tarification locale abordable</span>
            </li>
            <li className="flex items-center gap-3">
              <TerrainCheck variant="pencil" color="laterite" size="md" />
              <span>Paiement Mobile Money ultra-simple</span>
            </li>
            <li className="flex items-center gap-3">
              <TerrainCheck variant="pencil" color="laterite" size="md" />
              <span>Sécurité et confidentialité garanties</span>
            </li>
            <li className="flex items-center gap-3">
              <TerrainCheck variant="pencil" color="laterite" size="md" />
              <span>Support client réactif basé en Afrique</span>
            </li>
          </ul>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default Pricing;

import React, { useState } from 'react';
import { message } from 'antd';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { Check, Smartphone, CreditCard, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import CompactCountrySelector from '../components/Pricing/CompactCountrySelector';
import { useNavigate } from 'react-router-dom';
import { PLANS, PRICING, CURRENCY_SYMBOLS, PlanId, Currency } from '../config/pricing';
import { useAuth } from '../contexts/AuthContext';
 
 


// Interface compatible avec CompactCountrySelector
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
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [validationError, setValidationError] = useState<string>('');
  const [showFeatureDetails, setShowFeatureDetails] = useState<boolean>(true);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [showPwaHelp, setShowPwaHelp] = useState<boolean>(false);

  // Détermine la devise et les prix selon le pays sélectionné
  const currency: Currency = (selectedCountry?.currency as Currency) || 'XOF';
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const getPrice = (planId: PlanId) => {
    const base = PRICING[currency]?.[planId] || 0;
    return billingCycle === 'yearly' ? Math.round(base * 12 * 0.83) : base;
  };

  const getSavings = (planId: PlanId) => {
    if (billingCycle === 'yearly') {
      const monthly = PRICING[currency]?.[planId] || 0;
      const yearly = Math.round(monthly * 12 * 0.83);
      return monthly * 12 - yearly;
    }
    return 0;
  };

  const handleSubscribe = (planId: string) => {
    // Vérifier que le pays est sélectionné
    if (!selectedCountry) {
      setValidationError('Veuillez sélectionner votre pays pour afficher les tarifs et continuer au paiement.');
      message.error('Veuillez sélectionner votre pays avant de continuer.');
      // Scroll vers le sélecteur pour aider l'utilisateur
      const el = document.getElementById('country-selector');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!user) {
      // Forcer la connexion avant le paiement
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
    
    // Utilisateur connecté, rediriger vers le checkout
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
      heroBackground="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900"
    >
      <div className="mx-auto px-4 md:px-10 lg:px-14 max-w-[1920px]">
        {/* En-tête */}
        <div className="text-center mt-14 md:mt-24 lg:mt-32 mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs & Abonnements</h1>
          <p className="text-lg text-gray-600 mb-10">
            Des plans adaptés à toutes les équipes en Afrique francophone
          </p>
        </div>

        {/* Sélecteur de pays compact */}
        <div id="country-selector" className="mb-2 flex justify-center">
          <CompactCountrySelector
            onCountrySelect={(country: Country) => {
              setSelectedCountry(country);
              setValidationError('');
            }}
            selectedCountry={selectedCountry || undefined}
          />
        </div>
        {validationError && !selectedCountry && (
          <p className="text-red-600 text-sm text-center mb-6">
            {validationError}
          </p>
        )}
        {!selectedCountry && !validationError && (
          <p className="text-gray-600 text-sm text-center mb-6">
            Sélectionnez votre pays pour afficher les prix dans la bonne devise et activer l'abonnement.
          </p>
        )}

        {/* Sélecteur de cycle de facturation + Affichage détails (sticky) */}
        <div className="sticky top-4 z-10 flex flex-col items-center gap-4 mb-12 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex justify-center gap-5">
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Mensuel
            </button>
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Annuel <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">-17%</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <label htmlFor="feature-details" className="cursor-pointer">Afficher les détails des fonctionnalités</label>
            <button
              id="feature-details"
              onClick={() => setShowFeatureDetails(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showFeatureDetails ? 'bg-blue-600' : 'bg-gray-300'}`}
              aria-pressed={showFeatureDetails}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showFeatureDetails ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Bandeau PWA (installable) */}
        <div className="mb-8 mx-auto max-w-3xl">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50">
            <Smartphone className="w-6 h-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                Accédez à la plateforme comme une application mobile (PWA installable) et utilisez-la hors-ligne.
              </p>
              <button
                onClick={() => setShowPwaHelp(v => !v)}
                className="mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                aria-expanded={showPwaHelp}
              >
                {showPwaHelp ? 'Masquer les étapes' : 'Comment installer sur mobile ?'}
              </button>
              {showPwaHelp && (
                <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm text-blue-900">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h5 className="font-semibold mb-1">Android (Chrome)</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ouvrez l’URL de la plateforme</li>
                      <li>Menu ⋮ → « Ajouter à l’écran d’accueil »</li>
                      <li>Confirmez l’installation</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h5 className="font-semibold mb-1">iOS (Safari)</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ouvrez l’URL de la plateforme</li>
                      <li>Partager ⎋ → « Sur l’écran d’accueil »</li>
                      <li>Confirmez l’ajout</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <h5 className="font-semibold mb-1">Desktop (Chrome/Edge)</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cliquez l’icône « Installer l’app » dans la barre d’URL</li>
                      <li>Ouvrez en fenêtre dédiée</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] lg:[grid-template-columns:repeat(auto-fit,minmax(380px,1fr))] 2xl:[grid-template-columns:repeat(auto-fit,minmax(420px,1fr))] gap-12 xl:gap-14 2xl:gap-16 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium">
                  <Star className="inline w-4 h-4 mr-1" /> Le plus populaire
                </div>
              )}
              <div className={`p-12 ${plan.popular ? 'pt-24' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-5">{plan.description}</p>
                <div className="mb-7">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {getPrice(plan.id as PlanId).toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">{currencySymbol}</span>
                    <span className="text-gray-500 ml-1">
                      /{billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                  {plan.trialDays && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      🎁 Essai gratuit {plan.trialDays} jours
                    </div>
                  )}
                  {billingCycle === 'yearly' && getSavings(plan.id as PlanId) > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      Économisez {getSavings(plan.id as PlanId).toLocaleString()} {currencySymbol}/an
                    </p>
                  )}
                </div>
                
                {/* Divider subtil */}
                <div className="border-t border-gray-200 my-7" />
                
                {/* Limites du plan */}
                <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>📊 {typeof plan.limits.projects === 'number' ? `${plan.limits.projects} projets` : 'Projets illimités'}</div>
                    <div>👥 {plan.usersIncluded} utilisateurs inclus{plan.pricePerExtraUser > 0 && ` (+${plan.pricePerExtraUser.toLocaleString()} ${currencySymbol}/user sup.)`}</div>
                    <div>💾 {plan.limits.storage} de stockage</div>
                    {plan.aiCreditsIncluded > 0 && (
                      <div>🤖 {plan.aiCreditsIncluded.toLocaleString()} {currencySymbol} crédits IA inclus</div>
                    )}
                  </div>
                  {plan.aiCreditsIncluded > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Dépassement IA: {plan.aiOverage.llmPer100Calls} {currencySymbol}/100 prompts</div>
                        <div>OCR: {plan.aiOverage.ocrPerPage} {currencySymbol}/page</div>
                        {plan.aiOverage.planReaderPerPlan > 0 && (
                          <div>Lecture plans: {plan.aiOverage.planReaderPerPlan} {currencySymbol}/plan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider subtil */}
                <div className="border-t border-gray-200 my-7" />

                {/* Liste des fonctionnalités avec option d'affichage */}
                {(() => {
                  const expanded = !!expandedPlans[plan.id];
                  const maxVisible = 8;
                  const items = expanded ? plan.features : plan.features.slice(0, maxVisible);
                  return (
                    <>
                      <ul className="space-y-5 mb-8">
                        {items.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-900 font-medium">{feature.name}</span>
                            {showFeatureDetails && (
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            )}
                          </div>
                        </li>
                        ))}
                      </ul>
                      {plan.features.length > maxVisible && (
                        <div className="mb-10">
                          <button
                            onClick={() => setExpandedPlans(prev => ({ ...prev, [plan.id]: !expanded }))}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {expanded ? 'Afficher moins' : `Afficher plus (${plan.features.length - maxVisible})`}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!selectedCountry}
                  className={`w-full py-3.5 px-7 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
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
            </div>
          ))}
        </div>

        {/* Checkout redirigé vers /subscription */}

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-14">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Méthodes de paiement acceptées</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <Smartphone className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                <p className="text-sm text-gray-600">Orange Money, MTN Money, Moov Money, Airtel Money</p>
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

        {/* Sécurité & FAQ */}
        <div className="bg-gray-100 rounded-2xl p-10 mb-14">
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-6 h-6 text-green-600 mr-2" />
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
              <li><b>Quels pays sont supportés ?</b> Toute l’Afrique francophone (voir la liste ci-dessus).</li>
              <li><b>Quelles devises ?</b> Franc CFA, Dirham, Dinar (selon le pays sélectionné).</li>
              <li><b>Quels moyens de paiement ?</b> Mobile Money (Orange, MTN, etc.), cartes bancaires.</li>
              <li><b>Comment changer de plan ?</b> Rendez-vous sur votre espace abonné pour modifier votre abonnement à tout moment.</li>
              <li><b>Est-ce sécurisé ?</b> Oui, toutes les transactions sont chiffrées et sécurisées.</li>
            </ul>
          </div>
        </div>

        {/* Pourquoi choisir notre solution */}
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi choisir notre plateforme ?</h3>
          <ul className="inline-block text-left text-lg text-gray-700 space-y-3">
            <li>🇫🇷 Interface 100% française et adaptée à l’Afrique</li>
            <li>💸 Tarification locale abordable</li>
            <li>📱 Paiement Mobile Money ultra-simple</li>
            <li>🔒 Sécurité et confidentialité garanties</li>
            <li>👩‍💼 Support client réactif basé en Afrique</li>
          </ul>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default Pricing;

import { useState, FC } from 'react';
import { getPlanIncrementalFeatures, getAllPlanFeatures, type PlanId } from '../../config/pricing';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Building, 
  Crown,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  X
} from 'lucide-react';

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Taux par rapport à l'EUR
  locale: string;
  flag: string;
}

interface PricingPlan {
  id: string;
  name: string;
  priceEUR: number; // Prix de base en EUR
  period: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  popular?: boolean;
  features: {
    included: string[];
    excluded?: string[];
  };
  limits: {
    projects: number | 'unlimited';
    users: number | 'unlimited';
    storage: string;
    aiAnalysis: number | 'unlimited';
    support: string;
  };
}

const PricingPlans: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [modalPlanId, setModalPlanId] = useState<PlanId | null>(null);

  const mapPlanId = (localId: string): PlanId | null => {
    if (localId === 'starter') return 'starter';
    if (localId === 'professional') return 'pro';
    if (localId === 'enterprise') return 'enterprise';
    return null;
  };

  // Devises supportées avec taux de change et ajustement régional
  const currencies: CurrencyRate[] = [
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 1, locale: 'fr-FR', flag: '🇪🇺' },
    { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'CFA', rate: 655.957, locale: 'fr-SN', flag: '🇸🇳' },
    { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA', rate: 655.957, locale: 'fr-CM', flag: '🇨🇲' },
    { code: 'MAD', name: 'Dirham Marocain', symbol: 'DH', rate: 10.7, locale: 'ar-MA', flag: '🇲🇦' },
    { code: 'TND', name: 'Dinar Tunisien', symbol: 'TND', rate: 3.35, locale: 'ar-TN', flag: '🇹🇳' },
    { code: 'DZD', name: 'Dinar Algérien', symbol: 'DA', rate: 146.8, locale: 'ar-DZ', flag: '🇩🇿' },
    { code: 'USD', name: 'Dollar Américain', symbol: '$', rate: 0.92, locale: 'en-US', flag: '🇺🇸' },
    { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$', rate: 1.25, locale: 'fr-CA', flag: '🇨🇦' },
    { code: 'CHF', name: 'Franc Suisse', symbol: 'CHF', rate: 0.97, locale: 'fr-CH', flag: '🇨🇭' }
  ];

  // Facteur d'ajustement pour le pouvoir d'achat local
  const getRegionalPricingFactor = (currencyCode: string): number => {
    const factors: Record<string, number> = {
      'EUR': 1,        // Prix de référence Europe
      'XOF': 0.47,     // Ajusté pour 9000 FCFA starter
      'XAF': 0.47,     // Ajusté pour 9000 FCFA starter
      'MAD': 0.60,     // Ajusté proportionnellement
      'TND': 0.65,     // Ajusté proportionnellement
      'DZD': 0.55,     // Ajusté proportionnellement
      'USD': 0.85,     // 15% moins cher pour les USA
      'CAD': 0.80,     // 20% moins cher pour le Canada
      'CHF': 1.15      // 15% plus cher pour la Suisse
    };
    return factors[currencyCode] || 1;
  };

  const getCurrentCurrency = () => currencies.find(c => c.code === selectedCurrency) || currencies[0];
  
  const convertPrice = (priceEUR: number): number => {
    const currency = getCurrentCurrency();
    const regionalFactor = getRegionalPricingFactor(currency.code);
    const adjustedPrice = priceEUR * regionalFactor;
    return Math.round(adjustedPrice * currency.rate);
  };

  const formatPrice = (priceEUR: number): string => {
    const currency = getCurrentCurrency();
    const convertedPrice = convertPrice(priceEUR);
    
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedPrice);
  };

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      priceEUR: billingPeriod === 'monthly' ? 29 : 290,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Parfait pour les petites entreprises et artisans',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      features: { included: [], excluded: [] },
      limits: {
        projects: 5,
        users: 3,
        storage: '5 GB',
        aiAnalysis: 50,
        support: 'Email standard'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      priceEUR: billingPeriod === 'monthly' ? 79 : 790,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Idéal pour les entreprises en croissance',
      icon: <Building className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      features: { included: [], excluded: [] },
      limits: {
        projects: 20,
        users: 10,
        storage: '50 GB',
        aiAnalysis: 500,
        support: 'Email + Chat prioritaire'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceEUR: billingPeriod === 'monthly' ? 199 : 1990,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Solution complète pour grandes entreprises',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-amber-500 to-orange-500',
      features: { included: [], excluded: [] },
      limits: {
        projects: 100,
        users: 50,
        storage: '200 GB',
        aiAnalysis: 2000,
        support: 'Multi-canal + Téléphone'
      }
    },
    {
      id: 'custom',
      name: 'Sur Mesure',
      priceEUR: 0,
      period: 'Devis personnalisé',
      description: 'Solution adaptée à vos besoins spécifiques',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-gray-600 to-gray-800',
      features: {
        included: [
          'Développements spécifiques',
          'Intégrations sur mesure',
          'Formation personnalisée',
          'Déploiement on-premise',
          'Support technique dédié',
          'Conformité réglementaire',
          'Audit de sécurité',
          'Maintenance garantie'
        ]
      },
      limits: {
        projects: 'unlimited',
        users: 'unlimited',
        storage: 'Selon besoins',
        aiAnalysis: 'unlimited',
        support: 'Équipe dédiée'
      }
    }
  ];

  const getDiscountPercentage = () => {
    return Math.round(((plans[0].priceEUR * 12) - (plans[0].priceEUR * 10)) / (plans[0].priceEUR * 12) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>Plans Tarifaires IntuitionConcept BTP</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Choisissez le plan qui vous convient
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Des solutions flexibles pour accompagner votre croissance, de l'artisan indépendant aux grandes entreprises du BTP
        </p>

        {/* Currency Selector */}
        <div className="flex flex-col items-center space-y-3 mt-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Région & Devise:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
          
          {/* Regional Pricing Info */}
          {selectedCurrency !== 'EUR' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg px-6 py-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🚀 <strong>Tarification Intelligente Régionale</strong>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Prix optimisés pour le marché {selectedCurrency === 'XOF' || selectedCurrency === 'XAF' ? 'africain' :
                   selectedCurrency === 'MAD' ? 'marocain' :
                   selectedCurrency === 'TND' ? 'tunisien' :
                   selectedCurrency === 'DZD' ? 'algérien' :
                   selectedCurrency === 'USD' ? 'américain' :
                   selectedCurrency === 'CAD' ? 'canadien' :
                   selectedCurrency === 'CHF' ? 'suisse' : 'local'} avec toutes les fonctionnalités IA révolutionnaires
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Annuel
          </span>
          {billingPeriod === 'yearly' && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              -{getDiscountPercentage()}%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              plan.popular 
                ? 'border-purple-500 ring-4 ring-purple-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Plus Populaire</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className={`bg-gradient-to-r ${plan.gradient} p-6 rounded-t-2xl text-white`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
              </div>
              
              <div className="space-y-2">
                {plan.id !== 'custom' ? (
                  <>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold">{formatPrice(plan.priceEUR)}</span>
                      <span className="text-sm opacity-80">{plan.period}</span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <p className="text-sm opacity-80">
                        Soit {formatPrice(Math.round(plan.priceEUR / 12))}/mois
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-2xl font-bold">{plan.period}</div>
                )}
                <p className="text-sm opacity-90">{plan.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Limits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Limites
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Projets:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.limits.projects === 'unlimited' ? 'Illimité' : plan.limits.projects}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Utilisateurs:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.limits.users === 'unlimited' ? 'Illimité' : plan.limits.users}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stockage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{plan.limits.storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Analyses IA:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.limits.aiAnalysis === 'unlimited' ? 'Illimité' : `${plan.limits.aiAnalysis}/mois`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features (incremental) */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Fonctionnalités
                </h4>
                <ul className="space-y-2">
                  {(() => {
                    const mapId = (localId: string): PlanId | null => {
                      if (localId === 'starter') return 'starter';
                      if (localId === 'professional') return 'pro';
                      if (localId === 'enterprise') return 'enterprise';
                      return null;
                    };
                    const pid = mapId(plan.id);
                    const feats = pid ? getPlanIncrementalFeatures(pid) : [];
                    return feats.slice(0, 12).map((f) => (
                      <li key={f.id} className="flex items-start space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{f.name}</span>
                      </li>
                    ));
                  })()}
                  {/* Optional: hint to view all */}
                  {/* <li className="text-xs text-gray-500">Plus de détails dans la fiche du plan.</li> */}
                </ul>
              </div>

              {/* Support */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Support:</span>
                  <span className="text-gray-600 dark:text-gray-400">{plan.limits.support}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-6 pt-0">
              <button
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    : plan.id === 'custom'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>
                  {plan.id === 'custom' ? 'Nous Contacter' : 'Commencer Maintenant'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Garanties et Avantages
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Essai Gratuit 30 jours</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Testez toutes les fonctionnalités sans engagement
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Migration Gratuite</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nous migrons vos données depuis votre ancien système
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Formation Incluse</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Formation de votre équipe pour une prise en main optimale
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Tarifs Locaux</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prix adaptés au pouvoir d'achat de chaque région
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Features Modal */}
    {showFeaturesModal && modalPlanId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowFeaturesModal(false)} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Caractéristiques incluses — {modalPlanId === 'starter' ? 'Starter' : modalPlanId === 'pro' ? 'Professional' : 'Enterprise'}
            </h3>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowFeaturesModal(false)}
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            <ul className="space-y-3">
              {getAllPlanFeatures(modalPlanId).map((f) => (
                <li key={f.id} className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{f.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setShowFeaturesModal(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default PricingPlans;

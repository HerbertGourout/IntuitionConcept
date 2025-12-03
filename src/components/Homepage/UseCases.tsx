import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, Building2, Rocket, Check, ArrowRight, Users, 
  TrendingUp, Shield, Zap, Star, DollarSign 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UseCase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  employees: string;
  budget: string;
  plan: string;
  planPrice: string;
  painPoints: string[];
  features: string[];
  results: {
    metric: string;
    value: string;
    icon: string;
  }[];
  testimonial: {
    name: string;
    role: string;
    company: string;
    country: string;
    quote: string;
    avatar: string;
  };
}

const useCases: UseCase[] = [
  {
    id: 'artisan',
    title: 'Artisan BTP',
    subtitle: 'Maçons, Électriciens, Plombiers',
    icon: Hammer,
    color: 'from-orange-500 to-red-500',
    gradient: 'from-orange-50 to-red-50',
    employees: '1-5 employés',
    budget: '12,000 FCFA/mois',
    plan: 'Starter',
    planPrice: '12,000',
    painPoints: [
      'Perd trop de temps sur les devis manuels',
      'Difficile de suivre plusieurs chantiers',
      'Pas de système de facturation professionnel',
      'Oublie souvent des matériaux dans les devis'
    ],
    features: [
      '📝 Devis IA rapides (10 min au lieu de 2h)',
      '📅 Planning simple des chantiers',
      '💳 Paiements Mobile Money instantanés',
      '📱 Mode hors-ligne sur chantier',
      '📊 Suivi budget par projet',
      '📄 Documents et photos centralisés',
      '🔔 Rappels automatiques',
      '👥 Gestion équipe basique'
    ],
    results: [
      { metric: 'Temps économisé', value: '15h/mois', icon: '⏱️' },
      { metric: 'Devis créés', value: '+200%', icon: '📈' },
      { metric: 'Clients satisfaits', value: '95%', icon: '⭐' }
    ],
    testimonial: {
      name: 'Jean-Baptiste Ngoma',
      role: 'Maçon Indépendant',
      company: 'Ngoma Construction',
      country: 'Congo 🇨🇬',
      quote: 'Avant, je passais 2h par devis. Maintenant avec l\'IA, c\'est 10 minutes ! Je peux traiter 3× plus de clients et mes devis sont plus professionnels.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 'pme',
    title: 'PME BTP',
    subtitle: 'Entreprises de Construction',
    icon: Building2,
    color: 'from-blue-500 to-indigo-500',
    gradient: 'from-blue-50 to-indigo-50',
    employees: '5-50 employés',
    budget: '35,000 FCFA/mois',
    plan: 'Pro BTP + IA',
    planPrice: '35,000',
    painPoints: [
      'Coordination difficile entre équipes',
      'Dépassements budgétaires fréquents',
      'Retards dans les projets',
      'Manque de visibilité sur la rentabilité',
      'Gestion fournisseurs complexe'
    ],
    features: [
      ' Toutes les fonctionnalités IA (Devis, OCR, Plans, Anomalies)',
      '📊 Dashboard financier complet',
      '👥 Gestion multi-équipes avec GPS',
      '📐 Analyse automatique de plans architecturaux',
      '⚠️ Détection anomalies budget en temps réel',
      '🛒 Gestion bons d\'achat et fournisseurs',
      '📈 Rapports avancés et analytics',
      '💰 Facturation et encaissement automatisés',
      '📱 Application mobile PWA',
      '🔄 Automatisations n8n (workflows)'
    ],
    results: [
      { metric: 'Productivité', value: '+150%', icon: '' },
      { metric: 'Dépassements évités', value: '-60%', icon: '💰' },
      { metric: 'Projets livrés à temps', value: '85%', icon: '✅' }
    ],
    testimonial: {
      name: 'Clément Makosso',
      role: 'Directeur Général',
      company: 'BTP Solutions Kinshasa',
      country: 'RDC 🇨🇩',
      quote: 'L\'IA de détection d\'anomalies nous a fait économiser 15M FCFA en 6 mois en évitant les dépassements. Le ROI est incroyable !',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    }
  },
  {
    id: 'enterprise',
    title: 'Grande Entreprise',
    subtitle: 'Groupes & Multinationales BTP',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-50 to-pink-50',
    employees: '50+ employés',
    budget: '95,000 FCFA/mois',
    plan: 'Enterprise IA Premium',
    planPrice: '95,000',
    painPoints: [
      'Coordination multi-sites complexe',
      'Besoin d\'analytics prédictifs',
      'Intégrations ERP/Comptabilité requises',
      'Conformité et audit stricts',
      'Besoin de personnalisations'
    ],
    features: [
      ' Toutes les fonctionnalités Pro + IA Premium',
      '🎤 Copilot Vocal IA (commandes vocales)',
      '📊 Analytics Prédictifs IA (coûts, délais, risques)',
      '📄 Rapports Automatisés IA personnalisés',
      '🔌 API complète & Intégrations tierces',
      '✍️ Signatures électroniques conformes',
      '🔒 Sécurité & Audit avancés',
      '👨‍💼 Support dédié 24/7 prioritaire',
      ' Rendus 3D photoréalistes illimités',
      '⚙️ Automatisations n8n avancées avec LLM',
      '📍 Géolocalisation multi-sites',
      '💼 Gestion paie équipes',
      '∞ Projets et utilisateurs illimités',
      '💾 1TB de stockage cloud'
    ],
    results: [
      { metric: 'Efficacité globale', value: '+250%', icon: '' },
      { metric: 'Coûts réduits', value: '-40%', icon: '💵' },
      { metric: 'Conformité', value: '100%', icon: '🛡️' }
    ],
    testimonial: {
      name: 'Jean-Baptiste Kouamé',
      role: 'Directeur des Opérations',
      company: 'Groupe BTP Ivoire',
      country: 'Côte d\'Ivoire 🇨🇮',
      quote: 'Les analytics prédictifs nous permettent d\'anticiper les problèmes avant qu\'ils n\'arrivent. Nous avons réduit nos coûts de 40% en 1 an.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  }
];

const UseCases: React.FC = () => {
  const [activeCase, setActiveCase] = useState<string>('pme');

  const currentCase = useCases.find(uc => uc.id === activeCase) || useCases[1];
  const Icon = currentCase.icon;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Une Solution pour
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Chaque Profil</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Que vous soyez artisan, PME ou grande entreprise, IntuitionConcept s'adapte à vos besoins
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
          {useCases.map((useCase) => {
            const TabIcon = useCase.icon;
            return (
              <motion.button
                key={useCase.id}
                onClick={() => setActiveCase(useCase.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  activeCase === useCase.id
                    ? `bg-gradient-to-r ${useCase.color} text-white shadow-2xl`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <TabIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div>{useCase.title}</div>
                    <div className="text-xs opacity-80">{useCase.employees}</div>
                  </div>
                </div>
                {activeCase === useCase.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/20 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Info & Features */}
              <div className="space-y-8">
                {/* Header Card */}
                <div className={`bg-gradient-to-br ${currentCase.gradient} rounded-3xl p-8 shadow-xl`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${currentCase.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{currentCase.title}</h3>
                      <p className="text-gray-600">{currentCase.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <Users className="w-5 h-5 text-gray-600 mb-2" />
                      <div className="text-sm text-gray-600">Équipe</div>
                      <div className="text-lg font-bold text-gray-900">{currentCase.employees}</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <DollarSign className="w-5 h-5 text-gray-600 mb-2" />
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="text-lg font-bold text-gray-900">{currentCase.budget}</div>
                    </div>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">😰</span>
                    Problèmes Rencontrés
                  </h4>
                  <ul className="space-y-3">
                    {currentCase.painPoints.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 text-gray-700"
                      >
                        <span className="text-red-500 mt-1">✗</span>
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 text-yellow-500 mr-3" />
                    Fonctionnalités Incluses
                  </h4>
                  <ul className="space-y-3">
                    {currentCase.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-3"
                      >
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Results & Testimonial */}
              <div className="space-y-8">
                {/* Results */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Résultats Obtenus
                  </h4>
                  <div className="space-y-4">
                    {currentCase.results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-100 mb-1">{result.metric}</div>
                            <div className="text-4xl font-extrabold">{result.value}</div>
                          </div>
                          <div className="text-5xl">{result.icon}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={currentCase.testimonial.avatar}
                      alt={currentCase.testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{currentCase.testimonial.name}</div>
                      <div className="text-sm text-gray-600">{currentCase.testimonial.role}</div>
                      <div className="text-sm text-gray-500">{currentCase.testimonial.company} • {currentCase.testimonial.country}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{currentCase.testimonial.quote}"
                  </p>
                </div>

                {/* Plan Card */}
                <div className={`bg-gradient-to-br ${currentCase.color} rounded-3xl shadow-2xl p-8 text-white`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm opacity-80 mb-1">Plan Recommandé</div>
                      <div className="text-3xl font-bold">{currentCase.plan}</div>
                    </div>
                    <Shield className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="mb-6">
                    <div className="text-5xl font-extrabold mb-2">
                      {currentCase.planPrice.toLocaleString()} FCFA
                    </div>
                    <div className="text-sm opacity-80">par mois</div>
                  </div>
                  <Link to="/pricing">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white text-gray-900 rounded-2xl py-4 px-6 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <span>Choisir ce Plan</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <p className="text-center text-sm opacity-80 mt-4">
                    🎁 Essai gratuit 14 jours
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default UseCases;

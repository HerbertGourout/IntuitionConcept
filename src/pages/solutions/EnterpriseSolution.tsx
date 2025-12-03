import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { 
  ArrowRight
} from 'lucide-react';

// Images
import heroConstructionTeam from '../../assets/images/homepage/hero-construction-team.jpg';
import performanceMetric from '../../assets/images/homepage/performance-metric.jpg';
import satisfiedCustomer from '../../assets/images/homepage/satisfied-customer.jpg';

const EnterpriseSolution: React.FC = () => {
  const challenges = [
    {
      problem: 'Vous gérez 50+ chantiers simultanément',
      solution: 'Dashboard consolidé avec vue multi-projets et alertes intelligentes'
    },
    {
      problem: 'Vos équipes sont réparties dans plusieurs pays',
      solution: 'Gestion multi-sites avec devises locales et fuseaux horaires'
    },
    {
      problem: 'Vous avez besoin d\'intégrations ERP/comptabilité',
      solution: 'API ouverte et connecteurs SAP, Sage, QuickBooks'
    },
    {
      problem: 'La sécurité des données est critique',
      solution: 'Hébergement dédié, SSO, audit logs, conformité RGPD'
    }
  ];

  const features = [
    {
      title: 'Multi-entités',
      description: 'Gérez plusieurs filiales, pays et devises depuis une seule plateforme.'
    },
    {
      title: 'Reporting avancé',
      description: 'Tableaux de bord personnalisables, exports automatiques, BI intégrée.'
    },
    {
      title: 'Gestion des rôles',
      description: 'Permissions granulaires par projet, équipe et fonctionnalité.'
    },
    {
      title: 'API & Intégrations',
      description: 'Connectez votre ERP, comptabilité, RH et outils existants.'
    },
    {
      title: 'Sécurité enterprise',
      description: 'SSO, 2FA, audit logs, chiffrement, hébergement dédié possible.'
    },
    {
      title: 'Support dédié',
      description: 'Account manager, SLA garanti, formation sur site.'
    }
  ];

  const integrations = [
    'SAP', 'Sage', 'QuickBooks', 'Microsoft 365', 'Google Workspace', 
    'Slack', 'Teams', 'Jira', 'API REST'
  ];

  const testimonial = {
    name: 'Amadou Bâ',
    role: 'DSI, Groupe Eiffage Sénégal',
    company: '500+ employés • Présence régionale',
    content: 'IntuitionConcept nous permet de consolider les données de nos 12 filiales en Afrique de l\'Ouest. L\'intégration avec SAP était un prérequis, et leur équipe l\'a déployée en 3 semaines.',
    metric: '12 filiales connectées • 40% gain productivité',
    avatar: satisfiedCustomer
  };

  const securityFeatures = [
    { label: 'Chiffrement AES-256' },
    { label: 'Conformité RGPD' },
    { label: 'Sauvegardes quotidiennes' },
    { label: 'SSO / SAML 2.0' }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Grande entreprise BTP" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-blue-900/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <span className="inline-block px-4 py-2 bg-blue-500/30 rounded-full text-sm font-medium mb-6">
              Solution Enterprise • 50+ employés
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Pilotez vos opérations
              <span className="text-yellow-400"> à grande échelle</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Multi-sites, multi-pays, multi-devises. Une plateforme qui s'adapte 
              à la complexité de votre organisation avec la sécurité et les intégrations 
              dont vous avez besoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Demander une démo <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <a href="tel:+221331234567">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Parler à un expert
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Les défis des grandes organisations
            </h2>
            <p className="text-gray-600">
              Nous comprenons la complexité de vos opérations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {challenges.map((item, index) => (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <p className="text-gray-500 font-medium mb-3">
                  {item.problem}
                </p>
                <p className="text-[#4A7C59] font-medium pl-3 border-l-2 border-[#4A7C59]">
                  {item.solution}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Enterprise
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont une grande organisation a besoin
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#1E4B6E]"
              >
                <h3 className="text-lg font-bold text-[#1E4B6E] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Screenshot */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Reporting consolidé
              </h2>
              <p className="text-gray-600 mb-6">
                Agrégez les données de toutes vos entités dans des tableaux de bord 
                personnalisables. Exports automatiques vers votre BI.
              </p>
              <ul className="space-y-2">
                <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                  Vue consolidée multi-entités
                </li>
                <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                  KPIs personnalisables par rôle
                </li>
                <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                  Exports Excel, PDF, API
                </li>
                <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                  Rapports automatiques par email
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <img 
                src={performanceMetric} 
                alt="Dashboard Enterprise" 
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              S'intègre à vos outils existants
            </h2>
            <p className="text-gray-600">
              API ouverte et connecteurs prêts à l'emploi
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {integrations.map((integration) => (
              <motion.span
                key={integration}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="px-6 py-3 bg-white rounded-xl shadow-sm font-medium text-gray-700"
              >
                {integration}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Sécurité de niveau enterprise
            </h2>
            <p className="text-gray-400">
              Vos données sont protégées selon les standards les plus exigeants
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-white/5 rounded-xl p-4"
              >
                <p className="text-sm text-gray-300 font-medium">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  <p className="text-gray-400 text-sm">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex mb-4 gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#E5A832] text-lg">★</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg italic mb-4">
                "{testimonial.content}"
              </p>

              <div className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full inline-block">
                {testimonial.metric}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tarification sur mesure
            </h2>
            <p className="text-gray-600 mb-8">
              Chaque grande organisation a des besoins spécifiques. 
              Contactez-nous pour une offre adaptée à votre structure.
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
              <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                Utilisateurs illimités
              </li>
              <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                Intégrations personnalisées
              </li>
              <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                Account manager dédié
              </li>
              <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                SLA et support prioritaire
              </li>
              <li className="text-gray-700 pl-3 border-l-2 border-[#4A7C59]">
                Formation sur site
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg"
                >
                  Demander un devis <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <a href="tel:+221331234567">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg"
                >
                  Appeler un expert
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default EnterpriseSolution;

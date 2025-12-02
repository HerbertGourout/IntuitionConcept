import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { 
  Wrench,
  Building,
  Building2,
  ArrowRight,
  CheckCircle,
  Users,
  MapPin
} from 'lucide-react';

// Images
import heroConstructionTeam from '../../assets/images/homepage/hero-construction-team.jpg';

const SolutionsIndex: React.FC = () => {
  const solutions = [
    {
      id: 'artisan',
      icon: Wrench,
      title: 'Artisans & Indépendants',
      subtitle: '1 à 5 personnes',
      description: 'Devis en 5 minutes depuis votre téléphone. Paiements Mobile Money. Fini la paperasse.',
      features: ['Devis mobile', 'Mobile Money', 'Fonctionne hors-ligne'],
      price: 'À partir de 9,900 FCFA/mois',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      link: '/solutions/artisan'
    },
    {
      id: 'pme',
      icon: Building,
      title: 'PME du BTP',
      subtitle: '5 à 50 employés',
      description: 'Gérez plusieurs chantiers, équipes et budgets. Tout centralisé sur une seule plateforme.',
      features: ['Multi-projets', 'Suivi GPS', 'Planning Gantt'],
      price: 'À partir de 25,000 FCFA/mois',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      link: '/solutions/pme',
      popular: true
    },
    {
      id: 'enterprise',
      icon: Building2,
      title: 'Grandes Entreprises',
      subtitle: '50+ employés',
      description: 'Multi-sites, multi-pays, intégrations ERP. Sécurité et support enterprise.',
      features: ['Multi-entités', 'API & Intégrations', 'Support dédié'],
      price: 'Sur devis',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      link: '/solutions/enterprise'
    }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Solutions BTP" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-blue-900/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-white"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Une solution adaptée à
              <span className="text-yellow-400"> votre taille</span>
            </h1>
            <p className="text-xl text-blue-100">
              Que vous soyez artisan indépendant, PME ou grande entreprise, 
              nous avons la solution qui correspond à vos besoins.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${
                    solution.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {solution.popular && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Populaire
                    </div>
                  )}

                  <div className={`p-6 ${solution.bgColor}`}>
                    <div className={`w-14 h-14 bg-gradient-to-br ${solution.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{solution.title}</h2>
                    <p className="text-gray-500">{solution.subtitle}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-6">{solution.description}</p>

                    <ul className="space-y-2 mb-6">
                      {solution.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="border-t pt-6">
                      <p className="text-sm text-gray-500 mb-4">{solution.price}</p>
                      <Link to={solution.link}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className={`w-full py-3 bg-gradient-to-r ${solution.color} text-white rounded-xl font-bold flex items-center justify-center gap-2`}
                        >
                          Découvrir <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">850+</div>
              <div className="text-gray-600">Entreprises</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-gray-600">Pays</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-600">Projets gérés</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-gray-600">Support</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Pas sûr de quelle solution choisir ?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Nos conseillers sont là pour vous aider à trouver la solution 
              adaptée à votre activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold"
                >
                  Parler à un conseiller
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold"
                >
                  Essayer gratuitement
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default SolutionsIndex;

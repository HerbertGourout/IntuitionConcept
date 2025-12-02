import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { 
  Users,
  BarChart3,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Smartphone
} from 'lucide-react';

// Images
import heroConstructionTeam from '../../assets/images/homepage/hero-construction-team.jpg';
import dashboardInterface from '../../assets/images/homepage/dashboard-interface.jpg';
import collaborativeProjectManagement from '../../assets/images/homepage/collaborative-project-management.jpg';
import satisfiedCustomer from '../../assets/images/homepage/satisfied-customer.jpg';

const PMESolution: React.FC = () => {
  const painPoints = [
    {
      problem: 'Vous gérez 3 à 15 chantiers en même temps',
      solution: 'Un tableau de bord unique pour tout voir d\'un coup d\'œil'
    },
    {
      problem: 'Vos devis prennent des heures à faire',
      solution: 'Bibliothèque de prix + calculs automatiques = devis en 10 min'
    },
    {
      problem: 'Vous ne savez pas où sont vos équipes',
      solution: 'Suivi GPS temps réel de chaque collaborateur'
    },
    {
      problem: 'Les clients paient en retard',
      solution: 'Relances automatiques + paiement Mobile Money instantané'
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard multi-projets',
      description: 'Suivez tous vos chantiers sur un seul écran avec alertes automatiques.'
    },
    {
      icon: FileText,
      title: 'Devis professionnels',
      description: 'Créez des devis en 10 minutes avec votre bibliothèque de prix.'
    },
    {
      icon: Users,
      title: 'Gestion d\'équipe',
      description: 'Assignez les tâches, suivez les présences, communiquez facilement.'
    },
    {
      icon: Calendar,
      title: 'Planning Gantt',
      description: 'Planifiez vos chantiers visuellement avec dépendances.'
    },
    {
      icon: MapPin,
      title: 'Suivi GPS',
      description: 'Localisez vos équipes en temps réel sur le terrain.'
    },
    {
      icon: DollarSign,
      title: 'Mobile Money',
      description: 'Acceptez Orange Money, MTN, Wave directement.'
    }
  ];

  const testimonial = {
    name: 'Mamadou Diop',
    role: 'Gérant, Diop Construction',
    company: '12 employés • Dakar, Sénégal',
    content: 'Avant IntuitionConcept, je passais mes soirées à faire des devis et mes week-ends à courir après les équipes. Maintenant, je gère 8 chantiers sereinement et je rentre dîner avec ma famille.',
    metric: '8 chantiers gérés • 15h gagnées/semaine',
    avatar: satisfiedCustomer
  };

  const pricing = {
    name: 'Plan PME',
    price: '25,000',
    currency: 'FCFA',
    period: '/mois',
    features: [
      'Jusqu\'à 20 utilisateurs',
      'Projets illimités',
      'Devis et facturation',
      'Planning Gantt',
      'Suivi GPS équipes',
      'Mobile Money intégré',
      'Support prioritaire',
      'Formation incluse'
    ]
  };

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="PME BTP" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-purple-900/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <span className="inline-block px-4 py-2 bg-blue-500/30 rounded-full text-sm font-medium mb-6">
              Solution PME • 5 à 50 employés
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Vous gérez plusieurs chantiers ?
              <span className="text-yellow-400"> Reprenez le contrôle.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Votre quotidien : 5 à 15 chantiers en parallèle, des équipes sur le terrain, 
              des devis à envoyer, des paiements à suivre. On connaît. On a la solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Essayer 14 jours gratuit <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Demander une démo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              On connaît vos défis quotidiens
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {painPoints.map((item, index) => (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <p className="text-red-500 font-medium mb-3 flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  {item.problem}
                </p>
                <p className="text-green-600 font-medium flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
              Les outils dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Tout est pensé pour les PME du BTP
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Un tableau de bord fait pour vous
              </h2>
              <p className="text-gray-600 mb-6">
                Tous vos chantiers, équipes et finances sur un seul écran. 
                Plus besoin de jongler entre Excel, WhatsApp et les appels.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Vue d'ensemble de tous vos projets
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Alertes automatiques sur les retards
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Suivi budgétaire en temps réel
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Accessible sur mobile et tablette
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <img 
                src={dashboardInterface} 
                alt="Dashboard PME" 
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl">
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

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 text-lg italic mb-4">
                "{testimonial.content}"
              </p>

              <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-full inline-block">
                {testimonial.metric}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">{pricing.price}</span>
                <span className="text-blue-200"> {pricing.currency}{pricing.period}</span>
              </div>

              <ul className="space-y-3 text-left mb-8">
                {pricing.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Commencer l'essai gratuit
                </motion.button>
              </Link>

              <p className="text-blue-200 text-sm mt-4">
                14 jours gratuits • Sans carte bancaire
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Prêt à simplifier la gestion de votre PME ?
            </h2>
            <p className="text-gray-400 mb-8">
              Rejoignez les 400+ PME qui utilisent IntuitionConcept
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold"
                >
                  Essayer gratuitement
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold"
                >
                  Parler à un conseiller
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default PMESolution;

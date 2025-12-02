import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
import PageMeta from '../components/SEO/PageMeta';
import ROICalculator from '../components/Homepage/ROICalculator';
import UseCases from '../components/Homepage/UseCases';
import CompetitorComparison from '../components/Homepage/CompetitorComparison';
import VideoTestimonials from '../components/Homepage/VideoTestimonials';
import VideoDemo from '../components/Homepage/VideoDemo';

// Images
import heroConstructionTeam from '../assets/images/homepage/hero-construction-team.jpg';
import dashboardInterface from '../assets/images/homepage/dashboard-interface.jpg';
import collaborativeProjectManagement from '../assets/images/homepage/collaborative-project-management.jpg';
import intelligentQuoteSystem from '../assets/images/homepage/intelligent-quote-system.jpg';
import aiOcrProcessing from '../assets/images/homepage/ai-ocr-processing.jpg';
import teamGpsTracking from '../assets/images/homepage/team-gps-tracking.jpg';
import trainingSupport from '../assets/images/homepage/training-support.jpg';
import mobileMoneyPayment from '../assets/images/homepage/mobile-money-payment.jpg';
import satisfiedCustomer from '../assets/images/homepage/satisfied-customer.jpg';
import digitalConstructionTeam from '../assets/images/homepage/digital-construction-team.jpg';
import performanceMetric from '../assets/images/homepage/performance-metric.jpg';
import africanUrbanConstruction from '../assets/images/homepage/african-urban-construction.jpg';
import infrastructureProject from '../assets/images/homepage/infrastructure-project.jpg';

import {
  ArrowRight,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Star,
  CheckCircle,
  TrendingUp,
  Award,
  ChevronRight,
  MapPin,
  DollarSign,
  Truck,
  PieChart,
  ClipboardList,
  Clock,
  Phone,
  MessageCircle,
  Wifi
} from 'lucide-react';

const UltraModernHomePage: React.FC = () => {
  // Features avec images - wording métier, pas tech
  const features = [
    {
      icon: BarChart3,
      title: 'Pilotez tous vos chantiers',
      description: 'Un tableau de bord clair pour suivre l\'avancement, les budgets et les équipes en un coup d\'œil.',
      color: 'from-blue-500 to-cyan-500',
      image: dashboardInterface
    },
    {
      icon: FileText,
      title: 'Devis en 3 clics',
      description: 'Créez des devis professionnels rapidement avec votre bibliothèque de prix intégrée.',
      color: 'from-green-500 to-emerald-500',
      image: intelligentQuoteSystem
    },
    {
      icon: Calendar,
      title: 'Planning visuel',
      description: 'Planifiez vos chantiers avec des diagrammes Gantt simples et intuitifs.',
      color: 'from-indigo-500 to-blue-500',
      image: collaborativeProjectManagement
    },
    {
      icon: MapPin,
      title: 'Équipes sur le terrain',
      description: 'Localisez vos équipes en temps réel et optimisez les déplacements.',
      color: 'from-teal-500 to-cyan-500',
      image: teamGpsTracking
    },
    {
      icon: DollarSign,
      title: 'Paiements Mobile Money',
      description: 'Acceptez Orange Money, MTN, Wave directement dans l\'application.',
      color: 'from-yellow-500 to-orange-500',
      image: mobileMoneyPayment
    },
    {
      icon: ClipboardList,
      title: 'Rapports de chantier',
      description: 'Générez des rapports quotidiens avec photos et suivi d\'avancement.',
      color: 'from-cyan-500 to-blue-500',
      image: africanUrbanConstruction
    },
    {
      icon: Truck,
      title: 'Gestion du matériel',
      description: 'Suivez vos équipements, planifiez la maintenance, évitez les pannes.',
      color: 'from-gray-500 to-slate-500',
      image: infrastructureProject
    },
    {
      icon: PieChart,
      title: 'Suivi financier',
      description: 'Analysez la rentabilité par projet et anticipez les dépassements.',
      color: 'from-emerald-500 to-green-500',
      image: performanceMetric
    },
    {
      icon: Users,
      title: 'Gestion d\'équipe',
      description: 'Assignez les tâches, suivez les présences, communiquez facilement.',
      color: 'from-pink-500 to-rose-500',
      image: collaborativeProjectManagement
    }
  ];

  // Témoignages authentiques - verbatims courts
  const testimonials = [
    {
      name: 'Saliou Mbaye',
      role: 'Gérant, BTP Thiès',
      country: 'Sénégal',
      content: 'Je gère 8 chantiers sans stress. Avant, c\'était le chaos.',
      rating: 5,
      avatar: satisfiedCustomer,
      metric: '8 chantiers gérés'
    },
    {
      name: 'Adjoua Kouamé',
      role: 'Directrice, Construction CI',
      country: 'Côte d\'Ivoire',
      content: 'Les devis automatiques me font gagner 10h par semaine.',
      rating: 5,
      avatar: satisfiedCustomer,
      metric: '10h gagnées/semaine'
    },
    {
      name: 'Moussa Traoré',
      role: 'Chef de projet, Bamako BTP',
      country: 'Mali',
      content: 'Le mode hors-ligne est parfait pour nos chantiers en zone rurale.',
      rating: 5,
      avatar: satisfiedCustomer,
      metric: 'Fonctionne partout'
    }
  ];

  // Chiffres réalistes
  const stats = [
    { number: '850+', label: 'Entreprises utilisatrices', icon: Users },
    { number: '12', label: 'Pays en Afrique', icon: MapPin },
    { number: '15,000+', label: 'Projets gérés', icon: BarChart3 },
    { number: '24h', label: 'Réponse support', icon: Clock }
  ];

  // Problématiques terrain
  const challenges = [
    { problem: 'Retards de chantier', solution: 'Planning visuel et alertes automatiques' },
    { problem: 'Dépassements de budget', solution: 'Suivi financier temps réel' },
    { problem: 'Documents perdus', solution: 'Tout centralisé dans l\'application' },
    { problem: 'Équipes non joignables', solution: 'Suivi GPS et chat intégré' }
  ];

  return (
    <GlobalLayout showHero={false}>
      <PageMeta 
        title="Gestion BTP pour l'Afrique Francophone"
        description="IntuitionConcept - Logiciel de gestion BTP tout-en-un. Devis, factures, suivi chantier, paiements Mobile Money. Essai gratuit 14 jours."
        keywords="BTP, gestion chantier, devis, facture, Sénégal, Afrique, construction, artisan, PME, Mobile Money"
      />
      {/* Hero Section - Cas client */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Équipe de construction" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-900/95"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-white"
          >
            {/* Cas client en accroche */}
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium mb-6">
                Témoignage client
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                "Comment Saliou gère 
                <span className="text-yellow-400"> 8 chantiers</span> au Sénégal 
                sans perdre le sommeil"
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                PME de 12 personnes à Thiès. Avant IntuitionConcept : retards, budgets dépassés, 
                documents perdus. Aujourd'hui : tout est sous contrôle.
              </p>
            </div>

            {/* CTA multiples */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Essayer gratuitement 14 jours <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Demander une démo <ChevronRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <a href="https://wa.me/221771234567" target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-green-500 rounded-xl font-bold text-lg hover:bg-green-600 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </motion.button>
              </a>
            </div>

            <p className="text-blue-200 text-sm">
              Sans carte bancaire • Paiement Mobile Money accepté • Support en français
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl text-white"
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold">{stat.number}</div>
                  <div className="text-blue-200 text-xs">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Problématiques terrain */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Les défis du BTP en Afrique, on connaît
            </h2>
            <p className="text-xl text-gray-600">
              Après 15 ans sur les chantiers, on a créé l'outil qu'on aurait aimé avoir
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {challenges.map((item, index) => (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <p className="text-red-500 font-medium mb-2 line-through">{item.problem}</p>
                <p className="text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {item.solution}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo */}
      <VideoDemo />

      {/* Features Section - wording métier */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              La suite d'outils pensée pour vos réalités
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Devis, suivi terrain, finance, équipes, Mobile Money... 
              Tout ce dont vous avez besoin pour piloter vos chantiers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`}></div>
                    <div className="absolute bottom-3 left-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <Icon className="w-5 h-5 text-gray-800" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Voir toutes les fonctionnalités <ArrowRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Différenciateurs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Money natif</h3>
              <p className="text-gray-600">
                Orange Money, MTN, Wave, Airtel... Paiements intégrés sans configuration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mode hors-ligne</h3>
              <p className="text-gray-600">
                Travaillez sans internet, synchronisation automatique au retour.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support local</h3>
              <p className="text-gray-600">
                Équipe francophone à Dakar, Abidjan, Douala. Réponse sous 24h.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <UseCases />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Competitor Comparison */}
      <CompetitorComparison />

      {/* Témoignages */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Des professionnels du BTP comme vous
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{testimonial.name}</h3>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    <p className="text-gray-400 text-xs">{testimonial.country}</p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 font-medium mb-3">"{testimonial.content}"</p>
                
                <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full inline-block">
                  {testimonial.metric}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <VideoTestimonials />

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Notre mission : digitaliser le BTP en Afrique
            </h2>
            <p className="text-gray-600 mb-6">
              Créé par des professionnels du BTP, pour des professionnels du BTP. 
              Notre équipe est présente à Dakar, Abidjan, Douala et Paris pour vous accompagner.
            </p>
            <Link to="/about">
              <span className="text-blue-600 font-medium hover:underline">
                En savoir plus sur notre histoire →
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={digitalConstructionTeam} 
            alt="Équipe digitale" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez les 850+ entreprises qui utilisent IntuitionConcept 
              pour piloter leurs chantiers sereinement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-10 py-5 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg shadow-xl"
                >
                  Essayer gratuitement <ArrowRight className="inline w-6 h-6 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-10 py-5 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Parler à un conseiller
                </motion.button>
              </Link>
            </div>
            <p className="mt-6 text-blue-200 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              14 jours gratuits • Sans engagement • Support en français
            </p>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default UltraModernHomePage;

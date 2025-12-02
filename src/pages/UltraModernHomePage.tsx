import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
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
  Zap,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Smartphone,
  Shield,
  Globe,
  Star,
  CheckCircle,
  TrendingUp,
  Award,
  Heart,
  ChevronRight,
  Brain,
  MapPin,
  GraduationCap,
  DollarSign,
  Sparkles,
  Euro,
  Truck,
  Hammer,
  PieChart,
  ClipboardList
} from 'lucide-react';

const UltraModernHomePage: React.FC = () => {
  // Features avec images
  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Intelligent',
      description: 'Vue d\'ensemble temps réel avec KPIs automatiques et rapports personnalisables.',
      color: 'from-blue-500 to-cyan-500',
      image: dashboardInterface
    },
    {
      icon: Brain,
      title: 'Analyseur de Plans IA',
      description: 'Uploadez vos plans d\'architecture, notre IA génère automatiquement un devis détaillé.',
      color: 'from-purple-500 to-pink-500',
      image: aiOcrProcessing
    },
    {
      icon: Sparkles,
      title: 'Rendus 3D Automatiques',
      description: 'Visualisations 3D réalistes générées par IA à partir de vos plans architecturaux.',
      color: 'from-orange-500 to-red-500',
      image: digitalConstructionTeam
    },
    {
      icon: FileText,
      title: 'Devis Intelligents',
      description: 'Créez des devis professionnels avec calculs automatiques et bibliothèque de prix.',
      color: 'from-green-500 to-emerald-500',
      image: intelligentQuoteSystem
    },
    {
      icon: Calendar,
      title: 'Planning Gantt',
      description: 'Diagrammes Gantt interactifs avec dépendances et suivi d\'avancement.',
      color: 'from-indigo-500 to-blue-500',
      image: collaborativeProjectManagement
    },
    {
      icon: MapPin,
      title: 'Suivi GPS Équipes',
      description: 'Géolocalisation temps réel de vos équipes sur le terrain.',
      color: 'from-teal-500 to-cyan-500',
      image: teamGpsTracking
    },
    {
      icon: DollarSign,
      title: 'Mobile Money Intégré',
      description: 'Paiements Orange Money, MTN Money, Airtel Money acceptés nativement.',
      color: 'from-yellow-500 to-orange-500',
      image: mobileMoneyPayment
    },
    {
      icon: Truck,
      title: 'Gestion Équipements',
      description: 'Suivi du matériel, maintenance préventive et planification.',
      color: 'from-gray-500 to-slate-500',
      image: infrastructureProject
    },
    {
      icon: Users,
      title: 'Gestion d\'Équipe',
      description: 'Assignation de tâches, collaboration et communication en temps réel.',
      color: 'from-pink-500 to-rose-500',
      image: collaborativeProjectManagement
    },
    {
      icon: PieChart,
      title: 'Analyses Financières',
      description: 'Suivi budgétaire détaillé, rentabilité par projet et prévisions.',
      color: 'from-emerald-500 to-green-500',
      image: performanceMetric
    },
    {
      icon: ClipboardList,
      title: 'Rapports Chantier',
      description: 'Rapports quotidiens avec photos, incidents et avancement.',
      color: 'from-cyan-500 to-blue-500',
      image: africanUrbanConstruction
    },
    {
      icon: GraduationCap,
      title: 'Formation & Support',
      description: 'Support 24/7 en français et formation personnalisée.',
      color: 'from-amber-500 to-yellow-500',
      image: trainingSupport
    }
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'CEO, TechStart Dakar',
      country: 'Sénégal 🇸🇳',
      content: 'IntuitionConcept a révolutionné notre façon de gérer les projets. Les paiements Mobile Money sont un game-changer pour nos clients.',
      rating: 5,
      avatar: satisfiedCustomer
    },
    {
      name: 'Jean-Baptiste Kouame',
      role: 'Directeur IT, InnovCorp',
      country: 'Côte d\'Ivoire 🇨🇮',
      content: 'Une plateforme pensée pour l\'Afrique ! L\'interface en français et les devises locales facilitent l\'adoption par nos équipes.',
      rating: 5,
      avatar: satisfiedCustomer
    },
    {
      name: 'Fatima El Mansouri',
      role: 'Chef de Projet, DigitalMa',
      country: 'Maroc 🇲🇦',
      content: 'Excellent outil pour coordonner nos équipes multi-pays. Le support client comprend vraiment nos besoins spécifiques.',
      rating: 5,
      avatar: satisfiedCustomer
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Utilisateurs Actifs', icon: Users },
    { number: '25+', label: 'Pays Couverts', icon: Globe },
    { number: '50,000+', label: 'Projets Gérés', icon: BarChart3 },
    { number: '99.9%', label: 'Temps de Disponibilité', icon: TrendingUp }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero Section avec image de fond */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Équipe de construction" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/85 to-indigo-900/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto text-white"
          >
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base font-semibold">
                🤖 IA Intégrée
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base font-semibold">
                🏗️ Rendus 3D
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base font-semibold">
                💳 Mobile Money
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base font-semibold">
                📍 GPS Temps Réel
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              La Plateforme
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> BTP & Construction</span>
              <br />N°1 en Afrique
            </h1>

            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Gérez vos projets de construction avec l'Intelligence Artificielle. 
              Analyse de plans, devis automatiques, rendus 3D et paiements Mobile Money intégrés.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Commencer Gratuitement <ArrowRight className="inline w-6 h-6 ml-2" />
                </motion.button>
              </Link>
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Voir les Tarifs <ChevronRight className="inline w-6 h-6 ml-2" />
                </motion.button>
              </Link>
            </div>

            <p className="text-blue-200">
              🎁 Essai gratuit 14 jours • Sans engagement • 💳 Mobile Money accepté
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl text-white"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                  <div className="text-3xl font-bold">{stat.number}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Video Demo */}
      <VideoDemo />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Features Section avec images */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              +30 Fonctionnalités
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Puissantes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils pour gérer vos projets de construction de A à Z
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
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`}></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <UseCases />

      {/* Competitor Comparison */}
      <CompetitorComparison />

      {/* Video Testimonials */}
      <VideoTestimonials />

      {/* Text Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Award className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ils Nous Font
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"> Confiance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que disent nos clients à travers l'Afrique
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.country}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/90 to-indigo-900/95"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Zap className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Prêt à Transformer Votre Entreprise ?
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Rejoignez des milliers d'entreprises africaines qui utilisent IntuitionConcept 
              pour gérer leurs projets de construction
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-xl shadow-2xl"
              >
                Commencer Maintenant <ArrowRight className="inline w-7 h-7 ml-2" />
              </motion.button>
            </Link>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-blue-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Essai gratuit de 14 jours • Aucune carte de crédit requise</span>
            </motion.p>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default UltraModernHomePage;

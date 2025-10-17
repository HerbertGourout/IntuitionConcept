import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
// Nouveaux composants Homepage
import ROICalculator from '../components/Homepage/ROICalculator';
import UseCases from '../components/Homepage/UseCases';
import CompetitorComparison from '../components/Homepage/CompetitorComparison';
import VideoTestimonials from '../components/Homepage/VideoTestimonials';
import VideoDemo from '../components/Homepage/VideoDemo';
// Images d'illustration de la page d'accueil
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
  Play,
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
  ShoppingCart,
  Bell,
  AlertTriangle,
  FileImage,
  Mic,
  LineChart,
  FileCheck,
  PenTool,
  Plug,
  ClipboardList
} from 'lucide-react';

const UltraModernHomePage: React.FC = () => {
  // Organisation par catégories pour les 30 fonctionnalités
  const featureCategories = [
    {
      category: '🏗️ Gestion de Projets',
      features: [
        {
          icon: BarChart3,
          title: 'Dashboard Intelligent',
          description: 'Vue d\'ensemble temps réel avec KPIs automatiques',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          icon: FileText,
          title: 'Gestion Projets BTP',
          description: 'Créer et gérer tous vos chantiers et projets',
          color: 'from-indigo-500 to-blue-500'
        },
        {
          icon: Euro,
          title: 'Budget Projet',
          description: 'Suivi budgétaire détaillé par projet et phase',
          color: 'from-green-500 to-emerald-500'
        },
        {
          icon: Hammer,
          title: 'Gestion Tâches',
          description: 'Organiser et suivre les tâches de chantier',
          color: 'from-purple-500 to-pink-500'
        },
        {
          icon: Calendar,
          title: 'Planning Gantt',
          description: 'Diagrammes Gantt drag & drop avec dépendances',
          color: 'from-orange-500 to-red-500'
        },
        {
          icon: ClipboardList,
          title: 'Rapports Chantier',
          description: 'Rapports quotidiens et suivi d\'avancement',
          color: 'from-cyan-500 to-blue-500'
        }
      ]
    },
    {
      category: '💰 Gestion Financière',
      features: [
        {
          icon: PieChart,
          title: 'Finances Complètes',
          description: 'Analyse financière, trésorerie et fournisseurs',
          color: 'from-emerald-500 to-teal-500'
        },
        {
          icon: DollarSign,
          title: 'Devis BTP',
          description: 'Création de devis métré professionnels',
          color: 'from-green-500 to-emerald-500'
        },
        {
          icon: ShoppingCart,
          title: 'Bons d\'Achat',
          description: 'Gestion commandes et bons de livraison',
          color: 'from-orange-500 to-amber-500'
        },
        {
          icon: Smartphone,
          title: 'Paiements Mobile Money',
          description: 'Orange, MTN, Moov - Paiements instantanés',
          color: 'from-green-500 to-lime-500'
        },
        {
          icon: TrendingUp,
          title: 'Transactions',
          description: 'Dashboard complet des transactions',
          color: 'from-blue-500 to-indigo-500'
        }
      ]
    },
    {
      category: '👥 Gestion d\'Équipe',
      features: [
        {
          icon: Users,
          title: 'Équipe Chantier',
          description: 'Gestion complète des ouvriers et équipes',
          color: 'from-violet-500 to-purple-500'
        },
        {
          icon: MapPin,
          title: 'Géolocalisation GPS',
          description: 'Suivi temps réel des équipes sur chantier',
          color: 'from-red-500 to-orange-500'
        },
        {
          icon: Bell,
          title: 'Centre Notifications',
          description: 'Notifications temps réel et alertes',
          color: 'from-blue-500 to-cyan-500'
        }
      ]
    },
    {
      category: '🏭 Gestion Matériel',
      features: [
        {
          icon: Truck,
          title: 'Équipements',
          description: 'Suivi matériel et maintenance prédictive',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          icon: FileText,
          title: 'Documents',
          description: 'Stockage cloud sécurisé et versioning',
          color: 'from-indigo-500 to-purple-500'
        }
      ]
    },
    {
      category: '🤖 Intelligence Artificielle',
      features: [
        {
          icon: Brain,
          title: 'Devis IA Automatique',
          description: 'Génération automatique avec Claude 3.5',
          color: 'from-purple-500 to-pink-500',
          badge: 'Premium'
        },
        {
          icon: Sparkles,
          title: 'Scanner OCR IA',
          description: 'Extraction factures, bons, contrats',
          color: 'from-violet-500 to-purple-500',
          badge: 'Premium'
        },
        {
          icon: FileImage,
          title: 'Analyse Plans Architecture',
          description: 'Extraction surfaces et métrés automatique',
          color: 'from-indigo-500 to-blue-500',
          badge: 'Premium'
        },
        {
          icon: AlertTriangle,
          title: 'Détection Anomalies',
          description: 'Alertes budget, délais et qualité',
          color: 'from-red-500 to-orange-500',
          badge: 'Premium'
        },
        {
          icon: FileCheck,
          title: 'Générateur Plans Projet',
          description: 'Plans de projet détaillés par IA',
          color: 'from-cyan-500 to-blue-500',
          badge: 'Premium'
        },
        {
          icon: Mic,
          title: 'Copilot Vocal IA',
          description: 'Commandes vocales sur chantier',
          color: 'from-pink-500 to-rose-500',
          badge: 'Enterprise'
        },
        {
          icon: LineChart,
          title: 'Analytics Prédictifs',
          description: 'Prédictions coûts, délais, risques',
          color: 'from-blue-500 to-indigo-500',
          badge: 'Enterprise'
        },
        {
          icon: BarChart3,
          title: 'Rapports Auto IA',
          description: 'Génération rapports exécutifs',
          color: 'from-emerald-500 to-teal-500',
          badge: 'Enterprise'
        },
        {
          icon: Sparkles,
          title: 'Rendus 3D IA',
          description: 'Rendus photoréalistes avec ControlNet',
          color: 'from-pink-500 to-rose-500',
          badge: 'Premium'
        }
      ]
    },
    {
      category: '⚙️ Automatisation & Intégrations',
      features: [
        {
          icon: Zap,
          title: 'Automatisations n8n',
          description: 'Workflows automatisés et webhooks',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          icon: Plug,
          title: 'API & Intégrations',
          description: 'Connexions ERP, comptabilité, banques',
          color: 'from-purple-500 to-indigo-500',
          badge: 'Enterprise'
        },
        {
          icon: PenTool,
          title: 'Signatures Électroniques',
          description: 'Validation documents conformité légale',
          color: 'from-blue-500 to-cyan-500',
          badge: 'Enterprise'
        }
      ]
    },
    {
      category: '🛡️ Sécurité & Support',
      features: [
        {
          icon: Shield,
          title: 'Sécurité Maximale',
          description: 'SSL, 2FA, sauvegardes auto, RGPD',
          color: 'from-gray-500 to-slate-500'
        },
        {
          icon: GraduationCap,
          title: 'Formation & Support',
          description: 'Support 24/7 et formation personnalisée',
          color: 'from-yellow-500 to-amber-500'
        },
        {
          icon: Heart,
          title: 'Centre Support',
          description: 'Tickets et assistance temps réel',
          color: 'from-rose-500 to-pink-500'
        }
      ]
    }
  ];

  // Features principales pour l'affichage détaillé (top 12)
  const features = [
    {
      icon: BarChart3,
      title: 'Gestion de Projets Intelligente',
      description: 'Dashboard moderne avec suivi en temps réel, KPIs automatiques et rapports personnalisables.',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1,
      image: dashboardInterface
    },
    {
      icon: Users,
      title: 'Collaboration d\'Équipe',
      description: 'Chat intégré, partage de fichiers, notifications push et gestion des permissions avancée.',
      color: 'from-purple-500 to-pink-500',
      delay: 0.2,
      image: collaborativeProjectManagement
    },
    {
      icon: DollarSign,
      title: 'Devis Intelligents IA',
      description: 'Génération automatique de devis à partir de plans PDF avec IA Claude 3.5 Sonnet.',
      color: 'from-emerald-500 to-teal-500',
      delay: 0.3,
      image: intelligentQuoteSystem
    },
    {
      icon: Brain,
      title: 'OCR & Analyse IA',
      description: 'Extraction automatique de données depuis plans, factures et documents avec Tesseract OCR.',
      color: 'from-violet-500 to-purple-500',
      delay: 0.4,
      image: aiOcrProcessing
    },
    {
      icon: MapPin,
      title: 'Géolocalisation GPS',
      description: 'Suivi en temps réel des équipes sur chantier avec historique et zones de travail.',
      color: 'from-red-500 to-orange-500',
      delay: 0.5,
      image: teamGpsTracking
    },
    {
      icon: Smartphone,
      title: 'Paiements Mobile Money',
      description: 'Orange Money, MTN Money, Moov Money - Paiements instantanés et sécurisés.',
      color: 'from-green-500 to-emerald-500',
      delay: 0.6,
      image: mobileMoneyPayment
    },
    {
      icon: GraduationCap,
      title: 'Formation & Support',
      description: 'Tutoriels vidéo, documentation complète et support client réactif en français.',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.7,
      image: trainingSupport
    },
    {
      icon: Calendar,
      title: 'Planning Gantt Interactif',
      description: 'Diagrammes de Gantt drag & drop, dépendances de tâches et alertes automatiques.',
      color: 'from-orange-500 to-red-500',
      delay: 0.8,
      image: performanceMetric
    },
    {
      icon: FileText,
      title: 'Gestion Documentaire',
      description: 'Stockage cloud sécurisé, versioning automatique et recherche intelligente.',
      color: 'from-indigo-500 to-blue-500',
      delay: 0.9,
      image: digitalConstructionTeam
    },
    {
      icon: Sparkles,
      title: 'Rendus 3D IA (Nouveau)',
      description: 'Génération de rendus 3D photoréalistes à partir de plans 2D avec ControlNet.',
      color: 'from-pink-500 to-rose-500',
      delay: 1.0,
      image: africanUrbanConstruction
    },
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Chiffrement SSL, authentification 2FA, sauvegardes automatiques et conformité RGPD.',
      color: 'from-gray-500 to-slate-500',
      delay: 1.1,
      image: infrastructureProject
    },
    {
      icon: Heart,
      title: 'Satisfaction Client',
      description: 'Support 24/7, formation personnalisée et accompagnement à chaque étape.',
      color: 'from-rose-500 to-pink-500',
      delay: 1.2,
      image: satisfiedCustomer
    }
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'CEO, TechStart Dakar',
      country: 'Sénégal 🇸🇳',
      content: 'IntuitionConcept a révolutionné notre façon de gérer les projets. Les paiements Mobile Money sont un game-changer pour nos clients.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Jean-Baptiste Kouame',
      role: 'Directeur IT, InnovCorp',
      country: 'Côte d\'Ivoire 🇨🇮',
      content: 'Une plateforme pensée pour l\'Afrique ! L\'interface en français et les devises locales facilitent l\'adoption par nos équipes.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Fatima El Mansouri',
      role: 'Chef de Projet, DigitalMa',
      country: 'Maroc 🇲🇦',
      content: 'Excellent outil pour coordonner nos équipes multi-pays. Le support client comprend vraiment nos besoins spécifiques.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Utilisateurs Actifs', icon: Users },
    { number: '25+', label: 'Pays Couverts', icon: Globe },
    { number: '50,000+', label: 'Projets Gérés', icon: BarChart3 },
    { number: '99.9%', label: 'Temps de Disponibilité', icon: TrendingUp }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <GlobalLayout showHero={false}>
      {/* Hero Section avec Image de Fond */}
      <section className="relative min-h-[750px] md:min-h-[850px] flex items-center justify-center overflow-hidden">
        {/* Image de fond Hero */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroConstructionTeam}
            alt="Équipe BTP sur chantier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Contenu Hero */}
        <div className="relative z-10 container mx-auto px-6 py-32 md:py-40 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
              Gérez Vos Projets BTP
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                avec Intelligence Artificielle
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed">
              La plateforme SaaS la plus complète pour le BTP en Afrique. 
              Devis IA, Rendus 3D, Mobile Money, GPS et bien plus !
            </p>
            
            {/* Badges de fonctionnalités */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base md:text-lg font-semibold">
                🤖 IA Claude 3.5
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base md:text-lg font-semibold">
                🎨 Rendus 3D
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base md:text-lg font-semibold">
                💳 Mobile Money
              </span>
              <span className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-base md:text-lg font-semibold">
                📍 GPS Temps Réel
              </span>
            </div>

            {/* Boutons CTA */}
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                >
                  <span>Commencer Gratuitement</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>Voir la Démo</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.6, type: "spring" }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  {stat.number}
                </motion.div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Section Fonctionnalités */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fonctionnalités
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Puissantes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les outils qui transformeront votre façon de gérer les projets
            </p>
          </motion.div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
              >
                {/* Image Section */}
                <motion.div 
                  className="w-full lg:w-1/2 relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    {/* Image principale */}
                    {('image' in feature && feature.image) ? (
                      <motion.img
                        src={feature.image as string}
                        alt={feature.title}
                        className="w-full h-[400px] object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : null}
                    
                    {/* Overlay gradient au hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20`}
                    />
                    
                    {/* Badge flottant avec icône */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.4,
                        type: "spring",
                        stiffness: 200
                      }}
                      className={`absolute top-6 ${index % 2 === 0 ? 'left-6' : 'right-6'} w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Effet de lueur */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10`} />
                </motion.div>

                {/* Content Section */}
                <motion.div 
                  className="w-full lg:w-1/2 space-y-6"
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  {/* Numéro de fonctionnalité */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`inline-block px-4 py-2 bg-gradient-to-r ${feature.color} text-white rounded-full text-sm font-bold`}
                  >
                    Fonctionnalité {index + 1}/12
                  </motion.div>
                  
                  {/* Titre */}
                  <motion.h3 
                    className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  {/* Description */}
                  <motion.p 
                    className="text-lg text-gray-700 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${feature.color} text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300`}
                  >
                    <span>Découvrir</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Toutes les 30 Fonctionnalités */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">30 Fonctionnalités</span>
              {' '}Complètes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La plateforme BTP la plus complète d'Afrique avec 6 modules IA avancés
            </p>
          </motion.div>

          {/* Grille des catégories */}
          <div className="space-y-16">
            {featureCategories.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Titre de catégorie */}
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="mr-3">{category.category}</span>
                  <div className="flex-1 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                </h3>

                {/* Grille des fonctionnalités */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: featureIndex * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                      >
                        {/* Badge Premium/Enterprise */}
                        {feature.badge && (
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                            feature.badge === 'Enterprise' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {feature.badge}
                          </div>
                        )}

                        {/* Icône avec gradient */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                          <FeatureIcon className="w-7 h-7 text-white" />
                        </div>

                        {/* Titre */}
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Effet de lueur au hover */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA après les fonctionnalités */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <span>Voir les Plans & Tarifs</span>
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </Link>
            <p className="mt-4 text-gray-600">
              🎁 Essai gratuit 14 jours • 🚀 Sans engagement • 💳 Mobile Money accepté
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🎬 NOUVEAU : Vidéo Démo */}
      <VideoDemo />

      {/* 💰 NOUVEAU : Calculateur ROI */}
      <ROICalculator />

      {/* 🎯 NOUVEAU : Cas d'Usage */}
      <UseCases />

      {/* ⚖️ NOUVEAU : Comparateur Concurrents */}
      <CompetitorComparison />

      {/* 🎥 NOUVEAU : Témoignages Vidéo */}
      <VideoTestimonials />

      {/* Section Témoignages (Texte) */}
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
              Découvrez ce que disent nos clients à travers le monde
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Étoiles */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.1, duration: 0.3 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center space-x-4">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* (Section Interface Moderne supprimée car images non souhaitées) */}

      {/* Section CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Animations de fond */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Prêt à Transformer
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Vos Projets ?</span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Rejoignez des milliers d'entreprises qui font confiance à IntuitionConcept 
              pour gérer leurs projets et développer leur activité.
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                >
                  <span>Commencer Maintenant</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/pricing"
                  className="bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-3"
                >
                  <span>Voir les Tarifs</span>
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-blue-200 mt-8 flex items-center justify-center space-x-2"
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

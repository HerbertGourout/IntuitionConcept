import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
import {
  ArrowRight,
  Zap,
  Users,
  FileText,
  Shield,
  Globe,
  Star,
  CheckCircle,
  Heart,
  Play,
  ChevronRight,
  Eye,
  Cpu,
  Target,
  DollarSign,
  Sparkles,
  Truck,
  BarChart3
} from 'lucide-react';

const ModernHomePage: React.FC = () => {

  // Fonctionnalités IA réellement implémentées
  const revolutionaryFeatures = [
    {
      icon: Cpu,
      title: "Analyseur de Plans Architecturaux IA",
      subtitle: "Transformation automatique plans → devis",
      description: "Uploadez vos plans d'architecture, notre IA extrait automatiquement les surfaces, pièces, métrés et génère un devis détaillé prêt à envoyer.",
      impact: "Devis générés 10x plus vite",
      color: "from-blue-600 to-cyan-600",
      category: "Automatisation IA"
    },
    {
      icon: Eye,
      title: "Détection d'Anomalies IA",
      subtitle: "Surveillance intelligente des projets",
      description: "Analyse automatique des données projet pour détecter les anomalies, retards potentiels et problèmes de qualité avant qu'ils ne deviennent critiques.",
      impact: "Prévention proactive des problèmes",
      color: "from-red-600 to-orange-600",
      category: "IA Prédictive"
    },
    {
      icon: FileText,
      title: "OCR Intelligent",
      subtitle: "Numérisation intelligente de documents",
      description: "Scannez et analysez automatiquement factures, devis, plans et documents BTP. Extraction automatique des données importantes.",
      impact: "Traitement documents 5x plus rapide",
      color: "from-purple-600 to-indigo-600",
      category: "IA Document"
    },
    {
      icon: Zap,
      title: "Hub d'Automatisation",
      subtitle: "Workflows intelligents personnalisés",
      description: "Créez des automatisations sur mesure pour vos processus métier : notifications, rapports, suivi, intégrations avec vos outils existants.",
      impact: "Automatisation complète des tâches",
      color: "from-green-600 to-emerald-600",
      category: "Automatisation"
    },
    {
      icon: Users,
      title: "Copilot IA Vocal",
      subtitle: "Assistant vocal intelligent pour le BTP",
      description: "Contrôlez votre plateforme par la voix : créez des devis, recherchez des prix, ajoutez des tâches. Interface mains libres pour le terrain.",
      impact: "Productivité terrain +40%",
      color: "from-pink-600 to-rose-600",
      category: "Interface Vocale"
    },
    {
      icon: Sparkles,
      title: "Générateur de Devis IA",
      subtitle: "Création automatique de devis par IA",
      description: "Décrivez votre projet en langage naturel, l'IA génère automatiquement un devis complet avec phases, matériaux et main d'œuvre.",
      impact: "Devis générés en 2 minutes",
      color: "from-indigo-600 to-purple-600",
      category: "IA Génération"
    }
  ];

  // Fonctionnalités métier implémentées
  const businessFeatures = [
    {
      icon: FileText,
      title: "Devis & Factures Intelligents",
      description: "Système complet de création de devis avec phases, matériaux, main d'œuvre. Génération PDF, envoi email, suivi des statuts.",
      benefits: ["Création rapide", "Templates personnalisables", "Suivi complet"]
    },
    {
      icon: DollarSign,
      title: "Gestion des Paiements",
      description: "Dashboard complet des paiements, intégration Mobile Money, suivi des transactions, rapports financiers détaillés.",
      benefits: ["Mobile Money intégré", "Suivi temps réel", "Rapports automatiques"]
    },
    {
      icon: BarChart3,
      title: "Gestion de Projets",
      description: "Suivi complet des projets, tâches, budgets, équipes. Tableaux de bord visuels et rapports de progression.",
      benefits: ["Suivi temps réel", "Collaboration équipe", "Rapports visuels"]
    },
    {
      icon: Truck,
      title: "Gestion des Équipements",
      description: "Inventaire complet, maintenance programmée, scanner QR, suivi des coûts et de la disponibilité des équipements.",
      benefits: ["Scanner QR intégré", "Maintenance programmée", "Suivi des coûts"]
    },
    {
      icon: Globe,
      title: "Documents & Stockage",
      description: "Gestion centralisée des documents, organisation par dossiers, partage sécurisé, accès mobile et synchronisation.",
      benefits: ["Organisation par dossiers", "Partage sécurisé", "Accès mobile"]
    },
    {
      icon: Users,
      title: "Gestion d'Équipe & Support",
      description: "Gestion des utilisateurs, rôles et permissions, centre de support intégré, notifications en temps réel.",
      benefits: ["Rôles personnalisés", "Support intégré", "Notifications temps réel"]
    }
  ];

  // Avantages concurrentiels
  const competitiveAdvantages = [
    {
      icon: Target,
      title: "Spécialisé BTP Africain",
      description: "Conçu spécifiquement pour les défis du BTP en Afrique : climat, réglementation, pratiques locales",
      stat: "100% adapté"
    },
    {
      icon: DollarSign,
      title: "Prix Révolutionnaires",
      description: "Tarification intelligente régionale : 90% moins cher que les solutions européennes",
      stat: "9000 FCFA/mois"
    },
    {
      icon: Zap,
      title: "IA de Pointe Abordable",
      description: "Technologies IA dernière génération (Groq, Claude) à prix accessible grâce à nos optimisations",
      stat: "90% moins cher"
    },
    {
      icon: Globe,
      title: "Mode Hors-Ligne",
      description: "Fonctionne sans internet, synchronisation automatique dès reconnexion",
      stat: "100% disponible"
    },
    {
      icon: Shield,
      title: "Sécurité Bancaire",
      description: "Chiffrement militaire, conformité RGPD, sauvegardes multi-régions",
      stat: "99.9% uptime"
    },
    {
      icon: Heart,
      title: "Support Local",
      description: "Équipe support qui comprend vos défis, formation incluse, assistance en français",
      stat: "24/7 disponible"
    }
  ];

  // Témoignages clients
  const testimonials = [
    {
      name: "Amadou Diallo",
      company: "Diallo Construction, Dakar",
      role: "Directeur Général",
      content: "IntuitionConcept a révolutionné notre façon de travailler. L'IA pour les devis nous fait gagner 80% de temps. Incroyable !",
      avatar: "👨🏿‍💼",
      rating: 5
    },
    {
      name: "Fatima Ouedraogo",
      company: "Ouedraogo BTP, Ouagadougou",
      role: "Cheffe de Projet",
      content: "Le mode hors-ligne est parfait pour nos chantiers isolés. Et les prix sont enfin accessibles pour nous !",
      avatar: "👩🏿‍💼",
      rating: 5
    },
    {
      name: "Jean-Baptiste Kone",
      company: "Kone & Associés, Abidjan",
      role: "Architecte",
      content: "L'analyseur de plans IA est magique. Il comprend mes plans mieux que certains humains !",
      avatar: "👨🏿‍🎓",
      rating: 5
    }
  ];

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-100 to-gray-200 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Subtle Tech Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-200/30 to-slate-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-gray-200/30 to-stone-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 px-6 bg-white/70 backdrop-blur-sm border-b border-gray-200/50">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23bg)'/%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Crect x='100' y='100' width='200' height='150' rx='10'/%3E%3Crect x='350' y='80' width='180' height='120' rx='8'/%3E%3Crect x='580' y='120' width='220' height='180' rx='12'/%3E%3Crect x='850' y='90' width='160' height='140' rx='8'/%3E%3Crect x='150' y='300' width='300' height='200' rx='15'/%3E%3Crect x='500' y='350' width='250' height='160' rx='10'/%3E%3Crect x='800' y='280' width='180' height='220' rx='12'/%3E%3Cpath d='M200 500 L300 450 L400 480 L500 420 L600 460 L700 400 L800 440 L900 380' stroke='%23ffffff' stroke-width='3' fill='none' opacity='0.3'/%3E%3Ccircle cx='200' cy='500' r='8' fill='%2367C3F3'/%3E%3Ccircle cx='400' cy='480' r='6' fill='%23A78BFA'/%3E%3Ccircle cx='600' cy='460' r='7' fill='%2334D399'/%3E%3Ccircle cx='800' cy='440' r='5' fill='%23F472B6'/%3E%3Ctext x='120' y='80' font-family='Arial' font-size='14' fill='%23667eea' opacity='0.6'%3EBTP%3C/text%3E%3Ctext x='370' y='60' font-family='Arial' font-size='12' fill='%23764ba2' opacity='0.5'%3EIA%3C/text%3E%3Ctext x='600' y='100' font-family='Arial' font-size='13' fill='%23667eea' opacity='0.6'%3EAfrique%3C/text%3E%3Ctext x='870' y='70' font-family='Arial' font-size='11' fill='%23764ba2' opacity='0.5'%3ETech%3C/text%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500/10 rounded-full blur-sm animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-indigo-500/10 rounded-full blur-sm animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-cyan-500/10 rounded-full blur-sm animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-full mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-base font-medium mb-8">
                <Sparkles className="w-5 h-5 mr-3" />
                Révolution IA pour le BTP Africain
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  IntuitionConcept
                </span>
                <br className="mb-4" />
                <span className="text-3xl md:text-5xl text-gray-700 dark:text-gray-300 mt-6 block">
                  L'IA qui Transforme le BTP
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-6xl mx-auto leading-relaxed mt-8">
                La première plateforme IA spécialement conçue pour les professionnels du BTP en Afrique. 
                <br className="mb-4" />
                Révolutionnez votre façon de travailler avec des technologies d'intelligence artificielle 
                <br className="mb-4" />
                de pointe adaptées à vos besoins locaux.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16">
                <Link
                  to="/pricing"
                  className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-4 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span>Commencer Maintenant</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
                
                <Link to="/app/architectural-plan-analyzer" className="px-12 py-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center space-x-4">
                  <Play className="w-6 h-6" />
                  <span>Voir la Démo</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Business Features */}
        <section className="py-28 px-6 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-full mx-auto px-4">
            <div className="text-center mb-24">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium mb-5">
                Fonctionnalités Métier
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Fonctionnalités Métier Complètes
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Outils essentiels pour piloter et faire grandir votre entreprise au quotidien.
              </p>
              <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
                Tous les outils dont vous avez besoin pour gérer efficacement votre entreprise BTP
                <br className="mb-4" />
                Une solution intégrée pour optimiser chaque aspect de votre activité
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-none">
              {businessFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-blue-400/50"
                >
                  <div className="flex items-center mb-8">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white mr-5">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-4">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-base text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-4 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Revolutionary AI Features */}
        <section className="py-28 px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-full mx-auto px-4">
            <div className="text-center mb-24">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium shadow-sm mb-5">
                Technologies IA
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Technologies IA Révolutionnaires
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Innovations IA pour accélérer, automatiser et fiabiliser vos opérations clés.
              </p>
              <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
                Découvrez les innovations qui placent IntuitionConcept à l'avant-garde du BTP africain
                <br className="mb-4" />
                Des solutions pensées pour transformer votre quotidien professionnel
              </p>
            </div>

            {/* Toutes les fonctionnalités IA implémentées */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12 max-w-none">
              {revolutionaryFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-purple-400/50">
                    {/* Badge Aperçu/BETA */}
                    <div className="absolute top-4 right-4">
                      {feature.title === 'Analyseur de Plans Architecturaux IA' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">BETA</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">Aperçu</span>
                      )}
                    </div>
                    <div className="flex items-start mb-10">
                      <div className={`p-6 rounded-xl bg-gradient-to-r ${feature.color} text-white mr-6 flex-shrink-0`}>
                        <feature.icon className="w-12 h-12" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          {feature.category}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mb-6 space-y-4">
                      <p className="text-lg font-medium text-blue-600 dark:text-blue-400 leading-relaxed">
                        {feature.subtitle}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                        <span className="text-base font-semibold text-green-700 dark:text-green-300">
                          {feature.impact}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-6">
                      {feature.title === 'Analyseur de Plans Architecturaux IA' && (
                        <Link to="/app/architectural-plan-analyzer" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir l'outil
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      {feature.title === 'Détection d\'Anomalies IA' && (
                        <Link to="/app/anomaly-detection" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir le dashboard
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      {feature.title === 'OCR Intelligent' && (
                        <Link to="/app/ocr-scanner" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir le scanner
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      {feature.title === 'Hub d\'Automatisation' && (
                        <Link to="/app/automation-hub" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir le hub
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      {feature.title === 'Copilot IA Vocal' && (
                        <Link to="/app/dashboard" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir le copilot
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      {feature.title === 'Générateur de Devis IA' && (
                        <Link to="/app/quotes" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                          Ouvrir le générateur
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Avantages Concurrentiels */}
        <section className="py-28 px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-full mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-relaxed">
                Pourquoi IntuitionConcept
                <span className="block mt-2 text-blue-600">Domine la Concurrence ?</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed mb-8">
                Nous ne sommes pas une énième solution généraliste. Nous sommes LA solution 
                BTP conçue par et pour l'Afrique, avec des innovations que personne d'autre n'offre.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {competitiveAdvantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white w-fit mb-6">
                      <advantage.icon className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight">{advantage.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{advantage.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="py-28 px-6 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-full mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-relaxed">
                Ils Ont Révolutionné
                <span className="block mt-2 text-blue-600">Leur Business avec Nous</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-blue-600">{testimonial.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 px-6 bg-gradient-to-r from-purple-600 to-cyan-600">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt à Révolutionner
                <span className="block">Votre Entreprise BTP ?</span>
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                Rejoignez les centaines d'entreprises BTP africaines qui ont déjà fait le choix de l'innovation. 
                Commencez votre transformation dès aujourd'hui.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Commencer Maintenant - 9000 FCFA/mois
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                  Demander une Démo
                </button>
              </div>
              
              <p className="text-white/70 text-sm mt-4">
                ✅ Essai gratuit 14 jours • ✅ Sans engagement • ✅ Support inclus
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </GlobalLayout>
  );
};

export default ModernHomePage;

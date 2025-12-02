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
  ChevronRight,
  Brain,
  DollarSign,
  Sparkles,
  BarChart3
} from 'lucide-react';

const ModernHomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Analyseur de Plans IA",
      description: "Uploadez vos plans, notre IA génère automatiquement un devis détaillé.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: Sparkles,
      title: "Rendus 3D Automatiques",
      description: "Visualisations 3D réalistes générées par IA à partir de vos plans.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: FileText,
      title: "OCR Intelligent",
      description: "Extraction automatique des données de vos documents et factures.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: DollarSign,
      title: "Mobile Money Intégré",
      description: "Paiements Orange Money, MTN Money, Airtel Money acceptés.",
      color: "from-orange-600 to-red-600"
    },
    {
      icon: Users,
      title: "Gestion d'Équipe",
      description: "Suivi GPS temps réel et assignation de tâches.",
      color: "from-indigo-600 to-blue-600"
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "Chiffrement SSL, 2FA et conformité RGPD.",
      color: "from-gray-600 to-slate-600"
    }
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'CEO, TechStart Dakar',
      country: 'Sénégal 🇸🇳',
      content: 'IntuitionConcept a révolutionné notre gestion de projets.',
      rating: 5
    },
    {
      name: 'Jean-Baptiste Kouame',
      role: 'Directeur IT',
      country: 'Côte d\'Ivoire 🇨🇮',
      content: 'Interface en français et devises locales - parfait pour l\'Afrique !',
      rating: 5
    },
    {
      name: 'Fatima El Mansouri',
      role: 'Chef de Projet',
      country: 'Maroc 🇲🇦',
      content: 'Excellent pour coordonner nos équipes multi-pays.',
      rating: 5
    }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Gestion de Projets
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> BTP & Construction</span>
            </h1>

            <p className="text-xl text-blue-100 mb-10">
              La plateforme tout-en-un avec IA intégrée pour l'Afrique francophone.
              Analyse de plans, devis automatiques et paiements Mobile Money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Essai Gratuit <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Voir les Tarifs <ChevronRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités <span className="text-blue-600">Révolutionnaires</span>
            </h2>
            <p className="text-xl text-gray-600">
              Des outils puissants pour transformer votre entreprise
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
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos <span className="text-blue-600">Clients</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.country}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-4xl font-bold mb-6">
              Prêt à Commencer ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers d'entreprises africaines
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-lg"
              >
                Commencer Gratuitement <ArrowRight className="inline w-6 h-6 ml-2" />
              </motion.button>
            </Link>
            <p className="mt-6 text-blue-200 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Essai gratuit 14 jours • Aucune carte requise
            </p>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default ModernHomePage;

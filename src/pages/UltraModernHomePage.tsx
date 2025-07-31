import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
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
  ChevronRight
} from 'lucide-react';

const UltraModernHomePage: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Gestion de Projets',
      description: 'Organisez et suivez vos projets avec des outils intuitifs et collaboratifs.',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Users,
      title: 'Collaboration d\'Équipe',
      description: 'Travaillez ensemble efficacement, même à distance, avec des outils de communication intégrés.',
      color: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: Smartphone,
      title: 'Paiements Mobile Money',
      description: 'Intégration native avec Orange Money, MTN Money et autres solutions de paiement mobile.',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      icon: Calendar,
      title: 'Planning Gantt',
      description: 'Planifiez vos projets avec des diagrammes de Gantt interactifs et des échéances claires.',
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      icon: FileText,
      title: 'Gestion Documentaire',
      description: 'Centralisez tous vos documents projet dans un espace sécurisé et accessible.',
      color: 'from-indigo-500 to-blue-500',
      delay: 0.5
    },
    {
      icon: Shield,
      title: 'Sécurité Avancée',
      description: 'Protection de vos données avec chiffrement SSL et conformité aux standards internationaux.',
      color: 'from-gray-500 to-slate-500',
      delay: 0.6
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity
      }
    }
  };

  return (
    <GlobalLayout
      showHero={true}
      heroTitle="Gérez Vos Projets avec Excellence"
      heroSubtitle="La plateforme SaaS moderne pour la gestion de projets. Intégration Mobile Money, interface intuitive, et outils collaboratifs adaptés à vos besoins."
    >
      {/* Section CTA Hero */}
      <section className="relative -mt-20 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6"
          >
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

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
              >
                {/* Effet de fond animé */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl`}
                />
                
                <div className="relative z-10">
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center text-blue-600 font-semibold"
                  >
                    <span>En savoir plus</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 bg-white">
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

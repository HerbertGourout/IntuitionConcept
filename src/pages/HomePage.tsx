import React from 'react';
import { Link } from 'react-router-dom'; // 🔽 Ajouté
import { motion } from 'framer-motion'; // 🔽 Ajouté
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Gestion de Projets",
      description: "Planifiez, suivez et gérez vos projets de construction avec des outils avancés.",
      link: "/app/projects"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestion d'Équipe",
      description: "Coordonnez vos équipes, assignez des tâches et suivez les performances.",
      link: "/app/team"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Planning & Gantt",
      description: "Visualisez vos projets avec des diagrammes de Gantt interactifs.",
      link: "/app/planning"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Gestion Financière",
      description: "Suivez les budgets, dépenses et rentabilité de vos projets.",
      link: "/app/finances"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Documents & Rapports",
      description: "Centralisez tous vos documents et générez des rapports détaillés.",
      link: "/app/documents"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Tableaux de Bord",
      description: "Analysez vos performances avec des tableaux de bord en temps réel.",
      link: "/app/dashboard"
    }
  ];

  const testimonials = [
    {
      name: "Amadou Diallo",
      company: "BTP Sénégal",
      text: "Cette plateforme a révolutionné notre gestion de projets. Nous avons gagné 40% d'efficacité.",
      rating: 5
    },
    {
      name: "Fatima Benali",
      company: "Construction Maroc",
      text: "L'intégration Mobile Money nous permet de gérer les paiements facilement avec nos équipes.",
      rating: 5
    },
    {
      name: "Jean-Claude Mbarga",
      company: "Cameroun BTP",
      text: "Interface intuitive et fonctionnalités adaptées au marché africain. Excellent !",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Projets Gérés" },
    { number: "50+", label: "Entreprises Clientes" },
    { number: "15", label: "Pays Couverts" },
    { number: "99.9%", label: "Disponibilité" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Gérez vos Projets
              <br />
              <span className="text-orange-400">en Afrique</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              La plateforme SaaS de gestion de projets conçue spécialement pour l'Afrique francophone.
              Avec paiements Mobile Money intégrés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Commencer Gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/app/dashboard"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Voir la Démo
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Toutes les Fonctionnalités dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils pour gérer efficacement vos projets de construction
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  to={feature.link}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  En savoir plus
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi choisir notre plateforme ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Conçu pour l'Afrique</h3>
                    <p className="text-gray-600">Interface en français, devises locales, et intégration Mobile Money.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rapide et Efficace</h3>
                    <p className="text-gray-600">Déployez vos projets en quelques minutes avec nos templates prêts à l'emploi.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sécurisé et Fiable</h3>
                    <p className="text-gray-600">Vos données sont protégées avec un chiffrement de niveau bancaire.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Essai Gratuit 30 jours</h3>
                <p className="text-gray-600 mt-2">Aucune carte de crédit requise</p>
              </div>
              <Link
                to="/pricing"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors block text-center"
              >
                Commencer maintenant
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'entreprises qui nous font confiance
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Prêt à transformer votre gestion de projets ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez des milliers d'entreprises qui utilisent déjà notre plateforme
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Voir les Tarifs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Nous Contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
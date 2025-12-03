import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { 
  BarChart3,
  FileText,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Truck,
  Brain,
  ClipboardList,
  PieChart,
  Smartphone,
  Wifi,
  Bell,
  Lock,
  ArrowRight
} from 'lucide-react';

// Images
import dashboardInterface from '../assets/images/homepage/dashboard-interface.jpg';
import intelligentQuoteSystem from '../assets/images/homepage/intelligent-quote-system.jpg';
import collaborativeProjectManagement from '../assets/images/homepage/collaborative-project-management.jpg';
import teamGpsTracking from '../assets/images/homepage/team-gps-tracking.jpg';
import mobileMoneyPayment from '../assets/images/homepage/mobile-money-payment.jpg';
import aiOcrProcessing from '../assets/images/homepage/ai-ocr-processing.jpg';

const FeaturesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'project', label: 'Gestion de projet' },
    { id: 'finance', label: 'Finance' },
    { id: 'team', label: 'Équipes' },
    { id: 'ai', label: 'Outils intelligents' }
  ];

  const features = [
    {
      id: 'dashboard',
      category: 'project',
      icon: BarChart3,
      title: 'Dashboard temps réel',
      description: 'Vue d\'ensemble de tous vos chantiers avec indicateurs clés actualisés en temps réel.',
      benefits: ['Suivi d\'avancement visuel', 'Alertes automatiques', 'KPIs personnalisables'],
      image: dashboardInterface,
      forWho: 'Directeurs de travaux, chefs de projet'
    },
    {
      id: 'quotes',
      category: 'finance',
      icon: FileText,
      title: 'Devis et facturation',
      description: 'Créez des devis professionnels en quelques clics avec bibliothèque de prix intégrée.',
      benefits: ['Modèles personnalisables', 'Calculs automatiques', 'Export PDF'],
      image: intelligentQuoteSystem,
      forWho: 'Commerciaux, gérants'
    },
    {
      id: 'planning',
      category: 'project',
      icon: Calendar,
      title: 'Planning Gantt',
      description: 'Planifiez vos chantiers avec des diagrammes interactifs et gestion des dépendances.',
      benefits: ['Drag & drop', 'Jalons et dépendances', 'Vue multi-projets'],
      image: collaborativeProjectManagement,
      forWho: 'Conducteurs de travaux, planificateurs'
    },
    {
      id: 'gps',
      category: 'team',
      icon: MapPin,
      title: 'Suivi GPS équipes',
      description: 'Localisez vos équipes sur le terrain en temps réel pour optimiser les déplacements.',
      benefits: ['Position temps réel', 'Historique trajets', 'Géofencing'],
      image: teamGpsTracking,
      forWho: 'Responsables logistique, chefs d\'équipe'
    },
    {
      id: 'mobilemoney',
      category: 'finance',
      icon: DollarSign,
      title: 'Paiements Mobile Money',
      description: 'Acceptez Orange Money, MTN Money, Airtel Money directement dans l\'application.',
      benefits: ['Paiements instantanés', 'Reçus automatiques', 'Suivi des encaissements'],
      image: mobileMoneyPayment,
      forWho: 'Comptables, gérants'
    },
    {
      id: 'ocr',
      category: 'ai',
      icon: Brain,
      title: 'OCR Factures',
      description: 'Scannez vos factures fournisseurs, les données sont extraites automatiquement.',
      benefits: ['Extraction automatique', 'Classement intelligent', 'Rapprochement bancaire'],
      image: aiOcrProcessing,
      forWho: 'Comptables, assistants administratifs'
    },
    {
      id: 'team',
      category: 'team',
      icon: Users,
      title: 'Gestion d\'équipe',
      description: 'Assignez les tâches, suivez les présences et communiquez avec vos équipes.',
      benefits: ['Assignation de tâches', 'Pointage digital', 'Chat intégré'],
      image: collaborativeProjectManagement,
      forWho: 'Chefs d\'équipe, RH'
    },
    {
      id: 'equipment',
      category: 'project',
      icon: Truck,
      title: 'Gestion équipements',
      description: 'Suivez votre matériel, planifiez la maintenance et optimisez l\'utilisation.',
      benefits: ['Inventaire complet', 'Alertes maintenance', 'Réservation'],
      image: dashboardInterface,
      forWho: 'Responsables matériel, logistique'
    },
    {
      id: 'reports',
      category: 'project',
      icon: ClipboardList,
      title: 'Rapports de chantier',
      description: 'Générez des rapports quotidiens avec photos, incidents et avancement.',
      benefits: ['Photos géolocalisées', 'Signature électronique', 'Historique complet'],
      image: collaborativeProjectManagement,
      forWho: 'Conducteurs de travaux, chefs de chantier'
    },
    {
      id: 'budget',
      category: 'finance',
      icon: PieChart,
      title: 'Suivi budgétaire',
      description: 'Analysez la rentabilité par projet, phase et poste de dépense.',
      benefits: ['Budget vs réel', 'Prévisions', 'Alertes dépassement'],
      image: dashboardInterface,
      forWho: 'Directeurs financiers, gérants'
    },
    {
      id: 'offline',
      category: 'ai',
      icon: Wifi,
      title: 'Mode hors-ligne',
      description: 'Travaillez sans connexion internet, synchronisation automatique au retour.',
      benefits: ['Fonctionne partout', 'Sync automatique', 'Aucune perte de données'],
      image: teamGpsTracking,
      forWho: 'Équipes terrain, zones rurales'
    },
    {
      id: 'notifications',
      category: 'team',
      icon: Bell,
      title: 'Notifications intelligentes',
      description: 'Recevez les alertes importantes par SMS, WhatsApp ou email.',
      benefits: ['Multi-canal', 'Personnalisables', 'Escalade automatique'],
      image: dashboardInterface,
      forWho: 'Tous les utilisateurs'
    }
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              La suite d'outils pensée pour vos réalités BTP
            </h1>
            <p className="text-xl text-blue-100">
              Devis, suivi terrain, finance, équipes, Mobile Money... 
              Tout ce dont vous avez besoin pour piloter vos chantiers efficacement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image */}
                    <div className="relative h-48 md:h-full">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Avantages :</p>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit) => (
                            <li key={benefit} className="text-sm text-gray-700 pl-3 border-l-2 border-[#4A7C59]/40">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                        Pour : {feature.forWho}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Différenciateurs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce qui nous différencie
            </h2>
            <p className="text-xl text-gray-600">
              Conçu spécifiquement pour les réalités du BTP en Afrique
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Money natif</h3>
              <p className="text-gray-600">
                Orange Money, MTN, Airtel... Paiements intégrés sans configuration.
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
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support local</h3>
              <p className="text-gray-600">
                Équipe francophone à Dakar, Abidjan, Douala. Réponse sous 24h.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Essayez gratuitement pendant 14 jours, sans engagement ni carte bancaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Essayer gratuitement <ArrowRight className="inline w-5 h-5 ml-2" />
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
    </GlobalLayout>
  );
};

export default FeaturesPage;

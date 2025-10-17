import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, X, Star, TrendingUp, Zap, Shield, 
  Smartphone, Globe, Brain, DollarSign 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Competitor {
  name: string;
  logo: string;
  isUs: boolean;
  price: number;
  currency: string;
  features: number;
  aiModules: number;
  mobileMoney: boolean;
  offlineMode: boolean;
  frenchSupport: boolean;
  countries: number;
  gps: boolean;
  automation: boolean;
  renders3D: boolean;
  ocr: boolean;
  website: string;
  color: string;
}

const competitors: Competitor[] = [
  {
    name: 'IntuitionConcept',
    logo: '🚀',
    isUs: true,
    price: 35000,
    currency: 'FCFA',
    features: 30,
    aiModules: 9,
    mobileMoney: true,
    offlineMode: true,
    frenchSupport: true,
    countries: 21,
    gps: true,
    automation: true,
    renders3D: true,
    ocr: true,
    website: '/pricing',
    color: 'from-blue-600 to-purple-600'
  },
  {
    name: 'BuilderPro',
    logo: '🏗️',
    isUs: false,
    price: 45000,
    currency: 'FCFA',
    features: 12,
    aiModules: 0,
    mobileMoney: false,
    offlineMode: false,
    frenchSupport: false,
    countries: 5,
    gps: false,
    automation: false,
    renders3D: false,
    ocr: false,
    website: '#',
    color: 'from-gray-400 to-gray-500'
  },
  {
    name: 'ConstructManager',
    logo: '🔨',
    isUs: false,
    price: 50000,
    currency: 'FCFA',
    features: 15,
    aiModules: 1,
    mobileMoney: false,
    offlineMode: false,
    frenchSupport: true,
    countries: 8,
    gps: true,
    automation: false,
    renders3D: false,
    ocr: true,
    website: '#',
    color: 'from-gray-400 to-gray-500'
  },
  {
    name: 'AfricaBTP',
    logo: '🌍',
    isUs: false,
    price: 40000,
    currency: 'FCFA',
    features: 10,
    aiModules: 2,
    mobileMoney: true,
    offlineMode: false,
    frenchSupport: true,
    countries: 12,
    gps: false,
    automation: false,
    renders3D: false,
    ocr: false,
    website: '#',
    color: 'from-gray-400 to-gray-500'
  }
];

const features = [
  { 
    id: 'price', 
    label: 'Prix/Mois', 
    icon: DollarSign, 
    type: 'price',
    description: 'Tarif mensuel pour le plan principal'
  },
  { 
    id: 'features', 
    label: 'Fonctionnalités', 
    icon: Zap, 
    type: 'number',
    description: 'Nombre total de fonctionnalités disponibles'
  },
  { 
    id: 'aiModules', 
    label: 'Modules IA', 
    icon: Brain, 
    type: 'number',
    description: 'Fonctionnalités d\'intelligence artificielle'
  },
  { 
    id: 'mobileMoney', 
    label: 'Mobile Money', 
    icon: Smartphone, 
    type: 'boolean',
    description: 'Orange Money, MTN, Moov, Airtel'
  },
  { 
    id: 'offlineMode', 
    label: 'Mode Hors-Ligne', 
    icon: Shield, 
    type: 'boolean',
    description: 'Utilisation sans connexion internet'
  },
  { 
    id: 'frenchSupport', 
    label: 'Support Français', 
    icon: Globe, 
    type: 'boolean',
    description: 'Support client en français'
  },
  { 
    id: 'countries', 
    label: 'Pays Couverts', 
    icon: Globe, 
    type: 'number',
    description: 'Nombre de pays d\'Afrique supportés'
  },
  { 
    id: 'gps', 
    label: 'Géolocalisation GPS', 
    icon: TrendingUp, 
    type: 'boolean',
    description: 'Suivi temps réel des équipes'
  },
  { 
    id: 'automation', 
    label: 'Automatisations', 
    icon: Zap, 
    type: 'boolean',
    description: 'Workflows automatisés (n8n)'
  },
  { 
    id: 'renders3D', 
    label: 'Rendus 3D IA', 
    icon: Star, 
    type: 'boolean',
    description: 'Génération rendus photoréalistes'
  },
  { 
    id: 'ocr', 
    label: 'Scanner OCR IA', 
    icon: Brain, 
    type: 'boolean',
    description: 'Extraction automatique documents'
  }
];

const CompetitorComparison: React.FC = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const renderValue = (competitor: Competitor, feature: typeof features[0]) => {
    const value = competitor[feature.id as keyof Competitor];

    if (feature.type === 'price') {
      return (
        <div className="text-center">
          <div className={`text-2xl font-bold ${competitor.isUs ? 'text-green-600' : 'text-gray-900'}`}>
            {(value as number).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{competitor.currency}</div>
        </div>
      );
    }

    if (feature.type === 'number') {
      return (
        <div className={`text-3xl font-bold ${competitor.isUs ? 'text-blue-600' : 'text-gray-600'}`}>
          {value as number}
        </div>
      );
    }

    if (feature.type === 'boolean') {
      return value ? (
        <Check className={`w-8 h-8 ${competitor.isUs ? 'text-green-500' : 'text-green-400'}`} />
      ) : (
        <X className="w-8 h-8 text-red-400" />
      );
    }

    return value;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pourquoi Choisir
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> IntuitionConcept ?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comparez-nous avec les autres solutions BTP et voyez la différence
          </p>
        </motion.div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="col-span-1"></div>
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative ${
                    competitor.isUs 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-105' 
                      : 'bg-white text-gray-900 shadow-lg'
                  } rounded-3xl p-6`}
                >
                  {competitor.isUs && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Meilleur Choix
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-5xl mb-3">{competitor.logo}</div>
                    <div className="text-xl font-bold mb-2">{competitor.name}</div>
                    {competitor.isUs && (
                      <div className="text-sm opacity-90">🇫🇷 Made for Africa</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Rows */}
            {features.map((feature, featureIndex) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: featureIndex * 0.05 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="grid grid-cols-5 gap-4 mb-4"
                >
                  {/* Feature Label */}
                  <div className="col-span-1 bg-white rounded-2xl p-4 shadow-md flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FeatureIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{feature.label}</div>
                      {hoveredFeature === feature.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs text-gray-600 mt-1"
                        >
                          {feature.description}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Competitor Values */}
                  {competitors.map((competitor) => (
                    <div
                      key={`${feature.id}-${competitor.name}`}
                      className={`${
                        competitor.isUs 
                          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200' 
                          : 'bg-white border border-gray-200'
                      } rounded-2xl p-4 flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg`}
                    >
                      {renderValue(competitor, feature)}
                    </div>
                  ))}
                </motion.div>
              );
            })}

            {/* CTA Row */}
            <div className="grid grid-cols-5 gap-4 mt-8">
              <div className="col-span-1"></div>
              {competitors.map((competitor) => (
                <div key={`cta-${competitor.name}`} className="flex items-center justify-center">
                  {competitor.isUs ? (
                    <Link to={competitor.website} className="w-full">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl py-4 px-6 font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        Essayer Gratuit 🎁
                      </motion.button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 rounded-2xl py-4 px-6 font-semibold cursor-not-allowed"
                    >
                      Autre Solution
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-5xl mb-4">🏆</div>
            <div className="text-3xl font-bold mb-2">3× Plus</div>
            <div className="text-green-100">de fonctionnalités que la concurrence</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-5xl mb-4">🤖</div>
            <div className="text-3xl font-bold mb-2">9 Modules IA</div>
            <div className="text-blue-100">vs 0-2 chez les concurrents</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-5xl mb-4">💰</div>
            <div className="text-3xl font-bold mb-2">-30%</div>
            <div className="text-purple-100">moins cher avec plus de valeur</div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-2xl font-bold text-gray-900 mb-6">
            Rejoignez les 10,000+ professionnels BTP qui nous font confiance
          </p>
          <Link to="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              <span>Commencer Maintenant</span>
              <Star className="w-6 h-6" />
            </motion.button>
          </Link>
          <p className="mt-4 text-gray-600">
            🎁 14 jours gratuits • Sans CB • Annulation à tout moment
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparison;

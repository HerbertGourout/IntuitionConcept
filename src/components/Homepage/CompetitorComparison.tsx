import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Brain, Smartphone, Globe, Shield, Clock } from 'lucide-react';

interface Competitor {
  name: string;
  features: number;
  aiModules: number;
  mobileMoney: boolean;
  offlineMode: boolean;
  africanSupport: boolean;
  localCurrency: boolean;
  price: string;
}

const CompetitorComparison: React.FC = () => {
  const competitors: Competitor[] = [
    {
      name: 'IntuitionConcept',
      features: 30,
      aiModules: 5,
      mobileMoney: true,
      offlineMode: true,
      africanSupport: true,
      localCurrency: true,
      price: 'À partir de 15,000 FCFA/mois'
    },
    {
      name: 'Concurrent A',
      features: 15,
      aiModules: 1,
      mobileMoney: false,
      offlineMode: false,
      africanSupport: false,
      localCurrency: false,
      price: '$99/mois'
    },
    {
      name: 'Concurrent B',
      features: 20,
      aiModules: 2,
      mobileMoney: false,
      offlineMode: true,
      africanSupport: false,
      localCurrency: false,
      price: '$149/mois'
    }
  ];

  const features = [
    { id: 'features', label: 'Fonctionnalités', icon: Zap, type: 'number' },
    { id: 'aiModules', label: 'Modules IA', icon: Brain, type: 'number' },
    { id: 'mobileMoney', label: 'Mobile Money', icon: Smartphone, type: 'boolean' },
    { id: 'offlineMode', label: 'Mode Hors-Ligne', icon: Clock, type: 'boolean' },
    { id: 'africanSupport', label: 'Support Afrique', icon: Globe, type: 'boolean' },
    { id: 'localCurrency', label: 'Devises Locales', icon: Shield, type: 'boolean' }
  ];

  const renderValue = (competitor: Competitor, featureId: string, type: string) => {
    const value = competitor[featureId as keyof Competitor];
    
    if (type === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-green-500" />
      ) : (
        <X className="w-6 h-6 text-red-400" />
      );
    }
    
    return <span className="font-bold text-gray-900">{String(value)}</span>;
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pourquoi Choisir <span className="text-blue-600">IntuitionConcept</span> ?
          </h2>
          <p className="text-xl text-gray-600">
            Comparez nos fonctionnalités avec la concurrence
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-4 px-6 text-left text-gray-600">Fonctionnalité</th>
                {competitors.map((competitor, index) => (
                  <th
                    key={competitor.name}
                    className={`py-4 px-6 text-center ${
                      index === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {competitor.name}
                    {index === 0 && (
                      <span className="block text-xs text-blue-500 mt-1">Recommandé</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <tr key={feature.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">{feature.label}</span>
                      </div>
                    </td>
                    {competitors.map((competitor, index) => (
                      <td
                        key={`${competitor.name}-${feature.id}`}
                        className={`py-4 px-6 text-center ${
                          index === 0 ? 'bg-blue-50' : ''
                        }`}
                      >
                        {renderValue(competitor, feature.id, feature.type)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-4 px-6 font-bold text-gray-900">Prix</td>
                {competitors.map((competitor, index) => (
                  <td
                    key={`${competitor.name}-price`}
                    className={`py-4 px-6 text-center font-bold ${
                      index === 0 ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {competitor.price}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparison;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Clock, DollarSign, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIFeature {
  id: string;
  name: string;
  timeWithoutAI: number; // en minutes
  timeWithAI: number; // en minutes
  defaultFrequency: number; // fois par mois
  icon: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: 'devis',
    name: 'Génération Devis',
    timeWithoutAI: 120, // 2h
    timeWithAI: 10,
    defaultFrequency: 20,
    icon: '📝'
  },
  {
    id: 'ocr',
    name: 'Scanner OCR',
    timeWithoutAI: 30,
    timeWithAI: 2,
    defaultFrequency: 50,
    icon: '📄'
  },
  {
    id: 'plans',
    name: 'Analyse Plans',
    timeWithoutAI: 60, // 1h
    timeWithAI: 5,
    defaultFrequency: 10,
    icon: '📐'
  },
  {
    id: 'anomalies',
    name: 'Détection Anomalies',
    timeWithoutAI: 45,
    timeWithAI: 1,
    defaultFrequency: 15,
    icon: '⚠️'
  },
  {
    id: 'project-plans',
    name: 'Plans Projet IA',
    timeWithoutAI: 90,
    timeWithAI: 8,
    defaultFrequency: 8,
    icon: '🗂️'
  },
  {
    id: 'reports',
    name: 'Rapports Auto',
    timeWithoutAI: 40,
    timeWithAI: 3,
    defaultFrequency: 12,
    icon: '📊'
  },
  {
    id: 'renders',
    name: 'Rendus 3D',
    timeWithoutAI: 180, // 3h
    timeWithAI: 15,
    defaultFrequency: 5,
    icon: '🎨'
  }
];

const ROICalculator: React.FC = () => {
  const [frequencies, setFrequencies] = useState<Record<string, number>>(
    aiFeatures.reduce((acc, feature) => ({
      ...acc,
      [feature.id]: feature.defaultFrequency
    }), {})
  );

  const [hourlyRate, setHourlyRate] = useState(5000); // FCFA par heure

  // Calculs
  const calculateSavings = () => {
    let totalTimeSavedMinutes = 0;
    const details: Array<{
      name: string;
      timeSaved: number;
      frequency: number;
      totalSaved: number;
    }> = [];

    aiFeatures.forEach(feature => {
      const freq = frequencies[feature.id] || 0;
      const timeSavedPerUse = feature.timeWithoutAI - feature.timeWithAI;
      const totalSaved = timeSavedPerUse * freq;
      totalTimeSavedMinutes += totalSaved;

      if (freq > 0) {
        details.push({
          name: feature.name,
          timeSaved: timeSavedPerUse,
          frequency: freq,
          totalSaved
        });
      }
    });

    const totalHoursSaved = totalTimeSavedMinutes / 60;
    const monthlySavings = totalHoursSaved * hourlyRate;
    const yearlySavings = monthlySavings * 12;
    const planCost = 35000; // Plan Pro
    const netMonthlySavings = monthlySavings - planCost;
    const roi = ((netMonthlySavings / planCost) * 100).toFixed(0);

    return {
      totalHoursSaved: totalHoursSaved.toFixed(1),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      planCost,
      netMonthlySavings: Math.round(netMonthlySavings),
      roi,
      details
    };
  };

  const results = calculateSavings();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Calculator className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Calculez Votre
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> ROI avec l'IA</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez combien de temps et d'argent vous économisez chaque mois avec nos fonctionnalités IA
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Panneau de configuration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              Ajustez votre utilisation
            </h3>

            {/* Taux horaire */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💰 Votre taux horaire (FCFA)
              </label>
              <input
                type="range"
                min="2000"
                max="15000"
                step="500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {hourlyRate.toLocaleString()} FCFA/h
                </span>
              </div>
            </div>

            {/* Sliders pour chaque fonctionnalité */}
            <div className="space-y-6">
              {aiFeatures.map((feature) => (
                <div key={feature.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="text-2xl mr-2">{feature.icon}</span>
                      {feature.name}
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {frequencies[feature.id]}×/mois
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={feature.defaultFrequency * 3}
                    value={frequencies[feature.id]}
                    onChange={(e) => setFrequencies({
                      ...frequencies,
                      [feature.id]: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>⏱️ Sans IA: {feature.timeWithoutAI}min</span>
                    <span>⚡ Avec IA: {feature.timeWithAI}min</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Résultats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Carte principale ROI */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Votre ROI Mensuel</h3>
                <TrendingUp className="w-8 h-8" />
              </div>
              
              <div className="text-center mb-8">
                <div className="text-6xl font-extrabold mb-2">
                  +{results.roi}%
                </div>
                <p className="text-green-100 text-lg">
                  Retour sur investissement
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <Clock className="w-6 h-6 mb-2" />
                  <div className="text-2xl font-bold">{results.totalHoursSaved}h</div>
                  <div className="text-sm text-green-100">Économisées/mois</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <DollarSign className="w-6 h-6 mb-2" />
                  <div className="text-2xl font-bold">{(results.monthlySavings / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-green-100">FCFA/mois</div>
                </div>
              </div>
            </div>

            {/* Détails des économies */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">💰 Détails des Économies</h4>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Valeur temps économisé</span>
                  <span className="text-xl font-bold text-green-600">
                    +{results.monthlySavings.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Coût Plan Pro</span>
                  <span className="text-xl font-bold text-red-600">
                    -{results.planCost.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-4">
                  <span className="text-gray-900 font-semibold">Bénéfice Net</span>
                  <span className="text-2xl font-bold text-green-600">
                    +{results.netMonthlySavings.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Projection annuelle */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Économies sur 1 an</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {results.yearlySavings.toLocaleString()} FCFA
                    </div>
                  </div>
                  <div className="text-5xl">🚀</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/pricing">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl py-5 px-8 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3">
                  <span>Commencer à Économiser</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
            </motion.div>

            <p className="text-center text-sm text-gray-600">
              🎁 Essai gratuit 14 jours • Sans engagement • Résiliable à tout moment
            </p>
          </motion.div>
        </div>

        {/* Détails par fonctionnalité */}
        {results.details.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto"
          >
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📊 Répartition des Gains de Temps
            </h4>
            <div className="space-y-3">
              {results.details.map((detail, index) => {
                const percentage = (detail.totalSaved / (parseFloat(results.totalHoursSaved) * 60)) * 100;
                return (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{detail.name}</span>
                      <span className="text-sm text-gray-600">
                        {detail.frequency}× • {(detail.totalSaved / 60).toFixed(1)}h économisées
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ROICalculator;

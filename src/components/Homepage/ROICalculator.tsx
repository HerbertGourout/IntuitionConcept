import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Icons removed for cleaner design

const ROICalculator: React.FC = () => {
  const [employees, setEmployees] = useState(5);
  const [projectsPerMonth, setProjectsPerMonth] = useState(3);
  const [avgProjectValue, setAvgProjectValue] = useState(5000000);

  // Calculs ROI simplifiés
  const timeSavedPerProject = 8; // heures
  const totalTimeSaved = projectsPerMonth * timeSavedPerProject;
  const hourlyRate = 15000; // FCFA
  const monthlySavings = totalTimeSaved * hourlyRate;
  const annualSavings = monthlySavings * 12;
  const subscriptionCost = 25000 * 12; // Pro plan annuel
  const roi = Math.round(((annualSavings - subscriptionCost) / subscriptionCost) * 100);

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
            Calculez votre <span className="text-[#4A7C59]">Retour sur Investissement</span>
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez combien vous pouvez économiser avec IntuitionConcept
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vos données</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'employés
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={employees}
                    onChange={(e) => setEmployees(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-lg font-bold text-blue-600">{employees}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projets par mois
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={projectsPerMonth}
                    onChange={(e) => setProjectsPerMonth(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-lg font-bold text-blue-600">{projectsPerMonth}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur moyenne d'un projet (FCFA)
                  </label>
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="1000000"
                    value={avgProjectValue}
                    onChange={(e) => setAvgProjectValue(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-lg font-bold text-blue-600">
                    {avgProjectValue.toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-xl font-bold mb-6">Vos économies estimées</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-white/80">Temps économisé/mois</span>
                  <span className="text-2xl font-bold">{totalTimeSaved}h</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-white/80">Économies mensuelles</span>
                  <span className="text-2xl font-bold">{monthlySavings.toLocaleString()} FCFA</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-white/80">Économies annuelles</span>
                  <span className="text-2xl font-bold">{annualSavings.toLocaleString()} FCFA</span>
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl text-center">
                  <div className="text-sm text-gray-600 mb-2">Retour sur investissement</div>
                  <div className="text-5xl font-bold text-green-600">{roi}%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;

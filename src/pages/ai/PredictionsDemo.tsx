import React from 'react';
import GlobalLayout from '../../components/Layout/GlobalLayout';

const PredictionsDemo: React.FC = () => {
  return (
    <GlobalLayout
      showHero
      heroTitle="Prédictions IA Avancées (Aperçu)"
      heroSubtitle="Exemple de tableaux de tendance et alertes – données simulées"
      heroBackground="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="rounded-xl border bg-white shadow p-6">
          <p className="text-gray-600 mb-4">
            Démonstration conceptuelle de prédictions (retards, surcoûts, qualité) avec courbes et cartes d'alerte. 
            Les données sont simulées. L'intégration réelle utilisera vos historiques projet.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-2">Probabilité de retard (projet courant)</div>
              <div className="h-40 bg-white rounded-md border flex items-center justify-center text-gray-400">Graphique (mock)</div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-2">Risque de surcoût</div>
              <div className="h-40 bg-white rounded-md border flex items-center justify-center text-gray-400">Graphique (mock)</div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-2">Alerte qualité prochaine étape</div>
              <div className="h-24 bg-white rounded-md border flex items-center justify-center text-gray-400">Carte Alerte (mock)</div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-2">Impact météo (7 jours)</div>
              <div className="h-24 bg-white rounded-md border flex items-center justify-center text-gray-400">Carte Alerte (mock)</div>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400">Prototype – non contractuel.</div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default PredictionsDemo;

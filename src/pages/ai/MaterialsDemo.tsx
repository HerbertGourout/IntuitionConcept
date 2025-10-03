import React from 'react';
import GlobalLayout from '../../components/Layout/GlobalLayout';

const MaterialsDemo: React.FC = () => {
  return (
    <GlobalLayout
      showHero
      heroTitle="Reconnaissance IA de Matériaux (Aperçu)"
      heroSubtitle="Upload d'images et détection conceptuelle — prototype non final"
      heroBackground="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="rounded-xl border bg-white shadow p-6">
          <p className="text-gray-600 mb-4">
            Démonstration simplifiée: chargez des images de matériaux pour un flux d'analyse simulé.
            L'algorithme final (classification, qualité, fournisseurs) sera intégré ultérieurement.
          </p>
          <div className="p-4 rounded-lg bg-gray-50 border flex flex-col gap-3">
            <input type="file" multiple accept="image/*" className="" />
            <button className="self-start px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm">Analyser (mock)</button>
          </div>
          <div className="mt-6 text-xs text-gray-400">Prototype – résultats factices, non contractuels.</div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default MaterialsDemo;

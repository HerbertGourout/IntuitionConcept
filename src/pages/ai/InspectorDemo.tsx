import React from 'react';
import GlobalLayout from '../../components/Layout/GlobalLayout';

const InspectorDemo: React.FC = () => {
  return (
    <GlobalLayout
      showHero
      heroTitle="IA Inspecteur de Chantier (Aperçu)"
      heroSubtitle="Détection de non-conformités sur images – démonstration conceptuelle"
      heroBackground="bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="rounded-xl border bg-white shadow p-6">
          <p className="text-gray-600 mb-4">
            Cette page illustre le concept: import d'images de chantier, exécution d'un faux modèle
            (mock) qui annote les images et renvoie une liste de points d'attention. Version démonstration.
          </p>
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="text-sm text-gray-500">Uploader des photos (non persisté) — à venir: intégration modèle d'analyse</div>
            <input type="file" multiple accept="image/*" className="mt-3" />
          </div>
          <div className="mt-6 text-xs text-gray-400">Prototype – ne reflète pas la qualité finale.</div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default InspectorDemo;

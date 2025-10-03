import React from 'react';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import VocalCopilot from '../../components/AI/VocalCopilot';

const VocalCopilotDemo: React.FC = () => {
  return (
    <GlobalLayout
      showHero
      heroTitle="Contrôle Vocal Intelligent (Aperçu)"
      heroSubtitle="Démonstration des capacités vocales — prototype non final"
      heroBackground="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="rounded-xl border bg-white shadow p-4 md:p-6">
          <p className="text-gray-600 mb-4">
            Ceci est une démonstration simplifiée du composant de contrôle vocal. Le modèle
            peut évoluer (wake word, commandes personnalisées, intégration tâches/devis...)
          </p>
          <div className="border rounded-lg p-4 bg-gray-50">
            <VocalCopilot />
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default VocalCopilotDemo;

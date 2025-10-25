/**
 * Page d'analyse de plans architecturaux et génération de devis
 * Utilise Claude AI (Anthropic) pour l'analyse
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import ArchitecturalPlanAnalyzer from '../components/AI/ArchitecturalPlanAnalyzer';

const AnalysePlan: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
                Analyse de Plan Architectural
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Uploadez votre plan PDF et obtenez une analyse détaillée avec génération automatique de devis
              </p>
            </div>

            {/* Bouton vers Rendu 3D */}
            <button
              onClick={() => navigate('/rendu-3d')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>Générer Rendu 3D</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu principal - Analyseur de plan intégré */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <ArchitecturalPlanAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default AnalysePlan;

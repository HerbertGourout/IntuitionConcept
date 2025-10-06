import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface NoProjectSelectedProps {
  onCreateProject?: () => void;
}

const NoProjectSelected: React.FC<NoProjectSelectedProps> = ({ onCreateProject }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Icône animée */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-lg">
          <FolderOpen className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        Aucun projet sélectionné
      </h2>

      {/* Description */}
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Sélectionnez un projet existant dans la barre latérale ou créez-en un nouveau pour commencer.
      </p>

      {/* Actions */}
      {onCreateProject && (
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Créer un nouveau projet
        </button>
      )}

      {/* Indication visuelle */}
      <div className="mt-12 flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span>Sélectionnez un projet pour voir les détails</span>
      </div>
    </div>
  );
};

export default NoProjectSelected;

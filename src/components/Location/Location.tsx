import React from 'react';
import { MapPin } from 'lucide-react';

const Location: React.FC = () => {
  return (
    <div className="p-8 min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100/60 to-purple-100/60">
      {/* Header glassmorphism */}
      <div className="glass-card flex flex-col items-center mb-8 p-8 w-full max-w-3xl bg-gradient-to-tr from-blue-50/90 to-purple-50/90 shadow-2xl">
        <MapPin className="w-16 h-16 text-blue-500 mb-4 drop-shadow" />
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Localisation du projet</h1>
        <p className="text-gray-700 mb-6 text-center">Visualisez et gérez la localisation de vos projets sur la carte.</p>
        <button className="btn-glass bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 transition px-6 py-2 rounded-full text-white font-semibold shadow-xl mb-6">
          Ajouter une localisation
        </button>
        {/* Carte interactive ou état vide moderne */}
        <div className="w-full h-64 glass-card bg-white/60 border-2 border-blue-100 rounded-2xl flex items-center justify-center">
          <span className="text-blue-400 text-lg">[Carte interactive à intégrer ici]</span>
        </div>
      </div>
    </div>
  );
};

export default Location;

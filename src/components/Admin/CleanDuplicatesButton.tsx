import React, { useState } from 'react';
import { Trash2, Eye, AlertTriangle } from 'lucide-react';
import { cleanDuplicateProjects, previewDuplicates } from '../../utils/cleanDuplicateProjects';

const CleanDuplicatesButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ total: number; duplicates: number; deleted: string[] } | null>(null);

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      await previewDuplicates();
      alert('✅ Aperçu terminé ! Consultez la console pour voir les détails.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'aperçu. Consultez la console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClean = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoading(true);
    setShowConfirm(false);
    
    try {
      const cleanResult = await cleanDuplicateProjects();
      setResult(cleanResult);
      alert(`✅ Nettoyage terminé !\n\n` +
            `Total projets: ${cleanResult.total}\n` +
            `Doublons trouvés: ${cleanResult.duplicates}\n` +
            `Projets supprimés: ${cleanResult.deleted.length}\n` +
            `Projets restants: ${cleanResult.total - cleanResult.deleted.length}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors du nettoyage. Consultez la console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Bouton Aperçu */}
      <button
        onClick={handlePreview}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
        title="Voir les doublons sans les supprimer"
      >
        <Eye className="w-4 h-4" />
        {isLoading ? 'Chargement...' : 'Aperçu Doublons'}
      </button>

      {/* Bouton Nettoyage */}
      <button
        onClick={handleClean}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
          showConfirm
            ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={showConfirm ? 'Cliquez à nouveau pour confirmer' : 'Nettoyer les doublons'}
      >
        {showConfirm ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            Confirmer ?
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Nettoyage...' : 'Nettoyer Doublons'}
          </>
        )}
      </button>

      {/* Annuler la confirmation */}
      {showConfirm && (
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg transition-all"
        >
          Annuler
        </button>
      )}

      {/* Résultat */}
      {result && (
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-semibold">✅ Nettoyage réussi !</div>
          <div className="text-xs mt-1">
            {result.deleted.length} doublons supprimés
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanDuplicatesButton;

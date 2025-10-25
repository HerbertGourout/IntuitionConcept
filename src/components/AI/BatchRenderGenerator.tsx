/**
 * Générateur de rendus 3D en mode batch
 * Gère la génération de multiples vues avec progression et galerie
 */

import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw, Pause, Play, AlertCircle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ViewGenerationSpec,
  GeneratedView,
  ArchitecturalAnalysis
} from '../../types/architecturalAnalysis';
import { batchRenderOrchestrator, BatchJob, BatchProgress } from '../../services/ai/batchRenderOrchestrator';

interface BatchRenderGeneratorProps {
  viewSpec: ViewGenerationSpec;
  planImages: Map<number, string>;
  analysis: ArchitecturalAnalysis;
  onClose: () => void;
}

const BatchRenderGenerator: React.FC<BatchRenderGeneratorProps> = ({
  viewSpec,
  planImages,
  analysis,
  onClose
}) => {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedView, setSelectedView] = useState<GeneratedView | null>(null);

  // Lancer la génération
  const startGeneration = async () => {
    setIsGenerating(true);
    
    try {
      const id = await batchRenderOrchestrator.startBatch(
        viewSpec.views,
        planImages,
        analysis,
        viewSpec.globalSettings,
        (prog) => setProgress(prog)
      );
      
      setBatchId(id);
      toast.success('Génération batch lancée !');
    } catch (error) {
      console.error('Erreur lancement batch:', error);
      toast.error('Erreur lors du lancement de la génération');
      setIsGenerating(false);
    }
  };

  // Mettre à jour les jobs périodiquement
  useEffect(() => {
    if (!batchId) return;

    const interval = setInterval(() => {
      const batchJobs = batchRenderOrchestrator.getBatchJobs(batchId);
      setJobs(batchJobs);

      // Vérifier si terminé
      const allDone = batchJobs.every(j => 
        j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
      );

      if (allDone) {
        setIsGenerating(false);
        clearInterval(interval);
        
        const completed = batchJobs.filter(j => j.status === 'completed').length;
        const failed = batchJobs.filter(j => j.status === 'failed').length;
        
        if (completed > 0) {
          toast.success(`✅ ${completed} rendu(s) généré(s) avec succès !${failed > 0 ? ` (${failed} échec(s))` : ''}`);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId]);

  // Annuler le batch
  const handleCancel = () => {
    if (batchId) {
      batchRenderOrchestrator.cancelBatch(batchId);
      toast('Génération annulée', { icon: 'ℹ️' });
      setIsGenerating(false);
    }
  };

  // Retry un job
  const handleRetry = async (jobId: string) => {
    if (batchId) {
      await batchRenderOrchestrator.retryJob(jobId, analysis, viewSpec.globalSettings);
    }
  };

  // Télécharger un rendu
  const handleDownload = async (view: GeneratedView) => {
    try {
      const response = await fetch(view.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${view.spec.subject?.replace(/\s+/g, '_')}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Image téléchargée !');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Télécharger tout en ZIP
  const handleDownloadAll = async () => {
    const completedViews = jobs
      .filter(j => j.status === 'completed' && j.result)
      .map(j => j.result!);

    if (completedViews.length === 0) {
      toast.error('Aucun rendu à télécharger');
      return;
    }

    toast.loading('Préparation du ZIP...', { id: 'zip-download' });

    try {
      // Import dynamique de JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Organiser par catégorie
      const exteriorFolder = zip.folder('Exterieur');
      const interiorFolder = zip.folder('Interieur');

      for (const view of completedViews) {
        const response = await fetch(view.imageUrl);
        const blob = await response.blob();
        
        const filename = `${view.spec.subject?.replace(/\s+/g, '_')}_${view.spec.timeOfDay}.png`;
        const folder = view.spec.category === 'exterior' ? exteriorFolder : interiorFolder;
        
        folder?.file(filename, blob);

        // Ajouter métadonnées JSON
        const metadata = {
          subject: view.spec.subject,
          prompt: view.prompt,
          model: view.model,
          quality: view.spec.quality,
          timeOfDay: view.spec.timeOfDay,
          cost: view.cost,
          processingTime: view.processingTime
        };
        folder?.file(`${filename}.json`, JSON.stringify(metadata, null, 2));
      }

      // Générer et télécharger
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rendus_3d_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('ZIP téléchargé !', { id: 'zip-download' });
    } catch (error) {
      console.error('Erreur création ZIP:', error);
      toast.error('Erreur lors de la création du ZIP', { id: 'zip-download' });
    }
  };

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full my-4 overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 max-h-[90vh]">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ImageIcon className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Génération Série de Vues 3D
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">BATCH</span>
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {viewSpec.views.length} vues à générer • Style {analysis.project.style}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
          
          {/* Progression globale */}
          {progress && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Progression globale
                </h3>
                <div className="flex items-center space-x-4">
                  {isGenerating && (
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  )}
                  {completedJobs.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger tout (ZIP)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{progress.completed} / {progress.totalJobs} complétés</span>
                  <span>{progress.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress.overallProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>En cours: {progress.inProgress} • File: {progress.queued}</span>
                  {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
                    <span>Temps restant: ~{Math.ceil(progress.estimatedTimeRemaining / 60)} min</span>
                  )}
                </div>
              </div>

              {failedJobs.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    ⚠️ {failedJobs.length} échec(s) - Cliquez sur "Retry" pour réessayer
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bouton de démarrage */}
          {!batchId && (
            <div className="text-center py-12">
              <button
                onClick={startGeneration}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                <Play className="w-6 h-6" />
                <span>Lancer la génération ({viewSpec.views.length} vues)</span>
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Durée estimée: ~{Math.ceil(viewSpec.views.length * 60 / 2)} minutes
              </p>
            </div>
          )}

          {/* Liste des jobs */}
          {jobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vues en génération
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    {/* Statut */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {job.viewSpec.subject}
                      </span>
                      {job.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      {job.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      {job.status === 'processing' && <Clock className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />}
                      {job.status === 'queued' && <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </div>

                    {/* Image ou placeholder */}
                    {job.result?.imageUrl ? (
                      <div className="relative group cursor-pointer" onClick={() => setSelectedView(job.result!)}>
                        <img
                          src={job.result.imageUrl}
                          alt={job.viewSpec.subject}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {job.status === 'processing' && (
                          <div className="text-center">
                            <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.progress}%</p>
                          </div>
                        )}
                        {job.status === 'queued' && (
                          <p className="text-sm text-gray-500">En attente...</p>
                        )}
                        {job.status === 'failed' && (
                          <p className="text-sm text-red-500">Échec</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {job.viewSpec.category === 'exterior' ? '🏠 Extérieur' : '🛋️ Intérieur'} • {job.viewSpec.timeOfDay}
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && job.result && (
                          <button
                            onClick={() => handleDownload(job.result!)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Réessayer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Erreur */}
                    {job.error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                        {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {selectedView && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedView(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedView.imageUrl}
                alt={selectedView.spec.subject}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedView(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => handleDownload(selectedView)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>
            </div>
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {selectedView.spec.subject}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {selectedView.prompt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Modèle: {selectedView.model}</span>
                <span>Temps: {selectedView.processingTime.toFixed(1)}s</span>
                <span>Coût: ${selectedView.cost.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchRenderGenerator;

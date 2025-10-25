/**
 * Composant de génération de rendus 3D architecturaux par IA
 */

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Download, 
  Eye,
  Loader2,
  Image as ImageIcon,
  Sun,
  Moon,
  Sunset,
  Building2,
  Home,
  Factory,
  Minimize2
} from 'lucide-react';
import render3DService, { Render3DRequest, Render3DResult, RenderProgress } from '../../services/ai/render3DService';

interface Render3DGeneratorProps {
  planImage?: string; // Base64 ou URL du plan
  onClose?: () => void;
}

const Render3DGenerator: React.FC<Render3DGeneratorProps> = ({ planImage, onClose }) => {
  // États
  const [selectedStyle, setSelectedStyle] = useState<Render3DRequest['style']>('3d-modern');
  const [selectedView, setSelectedView] = useState<Render3DRequest['viewAngle']>('3d-perspective');
  const [selectedTime, setSelectedTime] = useState<'day' | 'sunset' | 'night'>('day');
  const [quality, setQuality] = useState<'draft' | 'standard' | 'hd'>('standard');
  const [numVariations, setNumVariations] = useState(1);
  const [precisionMode, setPrecisionMode] = useState<'standard' | 'precise'>('standard'); // 🆕 Mode de précision
  const [model, setModel] = useState<'sdxl' | 'flux-pro' | 'flux-1.1-pro' | 'seedream-4' | 'imagen-4'>('flux-pro'); // 🆕 Modèle IA
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [generatedRenders, setGeneratedRenders] = useState<Render3DResult[]>([]);
  const [selectedRender, setSelectedRender] = useState<Render3DResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Styles disponibles
  const styles = [
    { id: '3d-modern' as const, label: 'Moderne', icon: Building2, description: 'Design contemporain épuré' },
    { id: '3d-traditional' as const, label: 'Traditionnel', icon: Home, description: 'Architecture classique' },
    { id: '3d-industrial' as const, label: 'Industriel', icon: Factory, description: 'Style urbain brut' },
    { id: '3d-minimalist' as const, label: 'Minimaliste', icon: Minimize2, description: 'Simplicité zen' },
    { id: '3d-african' as const, label: 'Africain', icon: Home, description: 'Architecture locale' }
  ];

  // Angles de vue
  const views = [
    { id: 'front-facade' as const, label: 'Façade', description: 'Vue de face' },
    { id: 'aerial-view' as const, label: 'Aérienne', description: 'Vue du dessus' },
    { id: '3d-perspective' as const, label: 'Perspective 3D', description: 'Vue en 3 dimensions' },
    { id: 'interior' as const, label: 'Intérieur', description: 'Vue intérieure' }
  ];

  // Heures de la journée
  const times = [
    { id: 'day' as const, label: 'Jour', icon: Sun },
    { id: 'sunset' as const, label: 'Coucher de soleil', icon: Sunset },
    { id: 'night' as const, label: 'Nuit', icon: Moon }
  ];

  /**
   * Génère les rendus 3D
   */
  const handleGenerate = async () => {
    if (!planImage) {
      const errorMsg = 'Aucun plan chargé';
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(null);

    try {
      const request: Render3DRequest = {
        planImage,
        style: selectedStyle,
        viewAngle: selectedView,
        timeOfDay: selectedTime,
        quality,
        numVariations,
        precisionMode,
        model // 🆕 modèle sélectionné
      };

      const results = await render3DService.generate3DRenderWithProgress(
        request,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setGeneratedRenders(results);
      if (results.length > 0) {
        setSelectedRender(results[0]);
        toast.success(`✨ ${results.length} rendu(s) 3D généré(s) avec succès !`, { duration: 4000 });
      }

    } catch (err) {
      console.error('Erreur génération:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la génération';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { duration: 5000 });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Télécharge un rendu
   */
  const handleDownload = async (render: Render3DResult) => {
    try {
      const filename = `rendu-3d-${render.style}-${Date.now()}.png`;
      await render3DService.downloadImage(render.imageUrl, filename);
      toast.success(`📄 Rendu téléchargé : ${filename}`, { duration: 3000 });
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      const errorMsg = 'Erreur lors du téléchargement';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { duration: 4000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full my-4 overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* En-tête amélioré */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-4 sm:p-6 text-white relative overflow-hidden">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  Générateur de Rendus 3D IA
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">BETA</span>
                </h2>
                <p className="text-purple-100 text-xs sm:text-sm mt-1">Transformez votre plan en visualisation photoréaliste</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-110 active:scale-95"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Panneau de configuration */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Modèle IA */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Modèle IA</h3>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as typeof model)}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="flux-pro">black-forest-labs/flux-pro (qualité élevée)</option>
                  <option value="flux-1.1-pro">black-forest-labs/flux-1.1-pro (précision élevée)</option>
                  <option value="seedream-4">bytedance/seedream-4 (réalisme)</option>
                  <option value="imagen-4">google/imagen-4 (photorealiste)</option>
                  <option value="sdxl">stability-ai/sdxl (standard)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choisissez le moteur de rendu. Flux 1.1 Pro offre une très haute fidélité géométrique.</p>
              </div>
              
              {/* Style architectural */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Style Architectural
                </h3>
                <div className="space-y-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedStyle === style.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <style.icon className={`w-5 h-5 ${selectedStyle === style.id ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle de vue */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Angle de Vue
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setSelectedView(view.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedView === view.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{view.label}</div>
                      <div className="text-xs text-gray-500">{view.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Heure de la journée */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Éclairage</h3>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((time) => (
                    <button
                      key={time.id}
                      onClick={() => setSelectedTime(time.id)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                        selectedTime === time.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <time.icon className={`w-6 h-6 mb-1 ${selectedTime === time.id ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className="text-xs text-gray-900 dark:text-white">{time.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode de précision */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  🎯 Mode de Précision
                </h3>
                <select
                  value={precisionMode}
                  onChange={(e) => setPrecisionMode(e.target.value as 'standard' | 'precise')}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="standard">Standard (70-85% fidélité)</option>
                  <option value="precise">🆕 Précis - Flux 1.1 Pro (95% fidélité)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {precisionMode === 'precise' 
                    ? '✨ Mode PRÉCIS (Flux 1.1 Pro) : Respecte au mieux la géométrie du plan (+60% coût)'
                    : 'Mode standard : Bon équilibre qualité/vitesse'}
                </p>
              </div>

              {/* Qualité */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Qualité</h3>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as 'draft' | 'standard' | 'hd')}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Brouillon (rapide)</option>
                  <option value="standard">Standard</option>
                  <option value="hd">Haute Définition</option>
                </select>
              </div>

              {/* Nombre de variations */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Variations</h3>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={numVariations}
                  onChange={(e) => setNumVariations(parseInt(e.target.value))}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">1 à 4 rendus différents</p>
              </div>

              {/* Bouton génération amélioré */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !planImage}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 relative overflow-hidden group ${
                  isGenerating || !planImage
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95'
                }`}
              >
                {!isGenerating && !planImage && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                )}
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    <span>Générer Rendu 3D</span>
                  </>
                )}
              </button>
              
              {!planImage && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                    ⚠️ Veuillez d'abord analyser un plan architectural
                  </p>
                </div>
              )}

              {/* Progression */}
              {progress && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{progress.message}</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.estimatedTime && progress.estimatedTime > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Temps restant estimé: {progress.estimatedTime}s
                    </p>
                  )}
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>

            {/* Panneau de résultats */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Rendu principal */}
              {selectedRender ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                    <img
                      src={selectedRender.imageUrl}
                      alt="Rendu 3D"
                      className="w-full rounded-xl shadow-2xl transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleDownload(selectedRender)}
                        className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {styles.find(s => s.id === selectedRender.style)?.label} - {views.find(v => v.id === selectedRender.viewAngle)?.label}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Style</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {styles.find(s => s.id === selectedRender.style)?.label}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vue</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {views.find(v => v.id === selectedRender.viewAngle)?.label}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temps</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedRender.processingTime.toFixed(1)}s
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coût</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${selectedRender.cost.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-12 sm:p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="relative inline-block">
                    <ImageIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Prêt à générer votre rendu 3D ?
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Configurez les options à gauche et cliquez sur "Générer Rendu 3D"
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>IA prête</span>
                  </div>
                </div>
              )}

              {/* Galerie de variations */}
              {generatedRenders.length > 1 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Variations</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {generatedRenders.map((render) => (
                      <button
                        key={render.id}
                        onClick={() => setSelectedRender(render)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          selectedRender?.id === render.id
                            ? 'border-purple-600 ring-2 ring-purple-600'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={render.imageUrl}
                          alt={`Variation ${render.id}`}
                          className="w-full aspect-square object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Render3DGenerator;

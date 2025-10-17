/**
 * Composant de génération de rendus 3D architecturaux par IA
 */

import React, { useState } from 'react';
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
      setError('Aucun plan chargé');
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
        precisionMode // 🆕 Ajout du mode de précision
      };

      const results = await render3DService.generate3DRenderWithProgress(
        request,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setGeneratedRenders(results);
      if (results.length > 0) {
        setSelectedRender(results[0]);
      }

    } catch (err) {
      console.error('Erreur génération:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
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
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Générateur de Rendus 3D IA</h2>
                <p className="text-purple-100 text-sm">Transformez votre plan en visualisation photoréaliste</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panneau de configuration */}
            <div className="lg:col-span-1 space-y-6">
              
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
                  <option value="precise">🆕 Précis - ControlNet (95% fidélité)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {precisionMode === 'precise' 
                    ? '✨ Mode PRÉCIS : Respecte exactement les contours du plan (+50% coût)'
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

              {/* Bouton génération */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !planImage}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                  isGenerating || !planImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Générer Rendu 3D</span>
                  </>
                )}
              </button>

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
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <div className="relative group">
                    <img
                      src={selectedRender.imageUrl}
                      alt="Rendu 3D"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownload(selectedRender)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Informations */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Style:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {styles.find(s => s.id === selectedRender.style)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vue:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {views.find(v => v.id === selectedRender.viewAngle)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Temps de génération:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedRender.processingTime.toFixed(1)}s
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Coût:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        ${selectedRender.cost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Configurez les options et cliquez sur "Générer Rendu 3D"
                  </p>
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

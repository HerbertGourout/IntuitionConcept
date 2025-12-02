import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Download, 
  X,
  Loader2,
  Sun,
  Moon,
  Sunset,
  Building2,
  Home,
  Factory,
  Minimize2
} from 'lucide-react';

interface Render3DGeneratorProps {
  planImage?: string;
  onClose?: () => void;
}

const Render3DGenerator: React.FC<Render3DGeneratorProps> = ({ planImage, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('3d-modern');
  const [selectedView, setSelectedView] = useState<string>('3d-perspective');
  const [selectedTime, setSelectedTime] = useState<'day' | 'sunset' | 'night'>('day');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const styles = [
    { id: '3d-modern', label: 'Moderne', icon: Building2, description: 'Design contemporain épuré' },
    { id: '3d-traditional', label: 'Traditionnel', icon: Home, description: 'Architecture classique' },
    { id: '3d-industrial', label: 'Industriel', icon: Factory, description: 'Style urbain brut' },
    { id: '3d-minimalist', label: 'Minimaliste', icon: Minimize2, description: 'Simplicité zen' },
  ];

  const views = [
    { id: 'front-facade', label: 'Façade', description: 'Vue de face' },
    { id: 'aerial-view', label: 'Aérienne', description: 'Vue du dessus' },
    { id: '3d-perspective', label: 'Perspective 3D', description: 'Vue en 3 dimensions' },
    { id: 'interior', label: 'Intérieur', description: 'Vue intérieure' }
  ];

  const times = [
    { id: 'day' as const, label: 'Jour', icon: Sun },
    { id: 'sunset' as const, label: 'Coucher de soleil', icon: Sunset },
    { id: 'night' as const, label: 'Nuit', icon: Moon }
  ];

  const handleGenerate = async () => {
    if (!planImage) {
      toast.error('Aucun plan fourni');
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Use a placeholder image for demo
    setGeneratedImage('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800');
    setIsGenerating(false);
    toast.success('Rendu 3D généré avec succès !');
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `rendu-3d-${Date.now()}.png`;
      link.click();
      toast.success('Image téléchargée');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Générateur de Rendu 3D</h2>
              <p className="text-purple-100 text-sm">Créez des visualisations réalistes de votre projet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Options */}
            <div className="space-y-6">
              {/* Style */}
              <div>
                <h3 className="font-semibold mb-3">Style architectural</h3>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedStyle === style.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <div className="font-medium text-sm">{style.label}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View */}
              <div>
                <h3 className="font-semibold mb-3">Angle de vue</h3>
                <div className="grid grid-cols-2 gap-2">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setSelectedView(view.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedView === view.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{view.label}</div>
                      <div className="text-xs text-gray-500">{view.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of day */}
              <div>
                <h3 className="font-semibold mb-3">Moment de la journée</h3>
                <div className="flex gap-2">
                  {times.map((time) => {
                    const Icon = time.icon;
                    return (
                      <button
                        key={time.id}
                        onClick={() => setSelectedTime(time.id)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                          selectedTime === time.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-sm">{time.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer le rendu 3D
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold">Aperçu</h3>
              
              {/* Plan source */}
              {planImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Plan source</p>
                  <img
                    src={planImage}
                    alt="Plan source"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Generated render */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-2" />
                    <p className="text-gray-500">Génération du rendu 3D...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="w-full">
                    <img
                      src={generatedImage}
                      alt="Rendu 3D"
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={handleDownload}
                      className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Le rendu 3D apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Render3DGenerator;

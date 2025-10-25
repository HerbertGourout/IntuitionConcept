/**
 * Page de génération de rendus 3D architecturaux
 * Utilise Replicate API (SDXL + ControlNet) pour la génération
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Image as ImageIcon, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import PlanUploader from '../components/AI/PlanUploader';
import Render3DGenerator from '../components/AI/Render3DGenerator';
import { ArchitecturalAnalysis, PageClassification } from '../types/architecturalAnalysis';
import { pageClassifier } from '../services/ai/pageClassifier';

const Rendu3D: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [planImageBase64, setPlanImageBase64] = useState<string | null>(null);
  const [pdfThumbnails, setPdfThumbnails] = useState<string[]>([]);
  const [highResPlanImages, setHighResPlanImages] = useState<Map<number, string>>(new Map());
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageClassifications, setPageClassifications] = useState<PageClassification[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ArchitecturalAnalysis | null>(null);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);

  // Récupérer le fichier et l'analyse depuis la navigation (si venant de AnalysePlan)
  useEffect(() => {
    const stateFile = location.state?.file as File | undefined;
    const stateAnalysis = location.state?.analysisResult as ArchitecturalAnalysis | undefined;
    
    if (stateFile) {
      setUploadedFile(stateFile);
      convertFileToBase64(stateFile);
    }
    
    if (stateAnalysis) {
      setAnalysisResult(stateAnalysis);
      console.log('✅ Analyse architecturale reçue:', stateAnalysis);
    }
  }, [location.state]);

  const convertFileToBase64 = async (file: File) => {
    try {
      if (file.type === 'application/pdf') {
        // Générer des vignettes pour toutes les pages et laisser l'utilisateur choisir
        toast.loading('Analyse du PDF...', { id: 'pdf-convert' });

        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const thumbs: string[] = [];
        const thumbScale = 1.2; // économe pour les vignettes
        for (let i = 1; i <= pdf.numPages; i++) {
          // eslint-disable-next-line no-await-in-loop
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: thumbScale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Impossible de créer le contexte canvas');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // eslint-disable-next-line no-await-in-loop
          await page.render({ canvasContext: context, viewport }).promise;
          thumbs.push(canvas.toDataURL('image/png', 0.92));
        }
        setPdfThumbnails(thumbs);

        // Par défaut, sélectionner la page 2 si disponible (éviter la couverture)
        const defaultIndex = pdf.numPages > 1 ? 1 : 0;
        setSelectedPageIndex(defaultIndex);

        // Rendu HD de la page sélectionnée
        const renderHighRes = async (pageIndex: number) => {
          const page = await pdf.getPage(pageIndex + 1);
          const scale = 3.5; // HD pour le modèle 3D
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Impossible de créer le contexte canvas');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;

          // Légère amélioration du contraste
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const contrastFactor = 1.15;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrastFactor + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrastFactor + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrastFactor + 128));
          }
          context.putImageData(imageData, 0, 0);

          setPlanImageBase64(canvas.toDataURL('image/png', 1.0));
        };

        await renderHighRes(defaultIndex);
        toast.success('PDF chargé. Sélectionnez la bonne page avant génération.', { id: 'pdf-convert' });
      } else if (file.type.startsWith('image/')) {
        // Fichier image direct
        const reader = new FileReader();
        reader.onload = (e) => {
          setPlanImageBase64(e.target?.result as string);
          toast.success('Image chargée !');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erreur conversion:', error);
      toast.error('Erreur lors de la conversion du fichier');
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    convertFileToBase64(file);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setPlanImageBase64(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/app/analyse')}
                className="mb-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à l'analyse</span>
              </button>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
                Génération de Rendu 3D
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Transformez votre plan architectural en rendus 3D photoréalistes avec l'IA
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {!planImageBase64 ? (
            /* Zone d'upload */
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                📄 Étape 1 : Uploadez votre plan
              </h2>
              <PlanUploader
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                uploadedFile={uploadedFile}
                acceptedFormats=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={10}
                showPreview={true}
              />
              {/* Sélection des pages du PDF */}
              {uploadedFile && uploadedFile.type === 'application/pdf' && pdfThumbnails.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Étape 2 : Sélectionnez la page à rendre en 3D
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {pdfThumbnails.map((thumb, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          setSelectedPageIndex(idx);
                          // Reconvertir en HD uniquement quand on choisit une page
                          // Relancer la conversion haute résolution à partir du fichier chargé
                          if (uploadedFile) {
                            // Recharger le PDF et rendre la page choisie
                            const arrayBuffer = await uploadedFile.arrayBuffer();
                            const pdfjsLib = await import('pdfjs-dist');
                            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                            const pdf = await loadingTask.promise;
                            const page = await pdf.getPage(idx + 1);
                            const scale = 3.5;
                            const viewport = page.getViewport({ scale });
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            await page.render({ canvasContext: ctx, viewport }).promise;
                            const img = canvas.toDataURL('image/png', 1.0);
                            setPlanImageBase64(img);
                          }
                        }}
                        className={`relative border rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          selectedPageIndex === idx ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-slate-300'
                        }`}
                        title={`Page ${idx + 1}`}
                      >
                        <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-auto" />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    Astuce: la page 1 est souvent la page de garde. Choisissez une page de plan (ex: niveaux, façades) pour de meilleurs rendus.
                  </p>
                </div>
              )}

              {/* Informations */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">Styles Variés</h3>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Moderne, Traditionnel, Industriel, Minimaliste, Africain - Choisissez le style qui vous convient
                  </p>
                </div>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    <h3 className="font-semibold text-pink-900 dark:text-pink-300">Vues Multiples</h3>
                  </div>
                  <p className="text-sm text-pink-700 dark:text-pink-400">
                    Façade, Perspective 3D, Vue aérienne, Intérieur - Visualisez sous tous les angles
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Haute Qualité</h3>
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400">
                    Rendus photoréalistes en HD avec IA Stable Diffusion XL et ControlNet pour précision maximale
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Générateur 3D */
            <Render3DGenerator
              planImage={planImageBase64}
              onClose={handleFileRemove}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Rendu3D;

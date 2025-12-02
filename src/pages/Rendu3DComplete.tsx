/**
 * Page complète de génération de rendus 3D architecturaux en mode batch
 * Avec multi-sélection, classification automatique et génération série
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, CheckSquare, Square, Zap, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import PlanUploader from '../components/AI/PlanUploader';
import BatchRenderGenerator from '../components/AI/BatchRenderGenerator';
import { ArchitecturalAnalysis, PageClassification, ViewGenerationSpec } from '../types/architecturalAnalysis';
import { pageClassifier } from '../services/ai/pageClassifier';
import { viewSpecGenerator } from '../services/ai/viewSpecGenerator';

const Rendu3DComplete: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // États de base
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfThumbnails, setPdfThumbnails] = useState<string[]>([]);
  const [highResPlanImages, setHighResPlanImages] = useState<Map<number, string>>(new Map());
  
  // Multi-sélection et classification
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageClassifications, setPageClassifications] = useState<PageClassification[]>([]);
  
  // Analyse et génération
  const [analysisResult, setAnalysisResult] = useState<ArchitecturalAnalysis | null>(null);
  const [viewSpec, setViewSpec] = useState<ViewGenerationSpec | null>(null);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);
  
  // Configuration
  const [quality, setQuality] = useState<'draft' | 'standard' | 'hd' | '4k'>('hd');
  const [includeVariants, setIncludeVariants] = useState(true);
  const [generateInteriors, setGenerateInteriors] = useState(true);
  const [generateExteriors, setGenerateExteriors] = useState(true);

  // Récupérer le fichier et l'analyse depuis la navigation
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
      toast.success('Analyse architecturale chargée !');
    }
  }, [location.state]);

  // Conversion PDF en thumbnails + images HD
  const convertFileToBase64 = async (file: File) => {
    try {
      if (file.type === 'application/pdf') {
        toast.loading('Analyse du PDF...', { id: 'pdf-convert' });

        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const thumbs: string[] = [];
        const highResImages = new Map<number, string>();
        const thumbScale = 1.2;
        const highResScale = 3.5;

        // Générer thumbnails et images HD
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          
          // Thumbnail
          const thumbViewport = page.getViewport({ scale: thumbScale });
          const thumbCanvas = document.createElement('canvas');
          const thumbContext = thumbCanvas.getContext('2d');
          if (!thumbContext) throw new Error('Impossible de créer le contexte canvas');
          thumbCanvas.height = thumbViewport.height;
          thumbCanvas.width = thumbViewport.width;
          await page.render({ canvasContext: thumbContext, viewport: thumbViewport }).promise;
          thumbs.push(thumbCanvas.toDataURL('image/png', 0.92));

          // Image HD
          const hdViewport = page.getViewport({ scale: highResScale });
          const hdCanvas = document.createElement('canvas');
          const hdContext = hdCanvas.getContext('2d');
          if (!hdContext) throw new Error('Impossible de créer le contexte canvas');
          hdCanvas.height = hdViewport.height;
          hdCanvas.width = hdViewport.width;
          await page.render({ canvasContext: hdContext, viewport: hdViewport }).promise;
          
          // Amélioration contraste
          const imageData = hdContext.getImageData(0, 0, hdCanvas.width, hdCanvas.height);
          const data = imageData.data;
          const contrastFactor = 1.15;
          for (let j = 0; j < data.length; j += 4) {
            data[j] = Math.min(255, Math.max(0, (data[j] - 128) * contrastFactor + 128));
            data[j + 1] = Math.min(255, Math.max(0, (data[j + 1] - 128) * contrastFactor + 128));
            data[j + 2] = Math.min(255, Math.max(0, (data[j + 2] - 128) * contrastFactor + 128));
          }
          hdContext.putImageData(imageData, 0, 0);
          
          highResImages.set(i - 1, hdCanvas.toDataURL('image/png', 1.0));
        }

        setPdfThumbnails(thumbs);
        setHighResPlanImages(highResImages);

        // Classification automatique
        toast.loading('Classification des pages...', { id: 'pdf-convert' });
        const classifications = await classifyPages(thumbs);
        setPageClassifications(classifications);

        // Sélection automatique (éviter page 1 si page de garde)
        const autoSelect = classifications
          .filter(c => c.type !== 'page-garde' && c.type !== 'inconnu')
          .map(c => c.pageIndex);
        
        if (autoSelect.length > 0) {
          setSelectedPages(autoSelect);
        } else {
          // Fallback: sélectionner pages 2-4
          const fallbackSelect = Array.from({ length: Math.min(3, pdf.numPages - 1) }, (_, i) => i + 1);
          setSelectedPages(fallbackSelect);
        }

        toast.success(`PDF chargé: ${pdf.numPages} pages • ${autoSelect.length} pages pertinentes détectées`, { id: 'pdf-convert' });
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setPdfThumbnails([imageData]);
          setHighResPlanImages(new Map([[0, imageData]]));
          setSelectedPages([0]);
          setPageClassifications([{
            pageIndex: 0,
            type: 'inconnu',
            confidence: 0.5,
            detectedKeywords: [],
            suggestedViews: ['perspective-3d']
          }]);
          toast.success('Image chargée !');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erreur conversion:', error);
      toast.error('Erreur lors de la conversion du fichier');
    }
  };

  // Classification des pages
  const classifyPages = async (thumbnails: string[]): Promise<PageClassification[]> => {
    const classifications: PageClassification[] = [];
    
    for (let i = 0; i < thumbnails.length; i++) {
      // Utiliser classification par position comme fallback
      const classification = pageClassifier.classifyByPosition(i, thumbnails.length);
      classifications.push(classification);
    }
    
    return classifications;
  };

  // Toggle sélection page
  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => 
      prev.includes(pageIndex)
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  // Sélectionner/désélectionner tout
  const toggleSelectAll = () => {
    if (selectedPages.length === pdfThumbnails.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pdfThumbnails.map((_, i) => i));
    }
  };

  // Générer les spécifications de vues
  const handleGenerateViews = () => {
    if (!analysisResult) {
      toast.error('Analyse architecturale manquante. Veuillez d\'abord analyser le plan.');
      return;
    }

    if (selectedPages.length === 0) {
      toast.error('Veuillez sélectionner au moins une page');
      return;
    }

    const spec = viewSpecGenerator.generateViewSpecs(
      analysisResult,
      pageClassifications,
      selectedPages,
      {
        includeVariants,
        quality,
        generateInteriors,
        generateExteriors
      }
    );

    setViewSpec(spec);
    setShowBatchGenerator(true);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    convertFileToBase64(file);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setPdfThumbnails([]);
    setHighResPlanImages(new Map());
    setSelectedPages([]);
    setPageClassifications([]);
    setViewSpec(null);
  };

  // Badge de type de page
  const getPageTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'facade': { label: 'Façade', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'plan-niveau': { label: 'Niveau', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'coupe': { label: 'Coupe', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      'plan-interieur': { label: 'Intérieur', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      'plan-masse': { label: 'Masse', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
      'page-garde': { label: 'Garde', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' },
      'inconnu': { label: '?', color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500' }
    };

    const badge = badges[type] || badges['inconnu'];
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/analyse')}
            className="mb-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à l'analyse</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
            Génération Série de Vues 3D
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Générez automatiquement des rendus 3D photoréalistes (extérieurs + intérieurs + variantes)
          </p>
        </div>

        {/* Contenu principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {pdfThumbnails.length === 0 ? (
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
            </div>
          ) : (
            /* Multi-sélection + Configuration */
            <div className="space-y-8">
              {/* Sélection des pages */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Étape 2 : Sélectionnez les pages à rendre en 3D
                  </h3>
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center space-x-2"
                  >
                    {selectedPages.length === pdfThumbnails.length ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Tout désélectionner</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Tout sélectionner</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pdfThumbnails.map((thumb, idx) => {
                    const classification = pageClassifications.find(c => c.pageIndex === idx);
                    const isSelected = selectedPages.includes(idx);

                    return (
                      <button
                        key={idx}
                        onClick={() => togglePageSelection(idx)}
                        className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                          isSelected
                            ? 'ring-4 ring-purple-500 border-purple-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          {isSelected ? (
                            <CheckSquare className="w-6 h-6 text-purple-600 bg-white rounded" />
                          ) : (
                            <Square className="w-6 h-6 text-gray-400 bg-white rounded" />
                          )}
                        </div>

                        {/* Badge type */}
                        {classification && (
                          <div className="absolute top-2 right-2 z-10">
                            {getPageTypeBadge(classification.type)}
                          </div>
                        )}

                        {/* Image */}
                        <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-auto" />

                        {/* Numéro page */}
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          Page {idx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                   {selectedPages.length} page(s) sélectionnée(s) • Les pages sont classifiées automatiquement
                </p>
              </div>

              {/* Configuration */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Étape 3 : Configuration de la génération
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Qualité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Qualité
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as typeof quality)}
                      className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="draft">Draft (rapide)</option>
                      <option value="standard">Standard</option>
                      <option value="hd">HD (recommandé)</option>
                      <option value="4k">4K (haute qualité)</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateExteriors}
                        onChange={(e) => setGenerateExteriors(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Générer vues extérieures (façades, aérienne)
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateInteriors}
                        onChange={(e) => setGenerateInteriors(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Générer vues intérieures (pièces)
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeVariants}
                        onChange={(e) => setIncludeVariants(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Inclure variantes (jour/nuit, styles déco)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Estimation */}
                {analysisResult && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-900 dark:text-purple-300">
                      <strong>Estimation:</strong> ~
                      {generateExteriors && analysisResult.facades.length * 2} vues extérieures +
                      {generateInteriors && analysisResult.rooms.filter(r => ['salon', 'cuisine', 'chambre'].includes(r.type)).length * 2} vues intérieures
                      {includeVariants && ' (x2 avec variantes)'}
                      • Durée: ~{Math.ceil((generateExteriors ? analysisResult.facades.length * 2 : 0 + generateInteriors ? analysisResult.rooms.length * 2 : 0) * 60 / 2)} min
                    </p>
                  </div>
                )}
              </div>

              {/* Bouton de génération */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handleGenerateViews}
                  disabled={selectedPages.length === 0 || !analysisResult}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  <Zap className="w-6 h-6" />
                  <span>Générer la série de vues 3D</span>
                </button>
              </div>

              {!analysisResult && (
                <p className="text-center text-sm text-orange-600 dark:text-orange-400">
                  ⚠️ Analyse architecturale manquante. Veuillez d'abord analyser le plan dans l'onglet "Analyse".
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Generator Modal */}
      {showBatchGenerator && viewSpec && (
        <BatchRenderGenerator
          viewSpec={viewSpec}
          planImages={highResPlanImages}
          analysis={analysisResult!}
          onClose={() => setShowBatchGenerator(false)}
        />
      )}
    </div>
  );
};

export default Rendu3DComplete;

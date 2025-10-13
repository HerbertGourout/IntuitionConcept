import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileImage, 
  Zap, 
  DollarSign,
  Home,
  Building,
  CheckCircle,
  AlertTriangle,
  Download,
  Play,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { ClaudeServiceDirect, initializeClaudeServiceDirect } from '../../services/ai/claudeServiceDirect';
import { PDFSplitter, extractPDFMetadata, getPDFFileStats } from '../../utils/pdfSplitter';

// Types pour l'analyse architecturale
interface Wall {
  type: string;
  material?: string;
}

interface Room {
  name: string;
  area?: number;
  dimensions?: string | { length: number; width: number; height?: number };
}

interface AnalysisStep {
  id: string;
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface ArchitecturalPlanAnalysis {
  extractedMeasurements: {
    rooms?: Room[];
    totalArea?: number;
  };
  constructionElements?: {
    walls?: Wall[];
  };
  estimatedComplexity?: 'low' | 'moderate' | 'high' | 'very_high';
  planType?: string;
}

interface GeneratedQuote {
  totalCost?: number;
  totalDuration?: number;
  title?: string;
  phases?: Array<{
    name?: string;
    description?: string;
    totalCost?: number;
    duration?: number;
  }>;
}

const ArchitecturalPlanAnalyzer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ArchitecturalPlanAnalysis | null>(null);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatAmount } = useCurrency();

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'ocr',
      title: 'Extraction OCR du plan',
      status: 'waiting',
      progress: 0
    },
    {
      id: 'analysis',
      title: 'Analyse architecturale IA',
      status: 'waiting',
      progress: 0
    },
    {
      id: 'quote',
      title: 'Génération du devis',
      status: 'waiting',
      progress: 0
    }
  ]);

  const updateStepStatus = (stepId: string, status: AnalysisStep['status'], progress: number = 0) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const handleFileUpload = useCallback(async (file: File) => {
    // Vérifier la taille du fichier
    const fileSizeMB = file.size / (1024 * 1024);
    
    console.log(`📄 Fichier uploadé: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
    
    // Validation du fichier
    if (!file.type.includes('pdf')) {
      setError('⚠️ Seuls les fichiers PDF sont supportés pour une analyse sans perte de qualité.');
      return;
    }

    try {
      // Extraire les métadonnées sans modifier le fichier
      const metadata = await extractPDFMetadata(file);
      console.log('📊 Métadonnées PDF:', metadata);
      
      // Obtenir les statistiques
      const stats = await getPDFFileStats(file);
      console.log('📈 Statistiques PDF:', stats);
      
      setUploadedFile(file);
      setError(null);
      setAnalysis(null);
      setGeneratedQuote(null);
      
      // Reset analysis steps
      setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
      
      console.log(`✅ Fichier prêt pour analyse (${stats.pageCount} pages, qualité préservée à 100%)`);
      
    } catch (err) {
      console.error('❌ Erreur validation PDF:', err);
      setError('Erreur lors de la validation du PDF. Assurez-vous que le fichier est valide.');
    }
    
    return false; // Prevent default upload
  }, []);

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const fileSizeMB = uploadedFile.size / (1024 * 1024);
      console.log(`🚀 Démarrage analyse sans perte - Fichier: ${fileSizeMB.toFixed(2)} MB`);

      // Step 1: Découpe PDF sans compression
      updateStepStatus('ocr', 'processing', 10);
      console.log('✂️ Découpe PDF par page (qualité 100% préservée)...');
      
      const splitResult = await PDFSplitter.splitPDF(uploadedFile, {
        preserveMetadata: true,
        preserveQuality: true,
        extractImages: true,
        includeAnnotations: true
      });
      
      console.log(`📑 ${splitResult.pages.length} pages extraites sans perte`);
      console.log(`📊 Taille totale: ${(splitResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
      updateStepStatus('ocr', 'completed', 100);

      // Step 2: Initialiser Claude Service Direct
      updateStepStatus('analysis', 'processing', 10);
      
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('❌ Clé API Anthropic manquante. Configurez VITE_ANTHROPIC_API_KEY dans .env.local');
      }
      
      const claudeService = initializeClaudeServiceDirect(apiKey, ClaudeServiceDirect.getAvailableModels().SONNET);
      
      // Vérifier la santé du service
      const isHealthy = await claudeService.healthCheck();
      if (!isHealthy) {
        throw new Error('❌ Service Claude non disponible. Vérifiez votre clé API.');
      }
      
      console.log('✅ Service Claude initialisé et opérationnel');
      updateStepStatus('analysis', 'processing', 30);

      // Step 3: Analyser le PDF avec Claude (sans perte)
      console.log('🔍 Analyse architecturale avec Claude (PDF natif)...');
      
      const analysisResult = await claudeService.analyzePDFArchitecturalPlan(uploadedFile, {
        preserveQuality: true,
        splitByPage: true,
        extractMetadata: true,
        maxPagesPerRequest: 5,
        includeImages: true
      });
      
      console.log('✅ Analyse Claude terminée:', analysisResult);
      console.log(`💰 Coût: ${analysisResult.metadata.cost.toFixed(2)} FCFA`);
      console.log(`⏱️ Durée: ${(analysisResult.metadata.processingTime / 1000).toFixed(2)}s`);
      
      // Convertir au format attendu par l'interface
      const convertedAnalysis: ArchitecturalPlanAnalysis = {
        extractedMeasurements: {
          rooms: analysisResult.architecturalData.measurements.rooms || [],
          totalArea: analysisResult.architecturalData.measurements.totalArea
        },
        constructionElements: {
          walls: analysisResult.architecturalData.measurements.walls?.map(w => ({
            type: w.type,
            material: w.material
          })) || []
        },
        estimatedComplexity: analysisResult.architecturalData.estimatedComplexity,
        planType: analysisResult.architecturalData.planType
      };
      
      setAnalysis(convertedAnalysis);
      updateStepStatus('analysis', 'completed', 100);

      // Step 4: Génération du devis (basé sur l'analyse)
      updateStepStatus('quote', 'processing', 50);
      console.log('📝 Génération du devis depuis l\'analyse...');
      
      const totalArea = analysisResult.architecturalData.measurements.totalArea || 100;
      const roomCount = analysisResult.architecturalData.measurements.rooms?.length || 3;
      const complexity = analysisResult.architecturalData.estimatedComplexity;
      
      // Calcul estimatif basé sur l'analyse
      const basePrice = totalArea * 800; // 800 FCFA/m²
      const complexityMultiplier = {
        'low': 1.0,
        'moderate': 1.3,
        'high': 1.6,
        'very_high': 2.0
      }[complexity] || 1.3;
      
      const estimatedTotal = basePrice * complexityMultiplier;
      
      const generatedQuote: GeneratedQuote = {
        totalCost: estimatedTotal,
        totalDuration: Math.ceil(totalArea / 10), // 10m²/jour
        title: `Devis - ${splitResult.originalMetadata.title || uploadedFile.name}`,
        phases: [
          {
            name: 'Gros œuvre',
            description: `Construction structure pour ${totalArea}m² avec ${roomCount} pièces`,
            totalCost: estimatedTotal * 0.4,
            duration: Math.ceil(totalArea / 15)
          },
          {
            name: 'Second œuvre',
            description: 'Menuiseries, électricité, plomberie',
            totalCost: estimatedTotal * 0.35,
            duration: Math.ceil(totalArea / 20)
          },
          {
            name: 'Finitions',
            description: 'Revêtements, peinture, aménagements',
            totalCost: estimatedTotal * 0.25,
            duration: Math.ceil(totalArea / 25)
          }
        ]
      };
      
      setGeneratedQuote(generatedQuote);
      updateStepStatus('quote', 'completed', 100);
      
      console.log('🎉 Analyse complète terminée avec succès!');

    } catch (err) {
      console.error('❌ Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de l'analyse: ${errorMessage}`);
      
      // Mark current step as error
      const currentStep = analysisSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setGeneratedQuote(null);
    setError(null);
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
  };

  const downloadQuote = () => {
    if (!generatedQuote) return;
    
    // Create and download quote as JSON
    const quoteData = JSON.stringify(generatedQuote, null, 2);
    const blob = new Blob([quoteData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'Résidentiel',
      'commercial': 'Commercial',
      'industrial': 'Industriel',
      'mixed': 'Mixte'
    };
    return labels[type] || type;
  };

  const getComplexityLabel = (complexity: string) => {
    const labels: Record<string, string> = {
      'simple': 'Simple',
      'moderate': 'Modéré',
      'complex': 'Complexe',
      'very_complex': 'Très complexe'
    };
    return labels[complexity] || complexity;
  };


  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Analyseur de Plans Architecturaux IA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Uploadez vos plans d'architecture et obtenez automatiquement une analyse détaillée avec devis
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">1. Télécharger le Plan</h2>
              <p className="text-blue-100 text-base">Glissez-déposez ou sélectionnez votre fichier</p>
            </div>
          </div>
        </div>
          
          <div className="p-8">
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            >
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="plan-upload"
              />
              <label htmlFor="plan-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center space-y-8">
                  <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <FileImage className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      Glissez-déposez votre plan ici
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      ou cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-base text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-lg inline-block">
                      📁 Format supporté: PDF uniquement
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg inline-block">
                      ✨ Qualité 100% préservée - Aucune compression - Analyse page par page
                    </p>
                  </div>
                </div>
              </label>
            </div>
            
            {uploadedFile && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-800 dark:text-green-200">
                    ✅ Fichier téléchargé: {uploadedFile.name}
                  </p>
                  <p className="text-base text-green-600 dark:text-green-400">
                    📊 Taille: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      ✨ Qualité originale préservée
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Analyser</span>
                </button>
                <button
                  onClick={resetAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Analysis Steps */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Analyse en cours</h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">Notre IA analyse votre plan architectural</p>
            </div>
          </div>
            
          <div className="space-y-6">
            {analysisSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-shrink-0">
                  {step.status === 'processing' && (
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                  {step.status === 'waiting' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Erreur d'Analyse
              </h3>
            </div>
            <p className="text-base text-red-700 dark:text-red-300 mt-3">
              {error}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">3. Résultats de l'Analyse</h2>
                  <p className="text-green-100 text-sm">Plan analysé avec succès</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Main Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Type de Plan</h3>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{getPlanTypeLabel(analysis.planType || 'unknown')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">Pièces Détectées</h3>
                      <p className="text-xl font-bold text-purple-900 dark:text-purple-200">{analysis.extractedMeasurements.rooms?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Complexité</h3>
                      <p className="text-xl font-bold text-green-900 dark:text-green-200">{getComplexityLabel(analysis.estimatedComplexity || 'moderate')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Home className="w-5 h-5" />
                    <span>Pièces Détectées</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.extractedMeasurements.rooms?.map((room: Room, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{room.area || 0} m²</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Building className="w-5 h-5" />
                    <span>Éléments de Construction</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.constructionElements?.walls?.map((wall: Wall, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{wall.type}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{wall.material || 'Non spécifié'}</span>
                      </div>
                    )) || (
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        Aucun élément de construction détecté
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Generation */}
        {generatedQuote && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">4. Devis Généré</h2>
                    <p className="text-yellow-100 text-sm">Estimation automatique des coûts</p>
                  </div>
                </div>
                <button
                  onClick={downloadQuote}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Total Estimé</h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                    {formatAmount(generatedQuote?.totalCost || 0)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Délai Estimé</h3>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{generatedQuote?.totalDuration || 0} jours</p>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">Phases</h3>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{generatedQuote?.phases?.length || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Détail des Phases</h3>
                <div className="space-y-4">
                  {generatedQuote?.phases?.map((phase: {name?: string; description?: string; totalCost?: number}, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{phase?.name || 'Phase sans nom'}</h4>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatAmount(phase?.totalCost || 0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{phase?.description || 'Aucune description'}</p>
                    </div>
                  )) || (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      Aucune phase disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de devis détaillé */}
        {showQuoteModal && generatedQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-2xl font-bold">Devis Détaillé</h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Titre:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{generatedQuote.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Validité:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">30 jours</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-8 text-xl">Phases du Projet</h3>
                    <div className="space-y-8">
                      {generatedQuote.phases?.map((phase: {name?: string; description?: string; totalCost?: number; duration?: number}, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-8 py-6 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 rounded-r-lg">
                          <div className="flex justify-between items-start mb-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{phase.name}</h4>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xl bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                              {formatAmount(phase.totalCost || 0)}
                            </span>
                          </div>
                          <p className="text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{phase.description}</p>
                          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
                            ⏱️ Durée estimée: {phase.duration || 'À définir'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ArchitecturalPlanAnalyzer;

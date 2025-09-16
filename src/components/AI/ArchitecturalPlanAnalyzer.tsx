import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileImage, 
  Zap, 
  DollarSign,
  Home,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Play,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { architecturalPlanAnalyzer, ArchitecturalPlanAnalysis } from '../../services/ai/architecturalPlanAnalyzer';
import { GeneratedQuote } from '../../services/ai/quoteGenerator';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AnalysisStep {
  id: string;
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
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

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    setError(null);
    setAnalysis(null);
    setGeneratedQuote(null);
    
    // Reset analysis steps
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
    
    return false; // Prevent default upload
  }, []);

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Step 1: OCR Extraction
      updateStepStatus('ocr', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate OCR processing
      updateStepStatus('ocr', 'completed', 100);

      // Step 2: AI Analysis
      updateStepStatus('analysis', 'processing');
      const analysisResult = await architecturalPlanAnalyzer.analyzePlan(uploadedFile);
      setAnalysis(analysisResult);
      updateStepStatus('analysis', 'completed', 100);

      // Step 3: Quote Generation
      updateStepStatus('quote', 'processing');
      const quote = await architecturalPlanAnalyzer.generateQuoteFromPlan(analysisResult, {});
      setGeneratedQuote(quote);
      updateStepStatus('quote', 'completed', 100);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Erreur lors de l\'analyse du plan. Veuillez réessayer.');
      
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

  const getStepIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header moderne */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">
              Analyseur de Plans Architecturaux IA
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Téléchargez vos plans d'architecture pour une analyse automatique et génération de devis
          </p>
        </div>

        {/* Zone de téléchargement moderne */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">1. Télécharger le Plan</h2>
                <p className="text-blue-100 text-sm">Glissez-déposez ou sélectionnez votre fichier</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div 
              className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 cursor-pointer"
              onClick={() => document.getElementById('plan-upload')?.click()}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Glissez votre plan ici
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    ou cliquez pour sélectionner un fichier
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>PDF, JPG, PNG</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>TIFF, BMP</span>
                  </div>
                </div>
              </div>
              
              <input
                id="plan-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                disabled={isAnalyzing}
              />
            </div>
            
            {uploadedFile && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Fichier téléchargé</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progression de l'analyse moderne */}
        {uploadedFile && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">2. Analyse en Cours</h2>
                  <p className="text-purple-100 text-sm">Traitement IA de votre plan architectural</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {analysisSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{step.title}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {step.status === 'completed' ? '100%' : step.status === 'processing' ? 'En cours...' : 'En attente'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'processing' ? 'bg-blue-500' :
                          step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${step.status === 'completed' ? 100 : step.status === 'processing' ? 50 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>{isAnalyzing ? 'Analyse en cours...' : 'Commencer l\'analyse'}</span>
                </button>
                
                <button
                  onClick={resetAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Recommencer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Erreur d'analyse</h3>
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Résultats de l'analyse */}
        {analysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">3. Résultats de l'Analyse</h2>
                  <p className="text-green-100 text-sm">Plan analysé avec succès</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <FileImage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">Type de Plan</h3>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{getPlanTypeLabel(analysis.planType)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Home className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-300">Pièces Détectées</h3>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{analysis.extractedMeasurements.rooms?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-300">Complexité</h3>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-200">{getComplexityLabel(analysis.estimatedComplexity)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de l'analyse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>Pièces Détectées</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.extractedMeasurements.rooms?.map((room, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{room.area} m²</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Éléments de Construction</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.constructionElements.walls?.map((wall, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{wall.type}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{wall.material || 'Non spécifié'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devis généré */}
        {generatedQuote && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">4. Devis Généré</h2>
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
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Total Estimé</h3>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-200">
                    {formatAmount(generatedQuote.totalCost)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Délai Estimé</h3>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">{generatedQuote.totalDuration} jours</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300">Phases</h3>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-200">{generatedQuote.phases.length}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Détail des Phases</h3>
                <div className="space-y-4">
                  {generatedQuote.phases.map((phase, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{phase.name}</h4>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatAmount(phase.totalCost)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{phase.description}</p>
                    </div>
                  ))}
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Phases du Projet</h3>
                    <div className="space-y-4">
                      {generatedQuote.phases.map((phase, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{phase.name}</h4>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {formatAmount(phase.totalCost)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{phase.description}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Durée estimée: {phase.duration || 'À définir'}
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
    </div>
  );
};

export default ArchitecturalPlanAnalyzer;

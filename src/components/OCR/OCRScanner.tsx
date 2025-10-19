import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2, Settings } from 'lucide-react';
import { ExtractedData } from '../../services/ocrService';
import { ocrEnhancer, EnhancedOCRData } from '../../services/ai/ocrEnhancer';
import { unifiedOcrService } from '../../services/unifiedOcrService';
import { OCRProvider } from '../../types/ocr';
import OCRProviderSelector from './OCRProviderSelector';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted?: (data: ExtractedData, originalImage: string) => void;
  title?: string;
}

const OCRScanner: React.FC<OCRScannerProps> = ({
  isOpen,
  onClose,
  onDataExtracted,
  title = "Scanner un document"
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<{ text: string; confidence: number; provider: OCRProvider } | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedOCRData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<OCRProvider>('auto');
  const [googleVisionApiKey, setGoogleVisionApiKey] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Charger la configuration sauvegardée
  useEffect(() => {
    const savedProvider = localStorage.getItem('ocr_provider') as OCRProvider;
    const savedApiKey = localStorage.getItem('google_vision_api_key');
    
    if (savedProvider) {
      setSelectedProvider(savedProvider);
      unifiedOcrService.configure({ provider: savedProvider });
    }
    
    if (savedApiKey) {
      setGoogleVisionApiKey(savedApiKey);
      unifiedOcrService.configure({ apiKey: savedApiKey });
    }
  }, []);

  // Sauvegarder la configuration
  const handleProviderChange = (provider: OCRProvider) => {
    setSelectedProvider(provider);
    localStorage.setItem('ocr_provider', provider);
    unifiedOcrService.configure({ provider });
  };

  const handleApiKeyChange = (apiKey: string) => {
    setGoogleVisionApiKey(apiKey);
    if (apiKey) {
      localStorage.setItem('google_vision_api_key', apiKey);
      unifiedOcrService.configure({ apiKey });
    } else {
      localStorage.removeItem('google_vision_api_key');
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Traiter avec OCR unifié
      setProgress(25);
      const result = await unifiedOcrService.processImage(file);
      setProgress(50);

      // Enrichissement IA des données OCR
      const enhanced = await ocrEnhancer.enhanceOCRData(result.extractedData, result.text);
      setProgress(100);

      setOcrResult(result);
      setEnhancedData(enhanced);

      // Appeler le callback avec les données enrichies si fourni
      if (onDataExtracted && previewImage) {
        onDataExtracted(enhanced, previewImage);
      }

    } catch (err) {
      console.error('Erreur OCR:', err);
      setError('Erreur lors du traitement du document. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [onDataExtracted, previewImage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const resetScanner = () => {
    setOcrResult(null);
    setEnhancedData(null);
    setPreviewImage(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="text-blue-100 text-sm">Scanner et analyser vos documents avec l'IA</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  title="Paramètres OCR"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
      <div className="space-y-4">
        {/* Sélecteur de provider */}
        {showSettings && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <OCRProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={handleProviderChange}
              googleVisionApiKey={googleVisionApiKey}
              onApiKeyChange={handleApiKeyChange}
            />
          </div>
        )}
        {/* Zone de téléchargement moderne */}
        {!isProcessing && !ocrResult && (
          <div className="relative">
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Glissez votre document ici
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    ou choisissez un fichier depuis votre appareil
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choisir un fichier</span>
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Prendre une photo</span>
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>JPG, PNG, PDF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Max 10MB</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Barre de progression moderne */}
        {isProcessing && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Traitement en cours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Analyse du document avec l'IA...</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Erreur moderne */}
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Erreur de traitement</h4>
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {ocrResult && enhancedData && (
          <div className="space-y-4">
            {/* Image prévisualisée */}
            {previewImage && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Document scanné</h4>
                <img
                  src={previewImage}
                  alt="Document scanné"
                  className="max-w-full max-h-48 object-contain border rounded"
                />
              </div>
            )}

            {/* Données extraites */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Données extraites automatiquement</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nom du fournisseur */}
                {enhancedData.normalizedData.vendorName && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Fournisseur
                      {enhancedData.mappedVendor && (
                        <span className="ml-2 text-xs text-green-600">✓ Reconnu</span>
                      )}
                    </label>
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                      {enhancedData.normalizedData.vendorName}
                    </p>
                  </div>
                )}

                {/* Numéro de facture */}
                {enhancedData.normalizedData.invoiceNumber && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">N° Facture</label>
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                      {enhancedData.normalizedData.invoiceNumber}
                    </p>
                  </div>
                )}

                {/* Montant total */}
                {enhancedData.normalizedData.amount && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Montant total</label>
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border font-semibold">
                      {enhancedData.normalizedData.amount.toLocaleString('fr-FR')} {enhancedData.normalizedData.currency}
                    </p>
                  </div>
                )}

                {/* Date normalisée */}
                {enhancedData.normalizedData.date && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                      {new Date(enhancedData.normalizedData.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions IA */}
              {enhancedData.suggestions.length > 0 && (
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Suggestions IA</label>
                  <div className="space-y-1">
                    {enhancedData.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-blue-700 bg-blue-50 px-3 py-1 rounded border text-sm">
                        💡 {suggestion}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Statut de validation */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    enhancedData.validationStatus === 'valid' ? 'bg-green-100 text-green-800' :
                    enhancedData.validationStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {enhancedData.validationStatus === 'valid' ? '✓ Validé' :
                     enhancedData.validationStatus === 'warning' ? '⚠ À vérifier' :
                     '❌ Erreurs détectées'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Confiance: {enhancedData.confidence}%
                  </span>
                </div>
              </div>

              {/* Texte brut */}
              <div className="mt-4 space-y-1">
                <label className="text-sm font-medium text-gray-700">Texte extrait</label>
                <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {ocrResult.text}
                  </pre>
                </div>
              </div>
            </div>

            {/* Actions modernes */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={resetScanner}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Scanner un autre document</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {ocrResult.provider === 'google_vision' ? '🔍' : '🔤'} {ocrResult.provider === 'google_vision' ? 'Google Vision' : 'Tesseract'} - Confiance : {Math.round(ocrResult.confidence)}%
                  </span>
                </div>
              </div>
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

export default OCRScanner;

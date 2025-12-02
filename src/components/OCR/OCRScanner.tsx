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

  // Plus de chargement depuis localStorage: conserver en mémoire uniquement
  useEffect(() => {
    unifiedOcrService.configure({ provider: selectedProvider });
    if (googleVisionApiKey) {
      unifiedOcrService.configure({ apiKey: googleVisionApiKey });
    }
  }, [selectedProvider, googleVisionApiKey]);

  // Mettre à jour la configuration (sans persistance localStorage)
  const handleProviderChange = (provider: OCRProvider) => {
    setSelectedProvider(provider);
    unifiedOcrService.configure({ provider });
  };

  const handleApiKeyChange = (apiKey: string) => {
    setGoogleVisionApiKey(apiKey);
    if (apiKey) {
      unifiedOcrService.configure({ apiKey });
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
          {}
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
        {}
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

        {}
              {enhancedData.suggestions.length > 0 && (
                <div className="mt-4 space-y-1">
                  <label</label>
                  <div className="space-y-1">
                    {enhancedData.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-blue-700 bg-blue-50 px-3 py-1 rounded border text-sm">
                         {suggestion}
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

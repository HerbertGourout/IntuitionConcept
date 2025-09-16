import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ocrService, OCRResult, ExtractedData } from '../../services/ocrService';
import { ocrEnhancer, EnhancedOCRData } from '../../services/ai/ocrEnhancer';

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
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedOCRData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

      // Traiter avec OCR
      setProgress(25);
      const result = await ocrService.processImage(file);
      setProgress(75);

      const data = ocrService.extractData(result.text);
      setProgress(75);

      // Enrichissement IA des données OCR
      const enhanced = await ocrEnhancer.enhanceOCRData(data, result.text);
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-blue-100 text-sm">Scanner et analyser vos documents avec l'IA</p>
                </div>
              </div>
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

          <div className="p-6">
      <div className="space-y-6">
        {/* Zone de téléchargement moderne */}
        {!isProcessing && !ocrResult && (
          <div className="relative">
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300">
              <div className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Glissez votre document ici
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    ou choisissez un fichier depuis votre appareil
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-base btn-gradient-primary hover-lift px-6 py-3 flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choisir un fichier</span>
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-base btn-gradient-accent hover-lift px-6 py-3 flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
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
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
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
          <div className="space-y-6">
            {/* Image prévisualisée */}
            {previewImage && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Document scanné</h4>
                <img
                  src={previewImage}
                  alt="Document scanné"
                  className="max-w-full max-h-64 object-contain border rounded"
                />
              </div>
            )}

            {/* Données extraites */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">Données extraites automatiquement</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={resetScanner}
                className="btn-base btn-gradient-secondary hover-lift px-6 py-3 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Scanner un autre document</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Confiance OCR : {Math.round(ocrResult.confidence)}%
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

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Modal, Progress } from 'antd';
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
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>{title}</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Fermer
        </Button>
      ]}
      width={800}
      className="ocr-scanner-modal"
    >
      <div className="space-y-6">
        {/* Zone de téléchargement */}
        {!isProcessing && !ocrResult && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  type="primary"
                  icon={<Upload className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                  size="large"
                >
                  Choisir un fichier
                </Button>
                <Button
                  icon={<Camera className="w-4 h-4" />}
                  onClick={() => cameraInputRef.current?.click()}
                  size="large"
                >
                  Prendre une photo
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                <p>Formats supportés : JPG, PNG, PDF</p>
                <p>Taille maximale : 10MB</p>
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
        )}

        {/* Barre de progression */}
        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-700">Traitement du document en cours...</span>
            </div>
            <Progress percent={progress} status="active" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
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

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={resetScanner}>
                Scanner un autre document
              </Button>
              <div className="text-sm text-gray-600">
                Confiance OCR : {Math.round(ocrResult.confidence)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OCRScanner;

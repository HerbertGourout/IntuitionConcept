import { useState, useCallback } from 'react';
import { message } from 'antd';
import { ocrService, ExtractedData } from '../services/ocrService';

export interface UseOCRResult {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  lastResult: ExtractedData | null;
  processImage: (file: File) => Promise<ExtractedData | null>;
  reset: () => void;
}

export const useOCR = (): UseOCRResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExtractedData | null>(null);

  const processImage = useCallback(async (file: File): Promise<ExtractedData | null> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner un fichier image valide');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Le fichier ne doit pas dépasser 10MB');
      }

      setProgress(25);

      // Traitement OCR
      const ocrResult = await ocrService.processImage(file);
      setProgress(75);

      // Extraction des données
      const extractedData = ocrService.extractData(ocrResult.text);
      setProgress(100);

      setLastResult(extractedData);

      message.success(
        `Document analysé ! ${extractedData.amounts.length} montants détectés.`
      );

      return extractedData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du traitement';
      setError(errorMessage);
      message.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
    setProgress(0);
  }, []);

  return {
    isProcessing,
    progress,
    error,
    lastResult,
    processImage,
    reset
  };
};

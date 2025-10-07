import { useState, useEffect } from 'react';
import { aiActivationService, AIServiceStatus } from '../services/ai/aiActivationService';

/**
 * Hook pour gérer l'état des services IA
 */
export const useAIServices = () => {
  const [status, setStatus] = useState<AIServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAIServices();
  }, []);

  const initializeAIServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🤖 Initialisation des services IA...');
      const aiStatus = await aiActivationService.activateAIServices();
      setStatus(aiStatus);
      
      // Log du statut pour debug
      console.log('📊 Statut services IA:', {
        apiConfigured: aiStatus.apiKey.configured,
        ocrActive: aiStatus.ocrEnhancement.enabled,
        quoteActive: aiStatus.quoteGeneration.enabled,
        copilotActive: aiStatus.copilotAssistant.enabled
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur initialisation IA:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    await initializeAIServices();
  };

  const testService = async (serviceName: 'ocr' | 'quote' | 'copilot') => {
    try {
      const result = await aiActivationService.testAIService(serviceName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur test service';
      return { success: false, message: errorMessage };
    }
  };

  return {
    status,
    loading,
    error,
    refreshStatus,
    testService,
    isConfigured: status?.apiKey.configured || false,
    isOCRActive: status?.ocrEnhancement.enabled || false,
    isQuoteGenerationActive: status?.quoteGeneration.enabled || false,
    isCopilotActive: status?.copilotAssistant.enabled || false
  };
};

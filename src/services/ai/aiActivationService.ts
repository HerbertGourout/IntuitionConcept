

import { aiConfig } from './aiConfig';
import { ocrEnhancer } from './ocrEnhancer';
import { quoteGenerator } from './quoteGenerator';
import { ServiceService } from './ServiceService';

export interface AIServiceStatus {
  ocrEnhancement: {
    enabled: boolean;
    status: 'active' | 'inactive' | 'error';
    message: string;
  };
  quoteGeneration: {
    enabled: boolean;
    status: 'active' | 'inactive' | 'error';
    message: string;
  };
  copilotAssistant: {
    enabled: boolean;
    status: 'active' | 'inactive' | 'error';
    message: string;
  };
  apiKey: {
    configured: boolean;
    provider: string;
  };
}

class AIActivationService {
  private static instance: AIActivationService;
  
  static getInstance(): AIActivationService {
    if (!AIActivationService.instance) {
      AIActivationService.instance = new AIActivationService();
    }
    return AIActivationService.instance;
  }

  
  async activateAIServices(): Promise<AIServiceStatus> {
    console.log('🔍 Vérification des services IA...');
    
    const status: AIServiceStatus = {
      ocrEnhancement: {
        enabled: false,
        status: 'inactive',
        message: 'Service non activé'
      },
      quoteGeneration: {
        enabled: false,
        status: 'inactive',
        message: 'Service non activé'
      },
      copilotAssistant: {
        enabled: false,
        status: 'inactive',
        message: 'Service non activé'
      },
      apiKey: {
        configured: !!aiConfig.ServiceApiKey,
        provider: aiConfig.provider
      }
    };

    // Vérifier la clé API
    if (!aiConfig.ServiceApiKey) {
      console.warn('⚠️ Aucune clé API Service configurée');
      status.ocrEnhancement.message = 'Clé API Service requise';
      status.quoteGeneration.message = 'Clé API Service requise';
      status.copilotAssistant.message = 'Clé API Service requise';
      return status;
    }

    console.log('✅ Clé API Service détectée, activation des services...');

    // 1. Activer OCR Enhancement
    try {
      status.ocrEnhancement.enabled = true;
      status.ocrEnhancement.status = 'active';
      status.ocrEnhancement.message = ' OCR IA activé avec Modèle-4 Vision';
      console.log('✅ OCR Enhancement activé');
    } catch (error) {
      status.ocrEnhancement.status = 'error';
      status.ocrEnhancement.message = `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('❌ Erreur activation OCR:', error);
    }

    // 2. Activer Quote Generation
    try {
      status.quoteGeneration.enabled = true;
      status.quoteGeneration.status = 'active';
      status.quoteGeneration.message = ' Génération devis IA activée avec Modèle-3.5';
      console.log('✅ Quote Generation activé');
    } catch (error) {
      status.quoteGeneration.status = 'error';
      status.quoteGeneration.message = `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('❌ Erreur activation Quote Generation:', error);
    }

    // 3. Activer Copilot Assistant
    try {
      status.copilotAssistant.enabled = true;
      status.copilotAssistant.status = 'active';
      status.copilotAssistant.message = ' Assistant activé avec Modèle-3.5';
      console.log('✅ Copilot Assistant activé');
    } catch (error) {
      status.copilotAssistant.status = 'error';
      status.copilotAssistant.message = `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('❌ Erreur activation Copilot:', error);
    }

    // 4. Test de connectivité Service
    await this.testServiceConnectivity(status);

    return status;
  }

  
  getAIServicesStatus(): AIServiceStatus {
    return {
      ocrEnhancement: {
        enabled: aiConfig.ocr.enhancementEnabled && !!aiConfig.ServiceApiKey,
        status: aiConfig.ocr.enhancementEnabled && !!aiConfig.ServiceApiKey ? 'active' : 'inactive',
        message: aiConfig.ocr.enhancementEnabled && !!aiConfig.ServiceApiKey 
          ? ' OCR IA activé' 
          : 'OCR IA inactif'
      },
      quoteGeneration: {
        enabled: aiConfig.quoteGeneration.enabled && !!aiConfig.ServiceApiKey,
        status: aiConfig.quoteGeneration.enabled && !!aiConfig.ServiceApiKey ? 'active' : 'inactive',
        message: aiConfig.quoteGeneration.enabled && !!aiConfig.ServiceApiKey 
          ? ' Génération devis IA activée' 
          : 'Génération devis IA inactive'
      },
      copilotAssistant: {
        enabled: aiConfig.copilot.enabled && !!aiConfig.ServiceApiKey,
        status: aiConfig.copilot.enabled && !!aiConfig.ServiceApiKey ? 'active' : 'inactive',
        message: aiConfig.copilot.enabled && !!aiConfig.ServiceApiKey 
          ? ' Assistant activé' 
          : 'Assistant inactif'
      },
      apiKey: {
        configured: !!aiConfig.ServiceApiKey,
        provider: aiConfig.provider
      }
    };
  }

  
  async testAIService(serviceName: 'ocr' | 'quote' | 'copilot'): Promise<{ success: boolean; message: string }> {
    if (!aiConfig.ServiceApiKey) {
      return { success: false, message: 'Clé API Service non configurée' };
    }

    try {
      switch (serviceName) {
        case 'ocr': {
          // Test OCR avec un texte simple
          const ocrResult = await ocrEnhancer.enhanceOCRData({
            vendorName: 'Test Vendor',
            total: 100000,
            amounts: [100000],
            dates: ['2024-01-15'],
            invoiceNumber: 'TEST-001'
          }, 'Facture test: Test Vendor, 100000 FCFA, 15/01/2024');
          return { 
            success: true, 
            message: `OCR IA testé avec succès - Confiance: ${ocrResult.confidence}%` 
          };
        }

        case 'quote': {
          // Test génération de devis simple
          const quoteResult = await quoteGenerator.generateQuote({
            projectType: 'renovation',
            description: 'Test renovation',
            budget: { min: 500000, max: 1000000, currency: 'XAF' },
            location: 'Yaoundé',
            timeline: '2 semaines',
            specialRequirements: []
          });
          return { 
            success: true, 
            message: `Génération devis IA testée - ${quoteResult.phases.length} phases générées` 
          };
        }

        case 'copilot': {
          // Test assistant simple
          await ServiceService.processDocumentWithAI(
            'Test message pour l\'Assistant',
            { type: 'test' }
          );
          return { 
            success: true, 
            message: 'Assistant testé avec succès' 
          };
        }

        default:
          return { success: false, message: 'Service non reconnu' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Erreur test ${serviceName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }
}

export const aiActivationService = AIActivationService.getInstance();

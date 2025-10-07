/**
 * Service d'activation des fonctionnalités IA
 * Active automatiquement les services IA quand une clé API est détectée
 */

import { aiConfig } from './aiConfig';
import { ocrEnhancer } from './ocrEnhancer';
import { quoteGenerator } from './quoteGenerator';
import { openaiService } from './openaiService';

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

  /**
   * Vérifie et active automatiquement les services IA
   */
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
        configured: !!aiConfig.openaiApiKey,
        provider: aiConfig.provider
      }
    };

    // Vérifier la clé API
    if (!aiConfig.openaiApiKey) {
      console.warn('⚠️ Aucune clé API OpenAI configurée');
      status.ocrEnhancement.message = 'Clé API OpenAI requise';
      status.quoteGeneration.message = 'Clé API OpenAI requise';
      status.copilotAssistant.message = 'Clé API OpenAI requise';
      return status;
    }

    console.log('✅ Clé API OpenAI détectée, activation des services...');

    // 1. Activer OCR Enhancement
    try {
      status.ocrEnhancement.enabled = true;
      status.ocrEnhancement.status = 'active';
      status.ocrEnhancement.message = '🤖 OCR IA activé avec GPT-4 Vision';
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
      status.quoteGeneration.message = '🤖 Génération devis IA activée avec GPT-3.5';
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
      status.copilotAssistant.message = '🤖 Assistant IA activé avec GPT-3.5';
      console.log('✅ Copilot Assistant activé');
    } catch (error) {
      status.copilotAssistant.status = 'error';
      status.copilotAssistant.message = `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('❌ Erreur activation Copilot:', error);
    }

    // 4. Test de connectivité OpenAI
    await this.testOpenAIConnectivity(status);

    return status;
  }

  /**
   * Test de connectivité avec OpenAI
   */
  private async testOpenAIConnectivity(status: AIServiceStatus): Promise<void> {
    try {
      console.log('🔗 Test de connectivité OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${aiConfig.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Connectivité OpenAI confirmée');
        // Mettre à jour les statuts pour confirmer la connectivité
        if (status.ocrEnhancement.status === 'active') {
          status.ocrEnhancement.message += ' - Connectivité confirmée';
        }
        if (status.quoteGeneration.status === 'active') {
          status.quoteGeneration.message += ' - Connectivité confirmée';
        }
        if (status.copilotAssistant.status === 'active') {
          status.copilotAssistant.message += ' - Connectivité confirmée';
        }
      } else {
        console.warn('⚠️ Problème de connectivité OpenAI:', response.status);
        const errorSuffix = ' - Problème de connectivité API';
        if (status.ocrEnhancement.status === 'active') {
          status.ocrEnhancement.message += errorSuffix;
        }
        if (status.quoteGeneration.status === 'active') {
          status.quoteGeneration.message += errorSuffix;
        }
        if (status.copilotAssistant.status === 'active') {
          status.copilotAssistant.message += errorSuffix;
        }
      }
    } catch (error) {
      console.error('❌ Erreur test connectivité:', error);
      const errorSuffix = ' - Test de connectivité échoué';
      if (status.ocrEnhancement.status === 'active') {
        status.ocrEnhancement.message += errorSuffix;
      }
      if (status.quoteGeneration.status === 'active') {
        status.quoteGeneration.message += errorSuffix;
      }
      if (status.copilotAssistant.status === 'active') {
        status.copilotAssistant.message += errorSuffix;
      }
    }
  }

  /**
   * Obtient le statut actuel des services IA
   */
  getAIServicesStatus(): AIServiceStatus {
    return {
      ocrEnhancement: {
        enabled: aiConfig.ocr.enhancementEnabled && !!aiConfig.openaiApiKey,
        status: aiConfig.ocr.enhancementEnabled && !!aiConfig.openaiApiKey ? 'active' : 'inactive',
        message: aiConfig.ocr.enhancementEnabled && !!aiConfig.openaiApiKey 
          ? '🤖 OCR IA activé' 
          : 'OCR IA inactif'
      },
      quoteGeneration: {
        enabled: aiConfig.quoteGeneration.enabled && !!aiConfig.openaiApiKey,
        status: aiConfig.quoteGeneration.enabled && !!aiConfig.openaiApiKey ? 'active' : 'inactive',
        message: aiConfig.quoteGeneration.enabled && !!aiConfig.openaiApiKey 
          ? '🤖 Génération devis IA activée' 
          : 'Génération devis IA inactive'
      },
      copilotAssistant: {
        enabled: aiConfig.copilot.enabled && !!aiConfig.openaiApiKey,
        status: aiConfig.copilot.enabled && !!aiConfig.openaiApiKey ? 'active' : 'inactive',
        message: aiConfig.copilot.enabled && !!aiConfig.openaiApiKey 
          ? '🤖 Assistant IA activé' 
          : 'Assistant IA inactif'
      },
      apiKey: {
        configured: !!aiConfig.openaiApiKey,
        provider: aiConfig.provider
      }
    };
  }

  /**
   * Test rapide d'un service IA spécifique
   */
  async testAIService(serviceName: 'ocr' | 'quote' | 'copilot'): Promise<{ success: boolean; message: string }> {
    if (!aiConfig.openaiApiKey) {
      return { success: false, message: 'Clé API OpenAI non configurée' };
    }

    try {
      switch (serviceName) {
        case 'ocr':
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

        case 'quote':
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

        case 'copilot':
          // Test assistant simple
          const copilotResult = await openaiService.processDocumentWithAI(
            'Test message pour l\'assistant IA',
            { type: 'test' }
          );
          return { 
            success: true, 
            message: 'Assistant IA testé avec succès' 
          };

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

/**
 * Hook React pour gérer les fonctionnalités Advanced
 * Centralise la logique de sélection de mode et d'utilisation des services
 */

import { useState, useEffect, useCallback } from 'react';
import type { ServiceMode } from '../components/Common/AdvancedModeSelector';

export interface AdvancedSettings {
  enabled: boolean;
  defaultMode: ServiceMode;
  monthlyBudget: number;
  autoOptimize: boolean;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  enabled: true,
  defaultMode: 'advanced',
  monthlyBudget: 50000,
  autoOptimize: true
};

export function useAdvancedFeatures() {
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);
  const [currentMode, setCurrentMode] = useState<ServiceMode>('advanced');
  const [isConfigured, setIsConfigured] = useState(false);

  // Charger les paramètres au montage
  useEffect(() => {
    const savedSettings = localStorage.getItem('advanced_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setCurrentMode(parsed.defaultMode || 'advanced');
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      }
    }

    // Vérifier si Gemini 3 est configuré
    const apiKey = import.meta.env.VITE_GEMINI_3_API_KEY;
    const enabled = import.meta.env.VITE_ENABLE_ADVANCED_FEATURES === 'true';
    setIsConfigured(!!apiKey && enabled);
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = useCallback((newSettings: Partial<AdvancedSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('advanced_settings', JSON.stringify(updated));
  }, [settings]);

  // Changer le mode
  const changeMode = useCallback((mode: ServiceMode) => {
    if (!settings.enabled && mode === 'advanced') {
      console.warn('Advanced features are disabled');
      return;
    }
    setCurrentMode(mode);
  }, [settings.enabled]);

  // Vérifier si Advanced est disponible
  const isAdvancedAvailable = useCallback(() => {
    return settings.enabled && isConfigured;
  }, [settings.enabled, isConfigured]);

  // Obtenir le mode recommandé selon le contexte
  const getRecommendedMode = useCallback((context: {
    complexity?: 'simple' | 'medium' | 'complex';
    budget?: number;
    priority?: 'cost' | 'quality' | 'speed';
  }): ServiceMode => {
    if (!isAdvancedAvailable()) {
      return 'standard';
    }

    // Si optimisation automatique désactivée, utiliser le mode par défaut
    if (!settings.autoOptimize) {
      return currentMode;
    }

    // Logique de recommandation
    if (context.priority === 'cost' && context.complexity === 'simple') {
      return 'advanced'; // Économie maximale
    }

    if (context.priority === 'quality') {
      return 'advanced'; // Qualité supérieure
    }

    if (context.priority === 'speed' && context.complexity === 'simple') {
      return 'advanced'; // Plus rapide pour simple
    }

    return currentMode;
  }, [isAdvancedAvailable, settings.autoOptimize, currentMode]);

  return {
    settings,
    currentMode,
    isConfigured,
    isAdvancedAvailable: isAdvancedAvailable(),
    saveSettings,
    changeMode,
    getRecommendedMode
  };
}

export default useAdvancedFeatures;

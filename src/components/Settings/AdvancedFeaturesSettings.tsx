/**
 * Panneau de configuration des fonctionnalités Advanced
 * Permet d'activer/désactiver Advanced et configurer les paramètres
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  DollarSign,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import type { ThinkingLevel, MediaResolution } from '../../services/ai/gemini3';

export interface AdvancedSettings {
  enabled: boolean;
  defaultMode: 'standard' | 'advanced';
  monthlyBudget: number;
  services: {
    analysis: { enabled: boolean; defaultThinkingLevel: ThinkingLevel };
    quote: { enabled: boolean; includeMarketAnalysis: boolean };
    render3D: { enabled: boolean; defaultResolution: '2K' | '4K' };
    ocr: { enabled: boolean; autoValidate: boolean };
    copilot: { enabled: boolean };
    anomaly: { enabled: boolean; sensitivity: 'low' | 'medium' | 'high' };
    reports: { enabled: boolean; includeVisualizations: boolean };
    search: { enabled: boolean };
  };
  defaultThinkingLevel: ThinkingLevel;
  defaultMediaResolution: MediaResolution;
  autoOptimize: boolean;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  enabled: true,
  defaultMode: 'advanced',
  monthlyBudget: 50000,
  services: {
    analysis: { enabled: true, defaultThinkingLevel: 'high' },
    quote: { enabled: true, includeMarketAnalysis: true },
    render3D: { enabled: true, defaultResolution: '4K' },
    ocr: { enabled: true, autoValidate: true },
    copilot: { enabled: true },
    anomaly: { enabled: true, sensitivity: 'high' },
    reports: { enabled: true, includeVisualizations: true },
    search: { enabled: true }
  },
  defaultThinkingLevel: 'high',
  defaultMediaResolution: 'media_resolution_high',
  autoOptimize: true
};

export const AdvancedFeaturesSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(false);

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const savedSettings = localStorage.getItem('advanced_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('advanced_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = <K extends keyof AdvancedSettings>(
    key: K,
    value: AdvancedSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateServiceSetting = <S extends keyof AdvancedSettings['services']>(
    service: S,
    setting: Partial<AdvancedSettings['services'][S]>
  ) => {
    setSettings(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: {
          ...prev.services[service],
          ...setting
        }
      }
    }));
  };

  useEffect(() => {
    // Vérifier si le budget est bas
    setBudgetWarning(settings.monthlyBudget < 10000);
  }, [settings.monthlyBudget]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Paramètres Advanced
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configuration des fonctionnalités Gemini 3
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

      {/* Save Confirmation */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Paramètres enregistrés avec succès</span>
        </div>
      )}

      {/* Global Settings */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Paramètres Globaux
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Enable Advanced */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">
                  Activer les fonctionnalités Advanced
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Utiliser Gemini 3 pour tous les services compatibles
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Default Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mode par défaut
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSetting('defaultMode', 'standard')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.defaultMode === 'standard'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">Standard</div>
                <div className="text-xs text-gray-600 mt-1">Claude + Replicate</div>
              </button>
              <button
                onClick={() => updateSetting('defaultMode', 'advanced')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.defaultMode === 'advanced'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Advanced
                </div>
                <div className="text-xs text-gray-600 mt-1">Gemini 3 Pro</div>
              </button>
            </div>
          </div>

          {/* Monthly Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              Budget mensuel (FCFA)
            </label>
            <input
              type="number"
              value={settings.monthlyBudget}
              onChange={(e) => updateSetting('monthlyBudget', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="1000"
            />
            {budgetWarning && (
              <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span>Budget faible. Recommandé: 50 000 FCFA minimum</span>
              </div>
            )}
          </div>

          {/* Auto Optimize */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Optimisation automatique
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Ajuster automatiquement thinking_level et media_resolution
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoOptimize}
                onChange={(e) => updateSetting('autoOptimize', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Services Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Configuration par Service
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {/* Analysis Service */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-900">Analyse de Plans</div>
                <div className="text-sm text-gray-600">Quick scan + analyse adaptative</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.services.analysis.enabled}
                  onChange={(e) => updateServiceSetting('analysis', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            {settings.services.analysis.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thinking Level par défaut
                </label>
                <select
                  value={settings.services.analysis.defaultThinkingLevel}
                  onChange={(e) => updateServiceSetting('analysis', { defaultThinkingLevel: e.target.value as ThinkingLevel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="low">Low (rapide, économique)</option>
                  <option value="medium">Medium (équilibré)</option>
                  <option value="high">High (précision maximale)</option>
                </select>
              </div>
            )}
          </div>

          {/* Quote Service */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-900">Génération de Devis</div>
                <div className="text-sm text-gray-600">Prix temps réel + optimisation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.services.quote.enabled}
                  onChange={(e) => updateServiceSetting('quote', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            {settings.services.quote.enabled && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quote-market"
                  checked={settings.services.quote.includeMarketAnalysis}
                  onChange={(e) => updateServiceSetting('quote', { includeMarketAnalysis: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="quote-market" className="text-sm text-gray-700">
                  Inclure analyse marché (Google Search)
                </label>
              </div>
            )}
          </div>

          {/* Render3D Service */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-900">Rendus 3D</div>
                <div className="text-sm text-gray-600">Génération 4K + ancrage réalité</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.services.render3D.enabled}
                  onChange={(e) => updateServiceSetting('render3D', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            {settings.services.render3D.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résolution par défaut
                </label>
                <select
                  value={settings.services.render3D.defaultResolution}
                  onChange={(e) => updateServiceSetting('render3D', { defaultResolution: e.target.value as '2K' | '4K' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="2K">2K (2048x1080)</option>
                  <option value="4K">4K (3840x2160)</option>
                </select>
              </div>
            )}
          </div>

          {/* Other Services (simplified) */}
          {[
            { key: 'ocr' as const, name: 'OCR', desc: 'Extraction + validation' },
            { key: 'copilot' as const, name: 'Copilot IA', desc: 'Assistant intelligent' },
            { key: 'anomaly' as const, name: 'Détection Anomalies', desc: 'Analyse contextuelle' },
            { key: 'reports' as const, name: 'Rapports', desc: 'Génération automatique' },
            { key: 'search' as const, name: 'Recherche', desc: 'Recherche sémantique' }
          ].map(service => (
            <div key={service.key} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.services[service.key].enabled}
                    onChange={(e) => updateServiceSetting(service.key, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">À propos des fonctionnalités Advanced</p>
            <p>
              Les services Advanced utilisent Gemini 3 pour offrir une qualité supérieure,
              des économies importantes et des fonctionnalités uniques comme les prix temps réel,
              l'ancrage réalité et la mémoire conversationnelle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesSettings;

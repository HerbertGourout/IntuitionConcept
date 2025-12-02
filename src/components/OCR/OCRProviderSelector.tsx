import React, { useState } from 'react';
import { Check, Info, Zap, DollarSign, Clock } from 'lucide-react';
import { OCRProvider, OCR_PROVIDERS, OCRProviderInfo } from '../../types/ocr';

interface OCRProviderSelectorProps {
  selectedProvider: OCRProvider;
  onProviderChange: (provider: OCRProvider) => void;
  googleVisionApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
  className?: string;
}

const OCRProviderSelector: React.FC<OCRProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  googleVisionApiKey,
  onApiKeyChange,
  className = ''
}) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const getProviderIcon = (provider: OCRProviderInfo) => {
    return (
      <div className="text-3xl mb-2">
        {provider.icon}
      </div>
    );
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleProviderSelect = (provider: OCRProvider) => {
    if (provider === 'google_vision' && !googleVisionApiKey) {
      setShowApiKeyInput(true);
    }
    onProviderChange(provider);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Moteur OCR
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choisissez le moteur de reconnaissance de texte
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Info className="w-4 h-4" />
          <span>Sélection recommandée : Auto</span>
        </div>
      </div>

      {/* Grille des providers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(OCR_PROVIDERS) as OCRProvider[]).map((providerId) => {
          const provider = OCR_PROVIDERS[providerId];
          const isSelected = selectedProvider === providerId;
          const isDisabled = provider.requiresApiKey && !googleVisionApiKey && providerId !== 'auto';

          return (
            <button
              key={providerId}
              onClick={() => handleProviderSelect(providerId)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-md'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Badge sélectionné */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Icône */}
              <div className="flex justify-center">
                {getProviderIcon(provider)}
              </div>

              {/* Nom */}
              <h4 className="font-semibold text-gray-900 dark:text-white text-center mb-2">
                {provider.name}
              </h4>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-center">
                {provider.description}
              </p>

              {/* Métriques */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <Zap className={`w-3 h-3 mr-1 ${getSpeedColor(provider.speed)}`} />
                    Vitesse
                  </span>
                  <span className={`font-medium ${getSpeedColor(provider.speed)}`}>
                    {provider.speed === 'fast' ? 'Rapide' : provider.speed === 'medium' ? 'Moyen' : 'Lent'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Précision
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(provider.accuracy)}`}>
                    {provider.accuracy === 'high' ? 'Haute' : provider.accuracy === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Coût
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {provider.cost}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <ul className="space-y-1">
                  {provider.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Badge API Key requis */}
              {provider.requiresApiKey && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    🔑 Clé API requise
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Configuration Google Vision API Key */}
      {(selectedProvider === 'google_vision' || showApiKeyInput) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Configuration Google Vision API
              </h4>
              
              {!googleVisionApiKey ? (
                <div className="space-y-3">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Pour utiliser Google Vision, vous devez configurer une clé API :
                  </p>
                  <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Accédez à <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>Activez l'API Vision</li>
                    <li>Créez une clé API</li>
                    <li>Collez-la ci-dessous</li>
                  </ol>
                  
                  {onApiKeyChange && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-blue-900 dark:text-blue-300">
                        Clé API Google Vision
                      </label>
                      <input
                        type="password"
                        placeholder="AIza..."
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                         La clé sera sauvegardée localement et de manière sécurisée
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-400">
                      ✅ Clé API configurée
                    </span>
                    {onApiKeyChange && (
                      <button
                        onClick={() => onApiKeyChange('')}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Coût estimé : ~12 FCFA par scan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info sélection Auto */}
      {selectedProvider === 'auto' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="text-2xl"></div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Mode Automatique Activé
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-400 mb-2">
                Le système choisira automatiquement le meilleur moteur OCR selon :
              </p>
              <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
                <li>• <strong>Tesseract</strong> pour documents simples et clairs (gratuit)</li>
                <li>• <strong>Google Vision</strong> pour documents complexes ou de mauvaise qualité (si clé API configurée)</li>
                <li>• Fallback automatique en cas d'échec</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRProviderSelector;

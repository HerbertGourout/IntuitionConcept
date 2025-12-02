/**
 * Composant de sélection du mode Standard/Advanced
 * Permet à l'utilisateur de basculer entre les services Standard et Advanced
 */

import React, { useState } from 'react';
import { Sparkles, Zap, TrendingDown, Clock, Info } from 'lucide-react';

export type ServiceMode = 'standard' | 'advanced';

export interface AdvancedModeSelectorProps {
  currentMode: ServiceMode;
  onModeChange: (mode: ServiceMode) => void;
  serviceName: string;
  estimatedCost?: {
    standard: number;
    advanced: number;
  };
  estimatedTime?: {
    standard: number; // en secondes
    advanced: number;
  };
  disabled?: boolean;
  className?: string;
}

export const AdvancedModeSelector: React.FC<AdvancedModeSelectorProps> = ({
  currentMode,
  onModeChange,
  serviceName,
  estimatedCost,
  estimatedTime,
  disabled = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const savings = estimatedCost 
    ? Math.round(((estimatedCost.standard - estimatedCost.advanced) / estimatedCost.standard) * 100)
    : 0;

  const timeGain = estimatedTime
    ? Math.round((estimatedTime.standard / estimatedTime.advanced))
    : 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Mode d'analyse</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Plus d'informations"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Standard Mode */}
        <button
          onClick={() => !disabled && onModeChange('standard')}
          disabled={disabled}
          className={`
            relative p-3 rounded-lg border-2 transition-all
            ${currentMode === 'standard'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-center mb-1">
            <Zap className={`w-5 h-5 ${currentMode === 'standard' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <div className={`text-sm font-semibold ${currentMode === 'standard' ? 'text-blue-700' : 'text-gray-700'}`}>
              Standard
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Modèle + Replicate
            </div>
          </div>
          {currentMode === 'standard' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          )}
        </button>

        {/* Advanced Mode */}
        <button
          onClick={() => !disabled && onModeChange('advanced')}
          disabled={disabled}
          className={`
            relative p-3 rounded-lg border-2 transition-all
            ${currentMode === 'advanced'
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-center mb-1">
            <Sparkles className={`w-5 h-5 ${currentMode === 'advanced' ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <div className={`text-sm font-semibold ${currentMode === 'advanced' ? 'text-purple-700' : 'text-gray-700'}`}>
              Advanced
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Gemini 3 Pro
            </div>
          </div>
          {currentMode === 'advanced' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            </div>
          )}
          {savings > 0 && currentMode !== 'advanced' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{savings}%
            </div>
          )}
        </button>
      </div>

      {/* Metrics */}
      {(estimatedCost || estimatedTime) && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {estimatedCost && (
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingDown className="w-3 h-3" />
              <span>
                {currentMode === 'advanced' 
                  ? `${estimatedCost.advanced} FCFA`
                  : `${estimatedCost.standard} FCFA`
                }
              </span>
            </div>
          )}
          {estimatedTime && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>
                {currentMode === 'advanced'
                  ? `~${estimatedTime.advanced}s`
                  : `~${estimatedTime.standard}s`
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-2">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Mode Standard</div>
            <ul className="text-gray-600 space-y-1 ml-4 list-disc">
              <li>Modèle Sonnet 3.5 pour analyse</li>
              <li>Replicate pour rendus 3D</li>
              <li>Qualité éprouvée</li>
              <li>Coût fixe</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-purple-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Mode Advanced
            </div>
            <ul className="text-gray-600 space-y-1 ml-4 list-disc">
              <li>Gemini 3 avec thinking_level adaptatif</li>
              <li>Résolution média intelligente</li>
              <li>Prix temps réel (Google Search)</li>
              <li>Rendus 4K natifs</li>
              <li>Économie jusqu'à 90%</li>
              <li>Qualité supérieure</li>
            </ul>
          </div>
        </div>
      )}

      {/* Advanced Badge */}
      {currentMode === 'advanced' && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Mode Advanced activé</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedModeSelector;

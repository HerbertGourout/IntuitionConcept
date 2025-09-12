import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Users, RefreshCw, X, ChevronRight } from 'lucide-react';
import { FinancialAnomaly, anomalyDetector } from '../../services/ai/anomalyDetector';

interface AnomalyDetectionWidgetProps {
  onAnomalyClick?: (anomaly: FinancialAnomaly) => void;
}

const SEVERITY_CONFIG = {
  critical: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    icon: '🚨'
  },
  high: { 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    icon: '⚠️'
  },
  medium: { 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    icon: '⚡'
  },
  low: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: 'ℹ️'
  }
};

const TYPE_ICONS = {
  budget_overrun: TrendingUp,
  unusual_expense: DollarSign,
  duplicate_transaction: Users,
  price_spike: TrendingUp,
  vendor_anomaly: Users
};

export const AnomalyDetectionWidget: React.FC<AnomalyDetectionWidgetProps> = ({
  onAnomalyClick
}) => {
  const [anomalies, setAnomalies] = useState<FinancialAnomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadAnomalies = async () => {
    setIsLoading(true);
    try {
      // Simuler des données pour la démo
      const mockProjects = [
        {
          id: 'proj_1',
          name: 'Rénovation Villa Yaoundé',
          budget: 5000000,
          spent: 5750000,
          currency: 'XAF',
          startDate: '2024-01-15',
          status: 'active'
        },
        {
          id: 'proj_2',
          name: 'Construction Immeuble Douala',
          budget: 15000000,
          spent: 14200000,
          currency: 'XAF',
          startDate: '2024-02-01',
          status: 'active'
        }
      ];

      const mockTransactions = [
        {
          id: 'trans_1',
          amount: 850000,
          currency: 'XAF',
          description: 'Matériaux de construction premium',
          vendorName: 'BTP Supplies Cameroun',
          projectId: 'proj_1',
          date: '2024-03-15',
          category: 'materials'
        },
        {
          id: 'trans_2',
          amount: 850000,
          currency: 'XAF',
          description: 'Matériaux de construction premium',
          vendorName: 'BTP Supplies Cameroun',
          projectId: 'proj_1',
          date: '2024-03-15',
          category: 'materials'
        }
      ];

      const mockHistorical = [
        {
          id: 'hist_1',
          amount: 300000,
          currency: 'XAF',
          description: 'Matériaux standard',
          vendorName: 'BTP Supplies Cameroun',
          date: '2024-01-15',
          category: 'materials'
        }
      ];

      const detectedAnomalies = await anomalyDetector.detectAnomalies(
        mockProjects,
        mockTransactions,
        mockHistorical
      );

      // Filtrer les anomalies rejetées
      const activeAnomalies = detectedAnomalies.filter(
        anomaly => !dismissedAnomalies.has(anomaly.id)
      );

      setAnomalies(activeAnomalies);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(loadAnomalies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dismissedAnomalies]);

  const handleDismissAnomaly = (anomalyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDismissedAnomalies(prev => new Set([...prev, anomalyId]));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAnomalySummary = () => {
    const summary = {
      critical: anomalies.filter(a => a.severity === 'critical').length,
      high: anomalies.filter(a => a.severity === 'high').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      low: anomalies.filter(a => a.severity === 'low').length,
    };
    return summary;
  };

  const summary = getAnomalySummary();
  const totalAnomalies = anomalies.length;

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowPanel(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowPanel(false);
    }, 300); // Délai de 300ms avant fermeture
    setHoverTimeout(timeout);
  };

  const handlePanelMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handlePanelMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowPanel(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  return (
    <div className="relative">
      {/* Bouton flottant */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 p-3 transition-all duration-200 hover:shadow-xl relative"
        title={`${totalAnomalies} anomalie${totalAnomalies !== 1 ? 's' : ''} détectée${totalAnomalies !== 1 ? 's' : ''}`}
      >
        <AlertTriangle className={`w-6 h-6 ${totalAnomalies > 0 ? 'text-red-600' : 'text-gray-400'}`} />
        {totalAnomalies > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalAnomalies > 9 ? '9+' : totalAnomalies}
          </div>
        )}
      </button>

      {/* Panneau déroulant */}
      {showPanel && (
        <div 
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Détection d'Anomalies
                  </h3>
                  <p className="text-sm text-gray-600">
                    {totalAnomalies} anomalie{totalAnomalies !== 1 ? 's' : ''} détectée{totalAnomalies !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={loadAnomalies}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Actualiser"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary */}
            {totalAnomalies > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {Object.entries(summary).map(([severity, count]) => {
                  const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
                  return (
                    <div
                      key={severity}
                      className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}
                    >
                      <div className="text-center">
                        <div className={`text-sm font-bold ${config.color}`}>{count}</div>
                        <div className="text-xs text-gray-600 capitalize">{severity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600 text-sm">Analyse en cours...</span>
              </div>
            ) : totalAnomalies === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-gray-600 text-sm">Aucune anomalie détectée</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tous vos projets semblent en bonne santé financière
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {anomalies.slice(0, 5).map((anomaly) => {
                  const config = SEVERITY_CONFIG[anomaly.severity];
                  const TypeIcon = TYPE_ICONS[anomaly.type] || AlertTriangle;
                  
                  return (
                    <div
                      key={anomaly.id}
                      onClick={() => onAnomalyClick?.(anomaly)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${config.bgColor} ${config.borderColor} group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <div className="flex-shrink-0">
                            <TypeIcon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${config.color} text-xs`}>
                                {anomaly.title}
                              </h4>
                              <span className="text-xs px-1 py-0.5 bg-white rounded text-gray-600">
                                {anomaly.confidence}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                              {anomaly.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`font-semibold text-xs ${config.color}`}>
                                {formatCurrency(anomaly.amount, anomaly.currency)}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDismissAnomaly(anomaly.id, e)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                          title="Ignorer cette anomalie"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {anomalies.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Voir toutes les anomalies ({anomalies.length})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Last update */}
            {lastUpdate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Dernière analyse: {lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

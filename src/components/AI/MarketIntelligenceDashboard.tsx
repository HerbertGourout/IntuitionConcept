import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, DollarSign, Calendar, Activity } from 'lucide-react';
import { grokService } from '../../services/ai/grokService';
import { MarketData, MarketAlert } from '../../services/ai/grokService';

interface MarketIntelligenceData {
  marketData: MarketData[];
  alerts: MarketAlert[];
  summary: string;
  recommendations: string[];
}

const MarketIntelligenceDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketIntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Chargement initial et auto-refresh
  useEffect(() => {
    loadMarketData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMarketData, 3600000); // Chaque heure
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Utiliser directement Grok pour l'intelligence marché
      const marketDataResponse = await grokService.getMarketUpdates();
      const alertsResponse = await grokService.generateMarketAlerts(marketDataResponse);
      
      const marketIntelligence: MarketIntelligenceData = {
        marketData: marketDataResponse,
        alerts: alertsResponse,
        summary: "Données marché BTP mises à jour via Grok",
        recommendations: [
          "Surveiller les fluctuations des prix du béton",
          "Anticiper les hausses saisonnières",
          "Optimiser les achats groupés"
        ]
      };
      
      setMarketData(marketIntelligence);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement données marché:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatPercentage = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Veille Marché BTP Temps Réel
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Intelligence marché avec données actualisées
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh
              </label>
            </div>
            
            <button
              onClick={loadMarketData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
        
        {lastUpdate && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Chargement des données marché...
            </span>
          </div>
        </div>
      )}

      {marketData && !loading && (
        <>
          {/* Résumé du marché */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Résumé du Marché
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {marketData.summary}
            </p>
          </div>

          {/* Alertes critiques */}
          {marketData.alerts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Alertes Marché ({marketData.alerts.length})
              </h3>
              
              <div className="space-y-3">
                {marketData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{alert.material}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{alert.message}</p>
                        <p className="text-sm opacity-90 mb-2">{alert.impact}</p>
                        <p className="text-sm font-medium">💡 {alert.recommendation}</p>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prix des matériaux */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Prix des Matériaux
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.marketData.map((material, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {material.material}
                    </h4>
                    {getTrendIcon(material.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prix actuel</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(material.currentPrice)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Évolution</span>
                      <span className={`font-medium ${
                        material.changePercent > 0 ? 'text-red-600' : 
                        material.changePercent < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(material.changePercent)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Variation</span>
                      <span className={`font-medium ${
                        material.change > 0 ? 'text-red-600' : 
                        material.change < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {material.change > 0 ? '+' : ''}{formatPrice(material.change)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Source: {material.source}</span>
                      <span>{new Date(material.lastUpdated).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations */}
          {marketData.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Recommandations Stratégiques
              </h3>
              
              <div className="space-y-3">
                {marketData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-blue-800 dark:text-blue-200">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Matériaux en hausse</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {marketData.marketData.filter(m => m.trend === 'up').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Matériaux en baisse</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {marketData.marketData.filter(m => m.trend === 'down').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alertes actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {marketData.alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketIntelligenceDashboard;

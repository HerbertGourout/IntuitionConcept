import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Users, RefreshCw, X, ChevronRight } from 'lucide-react';
import { FinancialAnomaly, anomalyDetectionService } from '../../services/ai/anomalyDetectionService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

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
  const { currentUser } = useAuth();
  const loadAnomalies = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        setAnomalies([]);
        return;
      }

      // 1. Récupérer tous les projets de l'utilisateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        where('status', 'in', ['active', 'in_progress'])
      );
      
      const projectsSnap = await getDocs(projectsQuery);
      const projects = projectsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (projects.length === 0) {
        setAnomalies([]);
        setLastUpdate(new Date());
        return;
      }

      // 2. Récupérer toutes les transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      const transactions = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 3. Récupérer l'historique (transactions des 90 derniers jours)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const historicalQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const historicalSnap = await getDocs(historicalQuery);
      const historical = historicalSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(t => {
          const transactionDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
          return transactionDate >= ninetyDaysAgo;
        });

      // 4. Détecter les anomalies financières
      const detectedAnomalies = await anomalyDetectionService.detectAnomalies(
        projects,
        transactions,
        historical
      );

      // 5. Analyser chaque projet pour les anomalies de règles
      const allAnomalies: FinancialAnomaly[] = [...detectedAnomalies];
      for (const project of projects) {
        const projectAnomalies = await anomalyDetectionService.analyzeProject(project.id);
        // Convertir Anomaly en FinancialAnomaly
        const financialAnomalies = projectAnomalies.map(a => ({
          ...a,
          currency: project.currency || 'XAF',
          amount: a.impact.financial,
          confidence: 85
        })) as FinancialAnomaly[];
        allAnomalies.push(...financialAnomalies);
      }

      // 6. Filtrer les anomalies rejetées et dédupliquer
      const uniqueAnomalies = allAnomalies.filter(
        (anomaly, index, self) => 
          !dismissedAnomalies.has(anomaly.id || '') &&
          index === self.findIndex(a => a.id === anomaly.id)
      );

      setAnomalies(uniqueAnomalies);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies:', error);
      setAnomalies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAnomalies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 

  useEffect(() => {
    // Actualiser toutes les 5 minutes
    const interval = setInterval(loadAnomalies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dismissedAnomalies]);

  const handleDismissAnomaly = async (anomalyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDismissedAnomalies(prev => new Set([...prev, anomalyId]));
    
    // Ignorer l'anomalie dans Firebase
    if (currentUser && anomalyId) {
      try {
        await anomalyDetectionService.ignoreAnomaly(anomalyId, currentUser.uid, 'Rejetée par l\'utilisateur');
      } catch (error) {
        console.error('Erreur lors du rejet de l\'anomalie:', error);
      }
    }
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

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      {/* Header compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${totalAnomalies > 0 ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Anomalies</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              IA temps réel
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAnomalies}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {totalAnomalies > 0 && (
            <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
              {totalAnomalies} anomalie{totalAnomalies !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Résumé des anomalies */}
      {totalAnomalies > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(summary).map(([severity, count]) => {
            const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
            return (
              <div
                key={severity}
                className={`p-4 rounded-xl border-2 ${config.bgColor} ${config.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className={`text-xl font-bold ${config.color}`}>{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize font-medium">{severity}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistiques compactes */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{summary.high}</div>
          <div className="text-xs text-red-500 dark:text-red-300 font-medium">Critique</div>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summary.medium}</div>
          <div className="text-xs text-yellow-500 dark:text-yellow-300 font-medium">Modéré</div>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.low}</div>
          <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">Faible</div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="space-y-4">
            {isLoading ? (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Analyse IA en cours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Détection des anomalies financières...</p>
              </div>
            </div>
          </div>
        ) : totalAnomalies === 0 ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 text-center border border-green-200 dark:border-green-700">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">✅</div>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Aucune anomalie détectée</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tous vos projets semblent en bonne santé financière
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.slice(0, 5).map((anomaly) => {
              const config = SEVERITY_CONFIG[anomaly.severity];
              const TypeIcon = TYPE_ICONS[anomaly.type] || AlertTriangle;
              
              return (
                <div
                  key={anomaly.id}
                  onClick={() => onAnomalyClick?.(anomaly)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${config.bgColor} ${config.borderColor} group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                        <TypeIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`font-semibold ${config.color} text-sm`}>
                            {anomaly.title}
                          </h4>
                          <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                            {anomaly.confidence}% confiance
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                          {anomaly.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-lg ${config.color}`}>
                            {formatCurrency(anomaly.amount, anomaly.currency)}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDismissAnomaly(anomaly.id, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all duration-300 hover:scale-110"
                      title="Ignorer cette anomalie"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {anomalies.length > 5 && (
              <div className="text-center pt-4">
                <button className="btn-base btn-gradient-primary hover-lift px-6 py-3 text-sm">
                  Voir toutes les anomalies ({anomalies.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dernière mise à jour */}
        {lastUpdate && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dernière analyse: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

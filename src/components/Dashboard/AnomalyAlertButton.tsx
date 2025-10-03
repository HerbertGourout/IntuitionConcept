import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Check, X, Clock } from 'lucide-react';

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  projectId: string;
  projectName: string;
  detectedAt: string;
  type: 'budget_overrun' | 'schedule_delay' | 'quality_issue' | 'resource_shortage' | 'other';
}

const AnomalyAlertButton: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Simuler le chargement des anomalies (remplacer par votre logique réelle)
  const loadAnomalies = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulation - remplacer par votre API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnomalies: Anomaly[] = [
        {
          id: '1',
          title: 'Dépassement budgétaire',
          description: 'Le projet Villa Moderne dépasse le budget de 15%',
          severity: 'high',
          projectId: 'proj1',
          projectName: 'Villa Moderne',
          detectedAt: new Date().toISOString(),
          type: 'budget_overrun'
        },
        {
          id: '2',
          title: 'Retard de livraison',
          description: 'Retard de 3 jours sur la phase de gros œuvre',
          severity: 'medium',
          projectId: 'proj2',
          projectName: 'Immeuble Centre-ville',
          detectedAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'schedule_delay'
        }
      ];
      
      setAnomalies(mockAnomalies.filter(a => !dismissedAnomalies.has(a.id)));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dismissedAnomalies]);

  useEffect(() => {
    loadAnomalies();
  }, [loadAnomalies]);

  useEffect(() => {
    // Actualiser toutes les 5 minutes
    const interval = setInterval(loadAnomalies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAnomalies]);

  // Gestion du hover
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (clickTimeout) clearTimeout(clickTimeout);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 300); // Délai de 300ms avant fermeture
    setHoverTimeout(timeout);
  };

  // Gestion du clic
  const handleClick = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (clickTimeout) clearTimeout(clickTimeout);
    
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      // Auto-fermeture après 10 secondes si ouvert par clic
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
      setClickTimeout(timeout);
    }
  };

  // Fermer si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        popoverRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResolveAnomaly = (anomalyId: string) => {
    setDismissedAnomalies(prev => new Set([...prev, anomalyId]));
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
  };

  const handleIgnoreAnomaly = (anomalyId: string) => {
    setDismissedAnomalies(prev => new Set([...prev, anomalyId]));
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
  };

  const getAnomalySummary = () => {
    return {
      high: anomalies.filter(a => a.severity === 'high').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      low: anomalies.filter(a => a.severity === 'low').length,
    };
  };

  const summary = getAnomalySummary();
  const totalAnomalies = anomalies.length;
  const hasHighSeverity = summary.high > 0;
  const hasMediumSeverity = summary.medium > 0;

  // Déterminer la couleur du bouton selon la sévérité
  const getButtonColor = () => {
    if (hasHighSeverity) return 'bg-red-500 hover:bg-red-600 text-white';
    if (hasMediumSeverity) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    if (totalAnomalies > 0) return 'bg-blue-500 hover:bg-blue-600 text-white';
    return 'bg-green-500 hover:bg-green-600 text-white';
  };

  const getButtonIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (totalAnomalies === 0) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="relative">
      {/* Bouton d'alerte */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl
          ${getButtonColor()}
          ${isOpen ? 'scale-110 shadow-xl' : ''}
        `}
        title={`${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} détectée${totalAnomalies > 1 ? 's' : ''}`}
      >
        {getButtonIcon()}
        
        {/* Badge de notification */}
        {totalAnomalies > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalAnomalies > 9 ? '9+' : totalAnomalies}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${totalAnomalies > 0 ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
                  {getButtonIcon()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Anomalies détectées
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {lastUpdate ? `Mis à jour ${lastUpdate.toLocaleTimeString('fr-FR')}` : 'Chargement...'}
                  </p>
                </div>
              </div>
              <button
                onClick={loadAnomalies}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Statistiques */}
          {totalAnomalies > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{summary.high}</div>
                  <div className="text-xs text-red-500 dark:text-red-300">Critique</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summary.medium}</div>
                  <div className="text-xs text-yellow-500 dark:text-yellow-300">Modéré</div>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.low}</div>
                  <div className="text-xs text-blue-500 dark:text-blue-300">Faible</div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des anomalies */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <RefreshCw className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Analyse en cours...</p>
              </div>
            ) : totalAnomalies === 0 ? (
              <div className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Aucune anomalie</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tous vos projets sont en bonne santé !</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`p-3 rounded-lg border-l-2 ${
                      anomaly.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              anomaly.severity === 'high'
                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : anomaly.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            }`}
                          >
                            {anomaly.severity === 'high' ? 'CRITIQUE' : anomaly.severity === 'medium' ? 'MODÉRÉ' : 'FAIBLE'}
                          </span>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(anomaly.detectedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {anomaly.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                          {anomaly.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          <span className="font-medium">Projet:</span> {anomaly.projectName}
                        </div>
                      </div>
                      <div className="ml-2 flex space-x-1">
                        <button
                          onClick={() => handleResolveAnomaly(anomaly.id)}
                          className="p-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors duration-200"
                          title="Résoudre"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleIgnoreAnomaly(anomaly.id)}
                          className="p-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded transition-colors duration-200"
                          title="Ignorer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyAlertButton;

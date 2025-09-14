import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, AlertCircle, CheckCircle, Sync } from 'lucide-react';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onStatusChange?: (isOnline: boolean) => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = true,
  position = 'top-right',
  onStatusChange
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérification périodique de la connectivité
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const online = response.ok;
        
        if (online !== isOnline) {
          setIsOnline(online);
          onStatusChange?.(online);
          if (online) {
            setLastOnline(new Date());
          }
        }
      } catch {
        if (isOnline) {
          setIsOnline(false);
          onStatusChange?.(false);
        }
      }
    };

    const interval = setInterval(checkConnectivity, 30000); // Vérifier toutes les 30 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, onStatusChange]);

  // Simuler les synchronisations en attente
  useEffect(() => {
    if (!isOnline) {
      const timer = setTimeout(() => {
        setPendingSyncs(prev => prev + 1);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Réinitialiser les synchronisations en attente quand on revient en ligne
      if (pendingSyncs > 0) {
        const syncTimer = setTimeout(() => {
          setPendingSyncs(0);
        }, 2000);
        return () => clearTimeout(syncTimer);
      }
    }
  }, [isOnline, pendingSyncs]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const formatLastOnline = () => {
    if (!lastOnline) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - lastOnline.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  if (!showDetails && isOnline) {
    return null; // Ne rien afficher si en ligne et pas de détails demandés
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icône principale */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 animate-pulse" />
          )}
          
          {pendingSyncs > 0 && (
            <div className="flex items-center gap-1">
              <Sync className="w-3 h-3 animate-spin" />
              <span className="text-xs font-medium">{pendingSyncs}</span>
            </div>
          )}
        </div>

        {/* Texte de statut */}
        {showDetails && (
          <span className="text-sm font-medium">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        )}

        {/* Tooltip détaillé */}
        {showTooltip && (
          <div className={`absolute ${position.includes('top') ? 'top-full mt-2' : 'bottom-full mb-2'} ${
            position.includes('right') ? 'right-0' : 'left-0'
          } w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-10`}>
            <div className="space-y-2">
              {/* Statut de connexion */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {isOnline ? 'Connexion active' : 'Connexion interrompue'}
                </span>
              </div>

              {/* Dernière connexion */}
              <div className="text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>Dernière connexion: {formatLastOnline()}</span>
                </div>
              </div>

              {/* Synchronisations en attente */}
              {pendingSyncs > 0 && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Sync className="w-3 h-3" />
                    <span>{pendingSyncs} synchronisation{pendingSyncs > 1 ? 's' : ''} en attente</span>
                  </div>
                </div>
              )}

              {/* Mode hors ligne */}
              {!isOnline && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <CloudOff className="w-3 h-3" />
                    <span>Mode hors ligne activé</span>
                  </div>
                  <div className="mt-1 text-xs text-blue-500">
                    Vos données seront synchronisées dès le retour de la connexion
                  </div>
                </div>
              )}

              {/* Conseils */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {isOnline ? (
                    'Toutes les fonctionnalités sont disponibles'
                  ) : (
                    'Fonctionnalités limitées en mode hors ligne'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation de pulsation pour le mode hors ligne */}
      {!isOnline && (
        <div className="absolute inset-0 rounded-lg bg-red-400 opacity-20 animate-ping"></div>
      )}
    </div>
  );
};

export default OfflineIndicator;

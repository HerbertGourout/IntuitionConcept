import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOffline } from '../../../contexts/OfflineContext';

interface OfflineStatusWidgetProps {
  className?: string;
}

const OfflineStatusWidget: React.FC<OfflineStatusWidgetProps> = ({ className = '' }) => {
  const { resolvedTheme } = useTheme();
  const { 
    isOnline, 
    pendingActions, 
    syncPendingActions, 
    getCacheSize, 
    getLastSyncTime,
    clearCache 
  } = useOffline();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const cacheSize = getCacheSize();
  const lastSync = getLastSyncTime();
  const pendingCount = pendingActions.length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingActions();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-orange-500';
    if (pendingCount > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (pendingCount > 0) return `${pendingCount} en attente`;
    return 'Synchronisé';
  };

  return (
    <div className={`h-full ${className}`}>
      {/* En-tête principal */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
            Mode Offline
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Voir les détails"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>

        {/* Statut principal */}
        <motion.div
          className={`p-4 rounded-lg border ${
            resolvedTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-orange-500'
              } animate-pulse`} />
              <div>
                <p className="font-medium">{getStatusText()}</p>
                <p className="text-xs opacity-70">
                  {isOnline ? 'Connexion active' : 'Travail hors ligne possible'}
                </p>
              </div>
            </div>
            
            {isOnline && pendingCount > 0 && (
              <motion.button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Sync</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          className={`p-3 rounded-lg text-center ${
            resolvedTheme === 'dark'
              ? 'bg-blue-900/30 border border-blue-700'
              : 'bg-blue-50 border border-blue-200'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center mb-1">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs opacity-70">Actions</p>
          <p className="text-lg font-bold text-blue-600">
            {pendingCount}
          </p>
        </motion.div>

        <motion.div
          className={`p-3 rounded-lg text-center ${
            resolvedTheme === 'dark'
              ? 'bg-purple-900/30 border border-purple-700'
              : 'bg-purple-50 border border-purple-200'
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center mb-1">
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs opacity-70">Cache</p>
          <p className="text-lg font-bold text-purple-600">
            {cacheSize}KB
          </p>
        </motion.div>
      </div>

      {/* Détails étendus */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Dernière synchronisation */}
            <div className={`p-3 rounded-lg ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Dernière sync</span>
              </div>
              <p className="text-xs opacity-70">
                {formatLastSync(lastSync)}
              </p>
            </div>

            {/* Actions en attente */}
            {pendingCount > 0 && (
              <div className={`p-3 rounded-lg ${
                resolvedTheme === 'dark'
                  ? 'bg-yellow-900/20 border border-yellow-700'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Actions en attente</span>
                </div>
                <div className="space-y-1">
                  {pendingActions.slice(0, 3).map((action, index) => (
                    <div key={action.id} className="flex items-center justify-between text-xs">
                      <span className="opacity-70">
                        {action.type} {action.collection}
                      </span>
                      <span className="text-yellow-600">
                        {action.retryCount > 0 ? `Retry ${action.retryCount}` : 'Nouveau'}
                      </span>
                    </div>
                  ))}
                  {pendingCount > 3 && (
                    <p className="text-xs opacity-50 text-center mt-2">
                      +{pendingCount - 3} autres...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions de gestion */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => clearCache()}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'bg-red-900/20 border border-red-700 text-red-400 hover:bg-red-900/30'
                    : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs">Vider cache</span>
              </motion.button>

              {isOnline && (
                <motion.button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-xs">
                    {isSyncing ? 'Sync...' : 'Forcer sync'}
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de statut permanent */}
      <motion.div
        className={`fixed bottom-4 right-4 z-50 p-2 rounded-full shadow-lg ${
          isOnline 
            ? pendingCount > 0
              ? 'bg-yellow-500'
              : 'bg-green-500'
            : 'bg-orange-500'
        } text-white`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        {isOnline ? (
          pendingCount > 0 ? (
            <div className="flex items-center gap-1">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-bold">{pendingCount}</span>
            </div>
          ) : (
            <CheckCircle className="w-4 h-4" />
          )
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
      </motion.div>
    </div>
  );
};

export default OfflineStatusWidget;

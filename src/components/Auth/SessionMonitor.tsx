import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { sessionManager } from '../../services/sessionManager';
import { useAuth } from '../../contexts/AuthContext';

interface SessionMonitorProps {
  warningThreshold?: number; // en millisecondes
  autoRefresh?: boolean;
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({
  warningThreshold = 5 * 60 * 1000, // 5 minutes
  autoRefresh = true
}) => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeout = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!user) return;

    const handleWarning = (timeUntilExpiry: number) => {
      setTimeLeft(timeUntilExpiry);
      setShowWarning(true);
    };

    const handleExpiry = async () => {
      setShowWarning(false);
      setSessionExpired(true);
    };

    sessionManager.startSessionMonitoring(handleWarning, handleExpiry);

    return () => {
      sessionManager.stopSessionMonitoring();
    };
  }, [user, logout]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await sessionManager.refreshSession();
      if (success) {
        setShowWarning(false);
        setFeedback({
          type: 'success',
          message: 'Votre session a été renouvelée avec succès.'
        });
      } else {
        throw new Error('Échec du renouvellement');
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement de session:', error);
      setFeedback({
        type: 'error',
        message: 'Impossible de renouveler la session. Veuillez vous reconnecter.'
      });
      logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };

  const handleConfirmExpiry = () => {
    setSessionExpired(false);
    logout();
  };

  const formatTimeLeft = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = (): number => {
    const maxTime = warningThreshold;
    return Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  };

  const progressPercent = getProgressPercent();
  const progressGradient = progressPercent > 60
    ? 'from-emerald-400 via-emerald-500 to-cyan-500'
    : progressPercent > 30
      ? 'from-amber-400 via-orange-400 to-orange-500'
      : 'from-rose-500 via-red-500 to-red-600';

  if (!user && !feedback) return null;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="glass-card relative max-w-md w-full rounded-3xl border border-white/10 shadow-2xl">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-400 flex items-center justify-center shadow-xl">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>

            <div className="flex flex-col gap-6 p-8 pt-14 text-slate-100">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Session bientôt expirée</h2>
                <p className="text-slate-300">
                  Pour continuer à utiliser l'application, vous devez renouveler votre session
                  ou vous reconnecter.
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="flex items-center justify-between text-sm uppercase tracking-wide text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Temps restant
                  </span>
                  <span className="font-semibold text-white text-base">
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>

                <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${progressGradient}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {autoRefresh && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                  <RefreshCw className="h-4 w-4" />
                  <span>Le renouvellement automatique est activé.</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
                <button
                  type="button"
                  onClick={handleRefreshSession}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Renouvellement...' : 'Renouveler la session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur">
          <div className="glass-card max-w-md w-full rounded-3xl border border-red-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/60 p-8 text-center text-slate-100 shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold">Session expirée</h2>
            <p className="mt-3 text-slate-300">
              Votre session a expiré. Pour continuer, veuillez vous reconnecter.
            </p>
            <button
              type="button"
              onClick={handleConfirmExpiry}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              <LogOut className="h-4 w-4" />
              Se reconnecter
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`glass-card flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition ${
              feedback.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                : 'border-red-400/40 bg-red-500/10 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <RefreshCw className="h-5 w-5 text-emerald-300" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-300" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionMonitor;

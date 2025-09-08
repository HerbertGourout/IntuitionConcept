import React, { useEffect, useState } from 'react';
import { Modal, Button, Progress } from 'antd';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (!user) return;

    const handleWarning = (timeUntilExpiry: number) => {
      setTimeLeft(timeUntilExpiry);
      setShowWarning(true);
    };

    const handleExpiry = async () => {
      setShowWarning(false);
      Modal.error({
        title: 'Session expirée',
        content: 'Votre session a expiré. Vous allez être déconnecté.',
        onOk: () => logout()
      });
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
        Modal.success({
          title: 'Session renouvelée',
          content: 'Votre session a été renouvelée avec succès.',
        });
      } else {
        throw new Error('Échec du renouvellement');
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement de session:', error);
      Modal.error({
        title: 'Erreur de renouvellement',
        content: 'Impossible de renouveler la session. Veuillez vous reconnecter.',
        onOk: () => logout()
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setShowWarning(false);
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

  const getProgressStatus = (): "success" | "normal" | "exception" => {
    const percent = getProgressPercent();
    if (percent > 60) return "success";
    if (percent > 30) return "normal";
    return "exception";
  };

  if (!user || !showWarning) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span>Session bientôt expirée</span>
        </div>
      }
      open={showWarning}
      onCancel={() => setShowWarning(false)}
      footer={[
        <Button key="logout" onClick={handleLogout}>
          Se déconnecter
        </Button>,
        <Button
          key="refresh"
          type="primary"
          loading={isRefreshing}
          onClick={handleRefreshSession}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Renouveler la session
        </Button>
      ]}
      closable={false}
      maskClosable={false}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            Votre session expire dans{' '}
            <strong className="text-red-600">
              {formatTimeLeft(timeLeft)}
            </strong>
          </span>
        </div>

        <Progress
          percent={getProgressPercent()}
          status={getProgressStatus()}
          showInfo={false}
          strokeColor={{
            '0%': '#52c41a',
            '50%': '#faad14',
            '100%': '#ff4d4f',
          }}
        />

        <div className="text-sm text-gray-600">
          <p>
            Pour continuer à utiliser l'application, vous devez renouveler votre session
            ou vous reconnecter.
          </p>
          {autoRefresh && (
            <p className="mt-2 text-blue-600">
              💡 Le renouvellement automatique est activé
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SessionMonitor;

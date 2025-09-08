import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Statistic, Row, Col, Alert, Timeline, Badge } from 'antd';
import { Shield, AlertTriangle, Users, Activity, Eye, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auditLogger, AuditEvent, SecurityAlert } from '../../services/auditLogger';
import { useSecureAction } from '../../hooks/useSecureAction';

const SecurityDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

  // Vérifier les permissions d'accès
  const canViewSecurity = hasPermission('admin.system') || hasPermission('admin.users');

  // Action sécurisée pour consulter les logs
  const { execute: loadSecurityData } = useSecureAction(
    async () => {
      setLoading(true);
      try {
        const [logs, alerts] = await Promise.all([
          auditLogger.getUserAuditLogs('all', 100), // Tous les utilisateurs pour admin
          auditLogger.getSecurityAlerts()
        ]);
        setAuditLogs(logs);
        setSecurityAlerts(alerts);
      } catch (error) {
        console.error('Erreur lors du chargement des données de sécurité:', error);
      } finally {
        setLoading(false);
      }
    },
    'view_security_dashboard',
    {
      requiredPermissions: ['admin.system'],
      resource: 'security_dashboard',
      logAction: true
    }
  );

  // Action sécurisée pour exporter les logs
  const { execute: exportLogs } = useSecureAction(
    async () => {
      const dataStr = JSON.stringify(auditLogs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    'export_audit_logs',
    {
      requiredPermissions: ['admin.system'],
      resource: 'audit_logs',
      logAction: true
    }
  );

  useEffect(() => {
    if (canViewSecurity) {
      loadSecurityData();
    }
  }, [canViewSecurity]);

  if (!canViewSecurity) {
    return (
      <div className="p-6">
        <Alert
          message="Accès refusé"
          description="Vous n'avez pas les permissions nécessaires pour accéder au tableau de bord de sécurité."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Statistiques de sécurité
  const getSecurityStats = () => {
    const today = new Date();
    const last24h = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = auditLogs.filter(log => 
      new Date(log.timestamp.toDate()) > last24h
    );
    
    const failedActions = recentLogs.filter(log => log.result === 'failure' || log.result === 'blocked');
    const criticalAlerts = securityAlerts.filter(alert => !alert.resolved);
    
    return {
      totalLogs: auditLogs.length,
      recentLogs: recentLogs.length,
      failedActions: failedActions.length,
      activeAlerts: criticalAlerts.length
    };
  };

  const stats = getSecurityStats();

  // Colonnes pour la table des logs d'audit
  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: any) => new Date(timestamp.toDate()).toLocaleString('fr-FR'),
      sorter: (a: AuditEvent, b: AuditEvent) => 
        new Date(a.timestamp.toDate()).getTime() - new Date(b.timestamp.toDate()).getTime(),
    },
    {
      title: 'Utilisateur',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => userId.substring(0, 8) + '...',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Ressource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => resource || '-',
    },
    {
      title: 'Résultat',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => {
        const color = result === 'success' ? 'green' : result === 'failure' ? 'red' : 'orange';
        return <Tag color={color}>{result}</Tag>;
      },
    },
    {
      title: 'Sévérité',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = severity === 'critical' ? 'red' : severity === 'high' ? 'orange' : 
                     severity === 'medium' ? 'blue' : 'green';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
  ];

  // Colonnes pour la table des alertes de sécurité
  const alertColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          'suspicious_activity': 'Activité suspecte',
          'permission_escalation': 'Escalade de privilèges',
          'multiple_failures': 'Échecs multiples',
          'unusual_access': 'Accès inhabituel'
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Utilisateur',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => userId.substring(0, 8) + '...',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: any) => new Date(timestamp.toDate()).toLocaleString('fr-FR'),
    },
    {
      title: 'Statut',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (resolved: boolean) => (
        <Badge 
          status={resolved ? 'success' : 'error'} 
          text={resolved ? 'Résolu' : 'Actif'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: SecurityAlert) => (
        <Button 
          size="small" 
          icon={<Eye className="w-4 h-4" />}
          onClick={() => setSelectedAlert(record)}
        >
          Détails
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Sécurité</h1>
            <p className="text-gray-600">Surveillance et audit des activités système</p>
          </div>
        </div>
        <Space>
          <Button 
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={loadSecurityData}
            loading={loading}
          >
            Actualiser
          </Button>
          <Button 
            icon={<Download className="w-4 h-4" />}
            onClick={exportLogs}
            type="primary"
          >
            Exporter les logs
          </Button>
        </Space>
      </div>

      {/* Statistiques */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total des logs"
              value={stats.totalLogs}
              prefix={<Activity className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Activité 24h"
              value={stats.recentLogs}
              prefix={<Users className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Actions échouées"
              value={stats.failedActions}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertTriangle className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Alertes actives"
              value={stats.activeAlerts}
              valueStyle={{ color: stats.activeAlerts > 0 ? '#cf1322' : '#3f8600' }}
              prefix={<Shield className="w-4 h-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alertes de sécurité */}
      {securityAlerts.length > 0 && (
        <Card title="Alertes de Sécurité" extra={<Badge count={stats.activeAlerts} />}>
          <Table
            columns={alertColumns}
            dataSource={securityAlerts}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        </Card>
      )}

      {/* Logs d'audit */}
      <Card title="Logs d'Audit">
        <Table
          columns={auditColumns}
          dataSource={auditLogs}
          rowKey={(record) => `${record.userId}-${record.timestamp}`}
          size="small"
          pagination={{ pageSize: 20 }}
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal de détails d'alerte */}
      <Modal
        title="Détails de l'Alerte de Sécurité"
        open={!!selectedAlert}
        onCancel={() => setSelectedAlert(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedAlert(null)}>
            Fermer
          </Button>
        ]}
        width={800}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Type d'alerte</h3>
              <p>{selectedAlert.type}</p>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{selectedAlert.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Utilisateur concerné</h3>
              <p>{selectedAlert.userId}</p>
            </div>
            <div>
              <h3 className="font-semibold">Événements associés</h3>
              <Timeline>
                {selectedAlert.events.map((event, index) => (
                  <Timeline.Item key={index}>
                    <div>
                      <strong>{event.action}</strong> - {event.result}
                      <br />
                      <small className="text-gray-500">
                        {new Date(event.timestamp.toDate()).toLocaleString('fr-FR')}
                      </small>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityDashboard;

import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Alert, Statistic, Row, Col, Modal, List } from 'antd';
import { 
  WarningOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  EyeOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { Anomaly } from '../../services/ai/anomalyDetectionService';

const AnomalyDetectionDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    setLoading(true);
    try {
      // Simulation avec des anomalies de démonstration
      const mockAnomalies: Anomaly[] = [
        {
          id: 'anom_1',
          type: 'budget_overrun',
          severity: 'high',
          projectId: 'project_villa_abc',
          title: 'Dépassement budgétaire: 23% vs 20% prévu',
          description: 'Le budget alloué a été dépassé de 350 000 XOF sur la phase gros œuvre.',
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
          expectedValue: 1500000,
          actualValue: 1850000,
          deviation: 350000,
          deviationPercentage: 23.3,
          impact: {
            financial: 350000,
            timeline: 2,
            quality: 0
          },
          recommendations: [
            'Réviser le budget prévisionnel et identifier les postes de dépassement',
            'Négocier avec les fournisseurs pour réduire les coûts',
            'Optimiser les ressources et éliminer les gaspillages'
          ],
          status: 'active'
        },
        {
          id: 'anom_2',
          type: 'timeline_delay',
          severity: 'medium',
          projectId: 'project_villa_abc',
          title: 'Retard planning: 5 jours vs 40 jours prévus',
          description: 'Le projet accuse un retard de 5 jours sur le planning initial.',
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // Il y a 4h
          expectedValue: 40,
          actualValue: 45,
          deviation: 5,
          deviationPercentage: 12.5,
          impact: {
            financial: 250000,
            timeline: 5,
            quality: 0
          },
          recommendations: [
            'Réorganiser le planning et prioriser les tâches critiques',
            'Augmenter temporairement les effectifs sur les tâches en retard',
            'Identifier et résoudre les blocages opérationnels'
          ],
          status: 'active'
        },
        {
          id: 'anom_3',
          type: 'quality_issue',
          severity: 'high',
          projectId: 'project_villa_abc',
          title: 'Chute qualité: 65% vs 85% requis',
          description: 'Le score qualité est tombé sous le seuil acceptable de 70%.',
          detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6h
          expectedValue: 85,
          actualValue: 65,
          deviation: 20,
          deviationPercentage: 23.5,
          impact: {
            financial: 200000,
            timeline: 3,
            quality: 20
          },
          recommendations: [
            'Effectuer un contrôle qualité approfondi',
            'Former les équipes aux bonnes pratiques',
            'Renforcer la supervision sur site',
            'Prévoir des reprises si nécessaire'
          ],
          status: 'acknowledged'
        },
        {
          id: 'anom_4',
          type: 'cost_spike',
          severity: 'medium',
          projectId: 'project_bureau_xyz',
          title: 'Pic de coût: 45% au-dessus de la moyenne',
          description: 'Le coût journalier a augmenté de 45% par rapport à la moyenne des 7 derniers jours.',
          detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // Il y a 8h
          expectedValue: 35000,
          actualValue: 50750,
          deviation: 15750,
          deviationPercentage: 45,
          impact: {
            financial: 15750,
            timeline: 0,
            quality: 5
          },
          recommendations: [
            'Analyser les causes du pic de coût',
            'Vérifier les factures et détecter d\'éventuelles erreurs',
            'Mettre en place un contrôle budgétaire quotidien'
          ],
          status: 'resolved'
        }
      ];

      setAnomalies(mockAnomalies);
    } catch (error) {
      console.error('Erreur chargement anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // Simuler l'analyse de tous les projets
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadAnomalies();
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple'
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    const icons = {
      low: <ClockCircleOutlined />,
      medium: <WarningOutlined />,
      high: <ExclamationCircleOutlined />,
      critical: <ExclamationCircleOutlined />
    };
    return icons[severity];
  };

  const getStatusColor = (status: Anomaly['status']) => {
    const colors = {
      active: 'red',
      acknowledged: 'orange',
      resolved: 'green',
      ignored: 'gray'
    };
    return colors[status];
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    const icons = {
      budget_overrun: <DollarOutlined />,
      timeline_delay: <CalendarOutlined />,
      cost_spike: <DollarOutlined />,
      resource_conflict: <WarningOutlined />,
      quality_issue: <SafetyCertificateOutlined />,
      weather_impact: <CloudOutlined />
    };
    return icons[type] || <WarningOutlined />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStats = () => {
    const total = anomalies.length;
    const active = anomalies.filter(a => a.status === 'active').length;
    const critical = anomalies.filter(a => a.severity === 'critical').length;
    const high = anomalies.filter(a => a.severity === 'high').length;
    const totalFinancialImpact = anomalies
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + a.impact.financial, 0);

    return { total, active, critical, high, totalFinancialImpact };
  };

  const stats = getStats();

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: Anomaly['type']) => (
        <Space>
          {getTypeIcon(type)}
          <span style={{ textTransform: 'capitalize' }}>
            {type.replace('_', ' ')}
          </span>
        </Space>
      )
    },
    {
      title: 'Sévérité',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: Anomaly['severity']) => (
        <Tag 
          color={getSeverityColor(severity)} 
          icon={getSeverityIcon(severity)}
        >
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span style={{ fontWeight: 500 }}>{title}</span>
      )
    },
    {
      title: 'Impact',
      key: 'impact',
      render: (record: Anomaly) => (
        <Space direction="vertical" size="small">
          {record.impact.financial > 0 && (
            <span style={{ fontSize: '12px' }}>
              💰 {formatCurrency(record.impact.financial)}
            </span>
          )}
          {record.impact.timeline > 0 && (
            <span style={{ fontSize: '12px' }}>
              📅 +{record.impact.timeline} jours
            </span>
          )}
          {record.impact.quality > 0 && (
            <span style={{ fontSize: '12px' }}>
              🎯 -{record.impact.quality}% qualité
            </span>
          )}
        </Space>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: Anomaly['status']) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' && 'Actif'}
          {status === 'acknowledged' && 'Pris en compte'}
          {status === 'resolved' && 'Résolu'}
          {status === 'ignored' && 'Ignoré'}
        </Tag>
      )
    },
    {
      title: 'Détecté',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (date: Date) => (
        <span style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleString('fr-FR')}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Anomaly) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedAnomaly(record);
            setDetailsVisible(true);
          }}
        >
          Détails
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Statistiques globales */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Anomalies Totales"
              value={stats.total}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Anomalies Actives"
              value={stats.active}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.active > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critiques + Hautes"
              value={stats.critical + stats.high}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.critical + stats.high > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Impact Financier"
              value={stats.totalFinancialImpact}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: stats.totalFinancialImpact > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alertes critiques */}
      {stats.active > 0 && (
        <Alert
          message={`${stats.active} anomalie(s) active(s) détectée(s)`}
          description="Des anomalies nécessitent votre attention immédiate."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={runAnalysis} loading={loading}>
              Réanalyser
            </Button>
          }
        />
      )}

      {/* Tableau des anomalies */}
      <Card
        title="Détection d'Anomalies IA"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={runAnalysis}
              loading={loading}
            >
              Lancer l'analyse
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={anomalies}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} anomalies`
          }}
          rowClassName={(record) => {
            if (record.severity === 'critical') return 'anomaly-critical';
            if (record.severity === 'high') return 'anomaly-high';
            return '';
          }}
        />
      </Card>

      {/* Modal de détails */}
      <Modal
        title={`Détails de l'anomalie`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={700}
      >
        {selectedAnomaly && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Valeur Attendue"
                    value={selectedAnomaly.expectedValue}
                    formatter={(value) => 
                      selectedAnomaly.type.includes('budget') || selectedAnomaly.type.includes('cost') 
                        ? formatCurrency(Number(value))
                        : String(value)
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Valeur Réelle"
                    value={selectedAnomaly.actualValue}
                    formatter={(value) => 
                      selectedAnomaly.type.includes('budget') || selectedAnomaly.type.includes('cost')
                        ? formatCurrency(Number(value))
                        : String(value)
                    }
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Description">
              <p>{selectedAnomaly.description}</p>
            </Card>

            <Card size="small" title="Impact Estimé">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Financier"
                    value={selectedAnomaly.impact.financial}
                    formatter={(value) => formatCurrency(Number(value))}
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Planning"
                    value={selectedAnomaly.impact.timeline}
                    suffix="jours"
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Qualité"
                    value={selectedAnomaly.impact.quality}
                    suffix="%"
                    prefix={<SafetyCertificateOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Recommandations">
              <List
                size="small"
                dataSource={selectedAnomaly.recommendations}
                renderItem={(item, index) => (
                  <List.Item>
                    <span style={{ marginRight: 8, color: '#1890ff' }}>
                      {index + 1}.
                    </span>
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            <Space>
              <Button type="primary">
                Marquer comme pris en compte
              </Button>
              <Button>
                Marquer comme résolu
              </Button>
              <Button danger>
                Ignorer
              </Button>
            </Space>
          </Space>
        )}
      </Modal>

      <style>{`
        .anomaly-critical {
          background-color: #fff2f0 !important;
        }
        .anomaly-high {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default AnomalyDetectionDashboard;

import React, { useState, useCallback, useMemo } from 'react';
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
import { useProjects } from '../../hooks/useProjects';
import { useCurrency } from '../../contexts/CurrencyContext';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';

const AnomalyDetectionDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const { projects } = useProjects();
  const { currency } = useCurrency();
  
  const formatAmount = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XOF'
    }).format(amount);
  }, [currency]);

  const generateRealAnomalies = useCallback((): Anomaly[] => {
    const realAnomalies: Anomaly[] = [];
    
    projects.forEach(project => {
      const now = Date.now();
      
      // Anomalie budget si dépassement
      if (project.spent > project.budget * 0.8) {
        const deviationPercentage = ((project.spent - project.budget) / project.budget) * 100;
        realAnomalies.push({
          id: `budget_${project.id}`,
          type: 'budget_overrun',
          severity: deviationPercentage > 10 ? 'high' : 'medium',
          projectId: project.id,
          title: `Dépassement budgétaire: ${deviationPercentage.toFixed(1)}%`,
          description: `Le projet "${project.name}" a dépassé son budget de ${formatAmount(project.spent - project.budget)}`,
          detectedAt: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
          expectedValue: project.budget,
          actualValue: project.spent,
          deviation: project.spent - project.budget,
          deviationPercentage,
          impact: {
            financial: project.spent - project.budget,
            timeline: Math.ceil(deviationPercentage / 10),
            quality: 0
          },
          recommendations: [
            'Réviser le budget prévisionnel',
            'Identifier les postes de dépassement',
            'Négocier avec les fournisseurs'
          ],
          status: 'active'
        });
      }

      // Anomalie planning si retard
      const projectEndDate = new Date(project.endDate);
      const today = new Date();
      if (projectEndDate < today && project.status !== 'completed') {
        const daysLate = Math.ceil((today.getTime() - projectEndDate.getTime()) / (1000 * 60 * 60 * 24));
        realAnomalies.push({
          id: `timeline_${project.id}`,
          type: 'timeline_delay',
          severity: daysLate > 7 ? 'high' : 'medium',
          projectId: project.id,
          title: `Retard planning: ${daysLate} jours`,
          description: `Le projet "${project.name}" accuse un retard de ${daysLate} jours`,
          detectedAt: new Date(now - Math.random() * 12 * 60 * 60 * 1000),
          expectedValue: 0,
          actualValue: daysLate,
          deviation: daysLate,
          deviationPercentage: (daysLate / 30) * 100,
          impact: {
            financial: daysLate * 10000,
            timeline: daysLate,
            quality: Math.min(daysLate / 2, 10)
          },
          recommendations: [
            'Réorganiser le planning',
            'Augmenter les effectifs',
            'Identifier les blocages'
          ],
          status: 'active'
        });
      }

      // Anomalie progression si trop lente
      if (project.progress < 50 && project.status === 'in_progress') {
        realAnomalies.push({
          id: `progress_${project.id}`,
          type: 'quality_issue',
          severity: 'medium',
          projectId: project.id,
          title: `Progression lente: ${project.progress}%`,
          description: `Le projet "${project.name}" progresse lentement (${project.progress}%)`,
          detectedAt: new Date(now - Math.random() * 6 * 60 * 60 * 1000),
          expectedValue: 70,
          actualValue: project.progress,
          deviation: 70 - project.progress,
          deviationPercentage: ((70 - project.progress) / 70) * 100,
          impact: {
            financial: 50000,
            timeline: 5,
            quality: 10
          },
          recommendations: [
            'Analyser les causes du retard',
            'Optimiser les processus',
            'Renforcer l\'équipe'
          ],
          status: 'active'
        });
      }
    });

    return realAnomalies;
  }, [projects, formatAmount]);

  const loadAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      // Générer des anomalies basées sur les vraies données des projets
      const realAnomalies = generateRealAnomalies();
      
      // Utiliser uniquement les anomalies réelles basées sur les données du projet
      const combinedAnomalies = [...realAnomalies];
      
      // Mettre à jour l'état avec les anomalies
      setAnomalies(combinedAnomalies);
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies:', error);
    } finally {
      setLoading(false);
    }
  }, [generateRealAnomalies]);

  // Fonction pour lancer l'analyse
  const runAnalysis = useCallback(() => {
    loadAnomalies();
  }, [loadAnomalies]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = anomalies.length;
    const active = anomalies.filter(a => a.status === 'active').length;
    const critical = anomalies.filter(a => a.severity === 'critical').length;
    const high = anomalies.filter(a => a.severity === 'high').length;
    const totalFinancialImpact = anomalies.reduce((sum, a) => sum + (a.impact?.financial || 0), 0);
    return { total, active, critical, high, totalFinancialImpact };
  }, [anomalies]);

  // Formater les montants
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XOF'
    }).format(amount);
  }, [currency]);

  // Colonnes du tableau
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          'budget_overrun': 'Dépassement budget',
          'timeline_delay': 'Retard planning',
          'quality_issue': 'Problème qualité',
          'resource_shortage': 'Manque ressources'
        };
        return typeLabels[type] || type;
      }
    },
    {
      title: 'Sévérité',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors: Record<string, string> = {
          'critical': 'red',
          'high': 'orange',
          'medium': 'gold',
          'low': 'green'
        };
        return <Tag color={colors[severity] || 'default'}>{severity.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Impact Financier',
      key: 'financial',
      render: (_: unknown, record: Anomaly) => formatCurrency(record.impact?.financial || 0)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Anomaly) => (
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
    <PageContainer>
      <SectionHeader
        title="Détection d'Anomalies"
        subtitle="Surveillance intelligente des projets"
        icon={<CloudOutlined />}
      />

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card className="glass-card">
            <Statistic
              title="Anomalies Totales"
              value={stats.total}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card">
            <Statistic
              title="Anomalies Actives"
              value={stats.active}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.active > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card">
            <Statistic
              title="Critiques + Hautes"
              value={stats.critical + stats.high}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.critical + stats.high > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-card">
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
          className="mb-4"
          action={
            <Button size="small" onClick={runAnalysis} loading={loading}>
              Réanalyser
            </Button>
          }
        />
      )}

      {/* Tableau des anomalies */}
      <Card
        className="glass-card"
        title="Anomalies détectées"
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
          <Space direction="vertical" className="w-full">
            <Card size="small" className="glass-card">
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

            <Card size="small" title="Description" className="glass-card">
              <p>{selectedAnomaly.description}</p>
            </Card>

            <Card size="small" title="Impact Estimé" className="glass-card">
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

            <Card size="small" title="Recommandations" className="glass-card">
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
    </PageContainer>
  );
};

export default AnomalyDetectionDashboard;

// Widget de monitoring du système IA hybride
import React, { useState, useEffect } from 'react';
import { Card, Progress, Badge, Statistic, Row, Col, Alert, Button, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { HybridAIManager } from '../../services/ai/hybridAIAdapter';

interface AIServiceStatus {
  groq: boolean;
  claude: boolean;
  googleVision: boolean;
}

interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageResponseTime: number;
  providerUsage: Record<string, {
    requests: number;
    cost: number;
    averageTime: number;
    successRate: number;
  }>;
}

export const HybridAIMonitoringWidget: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<AIServiceStatus>({
    groq: false,
    claude: false,
    googleVision: false
  });
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    providerUsage: {}
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadHealthStatus();
    const interval = setInterval(loadHealthStatus, 30000); // Refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      setLoading(true);
      const healthData = await HybridAIManager.healthCheck();
      
      setServiceStatus({
        groq: healthData.services.groq || false,
        claude: healthData.services.claude || false,
        googleVision: healthData.services.googleVision || false
      });
      
      setMetrics(healthData.metrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement statut IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  const getServiceStatusBadge = (status: boolean) => {
    return (
      <Badge 
        status={status ? 'success' : 'error'} 
        text={status ? 'Opérationnel' : 'Indisponible'} 
      />
    );
  };

  const getOverallStatus = () => {
    const activeServices = Object.values(serviceStatus).filter(Boolean).length;
    const totalServices = Object.keys(serviceStatus).length;
    
    if (activeServices === totalServices) {
      return { status: 'success', text: 'Tous les services opérationnels' };
    } else if (activeServices > 0) {
      return { status: 'warning', text: `${activeServices}/${totalServices} services opérationnels` };
    } else {
      return { status: 'error', text: 'Aucun service disponible' };
    }
  };

  const calculateSuccessRate = () => {
    if (metrics.totalRequests === 0) return 0;
    return Math.round((metrics.successfulRequests / metrics.totalRequests) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const resetMetrics = async () => {
    try {
      HybridAIManager.resetMetrics();
      await loadHealthStatus();
    } catch (error) {
      console.error('Erreur reset métriques:', error);
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <ApiOutlined style={{ marginRight: 8 }} />
            Monitoring IA Hybride
          </span>
          <div>
            <Tooltip title="Actualiser">
              <Button 
                icon={<ReloadOutlined />} 
                size="small" 
                onClick={loadHealthStatus}
                loading={loading}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
            <Tooltip title="Réinitialiser les métriques">
              <Button 
                icon={<BarChartOutlined />} 
                size="small" 
                onClick={resetMetrics}
              />
            </Tooltip>
          </div>
        </div>
      }
      className="hybrid-ai-monitoring-widget"
      loading={loading}
    >
      {/* Statut général */}
      <Alert
        message="Statut du système IA"
        description={overallStatus.text}
        type={overallStatus.status as 'success' | 'warning' | 'error'}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Statut des services */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Services IA</h4>
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getServiceStatusIcon(serviceStatus.groq)}
              <span style={{ marginLeft: 8, fontWeight: 500 }}>Groq</span>
            </div>
            {getServiceStatusBadge(serviceStatus.groq)}
          </Col>
          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getServiceStatusIcon(serviceStatus.claude)}
              <span style={{ marginLeft: 8, fontWeight: 500 }}>Claude</span>
            </div>
            {getServiceStatusBadge(serviceStatus.claude)}
          </Col>
          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getServiceStatusIcon(serviceStatus.googleVision)}
              <span style={{ marginLeft: 8, fontWeight: 500 }}>Vision</span>
            </div>
            {getServiceStatusBadge(serviceStatus.googleVision)}
          </Col>
        </Row>
      </div>

      {/* Métriques principales */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Statistic
            title="Requêtes totales"
            value={metrics.totalRequests}
            prefix={<ApiOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Taux de succès"
            value={calculateSuccessRate()}
            suffix="%"
            valueStyle={{ 
              color: calculateSuccessRate() > 90 ? '#3f8600' : 
                     calculateSuccessRate() > 70 ? '#cf1322' : '#d46b08' 
            }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Coût total"
            value={metrics.totalCost}
            formatter={(value) => formatCurrency(Number(value))}
            prefix={<DollarOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Temps moyen"
            value={formatTime(metrics.averageResponseTime)}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      {/* Utilisation par provider */}
      {Object.keys(metrics.providerUsage).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Utilisation par Provider</h4>
          {Object.entries(metrics.providerUsage).map(([provider, usage]) => (
            <div key={provider} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {provider}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {usage.requests} requêtes • {formatCurrency(usage.cost)} • {Math.round(usage.successRate * 100)}%
                </span>
              </div>
              <Progress
                percent={Math.round(usage.successRate * 100)}
                size="small"
                status={usage.successRate > 0.9 ? 'success' : usage.successRate > 0.7 ? 'normal' : 'exception'}
                showInfo={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dernière mise à jour */}
      <div style={{ 
        textAlign: 'center', 
        color: '#666', 
        fontSize: '12px',
        borderTop: '1px solid #f0f0f0',
        paddingTop: 8
      }}>
        Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
      </div>
    </Card>
  );
};

export default HybridAIMonitoringWidget;

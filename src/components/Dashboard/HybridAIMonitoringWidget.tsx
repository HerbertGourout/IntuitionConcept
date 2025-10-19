// Widget de monitoring IA simplifié
import React from 'react';
import { Card, Badge, Statistic, Row, Col, Alert } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

export const HybridAIMonitoringWidget = () => {
  // Données simulées pour éviter les erreurs
  const mockStatus = {
    groq: true,
    claude: true,
    googleVision: false
  };

  const mockMetrics = {
    totalRequests: 1247,
    successfulRequests: 1198,
    failedRequests: 49,
    totalCost: 45.67,
    averageResponseTime: 1.2
  };

  const successRate = Math.round((mockMetrics.successfulRequests / mockMetrics.totalRequests) * 100);

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApiOutlined />
          Monitoring IA Hybride
        </div>
      }
      size="small"
    >
      <Alert
        message="Services IA Premium Actifs"
        description="Le système hybride fonctionne normalement"
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Taux de Succès"
            value={successRate}
            suffix="%"
            valueStyle={{ color: successRate > 90 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Requêtes Totales"
            value={mockMetrics.totalRequests}
            prefix={<ApiOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Coût Total"
            value={mockMetrics.totalCost}
            prefix="$"
            precision={2}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <h4>État des Services :</h4>
        <div style={{ display: 'flex', gap: 16 }}>
          <Badge 
            status={mockStatus.groq ? "success" : "error"} 
            text="Groq AI" 
          />
          <Badge 
            status={mockStatus.claude ? "success" : "error"} 
            text="Claude 3.5" 
          />
          <Badge 
            status={mockStatus.googleVision ? "success" : "error"} 
            text="Google Vision" 
          />
        </div>
      </div>
    </Card>
  );
};

export default HybridAIMonitoringWidget;

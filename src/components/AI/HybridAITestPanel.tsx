// Panel de test IA simplifié
import React, { useState } from 'react';
import { Card, Button, Select, Input, Alert, Typography, Space, Tag } from 'antd';
import { 
  SendOutlined, 
  ExperimentOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface TestResult {
  success: boolean;
  data?: string;
  error?: string;
  provider?: string;
  cost?: number;
  responseTime?: number;
}

export const HybridAITestPanel: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string>('quote');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [testInput, setTestInput] = useState('');

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    // Simulation d'un test IA
    setTimeout(() => {
      const mockResult: TestResult = {
        success: true,
        data: `Test ${activeTest} exécuté avec succès`,
        provider: 'Premium AI Stack',
        cost: 0.05,
        responseTime: 1.2
      };
      
      setResult(mockResult);
      setLoading(false);
    }, 2000);
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExperimentOutlined />
          Panel de Test IA Hybride
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Type de Test :</Text>
          <Select
            value={activeTest}
            onChange={setActiveTest}
            style={{ width: 200, marginLeft: 8 }}
          >
            <Option value="quote">Génération de Devis</Option>
            <Option value="ocr">OCR Intelligent</Option>
            <Option value="anomaly">Détection d'Anomalies</Option>
            <Option value="copilot">Assistant IA</Option>
          </Select>
        </div>

        <div>
          <Text strong>Données de Test :</Text>
          <TextArea
            rows={4}
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Entrez vos données de test ici..."
            style={{ marginTop: 8 }}
          />
        </div>

        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={runTest}
          size="large"
        >
          Lancer le Test
        </Button>

        {result && (
          <Alert
            message={
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <RobotOutlined />
                  <Text strong>Résultat du Test</Text>
                  <Tag color={result.success ? 'green' : 'red'}>
                    {result.success ? 'Succès' : 'Échec'}
                  </Tag>
                </div>
                <div>
                  <Text>{result.data || result.error}</Text>
                </div>
                {result.provider && (
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    Fournisseur: {result.provider} | 
                    Coût: ${result.cost} | 
                    Temps: {result.responseTime}s
                  </div>
                )}
              </div>
            }
            type={result.success ? 'success' : 'error'}
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default HybridAITestPanel;

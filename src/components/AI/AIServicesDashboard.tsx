import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Card, Badge, Button, Space, Typography, Alert, Spin, Divider } from 'antd';
import { 
  RobotOutlined, 
  EyeOutlined, 
  FileTextOutlined, 
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { aiActivationService, AIServiceStatus } from '../../services/ai/aiActivationService';

const { Title, Text, Paragraph } = Typography;

const AIServicesDashboard: FC = () => {
  const [status, setStatus] = useState<AIServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadAIStatus();
  }, []);

  const loadAIStatus = async () => {
    setLoading(true);
    try {
      const aiStatus = await aiActivationService.activateAIServices();
      setStatus(aiStatus);
    } catch (error) {
      console.error('Erreur chargement statut IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const testService = async (serviceName: 'ocr' | 'quote' | 'copilot') => {
    setTesting(serviceName);
    try {
      const result = await aiActivationService.testAIService(serviceName);
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Erreur test: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (serviceStatus: 'active' | 'inactive' | 'error') => {
    switch (serviceStatus) {
      case 'active':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusBadge = (serviceStatus: 'active' | 'inactive' | 'error') => {
    switch (serviceStatus) {
      case 'active':
        return <Badge status="success" text="Actif" />;
      case 'error':
        return <Badge status="error" text="Erreur" />;
      default:
        return <Badge status="warning" text="Inactif" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spin size="large" />
        <Text className="ml-4">Vérification des services IA...</Text>
      </div>
    );
  }

  if (!status) {
    return (
      <Alert
        message="Erreur"
        description="Impossible de charger le statut des services IA"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <RobotOutlined className="mr-3" />
          Services Système automatisé
        </Title>
        <Paragraph>
          Gestion et monitoring des fonctionnalités IA d'IntuitionConcept
        </Paragraph>
      </div>

      {}
        <Card>
          <div className="text-center mb-4">
            <EyeOutlined className="text-4xl text-blue-500 mb-2" />
            <Title level={4}>OCR Enhancement</Title>
            <Text type="secondary">Amélioration OCR avec IA</Text>
          </div>
          
          <Divider />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text>Statut:</Text>
              {getStatusBadge(status.ocrEnhancement.status)}
            </div>
            
            <div className="flex items-start">
              <Text className="mr-2">Message:</Text>
              <Text className="flex-1 text-sm">
                {getStatusIcon(status.ocrEnhancement.status)}
                <span className="ml-2">{status.ocrEnhancement.message}</span>
              </Text>
            </div>
            
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => testService('ocr')}
              loading={testing === 'ocr'}
              disabled={!status.ocrEnhancement.enabled}
              block
            >
              Tester OCR IA
            </Button>
          </div>
        </Card>

        {}
      <Card className="mt-6">
        <Title level={4}>Comment utiliser les services IA</Title>
        <div className="space-y-3">
          <div>
            <Text strong>📄 OCR Enhancement:</Text>
            <Text className="ml-2">Utilisez le scanner de documents pour extraire automatiquement les données des factures avec amélioration IA.</Text>
          </div>
          <div>
            <Text strong>📋 Génération de devis:</Text>
            <Text className="ml-2">Créez des devis intelligents en décrivant votre projet. Génération en coursra automatiquement les phases et articles.</Text>
          </div>
          <div>
            <Text strong>💬 Assistant:</Text>
            <Text className="ml-2">Posez des questions sur vos projets, budgets et planning. L'assistant vous aidera avec des conseils personnalisés.</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIServicesDashboard;

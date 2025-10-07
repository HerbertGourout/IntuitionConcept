import React, { useState, useEffect } from 'react';
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

const AIServicesDashboard: React.FC = () => {
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
          Services Intelligence Artificielle
        </Title>
        <Paragraph>
          Gestion et monitoring des fonctionnalités IA d'IntuitionConcept
        </Paragraph>
      </div>

      {/* Configuration API */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ApiOutlined className="text-2xl mr-3" />
            <div>
              <Title level={4} className="mb-1">Configuration API</Title>
              <Text type="secondary">
                Fournisseur: {status.apiKey.provider.toUpperCase()}
              </Text>
            </div>
          </div>
          <div>
            {status.apiKey.configured ? (
              <Badge status="success" text="Clé API configurée" />
            ) : (
              <Badge status="error" text="Clé API manquante" />
            )}
          </div>
        </div>
        
        {!status.apiKey.configured && (
          <Alert
            className="mt-4"
            message="Configuration requise"
            description="Ajoutez votre clé API OpenAI dans les variables d'environnement (VITE_OPENAI_API_KEY) pour activer les services IA."
            type="warning"
            showIcon
          />
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OCR Enhancement */}
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

        {/* Quote Generation */}
        <Card>
          <div className="text-center mb-4">
            <FileTextOutlined className="text-4xl text-green-500 mb-2" />
            <Title level={4}>Génération Devis</Title>
            <Text type="secondary">Création automatique de devis</Text>
          </div>
          
          <Divider />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text>Statut:</Text>
              {getStatusBadge(status.quoteGeneration.status)}
            </div>
            
            <div className="flex items-start">
              <Text className="mr-2">Message:</Text>
              <Text className="flex-1 text-sm">
                {getStatusIcon(status.quoteGeneration.status)}
                <span className="ml-2">{status.quoteGeneration.message}</span>
              </Text>
            </div>
            
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => testService('quote')}
              loading={testing === 'quote'}
              disabled={!status.quoteGeneration.enabled}
              block
            >
              Tester Génération IA
            </Button>
          </div>
        </Card>

        {/* Copilot Assistant */}
        <Card>
          <div className="text-center mb-4">
            <MessageOutlined className="text-4xl text-purple-500 mb-2" />
            <Title level={4}>Assistant IA</Title>
            <Text type="secondary">Copilot conversationnel</Text>
          </div>
          
          <Divider />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text>Statut:</Text>
              {getStatusBadge(status.copilotAssistant.status)}
            </div>
            
            <div className="flex items-start">
              <Text className="mr-2">Message:</Text>
              <Text className="flex-1 text-sm">
                {getStatusIcon(status.copilotAssistant.status)}
                <span className="ml-2">{status.copilotAssistant.message}</span>
              </Text>
            </div>
            
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => testService('copilot')}
              loading={testing === 'copilot'}
              disabled={!status.copilotAssistant.enabled}
              block
            >
              Tester Assistant IA
            </Button>
          </div>
        </Card>
      </div>

      {/* Actions globales */}
      <Card className="mt-6">
        <Title level={4}>Actions</Title>
        <Space>
          <Button 
            icon={<RobotOutlined />}
            onClick={loadAIStatus}
            loading={loading}
          >
            Actualiser statut
          </Button>
          
          {status.apiKey.configured && (
            <Button 
              type="primary"
              onClick={() => {
                alert('🤖 Tous les services IA sont prêts à être utilisés dans l\'application !');
              }}
            >
              Services IA prêts
            </Button>
          )}
        </Space>
      </Card>

      {/* Informations d'utilisation */}
      <Card className="mt-6">
        <Title level={4}>Comment utiliser les services IA</Title>
        <div className="space-y-3">
          <div>
            <Text strong>📄 OCR Enhancement:</Text>
            <Text className="ml-2">Utilisez le scanner de documents pour extraire automatiquement les données des factures avec amélioration IA.</Text>
          </div>
          <div>
            <Text strong>📋 Génération de devis:</Text>
            <Text className="ml-2">Créez des devis intelligents en décrivant votre projet. L'IA génèrera automatiquement les phases et articles.</Text>
          </div>
          <div>
            <Text strong>💬 Assistant IA:</Text>
            <Text className="ml-2">Posez des questions sur vos projets, budgets et planning. L'assistant vous aidera avec des conseils personnalisés.</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIServicesDashboard;

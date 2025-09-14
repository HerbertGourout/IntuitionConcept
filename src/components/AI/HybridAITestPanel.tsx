// Panel de test pour le système IA hybride
import React, { useState } from 'react';
import { Card, Button, Select, Input, Upload, Alert, Spin, Divider, Typography, Space, Tag } from 'antd';
import { 
  SendOutlined, 
  UploadOutlined, 
  ExperimentOutlined,
  RobotOutlined,
  FileTextOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { QuoteGeneratorAdapter, IntelligentOCRAdapter, AICopilotAdapter, AnomalyDetectionAdapter } from '../../services/ai/hybridAIAdapter';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  provider?: string;
  cost?: number;
  timestamp: Date;
}

export const HybridAITestPanel: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string>('quote');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // États pour les différents tests
  const [quoteData, setQuoteData] = useState({
    type: 'renovation',
    budget: 500000,
    location: 'Dakar, Sénégal'
  });
  
  const [chatMessage, setChatMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'invoice' | 'contract' | 'plan'>('invoice');

  const testQuoteGeneration = async () => {
    setLoading(true);
    try {
      const projectData = {
        type: quoteData.type,
        budget: quoteData.budget,
        phases: [
          {
            name: 'Préparation',
            description: 'Phase de préparation du chantier',
            estimatedCost: quoteData.budget * 0.2
          },
          {
            name: 'Gros œuvre',
            description: 'Travaux de structure',
            estimatedCost: quoteData.budget * 0.5
          },
          {
            name: 'Finitions',
            description: 'Travaux de finition',
            estimatedCost: quoteData.budget * 0.3
          }
        ],
        location: quoteData.location,
        timeline: '3 mois'
      };

      const response = await QuoteGeneratorAdapter.generateQuote(projectData);
      setResult({
        ...response,
        timestamp: new Date()
      });
    } catch (error) {
      setResult({
        success: false,
        error: `Erreur test génération devis: ${error}`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const testOCRProcessing = async () => {
    if (!uploadedFile) {
      setResult({
        success: false,
        error: 'Veuillez sélectionner un fichier',
        timestamp: new Date()
      });
      return;
    }

    setLoading(true);
    try {
      const response = await IntelligentOCRAdapter.processDocument(uploadedFile, documentType);
      setResult({
        ...response,
        timestamp: new Date()
      });
    } catch (error) {
      setResult({
        success: false,
        error: `Erreur test OCR: ${error}`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const testChatAssistant = async () => {
    if (!chatMessage.trim()) {
      setResult({
        success: false,
        error: 'Veuillez saisir un message',
        timestamp: new Date()
      });
      return;
    }

    setLoading(true);
    try {
      const response = await AICopilotAdapter.chat(chatMessage, {
        projectId: 'test-project',
        userId: 'test-user'
      });
      setResult({
        ...response,
        timestamp: new Date()
      });
    } catch (error) {
      setResult({
        success: false,
        error: `Erreur test chat: ${error}`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const testAnomalyDetection = async () => {
    setLoading(true);
    try {
      const testProjectData = {
        budget: 1000000,
        expenses: [
          { amount: 50000, category: 'Matériaux', date: '2024-01-15', description: 'Ciment' },
          { amount: 800000, category: 'Main d\'œuvre', date: '2024-01-20', description: 'Équipe construction' },
          { amount: 200000, category: 'Équipement', date: '2024-01-25', description: 'Location grue' }
        ],
        timeline: {
          startDate: '2024-01-01',
          endDate: '2024-06-01',
          currentPhase: 'Gros œuvre'
        }
      };

      const response = await AnomalyDetectionAdapter.detectBudgetAnomalies(testProjectData);
      setResult({
        success: true,
        data: response,
        provider: response.provider,
        cost: response.cost,
        timestamp: new Date()
      });
    } catch (error) {
      setResult({
        success: false,
        error: `Erreur test détection anomalies: ${error}`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const runTest = () => {
    switch (activeTest) {
      case 'quote':
        testQuoteGeneration();
        break;
      case 'ocr':
        testOCRProcessing();
        break;
      case 'chat':
        testChatAssistant();
        break;
      case 'anomaly':
        testAnomalyDetection();
        break;
    }
  };

  const formatResult = (result: TestResult) => {
    if (!result.success) {
      return (
        <Alert
          message="Échec du test"
          description={result.error}
          type="error"
          showIcon
        />
      );
    }

    return (
      <div>
        <Alert
          message="Test réussi"
          description={
            <div>
              <div>Provider: <Tag color="blue">{result.provider}</Tag></div>
              {result.cost && <div>Coût: <Tag color="green">{result.cost} FCFA</Tag></div>}
              <div>Timestamp: {result.timestamp.toLocaleString('fr-FR')}</div>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Card title="Résultat détaillé" size="small">
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 4, 
            fontSize: 12,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </Card>
      </div>
    );
  };

  return (
    <Card title={
      <span>
        <ExperimentOutlined style={{ marginRight: 8 }} />
        Panel de Test IA Hybride
      </span>
    }>
      {/* Sélecteur de test */}
      <div style={{ marginBottom: 20 }}>
        <Text strong>Type de test:</Text>
        <Select
          value={activeTest}
          onChange={setActiveTest}
          style={{ width: '100%', marginTop: 8 }}
        >
          <Option value="quote">
            <FileTextOutlined /> Génération de devis
          </Option>
          <Option value="ocr">
            <UploadOutlined /> Traitement OCR
          </Option>
          <Option value="chat">
            <RobotOutlined /> Assistant conversationnel
          </Option>
          <Option value="anomaly">
            <DollarOutlined /> Détection d'anomalies
          </Option>
        </Select>
      </div>

      <Divider />

      {/* Interface de test selon le type */}
      {activeTest === 'quote' && (
        <div>
          <Title level={5}>Test Génération de Devis</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Type de projet:</Text>
              <Select
                value={quoteData.type}
                onChange={(value) => setQuoteData({ ...quoteData, type: value })}
                style={{ width: '100%', marginTop: 4 }}
              >
                <Option value="renovation">Rénovation</Option>
                <Option value="construction">Construction neuve</Option>
                <Option value="extension">Extension</Option>
              </Select>
            </div>
            <div>
              <Text>Budget (FCFA):</Text>
              <Input
                type="number"
                value={quoteData.budget}
                onChange={(e) => setQuoteData({ ...quoteData, budget: Number(e.target.value) })}
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text>Localisation:</Text>
              <Input
                value={quoteData.location}
                onChange={(e) => setQuoteData({ ...quoteData, location: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>
        </div>
      )}

      {activeTest === 'ocr' && (
        <div>
          <Title level={5}>Test Traitement OCR</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Type de document:</Text>
              <Select
                value={documentType}
                onChange={setDocumentType}
                style={{ width: '100%', marginTop: 4 }}
              >
                <Option value="invoice">Facture</Option>
                <Option value="contract">Contrat</Option>
                <Option value="plan">Plan d'architecture</Option>
              </Select>
            </div>
            <div>
              <Text>Fichier:</Text>
              <Upload
                beforeUpload={(file) => {
                  setUploadedFile(file);
                  return false;
                }}
                maxCount={1}
                accept="image/*,.pdf"
                style={{ marginTop: 4 }}
              >
                <Button icon={<UploadOutlined />}>
                  Sélectionner un fichier
                </Button>
              </Upload>
              {uploadedFile && (
                <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                  Fichier sélectionné: {uploadedFile.name}
                </Text>
              )}
            </div>
          </Space>
        </div>
      )}

      {activeTest === 'chat' && (
        <div>
          <Title level={5}>Test Assistant Conversationnel</Title>
          <div>
            <Text>Message:</Text>
            <TextArea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Posez une question à l'assistant IA..."
              rows={3}
              style={{ marginTop: 4 }}
            />
          </div>
        </div>
      )}

      {activeTest === 'anomaly' && (
        <div>
          <Title level={5}>Test Détection d'Anomalies</Title>
          <Alert
            message="Test automatique"
            description="Ce test utilise des données de projet simulées pour détecter les anomalies budgétaires."
            type="info"
            showIcon
          />
        </div>
      )}

      <Divider />

      {/* Bouton d'exécution */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={runTest}
          loading={loading}
          size="large"
        >
          {loading ? 'Test en cours...' : 'Lancer le test'}
        </Button>
      </div>

      {/* Résultats */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Traitement en cours avec le système IA hybride...</Text>
          </div>
        </div>
      )}

      {result && !loading && (
        <div>
          <Divider />
          <Title level={5}>Résultat du test</Title>
          {formatResult(result)}
        </div>
      )}
    </Card>
  );
};

export default HybridAITestPanel;

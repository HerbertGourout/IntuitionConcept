import React, { useState, useCallback } from 'react';
import { Card, Upload, Button, Progress, Alert, Descriptions, Tag, Space, Row, Col, Statistic, List, Modal, Spin } from 'antd';
import { 
  InboxOutlined, 
  FileImageOutlined, 
  ExperimentOutlined, 
  DollarOutlined,
  HomeOutlined,
  BuildOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { architecturalPlanAnalyzer, ArchitecturalPlanAnalysis } from '../../services/ai/architecturalPlanAnalyzer';
import { GeneratedQuote } from '../../services/ai/quoteGenerator';
import { useCurrency } from '../../contexts/CurrencyContext';

const { Dragger } = Upload;

interface AnalysisStep {
  id: string;
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ArchitecturalPlanAnalyzer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'upload', title: 'Téléchargement du plan', status: 'waiting', progress: 0 },
    { id: 'ocr', title: 'Extraction OCR intelligente', status: 'waiting', progress: 0 },
    { id: 'analysis', title: 'Analyse architecturale IA', status: 'waiting', progress: 0 },
    { id: 'quote', title: 'Génération de devis', status: 'waiting', progress: 0 }
  ]);
  const [planAnalysis, setPlanAnalysis] = useState<ArchitecturalPlanAnalysis | null>(null);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const { currency } = useCurrency();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const updateStepStatus = useCallback((stepId: string, status: AnalysisStep['status'], progress: number = 0) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    updateStepStatus('upload', 'completed', 100);
    return false; // Prevent default upload
  }, [updateStepStatus]);

  const startAnalysis = useCallback(async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setPlanAnalysis(null);
    setGeneratedQuote(null);

    try {
      // Étape 1: OCR
      updateStepStatus('ocr', 'processing', 30);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      updateStepStatus('ocr', 'processing', 70);
      
      // Étape 2: Analyse
      updateStepStatus('ocr', 'completed', 100);
      updateStepStatus('analysis', 'processing', 20);
      
      const analysis = await architecturalPlanAnalyzer.analyzePlan(uploadedFile);
      setPlanAnalysis(analysis);
      
      updateStepStatus('analysis', 'completed', 100);
      
      // Étape 3: Génération de devis
      updateStepStatus('quote', 'processing', 30);
      
      const quote = await architecturalPlanAnalyzer.generateQuoteFromPlan(analysis, {
        budget: { min: 5000000, max: 15000000, currency: 'XOF' },
        location: 'Dakar, Sénégal'
      });
      
      setGeneratedQuote(quote);
      updateStepStatus('quote', 'completed', 100);
      
    } catch (error) {
      console.error('Erreur analyse plan:', error);
      const currentStep = analysisSteps.find(s => s.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFile, updateStepStatus, analysisSteps]);

  const resetAnalysis = useCallback(() => {
    setUploadedFile(null);
    setPlanAnalysis(null);
    setGeneratedQuote(null);
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
  }, []);

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'floor_plan': 'Plan d\'étage',
      'elevation': 'Élévation',
      'section': 'Coupe',
      'site_plan': 'Plan de masse',
      'detail': 'Détail',
      'unknown': 'Type inconnu'
    };
    return labels[type] || type;
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      'simple': 'green',
      'moderate': 'blue',
      'complex': 'orange',
      'very_complex': 'red'
    };
    return colors[complexity] || 'default';
  };

  const getComplexityLabel = (complexity: string) => {
    const labels: Record<string, string> = {
      'simple': 'Simple',
      'moderate': 'Modéré',
      'complex': 'Complexe',
      'very_complex': 'Très complexe'
    };
    return labels[complexity] || complexity;
  };

  const getStepIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <Spin size="small" />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analyseur de Plans Architecturaux IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Téléchargez vos plans d'architecture pour une analyse automatique et génération de devis
        </p>
      </div>

      {/* Zone de téléchargement */}
      <Card title="1. Télécharger le Plan" className="mb-6">
        <Dragger
          name="plan"
          multiple={false}
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isAnalyzing}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Cliquez ou glissez-déposez votre plan d'architecture ici
          </p>
          <p className="ant-upload-hint">
            Formats supportés: PDF, JPG, PNG, TIFF, BMP
          </p>
        </Dragger>
        
        {uploadedFile && (
          <Alert
            message="Fichier téléchargé"
            description={`${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)} KB)`}
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Progression de l'analyse */}
      {uploadedFile && (
        <Card title="2. Analyse en Cours" className="mb-6">
          <Space direction="vertical" style={{ width: '100%' }}>
            {analysisSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-4">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{step.title}</span>
                    <span className="text-sm text-gray-500">
                      {step.status === 'completed' ? '100%' : `${step.progress}%`}
                    </span>
                  </div>
                  <Progress 
                    percent={step.status === 'completed' ? 100 : step.progress}
                    status={step.status === 'error' ? 'exception' : undefined}
                    showInfo={false}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </Space>
          
          <div className="mt-6 text-center">
            <Space>
              <Button
                type="primary"
                icon={<ExperimentOutlined />}
                onClick={startAnalysis}
                loading={isAnalyzing}
                disabled={!uploadedFile || isAnalyzing}
                size="large"
              >
                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'Analyse'}
              </Button>
              <Button onClick={resetAnalysis} disabled={isAnalyzing}>
                Recommencer
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Résultats de l'analyse */}
      {planAnalysis && (
        <Card title="3. Résultats de l'Analyse" className="mb-6">
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Statistic
                title="Type de Plan"
                value={getPlanTypeLabel(planAnalysis.planType)}
                prefix={<FileImageOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Surface Totale"
                value={planAnalysis.extractedMeasurements.totalArea || 'N/A'}
                suffix="m²"
                prefix={<HomeOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Confiance"
                value={planAnalysis.confidence}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Col>
          </Row>

          <Row gutter={16} className="mb-6">
            <Col span={12}>
              <Card size="small" title="Complexité Estimée">
                <Tag color={getComplexityColor(planAnalysis.estimatedComplexity)}>
                  {getComplexityLabel(planAnalysis.estimatedComplexity)}
                </Tag>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Échelle Détectée">
                <span className="text-lg">
                  {planAnalysis.extractedMeasurements.scale || 'Non détectée'}
                </span>
              </Card>
            </Col>
          </Row>

          {/* Détails des pièces */}
          {planAnalysis.extractedMeasurements.rooms && planAnalysis.extractedMeasurements.rooms.length > 0 && (
            <Card size="small" title="Pièces Détectées" className="mb-4">
              <List
                dataSource={planAnalysis.extractedMeasurements.rooms}
                renderItem={(room) => (
                  <List.Item>
                    <List.Item.Meta
                      title={room.name}
                      description={
                        <Space>
                          {room.area && <span>{room.area} m²</span>}
                          {room.dimensions && <span>{room.dimensions}</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Éléments de construction */}
          <Descriptions title="Éléments de Construction" bordered size="small">
            <Descriptions.Item label="Murs" span={3}>
              {planAnalysis.constructionElements.walls?.length || 0} mur(s) détecté(s)
            </Descriptions.Item>
            <Descriptions.Item label="Ouvertures" span={3}>
              {planAnalysis.constructionElements.openings?.length || 0} ouverture(s) détectée(s)
            </Descriptions.Item>
            <Descriptions.Item label="Fondations">
              {planAnalysis.technicalSpecs.foundations || 'Non spécifié'}
            </Descriptions.Item>
            <Descriptions.Item label="Structure">
              {planAnalysis.technicalSpecs.structure || 'Non spécifié'}
            </Descriptions.Item>
            <Descriptions.Item label="Accessibilité">
              {planAnalysis.technicalSpecs.accessibility ? 'Oui' : 'Non'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Devis généré */}
      {generatedQuote && (
        <Card 
          title="4. Devis Généré" 
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => setShowQuoteModal(true)}
            >
              Voir le Devis Complet
            </Button>
          }
        >
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Coût Total Estimé"
                value={generatedQuote.totalCost}
                formatter={(value) => formatAmount(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Durée Estimée"
                value={generatedQuote.totalDuration}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Confiance du Devis"
                value={generatedQuote.confidence}
                suffix="%"
                prefix={<BuildOutlined />}
              />
            </Col>
          </Row>

          <Alert
            message="Devis basé sur l'analyse du plan"
            description="Ce devis est généré automatiquement à partir de l'analyse du plan. Une visite sur site est recommandée pour affiner l'estimation."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>
      )}

      {/* Modal du devis complet */}
      <Modal
        title="Devis Complet - Analyse de Plan"
        open={showQuoteModal}
        onCancel={() => setShowQuoteModal(false)}
        footer={null}
        width={800}
      >
        {generatedQuote && (
          <div className="space-y-4">
            <Descriptions title="Informations Générales" bordered>
              <Descriptions.Item label="Titre">
                {generatedQuote.title}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {generatedQuote.description}
              </Descriptions.Item>
              <Descriptions.Item label="Coût Total">
                {formatAmount(generatedQuote.totalCost)}
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="Phases du Projet">
              <List
                dataSource={generatedQuote.phases}
                renderItem={(phase) => (
                  <List.Item>
                    <List.Item.Meta
                      title={phase.name}
                      description={phase.description}
                    />
                    <div className="text-right">
                      <div className="font-semibold">{formatAmount(phase.totalCost)}</div>
                      <div className="text-sm text-gray-500">{phase.duration} jours</div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="Recommandations">
              <List
                dataSource={generatedQuote.recommendations}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    {item}
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ArchitecturalPlanAnalyzer;

import React, { useState, useRef } from 'react';
import { Card, Button, Upload, Space, Alert, Spin, Tabs, Tag, Row, Col, Statistic, List } from 'antd';
import { 
  CameraOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { intelligentOcrService, IntelligentOCRResult } from '../../services/ai/intelligentOcrService';
import { OCRStrategyResult } from '../../services/smartOcrStrategy';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';

const { TabPane } = Tabs;

const IntelligentOCRScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligentOCRResult | null>(null);
  const [rawText, setRawText] = useState('');
  const [strategyResult, setStrategyResult] = useState<OCRStrategyResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setResult(null);
    setRawText('');
    setStrategyResult(null);

    try {
      console.log('🎯 Démarrage analyse OCR...');
      
      // Traiter le document
      const ocrResult = await intelligentOcrService.processDocumentIntelligently(file);
      setResult(ocrResult);
      setRawText(ocrResult.text);
      
      // Créer un résultat de stratégie simulé pour l'affichage
      const mockStrategyResult: OCRStrategyResult = {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        provider: file.type === 'application/pdf' ? 'native_pdf' : 'tesseract',
        cost: 0,
        processingTime: 500,
        quality: 'high',
        recommendation: file.type === 'application/pdf' 
          ? '✅ PDF natif détecté - Extraction gratuite avec haute confiance'
          : '✅ Image traitée avec Tesseract gratuit'
      };
      
      setStrategyResult(mockStrategyResult);
      
      console.log('✅ Analyse terminée:', {
        provider: mockStrategyResult.provider,
        confidence: ocrResult.confidence,
        textLength: ocrResult.text.length
      });
    } catch (error) {
      console.error('Erreur OCR intelligent:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*,.pdf',
    beforeUpload: (file: File) => {
      handleFileUpload(file);
      return false;
    },
    showUploadList: false
  };

  const getDocumentTypeTag = (type: IntelligentOCRResult['documentType']) => {
    const config = {
      invoice: { color: 'blue', text: 'Facture', icon: <FileTextOutlined /> },
      quote: { color: 'green', text: 'Devis', icon: <FileTextOutlined /> },
      receipt: { color: 'orange', text: 'Reçu', icon: <FileTextOutlined /> },
      contract: { color: 'purple', text: 'Contrat', icon: <FileTextOutlined /> },
      delivery_note: { color: 'cyan', text: 'Bon de livraison', icon: <FileTextOutlined /> },
      unknown: { color: 'gray', text: 'Inconnu', icon: <ExclamationCircleOutlined /> }
    };
    
    const { color, text, icon } = config[type];
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <PageContainer className="space-y-6">
      {/* Header harmonisé */}
      <div className="glass-card p-6 rounded-xl">
        <SectionHeader
          icon={<CameraOutlined className="text-blue-600" />}
          title="Scanner OCR Intelligent IA"
          subtitle="Analyse et extraction automatiques des données de vos documents"
        />
      </div>

      {/* Interface de scan */}
      <Card className="glass-card">
        <Space direction="vertical" className="w-full text-center">
          <div>
            <Space size="large">
              <Upload {...uploadProps}>
                <Button type="primary" icon={<UploadOutlined />} size="large" loading={loading}>
                  Sélectionner un document
                </Button>
              </Upload>
              
              <Button icon={<CameraOutlined />} size="large" onClick={() => fileInputRef.current?.click()}>
                Prendre une photo
              </Button>
            </Space>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          <Alert
            message="OCR Intelligent avec IA"
            description="Scannez vos factures, devis et documents BTP. L'IA extrait automatiquement les données et propose des suggestions intelligentes."
            type="info"
            showIcon
          />
        </Space>
      </Card>

      {/* Résultats */}
      {loading && (
        <Card className="glass-card">
          <div className="text-center py-10">
            <Spin size="large" />
            <div className="mt-4">
              <p>Analyse intelligente en cours...</p>
              <p className="text-xs text-gray-600">OCR + Classification + Extraction IA + Suggestions</p>
            </div>
          </div>
        </Card>
      )}

      {/* Informations de stratégie OCR */}
      {strategyResult && (
        <Card className="glass-card" title="📊 Stratégie OCR Utilisée">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Provider"
                value={strategyResult.provider}
                prefix={strategyResult.provider === 'native_pdf' ? '🆓' : strategyResult.cost === 0 ? '🆓' : '💰'}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Confiance"
                value={strategyResult.confidence}
                suffix="%"
                valueStyle={{ color: strategyResult.confidence >= 85 ? '#3f8600' : '#cf1322' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Coût"
                value={strategyResult.cost}
                suffix="FCFA"
                precision={2}
                valueStyle={{ color: strategyResult.cost === 0 ? '#3f8600' : '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Temps"
                value={strategyResult.processingTime}
                suffix="ms"
              />
            </Col>
          </Row>
          
          {strategyResult.recommendation && (
            <Alert
              message="Recommandation"
              description={strategyResult.recommendation}
              type="info"
              showIcon
              className="mt-4"
            />
          )}
        </Card>
      )}

      {result && (
        <Card className="glass-card">
          <Tabs defaultActiveKey="overview">
            {/* Vue d'ensemble */}
            <TabPane 
              tab={
                <span>
                  <CheckCircleOutlined />
                  Vue d'ensemble
                </span>
              } 
              key="overview"
            >
              <Space direction="vertical" className="w-full">
                {/* En-tête */}
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small" className="glass-card">
                      <Statistic
                        title="Type de document"
                        value=""
                        formatter={() => getDocumentTypeTag(result.documentType)}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="glass-card">
                      <Statistic
                        title="Confiance OCR"
                        value={result.confidence}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: result.confidence > 80 ? '#52c41a' : result.confidence > 60 ? '#faad14' : '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="glass-card">
                      <Statistic
                        title="Montant total"
                        value={result.total || 0}
                        formatter={(value) => formatCurrency(Number(value))}
                        prefix={<DollarOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="glass-card">
                      <Statistic
                        title="Éléments extraits"
                        value={Object.keys(result.structuredData).length}
                        suffix="sections"
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Données extraites */}
                <Row gutter={16}>
                  {result.structuredData.supplier && (
                    <Col span={12}>
                      <Card size="small" title={<><UserOutlined /> Fournisseur</>} className="glass-card">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {typeof result.structuredData.supplier === 'string' ? (
                            <div><strong>{result.structuredData.supplier}</strong></div>
                          ) : (
                            <>
                              {result.structuredData.supplier.name && (
                                <div><strong>{result.structuredData.supplier.name}</strong></div>
                              )}
                              {result.structuredData.supplier.address && (
                                <div className="text-xs text-gray-600">{result.structuredData.supplier.address}</div>
                              )}
                              {result.structuredData.supplier.phone && (
                                <div className="text-xs text-gray-600">📞 {result.structuredData.supplier.phone}</div>
                              )}
                              {result.structuredData.supplier.email && (
                                <div className="text-xs text-gray-600">✉️ {result.structuredData.supplier.email}</div>
                              )}
                            </>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}

                  {result.structuredData.client && (
                    <Col span={12}>
                      <Card size="small" title={<><UserOutlined /> Client</>} className="glass-card">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {typeof result.structuredData.client === 'string' ? (
                            <div><strong>{result.structuredData.client}</strong></div>
                          ) : (
                            <>
                              {result.structuredData.client.name && (
                                <div><strong>{result.structuredData.client.name}</strong></div>
                              )}
                              {result.structuredData.client.address && (
                                <div className="text-xs text-gray-600">{result.structuredData.client.address}</div>
                              )}
                            </>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}
                </Row>

                {/* Analyse IA */}
                <Card size="small" title={<><BulbOutlined /> Analyse IA</>} className="glass-card">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Résumé:</strong> {result.aiAnalysis.summary}
                    </div>
                    
                    {result.aiAnalysis.keyInsights.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-lg">Points clés:</strong>
                        <List
                          size="small"
                          dataSource={result.aiAnalysis.keyInsights}
                          renderItem={item => <List.Item>• {item}</List.Item>}
                        />
                      </div>
                    )}

                    {result.aiAnalysis.recommendations.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-lg">Recommandations:</strong>
                        <List
                          size="small"
                          dataSource={result.aiAnalysis.recommendations}
                          renderItem={item => <List.Item className="text-blue-600">💡 {item}</List.Item>}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              </Space>
            </TabPane>

            {result.structuredData.items && (
              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined />
                    Articles ({result.structuredData.items.length})
                  </span>
                } 
                key="items"
              >
                <List
                  className="divide-y divide-gray-200"
                  dataSource={result.structuredData.items}
                  renderItem={(item, index) => (
                    <List.Item className="py-4">
                      <List.Item.Meta
                        title={`${index + 1}. ${item.description}`}
                        description={
                          <Space className="flex flex-wrap">
                            {item.quantity && <Tag className="mr-2">Qté: {item.quantity} {item.unit || 'u'}</Tag>}
                            {item.unitPrice && <Tag className="mr-2" color="blue">PU: {formatCurrency(item.unitPrice)}</Tag>}
                            {item.totalPrice && <Tag color="green">Total: {formatCurrency(item.totalPrice)}</Tag>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            )}

            {/* Suggestions */}
            <TabPane 
              tab={
                <span>
                  <BulbOutlined />
                  Suggestions IA
                </span>
              } 
              key="suggestions"
            >
              <Space direction="vertical" className="w-full">
                {result.suggestions.category && (
                  <Alert
                    message="Catégorie suggérée"
                    description={`Ce document semble appartenir à la catégorie: ${result.suggestions.category}`}
                    type="info"
                    showIcon
                  />
                )}

                {result.suggestions.project && (
                  <Alert
                    message="Projet suggéré"
                    description={`Ce document pourrait être lié au projet: ${result.suggestions.project}`}
                    type="info"
                    showIcon
                  />
                )}

                <Card size="small" title="Champs auto-remplis" className="glass-card">
                  <List
                    size="small"
                    dataSource={Object.entries(result.suggestions.autoFillFields)}
                    renderItem={([key, value]) => (
                      <List.Item>
                        <Space>
                          <Tag color="blue">{key}</Tag>
                          <span>{String(value)}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>

                <div className="text-center mt-4">
                  <Space>
                    <Button type="primary" size="large">
                      Créer une dépense avec ces données
                    </Button>
                    <Button size="large">
                      Ajouter au projet suggéré
                    </Button>
                  </Space>
                </div>
              </Space>
            </TabPane>

            {/* Texte brut */}
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  Texte extrait ({rawText.length} caractères)
                </span>
              } 
              key="raw"
            >
              <Card 
                size="small" 
                className="glass-card"
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>Texte extrait du document</span>
                    <Tag color="blue">{rawText.split('\n').filter(l => l.trim()).length} lignes</Tag>
                  </Space>
                }
              >
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed max-h-[600px] overflow-auto">
                    {rawText}
                  </pre>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Space>
                    <Button 
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(rawText);
                        alert('Texte copié dans le presse-papiers !');
                      }}
                    >
                      Copier le texte
                    </Button>
                  </Space>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      )}
    </PageContainer>
  );
};

export default IntelligentOCRScanner;

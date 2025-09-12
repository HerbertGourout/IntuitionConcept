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

const { TabPane } = Tabs;

const IntelligentOCRScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligentOCRResult | null>(null);
  const [rawText, setRawText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setResult(null);
    setRawText('');

    try {
      const ocrResult = await intelligentOcrService.processDocumentIntelligently(file);
      setResult(ocrResult);
      
      // Simuler le texte brut pour la démo
      setRawText(`ENTREPRISE CONSTRUCTION SARL
123 Avenue de la Paix, Dakar
Tel: +221 33 123 45 67
SIRET: 12345678901234

FACTURE N° FAC-2024-001

Client: VILLA MODERNE SARL
Adresse: 456 Rue des Palmiers, Dakar

Date: 15/03/2024
Échéance: 15/04/2024

DÉTAIL:
Béton dosé 350kg/m³     10 m³    85,000    850,000
Parpaings 20x20x40      500 u    400       200,000
Acier HA 12mm           2,000 kg  650      1,300,000

Sous-total HT:                            2,350,000
TVA 18%:                                    423,000
TOTAL TTC:                               2,773,000 FCFA

Conditions: Net à 30 jours
Mode de paiement: Virement bancaire`);
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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Interface de scan */}
      <Card
        title={
          <Space>
            <CameraOutlined />
            Scanner OCR Intelligent IA
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Space size="large">
              <Upload {...uploadProps}>
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />} 
                  size="large"
                  loading={loading}
                >
                  Sélectionner un document
                </Button>
              </Upload>
              
              <Button 
                icon={<CameraOutlined />} 
                size="large"
                onClick={() => fileInputRef.current?.click()}
              >
                Prendre une photo
              </Button>
            </Space>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
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
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <p>Analyse intelligente en cours...</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                OCR + Classification + Extraction IA + Suggestions
              </p>
            </div>
          </div>
        </Card>
      )}

      {result && (
        <Card>
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
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* En-tête */}
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="Type de document"
                        value=""
                        formatter={() => getDocumentTypeTag(result.documentType)}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="Confiance OCR"
                        value={result.confidence}
                        suffix="%"
                        precision={1}
                        valueStyle={{ 
                          color: result.confidence > 80 ? '#52c41a' : 
                                result.confidence > 60 ? '#faad14' : '#ff4d4f' 
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="Montant total"
                        value={result.total || 0}
                        formatter={(value) => formatCurrency(Number(value))}
                        prefix={<DollarOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
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
                      <Card size="small" title={<><UserOutlined /> Fournisseur</>}>
                        <Space direction="vertical" size="small">
                          <div><strong>{result.structuredData.supplier.name}</strong></div>
                          {result.structuredData.supplier.address && (
                            <div style={{ fontSize: '12px' }}>{result.structuredData.supplier.address}</div>
                          )}
                          {result.structuredData.supplier.phone && (
                            <div style={{ fontSize: '12px' }}>📞 {result.structuredData.supplier.phone}</div>
                          )}
                          {result.structuredData.supplier.email && (
                            <div style={{ fontSize: '12px' }}>✉️ {result.structuredData.supplier.email}</div>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  )}

                  {result.structuredData.client && (
                    <Col span={12}>
                      <Card size="small" title={<><UserOutlined /> Client</>}>
                        <div><strong>{result.structuredData.client.name}</strong></div>
                        {result.structuredData.client.address && (
                          <div style={{ fontSize: '12px' }}>{result.structuredData.client.address}</div>
                        )}
                      </Card>
                    </Col>
                  )}
                </Row>

                {/* Analyse IA */}
                <Card size="small" title={<><BulbOutlined /> Analyse IA</>}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Résumé:</strong> {result.aiAnalysis.summary}
                    </div>
                    
                    {result.aiAnalysis.keyInsights.length > 0 && (
                      <div>
                        <strong>Points clés:</strong>
                        <List
                          size="small"
                          dataSource={result.aiAnalysis.keyInsights}
                          renderItem={item => <List.Item>• {item}</List.Item>}
                        />
                      </div>
                    )}

                    {result.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <strong>Recommandations:</strong>
                        <List
                          size="small"
                          dataSource={result.aiAnalysis.recommendations}
                          renderItem={item => <List.Item style={{ color: '#1890ff' }}>💡 {item}</List.Item>}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              </Space>
            </TabPane>

            {/* Articles détaillés */}
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
                  dataSource={result.structuredData.items}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${index + 1}. ${item.description}`}
                        description={
                          <Space>
                            {item.quantity && <Tag>Qté: {item.quantity} {item.unit || 'u'}</Tag>}
                            {item.unitPrice && <Tag color="blue">PU: {formatCurrency(item.unitPrice)}</Tag>}
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
              <Space direction="vertical" style={{ width: '100%' }}>
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

                <Card size="small" title="Champs auto-remplis">
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

                <div style={{ textAlign: 'center', marginTop: 16 }}>
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
                  Texte brut
                </span>
              } 
              key="raw"
            >
              <Card size="small">
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '12px', 
                  maxHeight: '400px', 
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px'
                }}>
                  {rawText}
                </pre>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default IntelligentOCRScanner;

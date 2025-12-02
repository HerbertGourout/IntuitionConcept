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
      console.log(' Démarrage analyse OCR...');
      
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
    accept: 'image/*,application/pdf',
    beforeUpload: (file: File) => {
      // Empêcher l'upload automatique d'AntD, on traite le fichier manuellement
      handleFileUpload(file);
      return false;
    },
  };

  return (
    <PageContainer>
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
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) handleFileUpload(f);
            }}
            className="hidden"
          />

          {loading && (
            <Card className="glass-card mt-6">
              <div className="text-center py-10">
                <Spin size="large" />
                <div className="mt-4">
                  <p>Analyse intelligente en cours...</p>
                  <p className="text-xs text-gray-600">OCR + Classification + Extraction + Suggestions</p>
                </div>
              </div>
            </Card>
          )}

          {result && (
            <>
              <Card size="small" title={<><BulbOutlined /> Analyse</>} className="glass-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {result.aiAnalysis?.summary && (
                    <div>
                      <strong>Résumé:</strong> {result.aiAnalysis.summary}
                    </div>
                  )}

                  {result.aiAnalysis?.keyInsights?.length > 0 && (
                    <div className="mb-4">
                      <strong className="text-lg">Points clés:</strong>
                      <List
                        size="small"
                        dataSource={result.aiAnalysis.keyInsights}
                        renderItem={(item) => <List.Item>• {item}</List.Item>}
                      />
                    </div>
                  )}

                  {result.aiAnalysis?.recommendations?.length > 0 && (
                    <div className="mb-4">
                      <strong className="text-lg">Recommandations:</strong>
                      <List
                        size="small"
                        dataSource={result.aiAnalysis.recommendations}
                        renderItem={(item) => <List.Item className="text-blue-600">{item}</List.Item>}
                      />
                    </div>
                  )}
                </Space>
              </Card>

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
            </>
          )}
        </Space>
      </Card>
    </PageContainer>
  );
};

export default IntelligentOCRScanner;

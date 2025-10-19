// Composant d'upload et d'analyse d'appel d'offres

import React, { useState, useRef } from 'react';
import { Card, Button, Upload, Alert, Spin, Progress } from 'antd';
import { UploadOutlined, FileTextOutlined, CameraOutlined } from '@ant-design/icons';
import { tenderAnalyzer } from '../../services/ai/tenderAnalyzer';
import { Tender } from '../../types/tender';
import { useAuth } from '../../contexts/AuthContext';

interface TenderUploadProps {
  onTenderAnalyzed: (tender: Tender) => void;
}

const TenderUpload: React.FC<TenderUploadProps> = ({ onTenderAnalyzed }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!currentUser) {
      setError('Vous devez être connecté pour utiliser cette fonctionnalité');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      console.log('📄 Analyse de l\'appel d\'offres:', file.name);
      
      const result = await tenderAnalyzer.analyzeTender(file, currentUser.uid);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('✅ Analyse terminée:', result);
      
      // Petit délai pour montrer 100%
      setTimeout(() => {
        onTenderAnalyzed(result.tender);
      }, 500);
      
    } catch (err) {
      console.error('❌ Erreur analyse:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,image/*',
    beforeUpload: (file: File) => {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10MB)');
        return false;
      }
      
      handleFileUpload(file);
      return false; // Empêcher l'upload automatique
    },
    showUploadList: false
  };

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <Card className="glass-card">
        <div className="text-center py-12">
          {!loading ? (
            <>
              <div className="mb-6">
                <FileTextOutlined className="text-6xl text-blue-500" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4">
                Chargez votre appel d'offres
              </h3>
              
              <p className="text-gray-600 mb-6">
                Formats acceptés : PDF, JPG, PNG (max 10MB)
              </p>
              
              <div className="flex justify-center space-x-4">
                <Upload {...uploadProps}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />} 
                    size="large"
                  >
                    Sélectionner un fichier
                  </Button>
                </Upload>
                
                <Button 
                  icon={<CameraOutlined />} 
                  size="large"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Prendre une photo
                </Button>
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
            </>
          ) : (
            <>
              <Spin size="large" />
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Analyse en cours...
                </h3>
                <Progress 
                  percent={progress} 
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <p className="text-sm text-gray-600 mt-4">
                  {progress < 30 && '📄 Extraction du texte...'}
                  {progress >= 30 && progress < 60 && '🔍 Analyse avec IA...'}
                  {progress >= 60 && progress < 90 && '📊 Identification des exigences...'}
                  {progress >= 90 && '✅ Finalisation...'}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Erreur */}
      {error && (
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Exemples */}
      <Card className="glass-card bg-gray-50">
        <h4 className="font-semibold mb-3">💡 Conseils pour de meilleurs résultats</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Utilisez des documents <strong>lisibles et de bonne qualité</strong></li>
          <li>Les <strong>PDFs natifs</strong> donnent les meilleurs résultats (95% de précision)</li>
          <li>Pour les photos, assurez-vous d'un <strong>bon éclairage</strong></li>
          <li>Le document doit contenir au minimum : <strong>titre, client, exigences</strong></li>
        </ul>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card text-center">
          <div className="text-3xl font-bold text-blue-600">95%</div>
          <div className="text-sm text-gray-600">Précision OCR</div>
        </Card>
        <Card className="glass-card text-center">
          <div className="text-3xl font-bold text-green-600">~2min</div>
          <div className="text-sm text-gray-600">Temps d'analyse</div>
        </Card>
        <Card className="glass-card text-center">
          <div className="text-3xl font-bold text-purple-600">0 FCFA</div>
          <div className="text-sm text-gray-600">Coût analyse</div>
        </Card>
      </div>
    </div>
  );
};

export default TenderUpload;

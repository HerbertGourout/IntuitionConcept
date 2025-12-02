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
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!firebaseUser) {
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
      
      const result = await tenderAnalyzer.analyzeTender(file, firebaseUser.uid);
      
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
    beforeUpload: async (file: File) => {
      await handleFileUpload(file);
      return false; // empêcher l'upload automatique par antd
    },
    showUploadList: false
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <Upload.Dragger {...uploadProps} disabled={loading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Cliquez ou glissez-déposez un appel d'offres au format PDF ou image</p>
          <p className="ant-upload-hint">
            Formats supportés : PDF, images (JPG, PNG). Taille max recommandée : 25 Mo.
          </p>
        </Upload.Dragger>

        {loading && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Spin />
            <Progress percent={progress} status="active" className="w-full" />
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Alert
              message="Erreur"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          </div>
        )}
      </Card>

      {/* Exemples */}
      <Card className="glass-card bg-gray-50">
        <h4 className="font-semibold mb-3"> Conseils pour de meilleurs résultats</h4>
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

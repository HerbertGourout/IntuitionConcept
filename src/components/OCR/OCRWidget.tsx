import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { Scan, FileText, Zap, TrendingUp } from 'lucide-react';
import OCRScanner from './OCRScanner';
import { ExtractedData } from '../../services/ocrService';

const { Title, Text } = Typography;

interface OCRWidgetProps {
  onDataExtracted?: (data: ExtractedData) => void;
}

const OCRWidget: React.FC<OCRWidgetProps> = ({ onDataExtracted }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanCount, setLastScanCount] = useState(0);

  const handleOCRComplete = (data: ExtractedData, _imageUrl: string) => {
    void _imageUrl; // mark as used (no-op) for ESLint
    setLastScanCount(prev => prev + 1);

    // Appeler le callback si fourni
    if (onDataExtracted) {
      onDataExtracted(data);
    }
  };

  return (
    <>
      <Card
        hoverable
        className="h-full border-2 hover:border-blue-300 transition-all duration-300"
        styles={{ body: { padding: '20px' } }}
      >
        <div className="space-y-4">
          {/* Header avec icône */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title level={4} className="mb-0">OCR Intelligent</Title>
              <Text type="secondary">Extraction automatique de données</Text>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-xs text-green-700">Précision</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{lastScanCount}</div>
              <div className="text-xs text-blue-700">Documents scannés</div>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Traitement instantané</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Extraction intelligente</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>70% temps économisé</span>
            </div>
          </div>

          {/* Bouton d'action */}
          <Button
            type="primary"
            size="large"
            block
            icon={<Scan className="w-4 h-4" />}
            onClick={() => setShowScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
          >
            Scanner un document
          </Button>

          {/* Description */}
          <div className="text-center">
            <Text type="secondary" className="text-xs">
              Scannez factures, reçus, contrats...
              L'IA extrait automatiquement les données !
            </Text>
          </div>
        </div>
      </Card>

      {/* Modal OCR Scanner */}
      <OCRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onDataExtracted={handleOCRComplete}
        title="OCR Intelligent - Scanner de documents"
      />
    </>
  );
};

export default OCRWidget;

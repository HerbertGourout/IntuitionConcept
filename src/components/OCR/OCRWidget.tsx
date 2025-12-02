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
          {}
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

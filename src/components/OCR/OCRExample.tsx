import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { Scan, FileText, Receipt, Calculator, Truck } from 'lucide-react';
import OCRScanner from './OCRScanner';
import { ExtractedData } from '../../services/ocrService';

interface OCRExampleProps {
  onExpenseDetected?: (expense: {
    vendorName?: string;
    amount?: number;
    invoiceNumber?: string;
    date?: string;
  }) => void;
}

const OCRExample: React.FC<OCRExampleProps> = ({ onExpenseDetected }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [lastScan, setLastScan] = useState<{
    data: ExtractedData;
    timestamp: Date;
  } | null>(null);

  const handleOCRComplete = (data: ExtractedData, _imageUrl: string) => {
    void _imageUrl; // mark as used (no-op) for ESLint
    setLastScan({ data, timestamp: new Date() });

    // Notification de succès
    message.success({
      content: `Document analysé ! ${data.amounts.length} montants et ${data.dates.length} dates détectés.`,
      duration: 4
    });

    // Callback si fourni
    if (onExpenseDetected) {
      onExpenseDetected({
        vendorName: data.vendorName,
        amount: data.total,
        invoiceNumber: data.invoiceNumber,
        date: data.dates[0]
      });
    }
  };

  const handleQuickActions = (action: string) => {
    switch (action) {
      case 'receipt':
        setShowScanner(true);
        break;
      case 'invoice':
        setShowScanner(true);
        break;
      case 'contract':
        message.info('Scanner de contrats - Bientôt disponible !');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          hoverable
          className="cursor-pointer border-2 hover:border-blue-300 transition-colors"
          onClick={() => handleQuickActions('receipt')}
        >
          <div className="text-center space-y-2">
            <Receipt className="w-8 h-8 text-green-600 mx-auto" />
            <h4 className="font-medium">Scanner un reçu</h4>
            <p className="text-sm text-gray-600">Factures, tickets de caisse, reçus de paiement</p>
          </div>
        </Card>

        <Card
          hoverable
          className="cursor-pointer border-2 hover:border-blue-300 transition-colors"
          onClick={() => handleQuickActions('invoice')}
        >
          <div className="text-center space-y-2">
            <FileText className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-medium">Scanner une facture</h4>
            <p className="text-sm text-gray-600">Factures fournisseurs, bons de commande</p>
          </div>
        </Card>

        <Card
          hoverable
          className="cursor-pointer border-2 hover:border-gray-300 transition-colors opacity-60"
          onClick={() => handleQuickActions('contract')}
        >
          <div className="text-center space-y-2">
            <Calculator className="w-8 h-8 text-purple-600 mx-auto" />
            <h4 className="font-medium">Scanner un contrat</h4>
            <p className="text-sm text-gray-600">Bientôt disponible</p>
          </div>
        </Card>
      </div>

      {}
      <OCRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onDataExtracted={handleOCRComplete}
        title="OCR Intelligent - Scanner un document"
      />
    </div>
  );
};

export default OCRExample;

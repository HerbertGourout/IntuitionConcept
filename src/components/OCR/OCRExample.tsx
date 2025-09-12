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
      {/* Header avec explication */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Scan className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              OCR Intelligent - Révolutionnez votre saisie !
            </h3>
            <p className="text-blue-600">
              Scannez vos documents et laissez l'IA extraire automatiquement les données importantes.
              Économisez jusqu'à 70% de temps sur la saisie manuelle.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
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

      {/* Statistiques OCR */}
      <Card title="Statistiques OCR" className="bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">Précision</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">70%</div>
            <div className="text-sm text-gray-600">Temps économisé</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">Disponibilité</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0€</div>
            <div className="text-sm text-gray-600">Coût additionnel</div>
          </div>
        </div>
      </Card>

      {/* Dernier scan */}
      {lastScan && (
        <Card
          title="Dernier document scanné"
          extra={
            <Button
              size="small"
              onClick={() => setLastScan(null)}
            >
              Effacer
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Scanné le {lastScan.timestamp.toLocaleString('fr-FR')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {lastScan.data.vendorName && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fournisseur
                  </label>
                  <p className="text-gray-900">{lastScan.data.vendorName}</p>
                </div>
              )}

              {lastScan.data.total && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Montant
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {lastScan.data.total.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              )}

              {lastScan.data.invoiceNumber && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    N° Facture
                  </label>
                  <p className="text-gray-900">{lastScan.data.invoiceNumber}</p>
                </div>
              )}

              {lastScan.data.dates.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </label>
                  <p className="text-gray-900">{lastScan.data.dates[0]}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Call-to-action */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center space-y-3">
          <Truck className="w-12 h-12 text-green-600 mx-auto" />
          <h3 className="text-xl font-semibold text-green-800">
            Prêt à révolutionner votre productivité ?
          </h3>
          <p className="text-green-700">
            Commencez dès maintenant à scanner vos documents et laissez l'IA faire le travail !
          </p>
          <Button
            type="primary"
            size="large"
            icon={<Scan className="w-5 h-5" />}
            onClick={() => setShowScanner(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Scanner mon premier document
          </Button>
        </div>
      </Card>

      {/* Modal OCR */}
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

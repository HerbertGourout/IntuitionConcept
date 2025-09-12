import React, { useState } from 'react';
import { Button, Card, Input, InputNumber, DatePicker } from 'antd';
import { Scan, FileText, Calculator } from 'lucide-react';
import { message } from 'antd';
import OCRScanner from '../OCR/OCRScanner';
import { ExtractedData } from '../../services/ocrService';
import dayjs from 'dayjs';

interface ExpenseOCRFormProps {
  onExpenseAdded?: (expense: {
    description: string;
    amount: number;
    date: Date;
    category: string;
    vendorName?: string;
    invoiceNumber?: string;
  }) => void;
}

const ExpenseOCRForm: React.FC<ExpenseOCRFormProps> = ({ onExpenseAdded }) => {
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: null as Date | null,
    category: '',
    vendorName: '',
    invoiceNumber: ''
  });

  const handleOCRData = (data: ExtractedData, _imageUrl: string) => {
    // Marquer explicitement l'argument comme utilisé (no-op) pour satisfaire ESLint
    void _imageUrl;
    // Remplir automatiquement le formulaire avec les données extraites
    setFormData(prev => ({
      ...prev,
      amount: data.total || prev.amount,
      vendorName: data.vendorName || prev.vendorName,
      invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
      description: data.vendorName ? `Facture ${data.vendorName}` : prev.description
    }));

    message.success('Données extraites automatiquement ! Vérifiez et complétez si nécessaire.');
  };

  const handleSubmit = () => {
    if (!formData.description.trim() || !formData.amount || !formData.date) {
      message.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onExpenseAdded?.({
      ...formData,
      date: formData.date!
    });

    // Reset form
    setFormData({
      description: '',
      amount: 0,
      date: null,
      category: '',
      vendorName: '',
      invoiceNumber: ''
    });

    message.success('Dépense ajoutée avec succès !');
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton OCR */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <span>Ajouter une dépense</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<Scan className="w-4 h-4" />}
            onClick={() => setShowOCRScanner(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Scanner une facture
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Input
              placeholder="Ex: Matériaux de construction, Transport..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (FCFA) *
            </label>
            <InputNumber
              placeholder="0"
              min={0}
              step={1000}
              style={{ width: '100%' }}
              value={formData.amount}
              onChange={(value) => setFormData(prev => ({ ...prev, amount: value || 0 }))}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Sélectionner une date"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(date) => setFormData(prev => ({
                ...prev,
                date: date ? date.toDate() : null
              }))}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <Input
              placeholder="Ex: Matériaux, Transport, Main d'œuvre..."
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
          </div>

          {/* Fournisseur (rempli automatiquement par OCR) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur
            </label>
            <Input
              placeholder="Nom du fournisseur"
              value={formData.vendorName}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            />
          </div>

          {/* Numéro de facture (rempli automatiquement par OCR) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Facture
            </label>
            <Input
              placeholder="Numéro de facture"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            />
          </div>

          {/* Bouton de soumission */}
          <Button
            type="primary"
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700"
            size="large"
          >
            Ajouter la dépense
          </Button>
        </div>
      </Card>

      {/* Indicateur OCR */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-800">OCR Intelligent</h4>
            <p className="text-sm text-blue-600">
              Scannez vos factures pour extraire automatiquement les données.
              Économisez jusqu'à 70% du temps de saisie !
            </p>
          </div>
        </div>
      </Card>

      {/* Modal OCR */}
      <OCRScanner
        isOpen={showOCRScanner}
        onClose={() => setShowOCRScanner(false)}
        onDataExtracted={handleOCRData}
        title="Scanner une facture"
      />
    </div>
  );
};

export default ExpenseOCRForm;

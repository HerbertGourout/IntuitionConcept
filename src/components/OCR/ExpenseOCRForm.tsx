import React, { useState } from 'react';
import { Button, Card, Input, InputNumber, DatePicker, Select, Tag, Alert } from 'antd';
import { Scan, Calculator, CheckCircle, Sparkles, Save } from 'lucide-react';
import { message } from 'antd';
import OCRScanner from '../OCR/OCRScanner';
import { ExtractedData } from '../../services/ocrService';
import { EnhancedOCRData } from '../../services/ai/ocrEnhancer';
import dayjs from 'dayjs';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface ExpenseOCRFormProps {
  projectId?: string;
  onExpenseAdded?: (expense: Expense) => void;
}

interface Expense {
  description: string;
  amount: number;
  date: Date;
  category: string;
  vendorName?: string;
  invoiceNumber?: string;
  ocrConfidence?: number;
  ocrProvider?: string;
  autoFilled?: boolean;
  validationStatus?: 'valid' | 'warning' | 'error';
  suggestions?: string[];
}

const ExpenseOCRForm: React.FC<ExpenseOCRFormProps> = ({ projectId, onExpenseAdded }) => {
  const { user } = useAuth();
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: null as Date | null,
    category: '',
    vendorName: '',
    invoiceNumber: '',
    ocrConfidence: 0,
    ocrProvider: '',
    autoFilled: false,
    validationStatus: 'valid' as 'valid' | 'warning' | 'error',
    suggestions: [] as string[]
  });
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedOCRData | null>(null);

  const handleOCRData = (data: ExtractedData, imageUrl: string) => {
    // Sauvegarder l'image scannée
    setOcrImage(imageUrl);

    // Si les données sont enrichies (EnhancedOCRData)
    const enhanced = data as unknown as EnhancedOCRData;
    if (enhanced.normalizedData) {
      setEnhancedData(enhanced);
      
      // Auto-remplissage avec données enrichies
      setFormData(prev => ({
        ...prev,
        amount: enhanced.normalizedData.amount || data.total || prev.amount,
        vendorName: enhanced.normalizedData.vendorName || data.vendorName || prev.vendorName,
        invoiceNumber: enhanced.normalizedData.invoiceNumber || data.invoiceNumber || prev.invoiceNumber,
        description: enhanced.normalizedData.vendorName 
          ? `Facture ${enhanced.normalizedData.vendorName}` 
          : data.vendorName 
          ? `Facture ${data.vendorName}` 
          : prev.description,
        date: enhanced.normalizedData.date 
          ? new Date(enhanced.normalizedData.date) 
          : prev.date,
        ocrConfidence: enhanced.confidence || 0,
        autoFilled: true,
        validationStatus: enhanced.validationStatus || 'valid',
        suggestions: enhanced.suggestions || []
      }));

      // Message selon la confiance
      if (enhanced.confidence >= 80) {
        message.success(`✅ Données extraites avec ${enhanced.confidence}% de confiance ! Vérifiez et validez.`);
      } else if (enhanced.confidence >= 60) {
        message.warning(`⚠️ Données extraites avec ${enhanced.confidence}% de confiance. Vérifiez attentivement.`);
      } else {
        message.error(`❌ Confiance faible (${enhanced.confidence}%). Vérifiez toutes les données.`);
      }
    } else {
      // Fallback données basiques
      setFormData(prev => ({
        ...prev,
        amount: data.total || prev.amount,
        vendorName: data.vendorName || prev.vendorName,
        invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
        description: data.vendorName ? `Facture ${data.vendorName}` : prev.description,
        autoFilled: true
      }));
      message.success('Données extraites ! Vérifiez et complétez si nécessaire.');
    }

    setShowOCRScanner(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.description.trim()) {
      message.error('La description est obligatoire');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      message.error('Le montant doit être supérieur à 0');
      return;
    }
    if (!formData.date) {
      message.error('La date est obligatoire');
      return;
    }

    setIsSaving(true);

    try {
      const expense: Expense = {
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        category: formData.category || 'Non catégorisé',
        vendorName: formData.vendorName,
        invoiceNumber: formData.invoiceNumber,
        ocrConfidence: formData.ocrConfidence,
        ocrProvider: formData.ocrProvider,
        autoFilled: formData.autoFilled,
        validationStatus: formData.validationStatus,
        suggestions: formData.suggestions
      };

      // Sauvegarder dans Firebase si projectId fourni
      if (projectId && user) {
        await addDoc(collection(db, 'expenses'), {
          ...expense,
          projectId,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          ocrImage: ocrImage || null,
          enhancedData: enhancedData ? {
            confidence: enhancedData.confidence,
            validationStatus: enhancedData.validationStatus,
            mappedVendor: enhancedData.mappedVendor,
            items: enhancedData.items
          } : null
        });
        message.success('💾 Dépense sauvegardée dans Firebase !');
      }

      // Callback
      onExpenseAdded?.(expense);

      // Reset form
      setFormData({
        description: '',
        amount: 0,
        date: null,
        category: '',
        vendorName: '',
        invoiceNumber: '',
        ocrConfidence: 0,
        ocrProvider: '',
        autoFilled: false,
        validationStatus: 'valid',
        suggestions: []
      });
      setOcrImage(null);
      setEnhancedData(null);

      message.success('✅ Dépense ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde dépense:', error);
      message.error('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton OCR */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <span>Ajouter une dépense</span>
            {formData.autoFilled && (
              <Tag color="blue" icon={<Sparkles className="w-3 h-3" />}>
                Auto-rempli par OCR
              </Tag>
            )}
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<Scan className="w-4 h-4" />}
            onClick={() => setShowOCRScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
          >
            Scanner une facture
          </Button>
        }
      >
        {/* Alertes de validation */}
        {formData.autoFilled && formData.validationStatus !== 'valid' && (
          <Alert
            message={
              formData.validationStatus === 'warning' 
                ? 'Vérification recommandée' 
                : 'Attention requise'
            }
            description={
              <div>
                <p className="mb-2">
                  {formData.validationStatus === 'warning'
                    ? `Confiance OCR: ${formData.ocrConfidence}%. Vérifiez les données extraites.`
                    : `Confiance OCR faible: ${formData.ocrConfidence}%. Vérifiez attentivement toutes les données.`
                  }
                </p>
                {formData.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {formData.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            }
            type={formData.validationStatus === 'warning' ? 'warning' : 'error'}
            showIcon
            className="mb-4"
          />
        )}

        {/* Indicateur OCR enrichi */}
        {formData.autoFilled && enhancedData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Données enrichies par IA
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Tag color={enhancedData.confidence >= 80 ? 'green' : enhancedData.confidence >= 60 ? 'orange' : 'red'}>
                  Confiance: {enhancedData.confidence}%
                </Tag>
                {enhancedData.mappedVendor && (
                  <Tag color="purple">
                    Fournisseur reconnu: {enhancedData.mappedVendor.name}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        )}
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
            <Select
              placeholder="Sélectionner une catégorie"
              style={{ width: '100%' }}
              value={formData.category || undefined}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={[
                { label: '🏗️ Matériaux', value: 'Matériaux' },
                { label: '👷 Main d\'œuvre', value: 'Main d\'œuvre' },
                { label: '🚚 Transport', value: 'Transport' },
                { label: '🔧 Équipement', value: 'Équipement' },
                { label: '📄 Administratif', value: 'Administratif' },
                { label: '💡 Énergie', value: 'Énergie' },
                { label: '🏢 Location', value: 'Location' },
                { label: '📞 Services', value: 'Services' },
                { label: '🍽️ Restauration', value: 'Restauration' },
                { label: '📦 Autres', value: 'Autres' }
              ]}
              allowClear
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

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              type="default"
              onClick={() => {
                setFormData({
                  description: '',
                  amount: 0,
                  date: null,
                  category: '',
                  vendorName: '',
                  invoiceNumber: '',
                  ocrConfidence: 0,
                  ocrProvider: '',
                  autoFilled: false,
                  validationStatus: 'valid',
                  suggestions: []
                });
                setOcrImage(null);
                setEnhancedData(null);
              }}
              className="flex-1"
              size="large"
            >
              Réinitialiser
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
              size="large"
            >
              {isSaving ? 'Sauvegarde...' : 'Ajouter la dépense'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistiques OCR */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">OCR Intelligent avec IA</h4>
              <p className="text-sm text-gray-600">
                Scannez vos factures pour extraire automatiquement les données avec précision.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-xs text-gray-600">Précision</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">80%</div>
              <div className="text-xs text-gray-600">Temps économisé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2-3s</div>
              <div className="text-xs text-gray-600">Traitement</div>
            </div>
          </div>

          {formData.autoFilled && (
            <Alert
              message="Données auto-remplies"
              description={`Confiance: ${formData.ocrConfidence}% | Provider: ${formData.ocrProvider || 'Tesseract'}`}
              type="success"
              showIcon
              icon={<CheckCircle className="w-4 h-4" />}
            />
          )}
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

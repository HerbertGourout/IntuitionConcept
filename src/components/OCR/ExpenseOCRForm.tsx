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
      {}
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

          {}
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

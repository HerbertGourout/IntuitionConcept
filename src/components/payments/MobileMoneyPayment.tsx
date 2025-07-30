import React, { useState, useCallback } from 'react';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import { PaymentService, PaymentConfig } from '../../services/PaymentService';
import { CreditCard, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

// Types simples et compatibles pour Flutterwave
interface MobileMoneyPaymentProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  description: string;
  onSuccess: (response: Record<string, unknown>) => void;
  onClose?: () => void;
  isProduction?: boolean;
  // Note: onError supprimé car non supporté par FlutterWaveButton
}

export const MobileMoneyPayment: React.FC<MobileMoneyPaymentProps> = ({
  amount,
  currency,
  customerEmail,
  customerPhone,
  customerName,
  description,
  onSuccess,
  onClose,
  isProduction = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(customerPhone);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Configuration du paiement Flutterwave
  const paymentConfig: PaymentConfig = PaymentService.generatePaymentConfig(
    amount,
    currency,
    customerEmail,
    phoneNumber,
    customerName,
    description,
    isProduction
  );

  // Validation du numéro de téléphone
  const validatePhone = useCallback((phone: string) => {
    if (!phone.trim()) {
      setValidationError('Le numéro de téléphone est requis');
      return false;
    }

    if (!PaymentService.validatePhoneNumber(phone)) {
      setValidationError('Format de numéro invalide. Utilisez le format international (+221xxxxxxxx)');
      return false;
    }

    setValidationError(null);
    return true;
  }, []);

  // Gestionnaire de succès
  const handleSuccess = useCallback((response: Record<string, unknown>) => {
    console.log('✅ Paiement réussi:', response);
    setIsProcessing(false);
    
    // Fermer le modal Flutterwave
    closePaymentModal();
    
    // Appeler le callback de succès
    onSuccess(response);
  }, [onSuccess]);

  // Note: La gestion d'erreur via onError n'est pas supportée par FlutterWaveButton
  // Les erreurs sont gérées automatiquement par la bibliothèque Flutterwave

  // Gestionnaire de fermeture
  const handleClose = useCallback(() => {
    console.log('🔒 Paiement fermé par l\'utilisateur');
    setIsProcessing(false);
    
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Mise à jour du numéro de téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneNumber(phone);
    
    if (phone.trim()) {
      validatePhone(phone);
    } else {
      setValidationError(null);
    }
  };

  // Calcul des frais
  const transactionFees = PaymentService.calculateTransactionFees(amount, currency);
  const totalAmount = amount + transactionFees;

  // Configuration mise à jour avec le numéro validé
  const updatedConfig = {
    ...paymentConfig,
    customer: {
      ...paymentConfig.customer,
      phone_number: PaymentService.formatPhoneNumber(phoneNumber)
    },
    customizations: {
      ...paymentConfig.customizations,
      logo: paymentConfig.customizations?.logo || '' // Valeur par défaut pour éviter undefined
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* En-tête */}
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Paiement Mobile Money</h3>
          <p className="text-sm text-gray-600">Paiement sécurisé via Flutterwave</p>
        </div>
      </div>

      {/* Détails du paiement */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Montant:</span>
          <span className="font-semibold">{amount.toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Frais de transaction:</span>
          <span className="text-sm">{transactionFees.toLocaleString()} {currency}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total à payer:</span>
          <span className="font-bold text-lg text-blue-600">{totalAmount.toLocaleString()} {currency}</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Champ numéro de téléphone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone Mobile Money
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+221 70 123 45 67"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <Smartphone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        {validationError && (
          <div className="flex items-center mt-2 text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">{validationError}</span>
          </div>
        )}
      </div>

      {/* Méthodes de paiement supportées */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Méthodes supportées:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center p-2 bg-orange-50 rounded border">
            <div className="w-6 h-6 bg-orange-500 rounded mr-2"></div>
            <span className="text-xs">Orange Money</span>
          </div>
          <div className="flex items-center p-2 bg-yellow-50 rounded border">
            <div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div>
            <span className="text-xs">MTN Money</span>
          </div>
          <div className="flex items-center p-2 bg-red-50 rounded border">
            <div className="w-6 h-6 bg-red-500 rounded mr-2"></div>
            <span className="text-xs">Airtel Money</span>
          </div>
          <div className="flex items-center p-2 bg-blue-50 rounded border">
            <CreditCard className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-xs">Cartes bancaires</span>
          </div>
        </div>
      </div>

      {/* Bouton de paiement */}
      <div className="space-y-3">
        <FlutterWaveButton
          {...updatedConfig}
          callback={handleSuccess as (response: unknown) => void}
          onClose={handleClose}
          // Note: onError n'est pas supporté par FlutterWaveButton
          disabled={isProcessing || !!validationError || !phoneNumber.trim()}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isProcessing || !!validationError || !phoneNumber.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
          text={
            isProcessing 
              ? "⏳ Traitement en cours..."
              : `Payer ${totalAmount.toLocaleString()} ${currency}`
          }
        />

        {/* Informations de sécurité */}
        <div className="flex items-center justify-center text-xs text-gray-500">
          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
          <span>Paiement sécurisé SSL 256-bit</span>
        </div>
      </div>

      {/* Mode test */}
      {!isProduction && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-xs text-yellow-800">
              Mode test - Aucun vrai paiement ne sera effectué
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMoneyPayment;

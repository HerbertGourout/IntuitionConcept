import { apiClient } from './api/httpClient';
import { Timestamp } from 'firebase/firestore';

export interface PaymentConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
}

export interface PaymentInitiationPayload {
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
  projectId?: string;
  provider?: 'flutterwave';
}

export interface PaymentInitiationResponse {
  message: string;
  data: PaymentInitiationPayload & { transactionId?: string };
}

export interface PaymentVerificationResponse {
  message: string;
  transactionId: string;
  status?: string;
}

export interface PaymentRecord {
  id?: string;
  userId: string;
  projectId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  paymentMethod: 'mobile_money' | 'card' | 'bank_transfer';
  provider: 'flutterwave' | 'orange_money' | 'mtn_money';
  transactionRef: string;
  flutterwaveRef?: string;
  phoneNumber: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    subscriptionType?: 'monthly' | 'yearly';
    features?: string[];
  };
}

export class PaymentService {
  // Clés de test Flutterwave (à remplacer par les vraies clés en production)
  private static readonly TEST_PUBLIC_KEY = 'FLWPUBK_TEST-SANDBOXDEMOKEY-X';
  private static readonly PROD_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
  
  // Devises supportées en Afrique francophone
  public static readonly SUPPORTED_CURRENCIES = {
    // Afrique de l'Ouest francophone (BCEAO)
    'XOF': 'Franc CFA (BCEAO)', // Sénégal, Côte d'Ivoire, Mali, Burkina Faso, Niger, Guinée, Bénin, Togo
    
    // Afrique centrale francophone (BEAC)
    'XAF': 'Franc CFA (BEAC)', // Cameroun, Gabon, RCA, Tchad, RDC, Congo
    
    // Maghreb
    'MAD': 'Dirham Marocain',
    'DZD': 'Dinar Algérien',
    'TND': 'Dinar Tunisien',
    
    // Devise de référence
    'EUR': 'Euro',
    'USD': 'Dollar US'
  };

  // Plans d'abonnement
  public static readonly SUBSCRIPTION_PLANS = {
    basic: {
      monthly: { amount: 5000, currency: 'XOF', features: ['5 projets', '10 utilisateurs', 'Support email'] },
      yearly: { amount: 50000, currency: 'XOF', features: ['5 projets', '10 utilisateurs', 'Support email', '2 mois gratuits'] }
    },
    pro: {
      monthly: { amount: 15000, currency: 'XOF', features: ['50 projets', '100 utilisateurs', 'Support prioritaire', 'Rapports avancés'] },
      yearly: { amount: 150000, currency: 'XOF', features: ['50 projets', '100 utilisateurs', 'Support prioritaire', 'Rapports avancés', '2 mois gratuits'] }
    },
    enterprise: {
      monthly: { amount: 50000, currency: 'XOF', features: ['Projets illimités', 'Utilisateurs illimités', 'Support 24/7', 'API personnalisée'] },
      yearly: { amount: 500000, currency: 'XOF', features: ['Projets illimités', 'Utilisateurs illimités', 'Support 24/7', 'API personnalisée', '2 mois gratuits'] }
    }
  };

  /**
   * Génère la configuration pour un paiement Flutterwave
   */
  static generatePaymentConfig(
    amount: number,
    currency: string,
    customerEmail: string,
    customerPhone: string,
    customerName: string,
    description: string,
    isProduction = false
  ): PaymentConfig {
    return {
      public_key: isProduction ? this.PROD_PUBLIC_KEY : this.TEST_PUBLIC_KEY,
      tx_ref: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      payment_options: 'mobilemoney,card,banktransfer',
      customer: {
        email: customerEmail,
        phonenumber: customerPhone,
        name: customerName,
      },
      customizations: {
        title: 'Abonnement SaaS Gestion de Projets',
        description,
        logo: 'https://your-logo-url.com/logo.png', // À remplacer par votre logo
      },
    };
  }

  /**
   * Valide un numéro de téléphone pour Mobile Money (Afrique francophone)
   */
  static validatePhoneNumber(phone: string, country?: string): boolean {
    // Supprime tous les espaces et caractères spéciaux
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Formats acceptés pour l'Afrique francophone
    const patterns = {
      // Afrique de l'Ouest francophone
      'SN': /^(\+221|221)?[0-9]{9}$/, // Sénégal
      'CI': /^(\+225|225)?[0-9]{8,10}$/, // Côte d'Ivoire
      'BF': /^(\+226|226)?[0-9]{8}$/, // Burkina Faso
      'ML': /^(\+223|223)?[0-9]{8}$/, // Mali
      'NE': /^(\+227|227)?[0-9]{8}$/, // Niger
      'GN': /^(\+224|224)?[0-9]{8,9}$/, // Guinée
      'BJ': /^(\+229|229)?[0-9]{8}$/, // Bénin
      'TG': /^(\+228|228)?[0-9]{8}$/, // Togo
      
      // Afrique centrale francophone
      'CM': /^(\+237|237)?[0-9]{8,9}$/, // Cameroun
      'GA': /^(\+241|241)?[0-9]{7,8}$/, // Gabon
      'CF': /^(\+236|236)?[0-9]{8}$/, // République centrafricaine
      'TD': /^(\+235|235)?[0-9]{8}$/, // Tchad
      'CD': /^(\+243|243)?[0-9]{9}$/, // RDC
      'CG': /^(\+242|242)?[0-9]{7,9}$/, // Congo
      
      // Maghreb
      'MA': /^(\+212|212)?[0-9]{9}$/, // Maroc
      'DZ': /^(\+213|213)?[0-9]{9}$/, // Algérie
      'TN': /^(\+216|216)?[0-9]{8}$/, // Tunisie
      
      'default': /^(\+[1-9]\d{1,14})$/ // Format international général
    };

    if (country && patterns[country as keyof typeof patterns]) {
      return patterns[country as keyof typeof patterns].test(cleanPhone);
    }

    return patterns.default.test(cleanPhone);
  }

  /**
   * Formate un numéro de téléphone au format international (Afrique francophone)
   */
  static formatPhoneNumber(phone: string, countryCode = '+221'): string {
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    if (cleanPhone.startsWith('00')) {
      return '+' + cleanPhone.substring(2);
    }
    
    // Si le numéro commence par le code pays sans +
    if (cleanPhone.length > 10) {
      return '+' + cleanPhone;
    }
    
    // Ajoute le code pays par défaut (Sénégal par défaut pour l'Afrique francophone)
    return countryCode + cleanPhone.replace(/^0/, '');
  }

  /**
   * Calcule les frais de transaction
   */
  static calculateTransactionFees(amount: number, currency: string): number {
    // Frais Flutterwave approximatifs pour l'Afrique francophone
    const feeRates = {
      'XOF': 0.029, // 2.9% - Franc CFA BCEAO
      'XAF': 0.029, // 2.9% - Franc CFA BEAC
      'MAD': 0.035, // 3.5% - Dirham Marocain
      'DZD': 0.035, // 3.5% - Dinar Algérien
      'TND': 0.035, // 3.5% - Dinar Tunisien
      'EUR': 0.039, // 3.9% - Euro
      'USD': 0.039, // 3.9% - Dollar US
      'default': 0.029
    };

    const rate = feeRates[currency as keyof typeof feeRates] || feeRates.default;
    return Math.round(amount * rate);
  }

  /**
   * Vérifie le statut d'un paiement
   */
  static async verifyPayment(transactionId: string): Promise<{ status: string; data: { id: string; status: string; amount: number; currency: string } }> {
    try {
      const response = await apiClient.post<PaymentVerificationResponse>('/payments/verify', {
        transactionId
      });

      return {
        status: 'success',
        data: {
          id: response.transactionId,
          status: response.status ?? 'pending',
          amount: 0,
          currency: 'XOF'
        }
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde un enregistrement de paiement
   */
  static createPaymentRecord(
    userId: string,
    amount: number,
    currency: string,
    phoneNumber: string,
    description: string,
    transactionRef: string,
    projectId?: string
  ): Omit<PaymentRecord, 'id'> {
    return {
      userId,
      projectId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'mobile_money',
      provider: 'flutterwave',
      transactionRef,
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      description,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        subscriptionType: 'monthly',
        features: []
      }
    };
  }

  static async initiatePayment(payload: PaymentInitiationPayload): Promise<PaymentInitiationResponse> {
    try {
      const response = await apiClient.post<PaymentInitiationResponse>('/payments/initiate', payload);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      throw error;
    }
  }
}

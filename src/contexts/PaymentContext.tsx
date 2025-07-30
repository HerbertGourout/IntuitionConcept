import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { PaymentRecord } from '../services/PaymentService';
import { useAuth } from './AuthContext';

interface PaymentContextType {
  payments: PaymentRecord[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createPayment: (paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePaymentStatus: (paymentId: string, status: PaymentRecord['status'], flutterwaveRef?: string) => Promise<void>;
  getUserPayments: () => Promise<PaymentRecord[]>;
  getProjectPayments: (projectId: string) => Promise<PaymentRecord[]>;
  
  // Utilitaires
  calculateMonthlyRevenue: () => number;
  getPaymentStats: () => {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    totalAmount: number;
  };
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Crée un nouveau paiement dans Firestore
   */
  const createPayment = useCallback(async (paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setIsLoading(true);
    setError(null);

    try {
      const paymentRecord: Omit<PaymentRecord, 'id'> = {
        ...paymentData,
        userId: user.uid,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
      
      // Mettre à jour l'état local
      const newPayment: PaymentRecord = {
        ...paymentRecord,
        id: docRef.id,
      };
      
      setPayments(prev => [newPayment, ...prev]);
      
      console.log('✅ Paiement créé avec succès:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ Erreur lors de la création du paiement:', err);
      setError('Erreur lors de la création du paiement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Met à jour le statut d'un paiement
   */
  const updatePaymentStatus = useCallback(async (
    paymentId: string, 
    status: PaymentRecord['status'], 
    flutterwaveRef?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (flutterwaveRef) {
        updateData.flutterwaveRef = flutterwaveRef;
      }

      await updateDoc(paymentRef, updateData);

      // Mettre à jour l'état local
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status, flutterwaveRef, updatedAt: new Date() as any }
          : payment
      ));

      console.log('✅ Statut du paiement mis à jour:', paymentId, status);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du paiement:', err);
      setError('Erreur lors de la mise à jour du paiement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère tous les paiements de l'utilisateur connecté
   */
  const getUserPayments = useCallback(async (): Promise<PaymentRecord[]> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setIsLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userPayments: PaymentRecord[] = [];

      querySnapshot.forEach((doc) => {
        userPayments.push({
          id: doc.id,
          ...doc.data()
        } as PaymentRecord);
      });

      setPayments(userPayments);
      console.log('✅ Paiements utilisateur chargés:', userPayments.length);
      return userPayments;
    } catch (err) {
      console.error('❌ Erreur lors du chargement des paiements:', err);
      setError('Erreur lors du chargement des paiements');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Récupère tous les paiements d'un projet
   */
  const getProjectPayments = useCallback(async (projectId: string): Promise<PaymentRecord[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'payments'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projectPayments: PaymentRecord[] = [];

      querySnapshot.forEach((doc) => {
        projectPayments.push({
          id: doc.id,
          ...doc.data()
        } as PaymentRecord);
      });

      console.log('✅ Paiements du projet chargés:', projectPayments.length);
      return projectPayments;
    } catch (err) {
      console.error('❌ Erreur lors du chargement des paiements du projet:', err);
      setError('Erreur lors du chargement des paiements du projet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calcule le chiffre d'affaires mensuel
   */
  const calculateMonthlyRevenue = useCallback((): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments
      .filter(payment => {
        if (payment.status !== 'successful') return false;
        
        const paymentDate = payment.createdAt instanceof Date 
          ? payment.createdAt 
          : new Date(payment.createdAt.seconds * 1000);
        
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((total, payment) => total + payment.amount, 0);
  }, [payments]);

  /**
   * Calcule les statistiques des paiements
   */
  const getPaymentStats = useCallback(() => {
    const stats = payments.reduce((acc, payment) => {
      acc.total++;
      acc[payment.status]++;
      
      if (payment.status === 'successful') {
        acc.totalAmount += payment.amount;
      }
      
      return acc;
    }, {
      total: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0
    });

    return {
      total: stats.total,
      successful: stats.successful,
      pending: stats.pending,
      failed: stats.failed + stats.cancelled,
      totalAmount: stats.totalAmount
    };
  }, [payments]);

  const value: PaymentContextType = {
    payments,
    isLoading,
    error,
    createPayment,
    updatePaymentStatus,
    getUserPayments,
    getProjectPayments,
    calculateMonthlyRevenue,
    getPaymentStats,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de paiement
 */
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;

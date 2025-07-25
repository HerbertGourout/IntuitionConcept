import { useState, useEffect } from 'react';
import CurrencyService, { CurrencySettings } from '../services/currencyService';

export const useCurrency = (userId?: string) => {
  const [currency, setCurrency] = useState<CurrencySettings>({
    code: 'XOF',
    symbol: 'FCFA',
    name: 'Franc CFA',
    position: 'after'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const userCurrency = await CurrencyService.getDefaultCurrency(userId);
        setCurrency(userCurrency);
      } catch (error) {
        console.warn('Erreur lors du chargement de la devise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrency();
  }, [userId]);

  const formatAmount = (amount: number): string => {
    return CurrencyService.formatAmount(amount, currency);
  };

  const formatAmountAsync = async (amount: number): Promise<string> => {
    return CurrencyService.formatAmountWithUserCurrency(amount, userId);
  };

  return {
    currency,
    loading,
    formatAmount,
    formatAmountAsync,
    setCurrency
  };
};

export default useCurrency;

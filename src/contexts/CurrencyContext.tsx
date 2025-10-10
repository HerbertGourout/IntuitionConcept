import React, { createContext, useContext, useMemo } from 'react';

interface CurrencyContextProps {
  currency: string; // ex: 'XOF'
  locale: string;   // ex: 'fr-FR'
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps>({
  currency: 'XOF',
  locale: 'fr-FR',
  formatAmount: (amount: number) => `${(amount || 0).toLocaleString('fr-FR')} XOF`,
});

export const CurrencyProvider: React.FC<{ currency?: string; locale?: string; children: React.ReactNode }> = ({ currency = 'XOF', locale = 'fr-FR', children }) => {
  const formatAmount = useMemo(() => (amount: number) => {
    // Protection contre les valeurs undefined/null
    const safeAmount = amount || 0;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  }, [currency, locale]);

  const value = useMemo(() => ({ currency, locale, formatAmount }), [currency, locale, formatAmount]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);

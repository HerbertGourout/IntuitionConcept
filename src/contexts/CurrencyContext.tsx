import React, { createContext, useContext, useMemo } from 'react';

interface CurrencyContextProps {
  currency: string; // ex: 'XOF'
  locale: string;   // ex: 'fr-FR'
}

const CurrencyContext = createContext<CurrencyContextProps>({
  currency: 'XOF',
  locale: 'fr-FR',
});

export const CurrencyProvider: React.FC<{ currency?: string; locale?: string; children: React.ReactNode }> = ({ currency = 'XOF', locale = 'fr-FR', children }) => {
  const value = useMemo(() => ({ currency, locale }), [currency, locale]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);

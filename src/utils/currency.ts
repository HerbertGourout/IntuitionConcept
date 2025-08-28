// Utilitaire global pour le formatage des montants selon la devise du projet/utilisateur
import { useCallback } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

export function formatCurrency(amount: number, currency: string = 'XOF', locale: string = 'fr-FR') {
  return amount.toLocaleString(locale, { style: 'currency', currency });
}

export function safeFormatCurrency(amount: number, currency: string = 'XOF', locale: string = 'fr-FR') {
  try {
    return amount.toLocaleString(locale, { style: 'currency', currency });
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

// Hook React pour formatter dynamiquement selon le contexte
export function useFormatCurrency() {
  // Appel inconditionnel d'un hook React pour respecter les règles des hooks
  const { currency, locale } = useCurrency();
  // Mémoïse la fonction de formatage en fonction de la devise et de la locale courantes
  return useCallback(
    (amount: number) => formatCurrency(amount, currency, locale),
    [currency, locale]
  );
}

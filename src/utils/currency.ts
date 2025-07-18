// Utilitaire global pour le formatage des montants selon la devise du projet/utilisateur
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
  const { currency, locale } = useCurrency ? useCurrency() : { currency: 'XOF', locale: 'fr-FR' };
  return (amount: number) => formatCurrency(amount, currency, locale);
}

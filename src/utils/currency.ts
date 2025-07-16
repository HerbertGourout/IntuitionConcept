// Utilitaire global pour le formatage des montants selon la devise du projet/utilisateur
export function formatCurrency(amount: number, currency: string = 'XOF', locale: string = 'fr-FR') {
  return amount.toLocaleString(locale, { style: 'currency', currency });
}

// Version avec fallback si la devise n'est pas supportée par toLocaleString
export function safeFormatCurrency(amount: number, currency: string = 'XOF', locale: string = 'fr-FR') {
  try {
    return amount.toLocaleString(locale, { style: 'currency', currency });
  } catch {
    // Fallback: simple formatage
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

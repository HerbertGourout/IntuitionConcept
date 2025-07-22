import UserSettingsService from './userSettingsService';

export interface CurrencySettings {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

export const CURRENCIES: Record<string, CurrencySettings> = {
  'XOF': {
    code: 'XOF',
    symbol: 'FCFA',
    name: 'Franc CFA',
    position: 'after'
  },
  'EUR': {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'after'
  },
  'USD': {
    code: 'USD',
    symbol: '$',
    name: 'Dollar US',
    position: 'before'
  },
  'GBP': {
    code: 'GBP',
    symbol: '£',
    name: 'Livre Sterling',
    position: 'before'
  },
  'MAD': {
    code: 'MAD',
    symbol: 'DH',
    name: 'Dirham Marocain',
    position: 'after'
  }
};

export class CurrencyService {
  private static defaultCurrency: CurrencySettings = CURRENCIES['XOF'];

  // Obtenir la monnaie par défaut depuis les paramètres utilisateur
  static async getDefaultCurrency(userId?: string): Promise<CurrencySettings> {
    if (!userId) {
      return this.defaultCurrency;
    }

    try {
      const settings = await UserSettingsService.getUserSettings(userId);
      const currencyCode = settings?.preferences?.defaultCurrency || 'XOF';
      return CURRENCIES[currencyCode] || this.defaultCurrency;
    } catch (error) {
      console.warn('Erreur lors de la récupération de la monnaie par défaut:', error);
      return this.defaultCurrency;
    }
  }

  // Formater un montant avec la monnaie par défaut
  static formatAmount(amount: number, currency?: CurrencySettings): string {
    const curr = currency || this.defaultCurrency;
    const formattedAmount = amount.toLocaleString('fr-FR');
    
    return curr.position === 'before' 
      ? `${curr.symbol} ${formattedAmount}`
      : `${formattedAmount} ${curr.symbol}`;
  }

  // Formater un montant avec la monnaie depuis les paramètres utilisateur
  static async formatAmountWithUserCurrency(amount: number, userId?: string): Promise<string> {
    const currency = await this.getDefaultCurrency(userId);
    return this.formatAmount(amount, currency);
  }

  // Définir la monnaie par défaut dans les paramètres utilisateur
  static async setDefaultCurrency(userId: string, currencyCode: string): Promise<void> {
    if (!CURRENCIES[currencyCode]) {
      throw new Error(`Monnaie non supportée: ${currencyCode}`);
    }

    try {
      await UserSettingsService.updateUserSettings(userId, {
        preferences: {
          defaultCurrency: currencyCode
        }
      });
    } catch (error) {
      console.error('Erreur lors de la définition de la monnaie par défaut:', error);
      throw error;
    }
  }

  // Obtenir toutes les monnaies disponibles
  static getAllCurrencies(): CurrencySettings[] {
    return Object.values(CURRENCIES);
  }
}

export default CurrencyService;

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
    symbol: 'FCFA',
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
      const currentSettings = await UserSettingsService.getUserSettings(userId);

      // Fournir des valeurs par défaut pour les préférences si elles n'existent pas
      const existingPrefs = currentSettings?.preferences || {
        defaultView: 'dashboard',
        autoSave: true,
        compactMode: false,
      };

      const updatedPreferences = {
        ...existingPrefs,
        defaultCurrency: currencyCode,
      };

      // Construire l'objet de paramètres complet à mettre à jour
      const settingsToUpdate = {
        ...(currentSettings || {}),
        preferences: updatedPreferences,
      };

      // Forcer le type pour correspondre à ce que attend updateUserSettings
      await UserSettingsService.updateUserSettings(userId, settingsToUpdate as any);

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

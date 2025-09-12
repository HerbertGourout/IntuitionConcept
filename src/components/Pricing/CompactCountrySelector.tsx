import React from 'react';
import { Select, Card, Badge } from 'antd';
import { Globe, CreditCard, Smartphone } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'maghreb';
  mobileMoneyProviders: string[];
}

const SUPPORTED_COUNTRIES: Country[] = [
  // Afrique de l'Ouest (BCEAO - XOF)
  { code: 'SN', name: 'Sénégal', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇸🇳', region: 'west', mobileMoneyProviders: ['Orange Money', 'Free Money', 'Wave'] },
  { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇨🇮', region: 'west', mobileMoneyProviders: ['Orange Money', 'MTN Money', 'Moov Money'] },
  { code: 'ML', name: 'Mali', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇲🇱', region: 'west', mobileMoneyProviders: ['Orange Money', 'Airtel Money'] },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇧🇫', region: 'west', mobileMoneyProviders: ['Orange Money', 'Airtel Money'] },
  { code: 'NE', name: 'Niger', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇳🇪', region: 'west', mobileMoneyProviders: ['Orange Money', 'Airtel Money'] },
  { code: 'TG', name: 'Togo', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇹🇬', region: 'west', mobileMoneyProviders: ['Moov Money', 'T-Money'] },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇧🇯', region: 'west', mobileMoneyProviders: ['MTN Money', 'Moov Money'] },
  { code: 'GW', name: 'Guinée-Bissau', currency: 'XOF', currencySymbol: 'FCFA', flag: '🇬🇼', region: 'west', mobileMoneyProviders: ['Orange Money'] },

  // Afrique Centrale (BEAC - XAF)
  { code: 'CM', name: 'Cameroun', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇨🇲', region: 'central', mobileMoneyProviders: ['Orange Money', 'MTN Money'] },
  { code: 'GA', name: 'Gabon', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇬🇦', region: 'central', mobileMoneyProviders: ['Airtel Money', 'Moov Money'] },
  { code: 'TD', name: 'Tchad', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇹🇩', region: 'central', mobileMoneyProviders: ['Airtel Money', 'Tigo Cash'] },
  { code: 'CF', name: 'République Centrafricaine', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇨🇫', region: 'central', mobileMoneyProviders: ['Orange Money'] },

  // Maghreb
  { code: 'MA', name: 'Maroc', currency: 'MAD', currencySymbol: 'DH', flag: '🇲🇦', region: 'maghreb', mobileMoneyProviders: ['Orange Money', 'inwi money'] },
  { code: 'DZ', name: 'Algérie', currency: 'DZD', currencySymbol: 'DA', flag: '🇩🇿', region: 'maghreb', mobileMoneyProviders: ['Mobilis Money', 'Djezzy Cash'] },
  { code: 'TN', name: 'Tunisie', currency: 'TND', currencySymbol: 'DT', flag: '🇹🇳', region: 'maghreb', mobileMoneyProviders: ['Orange Money', 'Ooredoo Money'] }
];

const REGION_LABELS = {
  west: 'Afrique de l\'Ouest (BCEAO)',
  central: 'Afrique Centrale (BEAC)',
  maghreb: 'Maghreb'
};


interface CompactCountrySelectorProps {
  onCountrySelect: (country: Country) => void;
  selectedCountry?: Country;
}

const CompactCountrySelector: React.FC<CompactCountrySelectorProps> = ({
  onCountrySelect,
  selectedCountry
}) => {

  // Grouper les pays par région pour le dropdown
  const countryOptions = SUPPORTED_COUNTRIES.map(country => ({
    value: country.code,
    label: (
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{country.flag}</span>
          <span className="font-medium">{country.name}</span>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>{country.currencySymbol}</div>
          <div className="text-xs">{country.currency}</div>
        </div>
      </div>
    ),
    country
  }));

  const handleCountryChange = (countryCode: string) => {
    const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      onCountrySelect(country);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-700">Sélectionnez votre marché</span>
          <Badge count={SUPPORTED_COUNTRIES.length} className="bg-blue-600" />
        </div>
        
        <Select
          placeholder="Choisissez votre pays pour voir les tarifs locaux"
          value={selectedCountry?.code}
          onChange={handleCountryChange}
          className="w-full"
          size="large"
          showSearch
          filterOption={(input, option) => {
            if (!option?.country) return false;
            return option.country.name.toLowerCase().includes(input.toLowerCase()) ||
                   option.country.currency.toLowerCase().includes(input.toLowerCase());
          }}
          options={countryOptions}
          optionRender={(option) => (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.data.country.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{option.data.country.name}</div>
                  <div className="text-xs text-gray-500">
                    {option.data.country.mobileMoneyProviders.slice(0, 2).join(', ')}
                    {option.data.country.mobileMoneyProviders.length > 2 && '...'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{option.data.country.currencySymbol}</div>
                <div className="text-xs text-gray-500">{option.data.country.currency}</div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Informations du marché sélectionné */}
      {selectedCountry && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{selectedCountry.name}</h3>
              <div className="text-sm text-gray-600 mb-2">
                {REGION_LABELS[selectedCountry.region]}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{selectedCountry.currencySymbol}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4 text-orange-600" />
                  <span>{selectedCountry.mobileMoneyProviders.length} moyens Mobile Money</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <strong>Paiements mobiles :</strong> {selectedCountry.mobileMoneyProviders.join(', ')}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CompactCountrySelector;

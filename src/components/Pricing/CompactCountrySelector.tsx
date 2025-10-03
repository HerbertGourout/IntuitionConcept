import React from 'react';
import { Select, Badge } from 'antd';
import { Globe, CreditCard, Smartphone } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'east' | 'south' | 'maghreb';
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
  { code: 'GN', name: 'Guinée', currency: 'GNF', currencySymbol: 'GNF', flag: '🇬🇳', region: 'west', mobileMoneyProviders: ['Orange Money', 'MTN Money'] },
  { code: 'LR', name: 'Libéria', currency: 'LRD', currencySymbol: 'L$', flag: '🇱🇷', region: 'west', mobileMoneyProviders: ['Orange Money', 'Lonestar Cell MTN'] },
  { code: 'SL', name: 'Sierra Leone', currency: 'SLL', currencySymbol: 'Le', flag: '🇸🇱', region: 'west', mobileMoneyProviders: ['Orange Money', 'Airtel Money'] },

  // Afrique Centrale (BEAC - XAF)
  { code: 'CM', name: 'Cameroun', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇨🇲', region: 'central', mobileMoneyProviders: ['Orange Money', 'MTN Money'] },
  { code: 'GA', name: 'Gabon', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇬🇦', region: 'central', mobileMoneyProviders: ['Airtel Money', 'Moov Money'] },
  { code: 'TD', name: 'Tchad', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇹🇩', region: 'central', mobileMoneyProviders: ['Airtel Money', 'Tigo Cash'] },
  { code: 'CF', name: 'République Centrafricaine', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇨🇫', region: 'central', mobileMoneyProviders: ['Orange Money'] },
  { code: 'CG', name: 'République du Congo', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇨🇬', region: 'central', mobileMoneyProviders: ['Airtel Money', 'MTN Money'] },
  { code: 'CD', name: 'République Démocratique du Congo', currency: 'CDF', currencySymbol: 'FC', flag: '🇨🇩', region: 'central', mobileMoneyProviders: ['Orange Money', 'Vodacom M-Pesa', 'Airtel Money'] },
  { code: 'GQ', name: 'Guinée Équatoriale', currency: 'XAF', currencySymbol: 'FCFA', flag: '🇬🇶', region: 'central', mobileMoneyProviders: ['Orange Money'] },

  // Afrique de l'Est
  { code: 'KE', name: 'Kenya', currency: 'KES', currencySymbol: 'KSh', flag: '🇰🇪', region: 'east', mobileMoneyProviders: ['M-Pesa', 'Airtel Money', 'T-Kash'] },
  { code: 'TZ', name: 'Tanzanie', currency: 'TZS', currencySymbol: 'TSh', flag: '🇹🇿', region: 'east', mobileMoneyProviders: ['M-Pesa', 'Airtel Money', 'Tigo Pesa'] },
  { code: 'UG', name: 'Ouganda', currency: 'UGX', currencySymbol: 'USh', flag: '🇺🇬', region: 'east', mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'] },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', currencySymbol: 'RF', flag: '🇷🇼', region: 'east', mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'] },
  { code: 'BI', name: 'Burundi', currency: 'BIF', currencySymbol: 'FBu', flag: '🇧🇮', region: 'east', mobileMoneyProviders: ['Ecocash', 'U-Money'] },
  { code: 'ET', name: 'Éthiopie', currency: 'ETB', currencySymbol: 'Br', flag: '🇪🇹', region: 'east', mobileMoneyProviders: ['M-Birr', 'HelloCash'] },

  // Afrique Australe
  { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', currencySymbol: 'R', flag: '🇿🇦', region: 'south', mobileMoneyProviders: ['FNB eWallet', 'Nedbank Send-iMali'] },
  { code: 'ZW', name: 'Zimbabwe', currency: 'USD', currencySymbol: '$', flag: '🇿🇼', region: 'south', mobileMoneyProviders: ['EcoCash', 'OneMoney'] },
  { code: 'ZM', name: 'Zambie', currency: 'ZMW', currencySymbol: 'ZK', flag: '🇿🇲', region: 'south', mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'] },
  { code: 'MW', name: 'Malawi', currency: 'MWK', currencySymbol: 'MK', flag: '🇲🇼', region: 'south', mobileMoneyProviders: ['TNM Mpamba', 'Airtel Money'] },
  { code: 'MZ', name: 'Mozambique', currency: 'MZN', currencySymbol: 'MT', flag: '🇲🇿', region: 'south', mobileMoneyProviders: ['M-Pesa', 'Mkesh'] },
  { code: 'BW', name: 'Botswana', currency: 'BWP', currencySymbol: 'P', flag: '🇧🇼', region: 'south', mobileMoneyProviders: ['Orange Money', 'Mascom MyZaka'] },
  { code: 'NA', name: 'Namibie', currency: 'NAD', currencySymbol: 'N$', flag: '🇳🇦', region: 'south', mobileMoneyProviders: ['MTC Mobile Money'] },
  { code: 'SZ', name: 'Eswatini', currency: 'SZL', currencySymbol: 'E', flag: '🇸🇿', region: 'south', mobileMoneyProviders: ['MTN Mobile Money'] },
  { code: 'LS', name: 'Lesotho', currency: 'LSL', currencySymbol: 'M', flag: '🇱🇸', region: 'south', mobileMoneyProviders: ['Vodacom M-Pesa', 'EcoCash'] },

  // Maghreb
  { code: 'MA', name: 'Maroc', currency: 'MAD', currencySymbol: 'DH', flag: '🇲🇦', region: 'maghreb', mobileMoneyProviders: ['Orange Money', 'inwi money'] },
  { code: 'DZ', name: 'Algérie', currency: 'DZD', currencySymbol: 'DA', flag: '🇩🇿', region: 'maghreb', mobileMoneyProviders: ['Mobilis Money', 'Djezzy Cash'] },
  { code: 'TN', name: 'Tunisie', currency: 'TND', currencySymbol: 'DT', flag: '🇹🇳', region: 'maghreb', mobileMoneyProviders: ['Orange Money', 'Ooredoo Money'] },
  { code: 'LY', name: 'Libye', currency: 'LYD', currencySymbol: 'LD', flag: '🇱🇾', region: 'maghreb', mobileMoneyProviders: ['Libyana Money', 'Al Madar Cash'] },
  { code: 'EG', name: 'Égypte', currency: 'EGP', currencySymbol: 'E£', flag: '🇪🇬', region: 'maghreb', mobileMoneyProviders: ['Orange Cash', 'Vodafone Cash', 'Etisalat Cash'] }
];

const REGION_LABELS = {
  west: 'Afrique de l\'Ouest (BCEAO)',
  central: 'Afrique Centrale (BEAC)',
  east: 'Afrique de l\'Est',
  south: 'Afrique Australe',
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
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-700">Sélectionnez votre marché</span>
          <span className="text-red-500 font-medium">*</span>
          <Badge count={SUPPORTED_COUNTRIES.length} className="bg-blue-600" />
        </div>
        {!selectedCountry && (
          <div className="text-sm text-red-600 mb-2">
            ⚠️ La sélection du pays est obligatoire pour afficher les tarifs et procéder au paiement
          </div>
        )}
        
        <Select
          placeholder="⚠️ Sélection obligatoire — Marché par défaut: République du Congo (Brazzaville)"
          value={selectedCountry?.code}
          onChange={handleCountryChange}
          className="w-full"
          size="large"
          showSearch
          allowClear={false}
          status={!selectedCountry ? 'error' : undefined}
          filterOption={(input, option) => {
            if (!option?.country) return false;
            const searchTerm = input.toLowerCase();
            return option.country.name.toLowerCase().includes(searchTerm) ||
                   option.country.currency.toLowerCase().includes(searchTerm) ||
                   option.country.currencySymbol.toLowerCase().includes(searchTerm) ||
                   option.country.code.toLowerCase().includes(searchTerm);
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
        <div className="glass-card p-4 md:p-6 rounded-xl">
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
        </div>
      )}
    </div>
  );
};

export default CompactCountrySelector;

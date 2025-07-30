import React, { useState } from 'react';
import { MapPin, Smartphone, CreditCard } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'maghreb';
  mobileMoneyProviders: string[];
  phonePrefix: string;
}

interface CountrySelectorProps {
  onCountrySelect: (country: Country) => void;
  selectedCountry?: Country;
}

const FRANCOPHONE_COUNTRIES: Country[] = [
  // Afrique de l'Ouest
  {
    code: 'SN',
    name: 'Sénégal',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇸🇳',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'Free Money', 'Wave'],
    phonePrefix: '+221'
  },
  {
    code: 'CI',
    name: 'Côte d\'Ivoire',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇨🇮',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'MTN Money', 'Moov Money'],
    phonePrefix: '+225'
  },
  {
    code: 'ML',
    name: 'Mali',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇲🇱',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'Malitel Money'],
    phonePrefix: '+223'
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇧🇫',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'Coris Money'],
    phonePrefix: '+226'
  },
  {
    code: 'NE',
    name: 'Niger',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇳🇪',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'Airtel Money'],
    phonePrefix: '+227'
  },
  {
    code: 'GN',
    name: 'Guinée',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇬🇳',
    region: 'west',
    mobileMoneyProviders: ['Orange Money', 'MTN Money'],
    phonePrefix: '+224'
  },
  {
    code: 'BJ',
    name: 'Bénin',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇧🇯',
    region: 'west',
    mobileMoneyProviders: ['MTN Money', 'Moov Money'],
    phonePrefix: '+229'
  },
  {
    code: 'TG',
    name: 'Togo',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    flag: '🇹🇬',
    region: 'west',
    mobileMoneyProviders: ['Togocel Money', 'Moov Money'],
    phonePrefix: '+228'
  },

  // Afrique centrale
  {
    code: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇨🇲',
    region: 'central',
    mobileMoneyProviders: ['Orange Money', 'MTN Money'],
    phonePrefix: '+237'
  },
  {
    code: 'GA',
    name: 'Gabon',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇬🇦',
    region: 'central',
    mobileMoneyProviders: ['Airtel Money', 'Libertis Money'],
    phonePrefix: '+241'
  },
  {
    code: 'CF',
    name: 'République centrafricaine',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇨🇫',
    region: 'central',
    mobileMoneyProviders: ['Orange Money', 'Telecel Money'],
    phonePrefix: '+236'
  },
  {
    code: 'TD',
    name: 'Tchad',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇹🇩',
    region: 'central',
    mobileMoneyProviders: ['Airtel Money', 'Tigo Money'],
    phonePrefix: '+235'
  },
  {
    code: 'CD',
    name: 'République démocratique du Congo',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇨🇩',
    region: 'central',
    mobileMoneyProviders: ['Orange Money', 'Airtel Money'],
    phonePrefix: '+243'
  },
  {
    code: 'CG',
    name: 'République du Congo',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    flag: '🇨🇬',
    region: 'central',
    mobileMoneyProviders: ['Airtel Money', 'MTN Money'],
    phonePrefix: '+242'
  },

  // Maghreb
  {
    code: 'MA',
    name: 'Maroc',
    currency: 'MAD',
    currencySymbol: 'DH',
    flag: '🇲🇦',
    region: 'maghreb',
    mobileMoneyProviders: ['Orange Money', 'inwi Money', 'Maroc Telecom Cash'],
    phonePrefix: '+212'
  },
  {
    code: 'DZ',
    name: 'Algérie',
    currency: 'DZD',
    currencySymbol: 'DA',
    flag: '🇩🇿',
    region: 'maghreb',
    mobileMoneyProviders: ['Mobilis Money', 'Djezzy Cash'],
    phonePrefix: '+213'
  },
  {
    code: 'TN',
    name: 'Tunisie',
    currency: 'TND',
    currencySymbol: 'DT',
    flag: '🇹🇳',
    region: 'maghreb',
    mobileMoneyProviders: ['Orange Money', 'Ooredoo Money'],
    phonePrefix: '+216'
  }
];

const REGION_NAMES = {
  west: 'Afrique de l\'Ouest',
  central: 'Afrique centrale',
  maghreb: 'Maghreb'
};

const REGION_COLORS = {
  west: 'bg-green-50 border-green-200',
  central: 'bg-blue-50 border-blue-200',
  maghreb: 'bg-orange-50 border-orange-200'
};

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  onCountrySelect,
  selectedCountry
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'west' | 'central' | 'maghreb' | 'all'>('all');

  const filteredCountries = selectedRegion === 'all' 
    ? FRANCOPHONE_COUNTRIES 
    : FRANCOPHONE_COUNTRIES.filter(country => country.region === selectedRegion);

  const groupedCountries = filteredCountries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Sélectionnez votre pays</h2>
        </div>
        <p className="text-gray-600">
          Choisissez votre pays pour une expérience de paiement optimisée
        </p>
      </div>

      {/* Filtres par région */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedRegion('all')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedRegion === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous les pays
        </button>
        {Object.entries(REGION_NAMES).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setSelectedRegion(key as 'west' | 'central' | 'maghreb')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedRegion === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Liste des pays par région */}
      <div className="space-y-8">
        {Object.entries(groupedCountries).map(([region, countries]) => (
          <div key={region}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                region === 'west' ? 'bg-green-500' :
                region === 'central' ? 'bg-blue-500' : 'bg-orange-500'
              }`}></span>
              {REGION_NAMES[region as keyof typeof REGION_NAMES]}
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => onCountrySelect(country)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    selectedCountry?.code === country.code
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : `${REGION_COLORS[country.region]} hover:border-gray-300`
                  }`}
                >
                  {/* En-tête du pays */}
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{country.flag}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{country.name}</h4>
                      <p className="text-sm text-gray-600">
                        {country.phonePrefix} • {country.currencySymbol}
                      </p>
                    </div>
                  </div>

                  {/* Méthodes de paiement */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-medium">Mobile Money:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {country.mobileMoneyProviders.slice(0, 2).map((provider) => (
                        <span
                          key={provider}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          {provider}
                        </span>
                      ))}
                      {country.mobileMoneyProviders.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{country.mobileMoneyProviders.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700 mt-2">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Cartes bancaires acceptées</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pays sélectionné */}
      {selectedCountry && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{selectedCountry.flag}</span>
            <div>
              <h4 className="font-semibold text-blue-900">
                Pays sélectionné: {selectedCountry.name}
              </h4>
              <p className="text-sm text-blue-700">
                Devise: {selectedCountry.currency} ({selectedCountry.currencySymbol}) • 
                Téléphone: {selectedCountry.phonePrefix}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;

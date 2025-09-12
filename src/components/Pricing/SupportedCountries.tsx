import React, { useState } from 'react';
import { Modal, Button, Input, Badge } from 'antd';
import { Globe, Search, MapPin } from 'lucide-react';

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

const REGION_COLORS = {
  west: 'bg-orange-100 text-orange-800 border-orange-200',
  central: 'bg-green-100 text-green-800 border-green-200',
  maghreb: 'bg-blue-100 text-blue-800 border-blue-200'
};

interface SupportedCountriesProps {
  compact?: boolean;
  showButton?: boolean;
}

const SupportedCountries: React.FC<SupportedCountriesProps> = ({ 
  compact = true, 
  showButton = true 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = SUPPORTED_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCountries = filteredCountries.reduce((acc, country) => {
    if (!acc[country.region]) acc[country.region] = [];
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  if (compact && showButton) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="text-gray-700">Supporté dans</span>
          <Badge count={SUPPORTED_COUNTRIES.length} className="bg-blue-600">
            <Button 
              type="link" 
              onClick={() => setIsModalOpen(true)}
              className="p-0 h-auto text-blue-600 font-medium"
            >
              {SUPPORTED_COUNTRIES.length} pays
            </Button>
          </Badge>
        </div>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Pays supportés ({SUPPORTED_COUNTRIES.length})</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          ]}
          width={700}
        >
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un pays ou une devise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Pays groupés par région */}
            {Object.entries(groupedCountries).map(([region, countries]) => (
              <div key={region} className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${REGION_COLORS[region as keyof typeof REGION_COLORS]}`}>
                  <MapPin className="w-4 h-4" />
                  {REGION_LABELS[region as keyof typeof REGION_LABELS]}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{country.name}</div>
                        <div className="text-sm text-gray-600">
                          {country.currencySymbol} ({country.currency})
                        </div>
                        <div className="text-xs text-gray-500">
                          {country.mobileMoneyProviders.slice(0, 2).join(', ')}
                          {country.mobileMoneyProviders.length > 2 && '...'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredCountries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun pays trouvé pour "{searchTerm}"
              </div>
            )}
          </div>
        </Modal>
      </>
    );
  }

  // Version non-compacte (affichage direct)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Pays supportés ({SUPPORTED_COUNTRIES.length})</h3>
      </div>

      {Object.entries(groupedCountries).map(([region, countries]) => (
        <div key={region} className="space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium border ${REGION_COLORS[region as keyof typeof REGION_COLORS]}`}>
            <MapPin className="w-4 h-4" />
            {REGION_LABELS[region as keyof typeof REGION_LABELS]}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{country.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{country.name}</div>
                  <div className="text-sm text-gray-600">
                    {country.currencySymbol} ({country.currency})
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {country.mobileMoneyProviders.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportedCountries;

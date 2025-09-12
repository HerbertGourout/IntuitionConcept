import React, { useState } from 'react';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';
import CompactCountrySelector from './CompactCountrySelector';
import SupportedCountries from './SupportedCountries';
import { DollarSign } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'maghreb';
  mobileMoneyProviders: string[];
}

const Pricing: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);

  return (
    <PageContainer className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <SectionHeader
          icon={<DollarSign className="w-7 h-7 text-blue-600" />}
          title="Tarifs"
          subtitle="Sélectionnez votre marché pour afficher les informations locales et pays supportés"
        />
      </div>

      {/* Sélecteur de pays / marché */}
      <div className="glass-card p-6 rounded-xl">
        <CompactCountrySelector
          selectedCountry={selectedCountry}
          onCountrySelect={(c) => setSelectedCountry(c)}
        />
      </div>

      {/* Pays supportés */}
      <div className="glass-card p-6 rounded-xl">
        <SupportedCountries compact={true} showButton={true} />
      </div>
    </PageContainer>
  );
};

export default Pricing;

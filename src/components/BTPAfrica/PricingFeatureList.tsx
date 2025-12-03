import React from 'react';
import TerrainCheck from './TerrainCheck';

interface PricingFeatureListProps {
  features: string[];
  /** Style minimaliste - juste couleur, pas d'icône */
  minimal?: boolean;
  /** Couleur accent */
  accentColor?: 'laterite' | 'tarp' | 'vegetation' | 'engin';
  className?: string;
}

/**
 * Liste de features pour pricing - style épuré sans icônes stock
 * Utilise couleur et typo au lieu de CheckCircle générique
 */
const PricingFeatureList: React.FC<PricingFeatureListProps> = ({
  features,
  minimal = false,
  accentColor = 'vegetation',
  className = '',
}) => {
  if (minimal) {
    // Version ultra-minimaliste : juste texte avec couleur
    return (
      <ul className={`space-y-2.5 ${className}`}>
        {features.map((feature, index) => (
          <li 
            key={index}
            className="text-gray-700 pl-4 border-l-2 border-[#4A7C59]/30 hover:border-[#4A7C59] transition-colors"
          >
            {feature}
          </li>
        ))}
      </ul>
    );
  }

  // Version avec check custom terrain
  return (
    <ul className={`space-y-3 ${className}`}>
      {features.map((feature, index) => (
        <li 
          key={index}
          className="flex items-start gap-3"
        >
          <TerrainCheck 
            variant="pencil" 
            color={accentColor} 
            size="sm" 
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
  );
};

export default PricingFeatureList;

import React from 'react';
import { motion } from 'framer-motion';
import TerrainCheck from './TerrainCheck';

interface Feature {
  title: string;
  description?: string;
}

interface FeatureBlockProps {
  /** Titre du bloc (avec icône header unique si fournie) */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Liste des features - SANS icône par item */
  features: Feature[];
  /** Image ou icône header unique pour le bloc */
  headerImage?: string;
  /** Style de liste */
  listStyle?: 'none' | 'dot' | 'dash' | 'check' | 'number';
  /** Couleur accent */
  accentColor?: 'laterite' | 'tarp' | 'vegetation' | 'engin';
  /** Variante visuelle */
  variant?: 'default' | 'card' | 'minimal';
  /** Colonnes */
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * Bloc de features sans icônes répétitives
 * Une seule icône/image en header, liste simple avec couleur/typo
 */
const FeatureBlock: React.FC<FeatureBlockProps> = ({
  title,
  subtitle,
  features,
  headerImage,
  listStyle = 'dot',
  accentColor = 'laterite',
  variant = 'default',
  columns = 1,
  className = '',
}) => {
  const accentColors = {
    laterite: { bg: 'bg-[#C45C3E]/10', text: 'text-[#C45C3E]', border: 'border-[#C45C3E]' },
    tarp: { bg: 'bg-[#1E4B6E]/10', text: 'text-[#1E4B6E]', border: 'border-[#1E4B6E]' },
    vegetation: { bg: 'bg-[#4A7C59]/10', text: 'text-[#4A7C59]', border: 'border-[#4A7C59]' },
    engin: { bg: 'bg-[#E5A832]/10', text: 'text-[#E5A832]', border: 'border-[#E5A832]' },
  };

  const colors = accentColors[accentColor];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  const renderListMarker = (index: number) => {
    switch (listStyle) {
      case 'dot':
        return <TerrainCheck variant="dot" color={accentColor} size="sm" className="mr-3 mt-1.5 flex-shrink-0" />;
      case 'dash':
        return <TerrainCheck variant="dash" color={accentColor} size="sm" className="mr-3 mt-2 flex-shrink-0" />;
      case 'check':
        return <TerrainCheck variant="pencil" color={accentColor} size="sm" className="mr-3 mt-0.5 flex-shrink-0" />;
      case 'number':
        return (
          <span className={`mr-3 mt-0.5 flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} ${colors.text} text-xs font-bold flex items-center justify-center`}>
            {index + 1}
          </span>
        );
      default:
        return null;
    }
  };

  const containerClass = variant === 'card' 
    ? 'bg-white rounded-2xl shadow-lg p-6 md:p-8' 
    : variant === 'minimal'
    ? ''
    : 'py-6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${containerClass} ${className}`}
    >
      {/* Header avec image unique */}
      <div className="mb-6">
        {headerImage && (
          <div className="mb-4">
            <img 
              src={headerImage} 
              alt={title}
              className="w-16 h-16 object-contain"
            />
          </div>
        )}
        
        <h3 className={`text-xl md:text-2xl font-bold text-gray-900 ${colors.text.replace('text-', 'decoration-')} decoration-2 underline-offset-4`}>
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Liste sans icônes répétitives */}
      <ul className={`grid ${gridCols[columns]} gap-3`}>
        {features.map((feature, index) => (
          <li 
            key={index}
            className="flex items-start"
          >
            {renderListMarker(index)}
            <div>
              <span className="text-gray-900 font-medium">{feature.title}</span>
              {feature.description && (
                <p className="text-gray-600 text-sm mt-0.5">{feature.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default FeatureBlock;

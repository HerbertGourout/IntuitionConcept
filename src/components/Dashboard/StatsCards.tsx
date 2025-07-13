import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight } from 'lucide-react';

// Composant Tooltip simplifié en attendant de résoudre le problème d'import
const Tooltip = ({ content, children }: { content: React.ReactNode; children: React.ReactElement }) => (
  <div className="relative group inline-block">
    {children}
    <div className="invisible group-hover:visible absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {content}
    </div>
  </div>
);

// Définition des types
type ChangeType = 'increase' | 'decrease' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: ChangeType;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  tooltipContent?: string;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

// Composant de chargement du squelette
const StatCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-md dark:hover:border-gray-600 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700"></div>
    </div>
    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
  </div>
);

// Animation de la carte
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
  hover: {
    y: -5,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.98
  }
} as const;

// Composant StatCard avec gestion du chargement
const StatCardComponent: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'bg-blue-600',
  description,
  tooltipContent,
  onClick,
  className = '',
  isLoading = false
}) => {

  
  // Gestion du chargement
  if (isLoading) {
    return <StatCardSkeleton />;
  }
  // Couleurs et icônes en fonction du type de changement
  interface ChangeConfig {
    [key: string]: {
      icon: React.ReactNode;
      textColor: string;
      bgColor: string;
      borderColor: string;
      iconBg: string;
    };
  }

  const changeConfig: ChangeConfig = {
    increase: {
      icon: <TrendingUp className="w-4 h-4" />,
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-800/50'
    },
    decrease: {
      icon: <TrendingDown className="w-4 h-4" />,
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-800/50'
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      textColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-700/50'
    }
  };
  
  const { 
    icon: changeIcon, 
    textColor, 
    borderColor,
    iconBg
  } = changeConfig[changeType] || changeConfig.neutral;
  
  // Formater la valeur si c'est un nombre
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('fr-FR') 
    : value;
    
  // Formater le changement avec une valeur par défaut de 0 si undefined
  const formattedChange = Math.abs(change || 0);
  
  // Rendu de la carte
  const motionProps = {
    variants: cardVariants,
    initial: "hidden",
    animate: "visible",
    ...(onClick && { whileHover: "hover" }),
    onClick,
    className: `relative p-5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border ${borderColor} transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`,
  };

  return (
    <motion.div 
      {...motionProps}

      role={onClick ? 'button' : 'article'}
      aria-label={onClick ? `Voir les détails de ${title}` : title}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Badge de changement */}
      <div className="absolute top-4 right-4">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${textColor} ${iconBg}`}>
          {changeIcon}
          <span>{formattedChange}%</span>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="p-5">
        {/* Icône */}
        <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
          {icon}
        </div>
        
        {/* Valeur */}
        <div className="mb-1">
          <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {formattedValue}
          </span>
        </div>
        
        {/* Titre et info-bulle */}
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </h3>
          {tooltipContent && (
            <Tooltip content={tooltipContent}>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
                aria-label="Plus d'informations"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      
      {/* Indicateur d'action au survol */}
      {onClick && (
        <div className="px-5 pb-3">
          <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Voir plus</span>
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Création d'une version mémorisée du composant
const StatCard = React.memo(StatCardComponent);

// Export des composants
export { StatCard, StatCardSkeleton };

// Export des types
export type { ChangeType, StatCardProps };

export default StatCard;
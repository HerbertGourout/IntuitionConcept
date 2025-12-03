import React from 'react';
import { motion } from 'framer-motion';
interface TerrainCardProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor?: string;
  image?: string;
  annotation?: string;
  variant?: 'default' | 'polaroid' | 'postit' | 'worn';
  rotation?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Carte avec effet "terrain" - style authentique BTP
 * Variantes: polaroid, post-it, usé, défaut
 */
const TerrainCard: React.FC<TerrainCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = '#C45C3E',
  image,
  annotation,
  variant = 'default',
  rotation = 0,
  className = '',
  onClick,
}) => {
  const baseStyles = "relative overflow-hidden transition-all duration-300";
  
  const variantStyles = {
    default: `
      bg-white rounded-xl shadow-lg border border-gray-100
      hover:shadow-xl hover:-translate-y-1
    `,
    polaroid: `
      bg-white p-3 pb-12 shadow-xl
      hover:shadow-2xl
    `,
    postit: `
      bg-gradient-to-br from-yellow-200 to-yellow-300 p-5
      shadow-md
    `,
    worn: `
      bg-[#F5F0E8] rounded-lg shadow-md border border-gray-200
      hover:shadow-lg
    `,
  };

  const getRotation = () => {
    if (rotation !== 0) return rotation;
    if (variant === 'polaroid') return -2;
    if (variant === 'postit') return 1;
    return 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: getRotation() }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.02, 
        rotate: 0,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        transformOrigin: 'center center',
      }}
    >
      {/* Effet scotch pour polaroid */}
      {variant === 'polaroid' && (
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/80 shadow-sm z-10"
          style={{ transform: 'translateX(-50%) rotate(2deg)' }}
        />
      )}
      
      {/* Coin corné pour worn */}
      {variant === 'worn' && (
        <div 
          className="absolute top-0 right-0 w-8 h-8"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
          }}
        />
      )}
      
      {/* Image */}
      {image && (
        <div className={`${variant === 'polaroid' ? '' : 'rounded-t-xl'} overflow-hidden`}>
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover"
          />
          {/* Overlay texture */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
      
      {/* Contenu */}
      <div className={`${variant === 'polaroid' ? 'pt-3' : 'p-6'}`}>
        {/* Icône */}
        {Icon && !image && (
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="w-7 h-7" style={{ color: iconColor }} />
          </div>
        )}
        
        {/* Titre */}
        <h3 className={`font-bold text-gray-900 mb-2 ${variant === 'postit' ? 'font-handwritten text-xl' : 'text-lg'}`}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={`text-gray-600 text-sm leading-relaxed ${variant === 'postit' ? 'font-handwritten text-base' : ''}`}>
          {description}
        </p>
        
        {/* Annotation manuscrite */}
        {annotation && (
          <p 
            className="mt-4 text-[#C45C3E] font-handwritten text-lg"
            style={{ transform: 'rotate(-1deg)' }}
          >
            → {annotation}
          </p>
        )}
      </div>
      
      {/* Effet ombre portée post-it */}
      {variant === 'postit' && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))',
          }}
        />
      )}
    </motion.div>
  );
};

export default TerrainCard;

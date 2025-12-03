import React from 'react';
import { motion } from 'framer-motion';

interface AfricanPatternDividerProps {
  variant?: 'wax' | 'kente' | 'zellige' | 'chantier' | 'gradient';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * Séparateur avec motifs africains
 * Identité visuelle locale et authentique
 */
const AfricanPatternDivider: React.FC<AfricanPatternDividerProps> = ({
  variant = 'gradient',
  height = 'md',
  animated = true,
  className = '',
}) => {
  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-8',
  };

  const patterns = {
    // Gradient simple aux couleurs BTP Afrique
    gradient: (
      <div className={`w-full ${heights[height]} bg-gradient-to-r from-[#C45C3E] via-[#E5A832] to-[#1E4B6E]`} />
    ),
    
    // Pattern Wax géométrique
    wax: (
      <div 
        className={`w-full ${heights[height]}`}
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              #C45C3E 0px,
              #C45C3E 20px,
              #E5A832 20px,
              #E5A832 40px,
              #1E4B6E 40px,
              #1E4B6E 60px,
              #4A7C59 60px,
              #4A7C59 80px
            )
          `,
        }}
      />
    ),
    
    // Pattern Kente (Ghana)
    kente: (
      <div className={`w-full ${heights[height]} relative overflow-hidden`}>
        <div 
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                #C45C3E 0px,
                #C45C3E 2px,
                transparent 2px,
                transparent 4px
              ),
              repeating-linear-gradient(
                90deg,
                #E5A832 0px,
                #E5A832 20px,
                #1E4B6E 20px,
                #1E4B6E 40px,
                #4A7C59 40px,
                #4A7C59 60px,
                #C45C3E 60px,
                #C45C3E 80px
              )
            `,
          }}
        />
      </div>
    ),
    
    // Pattern Zellige (Maroc)
    zellige: (
      <div 
        className={`w-full ${heights[height]}`}
        style={{
          background: `
            radial-gradient(circle at 0% 50%, #1E4B6E 8px, transparent 8px),
            radial-gradient(circle at 100% 50%, #1E4B6E 8px, transparent 8px),
            radial-gradient(circle at 50% 0%, #C45C3E 8px, transparent 8px),
            radial-gradient(circle at 50% 100%, #C45C3E 8px, transparent 8px),
            linear-gradient(90deg, #E5A832, #D4956A)
          `,
          backgroundSize: '40px 100%, 40px 100%, 100% 40px, 100% 40px, 100% 100%',
        }}
      />
    ),
    
    // Pattern damier chantier
    chantier: (
      <div 
        className={`w-full ${heights[height]}`}
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              #E5A832 0px,
              #E5A832 20px,
              #1F2937 20px,
              #1F2937 40px
            )
          `,
        }}
      />
    ),
  };

  if (!animated) {
    return <div className={className}>{patterns[variant]}</div>;
  }

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`origin-left ${className}`}
    >
      {patterns[variant]}
    </motion.div>
  );
};

export default AfricanPatternDivider;

import React from 'react';
import { motion } from 'framer-motion';

interface TerrainCheckProps {
  variant?: 'pencil' | 'marker' | 'stamp' | 'dot' | 'dash';
  color?: 'laterite' | 'tarp' | 'vegetation' | 'engin' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * Check mark custom style "terrain" - remplace les CheckCircle génériques
 * Variantes: crayon, feutre, tampon, point, tiret
 */
const TerrainCheck: React.FC<TerrainCheckProps> = ({
  variant = 'pencil',
  color = 'laterite',
  size = 'md',
  animated = false,
  className = '',
}) => {
  const colors = {
    laterite: '#C45C3E',
    tarp: '#1E4B6E',
    vegetation: '#4A7C59',
    engin: '#E5A832',
    gray: '#6B7280',
  };

  const sizes = {
    sm: { width: 14, height: 14, stroke: 2 },
    md: { width: 18, height: 18, stroke: 2.5 },
    lg: { width: 24, height: 24, stroke: 3 },
  };

  const { width, height, stroke } = sizes[size];
  const fillColor = colors[color];

  const Wrapper = animated ? motion.span : 'span';
  const wrapperProps = animated ? {
    initial: { scale: 0, rotate: -45 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  // Variante crayon - trait manuscrit
  if (variant === 'pencil') {
    return (
      <Wrapper {...wrapperProps} className={`inline-flex items-center justify-center ${className}`}>
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12.5L9.5 18L20 6"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'url(#pencil-texture)',
            }}
          />
          <defs>
            <filter id="pencil-texture">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" />
              <feDisplacementMap in="SourceGraphic" scale="0.5" />
            </filter>
          </defs>
        </svg>
      </Wrapper>
    );
  }

  // Variante feutre - trait épais
  if (variant === 'marker') {
    return (
      <Wrapper {...wrapperProps} className={`inline-flex items-center justify-center ${className}`}>
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13L9 19L21 5"
            stroke={fillColor}
            strokeWidth={stroke + 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      </Wrapper>
    );
  }

  // Variante tampon - cercle avec V
  if (variant === 'stamp') {
    return (
      <Wrapper {...wrapperProps} className={`inline-flex items-center justify-center ${className}`}>
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={fillColor} strokeWidth="1.5" strokeDasharray="2 1" />
          <path
            d="M7 12L10.5 15.5L17 8"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Wrapper>
    );
  }

  // Variante point - simple bullet coloré
  if (variant === 'dot') {
    return (
      <Wrapper {...wrapperProps} className={`inline-flex items-center justify-center ${className}`}>
        <span
          style={{
            width: width * 0.4,
            height: height * 0.4,
            backgroundColor: fillColor,
            borderRadius: '50%',
          }}
        />
      </Wrapper>
    );
  }

  // Variante tiret - simple dash
  if (variant === 'dash') {
    return (
      <Wrapper {...wrapperProps} className={`inline-flex items-center justify-center ${className}`}>
        <span
          style={{
            width: width * 0.6,
            height: stroke,
            backgroundColor: fillColor,
            borderRadius: stroke,
          }}
        />
      </Wrapper>
    );
  }

  return null;
};

export default TerrainCheck;

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt';
  delay?: number;
}

/**
 * Carte interactive avec micro-interactions premium
 * - Effet de survol personnalisable
 * - Animation d'entrée
 * - Feedback visuel
 */
const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
  href,
  variant = 'default',
  hoverEffect = 'lift',
  delay = 0,
}) => {
  const baseStyles = `
    relative overflow-hidden
    rounded-2xl
    transition-all duration-300
  `;

  const variantStyles = {
    default: 'bg-white shadow-sm border border-gray-100',
    elevated: 'bg-white shadow-lg',
    bordered: 'bg-white border-2 border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md',
  };

  const hoverVariants = {
    lift: {
      rest: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
      hover: { y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    },
    glow: {
      rest: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
      hover: { boxShadow: '0 0 30px 5px rgba(59, 130, 246, 0.15)' },
    },
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
    },
    tilt: {
      rest: { rotateX: 0, rotateY: 0 },
      hover: { rotateX: 2, rotateY: 2 },
    },
  };

  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

  const MotionComponent = href ? motion.a : motion.div;

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      variants={hoverVariants[hoverEffect]}
      whileHover="hover"
      style={{ cursor: onClick || href ? 'pointer' : 'default' }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </MotionComponent>
  );
};

export default InteractiveCard;

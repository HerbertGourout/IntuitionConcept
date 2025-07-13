import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glassEffect?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
  border?: boolean;
  borderColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background?: string;
  animation?: 'fade' | 'slide' | 'none';
  delay?: number;
}

const ModernCard: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glassEffect = false,
  onClick,
  padding = 'md',
  shadow = 'md',
  border = true,
  borderColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 'lg',
  background = 'rgba(255, 255, 255, 0.7)',
  animation = 'fade',
  delay = 0,
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const shadowMap = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    none: 'shadow-none',
  };

  const borderRadiusMap = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const animationVariants = {
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5, 
          delay: delay * 0.1,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
        } 
      },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.5, 
          delay: delay * 0.1,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
        } 
      },
    },
    none: {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationVariants[animation]}
      className={`
        ${paddingMap[padding]}
        ${shadowMap[shadow]}
        ${borderRadiusMap[borderRadius]}
        ${glassEffect ? 'backdrop-blur-md bg-opacity-70' : ''}
        ${className}
        transition-all duration-300 ease-in-out
        overflow-hidden
        relative
      `}
      style={{
        backgroundColor: background,
        border: border ? `1px solid ${borderColor}` : 'none',
      }}
      whileHover={hoverEffect ? { 
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
    >
      {children}
      
      {/* Effet de brillance au survol */}
      {hoverEffect && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
          initial={{ x: '-100%' }}
          whileHover={{
            x: '100%',
            opacity: 1,
            transition: { duration: 0.6, ease: 'easeInOut' }
          }}
        />
      )}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
  withBorder = true 
}) => (
  <div className={`
    ${withBorder ? 'border-b border-gray-100 dark:border-gray-700 pb-3 mb-3' : 'pb-2'}
    ${className}
  `}>
    {children}
  </div>
);

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '',
  as: Tag = 'h3' 
}) => (
  <Tag className={`
    text-lg font-semibold text-gray-900 dark:text-white
    ${className}
  `}>
    {children}
  </Tag>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`
    text-gray-600 dark:text-gray-300
    ${className}
  `}>
    {children}
  </div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '',
  withBorder = true 
}) => (
  <div className={`
    ${withBorder ? 'border-t border-gray-100 dark:border-gray-700 pt-3 mt-3' : 'pt-2'}
    flex items-center justify-between
    ${className}
  `}>
    {children}
  </div>
);

export default ModernCard;

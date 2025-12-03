import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Bouton interactif avec micro-interactions premium
 * - Effet ripple au clic
 * - Hover avec scale et glow
 * - Feedback tactile
 */
const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  onClick,
  href,
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const baseStyles = `
    relative overflow-hidden
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700
      text-white
      shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:shadow-blue-500/40
      focus:ring-blue-500
    `,
    secondary: `
      bg-gradient-to-r from-gray-800 to-gray-900
      text-white
      shadow-lg shadow-gray-900/25
      hover:shadow-xl hover:shadow-gray-900/40
      focus:ring-gray-500
    `,
    outline: `
      border-2 border-blue-600
      text-blue-600
      bg-transparent
      hover:bg-blue-50
      focus:ring-blue-500
    `,
    ghost: `
      text-gray-700
      bg-transparent
      hover:bg-gray-100
      focus:ring-gray-500
    `,
    whatsapp: `
      bg-gradient-to-r from-green-500 to-green-600
      text-white
      shadow-lg shadow-green-500/25
      hover:shadow-xl hover:shadow-green-500/40
      focus:ring-green-500
    `,
  };

  const content = (
    <>
      {/* Ripple effect layer */}
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Loading spinner */}
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.span>
      )}
      
      {/* Content */}
      <span className={`relative flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
        {children}
        {Icon && iconPosition === 'right' && (
          <motion.span
            className="inline-block"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
      </span>
    </>
  );

  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {content}
    </motion.button>
  );
};

export default InteractiveButton;

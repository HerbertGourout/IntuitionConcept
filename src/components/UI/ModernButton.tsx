import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

import type { HTMLMotionProps } from 'framer-motion';

interface ModernButtonProps extends Omit<HTMLMotionProps<'button'>, 'leftIcon' | 'rightIcon' | 'children'> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const buttonVariants = {
  primary: {
    backgroundColor: colors.primary,
    color: 'white',
    hover: { backgroundColor: `${colors.primary}CC` },
    active: { backgroundColor: `${colors.primary}99` },
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: 'white',
    hover: { backgroundColor: `${colors.secondary}CC` },
    active: { backgroundColor: `${colors.secondary}99` },
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    hover: { backgroundColor: `${colors.primary}10` },
    active: { backgroundColor: `${colors.primary}20` },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.gray[700],
    hover: { backgroundColor: `${colors.gray[100]}` },
    active: { backgroundColor: `${colors.gray[200]}` },
  },
  danger: {
    backgroundColor: colors.error,
    color: 'white',
    hover: { backgroundColor: `${colors.error}CC` },
    active: { backgroundColor: `${colors.error}99` },
  },
};

const buttonSizes = {
  sm: 'py-1.5 px-3 text-sm h-8',
  md: 'py-2 px-4 text-base h-10',
  lg: 'py-3 px-6 text-lg h-12',
};

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyle = buttonVariants[variant];
    const sizeStyle = buttonSizes[size];
    const widthStyle = fullWidth ? 'w-full' : 'w-auto';

    return (
      <motion.button
        ref={ref}
        className={`
          ${sizeStyle} ${widthStyle} ${className}
          inline-flex items-center justify-center gap-2
          rounded-lg font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
          disabled:opacity-60 disabled:cursor-not-allowed
          relative overflow-hidden
        `}
        style={{
          backgroundColor: variantStyle.backgroundColor,
          color: variantStyle.color,
          border: variant === 'outline' ? `1px solid ${colors.primary}` : 'none',
        }}
        whileHover={!disabled && !isLoading ? variantStyle.hover : {}}
        whileTap={!disabled && !isLoading ? variantStyle.active : {}}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-t-transparent border-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.span>
        )}
        
        <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);

ModernButton.displayName = 'ModernButton';

export default ModernButton;

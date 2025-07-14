import React, { useEffect, useState } from 'react';

interface FloatingParticleProps {
  delay?: number;
  duration?: number;
  size?: number;
  color?: string;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({ 
  delay = 0, 
  duration = 10, 
  size = 4, 
  color = 'bg-orange-400' 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPosition({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    };

    const interval = setInterval(animate, duration * 1000);
    setTimeout(animate, delay * 1000);

    return () => clearInterval(interval);
  }, [delay, duration]);

  return (
    <div
      className={`fixed ${color} rounded-full opacity-20 pointer-events-none transition-all duration-[${duration}s] ease-in-out`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: -1
      }}
    />
  );
};

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'particles' | 'gradient' | 'construction' | 'minimal';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  variant = 'minimal' 
}) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'particles':
        return 'particles-bg';
      case 'gradient':
        return 'gradient-bg-animated';
      case 'construction':
        return 'gradient-construction';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${getBackgroundClass()}`}>
      {variant === 'particles' && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 2}
              duration={8 + i}
              size={3 + i}
              color={['bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 4]}
            />
          ))}
        </>
      )}
      {children}
    </div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light',
  hover = true 
}) => {
  const baseClass = variant === 'light' ? 'glass-card' : 'glass-card-dark';
  const hoverClass = hover ? 'hover-lift' : '';
  
  return (
    <div className={`${baseClass} ${hoverClass} rounded-xl ${className}`}>
      {children}
    </div>
  );
};

interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({ size = 'md', color = 'orange' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    orange: 'border-orange-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`spinner ${sizeClasses[size]} ${colorClasses[color as keyof typeof colorClasses] || colorClasses.orange}`}></div>
    </div>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  className = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

interface MorphingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const MorphingButton: React.FC<MorphingButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        morph-card hover-glow font-medium transition-all duration-300 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover-scale'}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <PulseLoader size="sm" color="white" />
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#f97316',
  backgroundColor = '#e5e7eb',
  animated = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export {
  AnimatedBackground,
  GlassCard,
  PulseLoader,
  AnimatedCounter,
  MorphingButton,
  ProgressRing,
  FloatingParticle
};

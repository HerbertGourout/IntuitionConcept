import React from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'particles' | 'gradient' | 'waves';
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  variant = 'gradient',
  className = '' 
}) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'particles':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
      case 'waves':
        return 'bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800';
      default:
        return 'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800';
    }
  };

  return (
    <div className={`relative min-h-screen ${getBackgroundClass()} ${className}`}>
      {variant === 'particles' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;

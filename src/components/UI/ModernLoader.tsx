import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const ModernLoader: React.FC<LoaderProps> = ({
  size = 'md',
  color = colors.primary,
  text,
  fullScreen = false,
  className = '',
}) => {
  const loaderSize = sizeMap[size];
  const strokeWidth = Math.max(2, loaderSize / 8);
  const radius = (loaderSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const containerClasses = `
    flex flex-col items-center justify-center
    ${fullScreen ? 'fixed inset-0 bg-white/80 z-50' : ''}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      <motion.div
        className="relative"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          width={loaderSize}
          height={loaderSize}
          viewBox={`0 0 ${loaderSize} ${loaderSize}`}
          className="relative"
        >
          {/* Piste de fond */}
          <circle
            cx={loaderSize / 2}
            cy={loaderSize / 2}
            r={radius}
            fill="none"
            stroke={`${color}20`}
            strokeWidth={strokeWidth}
          />
          
          {/* Animation de progression */}
          <motion.circle
            cx={loaderSize / 2}
            cy={loaderSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference * 0.8,
              rotate: -90,
            }}
            animate={{
              strokeDashoffset: [
                circumference * 0.8,
                circumference * 0.2,
                circumference * 0.8,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            transform={`rotate(-90 ${loaderSize / 2} ${loaderSize / 2})`}
          />
          
          {/* Point d'animation */}
          <motion.circle
            cx={loaderSize / 2}
            cy={strokeWidth * 1.5}
            r={strokeWidth / 2}
            fill={color}
            initial={{
              opacity: 0.2,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </motion.div>
      
      {text && (
        <motion.p 
          className="mt-4 text-sm font-medium text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
      
      {/* Effet de particules subtil */}
      {fullScreen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gray-200"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernLoader;

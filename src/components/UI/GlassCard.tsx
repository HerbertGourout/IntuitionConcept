import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    onClick,
    hover = false
}) => {
    const { resolvedTheme } = useTheme();

    const baseClasses = `
        backdrop-blur-sm border rounded-xl shadow-lg transition-all duration-300
        ${resolvedTheme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-gray-200/50'
        }
        ${hover ? 'hover:shadow-xl hover:scale-[1.02]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
    `;

    if (onClick) {
        return (
            <motion.div
                className={baseClasses}
                onClick={onClick}
                whileHover={hover ? { scale: 1.02 } : undefined}
                whileTap={hover ? { scale: 0.98 } : undefined}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={baseClasses}>
            {children}
        </div>
    );
};

export default GlassCard;

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

// Lightweight wrapper for the global .glass-card style
const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-card rounded-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;

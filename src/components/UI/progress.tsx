import React from "react";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

/**
 * Glassmorphism Progress Bar
 * Usage: <Progress value={percent} />
 */
export const Progress: React.FC<ProgressProps> = ({ value, className = "" }) => {
  return (
    <div
      className={`w-full h-3 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden border border-white/30 shadow-inner backdrop-blur-sm ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 transition-all duration-800 rounded-full shadow-lg"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

export default Progress;

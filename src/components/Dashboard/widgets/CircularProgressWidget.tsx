import React from 'react';

interface CircularProgressWidgetProps {
  title: string;
  percentage: number;
  value: string;
  color: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

const CircularProgressWidget: React.FC<CircularProgressWidgetProps> = ({
  title,
  percentage,
  value,
  color,
  icon,
  subtitle
}) => {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  
  // Sécuriser le calcul du strokeDashoffset pour éviter NaN
  const safePercentage = typeof percentage === 'number' && !isNaN(percentage) ? Math.max(0, Math.min(100, percentage)) : 0;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{safePercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default CircularProgressWidget;

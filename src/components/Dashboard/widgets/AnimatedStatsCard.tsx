import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnimatedStatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  format?: 'number' | 'currency' | 'percentage';
}

const AnimatedStatsCard: React.FC<AnimatedStatsCardProps> = ({
  title,
  value,
  previousValue,
  unit = '',
  icon,
  color,
  gradientFrom,
  gradientTo,
  format = 'number'
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `${(val / 1000000).toFixed(1)}M FCFA`;
      case 'percentage':
        return `${Math.round(val)}%`;
      default:
        return Math.round(val).toString();
    }
  };

  const getChangeInfo = () => {
    if (!previousValue) return null;
    
    const change = value - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    if (change > 0) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        text: `+${Math.abs(changePercent).toFixed(1)}%`,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    } else if (change < 0) {
      return {
        icon: <TrendingDown className="w-4 h-4" />,
        text: `-${Math.abs(changePercent).toFixed(1)}%`,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else {
      return {
        icon: <Minus className="w-4 h-4" />,
        text: '0%',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      };
    }
  };

  const changeInfo = getChangeInfo();

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20"></div>
        <div className="absolute -left-2 -bottom-2 w-16 h-16 rounded-full bg-white/10"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-white/20`}>
            {icon}
          </div>
          {changeInfo && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${changeInfo.bgColor} ${changeInfo.color}`}>
              {changeInfo.icon}
              <span className="text-xs font-medium">{changeInfo.text}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white/80 text-sm font-medium">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold text-white ${isAnimating ? 'animate-pulse' : ''}`}>
              {formatValue(displayValue)}
            </span>
            {unit && <span className="text-white/70 text-sm">{unit}</span>}
          </div>
        </div>
        
        {/* Progress bar for animated effect */}
        {isAnimating && (
          <div className="mt-4 w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-100"
              style={{ width: `${(displayValue / value) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedStatsCard;

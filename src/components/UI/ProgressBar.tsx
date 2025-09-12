import React from 'react';

type Tone = 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple';

interface ProgressBarProps {
  value: number; // 0..100
  tone?: Tone;
  showLabel?: boolean;
  className?: string;
}

const toneToBar: Record<Tone, string> = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-amber-500',
  red: 'from-red-500 to-rose-500',
  gray: 'from-gray-400 to-slate-500',
  purple: 'from-purple-500 to-pink-500',
};

const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone = 'blue', showLabel = false, className = '' }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 w-full rounded-full bg-gray-200/70 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${toneToBar[tone]} transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-600">{clamped}%</div>
      )}
    </div>
  );
};

export default ProgressBar;

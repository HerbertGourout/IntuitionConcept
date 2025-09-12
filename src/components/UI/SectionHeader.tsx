import React from 'react';

interface SectionHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

// Reusable header aligned with "Mon Espace" style
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, actions, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl text-blue-600">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;

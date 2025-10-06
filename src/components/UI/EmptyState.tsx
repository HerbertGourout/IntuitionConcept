import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icône */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 shadow-inner">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>

      {/* Titre */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-8 text-center max-w-md">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {actionLabel}
          </button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

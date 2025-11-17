import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { StructuralStudyStatus, QuoteType } from '../../types/StructuredQuote';

interface StructuralStudyBadgeProps {
  quoteType: QuoteType;
  studyStatus: StructuralStudyStatus;
  uncertaintyMargin: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const StructuralStudyBadge: React.FC<StructuralStudyBadgeProps> = ({
  quoteType,
  studyStatus,
  uncertaintyMargin,
  size = 'md',
  showDetails = false
}) => {
  const getConfig = () => {
    if (quoteType === 'definitive' && studyStatus === 'completed') {
      return {
        icon: CheckCircle,
        label: 'Devis Définitif',
        color: 'bg-green-100 text-green-800 border-green-300',
        iconColor: 'text-green-600',
        description: 'Basé sur étude structurale complète'
      };
    }

    if (studyStatus === 'in_progress') {
      return {
        icon: Clock,
        label: 'Étude en cours',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        iconColor: 'text-blue-600',
        description: 'Étude structurale en cours de réalisation'
      };
    }

    if (studyStatus === 'pending') {
      return {
        icon: Clock,
        label: 'Étude prévue',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        iconColor: 'text-yellow-600',
        description: 'Étude structurale planifiée'
      };
    }

    // Par défaut: devis estimatif sans étude
    return {
      icon: AlertTriangle,
      label: 'Devis Estimatif',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      iconColor: 'text-orange-600',
      description: 'Sans étude structurale - Sous réserve'
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`
          inline-flex items-center gap-2 rounded-lg border-2 font-semibold
          ${config.color} ${sizeClasses[size]}
        `}
      >
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
        <span>{config.label}</span>
        {uncertaintyMargin > 0 && (
          <span className="text-xs opacity-75">
            (±{uncertaintyMargin}%)
          </span>
        )}
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-600 italic">
          {config.description}
        </div>
      )}
    </div>
  );
};

export default StructuralStudyBadge;

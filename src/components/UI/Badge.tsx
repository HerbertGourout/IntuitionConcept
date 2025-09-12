/* eslint-disable react-refresh/only-export-components */
import React from 'react';

export type BadgeTone = 'gray' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

interface BadgeProps {
  children?: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  size?: 'sm' | 'md';
}

const toneToClasses: Record<BadgeTone, string> = {
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

const Badge: React.FC<BadgeProps> = ({ children, tone = 'gray', className = '', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${toneToClasses[tone]} ${className}`}>
      {children}
    </span>
  );
};

// Helpers to map common domain statuses → tones + labels
export const statusToBadge = (domain: 'quote' | 'task' | 'equipment', status: string): { tone: BadgeTone; label: string } => {
  const s = (status || '').toLowerCase();
  if (domain === 'quote') {
    switch (s) {
      case 'draft': return { tone: 'yellow', label: 'Brouillon' };
      case 'sent': return { tone: 'blue', label: 'Envoyé' };
      case 'accepted': return { tone: 'green', label: 'Accepté' };
      case 'rejected': return { tone: 'red', label: 'Refusé' };
      case 'viewed': return { tone: 'purple', label: 'Consulté' };
      case 'expired': return { tone: 'gray', label: 'Expiré' };
      case 'cancelled': return { tone: 'gray', label: 'Annulé' };
      default: return { tone: 'gray', label: status };
    }
  }
  if (domain === 'task') {
    switch (s) {
      case 'todo': return { tone: 'gray', label: 'À faire' };
      case 'planned': return { tone: 'blue', label: 'Planifiée' };
      case 'in_progress': return { tone: 'yellow', label: 'En cours' };
      case 'done': return { tone: 'green', label: 'Terminée' };
      case 'on_hold': return { tone: 'orange', label: 'En attente' };
      case 'cancelled': return { tone: 'red', label: 'Annulée' };
      default: return { tone: 'gray', label: status };
    }
  }
  // equipment
  switch (s) {
    case 'available': return { tone: 'green', label: 'Disponible' };
    case 'in-use': return { tone: 'blue', label: 'En service' };
    case 'maintenance': return { tone: 'orange', label: 'Maintenance' };
    case 'out-of-service': return { tone: 'red', label: 'Hors service' };
    default: return { tone: 'gray', label: status };
  }
};

export default Badge;

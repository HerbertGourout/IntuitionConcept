import React from 'react';
import { MapPin, User, Calendar, Euro, Wrench } from 'lucide-react';
import { Equipment } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import Badge, { statusToBadge } from '../UI/Badge';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onClick }) => {
  const { formatAmount } = useCurrency();
  

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'excavator':
        return '🚜';
      case 'crane':
        return '🏗️';
      case 'truck':
        return '🚛';
      case 'concrete-mixer':
        return '🚚';
      case 'bulldozer':
        return '🚧';
      default:
        return '⚙️';
    }
  };

  const isMaintenanceNeeded = () => {
    const nextMaintenance = new Date(equipment.nextMaintenance);
    const today = new Date();
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilMaintenance <= 7;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
    >
      {/* Maintenance Alert */}
      {isMaintenanceNeeded() && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {getEquipmentIcon(equipment.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {equipment.name}
            </h3>
            <p className="text-gray-600 text-sm">{equipment.model}</p>
          </div>
        </div>
        {(() => {
          const { tone, label } = statusToBadge('equipment', equipment.status);
          return <Badge tone={tone} size="sm">{label}</Badge>;
        })()}
      </div>

      {/* Info Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{equipment.location}</span>
        </div>
        
        {equipment.operator && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{equipment.operator}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Euro className="w-4 h-4" />
          <span>{formatAmount(equipment.dailyRate || 0)}/jour</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Prochaine maintenance: {new Date(equipment.nextMaintenance).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            S/N: {equipment.serialNumber}
          </span>
          {isMaintenanceNeeded() && (
            <div className="flex items-center gap-1 text-orange-600">
              <Wrench className="w-3 h-3" />
              <span className="text-xs font-medium">Maintenance requise</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
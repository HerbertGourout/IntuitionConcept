import React from 'react';
import { MapPin, User, Calendar, Euro, Wrench } from 'lucide-react';
import { Equipment } from '../../types';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out-of-service':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'in-use':
        return 'En service';
      case 'maintenance':
        return 'Maintenance';
      case 'out-of-service':
        return 'Hors service';
      default:
        return status;
    }
  };

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
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(equipment.status)}`}>
          {getStatusLabel(equipment.status)}
        </span>
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
          <span>{equipment.dailyRate}€/jour</span>
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
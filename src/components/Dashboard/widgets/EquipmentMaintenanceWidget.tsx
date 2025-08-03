import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import { useCurrency } from '../../../hooks/useCurrency';

interface EquipmentData {
  totalEquipment: number;
  availableEquipment: number;
  inMaintenanceEquipment: number;
  maintenanceAlerts: Array<{
    id: string;
    name: string;
    type: string;
    daysOverdue: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  availabilityRate: number;
  maintenanceCosts: number;
  geolocatedEquipment: number;
  upcomingMaintenance: Array<{
    id: string;
    name: string;
    scheduledDate: string;
    type: string;
  }>;
}

const EquipmentMaintenanceWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const { formatAmount } = useCurrency();
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({
    totalEquipment: 0,
    availableEquipment: 0,
    inMaintenanceEquipment: 0,
    maintenanceAlerts: [],
    availabilityRate: 0,
    maintenanceCosts: 0,
    geolocatedEquipment: 0,
    upcomingMaintenance: []
  });

  useEffect(() => {
    if (!currentProject) return;

    const equipment = currentProject.equipment || [];
    const totalEquipment = equipment.length;
    const availableEquipment = equipment.filter(eq => eq.status === 'available').length;
    const inMaintenanceEquipment = equipment.filter(eq => eq.status === 'maintenance').length;
    const geolocatedEquipment = equipment.filter(eq => eq.coordinates).length;

    // Alertes de maintenance réelles basées sur les équipements du projet
    const maintenanceAlerts = equipment
      .filter(eq => {
        if (!eq.nextMaintenance) return false;
        const nextMaintenance = new Date(eq.nextMaintenance);
        const today = new Date();
        return nextMaintenance < today;
      })
      .map(eq => {
        const nextMaintenance = new Date(eq.nextMaintenance);
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - nextMaintenance.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: eq.id,
          name: eq.name,
          type: eq.type,
          daysOverdue,
          priority: daysOverdue > 30 ? 'high' : daysOverdue > 14 ? 'medium' : 'low' as 'low' | 'medium' | 'high'
        };
      });

    // Calculs réels
    const availabilityRate = totalEquipment > 0 ? Math.round((availableEquipment / totalEquipment) * 100) : 0;
    const maintenanceCosts = equipment.reduce((sum, eq) => {
      // Coût de maintenance basé sur le coût journalier réel
      if (eq.status === 'maintenance') {
        return sum + (eq.dailyRate || 0);
      }
      return sum;
    }, 0);

    // Maintenance à venir basée sur les vraies dates
    const upcomingMaintenance = equipment
      .filter(eq => {
        if (!eq.nextMaintenance) return false;
        const nextMaintenance = new Date(eq.nextMaintenance);
        const today = new Date();
        const inNext30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return nextMaintenance >= today && nextMaintenance <= inNext30Days;
      })
      .map(eq => ({
        id: eq.id,
        name: eq.name,
        scheduledDate: eq.nextMaintenance,
        type: eq.type
      }))
      .slice(0, 3);

    setEquipmentData({
      totalEquipment,
      availableEquipment,
      inMaintenanceEquipment,
      maintenanceAlerts,
      availabilityRate,
      maintenanceCosts,
      geolocatedEquipment,
      upcomingMaintenance
    });
  }, [currentProject]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getEquipmentIcon = (type: string) => {
    // Retourner une icône basée sur le type d'équipement
    return <Wrench className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Équipements & Maintenance</h3>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {equipmentData.geolocatedEquipment}/{equipmentData.totalEquipment} géolocalisés
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {equipmentData.availableEquipment}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Disponibles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {equipmentData.inMaintenanceEquipment}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">En maintenance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {equipmentData.availabilityRate}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Disponibilité</div>
        </div>
      </div>

      {/* Barre de disponibilité */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Taux de disponibilité</span>
          <span className={`font-medium ${
            equipmentData.availabilityRate > 80 ? 'text-green-600' : 
            equipmentData.availabilityRate > 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {equipmentData.availabilityRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              equipmentData.availabilityRate > 80 ? 'bg-green-500' : 
              equipmentData.availabilityRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${equipmentData.availabilityRate}%` }}
          ></div>
        </div>
      </div>

      {/* Alertes de maintenance */}
      {equipmentData.maintenanceAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alertes maintenance</span>
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">
              {equipmentData.maintenanceAlerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {equipmentData.maintenanceAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.daysOverdue} jours de retard
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(alert.priority)}`}>
                  {alert.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance programmée */}
      {equipmentData.upcomingMaintenance.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Maintenance programmée</h4>
          <div className="space-y-2">
            {equipmentData.upcomingMaintenance.map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {maintenance.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(maintenance.scheduledDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                  {maintenance.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coûts de maintenance */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Coûts maintenance/mois</span>
          </div>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {formatAmount(equipmentData.maintenanceCosts)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentMaintenanceWidget;

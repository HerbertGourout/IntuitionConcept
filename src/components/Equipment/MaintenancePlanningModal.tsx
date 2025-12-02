import React from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Equipment } from '../../types';

interface MaintenancePlanningModalProps {
  equipment: Equipment[];
  onClose: () => void;
}

const MaintenancePlanningModal: React.FC<MaintenancePlanningModalProps> = ({ equipment, onClose }) => {
  // Helper to determine status
  const getMaintenanceStatus = (nextMaintenance: string) => {
    const now = new Date();
    const next = new Date(nextMaintenance);
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'En retard', color: 'text-red-600', icon: <AlertTriangle className="inline w-4 h-4" /> };
    if (diffDays <= 7) return { label: 'Urgent', color: 'text-orange-600', icon: <AlertTriangle className="inline w-4 h-4" /> };
    return { label: `Dans ${diffDays} j`, color: 'text-green-600', icon: <CheckCircle className="inline w-4 h-4" /> };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" /> Planning Maintenance
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Dernière maintenance</th>
                <th className="px-3 py-2 text-left">Prochaine maintenance</th>
                <th className="px-3 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {equipment.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">Aucun équipement à afficher</td>
                </tr>
              ) : (
                equipment.map(eq => {
                  const status = getMaintenanceStatus(eq.nextMaintenance);
                  return (
                    <tr key={eq.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{eq.name}</td>
                      <td className="px-3 py-2">{eq.type}</td>
                      <td className="px-3 py-2">{eq.lastMaintenance ? new Date(eq.lastMaintenance).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-2">{eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString() : '-'}</td>
                      <td className={`px-3 py-2 font-semibold flex items-center gap-1 ${status.color}`}>{status.icon} {status.label}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePlanningModal;

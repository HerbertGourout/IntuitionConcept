import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  MapPin,
  Calendar,
  Plus,
  Search
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import QRScanner from '../../Equipment/QRScanner';

interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  location: string;
  assignedTo?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  qrCode: string;
}

interface EquipmentScannerWidgetProps {
  className?: string;
}

const EquipmentScannerWidget: React.FC<EquipmentScannerWidgetProps> = ({ className = '' }) => {
  const { resolvedTheme } = useTheme();
  const [showScanner, setShowScanner] = useState(false);
  const [recentScans, setRecentScans] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Données simulées d'équipements
  const equipmentStats = {
    total: 45,
    available: 32,
    inUse: 8,
    maintenance: 3,
    damaged: 2,
  };

  const recentEquipment = [
    {
      id: 'eq-001',
      name: 'Pelleteuse CAT 320',
      type: 'Engin de chantier',
      serialNumber: 'CAT320-2024-001',
      status: 'available' as const,
      location: 'Chantier Dakar Nord',
      qrCode: 'QR001',
      lastMaintenance: new Date('2024-07-01'),
      nextMaintenance: new Date('2024-08-15'),
    },
    {
      id: 'eq-002',
      name: 'Grue mobile 50T',
      type: 'Engin de levage',
      serialNumber: 'GROVE-RT550-002',
      status: 'in-use' as const,
      location: 'Chantier Almadies',
      assignedTo: 'Mamadou Diallo',
      qrCode: 'QR002',
      lastMaintenance: new Date('2024-06-15'),
      nextMaintenance: new Date('2024-09-01'),
    },
    {
      id: 'eq-003',
      name: 'Bétonnière 500L',
      type: 'Équipement de construction',
      serialNumber: 'BET500-2024-003',
      status: 'maintenance' as const,
      location: 'Atelier central',
      qrCode: 'QR003',
      lastMaintenance: new Date('2024-07-20'),
      nextMaintenance: new Date('2024-08-20'),
    },
  ];

  const handleScanSuccess = (equipment: Equipment) => {
    setRecentScans(prev => [equipment, ...prev.slice(0, 4)]);
    // Ici, vous pourriez également déclencher une navigation vers la page de détail de l'équipement
    console.log('Équipement scanné:', equipment);
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'in-use': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'maintenance': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'damaged': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'in-use': return <Package className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'damaged': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in-use': return 'En cours d\'utilisation';
      case 'maintenance': return 'En maintenance';
      case 'damaged': return 'Endommagé';
      default: return 'Inconnu';
    }
  };

  const filteredEquipment = recentEquipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-full ${className}`}>
      {/* En-tête avec bouton scanner */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Équipements
          </h3>
          <motion.button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Scan className="w-4 h-4" />
            <span className="text-sm font-medium">Scanner</span>
          </motion.button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <motion.div
            className={`p-2 rounded-lg border text-center ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-green-50 border-green-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium">Disponible</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {equipmentStats.available}
            </p>
          </motion.div>

          <motion.div
            className={`p-2 rounded-lg border text-center ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-blue-50 border-blue-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium">En cours</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {equipmentStats.inUse}
            </p>
          </motion.div>

          <motion.div
            className={`p-2 rounded-lg border text-center ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-yellow-50 border-yellow-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wrench className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium">Maintenance</span>
            </div>
            <p className="text-lg font-bold text-yellow-600">
              {equipmentStats.maintenance}
            </p>
          </motion.div>

          <motion.div
            className={`p-2 rounded-lg border text-center ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-red-50 border-red-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium">Endommagé</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              {equipmentStats.damaged}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Scans récents */}
      {recentScans.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Scan className="w-4 h-4 text-green-500" />
            Derniers scans
          </h4>
          <div className="space-y-2">
            {recentScans.map((equipment, index) => (
              <motion.div
                key={`${equipment.id}-${index}`}
                className={`p-2 rounded-lg border-l-4 border-green-500 ${
                  resolvedTheme === 'dark'
                    ? 'bg-green-900/20'
                    : 'bg-green-50'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-green-600 dark:text-green-400">
                      {equipment.name}
                    </p>
                    <p className="text-xs opacity-70">
                      Scanné à l'instant
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusColor(equipment.status)}`}>
                    {getStatusLabel(equipment.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des équipements */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">Équipements récents</h4>
        {filteredEquipment.map((equipment, index) => (
          <motion.div
            key={equipment.id}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${getStatusColor(equipment.status)}`}>
                  {getStatusIcon(equipment.status)}
                </div>
                <div>
                  <p className="font-medium text-sm">{equipment.name}</p>
                  <p className="text-xs opacity-70">{equipment.type}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(equipment.status)}`}>
                {getStatusLabel(equipment.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 opacity-70" />
                <span className="opacity-70">{equipment.location}</span>
              </div>
              {equipment.assignedTo && (
                <div className="opacity-70">
                  Assigné à: {equipment.assignedTo}
                </div>
              )}
              {equipment.nextMaintenance && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 opacity-70" />
                  <span className="opacity-70">
                    Maintenance: {equipment.nextMaintenance.toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="opacity-70">
                S/N: {equipment.serialNumber}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredEquipment.length === 0 && searchTerm && (
          <div className={`p-4 text-center rounded-lg border-2 border-dashed ${
            resolvedTheme === 'dark'
              ? 'border-gray-600 text-gray-400'
              : 'border-gray-300 text-gray-500'
          }`}>
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun équipement trouvé</p>
            <p className="text-xs opacity-70 mt-1">
              Essayez un autre terme de recherche
            </p>
          </div>
        )}

        {filteredEquipment.length === 0 && !searchTerm && (
          <div className={`p-4 text-center rounded-lg border-2 border-dashed ${
            resolvedTheme === 'dark'
              ? 'border-gray-600 text-gray-400'
              : 'border-gray-300 text-gray-500'
          }`}>
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun équipement configuré</p>
            <button className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors mx-auto">
              <Plus className="w-3 h-3" />
              Ajouter un équipement
            </button>
          </div>
        )}
      </div>

      {/* Scanner QR Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={(error) => console.error('Erreur de scan:', error)}
      />
    </div>
  );
};

export default EquipmentScannerWidget;

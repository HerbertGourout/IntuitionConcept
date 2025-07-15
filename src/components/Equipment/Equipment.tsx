import React, { useState, useContext } from 'react';
import { Plus, Filter, Search, MapPin, Calendar, Wrench, TrendingUp, Settings, BarChart3, CheckCircle, AlertTriangle, Grid3X3, Package } from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailModal from './EquipmentDetailModal';
import MaintenancePlanningModal from './MaintenancePlanningModal';
import EquipmentForm from './EquipmentForm';
import ProjectContext from '../../contexts/ProjectContext';
import type { Equipment } from '../../types';

// Types pour les statuts d'équipement
const statusOptions = [
  "available",
  "in-use",
  "maintenance",
  "out-of-service"
] as const;

type EquipmentStatus = typeof statusOptions[number];

function isValidStatus(value: string): value is EquipmentStatus {
  return statusOptions.includes(value as EquipmentStatus);
}

// Fonction utilitaire pour nettoyer les données avant Firestore
function cleanEquipmentData(equipment: Equipment): Equipment {
  const cleaned: Equipment = {
    id: equipment.id?.toString() || Date.now().toString(),
    name: (equipment.name || '').trim(),
    type: equipment.type || 'other',
    model: (equipment.model || '').trim(),
    serialNumber: (equipment.serialNumber || '').trim(),
    status: equipment.status || 'available',
    location: (equipment.location || '').trim(),
    assignedProject: (equipment.assignedProject || '').trim(),
    lastMaintenance: equipment.lastMaintenance || new Date().toISOString(),
    nextMaintenance: equipment.nextMaintenance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),

    operator: (equipment.operator || '').trim()
  };
  
  // Ajouter coordinates seulement si défini et valide
  if (equipment.coordinates && 
      typeof equipment.coordinates.lat === 'number' && 
      typeof equipment.coordinates.lng === 'number' &&
      !isNaN(equipment.coordinates.lat) &&
      !isNaN(equipment.coordinates.lng)) {
    cleaned.coordinates = {
      lat: equipment.coordinates.lat,
      lng: equipment.coordinates.lng
    };
  }
  
  return cleaned;
}

const Equipment: React.FC = () => {
  const projectContext = useContext(ProjectContext);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Utiliser la vraie liste d'équipements du projet courant
  const equipment: Equipment[] = projectContext?.currentProject?.equipment || [];
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [, setShowDetailModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    id: '',
    name: '',
    type: 'other',
    model: '',
    serialNumber: '',
    status: 'available',
    location: '',
    lastMaintenance: '',
    nextMaintenance: '',
    assignedProject: '',

    operator: '',
    coordinates: undefined
  });

  // Statistiques synthétiques
  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter((e: Equipment) => e.status === 'available').length,
    inUse: equipment.filter((e: Equipment) => e.status === 'in-use').length,
    maintenance: equipment.filter((e: Equipment) => e.status === 'maintenance').length
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const statusFilterOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'available', label: 'Disponible' },
    { value: 'in-use', label: 'En service' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'out-of-service', label: 'Hors service' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'excavator', label: 'Pelleteuses' },
    { value: 'crane', label: 'Grues' },
    { value: 'truck', label: 'Camions' },
    { value: 'concrete-mixer', label: 'Toupies béton' },
    { value: 'bulldozer', label: 'Bulldozers' },
    { value: 'other', label: 'Autres' }
  ];

  const handleAddEquipment = async (values: Equipment) => {
    if (!projectContext?.currentProject) {
      console.error('Aucun projet courant sélectionné');
      return;
    }

    if (!projectContext.updateProject) {
      console.error('Fonction updateProject non disponible dans le contexte');
      return;
    }

    try {
      console.log('🔧 Ajout d\'équipement:', newEquipment);
      
      // Créer un nouvel équipement avec toutes les valeurs définies
      const newEquip: Equipment = {
        id: Date.now().toString(),
        name: newEquipment.name?.trim() || '',
        type: newEquipment.type || 'other',
        model: newEquipment.model?.trim() || '',
        serialNumber: newEquipment.serialNumber?.trim() || '',
        status: newEquipment.status || 'available',
        location: newEquipment.location?.trim() || '',
        assignedProject: projectContext.currentProject.id,
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    
        operator: newEquipment.operator?.trim() || ''
      };

      // Ajouter coordinates seulement si défini et valide
      if (newEquipment.coordinates && 
          typeof newEquipment.coordinates.lat === 'number' && 
          typeof newEquipment.coordinates.lng === 'number') {
        newEquip.coordinates = newEquipment.coordinates;
      }

      console.log('🔧 Nouvel équipement créé:', newEquip);
      
      // Nettoyer tous les équipements existants pour éviter les undefined
      const currentEquipment = projectContext.currentProject.equipment || [];
      const cleanedCurrentEquipment = currentEquipment.map(eq => cleanEquipmentData(eq));
      const updatedList = [...cleanedCurrentEquipment, newEquip];
      
      console.log('🔧 Liste mise à jour (nettoyée):', updatedList);
      
      await projectContext.updateProject(
        projectContext.currentProject.id,
        { equipment: updatedList },
        'Équipement ajouté',
        'Utilisateur',
        `Ajout de l'équipement: ${newEquip.name} (${newEquip.type})`
      );

      console.log('✅ Équipement ajouté avec succès');
      
      // Réinitialiser le formulaire
      setShowAddEquipment(false);
      setNewEquipment({
        id: '',
        name: '',
        type: 'other',
        model: '',
        serialNumber: '',
        status: 'available',
        location: '',
        assignedProject: '',
        lastMaintenance: '',
        nextMaintenance: '',
    
        operator: '',
        coordinates: undefined
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'équipement:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header avec design glassmorphism */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                  <Wrench className="w-8 h-8 text-orange-600" />
                </div>
                Équipements
                <TrendingUp className="w-6 h-6 text-green-500" />
              </h1>
              <p className="text-gray-600 mt-2 ml-14">Gérez et supervisez votre parc d'équipements</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg">
                <MapPin className="w-4 h-4" />
                Localisation
              </button>
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => setShowAddEquipment(true)}
              >
                <Plus className="w-4 h-4" />
                Nouvel Équipement
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques avec design glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-8 h-8 text-gray-600" />
              <div className="text-3xl font-bold text-gray-900">{equipmentStats.total}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">Total équipements</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full transition-all duration-800" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{equipmentStats.available}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">Disponibles</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-800" style={{width: `${equipmentStats.total > 0 ? (equipmentStats.available / equipmentStats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{equipmentStats.inUse}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">En service</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-800" style={{width: `${equipmentStats.total > 0 ? (equipmentStats.inUse / equipmentStats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">{equipmentStats.maintenance}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">Maintenance</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-800" style={{width: `${equipmentStats.total > 0 ? (equipmentStats.maintenance / equipmentStats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>

        {/* Filtres avec design glassmorphism */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres et recherche</h3>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-300 placeholder-gray-400 w-full sm:w-80"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-300"
                >
                  {statusFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 transition-all duration-300"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
              onClick={() => setShowMaintenanceModal(true)}
            >
              <Calendar className="w-4 h-4" />
              Planning Maintenance
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout d'équipement avec glassmorphism */}
        {showAddEquipment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-8 w-full max-w-2xl shadow-2xl rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                  <Plus className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ajouter un équipement</h2>
              </div>
              <EquipmentForm
                initialValues={newEquipment}
                mode="add"
                onCancel={() => setShowAddEquipment(false)}
                onSubmit={handleAddEquipment}
              />
            </div>
          </div>
        )}

        {/* Modale planning maintenance */}
        {showMaintenanceModal && (
          <MaintenancePlanningModal
            equipment={equipment}
            onClose={() => setShowMaintenanceModal(false)}
          />
        )}

        {/* Grille d'équipements avec design moderne */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
              <Grid3X3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Parc d'équipements</h3>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                onClick={() => {
                  setSelectedEquipment(equipment);
                  setShowDetailModal(true);
                }}
              />
            ))}
          </div>
        </div>

      {/* Modal fiche détail équipement */}
      <EquipmentDetailModal
        equipment={selectedEquipment}
        onClose={() => {
          setSelectedEquipment(null);
          setShowDetailModal(false);
        }}
        onEdit={(updated) => {
          if (!projectContext?.currentProject || !projectContext.updateProject) return;
          const updatedList = equipment.map(eq => eq.id === updated.id ? { ...updated } : eq);
          projectContext.updateProject(
            projectContext.currentProject.id,
            { equipment: updatedList },
            'Équipement modifié',
            'Utilisateur',
            `Modification de l'équipement ${updated.name}`
          );
          setSelectedEquipment(updated);
        }}
        onDelete={(toDelete) => {
          if (!projectContext?.currentProject || !projectContext.updateProject) return;
          const updatedList = equipment.filter(eq => eq.id !== toDelete.id);
          projectContext.updateProject(
            projectContext.currentProject.id,
            { equipment: updatedList },
            'Équipement supprimé',
            'Utilisateur',
            `Suppression de l'équipement ${toDelete.name}`
          );
          setSelectedEquipment(null);
          setShowDetailModal(false);
        }}
        onUpdateMaintenance={(updated) => {
          if (!projectContext?.currentProject || !projectContext.updateProject) return;
          const updatedList = equipment.map(eq => eq.id === updated.id ? { ...updated } : eq);
          projectContext.updateProject(
            projectContext.currentProject.id,
            { equipment: updatedList },
            'Maintenance équipement mise à jour',
            'Utilisateur',
            `Mise à jour maintenance pour ${updated.name}`
          );
          setSelectedEquipment(updated);
        }}
      />

        {/* État vide avec design glassmorphism */}
        {filteredEquipment.length === 0 && (
          <div className="glass-card p-12 rounded-xl text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Settings className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun équipement trouvé</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche ou ajoutez un nouvel équipement pour commencer.
            </p>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Ajouter un équipement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default Equipment;
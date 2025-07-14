import React, { useState, useContext } from 'react';
import { Plus, Filter, Search, MapPin, Calendar } from 'lucide-react';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
          <p className="text-gray-600 mt-1">Gérez votre parc d'équipements</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <MapPin className="w-4 h-4" />
            Localisation
          </button>
          <button
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            onClick={() => setShowAddEquipment(true)}
          >
            <Plus className="w-4 h-4" />
            Nouvel Équipement
          </button>
        </div>
      </div>

      {/* Statistiques synthétiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{equipmentStats.total}</div>
          <div className="text-sm text-gray-600">Total équipements</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{equipmentStats.available}</div>
          <div className="text-sm text-gray-600">Disponibles</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{equipmentStats.inUse}</div>
          <div className="text-sm text-gray-600">En service</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{equipmentStats.maintenance}</div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            onClick={() => setShowMaintenanceModal(true)}
          >
            <Calendar className="w-4 h-4" />
            Planning Maintenance
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout d'équipement */}
      {showAddEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Ajouter un équipement</h2>
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

      {/* Equipment Grid */}
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

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement trouvé</h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou ajoutez un nouvel équipement.
          </p>
        </div>
      )}
    </div>
  );
};


export default Equipment;
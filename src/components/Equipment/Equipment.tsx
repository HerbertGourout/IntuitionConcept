import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar, Wrench, Settings, BarChart3, CheckCircle, AlertTriangle, Grid3X3 } from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailModal from './EquipmentDetailModal';
import MaintenancePlanningModal from './MaintenancePlanningModal';
import EquipmentForm from './EquipmentForm';
import { EquipmentService } from '../../services/equipmentService';
import type { Equipment } from '../../types/index';

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
    lastMaintenance: equipment.lastMaintenance || new Date().toISOString(),
    nextMaintenance: equipment.nextMaintenance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  // Ajouter les propriétés optionnelles seulement si définies et non vides
  if (equipment.assignedProject && equipment.assignedProject.trim()) {
    cleaned.assignedProject = equipment.assignedProject.trim();
  }
  
  if (equipment.operator && equipment.operator.trim()) {
    cleaned.operator = equipment.operator.trim();
  }
  
  if (equipment.brand && equipment.brand.trim()) {
    cleaned.brand = equipment.brand.trim();
  }
  
  if (equipment.dailyRate !== undefined) {
    cleaned.dailyRate = equipment.dailyRate;
  }
  
  if (equipment.description && equipment.description.trim()) {
    cleaned.description = equipment.description.trim();
  }
  
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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Charger les équipements depuis Firebase
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        // Ne plus initialiser automatiquement les données de test
        // Les données de test doivent être ajoutées manuellement via une action spécifique si nécessaire
        
        // Charger les équipements
        const equipmentList = await EquipmentService.getAllEquipment();
        setEquipment(equipmentList);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      } finally {
        // Loading terminé
      }
    };

    loadEquipment();

    // Écouter les changements en temps réel
    const unsubscribe = EquipmentService.subscribeToEquipment((equipmentList) => {
      setEquipment(equipmentList);
    });

    return () => unsubscribe();
  }, []);

  const newEquipment: Equipment = {
    id: '',
    name: '',
    type: 'other',
    model: '',
    serialNumber: '',
    status: 'available',
    location: '',
    lastMaintenance: new Date().toISOString(),
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Gestion de l'ajout d'équipement
  const handleAddEquipment = async (values: Equipment) => {
    try {
      const cleanedData = cleanEquipmentData(values);
      await EquipmentService.addEquipment(cleanedData);
      setShowAddEquipment(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout de l\'équipement.');
    }
  };

  // Filtrage des équipements
  const filteredEquipment = equipment.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Types d'équipements uniques pour le filtre
  const equipmentTypes = Array.from(new Set(equipment.map(item => item.type)));

  return (
    <div className="space-y-6">
        {/* Header avec design glassmorphism */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Équipements</h1>
                <p className="text-gray-600 mt-1">Suivi et maintenance du parc d'équipements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Planning Maintenance
              </button>
              <button
                onClick={() => setShowAddEquipment(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {equipment.filter(e => e.status === 'available').length}
                  </div>
                  <div className="text-sm text-green-700">Disponibles</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {equipment.filter(e => e.status === 'in-use').length}
                  </div>
                  <div className="text-sm text-blue-700">En utilisation</div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {equipment.filter(e => e.status === 'maintenance').length}
                  </div>
                  <div className="text-sm text-orange-700">En maintenance</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {equipment.filter(e => e.status === 'out-of-service').length}
                  </div>
                  <div className="text-sm text-red-700">Hors service</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponible</option>
                <option value="in-use">En utilisation</option>
                <option value="maintenance">En maintenance</option>
                <option value="out-of-service">Hors service</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal d'ajout d'équipement */}
        {showAddEquipment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
        {showDetailModal && selectedEquipment && (
          <EquipmentDetailModal
            equipment={selectedEquipment}
            onClose={() => {
              setSelectedEquipment(null);
              setShowDetailModal(false);
            }}
            onEdit={async (updated) => {
              try {
                await EquipmentService.updateEquipment(updated.id, {
                  name: updated.name,
                  type: updated.type,
                  brand: updated.model,
                  model: updated.model,
                  serialNumber: updated.serialNumber,
                  status: updated.status as Equipment['status'],
                  location: updated.location,
                  assignedTo: updated.operator
                });
                setSelectedEquipment(updated);
              } catch (error) {
                console.error('Erreur lors de la modification:', error);
                alert('Erreur lors de la modification de l\'équipement.');
              }
            }}
            onDelete={async (toDelete) => {
              try {
                // Fermer la modale immédiatement pour une meilleure réactivité
                setShowDetailModal(false);
                
                // Supprimer l'équipement
                await EquipmentService.deleteEquipment(toDelete.id);
                
                // Mettre à jour l'état local pour refléter la suppression
                setEquipment(prevEquipment => 
                  prevEquipment.filter(eq => eq.id !== toDelete.id)
                );
                
                // S'assurer que l'équipement sélectionné est bien effacé
                setSelectedEquipment(null);
                
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de l\'équipement.');
              }
            }}
            onUpdateMaintenance={async (updated) => {
              try {
                await EquipmentService.updateEquipment(updated.id, {
                  lastMaintenanceDate: updated.lastMaintenance ? new Date(updated.lastMaintenance) : undefined,
                  nextMaintenanceDate: updated.nextMaintenance ? new Date(updated.nextMaintenance) : undefined
                });
                setSelectedEquipment(updated);
              } catch (error) {
                console.error('Erreur lors de la mise à jour maintenance:', error);
                alert('Erreur lors de la mise à jour de la maintenance.');
              }
            }}
          />
        )}

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
  );
};

export default Equipment;

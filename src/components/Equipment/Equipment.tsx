/**
 * EXEMPLE DE MIGRATION - Equipment.tsx
 * 
 * Ce fichier montre comment migrer Equipment.tsx pour utiliser l'isolation par projet
 * Copiez ce code dans Equipment.tsx pour appliquer la migration
 */

import React, { useState } from 'react';
import { Plus, Filter, Search, Wrench, Settings, BarChart3, CheckCircle, AlertTriangle, Grid3X3 } from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailModal from './EquipmentDetailModal';
import MaintenancePlanningModal from './MaintenancePlanningModal';
import EquipmentForm from './EquipmentForm';
import { useProjectEquipment } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';
import type { Equipment } from '../../types/index';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';
import EmptyState from '../UI/EmptyState';
import NoProjectSelected from '../UI/NoProjectSelected';

const EquipmentMigrated: React.FC = () => {
  const { currentProject } = useProjects();
  const { equipment, loading, addEquipment } = useProjectEquipment(currentProject?.id || null);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Si aucun projet n'est sélectionné
  if (!currentProject) {
    return (
      <PageContainer>
        <NoProjectSelected />
      </PageContainer>
    );
  }

  // Filtrage des équipements
  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Statistiques calculées depuis les vraies données
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in_use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
  };

  const handleAddEquipment = async (equipmentData: Omit<Equipment, 'id'>) => {
    try {
      await addEquipment(equipmentData);
      setShowAddEquipment(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement:', error);
      alert('Erreur lors de l\'ajout de l\'équipement');
    }
  };

  const handleEquipmentClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowDetailModal(true);
  };

  const handleMaintenanceClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowMaintenanceModal(true);
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-sm border border-white/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Équipements
              </h1>
              <p className="text-gray-600 mt-1">
                Projet: {currentProject.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEquipment(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Nouvel Équipement
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Total Équipements</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">{stats.available}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Disponibles</h3>
          {stats.total > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-800"
                style={{ width: `${(stats.available / stats.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{stats.inUse}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">En Service</h3>
          {stats.total > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-800"
                style={{ width: `${(stats.inUse / stats.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-orange-600">{stats.maintenance}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Maintenance</h3>
          {stats.total > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-800"
                style={{ width: `${(stats.maintenance / stats.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="in_use">En service</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Hors service</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les types</option>
            <option value="vehicle">Véhicule</option>
            <option value="machinery">Machinerie</option>
            <option value="tool">Outil</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>

      {/* Liste des équipements */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des équipements...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        equipment.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucun équipement"
            description={`Commencez par ajouter votre premier équipement au projet "${currentProject.name}"`}
            actionLabel="Ajouter un équipement"
            onAction={() => setShowAddEquipment(true)}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun équipement ne correspond à vos critères de recherche"
            actionLabel="Réinitialiser les filtres"
            onAction={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterType('all');
            }}
          />
        )
      ) : (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Équipements ({filteredEquipment.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onClick={() => handleEquipmentClick(item)}
                onMaintenanceClick={() => handleMaintenanceClick(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddEquipment && (
        <EquipmentForm
          onClose={() => setShowAddEquipment(false)}
          onSave={handleAddEquipment}
        />
      )}

      {showDetailModal && selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {showMaintenanceModal && selectedEquipment && (
        <MaintenancePlanningModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </PageContainer>
  );
};

export default EquipmentMigrated;

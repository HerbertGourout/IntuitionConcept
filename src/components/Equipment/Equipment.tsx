import React, { useState, useContext } from 'react';
import { Plus, Filter, Search, MapPin, Calendar } from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import ProjectContext from '../../contexts/ProjectContext';
import type { Project, Equipment } from '../../types';

const Equipment: React.FC = () => {
  const projectContext = useContext(ProjectContext);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Générer des équipements temporaires basés sur le projet actuel
  const equipment = projectContext?.currentProject ? generateEquipmentFromProject(projectContext.currentProject) : [];

  const filteredEquipment = equipment.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const statusOptions = [
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

  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in-use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length
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
          <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nouvel Équipement
          </button>
        </div>
      </div>

      {/* Stats */}
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
            <Calendar className="w-4 h-4" />
            Planning Maintenance
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map((equipment) => (
          <EquipmentCard
            key={equipment.id}
            equipment={equipment}
            onClick={() => console.log('Ouvrir équipement', equipment.id)}
          />
        ))}
      </div>

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

// Fonction utilitaire pour générer des équipements temporaires basés sur le projet
const generateEquipmentFromProject = (_project: Pick<Project, 'budget' | 'location' | 'id'>): Equipment[] => {
  // Pas de données de démonstration - retourner un tableau vide
  // Les équipements réels seront chargés depuis la base de données
  return [];
};

export default Equipment;
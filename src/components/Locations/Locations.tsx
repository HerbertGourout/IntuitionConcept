import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2,
  Home,
  Package,
  CheckCircle,
  Warehouse, 
  Users, 
  Plus, 
  Edit,
  Trash2, 
  Phone,
  AlertTriangle,
  Clock,
  Activity,
  Navigation,
  Map,
  X
} from 'lucide-react';
import { LocationService } from '../../services/locationService';
import { useProjectContext } from '../../contexts/ProjectContext';
import InteractiveMap from '../Maps/InteractiveMap';

// Interface locale pour compatibilité avec l'UI existante
interface LocalLocation {
  id: string;
  name: string;
  type: 'site' | 'office' | 'warehouse' | 'depot';
  address: string;
  city: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  projectsCount: number;
  equipmentCount: number;
  description?: string;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<LocalLocation[]>([]);
  const [, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocalLocation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { currentProject, projects } = useProjectContext();
  const [formData, setFormData] = useState({
    name: '',
    type: 'site' as 'site' | 'office' | 'warehouse' | 'depot',
    address: '',
    city: '',
    region: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    description: '',
    contact: {
      name: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Récupérer les localisations depuis Firebase
        const firebaseLocations = await LocationService.getAllLocations();
        
        // Convertir vers le format local pour compatibilité UI
        let convertedLocations: LocalLocation[] = firebaseLocations.map(loc => ({
          id: loc.id,
          name: loc.name,
          type: loc.type === 'construction_site' ? 'site' : 
                loc.type === 'storage' ? 'depot' : loc.type as 'office' | 'warehouse',
          address: loc.address,
          city: loc.address.split(',')[1]?.trim() || 'Ville inconnue',
          region: 'Région',
          coordinates: loc.coordinates,
          status: loc.status,
          // Calcul réel du nombre de projets liés à cette localisation
          projectsCount: projects.filter(p => (p as any).locationId === loc.id || p.location === loc.name).length,
          equipmentCount: loc.equipmentCount,
          description: loc.description,
          contact: loc.contact
        }));

        // Filtrer uniquement les localisations liées au projet sélectionné
        if (currentProject) {
          convertedLocations = convertedLocations.filter(l =>
            (currentProject as any).locationId === l.id || currentProject.location === l.name
          );
        } else {
          // Si aucun projet n'est sélectionné, pas de données (éviter d'afficher des localisations hors contexte)
          convertedLocations = [];
        }
        
        setLocations(convertedLocations);
      } catch (error) {
        console.error('Erreur lors du chargement des localisations:', error);
        // Fallback vers données locales en cas d'erreur
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
    // Recalculer quand le projet sélectionné change ou que la liste des projets évolue
  }, [currentProject, projects]);

  // Statistiques calculées
  const stats = {
    total: locations.length,
    active: locations.filter(l => l.status === 'active').length,
    maintenance: locations.filter(l => l.status === 'maintenance').length,
    totalProjects: locations.reduce((sum, l) => sum + l.projectsCount, 0)
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'site': return <Building2 className="w-5 h-5" />;
      case 'office': return <Home className="w-5 h-5" />;
      case 'warehouse': return <Warehouse className="w-5 h-5" />;
      case 'depot': return <Package className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Actif
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-700 border border-orange-200">
            <Clock className="w-3 h-3" />
            Maintenance
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Inactif
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'site': return 'Chantier';
      case 'office': return 'Bureau';
      case 'warehouse': return 'Entrepôt';
      case 'depot': return 'Dépôt';
      default: return type;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'site',
      address: '',
      city: '',
      region: '',
      status: 'active',
      description: '',
      contact: {
        name: '',
        phone: '',
        email: ''
      }
    });
  };

  const handleAdd = () => {
    setEditingLocation(null);
    resetForm();
    setIsModalVisible(true);
  };

  const handleEdit = (location: LocalLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address,
      city: location.city,
      region: location.region,
      status: location.status,
      description: location.description || '',
      contact: {
        name: location.contact.name,
        phone: location.contact.phone,
        email: location.contact.email || ''
      }
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette localisation ?')) {
      setLocations(locations.filter(l => l.id !== id));
      // suppression effectuée
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city || !formData.region) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (editingLocation) {
      // Modification
      setLocations(locations.map(l => 
        l.id === editingLocation.id 
          ? { ...l, ...formData, projectsCount: l.projectsCount, equipmentCount: l.equipmentCount }
          : l
      ));
    } else {
      // Ajout
      const newLocation: LocalLocation = {
        id: Date.now().toString(),
        ...formData,
        projectsCount: 0,
        equipmentCount: 0
      };
      setLocations([...locations, newLocation]);
    }
    
    setIsModalVisible(false);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('contact.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="glass-card p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Localisations
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion des sites, bureaux et entrepôts
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Localisation
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Actifs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Maintenance</p>
              <p className="text-2xl font-bold text-gray-800">{stats.maintenance}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Projets</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des localisations */}
      <div className="glass-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Toutes les localisations ({locations.length})
            </h2>
          </div>
          
          {/* Toggle Vue Liste/Carte */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Map className="w-4 h-4" />
              Carte
            </button>
          </div>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune localisation</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre première localisation</p>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:scale-105 transition-transform duration-200"
            >
              Ajouter une localisation
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-96">
            <InteractiveMap
              markers={locations
                .filter(location => location.coordinates)
                .map(location => ({
                  id: location.id,
                  lat: location.coordinates!.lat,
                  lng: location.coordinates!.lng,
                  title: location.name,
                  description: `${getTypeLabel(location.type)} - ${location.address}`,
                  type: 'project' as const,
                  status: location.status,
                  icon: location.type
                }))}
              center={
                locations.length > 0 && locations[0].coordinates
                  ? locations[0].coordinates
                  : { lat: 14.6928, lng: -17.4467 }
              }
              zoom={10}
              height="100%"
              onMarkerClick={(marker) => {
                const location = locations.find(l => l.id === marker.id);
                if (location) {
                  handleEdit(location);
                }
              }}
              showControls={true}
              enableGeolocation={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Header de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600">
                      {getLocationIcon(location.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-500">{getTypeLabel(location.type)}</p>
                    </div>
                  </div>
                  {getStatusBadge(location.status)}
                </div>

                {/* Adresse */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-sm text-gray-500">{location.city}, {location.region}</p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Projets</span>
                    </div>
                    <p className="text-lg font-bold text-purple-700">{location.projectsCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Package className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Équipements</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">{location.equipmentCount}</p>
                  </div>
                </div>

                {/* Contact */}
                {location.contact && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{location.contact.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{location.contact.phone}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(location)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 rounded-lg font-medium hover:from-blue-500/20 hover:to-cyan-500/20 hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-600 rounded-lg font-medium hover:from-red-500/20 hover:to-pink-500/20 hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">
                  {editingLocation ? 'Modifier la localisation' : 'Nouvelle localisation'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsModalVisible(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la localisation *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Chantier Centre-Ville"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="site">🏗️ Chantier</option>
                    <option value="office">🏢 Bureau</option>
                    <option value="warehouse">🏭 Entrepôt</option>
                    <option value="depot">📦 Dépôt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Rue de la Construction"
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Paris"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région *
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    placeholder="Île-de-France"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="active">✅ Actif</option>
                  <option value="inactive">❌ Inactif</option>
                  <option value="maintenance">🔧 Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="Description optionnelle de la localisation"
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du responsable
                    </label>
                    <input
                      type="text"
                      value={formData.contact.name}
                      onChange={(e) => handleInputChange('contact.name', e.target.value)}
                      placeholder="Nom du contact"
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                      placeholder="01 23 45 67 89"
                      className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalVisible(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {editingLocation ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;

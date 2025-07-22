import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { 
  MapPin, 
  Building, 
  Warehouse, 
  Users, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { LocationService, Location as FirebaseLocation } from '../../services/locationService';

const { Option } = Select;
const { TextArea } = Input;

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
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocalLocation | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Initialiser les données de test si nécessaire
        await LocationService.initializeTestData();
        
        // Récupérer les localisations depuis Firebase
        const firebaseLocations = await LocationService.getAllLocations();
        
        // Convertir vers le format local pour compatibilité UI
        const convertedLocations: LocalLocation[] = firebaseLocations.map(loc => ({
          id: loc.id,
          name: loc.name,
          type: loc.type === 'construction_site' ? 'site' : 
                loc.type === 'storage' ? 'depot' : loc.type as 'office' | 'warehouse',
          address: loc.address,
          city: loc.address.split(',')[1]?.trim() || 'Ville inconnue',
          region: 'Région',
          coordinates: loc.coordinates,
          status: loc.status,
          projectsCount: Math.floor(Math.random() * 5), // Simulation
          equipmentCount: loc.equipmentCount,
          description: loc.description,
          contact: loc.contact
        }));
        
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
  }, []);

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

  const handleAdd = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.setFieldsValue(location);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    message.success('Localisation supprimée avec succès');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingLocation) {
        // Modification
        setLocations(locations.map(l => 
          l.id === editingLocation.id 
            ? { ...l, ...values }
            : l
        ));
        message.success('Localisation modifiée avec succès');
      } else {
        // Ajout
        const newLocation: Location = {
          id: Date.now().toString(),
          ...values,
          projectsCount: 0,
          equipmentCount: 0
        };
        setLocations([...locations, newLocation]);
        message.success('Localisation ajoutée avec succès');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
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
        <div className="flex items-center gap-3 mb-6">
          <Navigation className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Toutes les localisations ({locations.length})
          </h2>
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
                    <Edit3 className="w-4 h-4" />
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
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">
              {editingLocation ? 'Modifier la localisation' : 'Nouvelle localisation'}
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingLocation ? 'Modifier' : 'Ajouter'}
        cancelText="Annuler"
        className="modal-glassmorphism"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Nom de la localisation"
              rules={[{ required: true, message: 'Le nom est requis' }]}
            >
              <Input placeholder="Ex: Chantier Centre-Ville" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Le type est requis' }]}
            >
              <Select placeholder="Sélectionner un type">
                <Option value="site">Chantier</Option>
                <Option value="office">Bureau</Option>
                <Option value="warehouse">Entrepôt</Option>
                <Option value="depot">Dépôt</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Adresse"
            rules={[{ required: true, message: 'L\'adresse est requise' }]}
          >
            <Input placeholder="123 Rue de la Construction" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="city"
              label="Ville"
              rules={[{ required: true, message: 'La ville est requise' }]}
            >
              <Input placeholder="Paris" />
            </Form.Item>

            <Form.Item
              name="region"
              label="Région"
              rules={[{ required: true, message: 'La région est requise' }]}
            >
              <Input placeholder="Île-de-France" />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Statut"
            rules={[{ required: true, message: 'Le statut est requis' }]}
          >
            <Select placeholder="Sélectionner un statut">
              <Option value="active">Actif</Option>
              <Option value="inactive">Inactif</Option>
              <Option value="maintenance">Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={3} 
              placeholder="Description optionnelle de la localisation"
            />
          </Form.Item>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-700 mb-3">Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name={['contact', 'name']}
                label="Nom du responsable"
              >
                <Input placeholder="Jean Dupont" />
              </Form.Item>

              <Form.Item
                name={['contact', 'phone']}
                label="Téléphone"
              >
                <Input placeholder="01 23 45 67 89" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Locations;

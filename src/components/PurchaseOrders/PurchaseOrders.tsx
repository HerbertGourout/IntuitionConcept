import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  User,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { PurchaseOrder, Supplier, DeliveryNote, PURCHASE_ORDER_STATUS_LABELS } from '../../types/purchaseOrder';
import PurchaseOrderCard from './PurchaseOrderCard';
import PurchaseOrderModal from './PurchaseOrderModal';
import SupplierModal from './SupplierModal';
import DeliveryNoteModal from './DeliveryNoteModal';
import { AnimatedCounter } from '../UI/VisualEffects';

const PurchaseOrders: React.FC = () => {
  const { 
    purchaseOrders, 
    deliveryNotes,
    suppliers, 
    loadingPurchaseOrders,
    deleteDeliveryNote
  } = usePurchaseOrderContext();
  const { projects } = useProjectContext();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<'purchase-orders' | 'delivery-notes'>('purchase-orders');
  
  // États pour les modals
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showDeliveryNoteModal, setShowDeliveryNoteModal] = useState(false);
  
  // États pour l'édition
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);


  // Filtrage des bons d'achat
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesProject = projectFilter === 'all' || order.projectId === projectFilter;
      const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter;
      
      return matchesSearch && matchesStatus && matchesProject && matchesSupplier;
    });
  }, [purchaseOrders, searchTerm, statusFilter, projectFilter, supplierFilter]);

  // Fonctions pour gérer les modals
  const handleCreatePurchaseOrder = () => {
    setSelectedPurchaseOrder(null);
    setShowPurchaseOrderModal(true);
  };

  const handleEditPurchaseOrder = (order: PurchaseOrder) => {
    setSelectedPurchaseOrder(order);
    setShowPurchaseOrderModal(true);
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowSupplierModal(true);
  };

  const handleCreateDeliveryNote = (purchaseOrder?: PurchaseOrder) => {
    setSelectedDeliveryNote(null);
    setSelectedPurchaseOrder(purchaseOrder || null);
    setShowDeliveryNoteModal(true);
  };

  const handleEditDeliveryNote = (deliveryNote: DeliveryNote) => {
    setSelectedDeliveryNote(deliveryNote);
    setSelectedPurchaseOrder(null);
    setShowDeliveryNoteModal(true);
  };

  const handleDeleteDeliveryNote = async (deliveryNote: DeliveryNote) => {
    console.log('UI: Tentative de suppression directe du bon de livraison:', deliveryNote.deliveryNumber);
    
    // Suppression directe sans confirmation pour diagnostiquer le problème
    try {
      console.log('UI: Début de suppression du bon de livraison:', {
        id: deliveryNote.id,
        deliveryNumber: deliveryNote.deliveryNumber,
        status: deliveryNote.status
      });
      
      await deleteDeliveryNote(deliveryNote.id);
      
      console.log('UI: Suppression réussie, affichage du message de succès');
      alert(`Bon de livraison "${deliveryNote.deliveryNumber}" supprimé avec succès.`);
      
    } catch (error) {
      console.error('UI: Erreur lors de la suppression:', {
        deliveryNoteId: deliveryNote.id,
        deliveryNumber: deliveryNote.deliveryNumber,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de la suppression du bon de livraison: ${errorMessage}`);
    }
  };

  const closeAllModals = () => {
    setShowPurchaseOrderModal(false);
    setShowSupplierModal(false);
    setShowDeliveryNoteModal(false);
    setSelectedPurchaseOrder(null);
    setSelectedSupplier(null);
    setSelectedDeliveryNote(null);
  };

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(order => order.status === 'draft' || order.status === 'pending_approval').length;
    const approved = purchaseOrders.filter(order => order.status === 'approved').length;
    const ordered = purchaseOrders.filter(order => order.status === 'ordered').length;
    const delivered = purchaseOrders.filter(order => order.status === 'delivered').length;
    const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total,
      pending,
      approved,
      ordered,
      delivered,
      totalValue
    };
  }, [purchaseOrders]);

  // Calculer les statistiques des bons de livraison
  const deliveryStats = useMemo(() => {
    const total = deliveryNotes.length;
    const pending = deliveryNotes.filter(note => note.status === 'pending').length;
    const inTransit = deliveryNotes.filter(note => note.status === 'in_transit').length;
    const delivered = deliveryNotes.filter(note => note.status === 'delivered').length;
    const received = deliveryNotes.filter(note => note.status === 'received').length;
    
    return {
      total,
      pending,
      inTransit,
      delivered,
      received
    };
  }, [deliveryNotes]);

  if (loadingPurchaseOrders) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Bons d'Achat
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion des commandes et approvisionnements
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateSupplier}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Gérer les Fournisseurs</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleCreatePurchaseOrder}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau Bon d'Achat</span>
              </button>
              <button
                onClick={() => handleCreateDeliveryNote()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Truck className="h-5 w-5" />
                <span>Nouveau Bon de Livraison</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commandes</p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={stats.total} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-800"
                style={{ width: `${stats.total > 0 ? 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">
                <AnimatedCounter value={stats.pending} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-800"
                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">
                <AnimatedCounter value={stats.approved} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-800"
                style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-bold text-purple-600">
                <AnimatedCounter value={stats.totalValue} /> FCFA
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Suivi budgétaire</span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Filtre par projet */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les projets</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          {/* Filtre par fournisseur */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les fournisseurs</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          {/* Onglets */}
          <div className="flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('purchase-orders')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'purchase-orders'
                  ? 'bg-white shadow-md text-orange-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Bons d'Achat</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold">
                  {stats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delivery-notes')}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'delivery-notes'
                  ? 'bg-white shadow-md text-green-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Bons de Livraison</span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                  {deliveryStats.total}
                </span>
              </div>
            </button>
          </div>
          
          {/* Actions selon l'onglet actif */}
          <div className="flex space-x-3">
            {activeTab === 'purchase-orders' && (
              <button
                onClick={handleCreatePurchaseOrder}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau Bon d'Achat</span>
              </button>
            )}
            
            {activeTab === 'delivery-notes' && (
              <button
                onClick={() => handleCreateDeliveryNote()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau Bon de Livraison</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu selon l'onglet actif */}
      {activeTab === 'purchase-orders' && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Bons d'Achat ({filteredOrders.length})
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun bon d'achat trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre premier bon d'achat pour gérer vos commandes.
              </p>
              <button
                onClick={handleCreatePurchaseOrder}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau Bon d'Achat</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                <PurchaseOrderCard 
                  key={order.id} 
                  order={order} 
                  onEdit={() => handleEditPurchaseOrder(order)}
                  onCreateDeliveryNote={() => handleCreateDeliveryNote(order)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'delivery-notes' && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Truck className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Bons de Livraison ({deliveryNotes.length})
            </h3>
          </div>

          {deliveryNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun bon de livraison trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier bon de livraison pour suivre vos réceptions.
              </p>
              <button
                onClick={() => handleCreateDeliveryNote()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau Bon de Livraison</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deliveryNotes.map(note => (
                <div key={note.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {note.deliveryNumber}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Bon d'achat: {note.purchaseOrder?.orderNumber || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      note.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      note.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                      note.status === 'received' ? 'bg-purple-100 text-purple-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {note.status === 'delivered' ? 'Livré' :
                       note.status === 'in_transit' ? 'En transit' :
                       note.status === 'received' ? 'Reçu' :
                       'En attente'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date de livraison:</span>
                      <span className="font-medium">
                        {new Date(note.deliveryDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Articles:</span>
                      <span className="font-medium">{note.items.length}</span>
                    </div>
                    {note.deliveredBy && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livré par:</span>
                        <span className="font-medium">{note.deliveredBy}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDeliveryNote(note)}
                      className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Voir détails
                    </button>
                    <button
                      onClick={() => {
                        console.log('BOUTON CLIQUÉ: Tentative de suppression du bon de livraison:', note.id);
                        handleDeleteDeliveryNote(note);
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                      title="Supprimer ce bon de livraison"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {showPurchaseOrderModal && (
        <PurchaseOrderModal
          isOpen={showPurchaseOrderModal}
          onClose={closeAllModals}
          order={selectedPurchaseOrder}
        />
      )}

      {showSupplierModal && (
        <SupplierModal
          isOpen={showSupplierModal}
          onClose={closeAllModals}
          supplier={selectedSupplier}
        />
      )}

      {showDeliveryNoteModal && (
        <DeliveryNoteModal
          isOpen={showDeliveryNoteModal}
          onClose={closeAllModals}
          deliveryNote={selectedDeliveryNote}
          purchaseOrder={selectedPurchaseOrder}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;

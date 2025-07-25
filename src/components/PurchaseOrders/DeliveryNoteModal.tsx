import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Package, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Save,
  MapPin,
  Clock,
  Clipboard
} from 'lucide-react';
import { DeliveryNote, DeliveryNoteItem, PurchaseOrder } from '../../types/purchaseOrder';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';

interface DeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryNote?: DeliveryNote | null;
  purchaseOrder?: PurchaseOrder | null;
}

const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({ 
  isOpen, 
  onClose, 
  deliveryNote, 
  purchaseOrder 
}) => {
  const { addDeliveryNote, updateDeliveryNote, purchaseOrders } = usePurchaseOrderContext();

  // États du formulaire
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    deliveryNumber: '',
    deliveryDate: '',
    deliveredBy: '',
    receivedBy: '',
    deliveryAddress: '',
    transportCompany: '',
    vehicleInfo: '',
    notes: ''
  });

  const [items, setItems] = useState<Omit<DeliveryNoteItem, 'id'>[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  // Générer un numéro de bon de livraison
  const generateDeliveryNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BL-${year}${month}${day}-${random}`;
  };

  // Rafraîchir la liste des bons d'achat quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && !deliveryNote && !purchaseOrder) {
      // Force un petit délai pour s'assurer que les nouveaux bons d'achat sont synchronisés
      const timer = setTimeout(() => {
        console.log('Synchronisation des bons d\'achat:', purchaseOrders.length, 'bons disponibles');
        if (purchaseOrders.length > 0) {
          console.log('Premier bon d\'achat:', purchaseOrders[0]);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, purchaseOrders.length, deliveryNote, purchaseOrder]);

  // Initialiser le formulaire
  useEffect(() => {
    if (deliveryNote) {
      setFormData({
        purchaseOrderId: deliveryNote.purchaseOrderId,
        deliveryNumber: deliveryNote.deliveryNumber,
        deliveryDate: deliveryNote.deliveryDate.split('T')[0],
        deliveredBy: deliveryNote.deliveredBy || '',
        receivedBy: deliveryNote.receivedBy || '',
        deliveryAddress: '',
        transportCompany: '',
        vehicleInfo: '',
        notes: deliveryNote.notes || ''
      });
      setItems(deliveryNote.items.map(item => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        name: item.name,
        orderedQuantity: item.orderedQuantity,
        deliveredQuantity: item.deliveredQuantity,
        unit: item.unit,
        status: item.status,
        condition: item.condition,
        notes: item.notes
      })));
      setSelectedPurchaseOrder(purchaseOrders.find(po => po.id === deliveryNote.purchaseOrderId) || null);
    } else if (purchaseOrder) {
      setFormData({
        purchaseOrderId: purchaseOrder.id,
        deliveryNumber: generateDeliveryNumber(),
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveredBy: '',
        receivedBy: '',
        deliveryAddress: purchaseOrder.deliveryAddress || '',
        transportCompany: '',
        vehicleInfo: '',
        notes: ''
      });
      setItems(purchaseOrder.items.map(item => ({
        purchaseOrderItemId: item.id,
        name: item.name,
        orderedQuantity: item.quantity,
        deliveredQuantity: 0,
        unit: item.unit,
        status: 'pending',
        condition: 'good',
        notes: ''
      })));
      setSelectedPurchaseOrder(purchaseOrder);
    } else {
      setFormData({
        purchaseOrderId: '',
        deliveryNumber: generateDeliveryNumber(),
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveredBy: '',
        receivedBy: '',
        deliveryAddress: '',
        transportCompany: '',
        vehicleInfo: '',
        notes: ''
      });
      setItems([]);
      setSelectedPurchaseOrder(null);
    }
  }, [deliveryNote, purchaseOrder, purchaseOrders]);

  // Gérer la sélection du bon d'achat
  const handlePurchaseOrderChange = (purchaseOrderId: string) => {
    const po = purchaseOrders.find(p => p.id === purchaseOrderId);
    setFormData({ ...formData, purchaseOrderId });
    setSelectedPurchaseOrder(po || null);
    if (po) {
      setItems(po.items.map(item => ({
        purchaseOrderItemId: item.id,
        name: item.name,
        orderedQuantity: item.quantity,
        deliveredQuantity: 0,
        unit: item.unit,
        status: 'pending',
        condition: 'good',
        notes: ''
      })));
    } else {
      setItems([]);
    }
  };

  // Mettre à jour un article
  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'deliveredQuantity') {
      const delivered = Number(value);
      const ordered = updatedItems[index].orderedQuantity;

      if (delivered === 0) updatedItems[index].status = 'pending';
      else if (delivered < ordered) updatedItems[index].status = 'partial';
      else if (delivered === ordered) updatedItems[index].status = 'delivered';
      else updatedItems[index].status = 'excess';
    }

    setItems(updatedItems);
  };

  // Calculer les statistiques de livraison
  const deliveryStats = {
    totalItems: items.length,
    deliveredItems: items.filter(item => item.status === 'delivered').length,
    partialItems: items.filter(item => item.status === 'partial').length,
    pendingItems: items.filter(item => item.status === 'pending').length,
    damagedItems: items.filter(item => item.condition === 'damaged').length
  };

  // Déterminer le statut global
  const determineOverallStatus = (): 'pending' | 'in_transit' | 'delivered' | 'partially_received' | 'received' | 'rejected' => {
    const delivered = deliveryStats.deliveredItems;
    const partial = deliveryStats.partialItems;
    const total = deliveryStats.totalItems;

    if (delivered === total) return 'delivered';
    if (delivered > 0 || partial > 0) return 'partially_received';
    return 'pending';
  };

  // Icônes de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'excess': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Couleurs de condition
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'damaged': return 'text-red-600 bg-red-50';
      case 'defective': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DÉBOGAGE SOUMISSION BON DE LIVRAISON ===');
    console.log('FormData:', formData);
    console.log('Items:', items);
    console.log('SelectedPurchaseOrder:', selectedPurchaseOrder);
    
    // Validation
    if (!formData.purchaseOrderId) {
      console.log('ERREUR: purchaseOrderId manquant');
      alert('Veuillez sélectionner un bon d\'achat.');
      return;
    }
    if (!formData.deliveryDate) {
      console.log('ERREUR: deliveryDate manquante');
      alert('Veuillez saisir une date de livraison.');
      return;
    }
    if (items.length === 0) {
      console.log('ERREUR: aucun article à livrer');
      alert('Aucun article à livrer. Veuillez sélectionner un bon d\'achat contenant des articles.');
      return;
    }
    if (!selectedPurchaseOrder) {
      console.log('ERREUR: selectedPurchaseOrder est null');
      alert('Erreur: bon d\'achat non trouvé.');
      return;
    }
    
    console.log('Validation OK, préparation des données...');
    setLoading(true);
    
    try {
      const deliveryNoteData = {
        purchaseOrderId: formData.purchaseOrderId,
        purchaseOrder: selectedPurchaseOrder,
        deliveryNumber: formData.deliveryNumber,
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        status: determineOverallStatus(),
        items: items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`
        })),
        deliveredBy: formData.deliveredBy || '',
        receivedBy: formData.receivedBy || '',
        notes: formData.notes || '',
        qualityCheck: false,
        overallCondition: 'good' as const
      };
      
      console.log('Données à sauvegarder:', deliveryNoteData);

      if (deliveryNote) {
        console.log('Mise à jour du bon de livraison existant...');
        await updateDeliveryNote(deliveryNote.id, deliveryNoteData);
      } else {
        console.log('Création d\'un nouveau bon de livraison...');
        await addDeliveryNote(deliveryNoteData);
      }
      
      console.log('Sauvegarde réussie!');
      onClose();
    } catch (error) {
      console.error('ERREUR lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : 'Pas de stack trace'
      });
      alert(`Erreur lors de la sauvegarde du bon de livraison: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      console.log('=== FIN DÉBOGAGE ===');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {deliveryNote ? 'Modifier le Bon de Livraison' : 'Nouveau Bon de Livraison'}
              </h2>
              <p className="text-gray-600">
                {deliveryNote ? `Modification du bon ${deliveryNote.deliveryNumber}` : 'Enregistrer une nouvelle livraison'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Formulaire principal */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Informations générales */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Informations de Livraison</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bon d'achat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clipboard className="h-4 w-4 inline mr-1 text-purple-500" />
                    Bon d'Achat *
                  </label>
                  <select
                    value={formData.purchaseOrderId}
                    onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                    disabled={!!purchaseOrder}
                  >
                    <option value="">Sélectionner un bon d'achat</option>
                    {(() => {
                      console.log('=== DÉBOGAGE FILTRAGE BONS D\'ACHAT ===');
                      console.log('Nombre total de bons d\'achat:', purchaseOrders.length);
                      console.log('Bons d\'achat disponibles:', purchaseOrders.map(po => ({ id: po.id, orderNumber: po.orderNumber, status: po.status })));
                      
                      const filteredOrders = purchaseOrders
                        .filter(po => {
                          // Inclure plus de statuts pour permettre la création de bons de livraison
                          const allowedStatuses = ['draft', 'pending_approval', 'approved', 'ordered'];
                          const isAllowed = allowedStatuses.includes(po.status);
                          console.log(`Bon d'achat ${po.orderNumber} (${po.status}): ${isAllowed ? 'INCLUS' : 'EXCLU'}`);
                          return isAllowed;
                        })
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      
                      console.log('Bons d\'achat filtrés:', filteredOrders.length);
                      console.log('=== FIN DÉBOGAGE ===');
                      
                      return filteredOrders.map(po => (
                        <option key={po.id} value={po.id}>
                          {po.orderNumber} - {po.supplier?.name || 'Fournisseur inconnu'} ({po.status === 'ordered' ? 'Commandé' : po.status === 'approved' ? 'Approuvé' : po.status === 'pending_approval' ? 'En attente' : 'Brouillon'})
                        </option>
                      ));
                    })()}
                    {purchaseOrders.filter(po => ['draft', 'pending_approval', 'approved', 'ordered'].includes(po.status)).length === 0 && (
                      <option disabled>Aucun bon d'achat disponible - Créez d'abord un bon d'achat</option>
                    )}
                  </select>
                </div>

                {/* Numéro de livraison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de livraison *
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryNumber}
                    onChange={(e) => setFormData({ ...formData, deliveryNumber: e.target.value })}
                    placeholder="BL-YYYYMMDD-XXX"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                {/* Date de livraison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1 text-orange-500" />
                    Date de livraison *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>

                {/* Livré par */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1 text-blue-500" />
                    Livré par
                  </label>
                  <input
                    type="text"
                    value={formData.deliveredBy}
                    onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
                    placeholder="Nom du livreur"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Reçu par */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1 text-green-500" />
                    Reçu par
                  </label>
                  <input
                    type="text"
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    placeholder="Nom du réceptionnaire"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Entreprise de transport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="h-4 w-4 inline mr-1 text-purple-500" />
                    Entreprise de transport
                  </label>
                  <input
                    type="text"
                    value={formData.transportCompany}
                    onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                    placeholder="Nom de l'entreprise de transport"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Adresse de livraison */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1 text-red-500" />
                    Adresse de livraison
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Adresse complète de livraison"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Informations véhicule */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Informations véhicule
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleInfo}
                    onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                    placeholder="Plaque d'immatriculation, type de véhicule..."
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Statistiques de livraison */}
            {items.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la Livraison</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{deliveryStats.totalItems}</div>
                    <div className="text-sm text-gray-600">Total articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{deliveryStats.deliveredItems}</div>
                    <div className="text-sm text-gray-600">Livrés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{deliveryStats.partialItems}</div>
                    <div className="text-sm text-gray-600">Partiels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{deliveryStats.pendingItems}</div>
                    <div className="text-sm text-gray-600">En attente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{deliveryStats.damagedItems}</div>
                    <div className="text-sm text-gray-600">Endommagés</div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles livrés */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Articles à Réceptionner</span>
              </h3>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Sélectionnez un bon d'achat pour voir les articles à livrer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.unit}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Commandée</div>
                          <div className="font-semibold">{item.orderedQuantity}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Livrée</label>
                          <input
                            type="number"
                            value={item.deliveredQuantity}
                            onChange={(e) => updateItem(index, 'deliveredQuantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            max={item.orderedQuantity * 1.1}
                            step="0.01"
                            className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span className="text-xs capitalize">{item.status}</span>
                          </div>
                        </div>
                        <div>
                          <select
                            value={item.condition}
                            onChange={(e) => updateItem(index, 'condition', e.target.value)}
                            className={`w-full px-2 py-1 text-xs rounded border ${getConditionColor(item.condition)}`}
                          >
                            <option value="good">Bon état</option>
                            <option value="damaged">Endommagé</option>
                            <option value="defective">Défectueux</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            placeholder="Notes..."
                            className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes générales */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes de Livraison</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observations sur la livraison, problèmes rencontrés, remarques..."
                rows={4}
                className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200/50 bg-gray-50/50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Sauvegarde...' : (deliveryNote ? 'Modifier' : 'Enregistrer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryNoteModal;
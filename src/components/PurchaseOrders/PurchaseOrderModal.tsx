import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Building2, 
  User, 
  Calendar, 
  DollarSign,
  Package,
  FileText,
  MapPin,
  Save
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, Supplier } from '../../types/purchaseOrder';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { PurchaseOrderService } from '../../services/purchaseOrderService';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrder | null;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, order }) => {
  const { addPurchaseOrder, updatePurchaseOrder, suppliers } = usePurchaseOrderContext();
  const { projects } = useProjectContext();

  // États du formulaire
  const [formData, setFormData] = useState({
    projectId: '',
    phaseId: '',
    taskId: '',
    supplierId: '',
    requestedDeliveryDate: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    notes: ''
  });

  const [items, setItems] = useState<Omit<PurchaseOrderItem, 'id'>[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire
  useEffect(() => {
    if (order) {
      setFormData({
        projectId: order.projectId,
        phaseId: order.phaseId || '',
        taskId: order.taskId || '',
        supplierId: order.supplierId,
        requestedDeliveryDate: order.requestedDeliveryDate || '',
        deliveryAddress: order.deliveryAddress || '',
        deliveryInstructions: order.deliveryInstructions || '',
        notes: order.notes || ''
      });
      setItems(order.items.map(item => ({
        materialId: item.materialId,
        equipmentId: item.equipmentId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        taxRate: item.taxRate,
        deliveryDate: item.deliveryDate,
        specifications: item.specifications,
        notes: item.notes
      })));
      setSelectedSupplier(suppliers.find(s => s.id === order.supplierId) || null);
    } else {
      // Réinitialiser pour nouveau bon d'achat
      setFormData({
        projectId: '',
        phaseId: '',
        taskId: '',
        supplierId: '',
        requestedDeliveryDate: '',
        deliveryAddress: '',
        deliveryInstructions: '',
        notes: ''
      });
      setItems([]);
      setSelectedSupplier(null);
    }
  }, [order, suppliers]);

  // Ajouter un nouvel article
  const addItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      quantity: 1,
      unit: 'pièce',
      unitPrice: 0,
      totalPrice: 0,
      taxRate: 18, // TVA par défaut
      specifications: '',
      notes: ''
    }]);
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Mettre à jour un article
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculer le prix total si quantité ou prix unitaire change
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  // Calculer les totaux
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.totalPrice * (item.taxRate || 0) / 100), 0);
  const totalAmount = subtotal + taxAmount;

  // Gérer la sélection du fournisseur
  const handleSupplierChange = (supplierId: string) => {
    setFormData({ ...formData, supplierId });
    setSelectedSupplier(suppliers.find(s => s.id === supplierId) || null);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.supplierId || items.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un article.');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        orderNumber: order?.orderNumber || PurchaseOrderService.generateOrderNumber(),
        projectId: formData.projectId,
        phaseId: formData.phaseId || undefined,
        taskId: formData.taskId || undefined,
        supplierId: formData.supplierId,
        supplier: selectedSupplier!,
        status: order?.status || 'draft' as const,
        items: items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`
        })),
        subtotal,
        taxAmount,
        totalAmount,
        currency: 'FCFA',
        orderDate: order?.orderDate || new Date().toISOString(),
        requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
        requestedBy: 'Utilisateur actuel', // À remplacer par l'utilisateur connecté
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        notes: formData.notes || undefined
      };

      if (order) {
        await updatePurchaseOrder(order.id, orderData);
      } else {
        await addPurchaseOrder(orderData);
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du bon d\'achat.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {order ? 'Modifier le Bon d\'Achat' : 'Nouveau Bon d\'Achat'}
              </h2>
              <p className="text-gray-600">
                {order ? `Modification du bon ${order.orderNumber}` : 'Créer une nouvelle commande'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Informations générales */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Informations Générales</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Projet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="h-4 w-4 inline mr-1 text-green-500" />
                    Projet *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1 text-blue-500" />
                    Fournisseur *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date de livraison souhaitée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1 text-orange-500" />
                    Date de livraison souhaitée
                  </label>
                  <input
                    type="date"
                    value={formData.requestedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Adresse de livraison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1 text-purple-500" />
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
              </div>

              {/* Instructions de livraison */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions de livraison
                </label>
                <textarea
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  placeholder="Instructions spéciales pour la livraison..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Articles */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>Articles à Commander</span>
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un Article</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun article ajouté. Cliquez sur "Ajouter un Article" pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Nom de l'article */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nom de l'article *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            placeholder="Nom de l'article"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* Quantité */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantité *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* Unité */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unité
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="pièce">pièce</option>
                            <option value="kg">kg</option>
                            <option value="m">m</option>
                            <option value="m²">m²</option>
                            <option value="m³">m³</option>
                            <option value="litre">litre</option>
                            <option value="tonne">tonne</option>
                            <option value="sac">sac</option>
                            <option value="palette">palette</option>
                          </select>
                        </div>

                        {/* Prix unitaire */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Prix unitaire (FCFA)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Prix total */}
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Prix total :</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.totalPrice.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Récapitulatif financier */}
            {items.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Récapitulatif Financier</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total :</span>
                    <span className="font-medium">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA :</span>
                    <span className="font-medium">{taxAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total :</span>
                    <span className="text-green-600">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes et Commentaires</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes additionnelles, spécifications particulières..."
                rows={4}
                className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Footer avec actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200/50 bg-gray-50/50">
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
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Sauvegarde...' : (order ? 'Modifier' : 'Créer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;

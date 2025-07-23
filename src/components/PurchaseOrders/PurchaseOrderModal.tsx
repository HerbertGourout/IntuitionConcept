import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingCart, 
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
import { uploadPdfToFirebase, deletePdfFromFirebase } from '../../utils/uploadPdfToFirebase';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrder | null;
}

// Typage des champs modifiables dans un article
type ItemField = 'name' | 'description' | 'quantity' | 'unit' | 'unitPrice' | 'taxRate' | 'specifications' | 'notes' | 'deliveryDate';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Gestion du PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>('');
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);

  // Phases et tâches dynamiques
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const phases = selectedProject?.phases || [];
  const selectedPhase = phases.find(ph => ph.id === formData.phaseId);
  const tasks = selectedPhase?.tasks || [];

  // Initialisation du formulaire
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

      setItems(
        order.items.map(item => ({
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
        }))
      );

      setSelectedSupplier(suppliers.find(s => s.id === order.supplierId) || null);

      // Pré-remplir le PDF
      if (order.pdfUrl) {
        setPdfUrl(order.pdfUrl);
        const match = order.pdfUrl.match(/[^/]+\.pdf$/i);
        setPdfName(match ? match[0] : 'Document.pdf');
      } else {
        setPdfUrl(null);
        setPdfName('');
      }
    } else {
      // Réinitialiser pour un nouveau bon
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
      setPdfUrl(null);
      setPdfName('');
    }
    if (order) {
      console.log('[PurchaseOrderModal] Initialisation du formulaire avec un bon existant');
    } else {
      console.log('[PurchaseOrderModal] Réinitialisation du formulaire pour un nouveau bon');
    }
  }, [order]);

  // Ajouter un article
  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        name: '',
        description: '',
        quantity: 1,
        unit: 'pièce',
        unitPrice: 0,
        totalPrice: 0,
        taxRate: 18,
        specifications: '',
        notes: '',
        deliveryDate: ''
      }
    ]);
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Mettre à jour un article
  const updateItem = (index: number, field: ItemField, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // Recalculer le prix total si nécessaire
      if (field === 'quantity' || field === 'unitPrice') {
        item.totalPrice = item.quantity * item.unitPrice;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Calculs financiers
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.totalPrice * (item.taxRate || 0) / 100), 0);
  const totalAmount = subtotal + taxAmount;

  // Gestion du changement de fournisseur
  const handleSupplierChange = (supplierId: string) => {
    setFormData(prev => ({ ...prev, supplierId }));
    setSelectedSupplier(suppliers.find(s => s.id === supplierId) || null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!formData.projectId) errors.projectId = 'Projet obligatoire';
    if (phases.length > 0 && !formData.phaseId) errors.phaseId = 'Phase obligatoire';
    if (tasks.length > 0 && !formData.taskId) errors.taskId = 'Tâche obligatoire';
    if (!formData.supplierId) errors.supplierId = 'Fournisseur obligatoire';
    if (items.length === 0) errors.items = 'Ajoutez au moins un article';

    items.forEach((item, idx) => {
      if (!item.name) errors[`item-name-${idx}`] = 'Nom requis';
      if (!item.quantity || item.quantity <= 0) errors[`item-quantity-${idx}`] = 'Quantité > 0 requise';
      if (!item.unit) errors[`item-unit-${idx}`] = 'Unité requise';
      if (item.unitPrice < 0) errors[`item-unitPrice-${idx}`] = 'Prix unitaire requis';
      if (item.taxRate === undefined || item.taxRate < 0) errors[`item-taxRate-${idx}`] = 'TVA requise';
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
        requestedBy: 'Utilisateur actuel', // À remplacer par auth
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        notes: formData.notes || undefined,
        pdfUrl: pdfUrl || undefined
      };

      if (order) {
        await updatePurchaseOrder(order.id, orderData);
      } else {
        await addPurchaseOrder(orderData);
      }

      onClose();
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du bon d\'achat.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
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
            aria-label="Fermer le modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Formulaire principal */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projet <span className="text-red-500">*</span>
                    <span className="ml-1 align-middle" title="Sélectionnez le projet concerné par ce bon d'achat. Ce choix conditionne les phases et tâches disponibles.">
                      <svg aria-label="Aide projet" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                        <circle cx="10" cy="10" r="10" />
                        <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                      </svg>
                    </span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData({
                      ...formData,
                      projectId: e.target.value,
                      phaseId: '',
                      taskId: ''
                    })}
                    required
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 transition-all duration-300 ${
                      formErrors.projectId ? 'border-red-500' : 'border-white/30'
                    }`}
                  >
                    <option value="">Sélectionner un projet...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  {formErrors.projectId && (
                    <div className="text-red-600 text-xs mt-1">{formErrors.projectId}</div>
                  )}
                </div>

                {/* Pièce jointe PDF */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    Pièce jointe (PDF)
                    <span className="ml-1" title="Joindre un devis, une facture ou tout document PDF lié à ce bon d'achat.">
                      <svg aria-label="Aide pièce jointe" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                        <circle cx="10" cy="10" r="10" />
                        <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                      </svg>
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.type !== 'application/pdf') {
                        alert('Seuls les fichiers PDF sont autorisés.');
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Le fichier ne doit pas dépasser 10 Mo.');
                        return;
                      }
                      setUploadingPdf(true);
                      try {
                        const url = await uploadPdfToFirebase(file, order?.orderNumber || 'draft');
                        setPdfUrl(url);
                        setPdfName(file.name);
                      } catch (err: unknown) {
                        const message = err instanceof Error ? err.message : "Erreur lors de l'upload du PDF.";
                        alert(message);
                      } finally {
                        setUploadingPdf(false);
                      }
                    }}
                    disabled={uploadingPdf}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingPdf && <div className="text-blue-500 text-xs mt-1">Envoi du PDF en cours...</div>}
                  {pdfUrl && (
                    <div className="flex items-center mt-2 space-x-2">
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                        {pdfName}
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!pdfUrl) return;
                          setUploadingPdf(true);
                          try {
                            await deletePdfFromFirebase(pdfUrl);
                            setPdfUrl(null);
                            setPdfName('');
                          } catch (err: unknown) {
                            const message = err instanceof Error ? err.message : "Erreur lors de la suppression du PDF.";
                            alert(message);
                          } finally {
                            setUploadingPdf(false);
                          }
                        }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Phase */}
                {phases.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phase <span className="text-red-500">*</span>
                      <span className="ml-1" title="La phase correspond à une étape du projet. Sélectionnez la phase concernée par cette commande.">
                        <svg aria-label="Aide phase" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                          <circle cx="10" cy="10" r="10" />
                          <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                        </svg>
                      </span>
                    </label>
                    <select
                      value={formData.phaseId}
                      onChange={e => setFormData({ ...formData, phaseId: e.target.value, taskId: '' })}
                      required
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 transition-all duration-300 ${
                        formErrors.phaseId ? 'border-red-500' : 'border-white/30'
                      }`}
                    >
                      <option value="">Sélectionner une phase...</option>
                      {phases.map(phase => (
                        <option key={phase.id} value={phase.id}>{phase.name}</option>
                      ))}
                    </select>
                    {formErrors.phaseId && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.phaseId}</div>
                    )}
                  </div>
                )}

                {/* Tâche */}
                {tasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tâche <span className="text-red-500">*</span>
                      <span className="ml-1" title="La tâche précise l'action ou le lot concerné. Filtrée par la phase choisie.">
                        <svg aria-label="Aide tâche" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                          <circle cx="10" cy="10" r="10" />
                          <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                        </svg>
                      </span>
                    </label>
                    <select
                      value={formData.taskId}
                      onChange={e => setFormData({ ...formData, taskId: e.target.value })}
                      required
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 transition-all duration-300 ${
                        formErrors.taskId ? 'border-red-500' : 'border-white/30'
                      }`}
                    >
                      <option value="">Sélectionner une tâche...</option>
                      {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.name}</option>
                      ))}
                    </select>
                    {formErrors.taskId && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.taskId}</div>
                    )}
                  </div>
                )}

                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1 text-blue-500" />
                    Fournisseur *
                    <span className="ml-1 align-middle" title="Choisissez le fournisseur auprès duquel la commande sera passée.">
                      <svg aria-label="Aide fournisseur" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                        <circle cx="10" cy="10" r="10" />
                        <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                      </svg>
                    </span>
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    required
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-4 transition-all duration-300 ${
                      formErrors.supplierId ? 'border-red-500' : 'border-white/30'
                    }`}
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                  {formErrors.supplierId && (
                    <div className="text-red-600 text-xs mt-1">{formErrors.supplierId}</div>
                  )}
                </div>

                {/* Date de livraison */}
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
                  <span className="ml-1" title="Indiquez ici toute consigne particulière pour la livraison (ex : horaires, accès, contact sur site, etc.)">
                    <svg aria-label="Aide instructions livraison" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline text-blue-400 cursor-help">
                      <circle cx="10" cy="10" r="10" />
                      <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">?</text>
                    </svg>
                  </span>
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
                        <div className="flex flex-col md:grid md:grid-cols-10 gap-2 items-center">
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => updateItem(index, 'name', e.target.value)}
                            className={`px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm ${
                              formErrors[`item-name-${index}`] ? 'border-red-500' : 'border-white/30'
                            }`}
                            placeholder="Désignation"
                            title="Nom ou référence de l'article. Obligatoire."
                            required
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateItem(index, 'description', e.target.value)}
                            className="px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm border-white/30"
                            placeholder="Description"
                            title="Description détaillée de l'article."
                          />
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                            className={`px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm ${
                              formErrors[`item-quantity-${index}`] ? 'border-red-500' : 'border-white/30'
                            }`}
                            placeholder="Qté"
                            required
                          />
                          <input
                            type="text"
                            value={item.unit}
                            onChange={e => updateItem(index, 'unit', e.target.value)}
                            className="px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm border-white/30"
                            placeholder="Unité"
                            title="Unité de mesure (ex : pièce, kg)."
                          />
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitPrice}
                            onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                            className="px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm border-white/30"
                            placeholder="Prix unitaire"
                            title="Prix unitaire TTC."
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={item.taxRate}
                            onChange={e => updateItem(index, 'taxRate', Number(e.target.value))}
                            className="px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm border-white/30"
                            placeholder="TVA (%)"
                            title="Taux de TVA (ex : 18%)."
                          />
                          <input
                            type="text"
                            value={item.specifications}
                            onChange={e => updateItem(index, 'specifications', e.target.value)}
                            className="px-2 py-1 border-2 rounded-lg focus:ring-2 text-sm border-white/30"
                            placeholder="Spécifications"
                            title="Exigences techniques spécifiques."
                          />
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={e => updateItem(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 border-white/30"
                            placeholder="Notes internes"
                            title="Commentaires internes non visibles par le fournisseur."
                          />
                          <div className="flex items-end pb-2">
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
                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total :</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.totalPrice.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
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
        {/* Fin du body scrollable */}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200/50 bg-gray-50/50 sticky bottom-0 z-10">
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
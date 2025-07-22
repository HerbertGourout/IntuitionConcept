import React from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package,
  Calendar,
  User,
  Building2,
  DollarSign,
  FileText,
  Truck
} from 'lucide-react';
import { PurchaseOrder, PURCHASE_ORDER_STATUS_LABELS } from '../../types/purchaseOrder';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';
import { useProjectContext } from '../../contexts/ProjectContext';

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onEdit?: () => void;
  onCreateDeliveryNote?: () => void;
}

const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({ order, onEdit, onCreateDeliveryNote }) => {
  const { deletePurchaseOrder, approvePurchaseOrder } = usePurchaseOrderContext();
  const { projects } = useProjectContext();

  const project = projects.find(p => p.id === order.projectId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_approval': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'ordered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partially_delivered': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'ordered': return <Package className="h-4 w-4" />;
      case 'partially_delivered': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le bon d'achat ${order.orderNumber} ?`)) {
      try {
        await deletePurchaseOrder(order.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Approuver le bon d'achat ${order.orderNumber} ?`)) {
      try {
        await approvePurchaseOrder(order.id, 'Utilisateur actuel', 'Approuvé via interface');
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error);
      }
    }
  };

  return (
    <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
      {/* Header avec numéro et statut */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">
              {new Date(order.orderDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{PURCHASE_ORDER_STATUS_LABELS[order.status]}</span>
        </div>
      </div>

      {/* Informations principales */}
      <div className="space-y-3 mb-4">
        {/* Fournisseur */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900">{order.supplier.name}</span>
        </div>

        {/* Projet */}
        {project && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">{project.name}</span>
          </div>
        )}

        {/* Montant */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold text-gray-900">
            {order.totalAmount.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {/* Date de livraison demandée */}
        {order.requestedDeliveryDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">
              Livraison: {new Date(order.requestedDeliveryDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      {/* Détails des articles */}
      <div className="bg-gray-50/50 rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Articles commandés</p>
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-700 truncate">{item.name}</span>
              <span className="text-gray-600 ml-2">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-gray-500 italic">
              +{order.items.length - 2} autres articles
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex space-x-2">
          {order.status === 'pending_approval' && (
            <button
              onClick={handleApprove}
              className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-1"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Approuver</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {(order.status === 'approved' || order.status === 'ordered') && (
            <button 
              onClick={onCreateDeliveryNote}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
              title="Créer bon de livraison"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Informations d'approbation */}
      {order.approvedBy && (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-600">
              Approuvé par {order.approvedBy}
              {order.approvedDate && (
                <span className="ml-1">
                  le {new Date(order.approvedDate).toLocaleDateString('fr-FR')}
                </span>
              )}
            </span>
          </div>
          {order.approvalNotes && (
            <p className="text-xs text-gray-500 mt-1 italic">
              "{order.approvalNotes}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderCard;

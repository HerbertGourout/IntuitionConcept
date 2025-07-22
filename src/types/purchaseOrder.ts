// Types pour les bons d'achat et bons de livraison
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  taxNumber?: string;
  paymentTerms?: string; // Ex: "30 jours", "Comptant"
  rating?: number; // Note sur 5
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  materialId?: string; // Référence vers matériau existant
  equipmentId?: string; // Référence vers équipement existant
  name: string;
  description?: string;
  quantity: number;
  unit: string; // m², kg, pièce, etc.
  unitPrice: number;
  totalPrice: number;
  taxRate?: number; // Taux de TVA en %
  deliveryDate?: string;
  specifications?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // Numéro unique généré
  projectId: string;
  phaseId?: string;
  taskId?: string;
  supplierId: string;
  supplier: Supplier; // Données du fournisseur au moment de la commande
  
  // Statuts du bon d'achat
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partially_delivered' | 'delivered' | 'cancelled';
  
  // Informations de commande
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string; // FCFA
  
  // Dates importantes
  orderDate: string;
  requestedDeliveryDate?: string;
  approvedDate?: string;
  
  // Workflow d'approbation
  requestedBy: string; // Nom de la personne qui demande
  approvedBy?: string; // Nom de la personne qui approuve
  approvalNotes?: string;
  
  // Informations de livraison
  deliveryAddress?: string;
  deliveryInstructions?: string;
  
  // Suivi
  notes?: string;
  attachments?: string[]; // URLs des documents joints
  
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNoteItem {
  id: string;
  purchaseOrderItemId: string;
  name: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unit: string;
  condition: 'good' | 'damaged' | 'incomplete' | 'rejected';
  notes?: string;
  photos?: string[]; // URLs des photos de réception
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string; // Numéro unique généré
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrder; // Référence au bon d'achat
  
  // Statuts du bon de livraison
  status: 'pending' | 'in_transit' | 'delivered' | 'partially_received' | 'received' | 'rejected';
  
  // Informations de livraison
  items: DeliveryNoteItem[];
  deliveryDate: string;
  actualDeliveryDate?: string;
  
  // Personnel
  deliveredBy?: string; // Nom du livreur/transporteur
  receivedBy?: string; // Nom de la personne qui réceptionne
  
  // Contrôle qualité
  qualityCheck: boolean;
  qualityNotes?: string;
  overallCondition: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected';
  
  // Localisation
  deliveryLocation?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Documentation
  signature?: string; // Signature électronique base64
  photos?: string[]; // Photos de la livraison
  documents?: string[]; // Documents joints (factures, etc.)
  
  // Suivi
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Types pour les statistiques et rapports
export interface PurchaseOrderStats {
  totalOrders: number;
  totalAmount: number;
  pendingApproval: number;
  approved: number;
  delivered: number;
  cancelled: number;
  averageOrderValue: number;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    orderCount: number;
    totalAmount: number;
  }>;
}

export interface DeliveryStats {
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  rejectedDeliveries: number;
  averageDeliveryTime: number; // en jours
  qualityScore: number; // Pourcentage de livraisons en bon état
}

// Types pour les contextes et services
export interface PurchaseOrderContextType {
  // Bons d'achat
  purchaseOrders: PurchaseOrder[];
  currentPurchaseOrder: PurchaseOrder | null;
  loadingPurchaseOrders: boolean;
  
  // Actions bons d'achat
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  approvePurchaseOrder: (id: string, approvedBy: string, notes?: string) => Promise<void>;
  
  // Bons de livraison
  deliveryNotes: DeliveryNote[];
  currentDeliveryNote: DeliveryNote | null;
  loadingDeliveryNotes: boolean;
  
  // Actions bons de livraison
  addDeliveryNote: (note: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeliveryNote: (id: string, updates: Partial<DeliveryNote>) => Promise<void>;
  receiveDelivery: (id: string, receivedBy: string, items: DeliveryNoteItem[]) => Promise<void>;
  
  // Fournisseurs
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  
  // Statistiques
  purchaseOrderStats: PurchaseOrderStats | null;
  deliveryStats: DeliveryStats | null;
}

// Utilitaires
export const PURCHASE_ORDER_STATUS_LABELS = {
  draft: 'Brouillon',
  pending_approval: 'En attente d\'approbation',
  approved: 'Approuvé',
  ordered: 'Commandé',
  partially_delivered: 'Partiellement livré',
  delivered: 'Livré',
  cancelled: 'Annulé'
} as const;

export const DELIVERY_STATUS_LABELS = {
  pending: 'En attente',
  in_transit: 'En transit',
  delivered: 'Livré',
  partially_received: 'Partiellement réceptionné',
  received: 'Réceptionné',
  rejected: 'Rejeté'
} as const;

export const CONDITION_LABELS = {
  excellent: 'Excellent',
  good: 'Bon',
  acceptable: 'Acceptable',
  poor: 'Mauvais',
  rejected: 'Rejeté'
} as const;

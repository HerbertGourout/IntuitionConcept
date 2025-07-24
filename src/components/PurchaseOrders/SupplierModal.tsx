import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  FileText, 
  CreditCard,
  Star,
  Save,
  AlertCircle
} from 'lucide-react';
import { Supplier } from '../../types/purchaseOrder';
import { usePurchaseOrderContext } from '../../contexts/PurchaseOrderContext';

// Type pour les valeurs possibles du type de fournisseur
type SupplierType = "materials" | "equipment" | "services" | "transport";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, supplier }) => {
  const { addSupplier, updateSupplier } = usePurchaseOrderContext();

  // États du formulaire
  const [formData, setFormData] = useState<{
    name: string;
    type: 'materials' | 'equipment' | 'services' | 'transport';
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    website: string;
    taxId: string;
    registrationNumber: string;
    bankAccount: string;
    paymentTerms: string;
    rating: number;
    notes: string;
    isActive: boolean;
  }>({
    name: '',
    type: 'materials',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Côte d\'Ivoire',
    website: '',
    taxId: '',
    registrationNumber: '',
    bankAccount: '',
    paymentTerms: '30',
    rating: 5,
    notes: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>('');

  // Types de fournisseurs
  const supplierTypes = [
    { value: 'materials', label: 'Matériaux', icon: Building },
    { value: 'equipment', label: 'Équipements', icon: CreditCard },
    { value: 'services', label: 'Services', icon: User },
    { value: 'transport', label: 'Transport', icon: MapPin }
  ];

  // Initialiser le formulaire
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        type: supplier.type,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        postalCode: supplier.postalCode || '',
        country: supplier.country || 'Côte d\'Ivoire',
        website: supplier.website || '',
        taxId: supplier.taxId || '',
        registrationNumber: supplier.registrationNumber || '',
        bankAccount: supplier.bankAccount || '',
        paymentTerms: supplier.paymentTerms?.toString() || '30',
        rating: supplier.rating || 5,
        notes: supplier.notes || '',
        isActive: supplier.isActive !== false
      });
    } else {
      setFormData({
        name: '',
        type: 'materials',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Côte d\'Ivoire',
        website: '',
        taxId: '',
        registrationNumber: '',
        bankAccount: '',
        paymentTerms: '30',
        rating: 5,
        notes: '',
        isActive: true
      });
    }
    setErrors({});
    setGlobalError('');
  }, [supplier]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du fournisseur est obligatoire';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'L\'URL doit commencer par http:// ou https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) {
      setGlobalError('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }
    if (isNaN(Number(formData.paymentTerms)) || Number(formData.paymentTerms) <= 0) {
      setGlobalError('Le délai de paiement doit être un nombre positif.');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données en excluant les valeurs undefined (Firestore ne les accepte pas)
      const supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        type: formData.type,
        country: formData.country.trim() || 'Côte d\'Ivoire',
        paymentTerms: parseInt(formData.paymentTerms, 10) || 30,
        rating: formData.rating,
        isActive: formData.isActive
      };

      // Ajouter les champs optionnels seulement s'ils ne sont pas vides
      if (formData.contactPerson.trim()) supplierData.contactPerson = formData.contactPerson.trim();
      if (formData.email.trim()) supplierData.email = formData.email.trim();
      if (formData.phone.trim()) supplierData.phone = formData.phone.trim();
      if (formData.address.trim()) supplierData.address = formData.address.trim();
      if (formData.city.trim()) supplierData.city = formData.city.trim();
      if (formData.postalCode.trim()) supplierData.postalCode = formData.postalCode.trim();
      if (formData.website.trim()) supplierData.website = formData.website.trim();
      if (formData.taxId.trim()) supplierData.taxId = formData.taxId.trim();
      if (formData.registrationNumber.trim()) supplierData.registrationNumber = formData.registrationNumber.trim();
      if (formData.bankAccount.trim()) supplierData.bankAccount = formData.bankAccount.trim();
      if (formData.notes.trim()) supplierData.notes = formData.notes.trim();

      if (supplier) {
        await updateSupplier(supplier.id, supplierData);
      } else {
        await addSupplier(supplierData);
      }
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erreur lors de la sauvegarde du fournisseur:', error);
        setGlobalError(`Erreur : ${error.message}`);
      } else {
        console.error('Erreur lors de la sauvegarde du fournisseur:', error);
        setGlobalError('Erreur : Échec de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {supplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
              </h2>
              <p className="text-gray-600">
                {supplier ? `Modification de ${supplier.name}` : 'Ajouter un nouveau fournisseur'}
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

        {/* Affichage de l'erreur globale */}
        {globalError && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span><strong>Erreur :</strong> {globalError}</span>
            </div>
          </div>
        )}

        {/* Formulaire principal */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Informations de base */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Informations de Base</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom du fournisseur */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du fournisseur *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de l'entreprise"
                    className={`w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.name ? 'border-red-500' : 'border-white/30'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Type de fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de fournisseur *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SupplierType })}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    {supplierTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Personne de contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personne de contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nom du contact principal"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1 text-blue-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@fournisseur.com"
                    className={`w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-white/30'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1 text-green-500" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+225 XX XX XX XX"
                    className={`w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.phone ? 'border-red-500' : 'border-white/30'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Adresse</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adresse complète */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Adresse complète du fournisseur"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Abidjan"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Code postal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="00225"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Côte d'Ivoire"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Site web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-1 text-cyan-500" />
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.fournisseur.com"
                    className={`w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.website ? 'border-red-500' : 'border-white/30'
                    }`}
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.website}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations légales et financières */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Informations Légales et Financières</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Numéro fiscal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro fiscal
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Numéro d'identification fiscale"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Numéro d'enregistrement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro d'enregistrement
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="Numéro RCCM"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Compte bancaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="h-4 w-4 inline mr-1 text-orange-500" />
                    Compte bancaire
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    placeholder="Numéro de compte bancaire"
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Conditions de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions de paiement (jours)
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="0">Paiement immédiat</option>
                    <option value="15">15 jours</option>
                    <option value="30">30 jours</option>
                    <option value="45">45 jours</option>
                    <option value="60">60 jours</option>
                    <option value="90">90 jours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Évaluation et statut */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Évaluation et Statut</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (1-5 étoiles)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`p-1 rounded transition-colors ${
                          star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        aria-label={`Noter ${star} étoile${star > 1 ? 's' : ''}`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating}/5
                    </span>
                  </div>
                </div>

                {/* Statut actif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Fournisseur actif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes et commentaires
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes sur le fournisseur, historique, spécialités..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                />
              </div>
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
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Sauvegarde...' : (supplier ? 'Modifier' : 'Créer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
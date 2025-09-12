import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { PaymentService, PaymentRecord } from '../../services/PaymentService';
import MobileMoneyPayment from './MobileMoneyPayment';
import CountrySelector from './CountrySelector';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import SectionHeader from '../UI/SectionHeader';

interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: 'west' | 'central' | 'maghreb';
  mobileMoneyProviders: string[];
  phonePrefix: string;
}

interface PaymentStats {
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  thisMonth: number;
}

export const PaymentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'new-payment' | 'history'>('overview');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'successful' | 'failed'>('all');

  // États pour le nouveau paiement
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    description: '',
    projectId: ''
  });

  // Charger les paiements depuis Firebase
  useEffect(() => {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentRecord[];
      
      setPayments(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculer les statistiques
  const stats: PaymentStats = React.useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalAmount: payments.reduce((sum, p) => p.status === 'successful' ? sum + p.amount : sum, 0),
      successfulPayments: payments.filter(p => p.status === 'successful').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      thisMonth: payments.filter(p => {
        const paymentDate = p.createdAt.toDate();
        return paymentDate >= thisMonth && p.status === 'successful';
      }).reduce((sum, p) => sum + p.amount, 0)
    };
  }, [payments]);

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Gérer le succès du paiement
  const handlePaymentSuccess = async (response: Record<string, unknown>) => {
    try {
      if (!selectedCountry) return;

      const paymentRecord = PaymentService.createPaymentRecord(
        'current-user-id', // À remplacer par l'ID utilisateur réel
        parseFloat(paymentForm.amount),
        selectedCountry.currency,
        paymentForm.customerPhone,
        paymentForm.description,
        response.tx_ref as string,
        paymentForm.projectId || undefined
      );

      // Sauvegarder dans Firebase
      await addDoc(collection(db, 'payments'), {
        ...paymentRecord,
        flutterwaveRef: response.transaction_id,
        status: 'successful'
      });

      // Réinitialiser le formulaire
      setPaymentForm({
        amount: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        description: '',
        projectId: ''
      });

      setShowPaymentModal(false);
      setActiveTab('history');
      
      // Toast de succès (vous pouvez ajouter votre système de toast ici)
      console.log('✅ Paiement enregistré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du paiement:', error);
    }
  };

  // Formater la devise
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête harmonisé */}
      <div className="glass-card p-6 rounded-xl">
        <SectionHeader
          icon={<CreditCard className="w-7 h-7 text-blue-600" />}
          title="Gestion des Paiements"
          subtitle="Gérez vos paiements Mobile Money et suivez vos transactions"
          actions={(
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount, selectedCountry?.currency || 'XOF')}
              </div>
              <div className="text-sm text-gray-600">Total des revenus</div>
            </div>
          )}
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.successfulPayments}</div>
              <div className="text-sm text-gray-600">Paiements réussis</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.failedPayments}</div>
              <div className="text-sm text-gray-600">Échecs</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.thisMonth, selectedCountry?.currency || 'XOF')}
              </div>
              <div className="text-sm text-gray-600">Ce mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="glass-card rounded-xl">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
              { id: 'new-payment', label: 'Nouveau paiement', icon: Plus },
              { id: 'history', label: 'Historique', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'new-payment' | 'history')}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tableau de bord des paiements
                </h3>
                <p className="text-gray-600 mb-6">
                  Consultez vos statistiques de paiement et gérez vos transactions Mobile Money
                </p>
                <button
                  onClick={() => setActiveTab('new-payment')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer un nouveau paiement
                </button>
              </div>
            </div>
          )}

          {/* Nouveau paiement */}
          {activeTab === 'new-payment' && (
            <div className="space-y-6">
              {!selectedCountry ? (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez votre pays
                    </h3>
                    <p className="text-gray-600">
                      Choisissez votre pays pour configurer les options de paiement
                    </p>
                  </div>
                  <CountrySelector
                    onCountrySelect={setSelectedCountry}
                    selectedCountry={selectedCountry}
                  />
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Nouveau paiement - {selectedCountry.name} {selectedCountry.flag}
                    </h3>
                    <button
                      onClick={() => setSelectedCountry(undefined)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Changer de pays
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Informations du paiement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Montant ({selectedCountry.currencySymbol})
                        </label>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du client
                        </label>
                        <input
                          type="text"
                          value={paymentForm.customerName}
                          onChange={(e) => setPaymentForm({...paymentForm, customerName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom complet"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email du client
                        </label>
                        <input
                          type="email"
                          value={paymentForm.customerEmail}
                          onChange={(e) => setPaymentForm({...paymentForm, customerEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@exemple.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone ({selectedCountry.phonePrefix})
                        </label>
                        <input
                          type="tel"
                          value={paymentForm.customerPhone}
                          onChange={(e) => setPaymentForm({...paymentForm, customerPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="70 123 45 67"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={paymentForm.description}
                          onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Description du paiement"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={!paymentForm.amount || !paymentForm.customerName || !paymentForm.customerEmail || !paymentForm.customerPhone}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Procéder au paiement
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par description ou téléphone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'successful' | 'failed')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="successful">Réussis</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échecs</option>
                  </select>

                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Liste des paiements */}
              <div className="bg-white rounded-lg border">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun paiement trouvé
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucun paiement ne correspond à vos critères de recherche'
                        : 'Vous n\'avez pas encore de paiements enregistrés'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.transactionRef}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payment.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {payment.phoneNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                <span className="ml-1 capitalize">{payment.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.createdAt.toDate().toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Paiement Mobile Money
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <MobileMoneyPayment
                amount={parseFloat(paymentForm.amount)}
                currency={selectedCountry.currency}
                customerEmail={paymentForm.customerEmail}
                customerPhone={paymentForm.customerPhone}
                customerName={paymentForm.customerName}
                description={paymentForm.description}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPaymentModal(false)}
                isProduction={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;

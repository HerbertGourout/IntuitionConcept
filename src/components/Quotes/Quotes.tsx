import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2,
  Send,
  Copy
} from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { AnimatedCounter } from '../UI/VisualEffects';
import QuoteCreatorSimple from './QuoteCreatorSimple';
import { Quote } from '../../services/quotesService';

const Quotes: React.FC = () => {
  const { formatAmount } = useCurrency();
  
  // États locaux
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: '1',
      title: 'Devis Construction Villa Moderne',
      clientName: 'M. Jean Dupont',
      clientEmail: 'jean.dupont@email.com',
      clientPhone: '+237 6XX XX XX XX',
      companyName: 'Dupont Construction SARL',
      projectType: 'construction',
      status: 'sent',
      totalAmount: 45000000,
      subtotal: 38135593,
      taxRate: 18,
      taxAmount: 6864407,
      validityDays: 30,
      validUntil: '2025-10-15',
      createdAt: '2025-09-01',
      updatedAt: '2025-09-05',
      phases: [
        {
          id: 'p1',
          name: 'Gros œuvre',
          description: 'Fondations, murs porteurs, dalle',
          totalPrice: 25000000,
          expanded: true,
          tasks: [
            {
              id: 't1',
              name: 'Fondations',
              description: 'Travaux de fondations',
              totalPrice: 10200000,
              expanded: true,
              articles: [
                {
                  id: 'a1',
                  description: 'Fondations en béton armé',
                  quantity: 120,
                  unit: 'm²',
                  unitPrice: 85000,
                  totalPrice: 10200000
                }
              ]
            },
            {
              id: 't2',
              name: 'Murs',
              description: 'Construction des murs',
              totalPrice: 9000000,
              expanded: true,
              articles: [
                {
                  id: 'a2',
                  description: 'Murs en parpaings',
                  quantity: 200,
                  unit: 'm²',
                  unitPrice: 45000,
                  totalPrice: 9000000
                }
              ]
            }
          ]
        }
      ],
      notes: 'Devis valable 45 jours',
      paymentTerms: 'Paiement en 3 tranches : 40% à la commande, 40% à mi-parcours, 20% à la livraison'
    },
    {
      id: '2',
      title: 'Devis Rénovation Appartement',
      clientName: 'Mme Marie Martin',
      clientEmail: 'marie.martin@email.com',
      clientPhone: '+237 6XX XX XX XX',
      companyName: 'Martin Rénovation',
      projectType: 'renovation',
      status: 'draft',
      totalAmount: 12500000,
      subtotal: 10593220,
      taxRate: 18,
      taxAmount: 1906780,
      validityDays: 30,
      validUntil: '2025-11-01',
      createdAt: '2025-09-03',
      updatedAt: '2025-09-06',
      phases: [],
      notes: 'En cours de finalisation'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showQuoteCreator, setShowQuoteCreator] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Filtrage des devis
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    const total = quotes.length;
    const draft = quotes.filter(q => q.status === 'draft').length;
    const sent = quotes.filter(q => q.status === 'sent').length;
    const accepted = quotes.filter(q => q.status === 'accepted').length;
    const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const acceptedValue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0);
    
    return { total, draft, sent, accepted, totalValue, acceptedValue };
  }, [quotes]);

  // Gestionnaires d'événements
  const handleCreateQuote = () => {
    setSelectedQuote(null);
    setShowQuoteCreator(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteCreator(true);
  };

  const handleDeleteQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote && window.confirm(`Êtes-vous sûr de vouloir supprimer le devis "${quote.title}" ?`)) {
      setQuotes(prev => prev.filter(q => q.id !== quoteId));
    }
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      title: `${quote.title} (Copie)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  const handleStatusChange = (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(prev => prev.map(q => 
      q.id === quoteId 
        ? { ...q, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : q
    ));
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Rejeté';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  };

  if (showQuoteCreator) {
    return (
      <QuoteCreatorSimple
        onClose={() => setShowQuoteCreator(false)}
        onQuoteCreated={() => setShowQuoteCreator(false)}
        editQuote={selectedQuote}
      />
    );
  }

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Devis
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion des devis et propositions commerciales
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateQuote}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Devis</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devis</p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={stats.total} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">
                <AnimatedCounter value={stats.sent} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Acceptés</p>
              <p className="text-2xl font-bold text-green-600">
                <AnimatedCounter value={stats.accepted} />
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatAmount(stats.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Rejeté</option>
            <option value="expired">Expiré</option>
          </select>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredQuotes.length} devis trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Liste des devis */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Devis ({filteredQuotes.length})
          </h3>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun devis trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier devis pour vos clients.
            </p>
            <button
              onClick={handleCreateQuote}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Créer un devis</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredQuotes.map(quote => (
              <div key={quote.id} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Header de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {quote.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {quote.clientName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                    {getStatusText(quote.status)}
                  </span>
                </div>

                {/* Informations principales */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-semibold text-blue-600">
                      {formatAmount(quote.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phases:</span>
                    <span className="font-medium">{quote.phases.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valide jusqu'au:</span>
                    <span className="font-medium">
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'Non définie'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Créé le:</span>
                    <span className="font-medium">
                      {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('fr-FR') : 'Non définie'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuote(quote)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateQuote(quote)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                    title="Dupliquer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Actions de statut */}
                {quote.status === 'draft' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(quote.id, 'sent')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Send className="h-4 w-4" />
                      <span>Envoyer au client</span>
                    </button>
                  </div>
                )}

                {quote.status === 'sent' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(quote.id, 'accepted')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleStatusChange(quote.id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;

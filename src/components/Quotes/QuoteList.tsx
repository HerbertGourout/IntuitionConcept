import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Edit,
    Send,
    Trash2,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuotesService, Quote } from '../../services/quotesService';

interface QuoteListProps {
    onCreateNew: () => void;
    onEditQuote: (quoteId: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ onCreateNew, onEditQuote }) => {
    const { resolvedTheme } = useTheme();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');

    useEffect(() => {
        // S'abonner en temps réel aux devis Firebase
        const unsubscribe = QuotesService.subscribeToQuotes((list) => {
            setQuotes(list);
        });
        return () => unsubscribe();
    }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

    const handleDeleteClick = (quote: Quote) => {
        setQuoteToDelete(quote);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!quoteToDelete) return;
        
        try {
            console.log('Tentative de suppression du devis:', quoteToDelete.id);
            await QuotesService.deleteQuote(quoteToDelete.id);
            console.log('Suppression réussie, fermeture du modal');
            setShowDeleteModal(false);
            setQuoteToDelete(null);
        } catch (e) {
            console.error('Suppression impossible:', e);
            alert('❌ Erreur lors de la suppression du devis');
        }
    };

    const duplicateQuote = async (quote: Quote) => {
        try {
            const { id: __idToDrop, ...rest } = quote;
            void __idToDrop; // éviter l'avertissement variable non utilisée
            
            await QuotesService.createQuote({
                ...rest,
                title: `${quote.title} (Copie)`,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error('Duplication impossible:', e);
            alert('❌ Erreur lors de la duplication du devis');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
            case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'expired': return <Clock className="w-4 h-4 text-gray-500" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Brouillon';
            case 'sent': return 'Envoyé';
            case 'accepted': return 'Accepté';
            case 'rejected': return 'Refusé';
            case 'expired': return 'Expiré';
            default: return status;
        }
    };

    const filteredQuotes = quotes
        .filter(quote => {
            const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                quote.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'amount':
                    return b.totalAmount - a.totalAmount;
                case 'client':
                    return a.clientName.localeCompare(b.clientName);
                default:
                    return 0;
            }
        });

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <motion.div
                className={`glass-card p-6 rounded-xl border border-white/20 ${
                    resolvedTheme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Gestion des Devis</h1>
                            <p className="text-sm opacity-70">
                                {quotes.length} devis • {filteredQuotes.length} affichés
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Devis
                    </button>
                </div>

                {/* Filtres et recherche */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                    resolvedTheme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Rechercher par titre ou client..."
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full p-3 rounded-lg border ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="draft">Brouillons</option>
                            <option value="sent">Envoyés</option>
                            <option value="accepted">Acceptés</option>
                            <option value="rejected">Refusés</option>
                            <option value="expired">Expirés</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'client')}
                            className={`w-full p-3 rounded-lg border ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="date">Trier par date</option>
                            <option value="amount">Trier par montant</option>
                            <option value="client">Trier par client</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Liste des devis */}
            <div className="max-w-7xl mx-auto">
                {filteredQuotes.length === 0 ? (
                    <motion.div
                        className={`p-12 rounded-xl shadow-lg text-center ${
                            resolvedTheme === 'dark'
                                ? 'bg-gray-800 border border-gray-700'
                                : 'bg-white border border-gray-200'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">
                            {quotes.length === 0 ? 'Aucun devis créé' : 'Aucun devis trouvé'}
                        </h3>
                        <p className="opacity-70 mb-6">
                            {quotes.length === 0 
                                ? 'Commencez par créer votre premier devis'
                                : 'Essayez de modifier vos critères de recherche'
                            }
                        </p>
                        {quotes.length === 0 && (
                            <button
                                onClick={onCreateNew}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Créer mon premier devis
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredQuotes.map((quote, index) => (
                            <motion.div
                                key={`${quote.id}-${index}`}
                                className={`p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all ${
                                    resolvedTheme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* En-tête de la carte */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-2">
                                            {quote.title}
                                        </h3>
                                        <p className="text-sm opacity-70">
                                            {quote.clientName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        {getStatusIcon(quote.status)}
                                        <span className="text-xs font-medium">
                                            {getStatusLabel(quote.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Informations principales */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm opacity-70">Montant:</span>
                                        <span className="font-bold text-green-600">
                                            {quote.totalAmount.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm opacity-70">Type:</span>
                                        <span className="text-sm">
                                            {quote.projectType === 'construction' ? '🏗️ Construction' :
                                             quote.projectType === 'renovation' ? '🔨 Rénovation' :
                                             quote.projectType === 'extension' ? '📐 Extension' :
                                             '🛣️ Infrastructure'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm opacity-70">Créé le:</span>
                                        <span className="text-sm">
                                            {new Date(quote.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={() => onEditQuote(quote.id)}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        <Edit className="w-3 h-3" />
                                        Modifier
                                    </button>
                                    
                                    <button
                                        onClick={() => duplicateQuote(quote)}
                                        className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                    >
                                        <FileText className="w-3 h-3" />
                                        Dupliquer
                                    </button>

                                    <div className="flex-1" />

                                    <button
                                        onClick={() => handleDeleteClick(quote)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        className={`p-6 rounded-xl shadow-xl max-w-md w-full mx-4 ${
                            resolvedTheme === 'dark'
                                ? 'bg-gray-800 border border-gray-700'
                                : 'bg-white border border-gray-200'
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                                Supprimer le devis
                            </h3>
                            <p className="text-sm opacity-70 mb-6">
                                Êtes-vous sûr de vouloir supprimer le devis "<strong>{quoteToDelete?.title}</strong>" ?
                                <br />Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setQuoteToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default QuoteList;

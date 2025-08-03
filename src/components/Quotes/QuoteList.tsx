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

interface Quote {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    projectType: string;
    totalAmount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
    validityDays: number;
}

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
        loadQuotes();
    }, []);

    const loadQuotes = () => {
        const savedQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        setQuotes(savedQuotes);
    };

    const deleteQuote = (quoteId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            const updatedQuotes = quotes.filter(q => q.id !== quoteId);
            setQuotes(updatedQuotes);
            localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
        }
    };

    const duplicateQuote = (quote: Quote) => {
        const newQuote = {
            ...quote,
            id: `DEVIS-${Date.now()}`,
            title: `${quote.title} (Copie)`,
            status: 'draft' as const,
            createdAt: new Date().toISOString()
        };
        const updatedQuotes = [...quotes, newQuote];
        setQuotes(updatedQuotes);
        localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
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
                                key={quote.id}
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
                                        onClick={() => deleteQuote(quote.id)}
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
        </div>
    );
};

export default QuoteList;

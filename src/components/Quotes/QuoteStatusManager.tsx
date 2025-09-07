import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Send,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    MessageSquare,
    FileText,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Quote } from '../../services/quotesService';

interface QuoteStatusManagerProps {
    quote: Quote;
    onStatusChange: (quoteId: string, newStatus: Quote['status'], note?: string) => void;
    onClose: () => void;
}

interface StatusAction {
    status: Quote['status'];
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
    requiresNote?: boolean;
}

const QuoteStatusManager: React.FC<QuoteStatusManagerProps> = ({
    quote,
    onStatusChange,
    onClose
}) => {
    const [selectedStatus, setSelectedStatus] = useState<Quote['status'] | null>(null);
    const [note, setNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const statusActions: StatusAction[] = [
        {
            status: 'draft',
            label: 'Brouillon',
            icon: <FileText className="w-5 h-5" />,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            description: 'Devis en cours de rédaction'
        },
        {
            status: 'sent',
            label: 'Envoyé',
            icon: <Send className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: 'Devis envoyé au client',
            requiresNote: true
        },
        {
            status: 'viewed',
            label: 'Consulté',
            icon: <Eye className="w-5 h-5" />,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            description: 'Devis consulté par le client'
        },
        {
            status: 'accepted',
            label: 'Accepté',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            description: 'Devis accepté par le client',
            requiresNote: true
        },
        {
            status: 'rejected',
            label: 'Refusé',
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            description: 'Devis refusé par le client',
            requiresNote: true
        },
        {
            status: 'expired',
            label: 'Expiré',
            icon: <Clock className="w-5 h-5" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            description: 'Devis arrivé à expiration'
        },
        {
            status: 'cancelled',
            label: 'Annulé',
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            description: 'Devis annulé',
            requiresNote: true
        }
    ];

    const getStatusFlow = (currentStatus: Quote['status']): Quote['status'][] => {
        const flows: Record<Quote['status'], Quote['status'][]> = {
            'draft': ['sent'],
            'sent': ['viewed', 'accepted', 'rejected', 'expired', 'cancelled'],
            'viewed': ['accepted', 'rejected', 'expired', 'cancelled'],
            'accepted': ['cancelled'],
            'rejected': ['sent'],
            'expired': ['sent'],
            'cancelled': []
        };
        return flows[currentStatus] || [];
    };

    const availableActions = statusActions.filter(action => 
        getStatusFlow(quote.status).includes(action.status)
    );

    const currentStatusAction = statusActions.find(action => action.status === quote.status);

    const handleStatusSelect = (status: Quote['status']) => {
        const action = statusActions.find(a => a.status === status);
        setSelectedStatus(status);
        
        if (action?.requiresNote) {
            setShowNoteInput(true);
        } else {
            handleConfirmStatusChange(status, '');
        }
    };

    const handleConfirmStatusChange = (status: Quote['status'], noteText: string) => {
        onStatusChange(quote.id, status, noteText);
        toast.success(`Statut changé vers "${statusActions.find(a => a.status === status)?.label}"`);
        onClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getValidityStatus = () => {
        if (!quote.validUntil) return null;
        
        const validUntil = new Date(quote.validUntil);
        const now = new Date();
        const daysLeft = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            return { status: 'expired', message: `Expiré depuis ${Math.abs(daysLeft)} jour(s)`, color: 'text-red-600' };
        } else if (daysLeft <= 3) {
            return { status: 'warning', message: `Expire dans ${daysLeft} jour(s)`, color: 'text-orange-600' };
        } else {
            return { status: 'valid', message: `Valide ${daysLeft} jour(s)`, color: 'text-green-600' };
        }
    };

    const validityStatus = getValidityStatus();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                {currentStatusAction?.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Gestion du Statut</h2>
                                <p className="text-blue-100">Devis: {quote.title}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Informations du devis */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Informations du Devis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Client:</span>
                                    <span className="font-medium">{quote.clientName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Montant:</span>
                                    <span className="font-bold text-green-600">
                                        {quote.totalAmount.toLocaleString()} FCFA
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Statut actuel:</span>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentStatusAction?.bgColor}`}>
                                        {currentStatusAction?.icon}
                                        <span className={`text-sm font-medium ${currentStatusAction?.color}`}>
                                            {currentStatusAction?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Créé le:</span>
                                    <span className="text-sm">{formatDate(quote.createdAt || '')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Modifié le:</span>
                                    <span className="text-sm">{formatDate(quote.updatedAt || '')}</span>
                                </div>
                                {validityStatus && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Validité:</span>
                                        <span className={`text-sm font-medium ${validityStatus.color}`}>
                                            {validityStatus.message}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions disponibles */}
                    {availableActions.length > 0 && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <ArrowRight className="w-5 h-5 mr-2 text-green-600" />
                                Actions Disponibles
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableActions.map((action) => (
                                    <motion.button
                                        key={action.status}
                                        onClick={() => handleStatusSelect(action.status)}
                                        className={`p-4 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all text-left ${action.bgColor} hover:shadow-lg`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={action.color}>
                                                {action.icon}
                                            </div>
                                            <span className={`font-semibold ${action.color}`}>
                                                {action.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {action.description}
                                        </p>
                                        {action.requiresNote && (
                                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                Note requise
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historique des statuts (placeholder) */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-purple-600" />
                            Historique des Statuts
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    {currentStatusAction?.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{currentStatusAction?.label}</div>
                                    <div className="text-sm text-gray-600">
                                        {formatDate(quote.updatedAt || quote.createdAt || '')}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center text-sm text-gray-500 py-4">
                                L'historique complet sera disponible dans une prochaine version
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal pour note */}
                {showNoteInput && selectedStatus && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <h4 className="text-lg font-semibold mb-4">
                                Ajouter une note
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Changement vers: <strong>
                                    {statusActions.find(a => a.status === selectedStatus)?.label}
                                </strong>
                            </p>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="Ajoutez une note explicative..."
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setShowNoteInput(false);
                                        setSelectedStatus(null);
                                        setNote('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleConfirmStatusChange(selectedStatus, note)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default QuoteStatusManager;

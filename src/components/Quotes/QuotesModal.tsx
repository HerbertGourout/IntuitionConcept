import React, { useEffect, useRef, useCallback } from 'react';
import { Quote } from '../../services/quotesService';
import { useSecureAction } from '../../hooks/useSecureAction';

interface QuotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedQuotes: Quote[];
    isLoading: boolean;
    onLoadQuote: (quote: Quote) => void;
    onDuplicateQuote: (quote: Quote) => void;
    onDeleteQuote: (id: string, title: string) => void;
    onRefresh: () => void;
    formatCurrency: (amount: number) => string;
}

const QuotesModal: React.FC<QuotesModalProps> = ({
    isOpen,
    onClose,
    savedQuotes,
    isLoading,
    onLoadQuote,
    onDuplicateQuote,
    onDeleteQuote,
    onRefresh,
    formatCurrency
}) => {

    // Actions sécurisées pour les devis
    const { execute: secureLoadQuote, canExecute: canEdit } = useSecureAction(
        async (quote: Quote) => {
            onLoadQuote(quote);
        },
        'edit_quote',
        {
            requiredPermissions: ['quotes.edit'],
            resource: 'quote',
            logAction: true
        }
    );

    const { execute: secureDuplicateQuote, canExecute: canDuplicate } = useSecureAction(
        async (quote: Quote) => {
            onDuplicateQuote(quote);
        },
        'duplicate_quote',
        {
            requiredPermissions: ['quotes.create'],
            resource: 'quote',
            logAction: true
        }
    );

    const { execute: secureDeleteQuote, canExecute: canDelete } = useSecureAction(
        async (id: string, title: string) => {
            onDeleteQuote(id, title);
        },
        'delete_quote',
        {
            requiredPermissions: ['quotes.delete'],
            requireRecentAuth: true,
            maxAuthAge: 15 * 60 * 1000, // 15 minutes
            resource: 'quote',
            logAction: true
        }
    );
    // Refs for focus management and backdrop
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    // Helper: get all focusable elements inside panel
    const getFocusable = useCallback((): HTMLElement[] => {
        const panel = panelRef.current;
        if (!panel) return [];
        const selectors = [
            'a[href]','area[href]','button:not([disabled])','input:not([disabled])',
            'select:not([disabled])','textarea:not([disabled])','iframe','object','embed',
            '[tabindex]:not([tabindex="-1"])','[contenteditable="true"]'
        ].join(',');
        return Array.from(panel.querySelectorAll<HTMLElement>(selectors))
            .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
    }, []);

    // Lock body scroll while open and set initial focus
    useEffect(() => {
        if (!isOpen) return;
        previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
        const body = document.body;
        const prevOverflow = body.style.overflow;
        body.style.overflow = 'hidden';

        // Focus first focusable or panel
        const focusables = getFocusable();
        const target = focusables[0] || panelRef.current;
        target?.focus({ preventScroll: true });

        return () => {
            body.style.overflow = prevOverflow;
            previouslyFocusedElement.current?.focus?.();
        };
    }, [isOpen, getFocusable]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        const listenerOptions: AddEventListenerOptions = { capture: true };
        document.addEventListener('keydown', onKey, listenerOptions);
        return () => document.removeEventListener('keydown', onKey, listenerOptions);
    }, [isOpen, onClose]);

    // Trap focus within modal
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        } else if (e.shiftKey && (active === first || active === panelRef.current)) {
            e.preventDefault();
            last.focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotes-modal-title"
            aria-describedby="quotes-modal-desc"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onMouseDown={(e) => {
                // Close on backdrop click only (ignore clicks starting inside panel)
                if (e.target === dialogRef.current) {
                    onClose();
                }
            }}
            onKeyDown={handleKeyDown}
        >
            <div
                ref={panelRef}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden outline-none transition-all duration-200 transform motion-safe:scale-100"
                tabIndex={-1}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 id="quotes-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Devis</h2>
                        <p id="quotes-modal-desc" className="text-gray-600 dark:text-gray-400">{savedQuotes.length} devis enregistrés</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fermer la fenêtre de gestion des devis"
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des devis...</span>
                        </div>
                    ) : savedQuotes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun devis enregistré</h3>
                            <p className="text-gray-600 dark:text-gray-400">Créez votre premier devis pour commencer</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedQuotes.map((savedQuote) => (
                                <div key={savedQuote.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                                    {/* Quote Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                                                {savedQuote.title || 'Devis sans titre'}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    savedQuote.status === 'draft' ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                                                    savedQuote.status === 'sent' ? 'bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-300' :
                                                    savedQuote.status === 'accepted' ? 'bg-green-200 text-green-700 dark:bg-green-600 dark:text-green-300' :
                                                    'bg-red-200 text-red-700 dark:bg-red-600 dark:text-red-300'
                                                }`}>
                                                    {savedQuote.status === 'draft' ? 'Brouillon' :
                                                     savedQuote.status === 'sent' ? 'Envoyé' :
                                                     savedQuote.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quote Info */}
                                    <div className="space-y-2 mb-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Client:</strong> {savedQuote.clientName || 'Non défini'}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Montant:</strong> {formatCurrency(savedQuote.totalAmount)}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Phases:</strong> {savedQuote.phases.length}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Créé:</strong> {savedQuote.createdAt ? new Date(savedQuote.createdAt).toLocaleDateString('fr-FR') : 'Non défini'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => secureLoadQuote(savedQuote)}
                                            disabled={!canEdit}
                                            aria-label={`Éditer le devis ${savedQuote.title || savedQuote.id}`}
                                            title={!canEdit ? "Permission 'quotes.edit' requise" : "Éditer le devis"}
                                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 ${
                                                canEdit 
                                                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Éditer
                                        </button>
                                        <button
                                            onClick={() => secureDuplicateQuote(savedQuote)}
                                            disabled={!canDuplicate}
                                            aria-label={`Dupliquer le devis ${savedQuote.title || savedQuote.id}`}
                                            title={!canDuplicate ? "Permission 'quotes.create' requise" : "Dupliquer le devis"}
                                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 ${
                                                canDuplicate 
                                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Dupliquer
                                        </button>
                                        <button
                                            onClick={() => secureDeleteQuote(savedQuote.id, savedQuote.title)}
                                            disabled={!canDelete}
                                            aria-label={`Supprimer le devis ${savedQuote.title || savedQuote.id}`}
                                            title={!canDelete ? "Permission 'quotes.delete' et authentification récente requises" : "Supprimer le devis"}
                                            className={`flex items-center justify-center px-3 py-2 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 ${
                                                canDelete 
                                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        aria-label="Actualiser la liste des devis"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </button>
                    <button
                        onClick={onClose}
                        aria-label="Fermer la fenêtre"
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuotesModal;

import React, { useState, useEffect } from 'react';
import QuoteCreatorSimple from './QuoteCreatorSimple';
import { QuotesService, Quote } from '../../services/quotesService';
import { toast } from 'react-hot-toast';

/**
 * Composant principal pour la création de devis structurés
 * Utilise la version simplifiée fonctionnelle qui implémente
 * la hiérarchie Phases → Tâches → Articles avec calculs automatiques
 */
interface QuoteCreatorProps {
    selectedQuoteId?: string | null;
    onClose?: () => void;
    onQuoteCreated?: () => void;
}


const QuoteCreator: React.FC<QuoteCreatorProps> = ({ selectedQuoteId, onClose, onQuoteCreated }) => {
    const [editQuote, setEditQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (selectedQuoteId) {
            setIsLoading(true);
            setIsReady(false);
            QuotesService.getQuoteById(selectedQuoteId)
                .then(quote => {
                    if (quote) {
                        setEditQuote(quote);
                        setIsReady(true);
                    } else {
                        toast.error('Devis introuvable');
                        setEditQuote(null);
                        setIsReady(true);
                    }
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du devis:', error);
                    toast.error('Erreur lors du chargement du devis');
                    setEditQuote(null);
                    setIsReady(true);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setEditQuote(null);
            setIsLoading(false);
            setIsReady(true);
        }
    }, [selectedQuoteId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du devis...</p>
                </div>
            </div>
        );
    }

    // Ne rendre QuoteCreatorSimple qu'une seule fois avec des données stables
    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Préparation du formulaire...</p>
                </div>
            </div>
        );
    }

    return (
        <QuoteCreatorSimple 
            onClose={onClose || (() => window.history.back())}
            editQuote={editQuote}
            onQuoteCreated={onQuoteCreated || (() => {
                toast.success(selectedQuoteId ? 'Devis modifié avec succès' : 'Devis créé avec succès');
                window.history.back();
            })}
        />
    );
};

export default QuoteCreator;

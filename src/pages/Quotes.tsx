import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuoteCreator from '../components/Quotes/QuoteCreator';
import QuoteList from '../components/Quotes/QuoteList';

type ViewMode = 'list' | 'create' | 'edit';

const Quotes: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    const handleCreateNew = () => {
        setViewMode('create');
        setSelectedQuoteId(null);
    };

    const handleEditQuote = async (quoteId: string) => {
        setSelectedQuoteId(quoteId);
        setViewMode('edit');
    };

    const handleBackToList = () => {
        setSelectedQuoteId(null);
        setViewMode('list');
    };

    return (
        <div className="min-h-screen">
            <AnimatePresence mode="wait">
                {viewMode === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <QuoteList
                            onCreateNew={handleCreateNew}
                            onEditQuote={handleEditQuote}
                        />
                    </motion.div>
                )}

                {(viewMode === 'create' || viewMode === 'edit') && (
                    <motion.div
                        key="create-edit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="p-6">
                            <button
                                onClick={handleBackToList}
                                className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                ← Retour à la liste
                            </button>
                            <QuoteCreator 
                                selectedQuoteId={selectedQuoteId}
                                onClose={handleBackToList}
                                onQuoteCreated={handleBackToList}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quotes;

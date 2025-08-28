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
                    <div key="create-edit">
                        <QuoteCreator
                            selectedQuoteId={selectedQuoteId}
                            onClose={handleBackToList}
                            onQuoteCreated={handleBackToList}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quotes;

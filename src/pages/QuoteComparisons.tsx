import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, TrendingUp, FileText } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import QuoteComparator from '../components/Quotes/QuoteComparator';
import PageContainer from '../components/Layout/PageContainer';
import SectionHeader from '../components/UI/SectionHeader';
import { GlassCard } from '../components/UI/VisualEffects';

interface Quote {
  id: string;
  title: string;
  quoteType: 'preliminary' | 'definitive';
  totalAmount: number;
  createdAt: string;
}

const QuoteComparisons: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComparator, setShowComparator] = useState(false);
  const [selectedEstimative, setSelectedEstimative] = useState<string>('');
  const [selectedDefinitive, setSelectedDefinitive] = useState<string>('');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'structuredQuotes'));
      const snapshot = await getDocs(q);
      
      const quotesData: Quote[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        quotesData.push({
          id: doc.id,
          title: data.title || 'Sans titre',
          quoteType: data.quoteType || 'preliminary',
          totalAmount: data.totalAmount || 0,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      setQuotes(quotesData);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimativeQuotes = quotes.filter(q => q.quoteType === 'preliminary');
  const definitiveQuotes = quotes.filter(q => q.quoteType === 'definitive');

  const handleCompare = () => {
    if (selectedEstimative && selectedDefinitive) {
      setShowComparator(true);
    }
  };

  if (showComparator && selectedEstimative && selectedDefinitive) {
    return (
      <QuoteComparator
        estimativeQuoteId={selectedEstimative}
        definitiveQuoteId={selectedDefinitive}
        onClose={() => {
          setShowComparator(false);
          setSelectedEstimative('');
          setSelectedDefinitive('');
        }}
      />
    );
  }

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-purple-50 via-white to-blue-50">
        <SectionHeader
          icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
          title="Comparaisons de Devis"
          subtitle="Comparez vos devis estimatifs et définitifs"
          actions={
            <button
              onClick={() => window.history.back()}
              className="btn-glass bg-gray-100 hover:bg-gray-200 px-4 py-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          }
        />
      </GlassCard>

      {loading ? (
        <GlassCard className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des devis...</p>
        </GlassCard>
      ) : (
        <>
          {/* Selection Section */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Sélectionner les devis à comparer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estimative Quote Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devis Estimatif
                </label>
                <select
                  value={selectedEstimative}
                  onChange={(e) => setSelectedEstimative(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un devis estimatif</option>
                  {estimativeQuotes.map(quote => (
                    <option key={quote.id} value={quote.id}>
                      {quote.title} ({(quote.totalAmount || 0).toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {estimativeQuotes.length} devis estimatifs disponibles
                </p>
              </div>

              {/* Definitive Quote Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devis Définitif
                </label>
                <select
                  value={selectedDefinitive}
                  onChange={(e) => setSelectedDefinitive(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un devis définitif</option>
                  {definitiveQuotes.map(quote => (
                    <option key={quote.id} value={quote.id}>
                      {quote.title} ({(quote.totalAmount || 0).toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {definitiveQuotes.length} devis définitifs disponibles
                </p>
              </div>
            </div>

            {/* Compare Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!selectedEstimative || !selectedDefinitive}
                className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  selectedEstimative && selectedDefinitive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                Comparer les devis
              </button>
            </div>
          </GlassCard>

          {/* Empty State */}
          {quotes.length === 0 && (
            <GlassCard className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun devis disponible
              </h3>
              <p className="text-gray-600 mb-4">
                Créez des devis estimatifs et définitifs pour pouvoir les comparer
              </p>
            </GlassCard>
          )}

          {/* Info Cards */}
          {quotes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-6 hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Devis Estimatifs</p>
                    <p className="text-2xl font-bold text-gray-900">{estimativeQuotes.length}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Devis Définitifs</p>
                    <p className="text-2xl font-bold text-gray-900">{definitiveQuotes.length}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Devis</p>
                    <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default QuoteComparisons;

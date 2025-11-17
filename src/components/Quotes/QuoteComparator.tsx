import React, { useState } from 'react';
import { BarChart, TrendingUp, TrendingDown, AlertCircle, Download, X } from 'lucide-react';
import QuoteComparisonService, { ComparisonData } from '../../services/quoteComparisonService';
import toast from 'react-hot-toast';

interface QuoteComparatorProps {
  estimativeQuoteId: string;
  definitiveQuoteId: string;
  onClose: () => void;
}

const QuoteComparator: React.FC<QuoteComparatorProps> = ({
  estimativeQuoteId,
  definitiveQuoteId,
  onClose
}) => {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadComparison();
  }, [estimativeQuoteId, definitiveQuoteId]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await QuoteComparisonService.compareQuotes(
        estimativeQuoteId,
        definitiveQuoteId
      );
      setComparison(data);
      await QuoteComparisonService.saveComparison(data);
    } catch (error) {
      console.error('Erreur chargement comparaison:', error);
      toast.error('Erreur lors de la comparaison');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGapColor = (gap: number) => {
    if (Math.abs(gap) < 5) return 'text-green-600';
    if (Math.abs(gap) < 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGapBgColor = (gap: number) => {
    if (Math.abs(gap) < 5) return 'bg-green-50 border-green-200';
    if (Math.abs(gap) < 15) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const exportToPDF = () => {
    toast.success('Export PDF en cours...');
    // TODO: Implémenter export PDF
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-purple-600" />
                Comparaison Estimatif vs Définitif
              </h2>
              <p className="text-sm text-gray-600 mt-1">{comparison.quoteTitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Exporter en PDF"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Résumé global */}
          <div className={`p-6 rounded-xl border-2 ${getGapBgColor(comparison.gap)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Écart Global</h3>
              <div className="flex items-center gap-2">
                {comparison.gap > 0 ? (
                  <TrendingUp className="w-6 h-6 text-red-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-green-600" />
                )}
                <span className={`text-3xl font-bold ${getGapColor(comparison.gap)}`}>
                  {comparison.gap > 0 ? '+' : ''}{comparison.gap.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Devis Estimatif</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(comparison.estimatedTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Devis Définitif</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(comparison.definitiveTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Différence</p>
                <p className={`text-xl font-bold ${getGapColor(comparison.gap)}`}>
                  {comparison.gapAmount > 0 ? '+' : ''}{formatCurrency(comparison.gapAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Écarts par catégorie */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Analyse par Catégorie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(comparison.gapByCategory).map(([category, data]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 capitalize">{category}</h4>
                    <span className={`font-bold ${getGapColor(data.gap)}`}>
                      {data.gap > 0 ? '+' : ''}{data.gap.toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimé:</span>
                      <span className="font-medium">{formatCurrency(data.estimated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Réel:</span>
                      <span className="font-medium">{formatCurrency(data.definitive)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-600">Écart:</span>
                      <span className={`font-bold ${getGapColor(data.gap)}`}>
                        {formatCurrency(data.definitive - data.estimated)}
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          Math.abs(data.gap) < 5 ? 'bg-green-500' :
                          Math.abs(data.gap) < 15 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(Math.abs(data.gap), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leçons apprises */}
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Leçons Apprises</h3>
                <ul className="space-y-2">
                  {comparison.lessons.map((lesson, index) => (
                    <li key={index} className="text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Graphique visuel */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Visualisation des Écarts</h3>
            <div className="space-y-4">
              {Object.entries(comparison.gapByCategory).map(([category, data]) => {
                const maxValue = Math.max(data.estimated, data.definitive);
                const estimatedWidth = (data.estimated / maxValue) * 100;
                const definitiveWidth = (data.definitive / maxValue) * 100;

                return (
                  <div key={category}>
                    <p className="text-sm font-medium text-gray-700 mb-2 capitalize">{category}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Estimé</span>
                        <div className="flex-1 h-8 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500 flex items-center justify-end pr-2"
                            style={{ width: `${estimatedWidth}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {formatCurrency(data.estimated)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">Réel</span>
                        <div className="flex-1 h-8 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-purple-500 flex items-center justify-end pr-2"
                            style={{ width: `${definitiveWidth}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {formatCurrency(data.definitive)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Comparaison générée le {new Date(comparison.comparisonDate).toLocaleDateString('fr-FR')}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteComparator;

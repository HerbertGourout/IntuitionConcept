import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart } from 'lucide-react';
import StudyCostService, { StudyCost } from '../services/studyCostService';
import PageContainer from '../components/Layout/PageContainer';
import SectionHeader from '../components/UI/SectionHeader';
import { GlassCard } from '../components/UI/VisualEffects';

const StudyCosts: React.FC = () => {
  const [costs, setCosts] = useState<StudyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>(null);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoading(true);
      // Note: This would need a method to get all costs
      // For now, we'll simulate with empty array
      const stats = await StudyCostService.getGlobalStats();
      setGlobalStats(stats);
      setCosts([]);
    } catch (error) {
      console.error('Erreur chargement coûts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-blue-600';
    if (margin >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMarginBg = (margin: number) => {
    if (margin >= 20) return 'bg-green-100';
    if (margin >= 10) return 'bg-blue-100';
    if (margin >= 0) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-green-50 via-white to-blue-50">
        <SectionHeader
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
          title="Gestion des Coûts d'Études"
          subtitle="Suivez la rentabilité de vos études structurales"
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

      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Études totales</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.totalStudies}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Budget total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(globalStats.totalBudget)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Coût réel</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(globalStats.totalActual)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMarginBg(globalStats.avgMargin)}`}>
                <TrendingUp className={`w-5 h-5 ${getMarginColor(globalStats.avgMargin)}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Marge moyenne</p>
                <p className={`text-2xl font-bold ${getMarginColor(globalStats.avgMargin)}`}>
                  {globalStats.avgMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Detailed Stats */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Variance */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Écart Budgétaire
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Budget estimé</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(globalStats.totalBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Coût réel</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(globalStats.totalActual)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Écart</span>
                  <span className={`font-bold ${
                    globalStats.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {globalStats.budgetVariance > 0 ? '+' : ''}
                    {globalStats.budgetVariance.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      globalStats.budgetVariance > 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(Math.abs(globalStats.budgetVariance), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Profitability */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Rentabilité
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Facturé au client</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(globalStats.totalBilled)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Coût total</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(globalStats.totalActual)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Marge totale</span>
                  <span className={`font-bold ${getMarginColor(globalStats.avgMargin)}`}>
                    {formatCurrency(globalStats.totalMargin)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      globalStats.avgMargin >= 20 ? 'bg-green-500' :
                      globalStats.avgMargin >= 10 ? 'bg-blue-500' :
                      globalStats.avgMargin >= 0 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(globalStats.avgMargin, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Studies List */}
      {loading ? (
        <GlassCard className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des coûts...</p>
        </GlassCard>
      ) : costs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun suivi de coûts
          </h3>
          <p className="text-gray-600">
            Les suivis de coûts d'études apparaîtront ici
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {costs.map((cost) => {
            const report = StudyCostService.generateProfitabilityReport(cost);
            
            return (
              <GlassCard key={cost.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{cost.quoteTitle}</h3>
                    <p className="text-sm text-gray-600">ID: {cost.quoteId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cost.status === 'completed' ? 'bg-green-100 text-green-800' :
                    cost.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cost.status === 'completed' ? 'Complétée' :
                     cost.status === 'in_progress' ? 'En cours' : 'Estimée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Budget</p>
                    <p className="font-bold text-gray-900">{formatCurrency(cost.budgetEstimated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Coût réel</p>
                    <p className="font-bold text-gray-900">{formatCurrency(cost.actualCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Facturé</p>
                    <p className="font-bold text-gray-900">{formatCurrency(cost.clientBilled)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Marge</p>
                    <p className={`font-bold ${getMarginColor(cost.margin)}`}>
                      {cost.margin.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {report.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommandations:</p>
                    <div className="space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-gray-600">{rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default StudyCosts;

/**
 * Dashboard d'analytics pour comparer Standard vs Advanced
 * Affiche les économies, gains de temps, et métriques de qualité
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getDefaultClient } from '../../services/ai/gemini3';
import type { UsageStats } from '../../services/ai/gemini3';

export interface AnalyticsData {
  totalRequests: number;
  totalCostStandard: number;
  totalCostAdvanced: number;
  totalSavings: number;
  savingsPercentage: number;
  averageTimeStandard: number;
  averageTimeAdvanced: number;
  timeGainMultiplier: number;
  qualityScoreStandard: number;
  qualityScoreAdvanced: number;
  successRate: number;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const client = getDefaultClient();
      const geminiStats = client.getStats();
      
      // Simuler des données comparatives (à remplacer par vraies données)
      const mockAnalytics: AnalyticsData = {
        totalRequests: geminiStats.total_requests,
        totalCostStandard: geminiStats.total_cost * 10, // Estimation
        totalCostAdvanced: geminiStats.total_cost,
        totalSavings: geminiStats.total_cost * 9,
        savingsPercentage: 90,
        averageTimeStandard: 15,
        averageTimeAdvanced: 5,
        timeGainMultiplier: 3,
        qualityScoreStandard: 7.5,
        qualityScoreAdvanced: 9.2,
        successRate: (geminiStats.successful_requests / geminiStats.total_requests) * 100
      };

      setStats(geminiStats);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analytics || !stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <span>Aucune donnée disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Analytics Advanced
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparaison Standard vs Advanced
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Actualiser
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
              -{analytics.savingsPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {analytics.totalSavings.toLocaleString()} FCFA
          </div>
          <div className="text-xs text-green-600 mt-1">
            Économies réalisées
          </div>
        </div>

        {/* Time Gain */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              {analytics.timeGainMultiplier}x
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {analytics.averageTimeAdvanced}s
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Temps moyen (vs {analytics.averageTimeStandard}s)
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              +{((analytics.qualityScoreAdvanced - analytics.qualityScoreStandard) / analytics.qualityScoreStandard * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {analytics.qualityScoreAdvanced}/10
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Score qualité (vs {analytics.qualityScoreStandard}/10)
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
              {analytics.successRate.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {stats.successful_requests}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Requêtes réussies / {stats.total_requests}
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Comparaison Détaillée
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Métrique
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Standard
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Advanced
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Différence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Coût total</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600">
                    {analytics.totalCostStandard.toLocaleString()} FCFA
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-purple-600 font-semibold">
                    {analytics.totalCostAdvanced.toLocaleString()} FCFA
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      -{analytics.savingsPercentage}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Temps moyen</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600">
                    {analytics.averageTimeStandard}s
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-purple-600 font-semibold">
                    {analytics.averageTimeAdvanced}s
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      {analytics.timeGainMultiplier}x plus rapide
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Score qualité</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-600">
                    {analytics.qualityScoreStandard}/10
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-purple-600 font-semibold">
                    {analytics.qualityScoreAdvanced}/10
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 text-purple-600 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      +{((analytics.qualityScoreAdvanced - analytics.qualityScoreStandard) / analytics.qualityScoreStandard * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Usage by Thinking Level */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Utilisation par Thinking Level
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(stats.by_thinking_level).map(([level, data]) => (
              <div key={level} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                  {level}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          level === 'low' ? 'bg-green-500' :
                          level === 'medium' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                        style={{
                          width: `${(data.requests / stats.total_requests) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-12 text-right">
                      {((data.requests / stats.total_requests) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{data.requests} requêtes</span>
                    <span>{data.tokens.toLocaleString()} tokens</span>
                    <span>{data.cost.toFixed(2)} FCFA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">ROI Global</h3>
            <p className="text-sm text-purple-100">Retour sur investissement</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-3xl font-bold mb-1">
              {analytics.savingsPercentage}%
            </div>
            <div className="text-sm text-purple-100">
              Économies moyennes
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              {analytics.timeGainMultiplier}x
            </div>
            <div className="text-sm text-purple-100">
              Gain de vitesse
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              +{((analytics.qualityScoreAdvanced - analytics.qualityScoreStandard) / analytics.qualityScoreStandard * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-purple-100">
              Amélioration qualité
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

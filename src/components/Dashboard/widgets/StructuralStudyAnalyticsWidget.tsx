import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../firebase';

interface AnalyticsData {
  totalQuotes: number;
  preliminaryQuotes: number;
  definitiveQuotes: number;
  conversionRate: number;
  avgStudyDuration: number; // jours
  studiesInProgress: number;
  studiesPending: number;
  studiesCompleted: number;
  avgBudgetGap: number; // %
}

const StructuralStudyAnalyticsWidget: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalQuotes: 0,
    preliminaryQuotes: 0,
    definitiveQuotes: 0,
    conversionRate: 0,
    avgStudyDuration: 0,
    studiesInProgress: 0,
    studiesPending: 0,
    studiesCompleted: 0,
    avgBudgetGap: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const quotesRef = collection(db, 'structuredQuotes');
      const snapshot = await getDocs(quotesRef);

      let preliminaryCount = 0;
      let definitiveCount = 0;
      let inProgressCount = 0;
      let pendingCount = 0;
      let completedCount = 0;
      const durations: number[] = [];

      snapshot.forEach(doc => {
        const quote = doc.data();
        const quoteType = quote.quoteType || 'preliminary';
        const studyStatus = quote.structuralStudy?.status || 'none';

        if (quoteType === 'preliminary') preliminaryCount++;
        if (quoteType === 'definitive') definitiveCount++;

        if (studyStatus === 'in_progress') inProgressCount++;
        if (studyStatus === 'pending') pendingCount++;
        if (studyStatus === 'completed') completedCount++;

        // Calculer durée si étude complétée
        if (quote.structuralStudy?.startDate && quote.structuralStudy?.completionDate) {
          const start = new Date(quote.structuralStudy.startDate).getTime();
          const end = new Date(quote.structuralStudy.completionDate).getTime();
          const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
          if (durationDays > 0) durations.push(durationDays);
        }
      });

      const total = snapshot.size;
      const conversionRate = preliminaryCount > 0 
        ? (definitiveCount / preliminaryCount) * 100 
        : 0;
      const avgDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

      setData({
        totalQuotes: total,
        preliminaryQuotes: preliminaryCount,
        definitiveQuotes: definitiveCount,
        conversionRate: Math.round(conversionRate),
        avgStudyDuration: Math.round(avgDuration),
        studiesInProgress: inProgressCount,
        studiesPending: pendingCount,
        studiesCompleted: completedCount,
        avgBudgetGap: 0 // À implémenter avec historique
      });
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total devis',
      value: data.totalQuotes,
      icon: FileText,
      color: 'blue',
      subtext: `${data.preliminaryCount} estimatifs, ${data.definitiveQuotes} définitifs`
    },
    {
      label: 'Taux conversion',
      value: `${data.conversionRate}%`,
      icon: TrendingUp,
      color: 'green',
      subtext: 'Estimatif → Définitif'
    },
    {
      label: 'Durée moyenne',
      value: `${data.avgStudyDuration}j`,
      icon: Clock,
      color: 'orange',
      subtext: 'Études complétées'
    },
    {
      label: 'En cours',
      value: data.studiesInProgress,
      icon: AlertTriangle,
      color: 'yellow',
      subtext: `${data.studiesPending} prévues`
    }
  ];

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Études Structurales</h3>
            <p className="text-sm text-gray-600">Analytics & Suivi</p>
          </div>
        </div>
        <button
          onClick={loadAnalytics}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Actualiser
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 border-${stat.color}-200 bg-${stat.color}-50/50`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                <span className={`text-2xl font-bold text-${stat.color}-700`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Études complétées</span>
            <span className="font-medium text-green-600">{data.studiesCompleted}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{
                width: `${data.totalQuotes > 0 ? (data.studiesCompleted / data.totalQuotes) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">En cours</span>
            <span className="font-medium text-blue-600">{data.studiesInProgress}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{
                width: `${data.totalQuotes > 0 ? (data.studiesInProgress / data.totalQuotes) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Prévues</span>
            <span className="font-medium text-yellow-600">{data.studiesPending}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
              style={{
                width: `${data.totalQuotes > 0 ? (data.studiesPending / data.totalQuotes) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm">
          {data.conversionRate >= 50 ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">
                Excellent taux de conversion ! {data.conversionRate}% des devis estimatifs deviennent définitifs.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-orange-700">
                Taux de conversion à améliorer ({data.conversionRate}%). Encouragez les clients à réaliser les études.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructuralStudyAnalyticsWidget;

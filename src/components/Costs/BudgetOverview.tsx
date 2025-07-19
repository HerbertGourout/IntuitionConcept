import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, AlertTriangle } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFormatCurrency } from '../../utils/currency';

export const BudgetOverview: React.FC = () => {
    const formatCurrency = useFormatCurrency();
    const projectContext = useProjectContext();
    const project = projectContext.currentProject;
    
    if (!project) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun projet sélectionné</h3>
                <p className="text-gray-500">Sélectionnez un projet pour voir l'analyse budgétaire</p>
            </div>
        );
    }

    // Calculs dynamiques sécurisés
    const phases = project.phases || [];
    const totalEstimated = phases.reduce((sum, ph) => {
        const budget = typeof ph.estimatedBudget === 'number' ? ph.estimatedBudget : 0;
        return sum + budget;
    }, 0);
    
    const totalSpent = phases.reduce((sum, ph) => {
        const tasks = ph.tasks || [];
        const phaseSpent = tasks.reduce((s, t) => s + (t.spent || 0), 0);
        return sum + phaseSpent;
    }, 0);
    
    const variance = totalEstimated - totalSpent;
    const usagePercentage = totalEstimated > 0 ? (totalSpent / totalEstimated) * 100 : 0;
    const isOverBudget = totalSpent > totalEstimated;

    return (
        <div className="space-y-4">
            {/* Header compact */}
            <div className="glass-card p-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Vue d'ensemble budgétaire
                        </h1>
                        <p className="text-sm text-gray-600">
                            Suivi des coûts et performance financière
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistiques principales - Layout optimisé */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 mx-auto">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">💰 Budget estimé</span>
                    <div className="text-lg font-bold text-blue-700 break-words">
                        {formatCurrency(totalEstimated)}
                    </div>
                </div>

                <div className="glass-card p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mb-3 mx-auto">
                        <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">💸 Dépensé</span>
                    <div className="text-lg font-bold text-red-700 break-words">
                        {formatCurrency(totalSpent)}
                    </div>
                </div>

                <div className="glass-card p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto ${
                        isOverBudget 
                            ? 'bg-gradient-to-br from-red-500 to-red-600' 
                            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    }`}>
                        {isOverBudget ? (
                            <TrendingDown className="w-6 h-6 text-white" />
                        ) : (
                            <TrendingUp className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">
                        {isOverBudget ? '⚠️ Dépassement' : '💚 Économie'}
                    </span>
                    <div className={`text-lg font-bold break-words ${
                        isOverBudget ? 'text-red-700' : 'text-emerald-700'
                    }`}>
                        {formatCurrency(Math.abs(variance))}
                    </div>
                </div>

                <div className="glass-card p-4 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 mx-auto">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">📊 Utilisation</span>
                    <div className="text-lg font-bold text-purple-700 break-words">
                        {Math.round(usagePercentage)}%
                    </div>
                </div>
            </div>

            {/* Barre de progression globale */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Utilisation du budget global
                    </h3>
                    <span className={`text-lg font-bold ${
                        isOverBudget ? 'text-red-600' : 'text-blue-600'
                    }`}>
                        {usagePercentage.toFixed(1)}%
                    </span>
                </div>
                
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                        className={`h-full rounded-full transition-all duration-800 ${
                            isOverBudget 
                                ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                : usagePercentage > 75
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                </div>

                {/* Alertes budgétaires */}
                {isOverBudget && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-700 font-medium">
                                Attention : Budget dépassé de {formatCurrency(Math.abs(variance))}
                            </p>
                        </div>
                    </div>
                )}

                {usagePercentage > 90 && !isOverBudget && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                            <p className="text-yellow-700 font-medium">
                                Attention : Plus de 90% du budget utilisé
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Analyse par phases */}
            {phases.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Analyse par phases ({phases.length} phases)
                    </h3>
                    
                    <div className="space-y-4">
                        {phases.map((phase, index) => {
                            const tasks = phase.tasks || [];
                            const estimated = typeof phase.estimatedBudget === 'number' ? phase.estimatedBudget : 0;
                            const spent = tasks.reduce((s, t) => s + (t.spent || 0), 0);
                            const remaining = estimated - spent;
                            const usage = estimated > 0 ? (spent / estimated) * 100 : 0;
                            const status = spent > estimated ? 'over' : usage > 90 ? 'warning' : 'good';
                            const progressPercentage = Math.min((tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100, 100);

                            return (
                                <div key={phase.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{phase.name}</h4>
                                            <p className="text-sm text-gray-600">{tasks.length} tâches</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {phase.status === 'completed' ? 'Terminée' :
                                             phase.status === 'in_progress' ? 'En cours' : 'Planifiée'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Estimé</div>
                                            <div className="font-semibold text-blue-600">{formatCurrency(estimated)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">Dépensé</div>
                                            <div className={`font-semibold ${
                                                status === 'over' ? 'text-red-600' : 'text-gray-800'
                                            }`}>
                                                {formatCurrency(spent)}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600">
                                                {remaining < 0 ? 'Dépassement' : 'Restant'}
                                            </div>
                                            <div className={`font-semibold ${
                                                remaining < 0 ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                                {formatCurrency(Math.abs(remaining))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Avancement</span>
                                            <span className="text-sm font-medium text-purple-600">
                                                {Math.round(progressPercentage)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-800"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Utilisation budget</span>
                                            <span className={`text-sm font-medium ${
                                                status === 'over' ? 'text-red-600' : 'text-blue-600'
                                            }`}>
                                                {Math.round(usage)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-800 ${
                                                    status === 'over' 
                                                        ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                                }`}
                                                style={{ width: `${Math.min(usage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetOverview;

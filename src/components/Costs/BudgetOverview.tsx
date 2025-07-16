import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import Progress from '../UI/progress'; // Glassmorphism progress bar


interface Phase {
    id: string;
    name: string;
    estimatedCost: number;
    actualCost: number;
    completion: number;
}

export interface ProjectData {
    name: string;
    budget: number;
    actualSpent: number;
    phases: Phase[];
}

interface BudgetOverviewProps {
    project: ProjectData;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ project }) => {
    const { budget, actualSpent, phases } = project;
    const remaining = budget - actualSpent;
    const usagePercentage = (actualSpent / budget) * 100;
    const isOverBudget = actualSpent > budget;
    
    // Calcul des statistiques
    const completedPhases = phases.filter(p => p.completion === 100).length;
    const inProgressPhases = phases.filter(p => p.completion > 0 && p.completion < 100).length;
    const overBudgetPhases = phases.filter(p => p.actualCost > p.estimatedCost).length;

    return (
        <div className="space-y-8">
            {/* Header avec titre et statistiques rapides */}
            <div className="glass-card p-8 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Vue d'ensemble budgétaire
                    </h2>
                    <p className="text-gray-600">Suivi des coûts et performance financière du projet</p>
                </div>

                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 mx-auto">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">💰 Budget total</span>
                        <div className="text-2xl font-bold text-blue-700">
                            {budget.toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto ${
                            isOverBudget 
                                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                                : 'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                            {isOverBudget ? (
                                <TrendingUp className="w-6 h-6 text-white" />
                            ) : (
                                <TrendingDown className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                            {isOverBudget ? '🚨 Dépassement' : '💸 Dépensé'}
                        </span>
                        <div className={`text-2xl font-bold ${
                            isOverBudget ? 'text-red-600' : 'text-green-600'
                        }`}>
                            {actualSpent.toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto ${
                            remaining < 0 
                                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                                : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        }`}>
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                            {remaining < 0 ? '🔴 Déficit' : '🟢 Restant'}
                        </span>
                        <div className={`text-2xl font-bold ${
                            remaining < 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                            {Math.abs(remaining).toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 mx-auto">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">🎯 Utilisation</span>
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round(usagePercentage)}%
                        </div>
                    </div>
                </div>

                {/* Barre de progression globale */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Progression budgétaire
                        </h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            isOverBudget 
                                ? 'bg-red-100 text-red-700' 
                                : usagePercentage > 75 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-green-100 text-green-700'
                        }`}>
                            {isOverBudget ? 'Dépassement' : usagePercentage > 75 ? 'Attention' : 'Normal'}
                        </span>
                    </div>
                    <Progress value={Math.min(usagePercentage, 100)} className="mt-4" />
                </div>
            </div>

            {/* Section des phases avec cartes modernes */}
            <div className="glass-card p-8 bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Analyse par phase
                            </h3>
                            <p className="text-gray-600 text-sm">Performance budgétaire détaillée</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">{completedPhases} terminées</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">{inProgressPhases} en cours</span>
                        </div>
                        {overBudgetPhases > 0 && (
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">{overBudgetPhases} dépassées</span>
                            </div>
                        )}
                    </div>
                </div>

                {phases.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">Aucune phase enregistrée</p>
                        <p className="text-gray-400 text-sm mt-1">Les phases apparaîtront ici une fois créées</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {phases.map((phase) => {
                            const phaseRemaining = phase.estimatedCost - phase.actualCost;
                            const phaseUsage = (phase.actualCost / phase.estimatedCost) * 100;
                            const isPhaseOverBudget = phase.actualCost > phase.estimatedCost;
                            
                            return (
                                <div key={phase.id} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 text-lg">{phase.name}</h4>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            phase.completion === 100 
                                                ? 'bg-green-100 text-green-700' 
                                                : phase.completion > 0 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {phase.completion === 100 ? '✓ Terminée' : phase.completion > 0 ? 'En cours' : 'Planifiée'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Budget alloué
                                            </span>
                                            <span className="font-semibold text-blue-700">
                                                {phase.estimatedCost.toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                {isPhaseOverBudget ? (
                                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-green-500" />
                                                )}
                                                Dépensé
                                            </span>
                                            <span className={`font-semibold ${
                                                isPhaseOverBudget ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {phase.actualCost.toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                {phaseRemaining < 0 ? 'Dépassement' : 'Restant'}
                                            </span>
                                            <span className={`font-semibold ${
                                                phaseRemaining < 0 ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                                {Math.abs(phaseRemaining).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Avancement</span>
                                                <span className="text-sm font-medium text-purple-600">{phase.completion}%</span>
                                            </div>
                                            <Progress value={phase.completion} className="mb-2" />
                                            
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Utilisation budget</span>
                                                <span className={`text-sm font-medium ${
                                                    isPhaseOverBudget ? 'text-red-600' : 'text-blue-600'
                                                }`}>
                                                    {Math.round(phaseUsage)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-800 ${
                                                        isPhaseOverBudget 
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-400' 
                                                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                                    }`}
                                                    style={{ width: `${Math.min(phaseUsage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

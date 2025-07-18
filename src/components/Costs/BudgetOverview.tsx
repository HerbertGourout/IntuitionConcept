import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, AlertTriangle, CheckCircle, Package, Wrench, Users, Building, FileText } from 'lucide-react';
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
    
    const overBudgetPhases = phases.filter(ph => {
        const est = typeof ph.estimatedBudget === 'number' ? ph.estimatedBudget : 0;
        const tasks = ph.tasks || [];
        const spent = tasks.reduce((s, t) => s + (t.spent || 0), 0);
        return est > 0 && spent > est;
    }).length;

    // Statistiques phases
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const inProgressPhases = phases.filter(p => p.status === 'in_progress').length;

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
                        <span className="text-sm font-medium text-gray-600 block mb-1">💰 Budget estimé</span>
                        <div className="text-xl md:text-2xl font-bold text-blue-700 break-words">
                            {formatCurrency(totalEstimated)}
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
                                <CheckCircle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">💸 Dépensé</span>
                        <div className={`text-xl md:text-2xl font-bold break-words ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                            {formatCurrency(totalSpent)}
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto ${
                            variance < 0 
                                ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                                : 'bg-gradient-to-br from-emerald-500 to-green-600'
                        }`}>
                            {variance < 0 ? (
                                <AlertTriangle className="w-6 h-6 text-white" />
                            ) : (
                                <Target className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                            {variance < 0 ? '⚠️ Dépassement' : '✅ Économie'}
                        </span>
                        <div className={`text-xl md:text-2xl font-bold break-words ${variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {formatCurrency(Math.abs(variance))}
                        </div>
                    </div>
                    
                    <div className="glass-card p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-3 mx-auto">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">📊 Utilisation</span>
                        <div className={`text-2xl font-bold ${usagePercentage > 100 ? 'text-red-600' : 'text-purple-600'}`}>
                            {Math.round(usagePercentage)}%
                        </div>
                    </div>
                </div>

                {/* Barre de progression globale */}
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Progression budgétaire globale
                        </h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            isOverBudget 
                                ? 'bg-red-100 text-red-700' 
                                : usagePercentage > 75 
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                        }`}>
                            {isOverBudget ? 'Dépassement' : usagePercentage > 75 ? 'Attention' : 'Sous contrôle'}
                        </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                            className={`h-full rounded-full transition-all duration-800 ${
                                isOverBudget 
                                    ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                    : usagePercentage > 75
                                        ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>0 €</span>
                        <span className="font-medium">
                            {formatCurrency(totalSpent)} / {formatCurrency(totalEstimated)}
                        </span>
                        <span>{formatCurrency(totalEstimated)}</span>
                    </div>
                </div>
            </div>

            {/* Section Répartition des Coûts par Catégorie */}
            <div className="glass-card p-8 bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Répartition des Coûts
                    </h2>
                    <p className="text-gray-600">Analyse détaillée par catégorie de dépenses</p>
                </div>

                {(() => {
                    // Calcul des coûts par catégorie depuis les CostItems des tâches
                    const costsByCategory = {
                        material: { estimated: 0, actual: 0, count: 0 },
                        equipment: { estimated: 0, actual: 0, count: 0 },
                        labor: { estimated: 0, actual: 0, count: 0 },
                        subcontractor: { estimated: 0, actual: 0, count: 0 },
                        other: { estimated: 0, actual: 0, count: 0 }
                    };

                    // Parcourir toutes les phases et tâches pour calculer les coûts par catégorie
                    phases.forEach(phase => {
                        const tasks = phase.tasks || [];
                        tasks.forEach(task => {
                            const costItems = task.costItems || [];
                            costItems.forEach(item => {
                                const category = item.type as keyof typeof costsByCategory;
                                if (costsByCategory[category]) {
                                    costsByCategory[category].estimated += (item.estimatedQuantity || 0) * (item.estimatedUnitPrice || 0);
                                    costsByCategory[category].actual += item.actualTotal || 0;
                                    costsByCategory[category].count += 1;
                                }
                            });
                        });
                    });

                    const categoryConfig = [
                        {
                            key: 'material',
                            name: 'Matériaux',
                            icon: Package,
                            color: 'blue',
                            emoji: '🧱'
                        },
                        {
                            key: 'equipment',
                            name: 'Équipements',
                            icon: Wrench,
                            color: 'orange',
                            emoji: '🔧'
                        },
                        {
                            key: 'labor',
                            name: 'Main-d\'œuvre',
                            icon: Users,
                            color: 'green',
                            emoji: '👷'
                        },
                        {
                            key: 'subcontractor',
                            name: 'Sous-traitance',
                            icon: Building,
                            color: 'purple',
                            emoji: '🏗️'
                        },
                        {
                            key: 'other',
                            name: 'Autres',
                            icon: FileText,
                            color: 'gray',
                            emoji: '📋'
                        }
                    ];

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryConfig.map(config => {
                                const data = costsByCategory[config.key];
                                const usagePercentage = data.estimated > 0 ? (data.actual / data.estimated) * 100 : 0;
                                const isOverBudget = data.actual > data.estimated;
                                const IconComponent = config.icon;

                                return (
                                    <div key={config.key} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{config.emoji} {config.name}</h4>
                                                    <p className="text-sm text-gray-500">{data.count} élément{data.count > 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">💰 Estimé</span>
                                                <span className="font-semibold text-blue-600">
                                                    {formatCurrency(data.estimated)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">💸 Réel</span>
                                                <span className={`font-semibold ${
                                                    isOverBudget ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {formatCurrency(data.actual)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">📊 Utilisation</span>
                                                <span className={`font-semibold text-sm ${
                                                    isOverBudget ? 'text-red-600' : usagePercentage > 75 ? 'text-orange-600' : 'text-green-600'
                                                }`}>
                                                    {Math.round(usagePercentage)}%
                                                </span>
                                            </div>

                                            {/* Barre de progression */}
                                            <div className="pt-2">
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-800 ${
                                                            isOverBudget 
                                                                ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                                                : usagePercentage > 75
                                                                    ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                                                                    : `bg-gradient-to-r from-${config.color}-500 to-${config.color}-400`
                                                        }`}
                                                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Alerte si dépassement */}
                                            {isOverBudget && (
                                                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    <span className="text-xs text-red-700 font-medium">
                                                        Dépassement de {formatCurrency(data.actual - data.estimated)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* Analyse par phases */}
            {phases.length > 0 && (
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            Analyse par phases ({phases.length})
                        </h3>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Terminées: {completedPhases}
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                En cours: {inProgressPhases}
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Dépassement: {overBudgetPhases}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {phases.map((phase, index) => {
                            const estimated = typeof phase.estimatedBudget === 'number' ? phase.estimatedBudget : 0;
                            const tasks = phase.tasks || [];
                            const spent = tasks.reduce((s, t) => s + (t.spent || 0), 0);
                            const remaining = estimated - spent;
                            const usage = estimated > 0 ? (spent / estimated) * 100 : 0;
                            const status = spent > estimated ? 'over' : usage > 75 ? 'warning' : 'good';
                            // Calculate progress based on completed tasks
                            const totalTasks = tasks.length;
                            const completedTasks = tasks.filter(task => task.status === 'done').length;
                            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                            return (
                                <div key={index} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-800 truncate">{phase.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            phase.status === 'completed' 
                                                ? 'bg-green-100 text-green-700'
                                                : phase.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {phase.status === 'completed' ? 'Terminée' : 
                                             phase.status === 'in_progress' ? 'En cours' : 'Planifiée'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Budget
                                            </span>
                                            <span className="font-semibold text-blue-600">
                                                {estimated.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                {status === 'over' ? (
                                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-green-500" />
                                                )}
                                                Dépensé
                                            </span>
                                            <span className={`font-semibold ${
                                                status === 'over' ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {formatCurrency(spent)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                {remaining < 0 ? 'Dépassement' : 'Restant'}
                                            </span>
                                            <span className={`font-semibold ${
                                                remaining < 0 ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                                {formatCurrency(Math.abs(remaining))}
                                            </span>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Avancement</span>
                                                <span className="text-sm font-medium text-purple-600">
                                                    {progressPercentage}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-800"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            
                                            <div className="flex justify-between items-center mb-2">
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

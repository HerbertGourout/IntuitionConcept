import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'; // Peut être remplacé par Lucide si souhaité
import Progress from '../UI/progress'; // Glassmorphism progress bar
// Pas d'import Ant Design Card, Table, Progress, Typography
// Utilisation exclusive de composants custom et Tailwind/glassmorphism


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

    const columns = [
        {
            title: 'Phase',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Budget alloué',
            dataIndex: 'estimatedCost',
            key: 'estimatedCost',
            render: (value: number) => (
                <span>{value.toLocaleString('fr-FR')} FCFA</span>
            ),
        },
        {
            title: 'Dépensé',
            dataIndex: 'actualCost',
            key: 'actualCost',
            render: (value: number) => (
                <span>{value.toLocaleString('fr-FR')} FCFA</span>
            ),
        },
        {
            title: 'Reste',
            key: 'remaining',
            render: (_: unknown, record: Phase) => {
                const remaining = record.estimatedCost - record.actualCost;
                return (
                    <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                        {remaining.toLocaleString('fr-FR')} FCFA
                        {remaining < 0 && (
                            <ArrowUpOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                        )}
                        {remaining > 0 && (
                            <ArrowDownOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                        )}
                    </span>
                );
            },
        },
        {
            title: 'Avancement',
            key: 'progress',
            render: (_: unknown, record: Phase) => (
                <Progress value={record.completion} />
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Glassmorphism Card principale */}
            <div className="glass-card p-8 shadow-2xl transition-all duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <span className="text-gray-500 font-semibold">Budget total</span>
                        <div className="mt-1 text-3xl font-bold text-blue-700 drop-shadow">
                            {budget.toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-gray-500 font-semibold">Dépensé</span>
                        <div className={`mt-1 text-3xl font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'} drop-shadow flex items-center justify-center`}>
                            {actualSpent.toLocaleString('fr-FR')} FCFA
                            {isOverBudget ? (
                                <ArrowUpOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                            ) : (
                                <ArrowDownOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-gray-500 font-semibold">Reste</span>
                        <div className={`mt-1 text-3xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'} drop-shadow`}>
                            {Math.abs(remaining).toLocaleString('fr-FR')} FCFA
                            <span className="ml-2 text-base font-medium">
                                {remaining < 0 ? '(Dépassement)' : '(Disponible)'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-700 font-medium">Utilisation du budget</span>
                        <span className="font-bold text-blue-700">{usagePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-800 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Glassmorphism Card pour le détail par phase */}
            <div className="glass-card p-8 mt-6 shadow-2xl transition-all duration-500">
                <div className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mr-2"></span>
                    Détail par phase
                </div>
                <div className="overflow-x-auto">
                  <table className="glass-table min-w-full text-sm rounded-2xl overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 text-blue-900">
                        <th className="px-4 py-2 font-semibold text-left">Phase</th>
                        <th className="px-4 py-2 font-semibold text-left">Budget alloué</th>
                        <th className="px-4 py-2 font-semibold text-left">Dépensé</th>
                        <th className="px-4 py-2 font-semibold text-left">Reste</th>
                        <th className="px-4 py-2 font-semibold text-left">Avancement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phases.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-blue-400">Aucune phase enregistrée</td>
                        </tr>
                      ) : (
                        phases.map((phase) => {
                          const phaseRemaining = phase.estimatedCost - phase.actualCost;
                          return (
                            <tr key={phase.id} className="transition hover:bg-blue-50/60">
                              <td className="px-4 py-3 font-bold text-blue-900">{phase.name}</td>
                              <td className="px-4 py-3">{phase.estimatedCost.toLocaleString('fr-FR')} FCFA</td>
                              <td className="px-4 py-3">{phase.actualCost.toLocaleString('fr-FR')} FCFA</td>
                              <td className={`px-4 py-3 font-semibold ${phaseRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{phaseRemaining.toLocaleString('fr-FR')} FCFA
                                {phaseRemaining < 0 && <ArrowUpOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />}
                                {phaseRemaining > 0 && <ArrowDownOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
                              </td>
                              <td className="px-4 py-3 w-48">
                                <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-800 ${phase.actualCost > phase.estimatedCost ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                                    style={{ width: `${Math.min(phase.completion, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-blue-700">{phase.completion}%</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
        </div>
    );
};

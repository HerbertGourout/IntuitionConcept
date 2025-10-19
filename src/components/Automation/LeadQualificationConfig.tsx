import React, { useState } from 'react';
import { motion } from 'framer-motion';
import leadQualificationService, { Lead, QualificationConfig } from '../../services/leadQualificationService';

const LeadQualificationConfig: React.FC = () => {
    const [config, setConfig] = useState(leadQualificationService.getConfig());
    const [isProcessing, setIsProcessing] = useState(false);
    const [leads] = useState<Lead[]>([
        {
            id: 'lead-1',
            name: 'Marie Diallo',
            email: 'marie@example.com',
            phone: '+221 77 123 45 67',
            company: 'Diallo Construction',
            projectType: 'construction',
            budget: 8000000,
            timeline: 'urgent',
            source: 'referral',
            score: 92,
            status: 'qualified',
            createdAt: new Date('2025-01-15')
        },
        {
            id: 'lead-2',
            name: 'Amadou Sow',
            email: 'amadou@example.com',
            projectType: 'renovation',
            budget: 2000000,
            timeline: '3-6 mois',
            source: 'website',
            score: 58,
            status: 'new',
            createdAt: new Date('2025-01-16')
        }
    ]);

    const [stats] = useState({
        totalLeads: 87,
        qualified: 45,
        converted: 23,
        avgScore: 67
    });

    const handleConfigChange = (key: keyof QualificationConfig, value: QualificationConfig[keyof QualificationConfig]) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        leadQualificationService.configure(newConfig);
    };

    const handleProcessNow = async () => {
        setIsProcessing(true);
        try {
            const result = await leadQualificationService.processNewLeads();
            alert(`✅ Qualification terminée !\n\n` +
                `Prospects traités : ${result.leadsProcessed}\n` +
                `Qualifiés : ${result.leadsQualified}\n` +
                `Assignés : ${result.leadsAssigned}\n` +
                `Erreurs : ${result.errors.length}`);
        } catch (error) {
            console.error('Erreur lors de la qualification des leads:', error);
            alert('❌ Erreur lors de la qualification');
        } finally {
            setIsProcessing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-blue-600 bg-blue-100';
        return 'text-orange-600 bg-orange-100';
    };

    const getStatusBadge = (status: Lead['status']) => {
        const badges = {
            new: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Nouveau' },
            qualified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Qualifié' },
            contacted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Contacté' },
            converted: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Converti' },
            lost: { bg: 'bg-red-100', text: 'text-red-700', label: 'Perdu' }
        };
        const badge = badges[status];
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 Qualification Automatique Prospects</h1>
                    <p className="text-gray-600">Scorez et qualifiez automatiquement vos prospects pour maximiser les conversions</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Total Prospects</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                            </div>
                            <div className="bg-teal-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Qualifiés</p>
                                <p className="text-3xl font-bold text-green-600">{stats.qualified}</p>
                                <p className="text-xs text-gray-500">{Math.round((stats.qualified / stats.totalLeads) * 100)}%</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Convertis</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.converted}</p>
                                <p className="text-xs text-gray-500">{Math.round((stats.converted / stats.qualified) * 100)}%</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Score Moyen</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.avgScore}</p>
                                <p className="text-xs text-gray-500">/100</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Configuration</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">Activer qualification auto</span>
                                    <input type="checkbox" checked={config.enabled}
                                        onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-teal-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">Assignation automatique</span>
                                    <input type="checkbox" checked={config.autoAssignEnabled}
                                        onChange={(e) => handleConfigChange('autoAssignEnabled', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-teal-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Score minimum qualifié
                                </label>
                                <input type="number" value={config.minScoreForQualified}
                                    onChange={(e) => handleConfigChange('minScoreForQualified', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    min="0" max="100" />
                                <p className="text-xs text-gray-500 mt-1">Prospects avec score ≥ {config.minScoreForQualified} = qualifiés</p>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-3">
                                    Poids des critères
                                </label>
                                <div className="space-y-3">
                                    {Object.entries(config.criteria).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 capitalize">{key.replace('Weight', '')}</span>
                                                <span className="font-medium">{value}%</span>
                                            </div>
                                            <input type="range" value={value}
                                                onChange={(e) => handleConfigChange('criteria', {
                                                    ...config.criteria,
                                                    [key]: parseInt(e.target.value)
                                                })}
                                                className="w-full" min="0" max="50" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleProcessNow} disabled={isProcessing || !config.enabled}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
                                    isProcessing || !config.enabled
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                                }`}>
                                {isProcessing ? 'Traitement...' : '⚡ Qualifier Prospects Maintenant'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Leads List */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                        className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Prospects Récents</h2>

                        <div className="space-y-4">
                            {leads.map((lead) => (
                                <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-gray-900">{lead.name}</h3>
                                                {getStatusBadge(lead.status)}
                                            </div>
                                            {lead.company && (
                                                <p className="text-sm text-gray-600 mb-1">🏢 {lead.company}</p>
                                            )}
                                            <p className="text-sm text-gray-600">📧 {lead.email}</p>
                                            {lead.phone && (
                                                <p className="text-sm text-gray-600">📞 {lead.phone}</p>
                                            )}
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreColor(lead.score)}`}>
                                            {lead.score}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Projet</p>
                                            <p className="font-medium text-gray-900 capitalize">{lead.projectType}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Budget</p>
                                            <p className="font-medium text-gray-900">
                                                {lead.budget ? `${(lead.budget / 1000000).toFixed(1)}M FCFA` : 'Non renseigné'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Timeline</p>
                                            <p className="font-medium text-gray-900 capitalize">{lead.timeline || 'Non renseigné'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Source : {lead.source}</span>
                                        <span>{lead.createdAt.toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LeadQualificationConfig;

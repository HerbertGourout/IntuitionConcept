import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import autoInvoiceService, { Invoice, InvoiceConfig } from '../../services/autoInvoiceService';

const AutoInvoiceConfig: React.FC = () => {
    const [config, setConfig] = useState(autoInvoiceService.getConfig());
    const [isProcessing, setIsProcessing] = useState(false);
    const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalAmount: 0,
        pendingInvoices: 0,
        overdueInvoices: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        // Simulation - À remplacer par vraies données Firebase
        setStats({
            totalInvoices: 45,
            totalAmount: 125000000,
            pendingInvoices: 12,
            overdueInvoices: 3
        });

        // Charger factures récentes
        setRecentInvoices([
            {
                id: 'inv-1',
                invoiceNumber: 'INV-202501-0001',
                projectId: 'proj-1',
                projectName: 'Construction Villa Moderne',
                clientId: 'client-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 5000000,
                taxAmount: 900000,
                totalAmount: 5900000,
                description: 'Facture phase 1',
                items: [],
                dueDate: new Date('2025-02-15'),
                status: 'sent',
                createdAt: new Date('2025-01-15'),
                createdBy: 'system'
            }
        ]);
    };

    const handleConfigChange = (key: keyof InvoiceConfig, value: InvoiceConfig[keyof InvoiceConfig]) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        autoInvoiceService.configure(newConfig);
    };

    const handleProcessNow = async () => {
        setIsProcessing(true);
        try {
            const result = await autoInvoiceService.processAutoInvoicing();
            alert(`✅ Facturation terminée !\n\n` +
                `Projets traités : ${result.projectsProcessed}\n` +
                `Factures générées : ${result.invoicesGenerated}\n` +
                `Factures envoyées : ${result.invoicesSent}\n` +
                `Erreurs : ${result.errors.length}`);
            await loadStats();
        } catch (error) {
            console.error('Erreur lors du traitement de la facturation:', error);
            alert('❌ Erreur lors du traitement');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: Invoice['status']) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
            sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Envoyée' },
            paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payée' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'En retard' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annulée' }
        };
        const badge = badges[status];
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        💰 Facturation Automatique
                    </h1>
                    <p className="text-gray-600">
                        Générez et envoyez automatiquement vos factures basées sur l'avancement des projets
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Total Factures</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Montant Total</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {(stats.totalAmount / 1000000).toFixed(1)}M
                                </p>
                                <p className="text-xs text-gray-500">FCFA</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">En Attente</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">En Retard</p>
                                <p className="text-3xl font-bold text-red-600">{stats.overdueInvoices}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Configuration</h2>

                            <div className="space-y-6">
                                {/* Activation */}
                                <div>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700 font-medium">Activer la facturation auto</span>
                                        <input
                                            type="checkbox"
                                            checked={config.enabled}
                                            onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                                            className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative cursor-pointer transition-colors"
                                        />
                                    </label>
                                </div>

                                {/* Auto-send */}
                                <div>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700 font-medium">Envoi automatique</span>
                                        <input
                                            type="checkbox"
                                            checked={config.autoSendEnabled}
                                            onChange={(e) => handleConfigChange('autoSendEnabled', e.target.checked)}
                                            className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative cursor-pointer transition-colors"
                                        />
                                    </label>
                                </div>

                                {/* TVA */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Taux TVA (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.taxRate}
                                        onChange={(e) => handleConfigChange('taxRate', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                {/* Délai paiement */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Délai de paiement (jours)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.paymentTermDays}
                                        onChange={(e) => handleConfigChange('paymentTermDays', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="1"
                                        max="90"
                                    />
                                </div>

                                {/* Lien paiement */}
                                <div>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700 font-medium">Lien paiement Mobile Money</span>
                                        <input
                                            type="checkbox"
                                            checked={config.includePaymentLink}
                                            onChange={(e) => handleConfigChange('includePaymentLink', e.target.checked)}
                                            className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative cursor-pointer transition-colors"
                                        />
                                    </label>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleProcessNow}
                                    disabled={isProcessing || !config.enabled}
                                    className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
                                        isProcessing || !config.enabled
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Traitement en cours...
                                        </span>
                                    ) : (
                                        '⚡ Générer Factures Maintenant'
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Invoices */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Factures Récentes</h2>

                            <div className="space-y-4">
                                {recentInvoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                                                <p className="text-sm text-gray-600">{invoice.projectName}</p>
                                            </div>
                                            {getStatusBadge(invoice.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Client</p>
                                                <p className="text-sm font-medium text-gray-900">{invoice.clientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Montant TTC</p>
                                                <p className="text-sm font-bold text-green-600">
                                                    {invoice.totalAmount.toLocaleString('fr-FR')} FCFA
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Créée le {invoice.createdAt.toLocaleDateString('fr-FR')}</span>
                                            <span>Échéance : {invoice.dueDate.toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                ))}

                                {recentInvoices.length === 0 && (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500">Aucune facture récente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AutoInvoiceConfig;

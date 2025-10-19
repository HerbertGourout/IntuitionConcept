import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Mail, 
    MessageSquare, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    Settings,
    Play,
    BarChart3,
    Calendar
} from 'lucide-react';
import { quoteFollowUpService, FollowUpConfig, FollowUpResult } from '../../services/quoteFollowUpService';

const QuoteFollowUpConfig: React.FC = () => {
    const [config, setConfig] = useState<FollowUpConfig>(quoteFollowUpService.getConfig());
    const [stats, setStats] = useState({
        totalQuotesNeedingFollowUp: 0,
        quotesNearExpiry: 0,
        averageFollowUpCount: 0,
        conversionRateAfterFollowUp: 0
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<FollowUpResult | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const newStats = await quoteFollowUpService.getFollowUpStats();
        setStats(newStats);
    };

    const handleConfigChange = (key: keyof FollowUpConfig, value: FollowUpConfig[keyof FollowUpConfig]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setIsSaved(false);
    };

    const handleSave = () => {
        quoteFollowUpService.configure(config);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleRunNow = async () => {
        setIsProcessing(true);
        try {
            const result = await quoteFollowUpService.processFollowUps();
            setLastResult(result);
            await loadStats();
        } catch (error) {
            console.error('Erreur lors du traitement:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Relances Devis Automatiques
                                </h1>
                                <p className="text-blue-100 text-sm">
                                    Augmentez votre taux de conversion de +25% avec des relances intelligentes
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRunNow}
                            disabled={isProcessing}
                            className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                            <Play className="w-5 h-5" />
                            <span>{isProcessing ? 'Traitement...' : 'Exécuter Maintenant'}</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Devis à Relancer</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {stats.totalQuotesNeedingFollowUp}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Proche Expiration</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {stats.quotesNearExpiry}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Relances Moy.</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {stats.averageFollowUpCount.toFixed(1)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Taux Conversion</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {stats.conversionRateAfterFollowUp.toFixed(0)}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Résultat dernière exécution */}
            {lastResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
                >
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Dernière Exécution Réussie
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-300">Devis Traités</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {lastResult.quotesProcessed}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-300">Emails Envoyés</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {lastResult.emailsSent}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-green-700 dark:text-green-300">SMS Envoyés</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {lastResult.smsSent}
                            </p>
                        </div>
                    </div>
                    {lastResult.errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {lastResult.errors.length} erreur(s) détectée(s)
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Configuration
                            </h2>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                isSaved 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
                        </motion.button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Activation */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Activer les Relances Automatiques
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Les devis seront automatiquement relancés selon la configuration
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Délais de relance */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Délais de Relance
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    1ère Relance (jours)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={config.firstFollowUpDays}
                                    onChange={(e) => handleConfigChange('firstFollowUpDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Après envoi du devis</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    2ème Relance (jours)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={config.secondFollowUpDays}
                                    onChange={(e) => handleConfigChange('secondFollowUpDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Après 1ère relance</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    3ème Relance (jours)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={config.thirdFollowUpDays}
                                    onChange={(e) => handleConfigChange('thirdFollowUpDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Après 2ème relance</p>
                            </div>
                        </div>
                    </div>

                    {/* Paramètres avancés */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Paramètres Avancés
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre Max de Relances
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={config.maxFollowUps}
                                    onChange={(e) => handleConfigChange('maxFollowUps', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Alerte Expiration (jours avant)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="14"
                                    value={config.expiryWarningDays}
                                    onChange={(e) => handleConfigChange('expiryWarningDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Options SMS */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Notifications SMS
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        Envoyer des SMS
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Envoyer des SMS en plus des emails
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.sendSMS}
                                        onChange={(e) => handleConfigChange('sendSMS', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {config.sendSMS && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            SMS Uniquement Urgent
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            SMS seulement pour dernière relance ou proche expiration
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.smsOnlyUrgent}
                                            onChange={(e) => handleConfigChange('smsOnlyUrgent', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteFollowUpConfig;

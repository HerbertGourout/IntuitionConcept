import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clientCommunicationService, { CommunicationConfig } from '../../services/clientCommunicationService';

const ClientCommunicationConfig: React.FC = () => {
    const [config, setConfig] = useState(clientCommunicationService.getConfig());
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Stats de démonstration (statiques)
    const stats = {
        totalSent: 156,
        openRate: 78,
        clickRate: 45,
        satisfaction: 92
    };

    const handleConfigChange = (key: keyof CommunicationConfig, value: CommunicationConfig[keyof CommunicationConfig]) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        clientCommunicationService.configure(newConfig);
    };

    const handleProcessNow = async () => {
        setIsProcessing(true);
        try {
            const result = await clientCommunicationService.processAutoCommunications();
            alert(`✅ Communications envoyées !\n\n` +
                `Projets traités : ${result.projectsProcessed}\n` +
                `Mises à jour envoyées : ${result.updatesSent}\n` +
                `Erreurs : ${result.errors.length}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des communications:', error);
            alert('❌ Erreur lors de l\'envoi');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">💬 Communication Client Automatisée</h1>
                    <p className="text-gray-600">Tenez vos clients informés automatiquement de l'avancement de leurs projets</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Messages Envoyés</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalSent}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Taux d'Ouverture</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.openRate}%</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Taux de Clic</p>
                                <p className="text-3xl font-bold text-green-600">{stats.clickRate}%</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Satisfaction</p>
                                <p className="text-3xl font-bold text-pink-600">{stats.satisfaction}%</p>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuration */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Configuration</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">Activer communications auto</span>
                                    <input type="checkbox" checked={config.enabled}
                                        onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-purple-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">Envoi automatique</span>
                                    <input type="checkbox" checked={config.autoSendEnabled}
                                        onChange={(e) => handleConfigChange('autoSendEnabled', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-purple-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Seuil d'avancement (%)
                                </label>
                                <input type="number" value={config.progressThreshold}
                                    onChange={(e) => handleConfigChange('progressThreshold', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    min="1" max="100" />
                                <p className="text-xs text-gray-500 mt-1">Envoyer une mise à jour tous les X%</p>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">Inclure photos chantier</span>
                                    <input type="checkbox" checked={config.includePhotos}
                                        onChange={(e) => handleConfigChange('includePhotos', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-purple-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-700 font-medium">SMS pour urgences</span>
                                    <input type="checkbox" checked={config.smsForUrgent}
                                        onChange={(e) => handleConfigChange('smsForUrgent', e.target.checked)}
                                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-purple-500 relative cursor-pointer transition-colors" />
                                </label>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Heure d'envoi préférée
                                </label>
                                <input type="time" value={config.scheduleTime}
                                    onChange={(e) => handleConfigChange('scheduleTime', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                            </div>

                            <button onClick={handleProcessNow} disabled={isProcessing || !config.enabled}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
                                    isProcessing || !config.enabled
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                                }`}>
                                {isProcessing ? 'Envoi en cours...' : '📧 Envoyer Mises à Jour Maintenant'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Preview */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                        className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">👁️ Aperçu Email</h2>

                        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg -m-6 mb-6">
                                <h1 className="text-2xl font-bold">🏗️ IntuitionConcept</h1>
                                <p className="text-sm opacity-90">Mise à jour de votre projet</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-700">Bonjour <strong>Jean Dupont</strong>,</p>
                                
                                <p className="text-gray-700">
                                    Nous sommes heureux de vous informer que votre projet 
                                    <strong> Construction Villa Moderne</strong> progresse bien !
                                </p>

                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">45% complété</span>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm">
                                    Les fondations sont terminées et nous commençons la structure porteuse.
                                </p>

                                <div className="bg-purple-100 border-l-4 border-purple-600 p-4 rounded">
                                    <p className="text-sm text-gray-700">
                                        <strong>💡 Prochaine étape :</strong> Élévation des murs - Début prévu dans 3 jours
                                    </p>
                                </div>

                                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors">
                                    📊 Voir le Projet
                                </button>

                                <div className="text-center text-xs text-gray-500 pt-4 border-t">
                                    <p>IntuitionConcept - Plateforme de Gestion BTP Intelligente</p>
                                    <p>Dakar, Sénégal | www.intuitionconcept.com</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ClientCommunicationConfig;

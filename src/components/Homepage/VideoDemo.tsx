import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, CheckCircle, Zap } from 'lucide-react';

interface Feature {
    id: number;
    name: string;
    icon: string;
    timestamp: string;
}

const features: Feature[] = [
    { id: 1, name: 'Dashboard Intelligent', icon: '📊', timestamp: '0:05' },
    { id: 2, name: 'Gestion Projets', icon: '🏗️', timestamp: '0:10' },
    { id: 3, name: 'Budget Projet', icon: '💰', timestamp: '0:15' },
    { id: 4, name: 'Gestion Tâches', icon: '✅', timestamp: '0:20' },
    { id: 5, name: 'Planning Gantt', icon: '📅', timestamp: '0:25' },
    { id: 6, name: 'Finances Complètes', icon: '💵', timestamp: '0:30' },
    { id: 7, name: 'Devis BTP', icon: '📝', timestamp: '0:35' },
    { id: 8, name: 'Bons d\'Achat', icon: '🛒', timestamp: '0:40' },
    { id: 9, name: 'Mobile Money', icon: '📱', timestamp: '0:45' },
    { id: 10, name: 'Équipe Chantier', icon: '👷', timestamp: '0:50' },
    { id: 11, name: 'GPS Temps Réel', icon: '📍', timestamp: '0:55' },
    { id: 12, name: 'Notifications', icon: '🔔', timestamp: '1:00' },
    { id: 13, name: 'Équipements', icon: '🚚', timestamp: '1:05' },
    { id: 14, name: 'Documents Cloud', icon: '☁️', timestamp: '1:10' },
    { id: 15, name: '🤖 Devis IA Auto', icon: '🤖', timestamp: '1:15' },
    { id: 16, name: '🤖 Scanner OCR', icon: '📄', timestamp: '1:20' },
    { id: 17, name: '🤖 Analyse Plans', icon: '📐', timestamp: '1:25' },
    { id: 18, name: '🤖 Détection Anomalies', icon: '⚠️', timestamp: '1:30' },
    { id: 19, name: '🤖 Plans Projet IA', icon: '🗂️', timestamp: '1:35' },
    { id: 20, name: '🤖 Copilot Vocal', icon: '🎤', timestamp: '1:40' },
    { id: 21, name: '🤖 Analytics Prédictifs', icon: '📈', timestamp: '1:45' },
    { id: 22, name: '🤖 Rapports Auto', icon: '📊', timestamp: '1:50' },
    { id: 23, name: '🤖 Rendus 3D', icon: '🎨', timestamp: '1:55' },
    { id: 24, name: 'Automatisations n8n', icon: '⚡', timestamp: '2:00' },
    { id: 25, name: 'API & Intégrations', icon: '🔌', timestamp: '2:05' },
    { id: 26, name: 'Signatures Électroniques', icon: '✍️', timestamp: '2:10' },
    { id: 27, name: 'Sécurité Maximale', icon: '🛡️', timestamp: '2:15' },
    { id: 28, name: 'Formation & Support', icon: '🎓', timestamp: '2:20' },
    { id: 29, name: 'Centre Support', icon: '💬', timestamp: '2:25' },
    { id: 30, name: 'Rapports Chantier', icon: '📋', timestamp: '2:30' }
];

const VideoDemo: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Placeholder pour la vidéo YouTube/Vimeo
    const videoUrl = ''; // À remplir avec l'URL YouTube quand disponible
    const thumbnailUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop';

    const handlePlayVideo = () => {
        if (videoUrl) {
            setIsModalOpen(true);
        } else {
            // Placeholder : Simulation de lecture
            alert('🎬 Vidéo de démonstration à venir !\n\nEn attendant, découvrez nos 30 fonctionnalités ci-dessous.');
        }
    };

    return (
        <>
            {/* Section Vidéo */}
            <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6"
                        >
                            <Play className="w-8 h-8 text-purple-600" />
                        </motion.div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Découvrez les
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> 30 Fonctionnalités</span>
                            {' '}en 2 Minutes
                        </h2>
                        <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                            Une visite guidée complète de la plateforme BTP la plus avancée d'Afrique
                        </p>
                    </motion.div>

                    <div className="max-w-6xl mx-auto">
                        {/* Video Player */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
                            onClick={handlePlayVideo}
                        >
                            {/* Thumbnail */}
                            <img
                                src={thumbnailUrl}
                                alt="Vidéo démo IntuitionConcept"
                                className="w-full h-[500px] object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Play Button */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            >
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-300">
                                    <Play className="w-12 h-12 text-gray-900 group-hover:text-white ml-2" />
                                </div>
                            </motion.div>

                            {/* Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold mb-2">Tour Complet de la Plateforme</div>
                                        <div className="text-purple-200 text-lg">30 fonctionnalités • 2 minutes • Français</div>
                                    </div>
                                    <div className="text-6xl">🎬</div>
                                </div>
                            </div>

                            {/* Duration Badge */}
                            <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white font-bold">
                                ⏱️ 2:30
                            </div>
                        </motion.div>

                        {/* Features Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="mt-12 bg-white/10 backdrop-blur-sm rounded-3xl p-8"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                                Ce que vous allez découvrir
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.02 }}
                                        viewport={{ once: true }}
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                                    >
                                        <div className="text-3xl mb-2">{feature.icon}</div>
                                        <div className="text-sm font-semibold mb-1">{feature.name}</div>
                                        <div className="text-xs text-purple-300">{feature.timestamp}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="grid md:grid-cols-3 gap-6 mt-12"
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                                <div className="text-5xl font-extrabold mb-2">30</div>
                                <div className="text-purple-200">Fonctionnalités Complètes</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                                <div className="text-5xl font-extrabold mb-2">9</div>
                                <div className="text-purple-200">Modules IA Avancés</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                                <div className="text-5xl font-extrabold mb-2">2:30</div>
                                <div className="text-purple-200">Minutes de Démo</div>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mt-12"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center space-x-3 px-12 py-6 bg-white text-purple-900 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                            >
                                <span>Essayer Gratuitement</span>
                                <CheckCircle className="w-6 h-6" />
                            </motion.button>
                            <p className="mt-4 text-purple-200">
                                🎁 14 jours gratuits • Sans CB • Accès complet
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modal Vidéo (si URL disponible) */}
            <AnimatePresence>
                {isModalOpen && videoUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative w-full max-w-6xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* Video Embed */}
                            <div className="relative pt-[56.25%] bg-black rounded-2xl overflow-hidden">
                                <iframe
                                    src={videoUrl}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Vidéo démo IntuitionConcept"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VideoDemo;

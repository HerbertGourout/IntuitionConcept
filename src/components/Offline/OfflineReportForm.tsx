import React, { useState } from 'react';
import type { OfflineReport } from '../../hooks/useOfflineData';
import { motion } from 'framer-motion';
import {
    FileText,
    Camera,
    Mic,
    MapPin,
    Save,
    WifiOff
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOfflineReports } from '../../hooks/useOfflineData';
import { useGeolocation } from '../../contexts/geolocation/useGeolocation';

interface ReportData {
    title: string;
    description: string;
    category: string;
    priority: string;
    site: string;
    author: string;
    photos: File[];
    audioNote: File | null;
    weather: string;
    temperature: string;
    workersPresent: string;
    equipmentUsed: string;
    issues: string;
    nextSteps: string;
    location?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    } | null;
    timestamp: string;
    deviceInfo: {
        userAgent: string;
        platform: string;
        language: string;
    };
}

interface OfflineReportFormProps {
    onSubmit?: (report: ReportData) => void;
    onCancel?: () => void;
}

const OfflineReportForm: React.FC<OfflineReportFormProps> = ({ onSubmit, onCancel }) => {
    const { resolvedTheme } = useTheme();
    const { createReport, isOnline } = useOfflineReports();
    const { currentLocation } = useGeolocation();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'progress',
        priority: 'medium',
        site: '',
        author: '',
        photos: [] as File[],
        audioNote: null as File | null,
        weather: '',
        temperature: '',
        workersPresent: '',
        equipmentUsed: '',
        issues: '',
        nextSteps: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const categories = [
        { value: 'progress', label: '📈 Avancement', color: 'blue' },
        { value: 'safety', label: '🦺 Sécurité', color: 'red' },
        { value: 'quality', label: '✅ Qualité', color: 'green' },
        { value: 'equipment', label: '🚜 Équipement', color: 'orange' },
        { value: 'weather', label: '🌤️ Météo', color: 'cyan' },
        { value: 'incident', label: '⚠️ Incident', color: 'red' },
        { value: 'delivery', label: '📦 Livraison', color: 'purple' },
        { value: 'meeting', label: '👥 Réunion', color: 'indigo' }
    ];

    const priorities = [
        { value: 'low', label: 'Faible', color: 'gray' },
        { value: 'medium', label: 'Moyenne', color: 'yellow' },
        { value: 'high', label: 'Élevée', color: 'orange' },
        { value: 'urgent', label: 'Urgente', color: 'red' }
    ];

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
        }));
    };

    const handleAudioRecord = async () => {
        if (!isRecording) {
            // Démarrer l'enregistrement
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                    const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
                    setFormData(prev => ({ ...prev, audioNote: audioFile }));
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);

                // Arrêter automatiquement après 2 minutes
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        setIsRecording(false);
                    }
                }, 120000);

            } catch (error) {
                console.error('Erreur d\'enregistrement audio:', error);
                alert('Impossible d\'accéder au microphone');
            }
        } else {
            // Arrêter l'enregistrement (géré par le MediaRecorder)
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        setIsSubmitting(true);

        try {
            const reportData: ReportData = {
                ...formData,
                location: currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    accuracy: currentLocation.accuracy
                } : null,
                timestamp: new Date().toISOString(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            };

            await createReport(reportData as unknown as Partial<OfflineReport>);

            // Réinitialiser le formulaire
            setFormData({
                title: '',
                description: '',
                category: 'progress',
                priority: 'medium',
                site: '',
                author: '',
                photos: [],
                audioNote: null,
                weather: '',
                temperature: '',
                workersPresent: '',
                equipmentUsed: '',
                issues: '',
                nextSteps: ''
            });

            onSubmit?.(reportData);
        } catch (error) {
            console.error('Erreur de soumission:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Erreur lors de la sauvegarde du rapport: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg ${resolvedTheme === 'dark'
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* En-tête avec statut */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                        <h2 className="text-xl font-bold">Rapport de Chantier</h2>
                        <p className="text-sm opacity-70">
                            {isOnline ? '🌐 En ligne' : '📱 Mode hors ligne'}
                        </p>
                    </div>
                </div>

                {!isOnline && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <WifiOff className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-600">Sera synchronisé plus tard</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Titre du rapport *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Ex: Avancement fondations - Zone A"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Auteur
                        </label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => handleInputChange('author', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Nom du responsable"
                        />
                    </div>
                </div>

                {/* Catégorie et priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Catégorie
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Priorité
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        >
                            {priorities.map(priority => (
                                <option key={priority.value} value={priority.value}>
                                    {priority.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description détaillée
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        placeholder="Décrivez en détail la situation, les observations, les mesures prises..."
                    />
                </div>

                {/* Informations de chantier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Site/Zone
                        </label>
                        <input
                            type="text"
                            value={formData.site}
                            onChange={(e) => handleInputChange('site', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Zone A, Bâtiment 1..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ouvriers présents
                        </label>
                        <input
                            type="number"
                            value={formData.workersPresent}
                            onChange={(e) => handleInputChange('workersPresent', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Nombre"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Température (°C)
                        </label>
                        <input
                            type="number"
                            value={formData.temperature}
                            onChange={(e) => handleInputChange('temperature', e.target.value)}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="25"
                        />
                    </div>
                </div>

                {/* Médias */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Médias et Documentation</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Photos */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Photos ({formData.photos.length}/5)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoCapture}
                                    className="hidden"
                                    id="photo-input"
                                />
                                <label
                                    htmlFor="photo-input"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    Ajouter photos
                                </label>
                                {formData.photos.length > 0 && (
                                    <span className="text-sm opacity-70">
                                        {formData.photos.length} photo(s) sélectionnée(s)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Audio */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Note vocale
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAudioRecord}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isRecording
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    <Mic className="w-4 h-4" />
                                    {isRecording ? 'Arrêter' : 'Enregistrer'}
                                </button>
                                {formData.audioNote && (
                                    <span className="text-sm opacity-70">
                                        Note vocale enregistrée
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Équipements utilisés
                        </label>
                        <textarea
                            value={formData.equipmentUsed}
                            onChange={(e) => handleInputChange('equipmentUsed', e.target.value)}
                            rows={3}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Excavatrice, grue, bétonnière..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Problèmes rencontrés
                        </label>
                        <textarea
                            value={formData.issues}
                            onChange={(e) => handleInputChange('issues', e.target.value)}
                            rows={3}
                            className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Difficultés, retards, incidents..."
                        />
                    </div>
                </div>

                {/* Prochaines étapes */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Prochaines étapes
                    </label>
                    <textarea
                        value={formData.nextSteps}
                        onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                        rows={3}
                        className={`w-full p-3 rounded-lg border ${resolvedTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        placeholder="Actions à prévoir, matériaux à commander, rendez-vous à planifier..."
                    />
                </div>

                {/* Localisation */}
                {currentLocation && (
                    <div className={`p-4 rounded-lg ${resolvedTheme === 'dark'
                        ? 'bg-green-900/20 border border-green-700'
                        : 'bg-green-50 border border-green-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Position GPS capturée</span>
                        </div>
                        <p className="text-xs opacity-70">
                            📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                            {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                        </p>
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`px-6 py-3 rounded-lg transition-colors ${resolvedTheme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                    >
                        Annuler
                    </button>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting || !formData.title.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isOnline ? 'Envoyer le rapport' : 'Sauvegarder hors ligne'}
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default OfflineReportForm;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    MapPin,
    Clock,
    Wifi,
    WifiOff,
    Navigation,
    AlertTriangle,
    Phone,
    MessageCircle
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGeolocation } from '../../../contexts/geolocation/useGeolocation';
import TeamTrackingMap from '../../Geolocation/TeamTrackingMap';

interface TeamTrackingWidgetProps {
    className?: string;
}

const TeamTrackingWidget: React.FC<TeamTrackingWidgetProps> = ({ className = '' }) => {
    const { resolvedTheme } = useTheme();
    const {
        teamMembers,
        locationEvents,
        enableLocation,
        isLocationEnabled,
        currentLocation
    } = useGeolocation();
    const [showMap, setShowMap] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | undefined>(undefined);

    // Statistiques de l'équipe
    const onlineMembers = teamMembers.filter(member => member.isOnline);
    const offlineMembers = teamMembers.filter(member => !member.isOnline);
    const recentAlerts = locationEvents.filter(event => event.type === 'alert').slice(0, 3);

    const getStatusColor = (isOnline: boolean, lastSeen: Date) => {
        if (!isOnline) return 'bg-gray-400';

        const now = new Date();
        const minutesAgo = (now.getTime() - new Date(lastSeen).getTime()) / (1000 * 60);

        if (minutesAgo < 5) return 'bg-green-500';
        if (minutesAgo < 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatLastSeen = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}j`;
    };

    return (
        <div className={`h-full ${className}`}>
            {/* En-tête avec statistiques */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Suivi d'Équipe
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`p-2 rounded-lg transition-colors ${showMap
                                    ? 'bg-blue-500 text-white'
                                    : resolvedTheme === 'dark'
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title="Afficher/Masquer la carte"
                        >
                            <MapPin className="w-4 h-4" />
                        </button>
                        <button
                            onClick={enableLocation}
                            className={`p-2 rounded-lg transition-colors ${isLocationEnabled
                                    ? 'bg-green-500 text-white'
                                    : resolvedTheme === 'dark'
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            title="Activer la géolocalisation"
                        >
                            <Navigation className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Position actuelle */}
                {currentLocation && (
                    <motion.div
                        className={`p-3 rounded-lg mb-4 ${resolvedTheme === 'dark'
                                ? 'bg-blue-900/30 border border-blue-700'
                                : 'bg-blue-50 border border-blue-200'
                            }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Ma position</span>
                        </div>
                        <p className="text-xs opacity-70">
                            📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                        </p>
                        {currentLocation.accuracy && (
                            <p className="text-xs opacity-50 mt-1">
                                Précision: ±{Math.round(currentLocation.accuracy)}m
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Statistiques rapides */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <motion.div
                        className={`p-3 rounded-lg text-center ${resolvedTheme === 'dark'
                                ? 'bg-green-900/30 border border-green-700'
                                : 'bg-green-50 border border-green-200'
                            }`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-center mb-1">
                            <Wifi className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-xs opacity-70">En ligne</p>
                        <p className="text-lg font-bold text-green-600">
                            {onlineMembers.length}
                        </p>
                    </motion.div>

                    <motion.div
                        className={`p-3 rounded-lg border text-center ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <WifiOff className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium">Hors ligne</span>
                        </div>
                        <p className="text-lg font-bold text-gray-600">
                            {offlineMembers.length}
                        </p>
                    </motion.div>

                    <motion.div
                        className={`p-3 rounded-lg border text-center ${resolvedTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-red-50 border-red-200'
                            }`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-medium">Alertes</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                            {recentAlerts.length}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Carte interactive */}
            {showMap && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                >
                    <TeamTrackingMap
                        height="200px"
                        showControls={false}
                        selectedMemberId={selectedMember}
                        onMemberSelect={setSelectedMember}
                    />
                </motion.div>
            )}

            {/* Liste des membres */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Membres de l'équipe</h4>
                {teamMembers.map((member, index) => (
                    <motion.div
                        key={member.id}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${selectedMember === member.id
                                ? resolvedTheme === 'dark'
                                    ? 'bg-blue-900 border-blue-700'
                                    : 'bg-blue-50 border-blue-200'
                                : resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedMember(member.id === selectedMember ? undefined : member.id)}
                        whileHover={{ x: 2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Avatar avec statut */}
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        {member.avatar ? (
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${getStatusColor(member.isOnline, member.lastSeen)}`}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.isOnline, member.lastSeen)}`}
                                    />
                                </div>

                                {/* Informations */}
                                <div>
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <p className="text-xs opacity-70">{member.role}</p>
                                </div>
                            </div>

                            {/* Actions et statut */}
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs opacity-70">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatLastSeen(member.lastSeen)}</span>
                                    </div>
                                    {member.currentLocation && (
                                        <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>Localisé</span>
                                        </div>
                                    )}
                                </div>

                                {member.isOnline && (
                                    <div className="flex gap-1">
                                        <button
                                            className="p-1 rounded hover:bg-green-500 hover:text-white transition-colors"
                                            title="Appeler"
                                        >
                                            <Phone className="w-3 h-3" />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                            title="Message"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Détails étendus */}
                        {selectedMember === member.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
                            >
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {member.assignedSite && (
                                        <div>
                                            <span className="font-medium">Site assigné:</span>
                                            <p className="opacity-70">{member.assignedSite}</p>
                                        </div>
                                    )}
                                    {member.currentLocation && (
                                        <div>
                                            <span className="font-medium">Position:</span>
                                            <p className="opacity-70">
                                                {member.currentLocation.latitude.toFixed(4)}, {member.currentLocation.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {teamMembers.length === 0 && (
                    <div className={`p-4 text-center rounded-lg border-2 border-dashed ${resolvedTheme === 'dark'
                            ? 'border-gray-600 text-gray-400'
                            : 'border-gray-300 text-gray-500'
                        }`}>
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun membre d'équipe configuré</p>
                        <p className="text-xs opacity-70 mt-1">
                            Ajoutez des membres pour commencer le suivi
                        </p>
                    </div>
                )}
            </div>

            {/* Alertes récentes */}
            {recentAlerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Alertes récentes
                    </h4>
                    <div className="space-y-2">
                        {recentAlerts.map((alert, index) => (
                            <motion.div
                                key={alert.id}
                                className={`p-2 rounded border-l-4 border-red-500 text-xs ${resolvedTheme === 'dark'
                                        ? 'bg-red-900/20 border-red-500'
                                        : 'bg-red-50 border-red-500'
                                    }`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <p className="font-medium text-red-600 dark:text-red-400">
                                    {alert.message}
                                </p>
                                <p className="opacity-70 mt-1">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamTrackingWidget;

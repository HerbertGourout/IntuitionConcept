import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  Zap,
  Clock,
  Phone,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useGeolocation, TeamMember, GeofenceZone, LocationEvent } from '../../contexts/GeolocationContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TeamTrackingMapProps {
  height?: string;
  showControls?: boolean;
  selectedMemberId?: string;
  onMemberSelect?: (memberId: string) => void;
}

const TeamTrackingMap: React.FC<TeamTrackingMapProps> = ({
  height = '400px',
  showControls = true,
  selectedMemberId,
  onMemberSelect,
}) => {
  const {
    currentLocation,
    teamMembers,
    geofenceZones,
    locationEvents,
    enableLocation,
    isLocationEnabled,
    calculateDistance,
  } = useGeolocation();
  const { resolvedTheme } = useTheme();
  
  const [mapCenter, setMapCenter] = useState({ lat: 14.6928, lng: -17.4467 }); // Dakar par défaut
  const [zoom, setZoom] = useState(12);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Centrer la carte sur la position actuelle si disponible
  useEffect(() => {
    if (currentLocation) {
      setMapCenter({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      });
    }
  }, [currentLocation]);

  // Simuler une carte interactive (en production, utiliser Leaflet, Google Maps, etc.)
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir les coordonnées pixel en lat/lng (simulation)
    const lat = mapCenter.lat + (rect.height / 2 - y) * 0.001;
    const lng = mapCenter.lng + (x - rect.width / 2) * 0.001;
    
    console.log('Clic sur la carte:', { lat, lng });
  };

  const filteredMembers = filterOnline 
    ? teamMembers.filter(member => member.isOnline)
    : teamMembers;

  const getStatusColor = (member: TeamMember) => {
    if (!member.isOnline) return 'bg-gray-400';
    
    const now = new Date();
    const lastSeen = new Date(member.lastSeen);
    const minutesAgo = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    if (minutesAgo < 5) return 'bg-green-500';
    if (minutesAgo < 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getZoneColor = (zone: GeofenceZone) => {
    switch (zone.type) {
      case 'site': return 'border-blue-500 bg-blue-500/20';
      case 'office': return 'border-green-500 bg-green-500/20';
      case 'warehouse': return 'border-purple-500 bg-purple-500/20';
      case 'restricted': return 'border-red-500 bg-red-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Carte principale */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`
          relative w-full h-full rounded-xl overflow-hidden cursor-crosshair
          ${resolvedTheme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-gray-100 border border-gray-200'
          }
        `}
        style={{
          backgroundImage: resolvedTheme === 'dark' 
            ? 'radial-gradient(circle at 25% 25%, #374151 0%, #1f2937 50%, #111827 100%)'
            : 'radial-gradient(circle at 25% 25%, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)',
        }}
      >
        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path 
                  d="M 40 0 L 0 0 0 40" 
                  fill="none" 
                  stroke={resolvedTheme === 'dark' ? '#4b5563' : '#9ca3af'} 
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Position actuelle */}
        {currentLocation && (
          <motion.div
            className="absolute z-20"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-30" />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600 whitespace-nowrap">
                Vous
              </div>
            </div>
          </motion.div>
        )}

        {/* Zones géofence */}
        {geofenceZones.map((zone, index) => (
          <motion.div
            key={zone.id}
            className={`absolute border-2 border-dashed rounded-full ${getZoneColor(zone)}`}
            style={{
              left: `${30 + index * 15}%`,
              top: `${20 + index * 20}%`,
              width: `${Math.min(zone.radius / 50, 100)}px`,
              height: `${Math.min(zone.radius / 50, 100)}px`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZone(zone);
            }}
            whileHover={{ scale: 1.05 }}
            className={`${getZoneColor(zone)} cursor-pointer`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-4 h-4 text-current" />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
              {zone.name}
            </div>
          </motion.div>
        ))}

        {/* Membres de l'équipe */}
        {filteredMembers.map((member, index) => {
          if (!member.currentLocation) return null;
          
          return (
            <motion.div
              key={member.id}
              className="absolute z-30 cursor-pointer"
              style={{
                left: `${25 + index * 20}%`,
                top: `${30 + index * 15}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(member);
                setShowMemberDetails(true);
                onMemberSelect?.(member.id);
              }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Avatar */}
                <div className={`
                  w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden
                  ${selectedMemberId === member.id ? 'ring-2 ring-blue-500' : ''}
                `}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${getStatusColor(member)}`}>
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Indicateur de statut */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getStatusColor(member)}`} />
                
                {/* Nom */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                  {member.name}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Événements récents */}
        {locationEvents.slice(0, 3).map((event, index) => (
          <motion.div
            key={event.id}
            className={`
              absolute z-10 w-2 h-2 rounded-full
              ${event.type === 'alert' ? 'bg-red-500' : 'bg-yellow-500'}
            `}
            style={{
              left: `${60 + index * 10}%`,
              top: `${70 + index * 5}%`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-current" />
          </motion.div>
        ))}
      </div>

      {/* Contrôles de la carte */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Bouton de géolocalisation */}
          <motion.button
            onClick={enableLocation}
            className={`
              p-2 rounded-lg shadow-lg transition-colors
              ${resolvedTheme === 'dark'
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${isLocationEnabled ? 'ring-2 ring-blue-500' : ''}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Activer la géolocalisation"
          >
            <Navigation className="w-4 h-4" />
          </motion.button>

          {/* Filtre en ligne */}
          <motion.button
            onClick={() => setFilterOnline(!filterOnline)}
            className={`
              p-2 rounded-lg shadow-lg transition-colors
              ${filterOnline
                ? 'bg-green-500 text-white'
                : resolvedTheme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Filtrer les membres en ligne"
          >
            <Users className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Légende */}
      <div className={`
        absolute bottom-4 left-4 p-3 rounded-lg shadow-lg
        ${resolvedTheme === 'dark'
          ? 'bg-gray-800 text-gray-200 border border-gray-700'
          : 'bg-white text-gray-700 border border-gray-200'
        }
      `}>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>En ligne</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Inactif</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Hors ligne</span>
          </div>
        </div>
      </div>

      {/* Détails du membre sélectionné */}
      <AnimatePresence>
        {showMemberDetails && selectedMember && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMemberDetails(false)}
          >
            <motion.div
              className={`
                p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-800 text-gray-200'
                  : 'bg-white text-gray-700'
                }
              `}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {selectedMember.avatar ? (
                    <img src={selectedMember.avatar} alt={selectedMember.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getStatusColor(selectedMember)}`}>
                      {selectedMember.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedMember.name}</h3>
                  <p className="text-sm opacity-70">{selectedMember.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Vu {formatLastSeen(selectedMember.lastSeen)}</span>
                </div>
                
                {selectedMember.currentLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedMember.currentLocation.latitude.toFixed(6)}, {selectedMember.currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                )}

                {selectedMember.assignedSite && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Site: {selectedMember.assignedSite}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>Appeler</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamTrackingMap;

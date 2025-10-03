import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  currentLocation?: LocationData;
  assignedSite?: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'site' | 'office' | 'warehouse' | 'restricted';
  center: { lat: number; lng: number };
  radius: number; // en mètres
  isActive: boolean;
  notifications: {
    onEnter: boolean;
    onExit: boolean;
    onLongStay: boolean;
  };
  allowedMembers?: string[];
}

export interface LocationEvent {
  id: string;
  memberId: string;
  type: 'enter' | 'exit' | 'arrival' | 'departure' | 'alert';
  zoneId?: string;
  location: LocationData;
  timestamp: Date;
  message: string;
}

interface GeolocationContextType {
  // État de géolocalisation
  isLocationEnabled: boolean;
  currentLocation: LocationData | null;
  locationError: string | null;
  isTracking: boolean;
  
  // Équipe et suivi
  teamMembers: TeamMember[];
  geofenceZones: GeofenceZone[];
  locationEvents: LocationEvent[];
  
  // Actions de géolocalisation
  enableLocation: () => Promise<boolean>;
  disableLocation: () => void;
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentPosition: () => Promise<LocationData | null>;
  
  // Gestion des équipes
  updateMemberLocation: (memberId: string, location: LocationData) => void;
  setMemberOnline: (memberId: string, isOnline: boolean) => void;
  
  // Gestion des géofences
  addGeofenceZone: (zone: Omit<GeofenceZone, 'id'>) => void;
  updateGeofenceZone: (zoneId: string, updates: Partial<GeofenceZone>) => void;
  removeGeofenceZone: (zoneId: string) => void;
  checkGeofenceViolations: (memberId: string, location: LocationData) => void;
  
  // Utilitaires
  calculateDistance: (point1: LocationData, point2: LocationData) => number;
  getAddressFromCoordinates: (lat: number, lng: number) => Promise<string>;
  getNearbyMembers: (location: LocationData, radiusKm: number) => TeamMember[];
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};

interface GeolocationProviderProps {
  children: React.ReactNode;
}

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({ children }) => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Vérifier la disponibilité de la géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
    }
  }, []);

  // Charger les données depuis localStorage
  useEffect(() => {
    const savedZones = localStorage.getItem('geofence-zones');
    const savedMembers = localStorage.getItem('team-members');
    const savedEvents = localStorage.getItem('location-events');

    if (savedZones) {
      try {
        setGeofenceZones(JSON.parse(savedZones));
      } catch {
        // Erreur lors du chargement des zones
      }
    }

    if (savedMembers) {
      try {
        setTeamMembers(JSON.parse(savedMembers));
      } catch {
        // Erreur lors du chargement des membres
      }
    }

    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents);
        // Garder seulement les événements des 7 derniers jours
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentEvents = events.filter((event: LocationEvent) => 
          new Date(event.timestamp) > weekAgo
        );
        setLocationEvents(recentEvents);
      } catch {
        // Erreur lors du chargement des événements
      }
    }
  }, []);

  // Sauvegarder les données dans localStorage
  useEffect(() => {
    localStorage.setItem('geofence-zones', JSON.stringify(geofenceZones));
  }, [geofenceZones]);

  useEffect(() => {
    localStorage.setItem('team-members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('location-events', JSON.stringify(locationEvents));
  }, [locationEvents]);

  const enableLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationError('Géolocalisation non supportée');
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };

      setCurrentLocation(location);
      setIsLocationEnabled(true);
      setLocationError(null);
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Erreur de géolocalisation';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const geolocationError = error as GeolocationPositionError;
        switch (geolocationError.code) {
          case geolocationError.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case geolocationError.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible';
            break;
          case geolocationError.TIMEOUT:
            errorMessage = 'Timeout de géolocalisation';
            break;
        }
      }
      
      setLocationError(errorMessage);
      return false;
    }
  }, []);

  const disableLocation = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsLocationEnabled(false);
    setIsTracking(false);
    setCurrentLocation(null);
  }, [watchId]);

  const startTracking = useCallback(() => {
    if (!isLocationEnabled) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };
        
        setCurrentLocation(location);
        
        // Vérifier les violations de géofence pour l'utilisateur actuel
        // (assumons que l'utilisateur actuel a l'ID 'current-user')
        checkGeofenceViolations('current-user', location);
      },
      () => {
        // Erreur de suivi
        setLocationError('Erreur lors du suivi de position');
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [isLocationEnabled]);

  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  const getCurrentPosition = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) return null;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };
    } catch {
      // Erreur getCurrentPosition
      return null;
    }
  }, []);

  const updateMemberLocation = useCallback((memberId: string, location: LocationData) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId
        ? { ...member, currentLocation: location, lastSeen: new Date() }
        : member
    ));
    
    // Vérifier les violations de géofence
    checkGeofenceViolations(memberId, location);
  }, []);

  const setMemberOnline = useCallback((memberId: string, isOnline: boolean) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId
        ? { ...member, isOnline, lastSeen: new Date() }
        : member
    ));
  }, []);

  const addGeofenceZone = useCallback((zone: Omit<GeofenceZone, 'id'>) => {
    const newZone: GeofenceZone = {
      ...zone,
      id: `zone-${Date.now()}`,
    };
    setGeofenceZones(prev => [...prev, newZone]);
  }, []);

  const updateGeofenceZone = useCallback((zoneId: string, updates: Partial<GeofenceZone>) => {
    setGeofenceZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, ...updates } : zone
    ));
  }, []);

  const removeGeofenceZone = useCallback((zoneId: string) => {
    setGeofenceZones(prev => prev.filter(zone => zone.id !== zoneId));
  }, []);

  const calculateDistance = useCallback((point1: LocationData, point2: LocationData): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const checkGeofenceViolations = useCallback((memberId: string, location: LocationData) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    geofenceZones.forEach(zone => {
      if (!zone.isActive) return;

      const zoneCenter = { latitude: zone.center.lat, longitude: zone.center.lng, accuracy: 0, timestamp: new Date() };
      const distance = calculateDistance(location, zoneCenter) * 1000; // Convertir en mètres
      const isInside = distance <= zone.radius;

      // Vérifier si le membre était déjà dans la zone
      const wasInside = member.currentLocation ? 
        calculateDistance(member.currentLocation, zoneCenter) * 1000 <= zone.radius : false;

      // Générer des événements selon les transitions
      if (isInside && !wasInside && zone.notifications.onEnter) {
        const event: LocationEvent = {
          id: `event-${Date.now()}`,
          memberId,
          type: 'enter',
          zoneId: zone.id,
          location,
          timestamp: new Date(),
          message: `${member.name} est entré dans ${zone.name}`,
        };
        setLocationEvents(prev => [event, ...prev.slice(0, 99)]); // Garder les 100 derniers événements
      } else if (!isInside && wasInside && zone.notifications.onExit) {
        const event: LocationEvent = {
          id: `event-${Date.now()}`,
          memberId,
          type: 'exit',
          zoneId: zone.id,
          location,
          timestamp: new Date(),
          message: `${member.name} a quitté ${zone.name}`,
        };
        setLocationEvents(prev => [event, ...prev.slice(0, 99)]);
      }

      // Vérifier les restrictions d'accès
      if (zone.allowedMembers && !zone.allowedMembers.includes(memberId) && isInside) {
        const event: LocationEvent = {
          id: `event-${Date.now()}`,
          memberId,
          type: 'alert',
          zoneId: zone.id,
          location,
          timestamp: new Date(),
          message: `⚠️ ${member.name} dans une zone restreinte: ${zone.name}`,
        };
        setLocationEvents(prev => [event, ...prev.slice(0, 99)]);
      }
    });
  }, [teamMembers, geofenceZones, calculateDistance]);

  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      // Utiliser une API de géocodage inverse (exemple avec OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      // Erreur géocodage
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  const getNearbyMembers = useCallback((location: LocationData, radiusKm: number): TeamMember[] => {
    return teamMembers.filter(member => {
      if (!member.currentLocation || !member.isOnline) return false;
      const distance = calculateDistance(location, member.currentLocation);
      return distance <= radiusKm;
    });
  }, [teamMembers, calculateDistance]);

  const value: GeolocationContextType = {
    isLocationEnabled,
    currentLocation,
    locationError,
    isTracking,
    teamMembers,
    geofenceZones,
    locationEvents,
    enableLocation,
    disableLocation,
    startTracking,
    stopTracking,
    getCurrentPosition,
    updateMemberLocation,
    setMemberOnline,
    addGeofenceZone,
    updateGeofenceZone,
    removeGeofenceZone,
    checkGeofenceViolations,
    calculateDistance,
    getAddressFromCoordinates,
    getNearbyMembers,
  };

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
};

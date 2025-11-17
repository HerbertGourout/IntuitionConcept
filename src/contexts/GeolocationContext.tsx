import React, { useEffect, useState, useCallback } from 'react';
import { useProjectContext } from './ProjectContext';
import TeamService from '../services/teamService';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { GeolocationContext, GeolocationContextType, LocationData, GeofenceZone, LocationEvent, GeolocationTeamMember } from './geolocation/GeolocationContextBase';

// Types Firestore pour supprimer les any
type FirestoreGeofenceZoneDoc = {
  projectId: string;
  name: string;
  type: GeofenceZone['type'];
  center: { lat: number; lng: number };
  radius: number;
  isActive: boolean;
  notifications: GeofenceZone['notifications'];
  allowedMembers?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type FirestoreLocationEventDoc = {
  projectId: string;
  memberId: string;
  type: 'enter' | 'exit' | 'alert' | 'arrival' | 'departure';
  zoneId?: string;
  location: { latitude: number; longitude: number; accuracy?: number; timestamp?: number; address?: string };
  timestamp: Timestamp;
  message: string;
};

interface GeolocationProviderProps {
  children: React.ReactNode;
}

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({ children }) => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [teamMembers, setTeamMembers] = useState<GeolocationTeamMember[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { currentProject } = useProjectContext();

  // Vérifier la disponibilité de la géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
    }
  }, []);

  // Charger les membres en temps réel depuis Firebase par projet (plus de localStorage)
  useEffect(() => {
    // Clear when no project
    if (!currentProject?.id) {
      setTeamMembers([]);
      return;
    }
    const unsubscribe = TeamService.subscribeToProjectMembers(
      currentProject.id,
      (members) => {
        // Mapper les membres Firebase (BaseTeamMember) vers GeolocationTeamMember avec valeurs par défaut
        const mapped = members.map(m => ({
          ...m,
          isOnline: false,
          lastSeen: new Date(0),
        })) as GeolocationTeamMember[];
        setTeamMembers(mapped);
      },
      (error) => {
        console.error('GeolocationContext - subscribeToProjectMembers error:', error);
        setTeamMembers([]);
      }
    );
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentProject?.id]);

  useEffect(() => {
    if (!currentProject?.id) {
      setGeofenceZones([]);
      return;
    }
    const q = query(
      collection(db, 'geofenceZones'),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data() as FirestoreGeofenceZoneDoc;
        return {
          id: d.id,
          name: data.name,
          type: data.type,
          center: data.center,
          radius: data.radius,
          isActive: data.isActive,
          notifications: data.notifications,
          allowedMembers: data.allowedMembers,
        } as GeofenceZone;
      });
      setGeofenceZones(items);
    }, () => {
      setGeofenceZones([]);
    });
    return () => unsub();
  }, [currentProject?.id]);

  useEffect(() => {
    if (!currentProject?.id) {
      setLocationEvents([]);
      return;
    }
    const q = query(
      collection(db, 'locationEvents'),
      where('projectId', '==', currentProject.id),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data() as FirestoreLocationEventDoc;
        return {
          id: d.id,
          memberId: data.memberId,
          type: data.type,
          zoneId: data.zoneId,
          location: {
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            accuracy: data.location?.accuracy ?? 0,
            timestamp: data.location?.timestamp ? new Date(data.location.timestamp) : new Date(),
            address: data.location?.address,
          },
          timestamp: data.timestamp.toDate(),
          message: data.message,
        } as LocationEvent;
      });
      setLocationEvents(items.slice(0, 100));
    }, () => {
      setLocationEvents([]);
    });
    return () => unsub();
  }, [currentProject?.id]);

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

  

  const setMemberOnline = useCallback((memberId: string, isOnline: boolean) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId
        ? { ...member, isOnline, lastSeen: new Date() }
        : member
    ));
  }, []);

  const addGeofenceZone = useCallback(async (zone: Omit<GeofenceZone, 'id'>) => {
    if (!currentProject?.id) return;
    await addDoc(collection(db, 'geofenceZones'), {
      name: zone.name,
      type: zone.type,
      center: zone.center,
      radius: zone.radius,
      isActive: zone.isActive,
      notifications: zone.notifications,
      allowedMembers: zone.allowedMembers ?? [],
      projectId: currentProject.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [currentProject?.id]);

  const updateGeofenceZone = useCallback(async (zoneId: string, updates: Partial<GeofenceZone>) => {
    await updateDoc(doc(db, 'geofenceZones', zoneId), {
      ...('name' in updates ? { name: updates.name } : {}),
      ...('type' in updates ? { type: updates.type } : {}),
      ...('center' in updates ? { center: updates.center } : {}),
      ...('radius' in updates ? { radius: updates.radius } : {}),
      ...('isActive' in updates ? { isActive: updates.isActive } : {}),
      ...('notifications' in updates ? { notifications: updates.notifications } : {}),
      ...('allowedMembers' in updates ? { allowedMembers: updates.allowedMembers } : {}),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const removeGeofenceZone = useCallback(async (zoneId: string) => {
    await deleteDoc(doc(db, 'geofenceZones', zoneId));
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
        const now = new Date();
        setLocationEvents(prev => [{ id: `event-${now.getTime()}`, memberId, type: 'enter', zoneId: zone.id, location, timestamp: now, message: `${member.name} est entré dans ${zone.name}` }, ...prev.slice(0, 99)]);
        if (currentProject?.id) {
          addDoc(collection(db, 'locationEvents'), {
            projectId: currentProject.id,
            memberId,
            type: 'enter',
            zoneId: zone.id,
            location: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, timestamp: location.timestamp.getTime() },
            timestamp: serverTimestamp(),
            message: `${member.name} est entré dans ${zone.name}`,
          });
        }
      } else if (!isInside && wasInside && zone.notifications.onExit) {
        const now = new Date();
        setLocationEvents(prev => [{ id: `event-${now.getTime()}`, memberId, type: 'exit', zoneId: zone.id, location, timestamp: now, message: `${member.name} a quitté ${zone.name}` }, ...prev.slice(0, 99)]);
        if (currentProject?.id) {
          addDoc(collection(db, 'locationEvents'), {
            projectId: currentProject.id,
            memberId,
            type: 'exit',
            zoneId: zone.id,
            location: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, timestamp: location.timestamp.getTime() },
            timestamp: serverTimestamp(),
            message: `${member.name} a quitté ${zone.name}`,
          });
        }
      }

      // Vérifier les restrictions d'accès
      if (zone.allowedMembers && !zone.allowedMembers.includes(memberId) && isInside) {
        const now = new Date();
        setLocationEvents(prev => [{ id: `event-${now.getTime()}`, memberId, type: 'alert', zoneId: zone.id, location, timestamp: now, message: `⚠️ ${member.name} dans une zone restreinte: ${zone.name}` }, ...prev.slice(0, 99)]);
        if (currentProject?.id) {
          addDoc(collection(db, 'locationEvents'), {
            projectId: currentProject.id,
            memberId,
            type: 'alert',
            zoneId: zone.id,
            location: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, timestamp: location.timestamp.getTime() },
            timestamp: serverTimestamp(),
            message: `⚠️ ${member.name} dans une zone restreinte: ${zone.name}`,
          });
        }
      }
    });
  }, [teamMembers, geofenceZones, calculateDistance, currentProject?.id]);

  // Définir après checkGeofenceViolations pour éviter 'used before its declaration'
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
  }, [isLocationEnabled, checkGeofenceViolations]);

  const updateMemberLocation = useCallback((memberId: string, location: LocationData) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId
        ? { ...member, currentLocation: location, lastSeen: new Date() }
        : member
    ));

    // Vérifier les violations de géofence
    checkGeofenceViolations(memberId, location);
  }, [checkGeofenceViolations]);

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

  const getNearbyMembers = useCallback((location: LocationData, radiusKm: number): GeolocationTeamMember[] => {
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

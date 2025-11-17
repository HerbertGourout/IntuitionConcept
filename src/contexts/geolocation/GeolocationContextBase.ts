import { createContext } from 'react';
import { TeamMember as BaseTeamMember } from '../../types/team';

// Shared types
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
    address?: string;
}

export interface GeolocationTeamMember extends BaseTeamMember {
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
    radius: number; // meters
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

export interface GeolocationContextType {
    // Location state
    isLocationEnabled: boolean;
    currentLocation: LocationData | null;
    locationError: string | null;
    isTracking: boolean;

    // Team and tracking
    teamMembers: GeolocationTeamMember[];
    geofenceZones: GeofenceZone[];
    locationEvents: LocationEvent[];

    // Location controls
    enableLocation: () => Promise<boolean>;
    disableLocation: () => void;
    startTracking: () => void;
    stopTracking: () => void;
    getCurrentPosition: () => Promise<LocationData | null>;

    // Team actions
    updateMemberLocation: (memberId: string, location: LocationData) => void;
    setMemberOnline: (memberId: string, isOnline: boolean) => void;

    // Geofence
    addGeofenceZone: (zone: Omit<GeofenceZone, 'id'>) => void;
    updateGeofenceZone: (zoneId: string, updates: Partial<GeofenceZone>) => void;
    removeGeofenceZone: (zoneId: string) => void;
    checkGeofenceViolations: (memberId: string, location: LocationData) => void;

    // Utils
    calculateDistance: (point1: LocationData, point2: LocationData) => number;
    getAddressFromCoordinates: (lat: number, lng: number) => Promise<string>;
    getNearbyMembers: (location: LocationData, radiusKm: number) => GeolocationTeamMember[];
}

export const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

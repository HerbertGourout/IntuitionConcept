import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectContext } from '../../contexts/ProjectContext';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface GeolocationTrackerProps {
  onLocationUpdate?: (location: LocationData) => void;
  trackingEnabled?: boolean;
  showMap?: boolean;
}

const GeolocationTracker: React.FC<GeolocationTrackerProps> = ({
  onLocationUpdate,
  trackingEnabled = false,
  showMap = true
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { user } = useAuth();
  const { currentProject } = useProjectContext();

  // Demander la permission de géolocalisation
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        setError('Permission de géolocalisation refusée');
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Impossible de vérifier les permissions:', err);
      return true; // Continuer quand même
    }
  };

  // Obtenir la position actuelle
  const getCurrentPosition = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Géocoder inverse (optionnel)
  const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      // Utiliser une API de géocodage inverse (exemple avec OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.warn('Erreur lors du géocodage inverse:', error);
      return undefined;
    }
  };

  // Démarrer le suivi
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setError(null);
    setIsTracking(true);

    try {
      // Obtenir la position initiale
      const position = await getCurrentPosition();
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      // Géocodage inverse
      const address = await reverseGeocode(locationData.latitude, locationData.longitude);
      if (address) {
        locationData.address = address;
      }

      setCurrentLocation(locationData);
      onLocationUpdate?.(locationData);

      // Démarrer le suivi continu
      const id = navigator.geolocation.watchPosition(
        async (pos) => {
          const newLocationData: LocationData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now()
          };

          const newAddress = await reverseGeocode(newLocationData.latitude, newLocationData.longitude);
          if (newAddress) {
            newLocationData.address = newAddress;
          }

          setCurrentLocation(newLocationData);
          onLocationUpdate?.(newLocationData);
        },
        (err) => {
          console.error('Erreur de géolocalisation:', err);
          setError(`Erreur: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );

      setWatchId(id);
    } catch (err: any) {
      setError(`Impossible d'obtenir la position: ${err.message}`);
      setIsTracking(false);
    }
  };

  // Arrêter le suivi
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Formater la date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Suivi Géolocalisation
        </h3>
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isTracking ? 'Arrêter' : 'Démarrer'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {currentLocation && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Position active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Coordonnées</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Latitude: {currentLocation.latitude.toFixed(6)}</div>
                <div>Longitude: {currentLocation.longitude.toFixed(6)}</div>
                <div>Précision: ±{Math.round(currentLocation.accuracy)}m</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Dernière mise à jour</span>
              </div>
              <div className="text-sm text-gray-600">
                {formatTimestamp(currentLocation.timestamp)}
              </div>
            </div>
          </div>

          {currentLocation.address && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Adresse</span>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {currentLocation.address}
              </div>
            </div>
          )}

          {showMap && (
            <div className="mt-4">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Carte interactive disponible avec intégration Google Maps/OpenStreetMap
                </p>
                <a
                  href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Voir sur Google Maps
                </a>
              </div>
            </div>
          )}

          {user && currentProject && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div><strong>Utilisateur:</strong> {user.displayName || user.email}</div>
                <div><strong>Projet:</strong> {currentProject.name}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!currentLocation && !error && !isTracking && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Cliquez sur "Démarrer" pour commencer le suivi de position</p>
        </div>
      )}
    </div>
  );
};

export default GeolocationTracker;

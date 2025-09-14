import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers, Navigation, Maximize2 } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: 'project' | 'equipment' | 'team' | 'client' | 'office';
  description?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

interface MapViewProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLocationClick?: (location: MapLocation) => void;
  showControls?: boolean;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

const MapView: React.FC<MapViewProps> = ({
  locations,
  center = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
  zoom = 10,
  height = '400px',
  onLocationClick,
  showControls = true,
  mapType = 'roadmap'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(mapType);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Charger Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      script.onerror = () => console.error('Erreur lors du chargement de Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || map) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: currentMapType as google.maps.MapTypeId,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(newMap);
  }, [isGoogleMapsLoaded, center, zoom, currentMapType]);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!map) return;

    // Supprimer les anciens marqueurs
    markers.forEach(marker => marker.setMap(null));

    // Créer les nouveaux marqueurs
    const newMarkers = locations.map(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: location.name,
        icon: getMarkerIcon(location.type, location.status)
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">${location.name}</h3>
            ${location.description ? `<p class="text-sm text-gray-600 mt-1">${location.description}</p>` : ''}
            <div class="text-xs text-gray-500 mt-2">
              ${location.type ? `Type: ${getTypeLabel(location.type)}` : ''}
              ${location.status ? ` • Statut: ${getStatusLabel(location.status)}` : ''}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onLocationClick?.(location);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Ajuster la vue pour inclure tous les marqueurs
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
    }
  }, [map, locations, onLocationClick]);

  // Obtenir l'icône du marqueur selon le type
  const getMarkerIcon = (type?: string, status?: string) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    switch (type) {
      case 'project':
        return status === 'active' ? `${baseUrl}blue-dot.png` : `${baseUrl}gray-dot.png`;
      case 'equipment':
        return status === 'maintenance' ? `${baseUrl}red-dot.png` : `${baseUrl}green-dot.png`;
      case 'team':
        return `${baseUrl}purple-dot.png`;
      case 'client':
        return `${baseUrl}orange-dot.png`;
      case 'office':
        return `${baseUrl}yellow-dot.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      project: 'Projet',
      equipment: 'Équipement',
      team: 'Équipe',
      client: 'Client',
      office: 'Bureau'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      maintenance: 'Maintenance'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Contrôles de zoom
  const zoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 10) + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 10) - 1);
    }
  };

  // Changer le type de carte
  const changeMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(currentMapType);
    const nextType = types[(currentIndex + 1) % types.length];
    setCurrentMapType(nextType);
    
    if (map) {
      map.setMapTypeId(nextType as google.maps.MapTypeId);
    }
  };

  // Mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Centrer sur la position actuelle
  const centerOnCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);
          map.setZoom(15);

          // Ajouter un marqueur temporaire
          new google.maps.Marker({
            position: pos,
            map,
            title: 'Votre position',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(32, 32)
            }
          });
        },
        () => {
          console.error('Erreur lors de la géolocalisation');
        }
      );
    }
  };

  if (!isGoogleMapsLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div
        ref={mapRef}
        className="w-full rounded-lg"
        style={{ height: isFullscreen ? '100vh' : height }}
      />

      {/* Contrôles */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={changeMapType}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Changer le type de carte"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={centerOnCurrentLocation}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Ma position"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h4 className="font-medium text-gray-900 mb-2">Légende</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Projets actifs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Équipements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Équipes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Clients</span>
          </div>
        </div>
      </div>

      {/* Informations sur la carte */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{locations.length} emplacements</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;

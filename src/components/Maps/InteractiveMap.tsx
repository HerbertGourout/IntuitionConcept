import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Types pour les marqueurs
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'project' | 'equipment' | 'team' | 'supplier';
  status?: string;
  icon?: string;
}

interface InteractiveMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  showControls?: boolean;
  enableGeolocation?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  markers = [],
  center = { lat: 14.6928, lng: -17.4467 }, // Dakar, Sénégal par défaut
  zoom = 10,
  height = '400px',
  onMarkerClick,
  showControls = true,
  enableGeolocation = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger Leaflet dynamiquement
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Charger Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Charger Leaflet JS
        const L = await import('leaflet');
        
        // Corriger les icônes par défaut de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        setLeaflet(L);
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement de Leaflet:', err);
        setError('Impossible de charger la carte');
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!leaflet || !mapRef.current || map) return;

    try {
      const mapInstance = leaflet.map(mapRef.current).setView([center.lat, center.lng], zoom);

      // Ajouter les tuiles OpenStreetMap
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      setMap(mapInstance);
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la carte:', err);
      setError('Erreur d\'initialisation de la carte');
    }
  }, [leaflet, center, zoom, map]);

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (!enableGeolocation || !map || !leaflet) return;

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Ajouter un marqueur pour la position de l'utilisateur
            const userIcon = leaflet.divIcon({
              html: `<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
              className: 'user-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            leaflet.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup('Votre position')
              .openPopup();
          },
          (error) => {
            console.warn('Géolocalisation échouée:', error);
          }
        );
      }
    };

    getUserLocation();
  }, [map, leaflet, enableGeolocation]);

  // Ajouter les marqueurs
  useEffect(() => {
    if (!map || !leaflet || !markers.length) return;

    const markerInstances: any[] = [];

    markers.forEach((marker) => {
      try {
        // Créer une icône personnalisée selon le type
        const getMarkerColor = (type: string, status?: string) => {
          switch (type) {
            case 'project':
              return status === 'completed' ? '#10b981' : status === 'delayed' ? '#ef4444' : '#3b82f6';
            case 'equipment':
              return status === 'maintenance' ? '#f59e0b' : '#8b5cf6';
            case 'team':
              return '#06b6d4';
            case 'supplier':
              return '#84cc16';
            default:
              return '#6b7280';
          }
        };

        const color = getMarkerColor(marker.type, marker.status);
        const customIcon = leaflet.divIcon({
          html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                   <div style="color: white; font-size: 10px; font-weight: bold;">${marker.type.charAt(0).toUpperCase()}</div>
                 </div>`,
          className: 'custom-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const markerInstance = leaflet.marker([marker.lat, marker.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: bold;">${marker.title}</h3>
              ${marker.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">${marker.description}</p>` : ''}
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">
                  ${marker.type.toUpperCase()}
                </span>
                ${marker.status ? `<span style="color: #6b7280; font-size: 10px;">${marker.status}</span>` : ''}
              </div>
            </div>
          `);

        if (onMarkerClick) {
          markerInstance.on('click', () => onMarkerClick(marker));
        }

        markerInstances.push(markerInstance);
      } catch (err) {
        console.error('Erreur lors de l\'ajout du marqueur:', marker, err);
      }
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (markerInstances.length > 0) {
      const group = leaflet.featureGroup(markerInstances);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup
    return () => {
      markerInstances.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (err) {
          console.warn('Erreur lors de la suppression du marqueur:', err);
        }
      });
    };
  }, [map, leaflet, markers, onMarkerClick]);

  // Fonctions de contrôle
  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();
  const resetView = () => map?.setView([center.lat, center.lng], zoom);
  const goToUserLocation = () => {
    if (userLocation) {
      map?.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
        style={{ height }}
      >
        <div className="text-center text-red-600">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <button
            onClick={zoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border"
            title="Zoom avant"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border"
            title="Zoom arrière"
          >
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border"
            title="Vue initiale"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
          {userLocation && (
            <button
              onClick={goToUserLocation}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              title="Ma position"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Layers className="h-4 w-4" />
            <span>{markers.length} élément{markers.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;

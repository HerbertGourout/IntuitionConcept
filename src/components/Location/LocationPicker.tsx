import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Check } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'project' | 'office' | 'warehouse' | 'client' | 'custom';
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  placeholder?: string;
  allowCustomLocation?: boolean;
  predefinedLocations?: Location[];
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedLocation,
  placeholder = "Rechercher ou sélectionner un lieu...",
  allowCustomLocation = true,
  predefinedLocations = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);

  // Lieux prédéfinis par défaut
  const defaultLocations: Location[] = [
    {
      id: 'office-main',
      name: 'Bureau Principal',
      address: '123 Rue de la Construction, Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      type: 'office'
    },
    {
      id: 'warehouse-1',
      name: 'Entrepôt Central',
      address: '456 Avenue des Matériaux, Rungis',
      latitude: 48.7589,
      longitude: 2.3522,
      type: 'warehouse'
    }
  ];

  const allPredefinedLocations = [...defaultLocations, ...predefinedLocations];

  // Obtenir la position actuelle
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentPosition(position),
        (error) => console.warn('Erreur géolocalisation:', error)
      );
    }
  }, []);

  // Recherche de lieux via API
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Utiliser Nominatim (OpenStreetMap) pour la recherche
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr`
      );
      const data = await response.json();

      const results: Location[] = data.map((item: any, index: number) => ({
        id: `search-${index}`,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: 'custom' as const
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Ajouter la position actuelle comme option
  const getCurrentLocationOption = (): Location | null => {
    if (!currentPosition) return null;
    
    return {
      id: 'current-location',
      name: 'Position actuelle',
      address: `${currentPosition.coords.latitude.toFixed(6)}, ${currentPosition.coords.longitude.toFixed(6)}`,
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
      type: 'custom'
    };
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'office': return '🏢';
      case 'warehouse': return '🏭';
      case 'client': return '👥';
      case 'project': return '🏗️';
      default: return '📍';
    }
  };

  const filteredPredefined = allPredefinedLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Champ de sélection */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className={selectedLocation ? 'text-gray-900' : 'text-gray-500'}>
              {selectedLocation ? selectedLocation.name : placeholder}
            </span>
          </div>
          {selectedLocation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLocationSelect(null as any);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {selectedLocation && (
          <div className="text-xs text-gray-500 mt-1 ml-6">
            {selectedLocation.address}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un lieu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Position actuelle */}
            {currentPosition && (
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Position actuelle</div>
                <button
                  onClick={() => handleLocationSelect(getCurrentLocationOption()!)}
                  className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center gap-3"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Position actuelle</div>
                    <div className="text-xs text-gray-500">
                      {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Lieux prédéfinis */}
            {filteredPredefined.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Lieux enregistrés</div>
                {filteredPredefined.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center gap-3"
                  >
                    <span className="text-lg">{getLocationIcon(location.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{location.name}</div>
                      <div className="text-xs text-gray-500">{location.address}</div>
                    </div>
                    {selectedLocation?.id === location.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Résultats de recherche */}
            {searchQuery && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                  Résultats de recherche
                  {isSearching && <span className="ml-2">🔄</span>}
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.address}</div>
                      </div>
                    </button>
                  ))
                ) : searchQuery.length >= 3 && !isSearching ? (
                  <div className="p-2 text-center text-gray-500 text-sm">
                    Aucun résultat trouvé
                  </div>
                ) : null}
              </div>
            )}

            {/* Message si aucun contenu */}
            {!currentPosition && filteredPredefined.length === 0 && !searchQuery && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Commencez à taper pour rechercher un lieu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

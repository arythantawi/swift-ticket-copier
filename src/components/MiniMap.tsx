import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Search, Loader2, X } from 'lucide-react';

// Fix for default marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface MiniMapProps {
  lat: number;
  lng: number;
  address?: string;
  onLocationChange?: (lat: number, lng: number) => void;
  originalLat?: number;
  originalLng?: number;
}

// Component to recenter map when coords change
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  
  return null;
};

// Search box component
const SearchBox = ({ 
  onSelectLocation 
}: { 
  onSelectLocation: (lat: number, lng: number) => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const map = useMap();

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=5`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.setView([lat, lng], 16, { animate: true });
    onSelectLocation(lat, lng);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="absolute top-2 left-2 right-12 z-[1000]">
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <Search className="w-4 h-4 ml-3 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Cari alamat..."
            className="flex-1 px-2 py-2 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-gray-400"
          />
          {isSearching && <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />}
          {query && !isSearching && (
            <button onClick={handleClear} className="p-1 mr-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-[200px] overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-start gap-2"
              >
                <Search className="w-3 h-3 mt-1 text-gray-400 flex-shrink-0" />
                <span className="text-foreground line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
        
        {showResults && query.length >= 3 && results.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 text-sm text-gray-500 text-center">
            Tidak ada hasil ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

// Center button component
const CenterButton = ({ 
  originalLat, 
  originalLng, 
  currentLat,
  currentLng,
  onCenter 
}: { 
  originalLat: number; 
  originalLng: number;
  currentLat: number;
  currentLng: number;
  onCenter: () => void;
}) => {
  const map = useMap();
  const isAtOriginal = Math.abs(currentLat - originalLat) < 0.0001 && Math.abs(currentLng - originalLng) < 0.0001;
  
  const handleCenter = () => {
    map.setView([originalLat, originalLng], 16, { animate: true });
    onCenter();
  };

  if (isAtOriginal) return null;

  return (
    <button
      onClick={handleCenter}
      className="absolute bottom-12 left-2 z-[1000] bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
      title="Kembali ke lokasi GPS awal"
    >
      <Crosshair className="w-4 h-4" />
      <span className="hidden sm:inline">Lokasi Awal</span>
    </button>
  );
};

// Draggable marker component
const DraggableMarker = ({ 
  lat, 
  lng, 
  address, 
  onLocationChange 
}: { 
  lat: number; 
  lng: number; 
  address?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker && onLocationChange) {
        const newPos = marker.getLatLng();
        onLocationChange(newPos.lat, newPos.lng);
      }
    },
  };

  return (
    <Marker 
      position={[lat, lng]} 
      icon={markerIcon}
      draggable={!!onLocationChange}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-medium">📍 Lokasi Penjemputan</p>
          {address && <p className="text-xs mt-1 text-gray-600">{address.split('\n')[0]}</p>}
          {onLocationChange && (
            <p className="text-xs mt-2 text-primary font-medium">↕️ Geser marker untuk koreksi lokasi</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const MiniMap = ({ lat, lng, address, onLocationChange, originalLat, originalLng }: MiniMapProps) => {
  const [origLat] = useState(originalLat ?? lat);
  const [origLng] = useState(originalLng ?? lng);

  const handleCenterToOriginal = () => {
    if (onLocationChange) {
      onLocationChange(origLat, origLng);
    }
  };

  const handleSearchSelect = (newLat: number, newLng: number) => {
    if (onLocationChange) {
      onLocationChange(newLat, newLng);
    }
  };

  return (
    <div className="w-full h-[280px] rounded-lg overflow-hidden border border-green-300 dark:border-green-700 shadow-sm relative">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <RecenterMap lat={lat} lng={lng} />
        {onLocationChange && <SearchBox onSelectLocation={handleSearchSelect} />}
        <CenterButton 
          originalLat={origLat} 
          originalLng={origLng}
          currentLat={lat}
          currentLng={lng}
          onCenter={handleCenterToOriginal}
        />
        <DraggableMarker 
          lat={lat} 
          lng={lng} 
          address={address}
          onLocationChange={onLocationChange}
        />
      </MapContainer>
      
      {/* Hint overlay */}
      {onLocationChange && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs py-1.5 px-3 rounded-lg text-center pointer-events-none">
          🔍 Cari alamat • 🖐️ Geser peta • 📍 Geser marker
        </div>
      )}
    </div>
  );
};

export default MiniMap;

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';

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
      className="absolute top-2 left-2 z-[1000] bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
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

  return (
    <div className="w-full h-[250px] rounded-lg overflow-hidden border border-green-300 dark:border-green-700 shadow-sm relative">
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
          🖐️ Geser peta untuk melihat sekitar • 📍 Geser marker untuk koreksi lokasi
        </div>
      )}
    </div>
  );
};

export default MiniMap;

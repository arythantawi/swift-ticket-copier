import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}

// Component to recenter map when coords change
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  
  return null;
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

const MiniMap = ({ lat, lng, address, onLocationChange }: MiniMapProps) => {
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

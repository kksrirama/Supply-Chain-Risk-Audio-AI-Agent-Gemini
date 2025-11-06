import React, { useEffect, useRef } from 'react';
import { WAREHOUSE_DATA } from '../constants';
import { Warehouse, StockLevel } from '../types';

// Fix: Declare global 'google' object to resolve TypeScript errors for Google Maps API.
// Wrapped in `declare global` to ensure it's applied correctly in a module context.
declare global {
  const google: any;
}

interface MapViewProps {
  onNavigateBack: () => void;
}

const getMarkerColor = (warehouse: Warehouse): string => {
  const stockLevels = warehouse.stock.map(s => s.level);
  if (stockLevels.includes(StockLevel.Critical)) return '#ef4444'; // red-500
  if (stockLevels.includes(StockLevel.Low)) return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
};

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];


const MapView: React.FC<MapViewProps> = ({ onNavigateBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof google === 'undefined' || !mapRef.current) {
        return;
    }
    
    const map = new google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 15 },
        zoom: 2.5,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
    });
    
    const infoWindow = new google.maps.InfoWindow();

    WAREHOUSE_DATA.forEach(warehouse => {
      const pinColor = getMarkerColor(warehouse);
      const pinGlyph = new google.maps.marker.PinElement({
        background: pinColor,
        borderColor: '#1f2937', // gray-800
        glyphColor: '#ffffff',
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: warehouse.location,
        title: warehouse.name,
        content: pinGlyph.element,
      });

      marker.addListener('click', () => {
        let contentString = `<div class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 shadow-lg font-sans w-64">
          <h3 class="font-bold text-md mb-2 text-blue-300">${warehouse.name}</h3>
          <ul class="space-y-1 text-sm">`;
        
        warehouse.stock.forEach(item => {
          let levelColor = 'text-green-400';
          if (item.level === StockLevel.Low) levelColor = 'text-yellow-400';
          if (item.level === StockLevel.Critical) levelColor = 'text-red-400';
          contentString += `<li class="flex justify-between items-center">
            <span class="text-gray-300">${item.productName}:</span> 
            <span class="font-semibold ${levelColor}">${item.level} (${item.quantity.toLocaleString()})</span>
          </li>`;
        });
        
        contentString += `</ul></div>`;
        
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });
    });
  }, []);

  if (typeof google === 'undefined') {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700 min-h-[calc(100vh-120px)]">
            <h2 className="text-xl font-bold text-red-400">Google Maps Failed to Load</h2>
            <p className="text-gray-400 mt-2 text-center">Please check your internet connection or ensure a valid Google Maps API key is configured.</p>
            <button
                onClick={onNavigateBack}
                className="mt-6 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                Back to Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      <div ref={mapRef} className="w-full h-full" style={{minHeight: 'calc(100vh - 120px)'}} />
      <button
        onClick={onNavigateBack}
        className="absolute top-4 left-4 z-10 py-2 px-4 rounded-lg bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white font-semibold transition-colors flex items-center shadow-lg border border-gray-600"
        aria-label="Back to dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
    </div>
  );
};

export default MapView;
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LtaBusStop, SINGAPORE_BUS_STOPS, BUS_SERVICE_DETAILS } from '../data/singaporeBusData';
import { getLiveBusesForService } from '../services/ltaBusApi';

interface SingaporeBusMapProps {
  selectedStop: LtaBusStop;
  onSelectStop: (stop: LtaBusStop) => void;
  selectedServiceNo: string | null;
  userCoords: { lat: number; lng: number } | null;
  showAllStops?: boolean;
}

export const SingaporeBusMap: React.FC<SingaporeBusMapProps> = ({
  selectedStop,
  onSelectStop,
  selectedServiceNo,
  userCoords,
  showAllStops = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stopMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const busMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedStop.Latitude, selectedStop.Longitude],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // High clarity CartoDB Positron / OSM tiles for clean transit readability
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Add minimal custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const stopLayer = L.layerGroup().addTo(map);
    const busLayer = L.layerGroup().addTo(map);

    stopMarkersLayerRef.current = stopLayer;
    busMarkersLayerRef.current = busLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center when selectedStop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedStop.Latitude, selectedStop.Longitude], 15.5, {
      duration: 0.8
    });
  }, [selectedStop.BusStopCode]);

  // Render Stop Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !stopMarkersLayerRef.current) return;
    const layer = stopMarkersLayerRef.current;
    layer.clearLayers();

    const stopsToRender = showAllStops ? SINGAPORE_BUS_STOPS : [selectedStop];

    stopsToRender.forEach((stop) => {
      const isSelected = stop.BusStopCode === selectedStop.BusStopCode;
      
      const customIcon = L.divIcon({
        className: 'custom-bus-stop-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
            ${isSelected ? `
              <span class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></span>
              <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold font-mono">
                ${stop.BusStopCode.slice(-3)}
              </div>
            ` : `
              <div class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md border-2 border-white text-[10px] font-bold font-mono">
                ${stop.BusStopCode.slice(-3)}
              </div>
            `}
          </div>
        `,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12]
      });

      const marker = L.marker([stop.Latitude, stop.Longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectStop(stop);
      });

      marker.bindTooltip(`
        <div class="px-2 py-1 text-xs font-sans">
          <div class="font-bold text-slate-900">${stop.Description}</div>
          <div class="text-[10px] text-slate-500 font-mono">Stop ${stop.BusStopCode} · ${stop.RoadName}</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-0.5">${stop.services.length} services available</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -12],
        className: 'rounded-lg shadow-md border border-slate-200 p-0 overflow-hidden'
      });

      marker.addTo(layer);
    });
  }, [selectedStop.BusStopCode, showAllStops]);

  // Render Route Polyline and Live Bus Telemetry Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !busMarkersLayerRef.current) return;
    const busLayer = busMarkersLayerRef.current;
    busLayer.clearLayers();

    // Remove old route polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (selectedServiceNo && BUS_SERVICE_DETAILS[selectedServiceNo]) {
      const detail = BUS_SERVICE_DETAILS[selectedServiceNo];
      const waypoints = detail.Waypoints;

      // Draw route line
      const polyline = L.polyline(waypoints, {
        color: '#10b981', // emerald
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      routePolylineRef.current = polyline;

      // Draw live buses for this service
      const buses = getLiveBusesForService(selectedServiceNo);
      buses.forEach((bus) => {
        const loadColor = bus.load === 'SEA' ? '#10b981' : bus.load === 'SDA' ? '#f59e0b' : '#ef4444';
        const busIcon = L.divIcon({
          className: 'custom-live-bus-marker',
          html: `
            <div class="relative flex items-center justify-center group cursor-pointer">
              <span class="absolute -inset-1 rounded-full opacity-60 animate-pulse" style="background-color: ${loadColor};"></span>
              <div class="px-2 py-0.5 rounded-md text-white font-mono font-bold text-[11px] shadow-lg flex items-center gap-1 border border-white" style="background-color: #0f172a;">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${loadColor};"></span>
                <span>${bus.serviceNo}</span>
              </div>
            </div>
          `,
          iconSize: [44, 22],
          iconAnchor: [22, 11]
        });

        const busMarker = L.marker([bus.latitude, bus.longitude], { icon: busIcon });
        busMarker.bindTooltip(`
          <div class="p-2 text-xs font-sans">
            <div class="flex items-center justify-between gap-4 font-mono font-bold">
              <span>Bus ${bus.serviceNo} (${bus.plate})</span>
              <span class="text-slate-500">${bus.speedKmh} km/h</span>
            </div>
            <div class="text-[11px] text-slate-600 mt-1">
              Type: ${bus.type === 'DD' ? 'Double Deck' : bus.type === 'BD' ? 'Bendy' : 'Single Deck'} · ${bus.isWab ? 'Wheelchair Accessible' : ''}
            </div>
            <div class="text-[11px] font-semibold mt-0.5" style="color: ${loadColor};">
              ${bus.load === 'SEA' ? 'Seats Available' : bus.load === 'SDA' ? 'Standing Available' : 'Limited Standing'}
            </div>
          </div>
        `, { direction: 'top', offset: [0, -10] });

        busMarker.addTo(busLayer);
      });
    }
  }, [selectedServiceNo, selectedStop.BusStopCode]);

  // User location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      } else {
        const marker = L.circleMarker([userCoords.lat, userCoords.lng], {
          radius: 8,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          weight: 3
        }).addTo(mapInstanceRef.current);
        marker.bindTooltip("You are here", { direction: 'top' });
        userMarkerRef.current = marker;
      }
    }
  }, [userCoords]);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating map legend / overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs pointer-events-auto">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Live LTA Fleet Radar</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Seats
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Standing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Full
          </span>
        </div>
      </div>

      {/* Recenter button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([selectedStop.Latitude, selectedStop.Longitude], 16, { duration: 0.6 });
          }
        }}
        className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-medium flex items-center gap-1.5 transition-colors"
        title="Recenter to selected stop"
      >
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Center Stop</span>
      </button>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Flame, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Compass, 
  RotateCcw, 
  X,
  Layers
} from 'lucide-react';
import { CivicIssue } from '../types';
import { sounds } from '../services/soundEffects';

interface Props {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onOpenNewReport: () => void;
}

const truncateStr = (str: string, max = 25) => {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
};

// Preset Ghanaian Metros for fast panning
const GHANA_METRO_PRESETS = [
  { name: 'Accra (AMA)', lat: 5.5600, lng: -0.1900, zoom: 13 },
  { name: 'Kumasi (KMA)', lat: 6.6900, lng: -1.6200, zoom: 13 },
  { name: 'Tema (TMA)', lat: 5.6600, lng: -0.0100, zoom: 13 },
  { name: 'Tamale (TaMA)', lat: 9.4000, lng: -0.8400, zoom: 13 }
];

export const HeatmapMapView: React.FC<Props> = ({
  issues,
  onSelectIssue
}) => {
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [filterLayer, setFilterLayer] = useState<'all' | 'urgent' | 'resolved'>('all');
  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('dark');
  
  // Current map view center coordinates & zoom
  const [currentCoords, setCurrentCoords] = useState({ lat: 5.565, lng: -0.185, zoom: 13 });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const filteredIssues = issues.filter((issue) => {
    if (filterLayer === 'urgent') return issue.priority === 'urgent' && issue.status !== 'resolved';
    if (filterLayer === 'resolved') return issue.status === 'resolved';
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [5.5650, -0.1850],
      zoom: 13,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true
    });

    map.attributionControl.setPosition('bottomright');
    map.attributionControl.setPrefix(false);

    // Free OpenStreetMap tile server with zero API key requirement
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      className: mapStyle === 'dark' ? 'leaflet-tile-dark' : ''
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    const heatLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    heatLayerRef.current = heatLayer;
    markersLayerRef.current = markersLayer;

    // Track map movements
    map.on('move', () => {
      const center = map.getCenter();
      setCurrentCoords({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom()
      });
    });

    map.on('click', () => {
      setSelectedIssue(null);
    });

    mapRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer Styling (Dark vs Street)
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const container = tileLayerRef.current.getContainer();
    if (container) {
      if (mapStyle === 'dark') {
        container.classList.add('leaflet-tile-dark');
      } else {
        container.classList.remove('leaflet-tile-dark');
      }
    }
  }, [mapStyle]);

  // Render Heatmap Blobs and Custom Pins
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current || !markersLayerRef.current) return;

    heatLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    filteredIssues.forEach((issue) => {
      const isUrgent = issue.priority === 'urgent' && issue.status !== 'resolved';
      const isResolved = issue.status === 'resolved';

      // 1. Geographic Heatmap Density Glow Circle
      const glowColor = isResolved ? '#10B981' : isUrgent ? '#CE1126' : '#F59E0B';
      const glowRadius = isUrgent ? 850 : 550;

      const circle = L.circle([issue.coordinates.lat, issue.coordinates.lng], {
        color: glowColor,
        fillColor: glowColor,
        fillOpacity: isUrgent ? 0.28 : 0.18,
        weight: 0,
        radius: glowRadius,
        interactive: false
      });
      heatLayerRef.current?.addLayer(circle);

      // 2. High-visibility Interactive HTML Pin Marker
      const iconHtml = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 select-none" id="marker-issue-${issue.id}">
          ${isUrgent ? '<div class="absolute -inset-2 rounded-full bg-red-600/40 animate-ping pointer-events-none"></div>' : ''}
          <div class="h-8 w-8 rounded-xl flex items-center justify-center shadow-2xl border-2 transition-transform duration-200 hover:scale-125 ${
            isResolved
              ? 'bg-[#006B3F] border-emerald-300 text-white'
              : isUrgent
              ? 'bg-[#CE1126] border-[#FCD116] text-white shadow-red-600/60'
              : 'bg-[#12151e] border-amber-400 text-[#FCD116]'
          }">
            ${
              isResolved
                ? '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>'
                : isUrgent
                ? '<svg class="h-4 w-4 text-[#FCD116]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-.5 2.5-3 4-3 7 0 2.8 2.2 5 5 5s5-2.2 5-5c0-1.5-.7-3-1.8-4.2-.3 1.2-.9 2.2-1.7 3-.8-1.5-1.5-3.5-1.5-5.8z"/></svg>'
                : '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.35-7-10a7 7 0 1114 0c0 5.65-7 10-7 10z"></path></svg>'
            }
          </div>
          <div class="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-black/90 border border-white/20 text-[9px] font-mono font-bold text-[#FCD116] shadow-sm">
            ${issue.upvotes}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'civic-custom-div-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], {
        icon: customIcon
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedIssue(issue);
        sounds.playVotePop();
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredIssues]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
    sounds.playVotePop();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
    sounds.playVotePop();
  };

  const handleResetCenter = () => {
    mapRef.current?.flyTo([5.5650, -0.1850], 13, { duration: 1 });
    sounds.playScannerBeep();
  };

  const handleMetroJump = (preset: typeof GHANA_METRO_PRESETS[0]) => {
    mapRef.current?.flyTo([preset.lat, preset.lng], preset.zoom, { duration: 1.2 });
    sounds.playVotePop();
  };

  return (
    <div className="space-y-3 w-full">
      {/* Map Header Toolbar */}
      <div className="p-2.5 sm:p-3 bg-[#090b10] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterLayer('all')}
            className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              filterLayer === 'all'
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'bg-[#12151e] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Hotspots ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLayer('urgent')}
            className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 text-xs ${
              filterLayer === 'urgent'
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'bg-[#12151e] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Flame className="h-3 w-3 text-[#FCD116]" />
            <span>Urgent ({issues.filter((i) => i.priority === 'urgent' && i.status !== 'resolved').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterLayer('resolved')}
            className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 text-xs ${
              filterLayer === 'resolved'
                ? 'bg-[#006B3F] text-white shadow-md'
                : 'bg-[#12151e] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-300" />
            <span>Solved ({issues.filter((i) => i.status === 'resolved').length})</span>
          </button>
        </div>

        {/* Quick Metro Jump Select & Map Theme */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Map Style Switcher */}
          <div className="flex items-center bg-[#12151e] p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-1 rounded transition ${mapStyle === 'dark' ? 'bg-[#090b10] text-[#FCD116]' : 'text-gray-400'}`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('street')}
              className={`px-2 py-1 rounded transition ${mapStyle === 'street' ? 'bg-[#090b10] text-[#FCD116]' : 'text-gray-400'}`}
            >
              Street
            </button>
          </div>

          <select
            onChange={(e) => {
              const preset = GHANA_METRO_PRESETS.find((p) => p.name === e.target.value);
              if (preset) handleMetroJump(preset);
            }}
            className="px-2 py-1.5 text-xs bg-[#12151e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FCD116]"
            defaultValue="Accra (AMA)"
          >
            {GHANA_METRO_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {truncateStr(p.name, 20)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className="relative h-[420px] sm:h-[480px] w-full rounded-2xl bg-[#090b10] border border-white/10 overflow-hidden shadow-2xl">
        <div 
          ref={mapContainerRef}
          className="h-full w-full z-0"
        />

        {/* Map Control Overlay Buttons (+ / - / Reset) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="h-8 w-8 rounded-xl bg-[#090b10]/90 hover:bg-[#181c28] text-white border border-white/15 shadow-xl flex items-center justify-center font-bold text-sm active:scale-95 transition"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="h-8 w-8 rounded-xl bg-[#090b10]/90 hover:bg-[#181c28] text-white border border-white/15 shadow-xl flex items-center justify-center font-bold text-sm active:scale-95 transition"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCenter}
            className="h-8 w-8 rounded-xl bg-[#090b10]/90 hover:bg-[#181c28] text-[#FCD116] border border-white/15 shadow-xl flex items-center justify-center active:scale-95 transition"
            title="Reset to Accra Center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Coords & MMDA Geofence Info Chip */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-[#090b10]/90 border border-white/10 text-[10px] font-mono text-gray-300 backdrop-blur-md z-30 flex items-center gap-1.5 pointer-events-none">
          <Compass className="h-3 w-3 text-[#FCD116]" />
          <span>{currentCoords.lat.toFixed(3)}°N, {Math.abs(currentCoords.lng).toFixed(3)}°W • Zoom: {currentCoords.zoom}x</span>
        </div>

        {/* Selected Issue Preview Card Drawer */}
        {selectedIssue && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 rounded-2xl bg-[#090b10]/95 border border-white/15 p-3.5 shadow-2xl backdrop-blur-xl z-40 space-y-2.5 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FCD116]">
                  {truncateStr(selectedIssue.districtName, 22)}
                </span>
                <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                  {truncateStr(selectedIssue.title, 25)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-300 leading-snug">
              {truncateStr(selectedIssue.description, 65)}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <span className="text-[10px] font-mono text-gray-400">
                👍 {selectedIssue.upvotes} Votes
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectIssue(selectedIssue);
                  setSelectedIssue(null);
                }}
                className="px-3 py-1 rounded-xl bg-[#CE1126] hover:bg-[#b00f20] text-white font-bold text-[10px] transition shadow-md flex items-center gap-1"
              >
                <span>{selectedIssue.status === 'resolved' ? 'View Proof' : 'Full Details'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

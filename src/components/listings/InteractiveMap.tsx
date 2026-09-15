'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import {
  Plus,
  Minus,
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Bed,
  Bath,
  Maximize2,
  X,
} from 'lucide-react';

interface InteractiveMapProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onSelectProperty: (id: string | null) => void;
}

// Convert latitude and longitude to world pixel at a given zoom level (Web Mercator)
function project(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n * 256;
  const latRad = (lat * Math.PI) / 180;
  // Clamp latitude to avoid infinity near poles
  const clampedLat = Math.max(Math.min(latRad, 1.4844), -1.4844);
  const y =
    ((1 - Math.log(Math.tan(clampedLat) + 1 / Math.cos(clampedLat)) / Math.PI) / 2) *
    n *
    256;
  return { x, y };
}

// Approximate city coordinates dictionary for fast fallback
const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  GA: { lat: 33.749, lng: -84.388 },
  OH: { lat: 39.961, lng: -82.998 },
  IN: { lat: 39.768, lng: -86.158 },
  PA: { lat: 39.952, lng: -75.163 },
  TX: { lat: 32.776, lng: -96.797 },
  NC: { lat: 35.227, lng: -80.843 },
  FL: { lat: 28.538, lng: -81.379 },
  MO: { lat: 39.099, lng: -94.578 },
  IL: { lat: 41.878, lng: -87.629 },
  MI: { lat: 42.331, lng: -83.045 },
  TN: { lat: 36.162, lng: -86.781 },
  AZ: { lat: 33.448, lng: -112.074 },
  NV: { lat: 36.169, lng: -115.139 },
};

export default function InteractiveMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [zoom, setZoom] = useState<number>(5);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 36.5,
    lng: -86.0,
  });

  // Drag pan state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Container dimensions
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 600,
          height: containerRef.current.clientHeight || 500,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute bounding center when properties list changes
  const fitProperties = useCallback(() => {
    if (!properties || properties.length === 0) return;

    let minLat = 90,
      maxLat = -90,
      minLng = 180,
      maxLng = -180;

    properties.forEach((p) => {
      const lat = p.address?.coordinates?.lat || STATE_COORDINATES[p.address?.state]?.lat || 33.749;
      const lng = p.address?.coordinates?.lng || STATE_COORDINATES[p.address?.state]?.lng || -84.388;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const avgLat = (minLat + maxLat) / 2;
    const avgLng = (minLng + maxLng) / 2;

    const latSpan = Math.max(maxLat - minLat, 0.5);
    const lngSpan = Math.max(maxLng - minLng, 0.5);

    // Compute appropriate zoom level to fit bounds
    let computedZoom = 5;
    if (latSpan > 15 || lngSpan > 25) computedZoom = 4;
    else if (latSpan > 7 || lngSpan > 12) computedZoom = 5;
    else if (latSpan > 2 || lngSpan > 4) computedZoom = 7;
    else computedZoom = 9;

    setCenter({ lat: avgLat, lng: avgLng });
    setZoom(computedZoom);
    setPanOffset({ x: 0, y: 0 });
  }, [properties]);

  useEffect(() => {
    fitProperties();
  }, [fitProperties]);

  // Recenter when single property is selected
  useEffect(() => {
    if (selectedPropertyId) {
      const selected = properties.find((p) => p.id === selectedPropertyId);
      if (selected) {
        const lat =
          selected.address?.coordinates?.lat ||
          STATE_COORDINATES[selected.address?.state]?.lat ||
          33.749;
        const lng =
          selected.address?.coordinates?.lng ||
          STATE_COORDINATES[selected.address?.state]?.lng ||
          -84.388;
        setCenter({ lat, lng });
        setZoom((z) => Math.max(z, 9));
        setPanOffset({ x: 0, y: 0 });
      }
    }
  }, [selectedPropertyId, properties]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 1, 14));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 1, 3));
  };

  // Compute active tiles to render based on center, zoom, and viewport
  const centerWorld = project(center.lat, center.lng, zoom);
  const viewportLeft = centerWorld.x - dimensions.width / 2 - panOffset.x;
  const viewportTop = centerWorld.y - dimensions.height / 2 - panOffset.y;

  const minTileX = Math.floor(viewportLeft / 256);
  const maxTileX = Math.floor((viewportLeft + dimensions.width) / 256);
  const minTileY = Math.floor(viewportTop / 256);
  const maxTileY = Math.floor((viewportTop + dimensions.height) / 256);

  const numTiles = Math.pow(2, zoom);
  const tiles: { x: number; y: number; key: string; left: number; top: number; url: string }[] = [];

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      if (ty >= 0 && ty < numTiles) {
        // Wrap horizontal coordinate
        const wrappedX = ((tx % numTiles) + numTiles) % numTiles;
        const left = tx * 256 - viewportLeft;
        const top = ty * 256 - viewportTop;

        const tileUrl =
          mapType === 'streets'
            ? `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${wrappedX}/${ty}@2x.png`
            : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${wrappedX}`;

        tiles.push({
          x: tx,
          y: ty,
          key: `${zoom}-${tx}-${ty}-${mapType}`,
          left,
          top,
          url: tileUrl,
        });
      }
    }
  }

  const activeProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-[540px] lg:h-full min-h-[500px] bg-slate-900 border border-slate-300 rounded-xl overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Real-world Raster Map Tiles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              left: `${tile.left}px`,
              top: `${tile.top}px`,
              width: '256px',
              height: '256px',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      {/* Map Control Tools (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        {/* Layer Switcher (Streets vs Satellite) */}
        <div className="flex bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapType('streets');
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapType === 'streets'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Streets
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapType('satellite');
            }}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapType === 'satellite'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border-b border-slate-100"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border-b border-slate-100"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fitProperties();
            }}
            className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Recenter All Properties"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cartographic Watermark & Attribution (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-sm pointer-events-auto">
        <Compass className="w-3.5 h-3.5 text-emerald-700 animate-spin-slow" />
        <span>
          {mapType === 'streets' ? 'OpenStreetMap & CARTO Cartography' : 'Esri High-Res Satellite Imagery'}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-emerald-800 font-mono text-[10px]">Zoom: {zoom}x</span>
      </div>

      {/* Scale Indicator (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs pointer-events-none">
        <div className="w-12 h-1 bg-slate-800 border-x border-slate-900" />
        <span>{zoom >= 10 ? '1 mi' : zoom >= 7 ? '10 mi' : '50 mi'}</span>
      </div>

      {/* Realistic Interactive Property Price Pins Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {properties.map((property) => {
          const lat =
            property.address?.coordinates?.lat ||
            STATE_COORDINATES[property.address?.state]?.lat ||
            33.749;
          const lng =
            property.address?.coordinates?.lng ||
            STATE_COORDINATES[property.address?.state]?.lng ||
            -84.388;

          const propWorld = project(lat, lng, zoom);
          const pinX = propWorld.x - viewportLeft;
          const pinY = propWorld.y - viewportTop;

          // Don't render if outside view
          if (
            pinX < -60 ||
            pinX > dimensions.width + 60 ||
            pinY < -60 ||
            pinY > dimensions.height + 60
          ) {
            return null;
          }

          const isSelected = property.id === selectedPropertyId;
          const isRent = property.listingType === 'rent';
          const priceLabel = isRent
            ? `$${property.price}/mo`
            : property.price >= 1000
            ? `$${Math.round(property.price / 1000)}k`
            : `$${property.price}`;

          return (
            <div
              key={property.id}
              style={{
                position: 'absolute',
                left: `${pinX}px`,
                top: `${pinY}px`,
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 30 : 10,
              }}
              className="pointer-events-auto"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty(isSelected ? null : property.id);
                }}
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-lg transition-all transform hover:scale-110 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white ring-3 ring-emerald-400 scale-110 shadow-2xl'
                    : isRent
                    ? 'bg-sky-700 hover:bg-sky-800 text-white ring-1 ring-white/80'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white ring-1 ring-white/80'
                }`}
              >
                <MapPin
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-emerald-400 fill-emerald-400' : 'text-white'
                  }`}
                />
                <span className="font-mono tracking-tight">{priceLabel}</span>
              </button>

              {/* Pin Stem Shadow */}
              <div
                className={`w-1.5 h-2 mx-auto rounded-b ${
                  isSelected ? 'bg-slate-950' : isRent ? 'bg-sky-800' : 'bg-emerald-900'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Property Detail Quick-Card (When Pin is Clicked) */}
      {activeProperty && (
        <div className="absolute top-4 left-4 z-40 max-w-xs sm:max-w-sm w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="relative aspect-16/9 w-full bg-slate-100">
            {activeProperty.images[0]?.url ? (
              <Image
                src={activeProperty.images[0].url}
                alt={activeProperty.title}
                fill
                className="object-cover"
                sizes="340px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <MapPin className="w-6 h-6" />
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectProperty(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span
              className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
                activeProperty.listingType === 'rent' ? 'bg-sky-800' : 'bg-emerald-800'
              }`}
            >
              {activeProperty.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>

          <div className="p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-base font-bold text-slate-900 block font-display truncate max-w-[200px]">
                  {activeProperty.title}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {activeProperty.address.city}, {activeProperty.address.state}
                </span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-700 whitespace-nowrap">
                {activeProperty.listingType === 'rent'
                  ? `$${activeProperty.price}/mo`
                  : `$${activeProperty.price.toLocaleString()}`}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeProperty.specs.bedrooms} bd</span>
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeProperty.specs.bathrooms} ba</span>
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeProperty.specs.squareFeet} sq ft</span>
              </span>
            </div>

            <Link
              href={`/listings/${activeProperty.id}`}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>View Verified Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

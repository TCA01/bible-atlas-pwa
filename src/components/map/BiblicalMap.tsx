'use client';

import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import { useLocale } from 'next-intl';
import type { LanguageCode } from '@/types/bible';
import type { BiblicalJourney, BiblicalPlace } from '@/types/geo';

interface BiblicalMapProps {
  places: BiblicalPlace[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  activeJourney?: BiblicalJourney | null;
  heightClass?: string;
}

export function BiblicalMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  activeJourney = null,
  heightClass = 'h-64 sm:h-72',
}: BiblicalMapProps) {
  const locale = useLocale() as LanguageCode;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new MapLibreMap({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [35.2137, 32.5],
      zoom: 5.5,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render place markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'group relative flex items-center justify-center cursor-pointer';
      el.innerHTML = `
        <span style="
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:${isSelected ? '28px' : '18px'};
          height:${isSelected ? '28px' : '18px'};
          border-radius:9999px;
          background:${isSelected ? '#D97706' : '#1E3A5F'};
          border:2px solid #FFFFFF;
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          transition:all 0.2s ease;
        "></span>
      `;
      el.title = `${place.ancientName[locale]} (${place.modernName[locale]})`;
      el.addEventListener('click', () => onSelectPlace(place.id));

      const marker = new Marker({ element: el })
        .setLngLat(place.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [places, selectedPlaceId, locale, onSelectPlace]);

  // Fly to selected place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    map.flyTo({
      center: place.coordinates,
      zoom: 7.5,
      duration: 900,
      essential: true,
    });
  }, [selectedPlaceId, places]);

  // Render active journey LineString
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyLayer = () => {
      if (map.getLayer('journey-line')) map.removeLayer('journey-line');
      if (map.getSource('journey-source')) map.removeSource('journey-source');

      if (!activeJourney) return;

      map.addSource('journey-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activeJourney.geometry,
        },
      });

      map.addLayer({
        id: 'journey-line',
        type: 'line',
        source: 'journey-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': activeJourney.color,
          'line-width': 3.5,
          'line-dasharray': [2, 1.5],
        },
      });
    };

    if (map.isStyleLoaded()) {
      applyLayer();
    } else {
      map.once('load', applyLayer);
    }
  }, [activeJourney]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-xl border ${heightClass}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    />
  );
}

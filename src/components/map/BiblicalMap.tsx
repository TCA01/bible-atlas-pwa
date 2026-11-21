'use client';

import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import { useLocale } from 'next-intl';
import type { LanguageCode } from '@/types/bible';
import type { BiblicalJourney, BiblicalPlace } from '@/types/geo';
import { pickText } from '@/lib/geo-utils';

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
  const selectedMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelectPlace);
  onSelectRef.current = onSelectPlace;

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
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render all 1,300+ places as a GPU-accelerated WebGL GeoJSON circle layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = {
      type: 'FeatureCollection' as const,
      features: places.map((p) => ({
        type: 'Feature' as const,
        properties: {
          id: p.id,
          name: pickText(p.ancientName, locale),
          featured: p.featured ? 1 : 0,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: p.coordinates,
        },
      })),
    };

    const applyPlacesLayer = () => {
      const existing = map.getSource('biblical-places') as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(geojson);
        return;
      }

      map.addSource('biblical-places', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'biblical-places-circles',
        type: 'circle',
        source: 'biblical-places',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'featured'], 1], 7, 4.5],
          'circle-color': ['case', ['==', ['get', 'featured'], 1], '#D97706', '#1E3A5F'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.88,
        },
      });

      map.on('click', 'biblical-places-circles', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (typeof id === 'string') {
          onSelectRef.current(id);
        }
      });

      map.on('mouseenter', 'biblical-places-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'biblical-places-circles', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      applyPlacesLayer();
    } else {
      map.once('load', applyPlacesLayer);
    }
  }, [places, locale]);

  // Highlight selected place with a prominent pin & flyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;

    selectedMarkerRef.current?.remove();
    const el = document.createElement('div');
    el.innerHTML = `
      <span style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:26px;
        height:26px;
        border-radius:9999px;
        background:#D97706;
        border:3px solid #FFFFFF;
        box-shadow:0 0 0 4px rgba(217,119,6,0.35), 0 4px 10px rgba(0,0,0,0.4);
      "></span>
    `;
    el.title = `${pickText(place.ancientName, locale)} → ${pickText(place.modernName, locale)}`;
    selectedMarkerRef.current = new Marker({ element: el })
      .setLngLat(place.coordinates)
      .addTo(map);

    map.flyTo({
      center: place.coordinates,
      zoom: 7.5,
      duration: 900,
      essential: true,
    });
  }, [selectedPlaceId, places, locale]);

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

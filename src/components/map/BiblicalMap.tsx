'use client';

import { useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl';
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  const isLoadedRef = useRef(false);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const selectedPopupRef = useRef<Popup | null>(null);

  const placesRef = useRef(places);
  const selectedPlaceIdRef = useRef(selectedPlaceId);
  const activeJourneyRef = useRef(activeJourney);
  const localeRef = useRef(locale);
  const onSelectRef = useRef(onSelectPlace);

  placesRef.current = places;
  selectedPlaceIdRef.current = selectedPlaceId;
  activeJourneyRef.current = activeJourney;
  localeRef.current = locale;
  onSelectRef.current = onSelectPlace;

  const syncPlacesLayer = () => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const currentPlaces = placesRef.current;
    const currentLocale = localeRef.current;
    const geojson = {
      type: 'FeatureCollection' as const,
      features: currentPlaces.map((p) => ({
        type: 'Feature' as const,
        properties: {
          id: p.id,
          name: pickText(p.ancientName, currentLocale),
          featured: p.featured ? 1 : 0,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: p.coordinates,
        },
      })),
    };

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

  const syncSelectedMarker = (animate = true) => {
    const map = mapRef.current;
    const id = selectedPlaceIdRef.current;
    if (!map || !id) return;

    const place = placesRef.current.find((p) => p.id === id);
    if (!place) return;

    const currentLocale = localeRef.current;
    const ancient = pickText(place.ancientName, currentLocale);
    const modern = pickText(place.modernName, currentLocale);

    selectedMarkerRef.current?.remove();
    selectedPopupRef.current?.remove();

    const el = document.createElement('div');
    el.style.zIndex = '20';
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
        box-shadow:0 0 0 5px rgba(217,119,6,0.38), 0 4px 12px rgba(0,0,0,0.45);
      "></span>
    `;

    selectedMarkerRef.current = new Marker({ element: el })
      .setLngLat(place.coordinates)
      .addTo(map);

    const subtitle =
      modern && modern.toLowerCase() !== ancient.toLowerCase()
        ? `<div style="font-size:11px;color:#B45309;font-weight:600;margin-top:2px;">→ ${escapeHtml(modern)}</div>`
        : '';

    selectedPopupRef.current = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      maxWidth: '240px',
    })
      .setLngLat(place.coordinates)
      .setHTML(
        `<div style="font-family:system-ui,sans-serif;padding:2px 4px;color:#111827;">
          <div style="font-size:13px;font-weight:700;line-height:1.25;">${escapeHtml(ancient)}</div>
          ${subtitle}
        </div>`
      )
      .addTo(map);

    map.stop();
    if (animate && isLoadedRef.current) {
      map.flyTo({
        center: place.coordinates,
        zoom: Math.max(map.getZoom(), 7.2),
        duration: 750,
        essential: true,
      });
    } else {
      map.jumpTo({
        center: place.coordinates,
        zoom: 7.2,
      });
    }
  };

  const syncJourneyLayer = () => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const journey = activeJourneyRef.current;
    if (map.getLayer('journey-line')) map.removeLayer('journey-line');
    if (map.getSource('journey-source')) map.removeSource('journey-source');

    if (!journey) return;

    map.addSource('journey-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: journey.geometry,
      },
    });

    map.addLayer(
      {
        id: 'journey-line',
        type: 'line',
        source: 'journey-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': journey.color,
          'line-width': 3.5,
          'line-dasharray': [2, 1.5],
        },
      },
      map.getLayer('biblical-places-circles') ? 'biblical-places-circles' : undefined
    );
  };

  // Initialize MapLibre instance once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setWorkerUrl('/maplibre-gl-worker.mjs');

    const initialPlace = placesRef.current.find((p) => p.id === selectedPlaceIdRef.current);
    const map = new MapLibreMap({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: initialPlace ? initialPlace.coordinates : [35.2137, 32.5],
      zoom: initialPlace ? 7.2 : 5.5,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      isLoadedRef.current = true;
      syncPlacesLayer();
      syncJourneyLayer();
      syncSelectedMarker(false);
    });

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      isLoadedRef.current = false;
      selectedMarkerRef.current?.remove();
      selectedPopupRef.current?.remove();
      selectedMarkerRef.current = null;
      selectedPopupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync places layer whenever places or locale updates
  useEffect(() => {
    syncPlacesLayer();
    syncSelectedMarker(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, locale]);

  // Fly to selected place + show glowing marker & popup label
  useEffect(() => {
    syncSelectedMarker(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceId]);

  // Re-sync active journey overlay
  useEffect(() => {
    syncJourneyLayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJourney]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-xl border ${heightClass}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    />
  );
}

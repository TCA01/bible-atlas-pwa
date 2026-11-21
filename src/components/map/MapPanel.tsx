'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X, Search } from 'lucide-react';
import type { LanguageCode } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import { useReaderStore } from '@/store/useReaderStore';
import { BiblicalMap } from './BiblicalMap';
import { PlaceCard } from './PlaceCard';
import placesData from '@/data/geo/places.json';

const places = placesData as BiblicalPlace[];

export function MapPanel() {
  const t = useTranslations('map');
  const locale = useLocale() as LanguageCode;
  const { isMapOpen, selectedPlaceId, closeMap, openPlaceOnMap, setLocation } = useReaderStore();
  const [query, setQuery] = useState('');

  if (!isMapOpen) return null;

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) ?? places[0];

  const filteredPlaces = query.trim()
    ? places.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.ancientName[locale].toLowerCase().includes(q) ||
          p.modernName[locale].toLowerCase().includes(q) ||
          p.modernCountry[locale].toLowerCase().includes(q) ||
          p.ancientName.en.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-40 flex max-h-[82dvh] flex-col rounded-t-2xl border-t shadow-2xl lg:static lg:inset-auto lg:max-h-[calc(100dvh-6rem)] lg:w-[440px] lg:shrink-0 lg:rounded-2xl lg:border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-sm font-bold">{t('title')}</h2>
        <button
          type="button"
          onClick={closeMap}
          className="rounded-lg p-1.5 hover:opacity-70"
          aria-label={t('close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border py-2 ps-9 pe-3 text-xs outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-page)',
            }}
          />
          {filteredPlaces.length > 0 && (
            <div
              className="mt-1 max-h-40 overflow-y-auto rounded-xl border p-1 shadow-md"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              {filteredPlaces.map((fp) => (
                <button
                  key={fp.id}
                  type="button"
                  onClick={() => {
                    openPlaceOnMap(fp.id);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-start text-xs hover:opacity-80"
                >
                  <span className="font-semibold">{fp.ancientName[locale]}</span>
                  <span className="opacity-60">
                    {fp.modernName[locale]}, {fp.modernCountry[locale]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Vector Map */}
        <BiblicalMap
          places={places}
          selectedPlaceId={selectedPlace.id}
          onSelectPlace={(id) => openPlaceOnMap(id)}
          heightClass="h-56 sm:h-64"
        />

        {/* Selected Place Details */}
        <PlaceCard
          place={selectedPlace}
          onJumpToVerse={(bookId, chapter) => setLocation(bookId, chapter)}
        />
      </div>
    </aside>
  );
}

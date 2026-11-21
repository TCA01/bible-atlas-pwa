'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Route, Search, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { LanguageCode } from '@/types/bible';
import type { BiblicalJourney, BiblicalPlace } from '@/types/geo';
import { Header } from '@/components/layout/Header';
import { StudyDrawer } from '@/components/study/StudyDrawer';
import { BiblicalMap } from '@/components/map/BiblicalMap';
import { PlaceCard } from '@/components/map/PlaceCard';
import { useReaderStore } from '@/store/useReaderStore';
import placesData from '@/data/geo/places.json';
import journeysData from '@/data/geo/journeys.json';

const places = placesData as BiblicalPlace[];
const journeys = journeysData as BiblicalJourney[];

export default function AtlasPage() {
  const t = useTranslations('atlas');
  const tMap = useTranslations('map');
  const locale = useLocale() as LanguageCode;
  const router = useRouter();
  const { setLocation } = useReaderStore();

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(journeys[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(journeys[0].waypoints[0].placeId);
  const [search, setSearch] = useState('');

  const activeJourney = journeys.find((j) => j.id === selectedJourneyId) ?? null;
  const currentWaypoint = activeJourney?.waypoints[stepIndex] ?? null;
  const selectedPlace = places.find((p) => p.id === selectedPlaceId) ?? places[0];

  const filteredPlaces = places.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.ancientName[locale].toLowerCase().includes(q) ||
      p.modernName[locale].toLowerCase().includes(q) ||
      p.modernCountry[locale].toLowerCase().includes(q) ||
      p.ancientName.en.toLowerCase().includes(q)
    );
  });

  const handleOpenInReader = (bookId: string, chapter: number) => {
    setLocation(bookId, chapter);
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StudyDrawer />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>

          {/* Place Search */}
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tMap('searchPlaceholder')}
              className="w-full rounded-xl border py-2 ps-9 pe-3 text-sm outline-none"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
              }}
            />
          </div>
        </div>

        {/* Journeys Selector */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-70">
            <Route className="h-4 w-4 text-amber-600" />
            {t('journeys')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {journeys.map((j) => {
              const active = j.id === selectedJourneyId;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => {
                    setSelectedJourneyId(j.id);
                    setStepIndex(0);
                    setSelectedPlaceId(j.waypoints[0].placeId);
                  }}
                  className="rounded-2xl border p-4 text-start transition hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    borderColor: active ? 'var(--accent)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: j.color }} />
                    <span className="font-bold text-sm">{j.title[locale]}</span>
                  </div>
                  <p className="line-clamp-2 text-xs opacity-75">{j.description[locale]}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Map + Timeline + Place Commentary Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <BiblicalMap
              places={filteredPlaces}
              selectedPlaceId={selectedPlace.id}
              onSelectPlace={(id) => setSelectedPlaceId(id)}
              activeJourney={activeJourney}
              heightClass="h-80 sm:h-[420px]"
            />

            {/* Journey Waypoint Stepper */}
            {activeJourney && currentWaypoint && (
              <div
                className="rounded-2xl border p-4 shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {t('step', {
                      current: stepIndex + 1,
                      total: activeJourney.waypoints.length,
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={stepIndex === 0}
                      onClick={() => {
                        const prev = stepIndex - 1;
                        setStepIndex(prev);
                        setSelectedPlaceId(activeJourney.waypoints[prev].placeId);
                      }}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-30"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                      <span>{t('prevStep')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={stepIndex >= activeJourney.waypoints.length - 1}
                      onClick={() => {
                        const next = stepIndex + 1;
                        setStepIndex(next);
                        setSelectedPlaceId(activeJourney.waypoints[next].placeId);
                      }}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-30"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span>{t('nextStep')}</span>
                      <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold">{currentWaypoint.title[locale]}</h3>
                <p className="mt-1 text-sm opacity-80">{currentWaypoint.description[locale]}</p>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenInReader(
                      currentWaypoint.verseRef.bookId,
                      currentWaypoint.verseRef.chapter
                    )
                  }
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>
                    {t('openInReader')} ({currentWaypoint.verseRef.bookId}{' '}
                    {currentWaypoint.verseRef.chapter}:{currentWaypoint.verseRef.verse})
                  </span>
                </button>
              </div>
            )}

            {/* All Biblical Places Chips */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t('places')} ({filteredPlaces.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredPlaces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlaceId(p.id)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer"
                    style={{
                      borderColor:
                        p.id === selectedPlace.id ? 'var(--accent)' : 'var(--border-subtle)',
                      backgroundColor:
                        p.id === selectedPlace.id ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    }}
                  >
                    {p.ancientName[locale]} ({p.modernCountry[locale]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Place Commentary */}
          <div
            className="rounded-2xl border p-5 lg:col-span-5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <PlaceCard
              place={selectedPlace}
              onJumpToVerse={(bookId, chapter) => handleOpenInReader(bookId, chapter)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Compass, BookOpen, Landmark, Globe2 } from 'lucide-react';
import type { LanguageCode } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import { pickText } from '@/lib/geo-utils';
import { formatLocalizedSummary, inferModernCountry, localizePlaceType } from '@/lib/geo-i18n';
import { BIBLE_BOOKS } from '@/lib/bible-books';

interface PlaceCardProps {
  place: BiblicalPlace;
  onJumpToVerse?: (bookId: string, chapter: number) => void;
}

export function PlaceCard({ place, onJumpToVerse }: PlaceCardProps) {
  const locale = useLocale() as LanguageCode;
  const t = useTranslations('map');

  const ancient = pickText(place.ancientName, locale);
  const ancientEn = pickText(place.ancientName, 'en');
  const rawModern = pickText(place.modernName, locale);
  const modern =
    typeof place.modernName === 'string' && rawModern.toLowerCase() === ancientEn.toLowerCase()
      ? ancient
      : rawModern;

  const inferredCountry = inferModernCountry(place.coordinates, locale);
  const country = place.featured ? pickText(place.modernCountry, locale) : inferredCountry.name;
  const countryCode = place.featured ? place.modernCountryCode : inferredCountry.code;
  const placeTypeLabel = localizePlaceType(place.placeType, locale);

  const summary = place.featured
    ? pickText(place.commentary.summary, locale)
    : formatLocalizedSummary(
        ancient,
        modern,
        country,
        placeTypeLabel,
        place.verseCount ?? place.keyVerses.length,
        locale
      );

  const geography = pickText(place.commentary.geography, locale);
  const biblicalEvents = pickText(place.commentary.biblicalEvents, locale);
  const modernContext = pickText(place.commentary.modernContext, locale);

  return (
    <div className="space-y-4">
      {/* Ancient <-> Modern Comparison Banner */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-60">
              {t('ancientName')}
            </span>
            <span className="text-lg font-bold">{ancient}</span>
            <span className="block text-[11px] opacity-60">{placeTypeLabel}</span>
          </div>

          <ArrowRight className="h-5 w-5 text-amber-600 rtl:rotate-180" />

          <div className="text-end">
            <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-60">
              {t('modernLocation')}
            </span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {modern}
            </span>
            <span className="block text-xs font-medium opacity-75">
              {country}{countryCode ? ` (${countryCode})` : ''}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs opacity-75" style={{ borderColor: 'var(--border-subtle)' }}>
          <span>
            {t('confidence')}: <strong>{t(`confidence_${place.confidence}`)}</strong>
          </span>
          <span className="font-mono">
            {place.coordinates[1].toFixed(3)}°N, {place.coordinates[0].toFixed(3)}°E
          </span>
        </div>
      </div>

      {/* Commentary Sections */}
      <div className="space-y-3 text-sm leading-relaxed">
        {summary && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-70">
              <Globe2 className="h-3.5 w-3.5 text-amber-600" />
              {t('summary')}
            </h4>
            <p>{summary}</p>
          </div>
        )}

        {geography && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-70">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              {t('geography')}
            </h4>
            <p>{geography}</p>
          </div>
        )}

        {biblicalEvents && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-70">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              {t('biblicalEvents')}
            </h4>
            <p>{biblicalEvents}</p>
          </div>
        )}

        {modernContext && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-70">
              <Landmark className="h-3.5 w-3.5 text-purple-600" />
              {t('modernContext')}
            </h4>
            <p>{modernContext}</p>
          </div>
        )}
      </div>

      {/* Key Verses (Localized book names!) */}
      {place.keyVerses.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">
            {t('keyVerses')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {place.keyVerses.map((kv, i) => {
              const bookMeta = BIBLE_BOOKS.find((b) => b.id === kv.bookId);
              const bookTitle = bookMeta?.names[locale] ?? kv.bookId;
              const customLabel = place.featured && kv.label ? ` — ${pickText(kv.label, locale)}` : '';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onJumpToVerse?.(kv.bookId, kv.chapter)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 cursor-pointer"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {bookTitle} {kv.chapter}:{kv.verse}{customLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

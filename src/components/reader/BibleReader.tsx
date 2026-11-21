'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Info, Columns3, AlignJustify, MapPin } from 'lucide-react';
import type { BibleChapter, BibleVersionId, HighlightColor, LanguageCode } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import { BIBLE_BOOKS, BIBLE_VERSIONS, LANGUAGE_META } from '@/lib/bible-versions';
import { useReaderStore } from '@/store/useReaderStore';
import { db, type BookmarkRecord, type HighlightRecord, type NoteRecord } from '@/lib/db/dexie';
import { VerseRenderer } from './VerseRenderer';
import placesData from '@/data/geo/places.json';

const allPlaces = placesData as BiblicalPlace[];

export function BibleReader() {
  const t = useTranslations('reader');
  const locale = useLocale() as LanguageCode;
  const {
    bookId,
    chapter,
    version,
    fontSize,
    lineHeight,
    fontFamily,
    writingModeOverrides,
    hydrated,
    hydrateFromDb,
    setLocation,
    setVersion,
    toggleWritingMode,
    openPlaceOnMap,
  } = useReaderStore();

  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkRecord>>({});
  const [highlights, setHighlights] = useState<Record<string, HighlightRecord>>({});
  const [notes, setNotes] = useState<Record<string, NoteRecord>>({});
  const verticalContainerRef = useRef<HTMLDivElement | null>(null);

  const langMeta = LANGUAGE_META[locale];
  const writingMode = writingModeOverrides[locale] ?? langMeta.defaultWritingMode;
  const isVertical = writingMode === 'vertical-rl';

  // Available versions: current language's PD version + all 4 English versions (NIV, ESV, NRSV, KJV)
  const availableVersions: BibleVersionId[] = Array.from(
    new Set<BibleVersionId>([langMeta.defaultVersion, 'KJV', 'NIV', 'ESV', 'NRSV'])
  );

  useEffect(() => {
    hydrateFromDb(locale);
  }, [locale, hydrateFromDb]);

  // Load chapter (online first, fallback to IndexedDB cache for PD versions)
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const cacheKey = `${version}.${bookId}.${chapter}`;
      const meta = BIBLE_VERSIONS[version];

      try {
        const res = await fetch(`/api/bible/${version}/${bookId}/${chapter}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = (await res.json()) as BibleChapter;
        if (!cancelled) {
          setChapterData(data);
          setLoading(false);
        }
        if (db && meta?.allowOfflineCache && !data.fallbackNotice) {
          db.cachedChapters.put({ cacheKey, data, cachedAt: Date.now() }).catch(() => {});
        }
      } catch {
        if (db && meta?.allowOfflineCache) {
          const cached = await db.cachedChapters.get(cacheKey);
          if (cached && !cancelled) {
            setChapterData(cached.data);
            setLoading(false);
            return;
          }
        }
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [version, bookId, chapter, hydrated]);

  // Load bookmarks, highlights, notes for current chapter
  const reloadAnnotations = async () => {
    if (!db) return;
    const [bms, hls, nts] = await Promise.all([
      db.bookmarks.where({ bookId, chapter }).toArray(),
      db.highlights.where({ bookId, chapter }).toArray(),
      db.notes.where({ bookId, chapter }).toArray(),
    ]);
    setBookmarks(Object.fromEntries(bms.map((b) => [b.refKey, b])));
    setHighlights(Object.fromEntries(hls.map((h) => [h.refKey, h])));
    setNotes(Object.fromEntries(nts.map((n) => [n.refKey, n])));
  };

  useEffect(() => {
    reloadAnnotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter]);

  // Map vertical mouse wheel to horizontal scroll in vertical-rl mode
  useEffect(() => {
    const el = verticalContainerRef.current;
    if (!el || !isVertical) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft -= e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isVertical]);

  const currentBookMeta = BIBLE_BOOKS.find((b) => b.id === bookId) ?? BIBLE_BOOKS[0];

  const getFontStack = () => {
    if (fontFamily === 'sans') return 'var(--font-inter), system-ui, sans-serif';
    if (locale === 'ar') return 'var(--font-amiri), serif';
    if (locale === 'ja') return 'var(--font-noto-serif-jp), serif';
    if (locale === 'ko') return 'var(--font-noto-serif-kr), serif';
    return 'var(--font-noto-serif), Georgia, serif';
  };

  // Collect unique places mentioned in this chapter for quick-access pills
  const chapterPlaceIds = Array.from(
    new Set(chapterData?.verses.flatMap((v) => v.placeIds ?? []) ?? [])
  );
  const chapterPlaces = chapterPlaceIds
    .map((id) => allPlaces.find((p) => p.id === id))
    .filter((p): p is BiblicalPlace => Boolean(p));

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: Book, Chapter, Version, Writing Mode Toggle */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Book Selector */}
          <select
            value={bookId}
            onChange={(e) => {
              const nextBook = e.target.value;
              const defaultChap = nextBook === 'ACT' ? 9 : nextBook === 'MAT' ? 2 : nextBook === 'PSA' ? 23 : 1;
              setLocation(nextBook, defaultChap);
            }}
            aria-label={t('book')}
            className="rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-page)',
            }}
          >
            {BIBLE_BOOKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.names[locale] ?? b.names.en}
              </option>
            ))}
          </select>

          {/* Chapter Selector */}
          <select
            value={chapter}
            onChange={(e) => setLocation(bookId, Number(e.target.value))}
            aria-label={t('chapter')}
            className="rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-page)',
            }}
          >
            {Array.from({ length: currentBookMeta.chapters }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Version Selector (Includes NIV, ESV, NRSV, KJV) */}
          <select
            value={version}
            onChange={(e) => setVersion(locale, e.target.value as BibleVersionId)}
            aria-label={t('version')}
            className="rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            {availableVersions.map((vId) => (
              <option key={vId} value={vId}>
                {BIBLE_VERSIONS[vId].abbreviation} — {BIBLE_VERSIONS[vId].name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Vertical / Horizontal Toggle for Japanese & Traditional Chinese */}
          {langMeta.supportsVerticalToggle && (
            <button
              type="button"
              onClick={() => toggleWritingMode(locale)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: isVertical ? 'var(--accent-soft)' : 'var(--bg-page)',
              }}
            >
              {isVertical ? <AlignJustify className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}
              <span>{isVertical ? t('horizontalMode') : t('verticalMode')}</span>
            </button>
          )}

          {/* Prev / Next Chapter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={chapter <= 1}
              onClick={() => setLocation(bookId, Math.max(1, chapter - 1))}
              className="rounded-lg border p-1.5 disabled:opacity-30"
              style={{ borderColor: 'var(--border-subtle)' }}
              aria-label={t('prevChapter')}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              disabled={chapter >= currentBookMeta.chapters}
              onClick={() => setLocation(bookId, Math.min(currentBookMeta.chapters, chapter + 1))}
              className="rounded-lg border p-1.5 disabled:opacity-30"
              style={{ borderColor: 'var(--border-subtle)' }}
              aria-label={t('nextChapter')}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* API Key Fallback Notice for NIV / ESV / NRSV */}
      {chapterData?.fallbackNotice && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs"
          style={{
            borderColor: 'var(--place-underline)',
            backgroundColor: 'var(--accent-soft)',
          }}
        >
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">{t('apiFallbackTitle', { version })}</p>
              <p className="opacity-80">{t('apiFallbackDesc', { version })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVersion(locale, 'KJV')}
            className="rounded-lg px-3 py-1.5 font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {t('switchToKjv')}
          </button>
        </div>
      )}

      {/* Chapter Places Quick Pills */}
      {chapterPlaces.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="opacity-70">{t('placeHint')}:</span>
          {chapterPlaces.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openPlaceOnMap(p.id)}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium transition hover:opacity-80 cursor-pointer"
              style={{
                borderColor: 'var(--place-underline)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <MapPin className="h-3 w-3 text-amber-600" />
              <span>{p.ancientName[locale]}</span>
              <span className="opacity-50">→</span>
              <span className="opacity-80">{p.modernName[locale]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Scripture Content Card */}
      <article
        ref={verticalContainerRef}
        className={`rounded-2xl border p-6 sm:p-10 shadow-sm ${isVertical ? 'reader-vertical-rl' : ''}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          fontSize: `${fontSize}px`,
          lineHeight,
          fontFamily: getFontStack(),
        }}
      >
        {loading ? (
          <p className="py-12 text-center text-sm opacity-60">{t('loading')}</p>
        ) : (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight">
              {chapterData?.bookName} {chapterData?.chapter}
              <span className="ms-2 text-xs font-normal opacity-50">
                ({BIBLE_VERSIONS[version].abbreviation})
              </span>
            </h1>

            <div className={isVertical ? '' : 'space-y-3'}>
              {chapterData?.verses.map((v) => {
                const refKey = `${bookId}.${chapter}.${v.verse}`;
                return (
                  <p key={v.verse} className={isVertical ? 'inline' : ''}>
                    <VerseRenderer
                      bookId={bookId}
                      chapter={chapter}
                      verse={v}
                      places={allPlaces}
                      isBookmarked={Boolean(bookmarks[refKey])}
                      highlightColor={highlights[refKey]?.color}
                      hasNote={Boolean(notes[refKey])}
                      existingNote={notes[refKey]?.body}
                      onToggleBookmark={async () => {
                        if (!db) return;
                        if (bookmarks[refKey]) {
                          await db.bookmarks.where({ refKey }).delete();
                        } else {
                          await db.bookmarks.put({
                            refKey,
                            bookId,
                            chapter,
                            verse: v.verse,
                            snippet: v.text,
                            createdAt: Date.now(),
                          });
                        }
                        reloadAnnotations();
                      }}
                      onSetHighlight={async (color: HighlightColor | null) => {
                        if (!db) return;
                        if (!color) {
                          await db.highlights.where({ refKey }).delete();
                        } else {
                          await db.highlights.put({
                            refKey,
                            bookId,
                            chapter,
                            verse: v.verse,
                            color,
                            createdAt: Date.now(),
                          });
                        }
                        reloadAnnotations();
                      }}
                      onSaveNote={async (body: string) => {
                        if (!db) return;
                        if (!body.trim()) {
                          await db.notes.where({ refKey }).delete();
                        } else {
                          await db.notes.put({
                            refKey,
                            bookId,
                            chapter,
                            verse: v.verse,
                            body: body.trim(),
                            updatedAt: Date.now(),
                          });
                        }
                        reloadAnnotations();
                      }}
                    />
                  </p>
                );
              })}
            </div>

            <footer className="mt-8 border-t pt-4 text-xs opacity-50" style={{ borderColor: 'var(--border-subtle)' }}>
              {chapterData?.copyright}
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

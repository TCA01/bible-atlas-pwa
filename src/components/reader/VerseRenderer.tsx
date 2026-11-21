'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Bookmark, Highlighter, StickyNote, Check } from 'lucide-react';
import type { BibleVerse, HighlightColor, LanguageCode } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import { useReaderStore } from '@/store/useReaderStore';
import { getPlaceAliases, pickText } from '@/lib/geo-utils';

interface VerseRendererProps {
  bookId: string;
  chapter: number;
  verse: BibleVerse;
  places: BiblicalPlace[];
  isBookmarked: boolean;
  highlightColor?: HighlightColor;
  hasNote: boolean;
  onToggleBookmark: () => void;
  onSetHighlight: (color: HighlightColor | null) => void;
  onSaveNote: (body: string) => void;
  existingNote?: string;
}

const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: 'rgba(250, 204, 21, 0.32)',
  green: 'rgba(74, 222, 128, 0.28)',
  blue: 'rgba(96, 165, 250, 0.28)',
  pink: 'rgba(244, 114, 182, 0.28)',
};

export function VerseRenderer({
  verse,
  places,
  isBookmarked,
  highlightColor,
  hasNote,
  onToggleBookmark,
  onSetHighlight,
  onSaveNote,
  existingNote = '',
}: VerseRendererProps) {
  const locale = useLocale() as LanguageCode;
  const tStudy = useTranslations('study');
  const { showPlaces, openPlaceOnMap, selectedPlaceId } = useReaderStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(existingNote);

  // Build segments highlighting biblical place names in the current language
  const renderTextWithPlaces = () => {
    if (!showPlaces || !verse.placeIds || verse.placeIds.length === 0) {
      return verse.text;
    }

    const matchedPlaces = verse.placeIds
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is BiblicalPlace => Boolean(p));

    if (matchedPlaces.length === 0) return verse.text;

    const aliasMap: Array<{ alias: string; place: BiblicalPlace }> = [];
    for (const p of matchedPlaces) {
      const aliases = getPlaceAliases(p, locale);
      for (const a of aliases) {
        if (a) aliasMap.push({ alias: a, place: p });
      }
    }

    if (aliasMap.length === 0) return verse.text;

    // Sort longest first to avoid partial match collisions
    aliasMap.sort((a, b) => b.alias.length - a.alias.length);
    const escaped = aliasMap.map((m) => m.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = verse.text.split(regex);

    return parts.map((part, idx) => {
      const found = aliasMap.find((m) => m.alias.toLowerCase() === part.toLowerCase());
      if (!found) return <span key={idx}>{part}</span>;
      const isSelected = selectedPlaceId === found.place.id;
      return (
        <button
          key={idx}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPlaceOnMap(found.place.id);
          }}
          className="inline-flex items-baseline gap-0.5 rounded px-0.5 font-medium underline decoration-2 underline-offset-4 transition hover:opacity-80 cursor-pointer"
          style={{
            textDecorationColor: 'var(--place-underline)',
            backgroundColor: isSelected ? 'var(--accent-soft)' : 'transparent',
          }}
          title={`${pickText(found.place.ancientName, locale)} → ${pickText(found.place.modernName, locale)}`}
        >
          <span>{part}</span>
          <MapPin className="inline h-3 w-3 shrink-0 text-amber-600" />
        </button>
      );
    });
  };

  return (
    <span
      className="verse-block relative inline"
      style={{
        backgroundColor: highlightColor ? HIGHLIGHT_BG[highlightColor] : 'transparent',
        borderRadius: '4px',
        paddingInline: highlightColor ? '2px' : undefined,
      }}
    >
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="verse-number me-1.5 inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs font-bold opacity-60 transition hover:opacity-100 cursor-pointer"
        style={{
          color: isBookmarked ? 'var(--place-underline)' : 'var(--accent)',
          backgroundColor: menuOpen ? 'var(--accent-soft)' : 'transparent',
        }}
        title="Bookmark, Highlight, Note"
      >
        <span>{verse.verse}</span>
        {isBookmarked && <Bookmark className="h-2.5 w-2.5 fill-current" />}
        {hasNote && <StickyNote className="h-2.5 w-2.5" />}
      </button>

      <span>{renderTextWithPlaces()}</span>{' '}

      {menuOpen && (
        <span
          className="my-2 block rounded-xl border p-3 text-xs shadow-lg"
          style={{
            writingMode: 'horizontal-tb',
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <span className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onToggleBookmark();
                setMenuOpen(false);
              }}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1 font-medium"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? tStudy('removeBookmark') : tStudy('addBookmark')}</span>
            </button>

            <span className="flex items-center gap-1 rounded-lg border px-2 py-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <Highlighter className="h-3.5 w-3.5 opacity-60" />
              {(['yellow', 'green', 'blue', 'pink'] as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onSetHighlight(highlightColor === c ? null : c);
                    setMenuOpen(false);
                  }}
                  className="h-4 w-4 rounded-full border border-black/20"
                  style={{ backgroundColor: HIGHLIGHT_BG[c].replace('0.32', '0.9').replace('0.28', '0.9') }}
                  aria-label={`Highlight ${c}`}
                />
              ))}
            </span>

            <button
              type="button"
              onClick={() => {
                setNoteDraft(existingNote);
                setNoteOpen((v) => !v);
              }}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1 font-medium"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>{tStudy('addNote')}</span>
            </button>
          </span>

          {noteOpen && (
            <span className="mt-2 block space-y-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder={tStudy('notePlaceholder')}
                rows={2}
                className="w-full rounded-lg border p-2 text-xs outline-none"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-page)',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  onSaveNote(noteDraft);
                  setNoteOpen(false);
                  setMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check className="h-3 w-3" />
                <span>{tStudy('saveNote')}</span>
              </button>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Bookmark, Highlighter, StickyNote, Trash2 } from 'lucide-react';
import { useReaderStore } from '@/store/useReaderStore';
import { db, type BookmarkRecord, type HighlightRecord, type NoteRecord } from '@/lib/db/dexie';

export function StudyDrawer() {
  const t = useTranslations('study');
  const { isStudyOpen, setStudyOpen, setLocation } = useReaderStore();
  const [tab, setTab] = useState<'bookmarks' | 'highlights' | 'notes'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [highlights, setHighlights] = useState<HighlightRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);

  const loadAll = async () => {
    if (!db) return;
    const [b, h, n] = await Promise.all([
      db.bookmarks.orderBy('createdAt').reverse().toArray(),
      db.highlights.orderBy('createdAt').reverse().toArray(),
      db.notes.orderBy('updatedAt').reverse().toArray(),
    ]);
    setBookmarks(b);
    setHighlights(h);
    setNotes(n);
  };

  useEffect(() => {
    if (isStudyOpen) loadAll();
  }, [isStudyOpen]);

  if (!isStudyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div
        className="flex h-full w-full max-w-md flex-col border-s shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-bold">{t('title')}</h2>
          <button type="button" onClick={() => setStudyOpen(false)} className="rounded-lg p-1 hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 border-b p-2 text-xs font-semibold" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setTab('bookmarks')}
            className="flex items-center justify-center gap-1 rounded-lg py-2"
            style={tab === 'bookmarks' ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>{t('bookmarks')} ({bookmarks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('highlights')}
            className="flex items-center justify-center gap-1 rounded-lg py-2"
            style={tab === 'highlights' ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>{t('highlights')} ({highlights.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('notes')}
            className="flex items-center justify-center gap-1 rounded-lg py-2"
            style={tab === 'notes' ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span>{t('notes')} ({notes.length})</span>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          {tab === 'bookmarks' && (
            bookmarks.length === 0 ? <p className="py-8 text-center text-xs opacity-60">{t('empty')}</p> :
            bookmarks.map((b) => (
              <div key={b.refKey} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="mb-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(b.bookId, b.chapter);
                      setStudyOpen(false);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {b.bookId} {b.chapter}:{b.verse}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await db.bookmarks.where({ refKey: b.refKey }).delete();
                      loadAll();
                    }}
                    className="opacity-50 hover:opacity-100"
                    aria-label={t('delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="line-clamp-2 text-xs opacity-80">{b.snippet}</p>
              </div>
            ))
          )}

          {tab === 'highlights' && (
            highlights.length === 0 ? <p className="py-8 text-center text-xs opacity-60">{t('empty')}</p> :
            highlights.map((h) => (
              <div key={h.refKey} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(h.bookId, h.chapter);
                    setStudyOpen(false);
                  }}
                  className="font-bold hover:underline"
                >
                  {h.bookId} {h.chapter}:{h.verse} ({h.color})
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await db.highlights.where({ refKey: h.refKey }).delete();
                    loadAll();
                  }}
                  className="opacity-50 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}

          {tab === 'notes' && (
            notes.length === 0 ? <p className="py-8 text-center text-xs opacity-60">{t('empty')}</p> :
            notes.map((n) => (
              <div key={n.refKey} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="mb-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(n.bookId, n.chapter);
                      setStudyOpen(false);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {n.bookId} {n.chapter}:{n.verse}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await db.notes.where({ refKey: n.refKey }).delete();
                      loadAll();
                    }}
                    className="opacity-50 hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-xs opacity-85">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

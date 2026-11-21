import Dexie, { type Table } from 'dexie';
import type {
  BibleChapter,
  BibleVersionId,
  HighlightColor,
  LanguageCode,
  ReaderFontFamily,
  ReaderTheme,
  WritingMode,
} from '@/types/bible';

export interface UserPreferencesRecord {
  id: string; // 'user_prefs'
  fontSize: number;
  lineHeight: number;
  fontFamily: ReaderFontFamily;
  theme: ReaderTheme;
  showPlaces: boolean;
  writingModeOverrides: Partial<Record<LanguageCode, WritingMode>>;
  preferredVersions: Partial<Record<LanguageCode, BibleVersionId>>;
}

export interface BookmarkRecord {
  id?: number;
  refKey: string; // e.g., "ACT.9.3"
  bookId: string;
  chapter: number;
  verse: number;
  snippet: string;
  createdAt: number;
}

export interface HighlightRecord {
  id?: number;
  refKey: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: number;
}

export interface NoteRecord {
  id?: number;
  refKey: string;
  bookId: string;
  chapter: number;
  verse: number;
  body: string;
  updatedAt: number;
}

export interface CachedChapterRecord {
  cacheKey: string; // `${version}.${bookId}.${chapter}`
  data: BibleChapter;
  cachedAt: number;
}

class LogosAtlasDB extends Dexie {
  preferences!: Table<UserPreferencesRecord, string>;
  bookmarks!: Table<BookmarkRecord, number>;
  highlights!: Table<HighlightRecord, number>;
  notes!: Table<NoteRecord, number>;
  cachedChapters!: Table<CachedChapterRecord, string>;

  constructor() {
    super('LogosAtlasDB');
    this.version(1).stores({
      preferences: 'id',
      bookmarks: '++id, &refKey, bookId, chapter, createdAt',
      highlights: '++id, &refKey, bookId, chapter, color, createdAt',
      notes: '++id, &refKey, bookId, chapter, updatedAt',
      cachedChapters: 'cacheKey, cachedAt',
    });
  }
}

export const db = typeof window !== 'undefined' ? new LogosAtlasDB() : (null as unknown as LogosAtlasDB);

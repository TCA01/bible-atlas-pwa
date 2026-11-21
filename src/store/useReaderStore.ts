import { create } from 'zustand';
import type {
  BibleVersionId,
  LanguageCode,
  ReaderFontFamily,
  ReaderTheme,
  WritingMode,
} from '@/types/bible';
import { LANGUAGE_META } from '@/lib/bible-versions';
import { db } from '@/lib/db/dexie';

interface ReaderState {
  bookId: string;
  chapter: number;
  version: BibleVersionId;
  fontSize: number;
  lineHeight: number;
  fontFamily: ReaderFontFamily;
  theme: ReaderTheme;
  showPlaces: boolean;
  writingModeOverrides: Partial<Record<LanguageCode, WritingMode>>;
  preferredVersions: Partial<Record<LanguageCode, BibleVersionId>>;
  selectedPlaceId: string | null;
  isMapOpen: boolean;
  isStudyOpen: boolean;
  isTypographyOpen: boolean;
  hydrated: boolean;

  hydrateFromDb: (locale: LanguageCode) => Promise<void>;
  setLocation: (bookId: string, chapter: number) => void;
  setVersion: (locale: LanguageCode, version: BibleVersionId) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (lh: number) => void;
  setFontFamily: (ff: ReaderFontFamily) => void;
  setTheme: (theme: ReaderTheme) => void;
  setShowPlaces: (show: boolean) => void;
  toggleWritingMode: (locale: LanguageCode) => void;
  openPlaceOnMap: (placeId: string) => void;
  closeMap: () => void;
  setStudyOpen: (open: boolean) => void;
  setTypographyOpen: (open: boolean) => void;
}

const persistPrefs = (state: ReaderState) => {
  if (!db) return;
  db.preferences
    .put({
      id: 'user_prefs',
      fontSize: state.fontSize,
      lineHeight: state.lineHeight,
      fontFamily: state.fontFamily,
      theme: state.theme,
      showPlaces: state.showPlaces,
      writingModeOverrides: state.writingModeOverrides,
      preferredVersions: state.preferredVersions,
    })
    .catch(() => {});
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  bookId: 'ACT',
  chapter: 9,
  version: 'KJV',
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  theme: 'light',
  showPlaces: true,
  writingModeOverrides: {},
  preferredVersions: {},
  selectedPlaceId: null,
  isMapOpen: false,
  isStudyOpen: false,
  isTypographyOpen: false,
  hydrated: false,

  hydrateFromDb: async (locale) => {
    const defaultVer = LANGUAGE_META[locale]?.defaultVersion ?? 'KJV';
    if (!db) {
      set({ version: defaultVer, hydrated: true });
      return;
    }
    try {
      const saved = await db.preferences.get('user_prefs');
      if (saved) {
        set({
          fontSize: saved.fontSize,
          lineHeight: saved.lineHeight,
          fontFamily: saved.fontFamily,
          theme: saved.theme,
          showPlaces: saved.showPlaces,
          writingModeOverrides: saved.writingModeOverrides ?? {},
          preferredVersions: saved.preferredVersions ?? {},
          version: saved.preferredVersions?.[locale] ?? defaultVer,
          hydrated: true,
        });
      } else {
        set({ version: defaultVer, hydrated: true });
      }
    } catch {
      set({ version: defaultVer, hydrated: true });
    }
  },

  setLocation: (bookId, chapter) => set({ bookId, chapter }),

  setVersion: (locale, version) => {
    set((s) => {
      const next = {
        ...s,
        version,
        preferredVersions: { ...s.preferredVersions, [locale]: version },
      };
      persistPrefs(next);
      return next;
    });
  },

  setFontSize: (fontSize) => {
    set((s) => {
      const clamped = Math.min(32, Math.max(14, fontSize));
      const next = { ...s, fontSize: clamped };
      persistPrefs(next);
      return next;
    });
  },

  setLineHeight: (lineHeight) => {
    set((s) => {
      const next = { ...s, lineHeight };
      persistPrefs(next);
      return next;
    });
  },

  setFontFamily: (fontFamily) => {
    set((s) => {
      const next = { ...s, fontFamily };
      persistPrefs(next);
      return next;
    });
  },

  setTheme: (theme) => {
    set((s) => {
      const next = { ...s, theme };
      persistPrefs(next);
      return next;
    });
  },

  setShowPlaces: (showPlaces) => {
    set((s) => {
      const next = { ...s, showPlaces };
      persistPrefs(next);
      return next;
    });
  },

  toggleWritingMode: (locale) => {
    const current = get().writingModeOverrides[locale] ?? LANGUAGE_META[locale].defaultWritingMode;
    const toggled: WritingMode = current === 'vertical-rl' ? 'ltr' : 'vertical-rl';
    set((s) => {
      const next = {
        ...s,
        writingModeOverrides: { ...s.writingModeOverrides, [locale]: toggled },
      };
      persistPrefs(next);
      return next;
    });
  },

  openPlaceOnMap: (placeId) => set({ selectedPlaceId: placeId, isMapOpen: true }),
  closeMap: () => set({ isMapOpen: false }),
  setStudyOpen: (isStudyOpen) => set({ isStudyOpen }),
  setTypographyOpen: (isTypographyOpen) => set({ isTypographyOpen }),
}));

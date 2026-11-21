export type LanguageCode =
  | 'en'      // English (Default)
  | 'ko'      // Korean
  | 'ja'      // Japanese
  | 'zh-Hans' // Chinese Simplified
  | 'zh-Hant' // Chinese Traditional
  | 'es'      // Spanish
  | 'pt'      // Portuguese
  | 'fr'      // French
  | 'de'      // German
  | 'ar';     // Arabic

export type WritingMode = 'ltr' | 'rtl' | 'vertical-rl';

export type EnglishVersionId = 'NIV' | 'ESV' | 'NRSV' | 'KJV';

export type BibleVersionId =
  | EnglishVersionId
  | 'KRV'     // Korean Revised Version (PD)
  | 'KOUGO'   // Japanese Kougo-yaku (PD)
  | 'CUVS'    // Chinese Union Version Simplified (PD)
  | 'CUVT'    // Chinese Union Version Traditional (PD)
  | 'RV1909'  // Spanish Reina-Valera 1909 (PD)
  | 'ACF'     // Portuguese Almeida (PD)
  | 'LSG'     // French Louis Segond 1910 (PD)
  | 'LUT1912' // German Luther 1912 (PD)
  | 'SVD';    // Arabic Smith & Van Dyck (PD)

export interface BibleVersionMeta {
  id: BibleVersionId;
  name: string;
  abbreviation: string;
  language: LanguageCode;
  copyrightNotice: string;
  isPublicDomain: boolean;
  allowOfflineCache: boolean;
  providerType: 'local-pd' | 'esv-api' | 'api-bible';
}

export interface BibleVerse {
  verse: number;
  text: string;
  placeIds?: string[];
}

import type { BiblicalPlace } from './geo';

export interface BibleChapter {
  version: BibleVersionId;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  verses: BibleVerse[];
  places?: BiblicalPlace[];
  copyright: string;
  fallbackNotice?: string;
}

export interface BibleProvider {
  readonly id: string;
  supportsVersion(version: BibleVersionId): boolean;
  getChapter(
    version: BibleVersionId,
    bookId: string,
    chapter: number
  ): Promise<BibleChapter>;
}

export type ReaderTheme = 'light' | 'sepia' | 'dark';
export type ReaderFontFamily = 'serif' | 'sans';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

import type { BibleVersionId, BibleVersionMeta, LanguageCode, WritingMode } from '@/types/bible';

export const LANGUAGE_META: Record<
  LanguageCode,
  {
    label: string;
    nativeLabel: string;
    dir: 'ltr' | 'rtl';
    defaultWritingMode: WritingMode;
    supportsVerticalToggle: boolean;
    defaultVersion: BibleVersionId;
  }
> = {
  en: {
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'KJV',
  },
  ko: {
    label: 'Korean',
    nativeLabel: '한국어',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'KRV',
  },
  ja: {
    label: 'Japanese',
    nativeLabel: '日本語',
    dir: 'ltr',
    defaultWritingMode: 'vertical-rl',
    supportsVerticalToggle: true,
    defaultVersion: 'KOUGO',
  },
  'zh-Hans': {
    label: 'Chinese (Simplified)',
    nativeLabel: '简体中文',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'CUVS',
  },
  'zh-Hant': {
    label: 'Chinese (Traditional)',
    nativeLabel: '繁體中文',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: true,
    defaultVersion: 'CUVT',
  },
  es: {
    label: 'Spanish',
    nativeLabel: 'Español',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'RV1909',
  },
  pt: {
    label: 'Portuguese',
    nativeLabel: 'Português',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'ACF',
  },
  fr: {
    label: 'French',
    nativeLabel: 'Français',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'LSG',
  },
  de: {
    label: 'German',
    nativeLabel: 'Deutsch',
    dir: 'ltr',
    defaultWritingMode: 'ltr',
    supportsVerticalToggle: false,
    defaultVersion: 'LUT1912',
  },
  ar: {
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
    defaultWritingMode: 'rtl',
    supportsVerticalToggle: false,
    defaultVersion: 'SVD',
  },
};

export const BIBLE_VERSIONS: Record<BibleVersionId, BibleVersionMeta> = {
  KJV: {
    id: 'KJV',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'en',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  NIV: {
    id: 'NIV',
    name: 'New International Version',
    abbreviation: 'NIV',
    language: 'en',
    copyrightNotice: '© Biblica, Inc. (Requires API.Bible Key)',
    isPublicDomain: false,
    allowOfflineCache: false,
    providerType: 'api-bible',
  },
  ESV: {
    id: 'ESV',
    name: 'English Standard Version',
    abbreviation: 'ESV',
    language: 'en',
    copyrightNotice: '© Crossway (Requires ESV API Key)',
    isPublicDomain: false,
    allowOfflineCache: false,
    providerType: 'esv-api',
  },
  NRSV: {
    id: 'NRSV',
    name: 'New Revised Standard Version',
    abbreviation: 'NRSV',
    language: 'en',
    copyrightNotice: '© National Council of Churches (Requires API.Bible Key)',
    isPublicDomain: false,
    allowOfflineCache: false,
    providerType: 'api-bible',
  },
  KRV: {
    id: 'KRV',
    name: '개역한글판 (Korean Revised Version)',
    abbreviation: '개역한글',
    language: 'ko',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  KOUGO: {
    id: 'KOUGO',
    name: '口語訳聖書 (Kougo-yaku 1955)',
    abbreviation: '口語訳',
    language: 'ja',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  CUVS: {
    id: 'CUVS',
    name: '和合本 简体 (Chinese Union Version)',
    abbreviation: '和合本(简)',
    language: 'zh-Hans',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  CUVT: {
    id: 'CUVT',
    name: '和合本 繁體 (Chinese Union Version)',
    abbreviation: '和合本(繁)',
    language: 'zh-Hant',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  RV1909: {
    id: 'RV1909',
    name: 'Reina-Valera 1909',
    abbreviation: 'RV1909',
    language: 'es',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  ACF: {
    id: 'ACF',
    name: 'Almeida Corrigida Fiel',
    abbreviation: 'ACF',
    language: 'pt',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  LSG: {
    id: 'LSG',
    name: 'Louis Segond 1910',
    abbreviation: 'LSG',
    language: 'fr',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  LUT1912: {
    id: 'LUT1912',
    name: 'Lutherbibel 1912',
    abbreviation: 'LUT1912',
    language: 'de',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
  SVD: {
    id: 'SVD',
    name: 'فاندايك (Smith & Van Dyck)',
    abbreviation: 'SVD',
    language: 'ar',
    copyrightNotice: 'Public Domain',
    isPublicDomain: true,
    allowOfflineCache: true,
    providerType: 'local-pd',
  },
};

export interface BibleBookMeta {
  id: string;
  chapters: number;
  names: Record<LanguageCode, string>;
}

export const BIBLE_BOOKS: BibleBookMeta[] = [
  {
    id: 'GEN',
    chapters: 50,
    names: {
      en: 'Genesis', ko: '창세기', ja: '創世記', 'zh-Hans': '创世记', 'zh-Hant': '創世記',
      es: 'Génesis', pt: 'Gênesis', fr: 'Genèse', de: '1. Mose', ar: 'التكوين',
    },
  },
  {
    id: 'PSA',
    chapters: 150,
    names: {
      en: 'Psalms', ko: '시편', ja: '詩編', 'zh-Hans': '诗篇', 'zh-Hant': '詩篇',
      es: 'Salmos', pt: 'Salmos', fr: 'Psaumes', de: 'Psalmen', ar: 'المزامير',
    },
  },
  {
    id: 'MAT',
    chapters: 28,
    names: {
      en: 'Matthew', ko: '마태복음', ja: 'マタイによる福音書', 'zh-Hans': '马太福音', 'zh-Hant': '馬太福音',
      es: 'Mateo', pt: 'Mateus', fr: 'Matthieu', de: 'Matthäus', ar: 'متى',
    },
  },
  {
    id: 'ACT',
    chapters: 28,
    names: {
      en: 'Acts', ko: '사도행전', ja: '使徒言行録', 'zh-Hans': '使徒行传', 'zh-Hant': '使徒行傳',
      es: 'Hechos', pt: 'Atos', fr: 'Actes', de: 'Apostelgeschichte', ar: 'أعمال الرسل',
    },
  },
];

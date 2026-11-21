import { defineRouting } from 'next-intl/routing';
import type { LanguageCode } from '@/types/bible';

export const LOCALES: LanguageCode[] = [
  'en',
  'ko',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'es',
  'pt',
  'fr',
  'de',
  'ar',
];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localePrefix: 'always',
});

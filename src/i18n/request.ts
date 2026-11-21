import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { LanguageCode } from '@/types/bible';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as LanguageCode)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

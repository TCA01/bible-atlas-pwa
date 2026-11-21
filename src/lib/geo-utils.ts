import type { LanguageCode } from '@/types/bible';
import type { BiblicalPlace, LocalizedValue } from '@/types/geo';

export function pickText(value: LocalizedValue | undefined, locale: LanguageCode): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en ?? '';
}

export function getPlaceAliases(place: BiblicalPlace, locale: LanguageCode): string[] {
  const fromMap = place.aliases?.[locale] ?? place.aliases?.en ?? [];
  const ancient = pickText(place.ancientName, locale);
  const enAncient = pickText(place.ancientName, 'en');
  const set = new Set<string>(fromMap);
  if (ancient) set.add(ancient);
  if (locale === 'en' && enAncient) set.add(enAncient);
  return Array.from(set).filter((s) => s.length >= 2);
}

export function matchesPlaceQuery(place: BiblicalPlace, query: string, locale: LanguageCode): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (pickText(place.ancientName, locale).toLowerCase().includes(q)) return true;
  if (pickText(place.ancientName, 'en').toLowerCase().includes(q)) return true;
  if (pickText(place.modernName, locale).toLowerCase().includes(q)) return true;
  if (pickText(place.modernName, 'en').toLowerCase().includes(q)) return true;
  if (pickText(place.modernCountry, locale).toLowerCase().includes(q)) return true;
  if (place.aliases) {
    for (const arr of Object.values(place.aliases)) {
      if (arr?.some((a) => a.toLowerCase().includes(q))) return true;
    }
  }
  return false;
}

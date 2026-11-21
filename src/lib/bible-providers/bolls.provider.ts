import type { BibleVersionId, LanguageCode } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import placesData from '@/data/geo/places.json';

const allPlaces = placesData as BiblicalPlace[];

// Verified translation short_names from Bolls.life open Bible API
export const BOLLS_TRANSLATION_MAP: Record<BibleVersionId, string> = {
  KJV: 'KJV',
  NIV: 'NIV2011',
  ESV: 'ESV',
  NRSV: 'NRSVCE',
  KRV: 'KRV',
  KOUGO: 'JPKJV',
  CUVS: 'CUNPS',
  CUVT: 'CUV',
  RV1909: 'RV1960',
  ACF: 'ACF11',
  LSG: 'FRLSG',
  LUT1912: 'LUT',
  SVD: 'SVD',
};

function stripBibleHtml(raw: string): string {
  return raw
    // Remove Strong's concordance tags like <S>1234</S>
    .replace(/<S>.*?<\/S>/gi, '')
    // Remove footnote/superscript tags
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    // Convert <br> to space
    .replace(/<br\s*\/?>/gi, ' ')
    // Strip any remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchFromBollsApi(
  version: BibleVersionId,
  bookNum: number,
  chapter: number
): Promise<Array<{ verse: number; text: string }> | null> {
  const slug = BOLLS_TRANSLATION_MAP[version];
  if (!slug) return null;

  try {
    const res = await fetch(`https://bolls.life/get-text/${slug}/${bookNum}/${chapter}/`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const rows = (await res.json()) as Array<{ verse: number; text: string }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;

    return rows
      .filter((r) => typeof r.verse === 'number' && typeof r.text === 'string')
      .map((r) => ({
        verse: r.verse,
        text: stripBibleHtml(r.text),
      }));
  } catch {
    return null;
  }
}

export function detectPlacesInText(text: string, language: LanguageCode): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const place of allPlaces) {
    const aliases = place.aliases[language] ?? place.aliases.en ?? [];
    if (aliases.some((alias) => alias && lower.includes(alias.toLowerCase()))) {
      matched.push(place.id);
    }
  }
  return matched;
}

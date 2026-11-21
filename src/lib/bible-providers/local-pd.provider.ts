import type { BibleChapter, BibleProvider, BibleVersionId, LanguageCode } from '@/types/bible';
import { BIBLE_BOOKS, BIBLE_VERSIONS } from '@/lib/bible-versions';
import chaptersData from '@/data/bible-pd/chapters.json';
import versePlacesData from '@/data/geo/verse-places.json';
import { detectPlacesInText, fetchFromBollsApi } from './bolls.provider';

type ChaptersMap = Record<string, Record<string, Array<{ verse: number; text: string }>>>;
const chapters = chaptersData as ChaptersMap;
const versePlaces = versePlacesData as Record<string, string[]>;

export function attachPlacesToVerses(
  bookId: string,
  chapter: number,
  verses: Array<{ verse: number; text: string }>,
  language: LanguageCode = 'en'
) {
  return verses.map((v) => {
    const key = `${bookId}.${chapter}.${v.verse}`;
    const staticIds = versePlaces[key] ?? [];
    const detectedIds = detectPlacesInText(v.text, language);
    const merged = Array.from(new Set([...staticIds, ...detectedIds]));
    return merged.length > 0 ? { ...v, placeIds: merged } : v;
  });
}

export class LocalPublicDomainProvider implements BibleProvider {
  readonly id = 'local-pd';

  supportsVersion(version: BibleVersionId): boolean {
    const meta = BIBLE_VERSIONS[version];
    return Boolean(meta && meta.providerType === 'local-pd');
  }

  async getChapter(
    version: BibleVersionId,
    bookId: string,
    chapter: number
  ): Promise<BibleChapter> {
    const meta = BIBLE_VERSIONS[version];
    const lang = (meta.language as LanguageCode) ?? 'en';
    const bookMeta = BIBLE_BOOKS.find((b) => b.id === bookId) ?? BIBLE_BOOKS[0];

    // 1. Fetch full 66-book chapter live from open Bolls.life API
    const liveVerses = await fetchFromBollsApi(version, bookMeta.bookNum, chapter);
    if (liveVerses && liveVerses.length > 0) {
      return {
        version,
        bookId: bookMeta.id,
        bookName: bookMeta.names[lang] ?? bookMeta.names.en,
        chapter,
        totalChapters: bookMeta.chapters,
        verses: attachPlacesToVerses(bookMeta.id, chapter, liveVerses, lang),
        copyright: meta.copyrightNotice,
      };
    }

    // 2. Offline fallback to local bundled seed
    const versionChapters = chapters[version] ?? chapters['KJV'];
    const chapterKey = `${bookMeta.id}.${chapter}`;
    const rawVerses = versionChapters[chapterKey];

    const fallbackVerses = rawVerses ?? [
      {
        verse: 1,
        text: `[${meta.abbreviation}] ${bookMeta.names[lang] || bookMeta.names.en} ${chapter} — Offline mode: connect to the internet to load this chapter.`,
      },
    ];

    return {
      version,
      bookId: bookMeta.id,
      bookName: bookMeta.names[lang] ?? bookMeta.names.en,
      chapter,
      totalChapters: bookMeta.chapters,
      verses: attachPlacesToVerses(bookMeta.id, chapter, fallbackVerses, lang),
      copyright: meta.copyrightNotice,
    };
  }
}

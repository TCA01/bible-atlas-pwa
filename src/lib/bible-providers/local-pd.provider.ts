import type { BibleChapter, BibleProvider, BibleVersionId, LanguageCode } from '@/types/bible';
import { BIBLE_BOOKS, BIBLE_VERSIONS } from '@/lib/bible-versions';
import chaptersData from '@/data/bible-pd/chapters.json';
import versePlacesData from '@/data/geo/verse-places.json';

type ChaptersMap = Record<string, Record<string, Array<{ verse: number; text: string }>>>;
const chapters = chaptersData as ChaptersMap;
const versePlaces = versePlacesData as Record<string, string[]>;

export function attachPlacesToVerses(
  bookId: string,
  chapter: number,
  verses: Array<{ verse: number; text: string }>
) {
  return verses.map((v) => {
    const key = `${bookId}.${chapter}.${v.verse}`;
    const placeIds = versePlaces[key];
    return placeIds ? { ...v, placeIds } : v;
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
    const bookMeta = BIBLE_BOOKS.find((b) => b.id === bookId) ?? BIBLE_BOOKS[0];
    const versionChapters = chapters[version] ?? chapters['KJV'];
    const chapterKey = `${bookId}.${chapter}`;
    const rawVerses = versionChapters[chapterKey];

    const fallbackVerses = rawVerses ?? [
      {
        verse: 1,
        text: `[${meta.abbreviation}] ${bookMeta.names[meta.language as LanguageCode] || bookMeta.names.en} ${chapter} — Sample chapter seed not loaded for this chapter yet. Try Acts 9, Matthew 2, Psalm 23, or Genesis 1.`,
      },
    ];

    return {
      version,
      bookId,
      bookName: bookMeta.names[meta.language as LanguageCode] ?? bookMeta.names.en,
      chapter,
      totalChapters: bookMeta.chapters,
      verses: attachPlacesToVerses(bookId, chapter, fallbackVerses),
      copyright: meta.copyrightNotice,
    };
  }
}

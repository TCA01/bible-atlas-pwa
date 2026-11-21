import type { BibleChapter, BibleProvider, BibleVersionId } from '@/types/bible';
import { BIBLE_BOOKS, BIBLE_VERSIONS } from '@/lib/bible-versions';
import { attachPlacesToVerses, LocalPublicDomainProvider } from './local-pd.provider';
import { fetchFromBollsApi } from './bolls.provider';

const API_BIBLE_IDS: Partial<Record<BibleVersionId, string>> = {
  NIV: '78a9f6124f344018-01',
  NRSV: '06125adad2d5898a-01',
};

export class ApiBibleProvider implements BibleProvider {
  readonly id = 'api-bible';
  private fallbackProvider = new LocalPublicDomainProvider();

  supportsVersion(version: BibleVersionId): boolean {
    return version === 'NIV' || version === 'NRSV';
  }

  async getChapter(
    version: BibleVersionId,
    bookId: string,
    chapter: number
  ): Promise<BibleChapter> {
    const apiKey = process.env.API_BIBLE_KEY;
    const bookMeta = BIBLE_BOOKS.find((b) => b.id === bookId) ?? BIBLE_BOOKS[0];
    const bibleId = API_BIBLE_IDS[version];

    // 1. Use official API.Bible when API_BIBLE_KEY is configured
    if (apiKey && bibleId) {
      try {
        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${bookMeta.id}.${chapter}?content-type=text&include-verse-numbers=true`,
          {
            headers: { 'api-key': apiKey },
            next: { revalidate: 3600 },
          }
        );

        if (res.ok) {
          const payload = (await res.json()) as { data?: { content?: string; copyright?: string } };
          const text = payload.data?.content ?? '';
          const parsedVerses: Array<{ verse: number; text: string }> = [];
          const regex = /\[(\d+)\]\s*([^\[]+)/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(text)) !== null) {
            parsedVerses.push({ verse: Number(match[1]), text: match[2].trim() });
          }

          if (parsedVerses.length > 0) {
            return {
              version,
              bookId: bookMeta.id,
              bookName: bookMeta.names.en,
              chapter,
              totalChapters: bookMeta.chapters,
              verses: attachPlacesToVerses(bookMeta.id, chapter, parsedVerses, 'en'),
              copyright: payload.data?.copyright ?? BIBLE_VERSIONS[version].copyrightNotice,
            };
          }
        }
      } catch {
        // fall through to open API
      }
    }

    // 2. Fallback to Bolls.life open NIV/NRSV endpoint (all 66 books)
    const bollsVerses = await fetchFromBollsApi(version, bookMeta.bookNum, chapter);
    if (bollsVerses && bollsVerses.length > 0) {
      return {
        version,
        bookId: bookMeta.id,
        bookName: bookMeta.names.en,
        chapter,
        totalChapters: bookMeta.chapters,
        verses: attachPlacesToVerses(bookMeta.id, chapter, bollsVerses, 'en'),
        copyright: BIBLE_VERSIONS[version].copyrightNotice,
      };
    }

    // 3. Final offline fallback to KJV
    const kjv = await this.fallbackProvider.getChapter('KJV', bookMeta.id, chapter);
    return {
      ...kjv,
      version,
      fallbackNotice: 'API_BIBLE_KEY_MISSING',
    };
  }
}

import type { BibleChapter, BibleProvider, BibleVersionId } from '@/types/bible';
import { BIBLE_BOOKS, BIBLE_VERSIONS } from '@/lib/bible-versions';
import { attachPlacesToVerses, LocalPublicDomainProvider } from './local-pd.provider';
import { fetchFromBollsApi } from './bolls.provider';

export class EsvApiProvider implements BibleProvider {
  readonly id = 'esv-api';
  private fallbackProvider = new LocalPublicDomainProvider();

  supportsVersion(version: BibleVersionId): boolean {
    return version === 'ESV';
  }

  async getChapter(
    _version: BibleVersionId,
    bookId: string,
    chapter: number
  ): Promise<BibleChapter> {
    const apiKey = process.env.ESV_API_KEY;
    const bookMeta = BIBLE_BOOKS.find((b) => b.id === bookId) ?? BIBLE_BOOKS[0];

    // 1. Use official Crossway ESV API when ESV_API_KEY is configured
    if (apiKey) {
      try {
        const query = encodeURIComponent(`${bookMeta.names.en} ${chapter}`);
        const res = await fetch(
          `https://api.esv.org/v3/passage/text/?q=${query}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=true`,
          {
            headers: { Authorization: `Token ${apiKey}` },
            next: { revalidate: 3600 },
          }
        );

        if (res.ok) {
          const data = (await res.json()) as { passages?: string[] };
          const raw = data.passages?.[0] ?? '';
          const parsedVerses: Array<{ verse: number; text: string }> = [];
          const regex = /\[(\d+)\]\s*([^\[]+)/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(raw)) !== null) {
            parsedVerses.push({ verse: Number(match[1]), text: match[2].trim() });
          }

          if (parsedVerses.length > 0) {
            return {
              version: 'ESV',
              bookId: bookMeta.id,
              bookName: bookMeta.names.en,
              chapter,
              totalChapters: bookMeta.chapters,
              verses: attachPlacesToVerses(bookMeta.id, chapter, parsedVerses, 'en'),
              copyright: BIBLE_VERSIONS.ESV.copyrightNotice,
            };
          }
        }
      } catch {
        // fall through to open API
      }
    }

    // 2. Fallback to Bolls.life open ESV endpoint (all 66 books)
    const bollsVerses = await fetchFromBollsApi('ESV', bookMeta.bookNum, chapter);
    if (bollsVerses && bollsVerses.length > 0) {
      return {
        version: 'ESV',
        bookId: bookMeta.id,
        bookName: bookMeta.names.en,
        chapter,
        totalChapters: bookMeta.chapters,
        verses: attachPlacesToVerses(bookMeta.id, chapter, bollsVerses, 'en'),
        copyright: BIBLE_VERSIONS.ESV.copyrightNotice,
      };
    }

    // 3. Final offline fallback to KJV
    const kjv = await this.fallbackProvider.getChapter('KJV', bookMeta.id, chapter);
    return {
      ...kjv,
      version: 'ESV',
      fallbackNotice: 'ESV_API_KEY_MISSING',
    };
  }
}

import type { BibleChapter, BibleProvider, BibleVersionId } from '@/types/bible';
import { BIBLE_BOOKS, BIBLE_VERSIONS } from '@/lib/bible-versions';
import { attachPlacesToVerses, LocalPublicDomainProvider } from './local-pd.provider';

// Standard API.Bible IDs for NIV & NRSV
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

    if (!apiKey || !bibleId) {
      const kjv = await this.fallbackProvider.getChapter('KJV', bookId, chapter);
      return {
        ...kjv,
        version,
        fallbackNotice: 'API_BIBLE_KEY_MISSING',
      };
    }

    const res = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${bookId}.${chapter}?content-type=text&include-verse-numbers=true`,
      {
        headers: { 'api-key': apiKey },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      const kjv = await this.fallbackProvider.getChapter('KJV', bookId, chapter);
      return { ...kjv, version, fallbackNotice: 'API_BIBLE_ERROR' };
    }

    const payload = (await res.json()) as { data?: { content?: string; copyright?: string } };
    const text = payload.data?.content ?? '';
    const parsedVerses: Array<{ verse: number; text: string }> = [];
    const regex = /\[(\d+)\]\s*([^\[]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      parsedVerses.push({ verse: Number(match[1]), text: match[2].trim() });
    }

    if (parsedVerses.length === 0) {
      const kjv = await this.fallbackProvider.getChapter('KJV', bookId, chapter);
      return { ...kjv, version, fallbackNotice: 'API_BIBLE_PARSE_FALLBACK' };
    }

    return {
      version,
      bookId,
      bookName: bookMeta.names.en,
      chapter,
      totalChapters: bookMeta.chapters,
      verses: attachPlacesToVerses(bookId, chapter, parsedVerses),
      copyright: payload.data?.copyright ?? BIBLE_VERSIONS[version].copyrightNotice,
    };
  }
}

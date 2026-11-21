import { NextResponse } from 'next/server';
import type { BibleVersionId } from '@/types/bible';
import { BIBLE_VERSIONS } from '@/lib/bible-versions';
import { getBibleProvider } from '@/lib/bible-providers/registry';

export async function GET(
  _req: Request,
  context: { params: Promise<{ version: string; book: string; chapter: string }> }
) {
  const { version, book, chapter } = await context.params;
  const upperVersion = version.toUpperCase() as BibleVersionId;

  if (!BIBLE_VERSIONS[upperVersion]) {
    return NextResponse.json({ error: 'Unsupported Bible version' }, { status: 400 });
  }

  const chapterNum = Number(chapter);
  if (!Number.isInteger(chapterNum) || chapterNum < 1) {
    return NextResponse.json({ error: 'Invalid chapter number' }, { status: 400 });
  }

  const provider = getBibleProvider(upperVersion);
  const data = await provider.getChapter(upperVersion, book.toUpperCase(), chapterNum);

  const meta = BIBLE_VERSIONS[upperVersion];
  const cacheHeader = meta.allowOfflineCache
    ? 'public, max-age=86400, stale-while-revalidate=604800'
    : 'private, no-store';

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': cacheHeader,
    },
  });
}

import { NextResponse } from 'next/server';
import type { BibleVersionId } from '@/types/bible';
import type { BiblicalPlace } from '@/types/geo';
import { BIBLE_VERSIONS } from '@/lib/bible-versions';
import { getBibleProvider } from '@/lib/bible-providers/registry';
import placesData from '@/data/geo/places.json';

const placeMap = new Map<string, BiblicalPlace>(
  (placesData as BiblicalPlace[]).map((p) => [p.id, p])
);

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

  // Attach only the places mentioned in this specific chapter (keeps payload tiny & fast!)
  const uniqueIds = Array.from(new Set(data.verses.flatMap((v) => v.placeIds ?? [])));
  const chapterPlaces = uniqueIds
    .map((id) => placeMap.get(id))
    .filter((p): p is BiblicalPlace => Boolean(p));

  const meta = BIBLE_VERSIONS[upperVersion];
  const cacheHeader = meta.allowOfflineCache
    ? 'public, max-age=86400, stale-while-revalidate=604800'
    : 'private, max-age=300';

  return NextResponse.json(
    { ...data, places: chapterPlaces },
    {
      headers: {
        'Cache-Control': cacheHeader,
      },
    }
  );
}

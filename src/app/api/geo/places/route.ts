import { NextResponse } from 'next/server';
import placesData from '@/data/geo/places.json';
import type { BiblicalPlace } from '@/types/geo';
import { matchesPlaceQuery } from '@/lib/geo-utils';

const places = placesData as BiblicalPlace[];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const id = searchParams.get('id')?.trim();

  if (id) {
    const found = places.find((p) => p.id === id);
    if (!found) return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    return NextResponse.json(found);
  }

  if (q) {
    const filtered = places.filter((p) => matchesPlaceQuery(p, q, 'en') || matchesPlaceQuery(p, q, 'ko'));
    return NextResponse.json(filtered.slice(0, 50));
  }

  return NextResponse.json(places);
}

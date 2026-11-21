import { NextResponse } from 'next/server';
import placesData from '@/data/geo/places.json';
import type { BiblicalPlace } from '@/types/geo';

const places = placesData as BiblicalPlace[];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase();
  const id = searchParams.get('id')?.trim();

  if (id) {
    const found = places.find((p) => p.id === id);
    if (!found) return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    return NextResponse.json(found);
  }

  if (q) {
    const filtered = places.filter((p) => {
      const names = [
        ...Object.values(p.ancientName),
        ...Object.values(p.modernName),
        ...Object.values(p.modernCountry),
        ...Object.values(p.aliases).flat(),
      ];
      return names.some((n) => n.toLowerCase().includes(q));
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(places);
}

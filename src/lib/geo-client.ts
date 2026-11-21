import type { BiblicalPlace } from '@/types/geo';

let cachedPlaces: BiblicalPlace[] | null = null;
let inflightPromise: Promise<BiblicalPlace[]> | null = null;

export async function fetchAllPlaces(): Promise<BiblicalPlace[]> {
  if (cachedPlaces) return cachedPlaces;
  if (inflightPromise) return inflightPromise;

  inflightPromise = fetch('/api/geo/places')
    .then((res) => (res.ok ? (res.json() as Promise<BiblicalPlace[]>) : []))
    .then((data) => {
      cachedPlaces = data;
      inflightPromise = null;
      return data;
    })
    .catch(() => {
      inflightPromise = null;
      return [];
    });

  return inflightPromise;
}

export function getCachedPlacesSync(): BiblicalPlace[] {
  return cachedPlaces ?? [];
}

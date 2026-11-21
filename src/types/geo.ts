import type { LanguageCode } from './bible';

export type LocationConfidence = 'certain' | 'probable' | 'uncertain';

export type BiblicalEra =
  | 'patriarchs'
  | 'exodus'
  | 'conquest'
  | 'united_kingdom'
  | 'divided_kingdom'
  | 'gospels'
  | 'apostolic';

export type LocalizedText = Partial<Record<LanguageCode, string>> & { en: string };
export type LocalizedValue = string | LocalizedText;

export interface BiblicalPlace {
  id: string;
  ancientName: LocalizedValue;
  modernName: LocalizedValue;
  modernCountry: LocalizedValue;
  modernCountryCode: string;
  placeType?: string;
  coordinates: [number, number]; // [lng, lat]
  confidence: LocationConfidence;
  verseCount?: number;
  featured?: boolean;
  eras?: BiblicalEra[];
  aliases?: Partial<Record<LanguageCode, string[]>>;
  commentary: {
    summary: LocalizedValue;
    geography?: LocalizedValue;
    biblicalEvents?: LocalizedValue;
    modernContext?: LocalizedValue;
  };
  keyVerses: Array<{
    bookId: string;
    chapter: number;
    verse: number;
    label?: LocalizedValue;
  }>;
}

export interface BiblicalJourney {
  id: string;
  era: BiblicalEra;
  title: LocalizedText;
  description: LocalizedText;
  color: string;
  waypoints: Array<{
    step: number;
    placeId: string;
    title: LocalizedText;
    description: LocalizedText;
    verseRef: { bookId: string; chapter: number; verse: number };
  }>;
  geometry: {
    type: 'LineString';
    coordinates: Array<[number, number]>;
  };
}

export type VersePlaceIndex = Record<string, string[]>;

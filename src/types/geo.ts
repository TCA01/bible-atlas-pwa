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

export type LocalizedText = Record<LanguageCode, string>;

export interface BiblicalPlace {
  id: string;
  ancientName: LocalizedText;
  modernName: LocalizedText;
  modernCountry: LocalizedText;
  modernCountryCode: string;
  coordinates: [number, number]; // [lng, lat]
  confidence: LocationConfidence;
  eras: BiblicalEra[];
  aliases: Record<LanguageCode, string[]>;
  commentary: {
    summary: LocalizedText;
    geography: LocalizedText;
    biblicalEvents: LocalizedText;
    modernContext: LocalizedText;
  };
  keyVerses: Array<{
    bookId: string;
    chapter: number;
    verse: number;
    label: LocalizedText;
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

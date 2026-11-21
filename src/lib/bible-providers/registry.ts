import type { BibleProvider, BibleVersionId } from '@/types/bible';
import { LocalPublicDomainProvider } from './local-pd.provider';
import { EsvApiProvider } from './esv-api.provider';
import { ApiBibleProvider } from './api-bible.provider';

const providers: BibleProvider[] = [
  new LocalPublicDomainProvider(),
  new EsvApiProvider(),
  new ApiBibleProvider(),
];

export function getBibleProvider(version: BibleVersionId): BibleProvider {
  return providers.find((p) => p.supportsVersion(version)) ?? providers[0];
}

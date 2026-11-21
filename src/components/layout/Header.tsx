'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Map, Bookmark, Type, Globe } from 'lucide-react';
import { LANGUAGE_META } from '@/lib/bible-versions';
import { LOCALES } from '@/i18n/routing';
import type { LanguageCode } from '@/types/bible';
import { useReaderStore } from '@/store/useReaderStore';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale() as LanguageCode;
  const pathname = usePathname();
  const router = useRouter();
  const { setStudyOpen, setTypographyOpen, isTypographyOpen } = useReaderStore();

  const isAtlas = pathname.includes('/atlas');

  const handleLocaleChange = (nextLocale: LanguageCode) => {
    const subPath = isAtlas ? '/atlas' : '';
    router.push(`/${nextLocale}${subPath}`);
  };

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
        {/* Brand & Main Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold tracking-tight">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              LA
            </span>
            <span className="hidden sm:inline text-base">LogosAtlas</span>
          </Link>

          <nav className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <Link
              href={`/${locale}`}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                !isAtlas ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={!isAtlas ? { backgroundColor: 'var(--bg-surface)' } : undefined}
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('reader')}</span>
            </Link>
            <Link
              href={`/${locale}/atlas`}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isAtlas ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={isAtlas ? { backgroundColor: 'var(--bg-surface)' } : undefined}
            >
              <Map className="h-4 w-4" />
              <span>{t('atlas')}</span>
            </Link>
          </nav>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setStudyOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
            aria-label={t('study')}
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden md:inline">{t('study')}</span>
          </button>

          {!isAtlas && (
            <button
              type="button"
              onClick={() => setTypographyOpen(!isTypographyOpen)}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: isTypographyOpen ? 'var(--accent-soft)' : 'var(--bg-surface)',
              }}
              aria-label="Typography settings"
            >
              <Type className="h-4 w-4" />
              <span>Aa</span>
            </button>
          )}

          {/* 9-Language Selector */}
          <div className="relative flex items-center">
            <Globe className="pointer-events-none absolute start-2.5 h-4 w-4 opacity-60" />
            <select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value as LanguageCode)}
              aria-label={t('language')}
              className="appearance-none rounded-lg border py-1.5 ps-8 pe-6 text-sm font-medium outline-none cursor-pointer"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              {LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LANGUAGE_META[loc].nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

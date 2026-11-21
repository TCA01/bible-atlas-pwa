'use client';

import { useTranslations, useLocale } from 'next-intl';
import { X, Minus, Plus, MapPin } from 'lucide-react';
import { useReaderStore } from '@/store/useReaderStore';
import { LANGUAGE_META } from '@/lib/bible-versions';
import type { LanguageCode, ReaderTheme } from '@/types/bible';

export function TypographyDrawer() {
  const t = useTranslations('typography');
  const tReader = useTranslations('reader');
  const locale = useLocale() as LanguageCode;
  const {
    isTypographyOpen,
    setTypographyOpen,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
    theme,
    setTheme,
    showPlaces,
    setShowPlaces,
    writingModeOverrides,
    toggleWritingMode,
  } = useReaderStore();

  if (!isTypographyOpen) return null;

  const langMeta = LANGUAGE_META[locale];
  const currentWritingMode = writingModeOverrides[locale] ?? langMeta.defaultWritingMode;

  return (
    <div
      className="fixed inset-x-0 top-14 z-40 mx-auto max-w-md rounded-2xl border p-5 shadow-xl sm:end-6 sm:start-auto sm:w-96"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">{t('title')}</h2>
        <button
          type="button"
          onClick={() => setTypographyOpen(false)}
          className="rounded-lg p-1 hover:opacity-70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Font Size */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-medium opacity-80">{t('fontSize')}</span>
            <span className="font-mono text-xs">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFontSize(fontSize - 2)}
              className="flex h-9 w-12 items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--border-subtle)' }}
              aria-label="Decrease font size"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={14}
              max={32}
              step={2}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-amber-600"
            />
            <button
              type="button"
              onClick={() => setFontSize(fontSize + 2)}
              className="flex h-9 w-12 items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--border-subtle)' }}
              aria-label="Increase font size"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <span className="mb-1.5 block font-medium opacity-80">{t('lineHeight')}</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1.5, label: t('compact') },
              { val: 1.8, label: t('normal') },
              { val: 2.1, label: t('relaxed') },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setLineHeight(opt.val)}
                className="rounded-lg border py-1.5 font-medium transition"
                style={{
                  borderColor: lineHeight === opt.val ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: lineHeight === opt.val ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <span className="mb-1.5 block font-medium opacity-80">{t('fontFamily')}</span>
          <div className="grid grid-cols-2 gap-2">
            {(['serif', 'sans'] as const).map((ff) => (
              <button
                key={ff}
                type="button"
                onClick={() => setFontFamily(ff)}
                className="rounded-lg border py-1.5 font-medium transition"
                style={{
                  borderColor: fontFamily === ff ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: fontFamily === ff ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {t(ff)}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <span className="mb-1.5 block font-medium opacity-80">{t('theme')}</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'light', bg: '#FFFFFF', fg: '#1A1A1A' },
                { id: 'sepia', bg: '#F5EFE6', fg: '#3D3226' },
                { id: 'dark', bg: '#121417', fg: '#E5E7EB' },
              ] as Array<{ id: ReaderTheme; bg: string; fg: string }>
            ).map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setTheme(th.id)}
                className="rounded-lg border py-2 text-xs font-semibold transition"
                style={{
                  backgroundColor: th.bg,
                  color: th.fg,
                  borderColor: theme === th.id ? 'var(--accent)' : 'var(--border-subtle)',
                  outline: theme === th.id ? '2px solid var(--accent)' : 'none',
                }}
              >
                {t(th.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Writing Mode Toggle (Japanese / Traditional Chinese) */}
        {langMeta.supportsVerticalToggle && (
          <div>
            <span className="mb-1.5 block font-medium opacity-80">{t('writingDirection')}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => currentWritingMode !== 'vertical-rl' && toggleWritingMode(locale)}
                className="rounded-lg border py-1.5 font-medium"
                style={{
                  borderColor: currentWritingMode === 'vertical-rl' ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: currentWritingMode === 'vertical-rl' ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {tReader('verticalMode')}
              </button>
              <button
                type="button"
                onClick={() => currentWritingMode === 'vertical-rl' && toggleWritingMode(locale)}
                className="rounded-lg border py-1.5 font-medium"
                style={{
                  borderColor: currentWritingMode !== 'vertical-rl' ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: currentWritingMode !== 'vertical-rl' ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {tReader('horizontalMode')}
              </button>
            </div>
          </div>
        )}

        {/* Show Place Highlights */}
        <label className="flex cursor-pointer items-center justify-between pt-1">
          <span className="flex items-center gap-1.5 font-medium opacity-85">
            <MapPin className="h-4 w-4 text-amber-600" />
            {t('showPlaces')}
          </span>
          <input
            type="checkbox"
            checked={showPlaces}
            onChange={(e) => setShowPlaces(e.target.checked)}
            className="h-4 w-4 accent-amber-600"
          />
        </label>
      </div>
    </div>
  );
}

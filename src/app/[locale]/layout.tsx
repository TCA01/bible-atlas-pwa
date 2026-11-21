import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LANGUAGE_META } from '@/lib/bible-versions';
import type { LanguageCode } from '@/types/bible';
import { Inter, Noto_Serif, Noto_Serif_KR, Noto_Serif_JP, Amiri } from 'next/font/google';
import { PwaRegister } from '@/components/layout/PwaRegister';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const notoSerif = Noto_Serif({ subsets: ['latin'], variable: '--font-noto-serif', display: 'swap' });
const notoSerifKr = Noto_Serif_KR({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-noto-serif-kr', display: 'swap' });
const notoSerifJp = Noto_Serif_JP({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-noto-serif-jp', display: 'swap' });
const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-amiri', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as LanguageCode)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = LANGUAGE_META[locale as LanguageCode]?.dir ?? 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="light"
      className={`${inter.variable} ${notoSerif.variable} ${notoSerifKr.variable} ${notoSerifJp.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <PwaRegister />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

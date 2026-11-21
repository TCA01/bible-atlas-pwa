import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogosAtlas — Global Interactive Bible & Historical Atlas',
  description:
    'Read the Bible in 9 languages with culturally native reading directions, ancient-to-modern place comparisons, and interactive historical maps.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

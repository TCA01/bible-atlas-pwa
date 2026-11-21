'use client';

import { useEffect } from 'react';
import { useReaderStore } from '@/store/useReaderStore';

export function PwaRegister() {
  const theme = useReaderStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}

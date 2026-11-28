'use client';

import { useCallback } from 'react';
import { useLocale } from '@/components/locale-provider';
import type { Copy } from '@/lib/copy';
import { copyText } from './admin-copy';

/**
 * The console's client components read their copy through this hook rather than through
 * TranslatedText, so placeholders, titles, aria-labels and toasts (plain strings, not nodes) are
 * localised the same way as visible text.
 */
export function useAdminCopy<T extends Readonly<Record<string, Copy>>>(table: T) {
  const { locale } = useLocale();
  // Stable per locale, so a component may list it in a hook's dependencies without re-running
  // polling or fetch effects on every render.
  const c = useCallback(
    (key: keyof T & string, values?: Readonly<Record<string, string>>): string =>
      copyText(locale, table[key] as Copy, values),
    [locale, table],
  );
  return { locale, c };
}

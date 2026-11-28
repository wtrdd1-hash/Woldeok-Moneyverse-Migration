'use client';

import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import { BANK_COPY, fill, type BankCopyKey } from './copy';

/**
 * The /bank client components read their copy through this hook rather than through TranslatedText,
 * so placeholders, titles and aria-labels (plain strings, not nodes) are localised the same way.
 */
export function useBankCopy() {
  const { locale } = useLocale();
  function c(key: BankCopyKey, values?: Readonly<Record<string, string>>): string {
    const text = pick(locale, BANK_COPY[key]);
    return values ? fill(text, values) : text;
  }
  return { locale, c };
}

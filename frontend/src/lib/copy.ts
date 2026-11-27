import type { Locale } from './locale';

/**
 * Page copy in all five supported locales (W02). Korean is the carried-over product copy and is never
 * reworded here; English is the default; JA/ZH/VI are complete translations, not fallbacks.
 */
export type Copy = Readonly<Record<Locale, string>>;

export function pick(locale: Locale, copy: Copy): string {
  return copy[locale] || copy.en;
}

const HANGUL = /[가-힣]/;

/** Problems in a page copy table: missing locales, or Korean left in a non-Korean locale. */
export function copyProblems(table: Readonly<Record<string, Copy>>): string[] {
  const problems: string[] = [];
  for (const [key, copy] of Object.entries(table)) {
    for (const locale of ['ko', 'en', 'ja', 'zh', 'vi'] as const) {
      const text = copy[locale];
      if (typeof text !== 'string' || !text.trim()) problems.push(`${key}.${locale} missing`);
      else if (locale !== 'ko' && HANGUL.test(text)) problems.push(`${key}.${locale} contains Korean`);
    }
  }
  return problems;
}

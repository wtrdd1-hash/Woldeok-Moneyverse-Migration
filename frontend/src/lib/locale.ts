export type Locale = 'ko' | 'en' | 'ja' | 'zh';

export const DEFAULT_LOCALE: Locale = 'ko';
export const LOCALE_COOKIE = 'wdmv_locale';
export const DETECTED_LOCALE_COOKIE = 'wdmv_detected_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ko' || value === 'en' || value === 'ja' || value === 'zh';
}

export function detectLocale(country: string | null, acceptLanguage: string | null): Locale {
  const normalisedCountry = country?.trim().toUpperCase();
  if (normalisedCountry === 'KR') return 'ko';
  if (normalisedCountry === 'JP') return 'ja';
  if (['CN', 'TW', 'HK'].includes(normalisedCountry || '')) return 'zh';
  if (normalisedCountry && !['XX', 'T1'].includes(normalisedCountry)) return 'en';

  const preferredLanguage = acceptLanguage?.split(',')[0]?.trim().toLowerCase();
  if (preferredLanguage?.startsWith('ko')) return 'ko';
  if (preferredLanguage?.startsWith('ja')) return 'ja';
  if (preferredLanguage?.startsWith('zh')) return 'zh';
  if (preferredLanguage?.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const langs = (navigator.languages && navigator.languages.length > 0) ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    if (!lang) continue;
    const l = lang.toLowerCase();
    if (l.startsWith('ko')) return 'ko';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('zh')) return 'zh';
    if (l.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function localeLabel(
  locale: Locale,
  korean: string,
  english: string,
  japanese?: string,
  chinese?: string
): string {
  if (locale === 'ja') return japanese || english;
  if (locale === 'zh') return chinese || english;
  if (locale === 'en') return english;
  return korean;
}

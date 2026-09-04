import { cookies } from 'next/headers';

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';
export const LOCALE_COOKIE = 'wdmv_locale';
export const DETECTED_LOCALE_COOKIE = 'wdmv_detected_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ko' || value === 'en';
}

export function detectLocale(country: string | null, acceptLanguage: string | null): Locale {
  const normalisedCountry = country?.trim().toUpperCase();
  if (normalisedCountry === 'KR') return 'ko';
  if (normalisedCountry && !['XX', 'T1'].includes(normalisedCountry)) return 'en';

  const preferredLanguage = acceptLanguage?.split(',')[0]?.trim().toLowerCase();
  if (preferredLanguage?.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

export function localeLabel(locale: Locale, korean: string, english: string): string {
  return locale === 'en' ? english : korean;
}

/**
 * Server-side helper to read the current request's active locale from cookies.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const explicit = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(explicit)) return explicit;
  const detected = cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  if (isLocale(detected)) return detected;
  return DEFAULT_LOCALE;
}

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

export const DEFAULT_LOCALE: Locale = 'ko';
export const SUPPORTED_LOCALES: readonly Locale[] = ['ko', 'en', 'ja', 'zh'] as const;
export const LOCALE_COOKIE = 'wdmv_locale';
export const DETECTED_LOCALE_COOKIE = 'wdmv_detected_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ko' || value === 'en' || value === 'ja' || value === 'zh';
}

/**
 * ISO 3166-1 alpha-2 country codes mapped to primary localized language.
 * Korean: KR (South Korea), KP (North Korea)
 * Japanese: JP (Japan)
 * Chinese (Simplified/Regional): CN (China), TW (Taiwan), HK (Hong Kong), MO (Macau), SG (Singapore)
 * English (Global default): All other global countries (US, GB, CA, AU, NZ, DE, FR, VN, TH, PH, IN, BR, RU, etc.)
 */
const KOREAN_COUNTRIES = new Set(['KR', 'KP']);
const JAPANESE_COUNTRIES = new Set(['JP']);
const CHINESE_COUNTRIES = new Set(['CN', 'TW', 'HK', 'MO', 'SG']);

/**
 * Parse Accept-Language header taking quality values (q-factor) into account.
 * Example: "ja,ja-JP;q=0.9,en-US;q=0.8,en;q=0.7"
 */
export function parseAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header || typeof header !== 'string') return null;

  const entries = header
    .split(',')
    .map((item) => {
      const parts = item.trim().split(';');
      const lang = parts[0]?.trim().toLowerCase() || '';
      let q = 1.0;
      if (parts[1]) {
        const qMatch = parts[1].match(/q=([0-9.]+)/i);
        if (qMatch && qMatch[1]) {
          const parsedQ = parseFloat(qMatch[1]);
          if (!isNaN(parsedQ)) q = parsedQ;
        }
      }
      return { lang, q };
    })
    .filter((e) => e.lang.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { lang } of entries) {
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('en')) return 'en';
  }

  // If client sends unsupported languages (e.g. fr, de, es, vi, ru, th), fall back to English
  return 'en';
}

/**
 * Precise hybrid locale detection:
 * 1. GeoIP country code (Cloudflare `cf-ipcountry` / Vercel `x-vercel-ip-country` / `x-country-code`)
 * 2. Accept-Language header quality-weighted preferences
 * 3. Default fallback to English ('en') for all unsupported countries & languages.
 */
export function detectLocale(country: string | null | undefined, acceptLanguage: string | null | undefined): Locale {
  const normalisedCountry = country?.trim().toUpperCase();

  // 1. Explicit GeoIP country matching
  if (normalisedCountry) {
    if (KOREAN_COUNTRIES.has(normalisedCountry)) return 'ko';
    if (JAPANESE_COUNTRIES.has(normalisedCountry)) return 'ja';
    if (CHINESE_COUNTRIES.has(normalisedCountry)) return 'zh';
    
    // Any other recognised or unrecognised country (US, GB, DE, FR, VN, BR, IN, etc.)
    // Check if user's browser explicitly requested an Asian locale (KO/JA/ZH)
    const headerLang = parseAcceptLanguage(acceptLanguage);
    if (headerLang && (headerLang === 'ja' || headerLang === 'zh' || headerLang === 'ko')) {
      return headerLang;
    }
    // Otherwise, always automatically default to English
    return 'en';
  }

  // 2. Accept-Language header parsing fallback
  const headerLang = parseAcceptLanguage(acceptLanguage);
  if (headerLang) return headerLang;

  return DEFAULT_LOCALE;
}

/**
 * Browser-side locale detection from navigator.languages or navigator.language
 */
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

export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'vi';

export const DEFAULT_LOCALE: Locale = 'ko';
export const SUPPORTED_LOCALES: readonly Locale[] = ['ko', 'en', 'ja', 'zh', 'vi'] as const;
export const LOCALE_COOKIE = 'wdmv_locale';
export const DETECTED_LOCALE_COOKIE = 'wdmv_detected_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ko' || value === 'en' || value === 'ja' || value === 'zh' || value === 'vi';
}

/**
 * ISO 3166-1 alpha-2 country codes mapped to primary localized language.
 * Korean: KR (South Korea), KP (North Korea)
 * Japanese: JP (Japan)
 * Chinese (Simplified/Regional): CN (China), TW (Taiwan), HK (Hong Kong), MO (Macau), SG (Singapore)
 * Vietnamese: VN (Vietnam)
 * English (Global default): All other global countries (US, GB, CA, AU, NZ, DE, FR, TH, PH, IN, BR, RU, etc.)
 */
const KOREAN_COUNTRIES = new Set(['KR', 'KP']);
const JAPANESE_COUNTRIES = new Set(['JP']);
const CHINESE_COUNTRIES = new Set(['CN', 'TW', 'HK', 'MO', 'SG']);
const VIETNAMESE_COUNTRIES = new Set(['VN']);

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
    if (lang.startsWith('vi')) return 'vi';
    if (lang.startsWith('en')) return 'en';
  }

  // Unsupported browser languages do not override the Korean product fallback.
  return null;
}

/**
 * Precise hybrid locale detection:
 * 1. GeoIP country code (Cloudflare `cf-ipcountry` / Vercel `x-vercel-ip-country` / `x-country-code`)
 * 2. Accept-Language header quality-weighted preferences
 * 3. Korean fallback when country and browser preferences are unavailable.
 */
export function detectLocale(country: string | null | undefined, acceptLanguage: string | null | undefined): Locale {
  const normalisedCountry = country?.trim().toUpperCase();

  // 1. Explicit GeoIP country matching
  if (normalisedCountry && !['XX', 'T1', 'A1', 'A2', 'EU', 'UN'].includes(normalisedCountry)) {
    if (KOREAN_COUNTRIES.has(normalisedCountry)) return 'ko';
    if (JAPANESE_COUNTRIES.has(normalisedCountry)) return 'ja';
    if (CHINESE_COUNTRIES.has(normalisedCountry)) return 'zh';
    if (VIETNAMESE_COUNTRIES.has(normalisedCountry)) return 'vi';
    
    // Any other recognised or unrecognised country (US, GB, DE, FR, BR, IN, etc.)
    // Check if user's browser explicitly requested an Asian/localized locale (KO/JA/ZH/VI)
    const headerLang = parseAcceptLanguage(acceptLanguage);
    if (headerLang && (headerLang === 'ja' || headerLang === 'zh' || headerLang === 'ko' || headerLang === 'vi')) {
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
    if (l.startsWith('vi')) return 'vi';
    if (l.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

/**
 * A language-prefixed link is an explicit route override. Changing the user's
 * preference must navigate away from that override (rather than refreshing it).
 * The same applies to ?lang= and ?locale= after a manual or automatic choice.
 *
 * Returns null when a same-route router.refresh() is enough.
 */
export function localeNavigationTarget(
  pathname: string,
  search: string,
  nextLocale: Locale | null,
): string | null {
  const prefixMatch = pathname.match(/^\/(ko|en|ja|zh|vi)(?=\/|$)/i);
  const suffix = prefixMatch ? pathname.slice(prefixMatch[0].length) : '';
  let nextPath = pathname;

  if (prefixMatch) {
    if (nextLocale) {
      nextPath = `/${nextLocale}${suffix}`;
    } else {
      // Localized compound calculator has no unprefixed equivalent. Return to
      // the real calculator route rather than navigating the user into a 404.
      nextPath = suffix.startsWith('/tools/compound-interest-calculator')
        ? '/tools/compound-calculator'
        : (suffix || '/');
    }
  }

  const params = new URLSearchParams(search);
  const hasExplicitLanguageQuery = params.has('lang') || params.has('locale');
  if (hasExplicitLanguageQuery) {
    params.delete('lang');
    params.delete('locale');
  }
  const query = hasExplicitLanguageQuery
    ? params.toString()
    : search.replace(/^\?/, '');
  const target = nextPath + (query ? `?${query}` : '');
  return target === pathname + search ? null : target;
}

export function localeLabel(
  locale: Locale,
  korean: string,
  english: string,
  japanese?: string,
  chinese?: string,
  vietnamese?: string
): string {
  if (locale === 'ja') return japanese || english;
  if (locale === 'zh') return chinese || english;
  if (locale === 'vi') return vietnamese || english;
  if (locale === 'en') return english;
  return korean;
}

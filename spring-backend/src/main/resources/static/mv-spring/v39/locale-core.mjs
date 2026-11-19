/**
 * Moneyverse browser locale policy for Spring MVC pages.
 * Source locale contract: frontend/src/lib/locale.ts (en/ko/ja/zh/vi).
 * Manual selection is non-sensitive; never changes currency or ledger values.
 */
export const SUPPORTED_LOCALES = Object.freeze(['en','ko','ja','zh','vi']);
const SUPPORTED = new Set(SUPPORTED_LOCALES);

export function normalizeLocale(value) {
  if (typeof value !== 'string') return null;
  const primary = value.trim().toLowerCase().replaceAll('_','-').split('-')[0];
  return SUPPORTED.has(primary) ? primary : null;
}

export function detectBrowserLocale(languages) {
  if (!Array.isArray(languages)) return 'en';
  for (const value of languages) {
    const locale = normalizeLocale(value);
    if (locale) return locale;
  }
  return 'en';
}

export function resolvePreference({
  urlLanguage = null,
  isAutoUrl = false,
  savedLanguage = null,
  browserLanguages = [],
} = {}) {
  const autoLanguage = detectBrowserLocale(browserLanguages);
  if (isAutoUrl) return { locale: autoLanguage, mode: 'auto' };
  const explicit = normalizeLocale(urlLanguage);
  if (explicit) return { locale: explicit, mode: 'manual' };
  const saved = normalizeLocale(savedLanguage);
  if (saved) return { locale: saved, mode: 'manual' };
  return { locale: autoLanguage, mode: 'auto' };
}

export function buildLanguageUrl(currentUrl, locale, automatic = false) {
  const normalized = normalizeLocale(locale);
  if (!normalized) throw new TypeError('Unsupported locale');
  const url = new URL(currentUrl);
  url.searchParams.delete('lang');
  url.searchParams.delete('locale');
  url.searchParams.delete('mv_auto');
  url.searchParams.set('lang', normalized);
  if (automatic) url.searchParams.set('mv_auto', '1');
  return url.pathname + url.search + url.hash;
}

export function readCookie(cookieString, name) {
  if (typeof cookieString !== 'string') return null;
  const cookie = cookieString.split(';').map(s => s.trim())
    .find(item => item.startsWith(name + '='));
  if (!cookie) return null;
  try { return decodeURIComponent(cookie.slice(name.length + 1)); }
  catch { return null; }
}

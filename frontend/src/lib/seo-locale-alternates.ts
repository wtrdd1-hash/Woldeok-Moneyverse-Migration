/**
 * Only claim locale alternates when corresponding URLs serve localized content.
 *
 * A locale-prefixed proxy rewrite can display a Korean-only page with an
 * `<html lang="en">` attribute and Korean metadata, which is NOT a translated
 * search document. Keep this deliberately small and expand only alongside
 * reviewed locale content and reciprocal canonical tests.
 */
export interface VerifiedLocalePaths {
  readonly ko: string;
  readonly en: string;
  readonly ja: string;
  readonly zh: string;
}

const SHARED_LOCALE_PATHS = new Set(['/', '/tools', '/guide/glossary']);

export function getVerifiedLocalePaths(path: string): VerifiedLocalePaths | null {
  if (!path.startsWith('/')) return null;
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');

  // Korean calculator layout is not translated when rewritten at /en/...;
  // physical translations exist at /{locale}/tools/compound-interest-calculator.
  if (normalized === '/tools/compound-calculator') {
    return {
      ko: '/tools/compound-calculator',
      en: '/en/tools/compound-interest-calculator',
      ja: '/ja/tools/compound-interest-calculator',
      zh: '/zh/tools/compound-interest-calculator',
    };
  }

  // Global home and tools have localized metadata, while glossary has
  // dedicated localized pages with genuine translated titles and descriptions.
  if (!SHARED_LOCALE_PATHS.has(normalized)
      && !/^\/guide\/glossary\/[a-z0-9-]+$/.test(normalized)) {
    return null;
  }

  return {
    ko: normalized,
    en: `/en${normalized === '/' ? '' : normalized}`,
    ja: `/ja${normalized === '/' ? '' : normalized}`,
    zh: `/zh${normalized === '/' ? '' : normalized}`,
  };
}

/** Preserve old public aliases while sending crawlers to genuinely localized UX. */
export function getLocalizedCompoundRedirect(path: string): string | null {
  const match = /^\/(en|ja|zh)\/tools\/compound-calculator\/?$/.exec(path);
  return match ? `/${match[1]}/tools/compound-interest-calculator` : null;
}

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
  if (normalized === '/tools/compound-calculator'
      || /^\/(en|ja|zh)\/tools\/compound-interest-calculator$/.test(normalized)) {
    return {
      ko: '/tools/compound-calculator',
      en: '/en/tools/compound-interest-calculator',
      ja: '/ja/tools/compound-interest-calculator',
      zh: '/zh/tools/compound-interest-calculator',
    };
  }

  // v990: Real, authored loan calculator content exists per supported locale.
  if (normalized === '/tools/loan-interest-calculator'
      || /^\/(en|ja|zh)\/tools\/loan-interest-calculator$/.test(normalized)) {
    return {
      ko: '/tools/loan-interest-calculator',
      en: '/en/tools/loan-interest-calculator',
      ja: '/ja/tools/loan-interest-calculator',
      zh: '/zh/tools/loan-interest-calculator',
    };
  }

  // Every translated sitemap URL must refer back to the same group, including
  // itself. Physical glossary translations and localized tools/home are known.
  const translated = /^\/(en|ja|zh)(\/.*)?$/.exec(normalized);
  const basePath = translated ? (translated[2] || '/') : normalized;
  if (!SHARED_LOCALE_PATHS.has(basePath)
      && !/^\/guide\/glossary\/[a-z0-9-]+$/.test(basePath)) {
    return null;
  }

  return {
    ko: basePath,
    en: `/en${basePath === '/' ? '' : basePath}`,
    ja: `/ja${basePath === '/' ? '' : basePath}`,
    zh: `/zh${basePath === '/' ? '' : basePath}`,
  };
}

/** Preserve old public aliases while sending crawlers to genuinely localized UX. */
export function getLocalizedCompoundRedirect(path: string): string | null {
  const match = /^\/(en|ja|zh)\/tools\/compound-calculator\/?$/.exec(path);
  return match ? `/${match[1]}/tools/compound-interest-calculator` : null;
}

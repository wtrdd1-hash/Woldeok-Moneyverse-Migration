import type { Locale } from '@/lib/locale';

export interface GuestEntryPaths {
  readonly calculator: string;
  readonly glossary: string;
  readonly features: string;
}

/**
 * Only link to routes that already serve public content.
 * Foreign-language calculator URLs must use the physical translated route,
 * not a proxy rewrite of the Korean-only /tools/compound-calculator layout.
 */
export function getGuestEntryPaths(locale: Locale): GuestEntryPaths {
  return {
    calculator: locale === 'ko'
      ? '/tools/compound-calculator'
      : `/${locale}/tools/compound-interest-calculator`,
    glossary: locale === 'ko'
      ? '/guide/glossary'
      : `/${locale}/guide/glossary`,
    features: '/features',
  };
}

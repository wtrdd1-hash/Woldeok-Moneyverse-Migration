/** A bounded public language selector; never accepts arbitrary API path segments. */
export type HelpLocale = 'ko' | 'en';

export function normalizeHelpLocale(value: unknown): HelpLocale {
  return value === 'en' ? 'en' : 'ko';
}

/** Search terms stay in POST bodies; only a public locale enters the detail URL. */
export function helpArticleHref(slug: string, locale: HelpLocale): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    throw new Error('invalid help article slug');
  }
  return `/help/${encodeURIComponent(slug)}${locale === 'en' ? '?locale=en' : ''}`;
}

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

/**
 * Public evidence expires at an absolute instant, not at the end of the
 * reader's local day. A missing/invalid/expired deadline cannot be labelled
 * "verified". Explicit UTC prevents SSR/client timezone disagreement.
 */
export function helpReviewDeadline(
  value: unknown,
  locale: HelpLocale,
  nowMs: number = Date.now(),
): { dateTime: string; label: string } | null {
  if (typeof value !== 'string' || !/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value)) return null;
  const deadline = new Date(value);
  const expiresAt = deadline.getTime();
  if (!Number.isFinite(expiresAt) || !Number.isFinite(nowMs) || expiresAt <= nowMs) return null;
  return {
    dateTime: deadline.toISOString(),
    label: new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ko-KR', {
      timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(deadline) + ' UTC',
  };
}

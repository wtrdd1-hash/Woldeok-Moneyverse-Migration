import type { MetadataRoute } from 'next';

/**
 * Only the pages a signed-out visitor can actually read.
 *
 * `/board` was listed here and should never have been: it is members-only,
 * renders `noindex`, and redirects a signed-out visitor to the login screen —
 * so listing it invited crawlers to a URL that answers them with a redirect.
 */
const PUBLIC_PATHS = ['', '/announcements', '/gallery', '/status', '/shop', '/terms', '/privacy'];

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED !== 'true') return [];
  const base = (process.env.APP_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : 0.6,
  }));
}

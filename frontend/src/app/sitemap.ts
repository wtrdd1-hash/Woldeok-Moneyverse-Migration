import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Public routes indexed by search crawlers.
 */
const PUBLIC_PATHS = [
  '',
  '/guide',
  '/announcements',
  '/gallery',
  '/shop',
  '/casino',
  '/stocks',
  '/quests',
  '/businesses',
  '/board',
  '/terms',
  '/privacy',
  '/account-deletion',
  '/data-deletion',
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED === 'false') return [];
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : path === '/casino' || path === '/stocks' ? 0.9 : 0.7,
  }));
}

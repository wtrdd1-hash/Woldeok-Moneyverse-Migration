import type { MetadataRoute } from 'next';

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
  '/shop/catalog',
  '/terms',
  '/privacy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED !== 'true') return [];
  const base = (process.env.APP_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : path === '/casino' || path === '/stocks' ? 0.9 : 0.7,
  }));
}

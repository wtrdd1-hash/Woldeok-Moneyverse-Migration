import type { MetadataRoute } from 'next';
import { getPublicSitemapRoutes } from '@/config/routes.config';

/**
 * 1-Hour ISR Caching for Sitemap.
 * Prevents unnecessary re-computation and shields backend from crawler storms.
 */
export const revalidate = 3600;

/**
 * Authoritative release timestamp for static public routes.
 * Using a fixed release timestamp instead of request-time new Date() ensures
 * search engines receive honest, cacheable modification dates.
 */
const RELEASE_TIMESTAMP = new Date('2026-09-26T21:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED === 'false') return [];
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  const publicRoutes = getPublicSitemapRoutes();

  return publicRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: RELEASE_TIMESTAMP,
    changeFrequency: route.changeFrequency || 'weekly',
    priority: route.sitemapPriority || 0.7,
  }));
}

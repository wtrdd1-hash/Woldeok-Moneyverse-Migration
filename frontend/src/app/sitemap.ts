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
const RELEASE_TIMESTAMP = new Date('2026-09-26T22:00:00.000Z');

/**
 * 10 Canonical Virtual Stock Symbols for SEO Long-tail Indexing.
 */
export const STOCK_SYMBOLS = [
  'CHIPS',
  'DUCKS',
  'COIN',
  'SPACE',
  'CYBER',
  'ROBOT',
  'GOLD',
  'ENERGY',
  'BIO',
  'GAME',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED === 'false') return [];
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  const publicRoutes = getPublicSitemapRoutes();

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Public Routes & Hubs (excluding dynamic parameter templates)
  for (const route of publicRoutes) {
    if (route.path.includes('[')) continue; // Dynamic routes handled below

    const url = `${base}${route.path}`;
    entries.push({
      url,
      lastModified: RELEASE_TIMESTAMP,
      changeFrequency: route.changeFrequency || 'weekly',
      priority: route.sitemapPriority || 0.7,
      alternates: {
        languages: {
          ko: url,
          en: url,
          ja: url,
          zh: url,
        },
      },
    });
  }

  // 2. 10 Individual Virtual Stock Pages (/stocks/[symbol]) for Long-tail SEO
  for (const symbol of STOCK_SYMBOLS) {
    const url = `${base}/stocks/${symbol}`;
    entries.push({
      url,
      lastModified: RELEASE_TIMESTAMP,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          ko: url,
          en: url,
          ja: url,
          zh: url,
        },
      },
    });
  }

  return entries;
}

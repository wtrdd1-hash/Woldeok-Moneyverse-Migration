import type { MetadataRoute } from 'next';
import { getPublicSitemapRoutes } from '@/config/routes.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';

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
const RELEASE_TIMESTAMP = new Date('2026-09-27T12:00:00.000Z');

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
  const registeredUrls = new Set<string>();

  const addEntry = (
    path: string,
    priority = 0.7,
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${base}${cleanPath === '/' ? '' : cleanPath}`;
    if (registeredUrls.has(url)) return;
    registeredUrls.add(url);

    entries.push({
      url,
      lastModified: RELEASE_TIMESTAMP,
      changeFrequency: changeFrequency || 'daily',
      priority,
      alternates: {
        languages: {
          ko: url,
          en: url,
          ja: url,
          zh: url,
        },
      },
    });
  };

  // 1. Static Public Routes from SSOT
  for (const route of publicRoutes) {
    if (route.path.includes('[')) continue; // Dynamic route templates skipped
    const freq = route.changeFrequency === 'never' ? undefined : route.changeFrequency;
    addEntry(route.path, route.sitemapPriority || 0.7, freq);
  }

  // 2. 30+ Longtail Financial Calculator Presets
  for (const preset of ALL_SEO_PRESETS) {
    if (preset.category === 'compound') {
      addEntry(`/tools/compound-calculator/${preset.slug}`, 0.9, 'daily');
    } else if (preset.category === 'stock') {
      addEntry(`/tools/stock-calculator/${preset.slug}`, 0.9, 'daily');
    } else if (preset.category === 'farming') {
      addEntry(`/tools/farming-calculator/${preset.slug}`, 0.85, 'daily');
    }
  }

  // 3. 10 Virtual Stocks & Deep Sub-pages (Main, History, Alerts)
  for (const symbol of STOCK_SYMBOLS) {
    addEntry(`/stocks/${symbol}`, 0.9, 'daily');
    addEntry(`/stocks/${symbol}?tab=orderbook`, 0.85, 'daily');
    addEntry(`/stocks/${symbol}?tab=discussions`, 0.85, 'daily');
  }

  return entries;
}

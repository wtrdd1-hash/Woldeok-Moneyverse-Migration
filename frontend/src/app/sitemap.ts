import type { MetadataRoute } from 'next';
import { getPublicSitemapRoutes } from '@/config/routes.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';

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
const RELEASE_TIMESTAMP = new Date('2026-09-29T00:00:00.000Z');

/**
 * 10 Canonical Virtual Stock Symbols for SEO Long-tail Indexing.
 */
export const STOCK_SYMBOLS = [
  'WDG',
  'CHIMU314',
  'WDM',
  'WDB',
  'WDT',
  'MYUY',
  'CHIPS',
  'DUCK',
  'WFIN',
  'SPACE',
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
    const canonicalUrl = `${base}${cleanPath === '/' ? '' : cleanPath}`;
    const enUrl = `${base}/en${cleanPath === '/' ? '' : cleanPath}`;
    const jaUrl = `${base}/ja${cleanPath === '/' ? '' : cleanPath}`;
    const zhUrl = `${base}/zh${cleanPath === '/' ? '' : cleanPath}`;
    const koUrl = `${base}${cleanPath === '/' ? '' : cleanPath}`;

    entries.push({
      url: canonicalUrl,
      lastModified: RELEASE_TIMESTAMP,
      changeFrequency: changeFrequency || 'daily',
      priority,
      alternates: {
        languages: {
          ko: koUrl,
          'ko-KR': koUrl,
          en: enUrl,
          'en-US': enUrl,
          ja: jaUrl,
          'ja-JP': jaUrl,
          zh: zhUrl,
          'zh-CN': zhUrl,
          'x-default': canonicalUrl,
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

  // 2.5. 200+ pSEO Popular Stock Calculator Presets (삼성전자, 테슬라, 엔비디아 등)
  for (const slug of ALL_PSEO_POPULAR_SLUGS) {
    addEntry(`/tools/stock-calculator/${slug}`, 0.85, 'daily');
  }

  // 3. 10 Virtual Stocks Clean Canonical URLs
  for (const symbol of STOCK_SYMBOLS) {
    addEntry(`/stocks/${symbol}`, 0.9, 'daily');
  }

  return entries;
}

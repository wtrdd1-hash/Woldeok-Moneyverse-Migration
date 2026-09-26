import type { MetadataRoute } from 'next';
import { getDisallowedCrawlerRoutes } from '@/config/routes.config';

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  const enabled = process.env.SEO_INDEXING_ENABLED !== 'false';
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');

  if (!enabled) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Strictly disallow all member-only screens and internal API/auth routes from SSOT
      disallow: getDisallowedCrawlerRoutes(),
    },
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-index.xml`,
    ],
    host: base,
  };
}

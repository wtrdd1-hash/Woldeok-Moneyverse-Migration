import type { MetadataRoute } from 'next';
import { getDisallowedCrawlerRoutes } from '@/config/routes.config';

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  const enabled = process.env.SEO_INDEXING_ENABLED !== 'false';
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');

  if (!enabled) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  const disallowedRoutes = getDisallowedCrawlerRoutes();
  const disallowList = Array.from(new Set(disallowedRoutes));

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallowList,
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}


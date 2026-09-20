import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      // Only purely private member screens, admin console, and internal APIs are kept off search engines
      disallow: [
        '/admin',
        '/account',
        '/wallet',
        '/status',
        '/gallery/submit',
        '/login',
        '/api/',
        '/auth/',
      ],
    },
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-index.xml`,
      `${base}/sitemap-announcements.xml`,
      `${base}/sitemap-board.xml`,
      `${base}/sitemap-stocks.xml`,
    ],
    host: base,
  };
}


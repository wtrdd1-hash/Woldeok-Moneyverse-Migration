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

  const publicAllow = [
    '/',
    '/tools',
    '/tools/*',
    '/calculators',
    '/calculators/*',
    '/stocks',
    '/stocks/*',
    '/bonds',
    '/kdic',
    '/blog',
    '/blog/*',
    '/guide',
    '/guide/*',
    '/announcements',
    '/roadmap',
    '/account-deletion',
    '/businesses/ventures',
    '/llms.txt',
    '/feed.xml',
    '/rss.xml',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllow,
        disallow: disallowList,
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Applebot-Extended',
          'Google-Extended',
          'Yeti',
          'Bingbot',
        ],
        allow: publicAllow,
        disallow: disallowList,
      },
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-index.xml`,
      `${base}/sitemap-blog.xml`,
      `${base}/feed.xml`,
    ],
    host: base,
  };
}

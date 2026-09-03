import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const enabled = process.env.SEO_INDEXING_ENABLED === 'true';
  const base = process.env.APP_BASE_URL ?? 'http://127.0.0.1:3000';

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
        '/gallery/submit',
        '/login',
        '/api/',
        '/auth/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

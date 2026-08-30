import type { MetadataRoute } from 'next';

/**
 * Indexing stays opt-in, exactly as the original had it: a test URL or a
 * newly connected domain must not become searchable before its canonical host
 * is reviewed. With the flag unset this disallows everything.
 */
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
      // Everything behind a session, and the API itself. None of it is useful
      // to a crawler and some of it is per-member.
      disallow: [
        '/admin',
        '/account',
        '/wallet',
        '/stocks',
        '/businesses',
        '/seasons',
        '/casino',
        '/progression',
        '/board',
        '/profile',
        '/login',
        '/api/',
        '/auth/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

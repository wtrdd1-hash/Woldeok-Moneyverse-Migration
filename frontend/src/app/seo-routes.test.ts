import { afterEach, describe, expect, it } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

const ORIGINAL_INDEXING = process.env.SEO_INDEXING_ENABLED;
const ORIGINAL_BASE = process.env.APP_BASE_URL;

afterEach(() => {
  if (ORIGINAL_INDEXING === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = ORIGINAL_INDEXING;
  if (ORIGINAL_BASE === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = ORIGINAL_BASE;
});

describe('search crawler routes', () => {
  it('blocks every crawler in non-production builds', () => {
    process.env.SEO_INDEXING_ENABLED = 'false';
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
    expect(sitemap()).toEqual([]);
  });

  it('publishes the canonical production sitemap and keeps private areas out', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';

    const robotRules = robots();
    expect(robotRules.sitemap).toBe('https://easy-scraping.com/sitemap.xml');
    expect(robotRules.rules).toEqual(
      expect.objectContaining({
        userAgent: '*',
        allow: '/',
        disallow: expect.arrayContaining(['/admin', '/account', '/wallet', '/api/', '/auth/']),
      }),
    );

    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain('https://easy-scraping.com');
    expect(urls).toContain('https://easy-scraping.com/board');
    expect(urls).not.toContain('https://easy-scraping.com/admin');
    expect(urls).not.toContain('https://easy-scraping.com/wallet');
  });
});

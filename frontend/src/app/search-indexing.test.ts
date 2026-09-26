import { afterEach, describe, expect, it } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

const originalBase = process.env.APP_BASE_URL;
const originalIndexing = process.env.SEO_INDEXING_ENABLED;

afterEach(() => {
  if (originalBase === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBase;
  if (originalIndexing === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = originalIndexing;
});

describe('public search surface', () => {
  it('lists only durable public pages in the production sitemap', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';

    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    // Verified public indexable pages from SSOT routes.config.ts
    expect(urls).toEqual([
      'https://easy-scraping.com',
      'https://easy-scraping.com/guide',
      'https://easy-scraping.com/guide/dopamine-system',
      'https://easy-scraping.com/guide/stock-trading',
      'https://easy-scraping.com/guide/virtual-banking',
      'https://easy-scraping.com/guide/career-mastery',
      'https://easy-scraping.com/guide/glossary',
      'https://easy-scraping.com/announcements',
      'https://easy-scraping.com/gallery',
      'https://easy-scraping.com/shop',
      'https://easy-scraping.com/board',
      'https://easy-scraping.com/terms',
      'https://easy-scraping.com/privacy',
      'https://easy-scraping.com/account-deletion',
      'https://easy-scraping.com/data-deletion',
      'https://easy-scraping.com/stocks',
      'https://easy-scraping.com/prediction',
      'https://easy-scraping.com/marketplace/auction',
      // 10 Individual Virtual Stock Pages
      'https://easy-scraping.com/stocks/CHIPS',
      'https://easy-scraping.com/stocks/DUCKS',
      'https://easy-scraping.com/stocks/COIN',
      'https://easy-scraping.com/stocks/SPACE',
      'https://easy-scraping.com/stocks/CYBER',
      'https://easy-scraping.com/stocks/ROBOT',
      'https://easy-scraping.com/stocks/GOLD',
      'https://easy-scraping.com/stocks/ENERGY',
      'https://easy-scraping.com/stocks/BIO',
      'https://easy-scraping.com/stocks/GAME',
    ]);

    // Check multilingual alternates (hreflang)
    for (const entry of entries) {
      expect(entry.alternates?.languages).toBeDefined();
      expect(entry.alternates?.languages?.ko).toBe(entry.url);
      expect(entry.alternates?.languages?.en).toBe(entry.url);
      expect(entry.alternates?.languages?.ja).toBe(entry.url);
      expect(entry.alternates?.languages?.zh).toBe(entry.url);
    }

    // Member-only and private pages must never appear in sitemap
    expect(urls).not.toContain('https://easy-scraping.com/casino');
    expect(urls).not.toContain('https://easy-scraping.com/quests');
    expect(urls).not.toContain('https://easy-scraping.com/businesses');
    expect(urls).not.toContain('https://easy-scraping.com/shop/catalog');
    expect(urls).not.toContain('https://easy-scraping.com/wallet');
    expect(urls).not.toContain('https://easy-scraping.com/bank');
    expect(urls).not.toContain('https://easy-scraping.com/admin');
  });

  it('keeps service monitoring out of crawler paths', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const rules = robots().rules;

    if (Array.isArray(rules)) throw new Error('expected one crawler rule');
    expect(rules.disallow).toContain('/status');
  });

  it('exposes canonical sitemap to search crawlers in robots.txt', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';
    const sitemapUrl = robots().sitemap;

    expect(sitemapUrl).toBe('https://easy-scraping.com/sitemap.xml');
  });
});

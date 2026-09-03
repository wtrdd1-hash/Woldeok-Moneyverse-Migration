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

    expect(sitemap().map((entry) => entry.url)).toEqual([
      'https://easy-scraping.com',
      'https://easy-scraping.com/guide',
      'https://easy-scraping.com/announcements',
      'https://easy-scraping.com/gallery',
      'https://easy-scraping.com/shop',
      'https://easy-scraping.com/casino',
      'https://easy-scraping.com/stocks',
      'https://easy-scraping.com/quests',
      'https://easy-scraping.com/businesses',
      'https://easy-scraping.com/board',
      'https://easy-scraping.com/shop/catalog',
      'https://easy-scraping.com/terms',
      'https://easy-scraping.com/privacy',
    ]);
  });

  it('keeps service monitoring out of crawler paths', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const rules = robots().rules;

    if (Array.isArray(rules)) throw new Error('expected one crawler rule');
    expect(rules.disallow).toContain('/status');
  });
});
